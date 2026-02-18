const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:email', async (req, res) => {
  try {
    const user = await db.getUser(req.params.email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    const user = await db.createUser(userData);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:email', async (req, res) => {
  try {
    const user = await db.updateUser(req.params.email, req.body);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user's email preferences
router.get('/:email/email-preferences', async (req, res) => {
  try {
    const preferences = await db.getEmailPreferences(req.params.email);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Get email preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user's email preferences
router.put('/:email/email-preferences', async (req, res) => {
  try {
    const preferences = await db.updateEmailPreferences(
      req.params.email,
      req.body
    );
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Update email preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
