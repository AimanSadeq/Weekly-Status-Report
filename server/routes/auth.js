const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Simple authentication - just check if email exists and is @viftraining.com
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!email || !email.endsWith('@viftraining.com')) {
      return res.status(400).json({ 
        error: 'Please use your @viftraining.com email address' 
      });
    }

    // Check if user exists
    let user = await db.getUser(email);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found in system. Please contact admin.' 
      });
    }

    // Return user data (no password check in simple mode)
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        visibilityScope: user.visibilityScope,
        departments: user.departments
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout (simple - just acknowledge)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check if user is authenticated (for frontend)
router.get('/check', async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const user = await db.getUser(email);
    if (user) {
      res.json({ authenticated: true, user });
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

module.exports = router;
