const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const db = require('../models/db');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email templates mapping
const EMAIL_TYPES = {
  DEADLINE_REMINDER: 'deadline-reminder',
  SUBMISSION_CONFIRMATION: 'submission-confirmation',
  FEEDBACK_NOTIFICATION: 'feedback-notification',
  WEEKLY_DIGEST: 'weekly-digest',
  ADMIN_ALERT: 'admin-alert'
};

// Send email helper function
async function sendEmail(to, subject, html, type) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid not configured - email not sent');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@viftraining.com',
      subject,
      html
    };

    await sgMail.send(msg);
    console.log(`✉️ Email sent: ${type} to ${to}`);
    return { success: true };

  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

// Test email endpoint
router.post('/test', async (req, res) => {
  try {
    const { to } = req.body;
    
    const html = `
      <h2>VIF Activity Tracker - Test Email</h2>
      <p>This is a test email from your VIF Activity Tracker system.</p>
      <p>If you're seeing this, email integration is working correctly!</p>
      <p><strong>Time sent:</strong> ${new Date().toLocaleString()}</p>
    `;

    const result = await sendEmail(
      to,
      'VIF Activity Tracker - Test Email',
      html,
      'test'
    );

    res.json(result);

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Send deadline reminder
router.post('/deadline-reminder', async (req, res) => {
  try {
    const { email, name, daysLeft, weekEnding } = req.body;
    
    // Check user preferences
    const prefs = await db.getEmailPreferences(email);
    if (!prefs.deadlineReminders) {
      return res.json({ success: true, message: 'User has disabled reminders' });
    }

    const html = `
      <h2>⏰ Activity Submission Deadline Reminder</h2>
      <p>Hi ${name},</p>
      <p>This is a friendly reminder that you have <strong>${daysLeft} days</strong> left to submit your weekly activities.</p>
      <p><strong>Week Ending:</strong> ${weekEnding}</p>
      <p>Please log in to the VIF Activity Tracker to submit your activities before the deadline.</p>
      <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Submit Activities</a></p>
      <br>
      <p style="color: #666; font-size: 12px;">You can manage email preferences in your account settings.</p>
    `;

    const result = await sendEmail(
      email,
      `⏰ ${daysLeft} Days Left to Submit Weekly Activities`,
      html,
      EMAIL_TYPES.DEADLINE_REMINDER
    );

    res.json(result);

  } catch (error) {
    console.error('Deadline reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// Send submission confirmation
router.post('/submission-confirmation', async (req, res) => {
  try {
    const { email, name, activityCount, weekEnding } = req.body;
    
    const prefs = await db.getEmailPreferences(email);
    if (!prefs.submissionConfirmations) {
      return res.json({ success: true, message: 'User has disabled confirmations' });
    }

    const html = `
      <h2>✅ Activities Submitted Successfully</h2>
      <p>Hi ${name},</p>
      <p>Your weekly activities have been submitted successfully!</p>
      <p><strong>Week Ending:</strong> ${weekEnding}</p>
      <p><strong>Activities Submitted:</strong> ${activityCount}</p>
      <p>Your manager will review your submission and provide feedback soon.</p>
      <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Activities</a></p>
      <br>
      <p style="color: #666; font-size: 12px;">You can manage email preferences in your account settings.</p>
    `;

    const result = await sendEmail(
      email,
      '✅ Weekly Activities Submitted',
      html,
      EMAIL_TYPES.SUBMISSION_CONFIRMATION
    );

    res.json(result);

  } catch (error) {
    console.error('Submission confirmation error:', error);
    res.status(500).json({ error: 'Failed to send confirmation' });
  }
});

// Send feedback notification
router.post('/feedback-notification', async (req, res) => {
  try {
    const { email, name, activityName, feedback } = req.body;
    
    const prefs = await db.getEmailPreferences(email);
    if (!prefs.feedbackNotifications) {
      return res.json({ success: true, message: 'User has disabled notifications' });
    }

    const html = `
      <h2>💬 New Feedback on Your Activity</h2>
      <p>Hi ${name},</p>
      <p>Your manager has reviewed your activity and provided feedback.</p>
      <p><strong>Activity:</strong> ${activityName}</p>
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Feedback:</strong></p>
        <p style="margin: 8px 0 0 0;">${feedback}</p>
      </div>
      <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Details</a></p>
      <br>
      <p style="color: #666; font-size: 12px;">You can manage email preferences in your account settings.</p>
    `;

    const result = await sendEmail(
      email,
      '💬 New Feedback on Your Activity',
      html,
      EMAIL_TYPES.FEEDBACK_NOTIFICATION
    );

    res.json(result);

  } catch (error) {
    console.error('Feedback notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send weekly digest
router.post('/weekly-digest', async (req, res) => {
  try {
    const { email, name, summary } = req.body;
    
    const prefs = await db.getEmailPreferences(email);
    if (!prefs.weeklyDigests) {
      return res.json({ success: true, message: 'User has disabled digests' });
    }

    const html = `
      <h2>📊 Your Weekly Activity Summary</h2>
      <p>Hi ${name},</p>
      <p>Here's your activity summary for the past week:</p>
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Total Activities:</strong> ${summary.totalActivities || 0}</p>
        <p><strong>Submitted:</strong> ${summary.submitted || 0}</p>
        <p><strong>Reviewed:</strong> ${summary.reviewed || 0}</p>
        <p><strong>Pending:</strong> ${summary.pending || 0}</p>
      </div>
      <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a></p>
      <br>
      <p style="color: #666; font-size: 12px;">You can manage email preferences in your account settings.</p>
    `;

    const result = await sendEmail(
      email,
      '📊 Your Weekly Activity Summary',
      html,
      EMAIL_TYPES.WEEKLY_DIGEST
    );

    res.json(result);

  } catch (error) {
    console.error('Weekly digest error:', error);
    res.status(500).json({ error: 'Failed to send digest' });
  }
});

// Send admin alert
router.post('/admin-alert', async (req, res) => {
  try {
    const { adminEmail, message, subject } = req.body;

    const html = `
      <h2>🚨 VIF Activity Tracker Alert</h2>
      ${message}
      <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a></p>
    `;

    const result = await sendEmail(
      adminEmail,
      subject || '🚨 Admin Alert',
      html,
      EMAIL_TYPES.ADMIN_ALERT
    );

    res.json(result);

  } catch (error) {
    console.error('Admin alert error:', error);
    res.status(500).json({ error: 'Failed to send alert' });
  }
});

module.exports = router;
