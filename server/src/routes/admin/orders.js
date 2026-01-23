const express = require('express');
const { z } = require('zod');

const { prisma } = require('../../lib/prisma');
const { requireAuth } = require('../../middleware/requireAuth');
const { requireAdmin } = require('../../middleware/requireRole');
const { validateRequest } = require('../../middleware/validateRequest');

const router = express.Router();

router.use(requireAuth, requireAdmin);

const listSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUNDED']).optional(),
    search: z.string().optional()
  })
};

const statusSchema = {
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  })
};

const paymentSchema = {
  body: z.object({
    paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUNDED'])
  })
};

router.get('/orders', validateRequest(listSchema), async (req, res, next) => {
  try {
    const { page, limit, status, paymentStatus, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.user = { email: { contains: search, mode: 'insensitive' } };
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: true, items: true },
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
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { user: true, items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ order });
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/status', validateRequest(statusSchema), async (req, res, next) => {
  try {
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: req.user.id,
        action: 'ORDER_STATUS_UPDATE',
        entity: 'Order',
        entityId: updated.id,
        metaJson: { from: existing.status, to: updated.status }
      }
    });

    res.json({ order: updated });
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/payment-status', validateRequest(paymentSchema), async (req, res, next) => {
  try {
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentStatus: req.body.paymentStatus }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: req.user.id,
        action: 'ORDER_PAYMENT_UPDATE',
        entity: 'Order',
        entityId: updated.id,
        metaJson: { from: existing.paymentStatus, to: updated.paymentStatus }
      }
    });

    res.json({ order: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = { adminOrdersRouter: router };
