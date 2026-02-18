const express = require('express');
const router = express.Router();

// GET all companies
router.get('/', async (req, res) => {
  try {
    const companies = [
      { id: 1, name: 'Saudi Aramco', symbol: 'ARAMCO', country: 'Saudi Arabia', sector: 'Energy' },
      { id: 2, name: 'Al Rajhi Bank', symbol: 'RJHI', country: 'Saudi Arabia', sector: 'Banking' },
      { id: 3, name: 'Emirates NBD', symbol: 'EMIRATESNBD', country: 'UAE', sector: 'Banking' },
      { id: 4, name: 'Qatar National Bank', symbol: 'QNBK', country: 'Qatar', sector: 'Banking' }
    ];
    res.json({ success: true, companies });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

module.exports = router;
