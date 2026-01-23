const request = require('supertest');

const { createApp } = require('../src/app');
const authService = require('../src/services/authService');

jest.mock('../src/services/authService');

describe('auth routes', () => {
  const app = createApp();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('POST /api/auth/google sets refresh cookie and returns access token', async () => {
    authService.authenticateWithGoogle.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'USER' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'google-id-token' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('access-token');
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=refresh-token');
  });

  test('POST /api/auth/refresh rotates refresh token', async () => {
    authService.rotateRefreshToken.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com', name: 'User', role: 'USER' },
      accessToken: 'new-access',
      refreshToken: 'new-refresh'
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=old-refresh']);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe('new-access');
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=new-refresh');
  });

  test('POST /api/auth/logout clears refresh cookie', async () => {
    authService.revokeRefreshToken.mockResolvedValue();

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', ['refreshToken=old-refresh']);

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=');
  });
});
