require('dotenv').config();

const { createApp } = require('./app');
const { logger } = require('./lib/logger');

const port = process.env.PORT || 4000;
const app = createApp();

app.listen(port, () => {
  logger.info({ port }, 'API listening');
});
