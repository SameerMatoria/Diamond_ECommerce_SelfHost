const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

router.get('/whoami', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { whoamiRouter: router };
