const request = require('supertest');

process.env.JWT_ACCESS_SECRET = 'test_secret';

jest.mock('../src/lib/prisma', () => {
  return {
    prisma: {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      adminAuditLog: {
        create: jest.fn(),
      },
    },
  };
});

const { prisma } = require('../src/lib/prisma');
const { signAccessToken } = require('../src/lib/jwt');
const { createApp } = require('../src/app');

describe('admin users routes', () => {
  const app = createApp();
  const adminToken = signAccessToken({
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'ADMIN',
  });

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.SUPER_ADMIN_EMAIL_ALLOWLIST = '';
  });

  test('GET /api/admin/users returns list', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'user-1', email: 'u@example.com' }]);
    prisma.user.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  test('PUT /api/admin/users/:id/role updates role and logs audit', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: 'USER' });
    prisma.user.update.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });

    const res = await request(app)
      .put('/api/admin/users/user-1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(200);
    expect(prisma.adminAuditLog.create).toHaveBeenCalled();
  });

  test('PUT /api/admin/users/:id/role blocks non-super-admin', async () => {
    process.env.SUPER_ADMIN_EMAIL_ALLOWLIST = 'boss@example.com';

    const res = await request(app)
      .put('/api/admin/users/user-1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(403);
  });
});
