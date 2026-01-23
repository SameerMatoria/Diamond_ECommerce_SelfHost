const request = require('supertest');

const { createApp } = require('../src/app');

jest.mock('../src/lib/prisma', () => {
  return {
    prisma: {
      product: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn()
      },
      category: {
        findMany: jest.fn()
      }
    }
  };
});

const { prisma } = require('../src/lib/prisma');

describe('products routes', () => {
  const app = createApp();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('GET /api/products returns list', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 'prod-1', title: 'Resistor' }]);
    prisma.product.count.mockResolvedValue(1);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
  });

  test('GET /api/products/:slug returns product', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'prod-1', slug: 'resistor', status: 'ACTIVE' });

    const res = await request(app).get('/api/products/resistor');

    expect(res.status).toBe(200);
    expect(res.body.product.slug).toBe('resistor');
  });

  test('GET /api/products/:slug returns 404 for inactive', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'prod-2', slug: 'draft', status: 'DRAFT' });

    const res = await request(app).get('/api/products/draft');

    expect(res.status).toBe(404);
  });
});
