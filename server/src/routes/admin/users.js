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
    search: z.string().optional(),
  }),
};

const roleSchema = {
  body: z.object({
    role: z.enum(['USER', 'ADMIN']),
  }),
};

function parseAllowlist() {
  const raw = process.env.SUPER_ADMIN_EMAIL_ALLOWLIST || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isSuperAdmin(email) {
  const allowlist = parseAllowlist();
  if (allowlist.length === 0) {
    return true;
  }
  return allowlist.includes((email || '').toLowerCase());
}

router.get('/users', validateRequest(listSchema), async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/role', validateRequest(roleSchema), async (req, res, next) => {
  try {
    if (!isSuperAdmin(req.user.email)) {
      return res.status(403).json({ error: 'Super admin required' });
    }

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: req.body.role },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminUserId: req.user.id,
        action: 'USER_ROLE_UPDATE',
        entity: 'User',
        entityId: updated.id,
        metaJson: { from: existing.role, to: updated.role },
      },
    });

    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = { adminUsersRouter: router };
