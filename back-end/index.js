require("dotenv").config();
const { sequelize, File , Folder} = require('./models');
const auth = require("./middleware/auth");
const express = require("express");
const multer = require("multer");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const { register, login } = require("./middleware/authController");

const app = express();
const PORT = process.env.PORT ;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: ['http://127.0.0.1:5173','192.168.0.7:5173'], // Allow only requests from this origin
};

app.use(cors(corsOptions));

const authenticate = (req, res, next) => {
    // Giả sử sau khi giải mã Token, ta có:
    req.user = { id: 'id-cua-user-dang-nhap' }; 
    next();
};
// Cau hinh dia chi luu
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        const uploadPath = 'uploads/';
        // kiem tra thu muc co ton tai hay chua
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Đổi tên file thành UUID + đuôi mở rộng gốc
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 * 1024 } // Giới hạn 5GB
});

// // Tai file
// app.post('/upload', upload.single('myFile'), (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).send('Không có file nào được tải lên.');
//         }

//         // Dữ liệu này bạn sẽ dùng để lưu vào Database (Giai đoạn 1)
//         const fileMetadata = {
//             originalName: req.file.originalname, // Tên gốc: "anh_dep.jpg"
//             physicalPath: req.file.path,         // Đường dẫn thực: "uploads/uuid.jpg"
//             mimeType: req.file.mimetype,         // Loại file: "image/jpeg"
//             size: req.file.size,                 // Kích thước (bytes)
//             uploadedAt: new Date()
//         };

//         console.log('Đã lưu file thành công:', fileMetadata);

//         // Giả lập lưu vào Database thành công và trả về cho Client
//         res.status(200).json({
//             message: "Upload thành công!",
//             data: fileMetadata
//         });
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });
// Đồng bộ Database (Tạo bảng nếu chưa có)
sequelize.sync({ alter: true }).then(() => {
    console.log("✅ Database & Tables created!");
});

// luu vao database
app.post('/upload', auth, upload.single('myFile'), async (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');
    
    
    
    try {
        const savedFilePath = req.file.path;
        // Giả sử lấy từ Auth
        const ownerId = req.user.userId; 
    
    const LIMIT_PER_USER = process.env.STORAGE * 1024 * 1024 * 1024;

        // 1. Tính tổng dung lượng các file hiện có của User này
        const totalUsed = await File.sum('size', { 
            where: { ownerId: ownerId, isDeleted: false } 
        }) || 0;

        // 2. Kiểm tra xem file mới có làm vượt hạn mức không
        if (totalUsed + req.file.size > LIMIT_PER_USER) {
            // XÓA FILE VẬT LÝ: Vì Multer đã lỡ lưu file vào thư mục 'uploads' rồi
            fs.unlinkSync(req.file.path); 
            
            return res.status(403).json({ 
                error: "Dung lượng bộ nhớ đã hết! Vui lòng nâng cấp hoặc xóa bớt file." 
            });
        }


        // Lưu vào Database bằng Sequelize
        const newFile = await File.create({
            name: req.file.originalname,
            physicalName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            ownerId: ownerId,
            folderId: req.body.folderId || null
        });

        res.status(200).json(newFile);
    } catch (error) {
        console.error(error);
        if (fs.existsSync(savedFilePath)) {
            fs.unlinkSync(savedFilePath);
        }
        res.status(500).send("Lỗi Database");
        
    }
});

// Tao folders
app.post('/folders', auth, async (req, res) => {
    const ownerId = req.user.userId; 
    try {
        const { name, parentId } = req.body;

        const newFolder = await Folder.create({
            name: name,
            parentId: parentId || null, // Nếu không có parentId thì là thư mục gốc
            ownerId: ownerId // Tạm thời bạn truyền từ body, sau này sẽ lấy từ Token
        });

        res.status(201).json(newFolder);
    } catch (error) {
        res.status(500).json({ error: "Không thể tạo thư mục" });
    }
});

