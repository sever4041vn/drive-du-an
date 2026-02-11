const { DataTypes } = require('sequelize');
const sequelize = require('./database');

// 1. Model Người dùng
const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }
});

// 2. Model Thư mục (Có quan hệ cha-con lồng nhau)
const Folder = sequelize.define('Folder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
});

// Thiết lập quan hệ Folder lồng nhau (Self-referencing)
Folder.belongsTo(Folder, { as: 'Parent', foreignKey: 'parentId' });
Folder.hasMany(Folder, { as: 'SubFolders', foreignKey: 'parentId' });

// 3. Model Tệp tin
const File = sequelize.define('File', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },         // Tên hiển thị
    physicalName: { type: DataTypes.STRING, allowNull: false }, // Tên UUID trên ổ cứng
    mimeType: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    isDeleted: {type: DataTypes.BOOLEAN,defaultValue: false},
    shareToken: {type: DataTypes.STRING,allowNull: true}
});

// Thiết lập quan hệ sở hữu
User.hasMany(File, { foreignKey: 'ownerId' });
File.belongsTo(User, { foreignKey: 'ownerId' });

User.hasMany(Folder, { foreignKey: 'ownerId' });
Folder.belongsTo(User, { foreignKey: 'ownerId' });

Folder.hasMany(File, { foreignKey: 'folderId' });
File.belongsTo(Folder, { foreignKey: 'folderId' });

module.exports = { User, Folder, File, sequelize };