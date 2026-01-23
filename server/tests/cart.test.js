const request = require('supertest');

process.env.JWT_ACCESS_SECRET = 'test_secret';

jest.mock('../src/lib/prisma', () => {
  return {
    prisma: {
      cart: {
        upsert: jest.fn()
      },
      cartItem: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn()
      },
      product: {
        findUnique: jest.fn()
      }
    }
  };
});

const { prisma } = require('../src/lib/prisma');
const { signAccessToken } = require('../src/lib/jwt');
const { createApp } = require('../src/app');

describe('cart routes', () => {
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

  test('GET /api/cart returns cart', async () => {
    prisma.cart.upsert.mockResolvedValue({ id: 'cart-1', userId: 'user-1', items: [] });

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.cart.id).toBe('cart-1');
  });

  test('POST /api/cart/items adds item', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'prod-1',
      status: 'ACTIVE',
      price: 100,
      salePrice: null,
      stock: 5
    });
    prisma.cart.upsert.mockResolvedValue({ id: 'cart-1', userId: 'user-1' });
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 'item-1' });
    prisma.cart.upsert.mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1' });
    prisma.cart.upsert.mockResolvedValueOnce({ id: 'cart-1', userId: 'user-1', items: [] });

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'prod-1', qty: 1 });

    expect(res.status).toBe(201);
    expect(prisma.cartItem.create).toHaveBeenCalled();
  });
});
