const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User} = require('../models');

const SECRET_KEY = process.env.SECRET_KEY;

// --- ĐĂNG KÝ ---
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu vào Database bằng Sequelize
    const newUser = await User.create({
      email: email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Đăng ký thành công", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống khi đăng ký" });
  }
};

// --- ĐĂNG NHẬP ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user bằng email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email không tồn tại" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mật khẩu không chính xác" });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống khi đăng nhập" });
  }
};

module.exports = { register, login };