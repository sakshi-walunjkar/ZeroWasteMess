const express = require('express');
const router = express.Router();

// Placeholder — add auth (JWT) here
router.get('/me', (req, res) => {
  res.json({ message: 'Auth endpoint — coming soon' });
});

module.exports = router;
