const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const cookieParser = require('cookie-parser');

const { logger } = require('./lib/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { healthRouter } = require('./routes/health');
const { whoamiRouter } = require('./routes/whoami');
const { authRouter } = require('./routes/auth');
const { productsRouter } = require('./routes/products');
const { adminRouter } = require('./routes/admin');
const { cartRouter } = require('./routes/cart');
const { checkoutRouter } = require('./routes/checkout');
const { ordersRouter } = require('./routes/orders');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(pinoHttp({ logger }));

  app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'diamond-electronics-api' });
  });

  app.use('/api', healthRouter);
  app.use('/api', whoamiRouter);
  app.use('/api', authRouter);
  app.use('/api', productsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', cartRouter);
  app.use('/api', checkoutRouter);
  app.use('/api', ordersRouter);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
