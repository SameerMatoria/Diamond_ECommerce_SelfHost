const express = require('express');
const { z } = require('zod');

const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.use(requireAuth);

const listSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10)
  })
};

router.get('/orders', validateRequest(listSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const where = { userId: req.user.id };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
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

router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ order });
  } catch (error) {
    next(error);
  }
});

module.exports = { ordersRouter: router };
