const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Cần đăng nhập' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Chứa userId
    next();
  } catch {
    res.status(401).json({ message: 'Token hết hạn' });
  }
};