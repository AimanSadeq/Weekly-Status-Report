const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    res.json({ success: true, comparison: { message: 'Comparison feature coming soon' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comparison' });
  }
});

module.exports = router;
