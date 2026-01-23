const request = require('supertest');

process.env.JWT_ACCESS_SECRET = 'test_secret';

jest.mock('../src/lib/prisma', () => {
  return {
    prisma: {
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn()
      },
      adminAuditLog: {
        create: jest.fn()
      }
    }
  };
});

const { prisma } = require('../src/lib/prisma');
const { signAccessToken } = require('../src/lib/jwt');
const { createApp } = require('../src/app');

describe('admin orders routes', () => {
  const app = createApp();
  const adminToken = signAccessToken({
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'ADMIN'
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('GET /api/admin/orders returns list', async () => {
    prisma.order.findMany.mockResolvedValue([{ id: 'order-1' }]);
    prisma.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  test('PUT /api/admin/orders/:id/status updates status and logs audit', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PENDING' });
    prisma.order.update.mockResolvedValue({ id: 'order-1', status: 'CONFIRMED' });

    const res = await request(app)
      .put('/api/admin/orders/order-1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(prisma.adminAuditLog.create).toHaveBeenCalled();
  });
});
