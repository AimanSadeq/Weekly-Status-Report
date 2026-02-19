const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

// Get all activities (admin) or user's activities (employee)
router.get('/', async (req, res) => {
  try {
    const { email, role, visibilityScope, week, status, department } = req.query;

    let activities;

    if (visibilityScope === 'all' || (role === 'admin' && !visibilityScope)) {
      // Admin or "all" scope: sees all activities company-wide
      activities = await db.getAllActivities();
    } else if (visibilityScope === 'department') {
      // Department scope: sees activities for their assigned departments
      activities = await db.getActivitiesByUserDepartments(email);
    } else {
      // Default "self" scope: employee sees only their own activities
      activities = await db.getActivitiesByUser(email);
    }

    // Apply filters
    if (week) {
      activities = activities.filter(a => a.week === week);
    }
    if (status) {
      activities = activities.filter(a => a.status === status);
    }
    if (department) {
      activities = activities.filter(a => a.department === department);
    }

    res.json({ success: true, activities });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get single activity
router.get('/:id', async (req, res) => {
  try {
    const activity = await db.getActivity(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Create new activity
router.post('/', async (req, res) => {
  try {
    const activityData = {
      id: uuidv4(),
      ...req.body,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    const activity = await db.createActivity(activityData);
    res.status(201).json({ success: true, activity });

  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const activity = await db.updateActivity(id, updates);
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteActivity(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ success: true, message: 'Activity deleted' });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Submit week (bulk update status)
router.post('/submit-week', async (req, res) => {
  try {
    const { email, week } = req.body;

    if (!email || !week) {
      return res.status(400).json({ error: 'Email and week required' });
    }

    // Get user's draft activities for the week
    const userActivities = await db.getActivitiesByUser(email);
    const weekActivities = userActivities.filter(
      a => a.week === week && a.status === 'draft'
    );

    // Update all to submitted
    const updated = [];
    for (const activity of weekActivities) {
      const updatedActivity = await db.updateActivity(activity.id, {
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });
      updated.push(updatedActivity);
    }

    res.json({ 
      success: true, 
      message: `${updated.length} activities submitted`,
      activities: updated
    });

  } catch (error) {
    console.error('Submit week error:', error);
    res.status(500).json({ error: 'Failed to submit week' });
  }
});

// Admin review activity
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminFeedback, adminName } = req.body;

    const activity = await db.updateActivity(id, {
      status: 'reviewed',
      adminFeedback,
      reviewedAt: new Date().toISOString(),
      feedbackRead: false // Mark feedback as unread
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Send email notification to employee (fire and forget)
    const user = await db.getUser(activity.email);
    if (user) {
      const emailData = {
        email: user.email,
        name: user.name,
        activityName: activity.activity || activity.activityType || 'Your Activity',
        feedback: adminFeedback
      };

      // Send email asynchronously (don't wait for it)
      fetch('http://localhost:3000/api/email/feedback-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      }).catch(err => console.log('Email notification failed:', err.message));
    }

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Review activity error:', error);
    res.status(500).json({ error: 'Failed to review activity' });
  }
});

// Mark feedback as read
router.post('/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;

    const activity = await db.updateActivity(id, {
      feedbackRead: true
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
