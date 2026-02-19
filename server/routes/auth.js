const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { generateToken, requireAuth } = require('../middleware/auth');

const SALT_ROUNDS = 10;

// Authenticate with email + password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!email || !email.endsWith('@viftraining.com')) {
      return res.status(400).json({
        error: 'Please use your @viftraining.com email address'
      });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check if user exists
    let user = await db.getUser(email);

    if (!user) {
      return res.status(404).json({
        error: 'User not found in system. Please contact admin.'
      });
    }

    // Verify password
    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'Account not set up yet. Please contact admin to set your password.'
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login timestamp
    try {
      const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
      if (HAS_SUPABASE) {
        const { createClient } = require('@supabase/supabase-js');
        const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        await sb.from('employees').update({ last_login_at: new Date().toISOString() }).eq('email', email);
      }
    } catch (e) {
      // Don't fail login if last_login update fails
    }

    // Return user data (exclude passwordHash)
    res.json({
      success: true,
      token,
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

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get user
    const user = await db.getUser(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Account not set up yet' });
    }

    const currentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!currentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.updatePassword(email, newHash);

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout (simple - just acknowledge)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check if user is authenticated (for frontend)
router.get('/check', requireAuth, async (req, res) => {
  try {
    const user = await db.getUser(req.user.email);
    if (user) {
      const { passwordHash, ...safeUser } = user;
      res.json({ authenticated: true, user: safeUser });
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication check failed' });
  }
});

module.exports = router;
