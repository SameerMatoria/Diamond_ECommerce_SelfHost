const express = require('express');
const { z } = require('zod');

const { prisma } = require('../lib/prisma');
const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const { normalizePrice } = require('../services/cartService');

const router = express.Router();

router.use(requireAuth);

const checkoutSchema = {
  body: z.object({
    address: z.object({
      fullName: z.string().min(2),
      phone: z.string().min(6),
      line1: z.string().min(3),
      line2: z.string().optional(),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(3),
      country: z.string().min(2)
    }),
    shippingFee: z.coerce.number().min(0).optional()
  })
};

router.post('/checkout', validateRequest(checkoutSchema), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: { include: { product: true } }
        }
      });

      if (!cart || cart.items.length === 0) {
        const error = new Error('Cart is empty');
        error.status = 400;
        throw error;
      }

      for (const item of cart.items) {
        if (item.qty > item.product.stock) {
          const error = new Error('Insufficient stock');
          error.status = 400;
          throw error;
        }
      }

      const subtotal = cart.items.reduce((sum, item) => {
        return sum + normalizePrice(item.priceSnapshot) * item.qty;
      }, 0);
      const shippingFee = req.body.shippingFee ?? 0;
      const total = subtotal + shippingFee;

      const created = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal,
          shippingFee,
          total,
          paymentMethod: 'COD',
          paymentStatus: 'UNPAID',
          addressJson: req.body.address,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              titleSnapshot: item.product.title,
              priceSnapshot: item.priceSnapshot,
              qty: item.qty
            }))
          }
        },
        include: { items: true }
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } }
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

module.exports = { checkoutRouter: router };
