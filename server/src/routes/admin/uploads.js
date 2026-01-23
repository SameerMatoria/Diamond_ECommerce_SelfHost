const express = require('express');
const { z } = require('zod');

const { validateRequest } = require('../../middleware/validateRequest');
const { requireAuth } = require('../../middleware/requireAuth');
const { requireAdmin } = require('../../middleware/requireRole');
const { createPresignedPutUrl } = require('../../services/s3Service');

const router = express.Router();

router.use(requireAuth, requireAdmin);

const presignSchema = {
  body: z.object({
    filename: z.string().min(3),
    contentType: z.string().min(3)
  })
};

router.post('/uploads/presign', validateRequest(presignSchema), async (req, res, next) => {
  try {
    const timestamp = Date.now();
    const safeName = req.body.filename.replace(/[^a-zA-Z0-9._-]/g, '-');
    const key = `products/${timestamp}-${safeName}`;

    const result = await createPresignedPutUrl({
      key,
      contentType: req.body.contentType
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = { adminUploadsRouter: router };
