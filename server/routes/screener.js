const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json({ success: true, results: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run screener' });
  }
});

module.exports = router;
