const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const accessTtl = process.env.JWT_ACCESS_TTL || '15m';
const refreshTtl = process.env.JWT_REFRESH_TTL || '7d';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    accessSecret,
    { expiresIn: accessTtl }
  );
}

function signRefreshToken(user) {
  const jti = randomUUID();
  const token = jwt.sign({ sub: user.id, jti }, refreshSecret, { expiresIn: refreshTtl });
  return { token, jti };
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
