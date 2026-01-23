const express = require('express');
const { z } = require('zod');

const { prisma } = require('../../lib/prisma');
const { validateRequest } = require('../../middleware/validateRequest');
const { requireAuth } = require('../../middleware/requireAuth');
const { requireAdmin } = require('../../middleware/requireRole');
const { createProduct, updateProduct } = require('../../services/catalogService');

const router = express.Router();

router.use(requireAuth, requireAdmin);

const productSchema = {
  body: z.object({
    title: z.string().min(2),
    slug: z.string().optional(),
    description: z.string().min(10),
    price: z.coerce.number().positive(),
    salePrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0),
    status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
    categoryIds: z.array(z.string()).optional()
  })
};

const listSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z.enum(['DRAFT', 'ACTIVE']).optional(),
    search: z.string().optional()
  })
};

router.get('/products', validateRequest(listSchema), async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
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

router.get('/products/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        categories: { include: { category: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.post('/products', validateRequest(productSchema), async (req, res, next) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', validateRequest(productSchema), async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

router.post('/products/:id/images', async (req, res, next) => {
  try {
    const schema = z.object({
      url: z.string().url(),
      s3Key: z.string().min(3),
      sortOrder: z.number().int().min(0).default(0)
    });

    const payload = schema.parse(req.body);

    const image = await prisma.productImage.create({
      data: {
        productId: req.params.id,
        url: payload.url,
        s3Key: payload.s3Key,
        sortOrder: payload.sortOrder
      }
    });

    res.status(201).json({ image });
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id/images/:imageId', async (req, res, next) => {
  try {
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

module.exports = { adminProductsRouter: router };
