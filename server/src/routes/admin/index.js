const express = require('express');

const { adminCategoriesRouter } = require('./categories');
const { adminProductsRouter } = require('./products');
const { adminUploadsRouter } = require('./uploads');
const { adminOrdersRouter } = require('./orders');
const { adminUsersRouter } = require('./users');

const router = express.Router();

router.use(adminCategoriesRouter);
router.use(adminProductsRouter);
router.use(adminUploadsRouter);
router.use(adminOrdersRouter);
router.use(adminUsersRouter);

module.exports = { adminRouter: router };
