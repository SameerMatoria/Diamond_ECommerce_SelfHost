const { OAuth2Client } = require('google-auth-library');

const { prisma } = require('../lib/prisma');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../lib/jwt');

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const oauthClient = new OAuth2Client(googleClientId);

function parseAllowlist() {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowlisted(email) {
  const allowlist = parseAllowlist();
  return allowlist.includes(email.toLowerCase());
}

async function verifyGoogleIdToken(idToken) {
  if (!googleClientId) {
    const error = new Error('Google client ID not configured');
    error.status = 500;
    throw error;
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken,
    audience: googleClientId
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    const error = new Error('Invalid Google token');
    error.status = 401;
    throw error;
  }

  return {
    email: payload.email,
    name: payload.name || payload.email,
    googleId: payload.sub,
    emailVerified: payload.email_verified
  };
}

async function upsertUserFromGoogle(profile) {
  const { email, name, googleId } = profile;

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email }]
    }
  });

  const role = isAllowlisted(email) ? 'ADMIN' : user?.role || 'USER';

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleId,
        role
      }
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        name,
        googleId: user.googleId || googleId,
        role
      }
    });
  }

  return user;
}

async function issueTokensForUser(user) {
  const accessToken = signAccessToken(user);
  const refreshPayload = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      jti: refreshPayload.jti
    }
  });

  return {
    accessToken,
    refreshToken: refreshPayload.token,
    refreshJti: refreshPayload.jti
  };
}

async function authenticateWithGoogle(idToken) {
  const profile = await verifyGoogleIdToken(idToken);
  if (!profile.emailVerified) {
    const error = new Error('Google account email not verified');
    error.status = 401;
    throw error;
  }

  const user = await upsertUserFromGoogle(profile);
  const tokens = await issueTokensForUser(user);

  return { user, ...tokens };
}

async function rotateRefreshToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const existing = await prisma.refreshToken.findUnique({
    where: { jti: payload.jti }
  });

  if (!existing || existing.revokedAt) {
    const err = new Error('Refresh token revoked');
    err.status = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  if (!user) {
    const err = new Error('User not found');
    err.status = 401;
    throw err;
  }

  const newTokens = await issueTokensForUser(user);

  await prisma.refreshToken.update({
    where: { jti: payload.jti },
    data: {
      revokedAt: new Date(),
      replacedByToken: newTokens.refreshJti
    }
  });

  return { user, ...newTokens };
}

async function revokeRefreshToken(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      jti: payload.jti,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

module.exports = {
  authenticateWithGoogle,
  rotateRefreshToken,
  revokeRefreshToken
};
