const request = require('supertest');

process.env.JWT_ACCESS_SECRET = 'test_secret';

jest.mock('../src/lib/prisma', () => {
  return {
    prisma: {
      $transaction: jest.fn()
    }
  };
});

const { prisma } = require('../src/lib/prisma');
const { signAccessToken } = require('../src/lib/jwt');
const { createApp } = require('../src/app');

describe('checkout route', () => {
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

  test('POST /api/checkout creates order', async () => {
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cart-1',
          items: [
            {
              id: 'item-1',
              productId: 'prod-1',
              qty: 2,
              priceSnapshot: 100,
              product: { id: 'prod-1', title: 'Adapter', stock: 5 }
            }
          ]
        })
      },
      order: {
        create: jest.fn().mockResolvedValue({ id: 'order-1', items: [] })
      },
      product: {
        update: jest.fn().mockResolvedValue({})
      },
      cartItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 })
      }
    };

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: {
          fullName: 'Test User',
          phone: '1234567890',
          line1: '123 Street',
          city: 'Mumbai',
          state: 'MH',
          postalCode: '400001',
          country: 'IN'
        },
        shippingFee: 0
      });

    expect(res.status).toBe(201);
    expect(res.body.order.id).toBe('order-1');
    expect(tx.order.create).toHaveBeenCalled();
    expect(tx.product.update).toHaveBeenCalled();
  });

  test('POST /api/checkout returns 400 for empty cart', async () => {
    const tx = {
      cart: {
        findUnique: jest.fn().mockResolvedValue({ id: 'cart-1', items: [] })
      }
    };

    prisma.$transaction.mockImplementation(async (callback) => callback(tx));

    const res = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: {
          fullName: 'Test User',
          phone: '1234567890',
          line1: '123 Street',
          city: 'Mumbai',
          state: 'MH',
          postalCode: '400001',
          country: 'IN'
        }
      });

    expect(res.status).toBe(400);
  });
});
