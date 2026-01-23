const express = require('express');
const { z } = require('zod');

const { validateRequest } = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/requireAuth');
const {
  authenticateWithGoogle,
  rotateRefreshToken,
  revokeRefreshToken
} = require('../services/authService');

const router = express.Router();

const googleSchema = {
  body: z.object({
    idToken: z.string().min(1)
  })
};

const cookieName = process.env.REFRESH_COOKIE_NAME || 'refreshToken';

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

router.post('/auth/google', validateRequest(googleSchema), async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authenticateWithGoogle(req.body.idToken);
    res.cookie(cookieName, refreshToken, getCookieOptions());
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { user, accessToken, refreshToken } = await rotateRefreshToken(token);
    res.cookie(cookieName, refreshToken, getCookieOptions());
    res.json({ accessToken, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[cookieName];
    if (token) {
      await revokeRefreshToken(token);
    }
    res.clearCookie(cookieName, { path: '/api/auth' });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

router.get('/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { authRouter: router };
