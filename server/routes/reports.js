const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json({ success: true, reports: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
