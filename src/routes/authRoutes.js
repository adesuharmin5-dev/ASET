const express = require('express');
const router = express.Router();
const { db, verifyPassword, hashPassword } = require('../db');
const { createToken, createSsoToken, verifyToken, authMiddleware } = require('../auth');

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

// SSO: Verify SSO Token and exchange for session token (Public)
router.all('/sso/verify', (req, res) => {
  const token = req.query.token || req.body?.token;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token SSO wajib disertakan.' });
  }

  const payload = verifyToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({
      success: false,
      message: 'Link SSO tidak valid atau sudah kedaluwarsa. Silakan hubungi administrator atau login secara manual.'
    });
  }

  const user = db.prepare('SELECT id, username, name, role FROM users WHERE id = ?').get(payload.sub);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Pengguna yang terkait dengan token SSO ini tidak ditemukan.' });
  }

  const sessionToken = createToken(user);
  return res.json({
    success: true,
    message: `Autentikasi SSO berhasil untuk ${user.name}.`,
    token: sessionToken,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// SSO: Generate Single Sign-On Link (Admin only)
router.post('/sso/generate', authMiddleware, (req, res) => {
  try {
    const days = parseInt(req.body.days, 10) || 30;
    const targetUserId = req.body.user_id || req.user.id;

    const targetUser = db.prepare('SELECT id, username, name, role FROM users WHERE id = ?').get(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const { sso_token, expires_at } = createSsoToken(targetUser, days);
    return res.json({
      success: true,
      message: 'Link SSO berhasil dibuat.',
      sso_token,
      expires_at,
      days,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.name,
        role: targetUser.role
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Gagal membuat token SSO: ' + err.message });
  }
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
