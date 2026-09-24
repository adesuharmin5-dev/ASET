const crypto = require('node:crypto');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'assetcare-secret-key-production-2026';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

function createToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (8 * 3600) // 8 hours
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}

function createSsoToken(user, days = 30) {
  const header = { alg: 'HS256', typ: 'SSO' };
  const expiresInSeconds = Math.max(1, parseInt(days, 10) || 30) * 24 * 3600;
  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    is_sso: true,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return {
    sso_token: `${encodedHeader}.${encodedPayload}.${signature}`,
    expires_at: new Date(Date.now() + (expiresInSeconds * 1000)).toISOString()
  };
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  let user = null;
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.sub) {
      user = db.prepare('SELECT id, username, name, role FROM users WHERE id = ?').get(payload.sub);
    }
  }

  // Strict enforcement: unauthorized requests must return 401 to redirect to login
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Autentikasi diperlukan. Silakan login terlebih dahulu.'
    });
  }

  req.user = user;
  next();
}

module.exports = {
  createToken,
  createSsoToken,
  verifyToken,
  authMiddleware
};
