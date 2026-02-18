const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json({ success: true, analytics: {} });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
