const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendFeedbackNotification } = require('./email');
const { logAudit } = require('../services/audit');
const { notifyActivityReviewed, notifyActivitySubmitted } = require('../services/notifications');

const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// Get all activities (admin) or user's activities (employee)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { week, status, department } = req.query;
    const { email, role, visibilityScope } = req.user;

    let activities;

    if (visibilityScope === 'all' || (role === 'admin' && !visibilityScope)) {
      activities = await db.getAllActivities();
    } else if (visibilityScope === 'department') {
      activities = await db.getActivitiesByUserDepartments(email);
    } else {
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

// GET /api/activities/review-queue — admin review queue
router.get('/review-queue', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status = 'submitted', department } = req.query;
    let activities = await db.getAllActivities();

    activities = activities.filter(a => a.status === status);
    if (department) {
      activities = activities.filter(a => a.department === department);
    }

    // Sort most recent first
    activities.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Review queue error:', error);
    res.status(500).json({ error: 'Failed to fetch review queue' });
  }
});

// GET /api/activities/calendar — activities grouped by date for month
router.get('/calendar', requireAuth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const { email, role, visibilityScope } = req.user;

    let activities;
    if (visibilityScope === 'all' || (role === 'admin' && !visibilityScope)) {
      activities = await db.getAllActivities();
    } else if (visibilityScope === 'department') {
      activities = await db.getActivitiesByUserDepartments(email);
    } else {
      activities = await db.getActivitiesByUser(email);
    }

    // Filter by month/year
    const m = parseInt(month);
    const y = parseInt(year);
    if (m && y) {
      activities = activities.filter(a => {
        const d = new Date(a.week || a.createdAt);
        return d.getMonth() + 1 === m && d.getFullYear() === y;
      });
    }

    // Group by date
    const byDate = {};
    activities.forEach(a => {
      const date = (a.week || a.createdAt || '').split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push({
        id: a.id,
        activityType: a.activityType || a.title,
        department: a.department,
        units: a.hours || a.units || 0,
        status: a.status,
        name: a.name,
        description: a.description || '',
        email: a.email || '',
        createdAt: a.createdAt || ''
      });
    });

    res.json({ success: true, calendar: byDate });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

// Get single activity
router.get('/:id', requireAuth, async (req, res) => {
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
router.post('/', requireAuth, async (req, res) => {
  try {
    const activityData = {
      id: uuidv4(),
      ...req.body,
      email: req.user.email,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    const activity = await db.createActivity(activityData);

    logAudit({
      action: 'create',
      entityType: 'activity',
      entityId: activity?.id,
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: { activityType: activityData.activityType, department: activityData.department },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, activity });

  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Update activity
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const activity = await db.updateActivity(id, updates);

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    logAudit({
      action: 'update',
      entityType: 'activity',
      entityId: id,
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: updates,
      ipAddress: req.ip
    });

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Delete activity (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Try soft delete first (set deleted_at)
    if (HAS_SUPABASE) {
      const { data, error } = await supabase
        .from('activities')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Fallback to hard delete if deleted_at column doesn't exist
        const deleted = await db.deleteActivity(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Activity not found' });
        }
      }
    } else {
      const deleted = await db.deleteActivity(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Activity not found' });
      }
    }

    logAudit({
      action: 'delete',
      entityType: 'activity',
      entityId: id,
      actorEmail: req.user.email,
      actorName: req.user.name,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Activity deleted', activityId: id });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// POST /api/activities/:id/restore — undo soft delete
router.post('/:id/restore', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (HAS_SUPABASE) {
      const { data, error } = await supabase
        .from('activities')
        .update({ deleted_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: 'Failed to restore activity' });
      }

      return res.json({ success: true, message: 'Activity restored' });
    }

    res.status(501).json({ error: 'Restore not supported in non-Supabase mode' });
  } catch (error) {
    console.error('Restore activity error:', error);
    res.status(500).json({ error: 'Failed to restore activity' });
  }
});

// Submit week (bulk update status)
router.post('/submit-week', requireAuth, async (req, res) => {
  try {
    const { week } = req.body;
    const email = req.user.email;

    if (!week) {
      return res.status(400).json({ error: 'Week required' });
    }

    const userActivities = await db.getActivitiesByUser(email);
    const weekActivities = userActivities.filter(
      a => a.week === week && a.status === 'draft'
    );

    const updated = [];
    for (const activity of weekActivities) {
      const updatedActivity = await db.updateActivity(activity.id, {
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });
      updated.push(updatedActivity);
    }

    logAudit({
      action: 'submit_week',
      entityType: 'activity',
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: { week, count: updated.length },
      ipAddress: req.ip
    });

    // Notify admins
    const allUsers = await db.getAllUsers();
    const admins = allUsers.filter(u => u.role === 'admin');
    for (const admin of admins) {
      notifyActivitySubmitted({
        recipientEmail: admin.email,
        employeeName: req.user.name,
        activityCount: updated.length
      }).catch(() => {});
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

// POST /api/activities/bulk-delete
router.post('/bulk-delete', requireAuth, async (req, res) => {
  try {
    const { activityIds } = req.body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: 'activityIds array required' });
    }

    let deleted = 0;
    for (const id of activityIds) {
      if (HAS_SUPABASE) {
        const { error } = await supabase
          .from('activities')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
        if (!error) deleted++;
      } else {
        const result = await db.deleteActivity(id);
        if (result) deleted++;
      }
    }

    logAudit({
      action: 'bulk_delete',
      entityType: 'activity',
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: { activityIds, deletedCount: deleted },
      ipAddress: req.ip
    });

    res.json({ success: true, message: `${deleted} activities deleted`, deletedCount: deleted });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
});

// POST /api/activities/bulk-update
router.post('/bulk-update', requireAuth, async (req, res) => {
  try {
    const { activityIds, updates } = req.body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: 'activityIds array required' });
    }

    let updated = 0;
    for (const id of activityIds) {
      const result = await db.updateActivity(id, updates);
      if (result) updated++;
    }

    logAudit({
      action: 'bulk_update',
      entityType: 'activity',
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: { activityIds, updates, updatedCount: updated },
      ipAddress: req.ip
    });

    res.json({ success: true, message: `${updated} activities updated`, updatedCount: updated });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update' });
  }
});

// POST /api/activities/bulk-review
router.post('/bulk-review', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { activityIds, action, feedback } = req.body;

    if (!activityIds || !Array.isArray(activityIds) || activityIds.length === 0) {
      return res.status(400).json({ error: 'activityIds array required' });
    }

    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'needs_revision' : 'reviewed';

    let updated = 0;
    for (const id of activityIds) {
      const activity = await db.updateActivity(id, {
        status,
        adminFeedback: feedback || null,
        reviewedAt: new Date().toISOString(),
        feedbackRead: false
      });

      if (activity) {
        updated++;

        // Notify each activity owner
        const user = await db.getUser(activity.email);
        if (user) {
          notifyActivityReviewed({
            recipientEmail: user.email,
            activityName: activity.activityType || activity.title || 'Activity',
            status,
            feedback,
            reviewerName: req.user.name
          }).catch(() => {});

          sendFeedbackNotification({
            email: user.email,
            name: user.name,
            activityName: activity.activityType || activity.title || 'Activity',
            feedback: feedback || `Activity ${status}`
          }).catch(() => {});
        }
      }
    }

    logAudit({
      action: 'bulk_review',
      entityType: 'activity',
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: { activityIds, status, feedback, reviewedCount: updated },
      ipAddress: req.ip
    });

    res.json({ success: true, message: `${updated} activities ${status}`, updatedCount: updated });
  } catch (error) {
    console.error('Bulk review error:', error);
    res.status(500).json({ error: 'Failed to bulk review' });
  }
});

// Admin review activity
router.post('/:id/review', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminFeedback, adminName, action: reviewAction } = req.body;

    const status = reviewAction === 'approve' ? 'approved'
      : reviewAction === 'reject' ? 'needs_revision'
      : 'reviewed';

    const activity = await db.updateActivity(id, {
      status,
      adminFeedback,
      reviewedAt: new Date().toISOString(),
      feedbackRead: false
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Send email notification to employee
    const user = await db.getUser(activity.email);
    if (user) {
      sendFeedbackNotification({
        email: user.email,
        name: user.name,
        activityName: activity.activity || activity.activityType || 'Your Activity',
        feedback: adminFeedback
      }).catch(err => console.log('Email notification failed:', err.message));

      notifyActivityReviewed({
        recipientEmail: user.email,
        activityName: activity.activityType || 'Activity',
        status,
        feedback: adminFeedback,
        reviewerName: req.user.name
      }).catch(() => {});
    }

    logAudit({
      action: 'review',
      entityType: 'activity',
      entityId: id,
      actorEmail: req.user.email,
      actorName: req.user.name,
      changes: { status, adminFeedback },
      ipAddress: req.ip
    });

    res.json({ success: true, activity });

  } catch (error) {
    console.error('Review activity error:', error);
    res.status(500).json({ error: 'Failed to review activity' });
  }
});

// POST /api/activities/:id/comment
router.post('/:id/comment', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    if (!HAS_SUPABASE) {
      return res.json({ success: true, comment: { content, author: req.user.email, createdAt: new Date().toISOString() } });
    }

    const { data, error } = await supabase
      .from('activity_notes')
      .insert([{
        activity_id: id,
        author_email: req.user.email,
        author_name: req.user.name,
        content,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Comment error:', error);
      return res.status(500).json({ error: 'Failed to add comment' });
    }

    res.status(201).json({ success: true, comment: data });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// GET /api/activities/:id/comments
router.get('/:id/comments', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true, comments: [] });
    }

    const { data, error } = await supabase
      .from('activity_notes')
      .select('*')
      .eq('activity_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments error:', error);
      return res.json({ success: true, comments: [] });
    }

    res.json({ success: true, comments: data || [] });
  } catch (error) {
    console.error('Comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// GET /api/activities/:id/notes
router.get('/:id/notes', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true, notes: [] });
    }

    const { data, error } = await supabase
      .from('activity_notes')
      .select('*')
      .eq('activity_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.json({ success: true, notes: [] });
    }

    res.json({ success: true, notes: data || [] });
  } catch (error) {
    console.error('Notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/activities/:id/notes
router.post('/:id/notes', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    if (!HAS_SUPABASE) {
      return res.json({ success: true, note: { content, authorEmail: req.user.email } });
    }

    const { data, error } = await supabase
      .from('activity_notes')
      .insert([{
        activity_id: req.params.id,
        author_email: req.user.email,
        author_name: req.user.name,
        content,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to add note' });
    }

    res.status(201).json({ success: true, note: data });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// DELETE /api/activities/:id/notes/:noteId
router.delete('/:id/notes/:noteId', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true });
    }

    const { error } = await supabase
      .from('activity_notes')
      .delete()
      .eq('id', req.params.noteId)
      .eq('activity_id', req.params.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete note' });
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// GET /api/activities/:id/attachments
router.get('/:id/attachments', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true, attachments: [] });
    }

    const { data, error } = await supabase
      .from('activity_attachments')
      .select('*')
      .eq('activity_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.json({ success: true, attachments: [] });
    }

    res.json({ success: true, attachments: data || [] });
  } catch (error) {
    console.error('Attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
});

// Mark feedback as read
router.post('/:id/mark-read', requireAuth, async (req, res) => {
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
router.get('/stats/summary', requireAuth, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