// Lay danh sach file va folders
app.get('/list/', auth, async (req, res) => {
    try {
        // Nếu không có folderId trên URL, mặc định là null (thư mục gốc)
        const folderId = null;
        const ownerId = req.user.userId; 

        // Lấy tất cả thư mục con
        const folders = await Folder.findAll({
            where: { 
                parentId: folderId,
                ownerId: ownerId,
            }
        });

        // Lấy tất cả file trong thư mục này
        const files = await File.findAll({
            where: { 
                folderId: folderId,
                ownerId: ownerId ,
                isDeleted: false
            }
        });

        res.json({
            currentFolderId: folderId,
            folders: folders,
            files: files
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách" });
    }
});

app.get('/list/:folderId', auth, async (req, res) => {
    try {
        const folderId = req.params.folderId;
        const ownerId = req.user.userId;

        // Lấy tất cả thư mục con
        const folders = await Folder.findAll({
            where: { 
                parentId: folderId,
                ownerId: ownerId
            }
        });

        // Lấy tất cả file trong thư mục này
        const files = await File.findAll({
            where: { 
                folderId: folderId,
                ownerId: ownerId ,
                isDeleted: false
            }
        });

        res.json({
            currentFolderId: folderId,
            folders: folders,
            files: files
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi lấy danh sách" });
    }
});
// Tai file 
app.get('/download/:id', auth, async (req, res) => {
    try {
        const file = await File.findOne({
            where: { 
                id: req.params.id, 
                ownerId: req.user.userId // Chỉ tìm file nếu nó thuộc về user này
            }
        });

        if (!file) {
            return res.status(403).json({ error: "Bạn không có quyền truy cập file này!" });
        }
        // Đường dẫn vật lý thực tế trên server
        const filePath = path.join(__dirname, process.env.UPLOAD_DIR, fileRecord.physicalName);
        // Kiểm tra xem file có thực sự tồn tại trên ổ cứng không
        if (fs.existsSync(filePath)) {
            // Gửi file về với tên gốc ban đầu (originalName)
            res.download(filePath, fileRecord.name);
        } else {
            res.status(404).send("File vật lý đã bị xóa hoặc mất");
        }
    } catch (error) {
        res.status(500).json({ error: "Lỗi tải file" });
    }
});
//xoa file
app.delete('/delete-file/:id', async (req, res) => {
    try {
        // 1. Tìm thông tin file trong Database trước khi xóa
        const fileRecord = await File.findByPk(req.params.id);

        if (!fileRecord) {
            return res.status(404).json({ message: "Không tìm thấy file" });
        }

        // 2. Xác định đường dẫn file trên ổ cứng
        const filePath = path.join(__dirname, process.env.UPLOAD_DIR, fileRecord.physicalName);

        // 3. Xóa file vật lý trên ổ cứng
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
        }

        // 4. Xóa bản ghi trong Database
        await fileRecord.destroy();

        res.json({ message: "Đã xóa file vĩnh viễn khỏi hệ thống!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi khi xử lý xóa file" });
    }
});

// Lay du lieu du luong
app.get('/storage-stats/', auth, async (req, res) => {
  try {
    const ownerId = req.user.userId;
    
    // Giả sử bạn dùng Sequelize hoặc SQL thuần để tính tổng cột 'size'
    const totalSize = await File.sum('size', { where: { ownerId } }) || 0;

    const LIMIT = process.env.STORAGE * 1024 * 1024 * 1024; // 5GB tính bằng bytes

    res.json({
      used: totalSize,      // byte
      limit: LIMIT,         // byte
      percentage: ((totalSize / LIMIT) * 100).toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: "Không thể tính dung lượng" });
  }
});

//share file
app.post('/files/share/:id', auth, async (req, res) => {
  const token = crypto.randomBytes(16).toString('hex');
  await File.update({ shareToken: token }, { where: { id: req.params.id } });
  res.json({ link: `http://localhost:5173/share/${token}` });
});

//dang ky
app.post('/register', register);
//dang nhap
app.post('/login', login);

app.listen(PORT, ()=>{
    console.log(`Server is running : http://127.0.0.1:${PORT}`);
})
