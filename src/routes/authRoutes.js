const express = require('express');
const router = express.Router();
const { db, verifyPassword, hashPassword } = require('../db');
const { createToken, authMiddleware } = require('../auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username.trim());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Username atau password tidak cocok.' });
  }

  const isValid = verifyPassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Username atau password tidak cocok.' });
  }

  const token = createToken(user);
  return res.json({
    success: true,
    message: 'Login berhasil.',
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Password saat ini dan password baru wajib diisi.' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(current_password, user.password_hash)) {
    return res.status(400).json({ success: false, message: 'Password saat ini keliru.' });
  }

  const newHash = hashPassword(new_password);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, req.user.id);

  res.json({ success: true, message: 'Password berhasil diperbarui.' });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logout berhasil.' });
});

module.exports = router;
