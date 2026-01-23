const express = require('express');
const { z } = require('zod');

const { requireAuth } = require('../middleware/requireAuth');
const { validateRequest } = require('../middleware/validateRequest');
const {
  getCartForUser,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  calculateTotals
} = require('../services/cartService');

const router = express.Router();

router.use(requireAuth);

const addSchema = {
  body: z.object({
    productId: z.string().min(5),
    qty: z.coerce.number().int().min(1).max(99)
  })
};

const updateSchema = {
  body: z.object({
    qty: z.coerce.number().int().min(1).max(99)
  })
};

router.get('/cart', async (req, res, next) => {
  try {
    const cart = await getCartForUser(req.user.id);
    res.json({ cart, totals: calculateTotals(cart) });
  } catch (error) {
    next(error);
  }
});

router.post('/cart/items', validateRequest(addSchema), async (req, res, next) => {
  try {
    await addItemToCart(req.user.id, req.body);
    const cart = await getCartForUser(req.user.id);
    res.status(201).json({ cart, totals: calculateTotals(cart) });
  } catch (error) {
    next(error);
  }
});

router.put('/cart/items/:itemId', validateRequest(updateSchema), async (req, res, next) => {
  try {
    await updateCartItem(req.user.id, req.params.itemId, req.body.qty);
    const cart = await getCartForUser(req.user.id);
    res.json({ cart, totals: calculateTotals(cart) });
  } catch (error) {
    next(error);
  }
});

router.delete('/cart/items/:itemId', async (req, res, next) => {
  try {
    await removeCartItem(req.user.id, req.params.itemId);
    const cart = await getCartForUser(req.user.id);
    res.json({ cart, totals: calculateTotals(cart) });
  } catch (error) {
    next(error);
  }
});

module.exports = { cartRouter: router };
