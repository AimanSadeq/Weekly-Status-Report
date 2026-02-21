const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// GET /api/notifications — user's notifications
router.get('/', requireAuth, async (req, res) => {
  try {
    const { unreadOnly, limit = 20, offset = 0 } = req.query;
    const email = req.user.email;

    if (!HAS_SUPABASE) {
      return res.json({ success: true, notifications: [], unreadCount: 0 });
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_email', email)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (unreadOnly === 'true') {
      query = query.eq('is_read', false);
    }

    const { data, error, count } = await query;

    if (error) {
      // Table might not exist yet
      console.error('Notifications query error:', error);
      return res.json({ success: true, notifications: [], unreadCount: 0 });
    }

    // Get unread count separately
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_email', email)
      .eq('is_read', false);

    res.json({
      success: true,
      notifications: data || [],
      total: count || 0,
      unreadCount: unreadCount || 0
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read — mark as read
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('recipient_email', req.user.email);

    if (error) {
      console.error('Mark read error:', error);
      return res.status(500).json({ error: 'Failed to mark as read' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// PUT /api/notifications/mark-all-read
router.put('/mark-all-read', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_email', req.user.email)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all read error:', error);
      return res.status(500).json({ error: 'Failed to mark all as read' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

module.exports = router;
