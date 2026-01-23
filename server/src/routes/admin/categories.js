const express = require('express');
const { z } = require('zod');

const { prisma } = require('../../lib/prisma');
const { validateRequest } = require('../../middleware/validateRequest');
const { requireAuth } = require('../../middleware/requireAuth');
const { requireAdmin } = require('../../middleware/requireRole');
const { createCategory, updateCategory } = require('../../services/catalogService');

const router = express.Router();

router.use(requireAuth, requireAdmin);

const categorySchema = {
  body: z.object({
    name: z.string().min(2),
    slug: z.string().optional()
  })
};

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
});

router.post('/categories', validateRequest(categorySchema), async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

router.put('/categories/:id', validateRequest(categorySchema), async (req, res, next) => {
  try {
    const category = await updateCategory(req.params.id, req.body);
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

module.exports = { adminCategoriesRouter: router };
