const { ZodError } = require('zod');

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      details: err.errors
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  return res.status(status).json({ error: message });
}

module.exports = { errorHandler };
