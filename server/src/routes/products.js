const express = require('express');
const { z } = require('zod');

const { prisma } = require('../lib/prisma');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

const listSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional()
  })
};

router.get('/products', validateRequest(listSchema), async (req, res, next) => {
  try {
    const { page, limit, search, category, minPrice, maxPrice } = req.query;

    const where = {
      status: 'ACTIVE'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.categories = {
        some: { category: { slug: category } }
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        gte: minPrice !== undefined ? minPrice : undefined,
        lte: maxPrice !== undefined ? maxPrice : undefined
      };
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          categories: { include: { category: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } }
      }
    });

    if (!product || product.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

module.exports = { productsRouter: router };
