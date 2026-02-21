/**
 * In-App Notification Service
 */

const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

async function createNotification({ recipientEmail, type, title, message, entityType, entityId }) {
  try {
    if (!HAS_SUPABASE) {
      console.log(`[NOTIFICATION] ${type}: ${title} -> ${recipientEmail}`);
      return null;
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        recipient_email: recipientEmail,
        type,
        title,
        message,
        entity_type: entityType || null,
        entity_id: entityId || null,
        is_read: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create notification error:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Notification service error:', error.message);
    return null;
  }
}

async function notifyActivityReviewed({ recipientEmail, activityName, status, feedback, reviewerName }) {
  const statusText = status === 'approved' ? 'approved' : status === 'needs_revision' ? 'needs revision' : 'reviewed';
  return createNotification({
    recipientEmail,
    type: 'activity_reviewed',
    title: `Activity ${statusText}`,
    message: `Your activity "${activityName}" was ${statusText} by ${reviewerName}.${feedback ? ' Feedback: ' + feedback : ''}`,
    entityType: 'activity'
  });
}

async function notifyActivitySubmitted({ recipientEmail, employeeName, activityCount }) {
  return createNotification({
    recipientEmail,
    type: 'activity_submitted',
    title: 'Activities Submitted',
    message: `${employeeName} submitted ${activityCount} activities for review.`,
    entityType: 'activity'
  });
}

async function notifyComment({ recipientEmail, commenterName, activityName }) {
  return createNotification({
    recipientEmail,
    type: 'comment',
    title: 'New Comment',
    message: `${commenterName} commented on "${activityName}".`,
    entityType: 'activity'
  });
}

module.exports = { createNotification, notifyActivityReviewed, notifyActivitySubmitted, notifyComment };
