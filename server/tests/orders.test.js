const request = require('supertest');

process.env.JWT_ACCESS_SECRET = 'test_secret';

jest.mock('../src/lib/prisma', () => {
  return {
    prisma: {
      order: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn()
      }
    }
  };
});

const { prisma } = require('../src/lib/prisma');
const { signAccessToken } = require('../src/lib/jwt');
const { createApp } = require('../src/app');

describe('orders routes', () => {
  const app = createApp();
  const token = signAccessToken({
    id: 'user-1',
    email: 'user@example.com',
    name: 'User',
    role: 'USER'
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('GET /api/orders returns list', async () => {
    prisma.order.findMany.mockResolvedValue([{ id: 'order-1', userId: 'user-1' }]);
    prisma.order.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
  });

  test('GET /api/orders/:id returns order', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'order-1', userId: 'user-1' });

    const res = await request(app)
      .get('/api/orders/order-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.order.id).toBe('order-1');
  });
});
