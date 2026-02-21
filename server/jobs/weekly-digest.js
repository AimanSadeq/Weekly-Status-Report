/**
 * Weekly Digest Job - Sends enhanced digest emails
 * Requires node-cron to be installed
 */

const db = require('../models/db');

let sendEmail;
try {
  const emailModule = require('../routes/email');
  sendEmail = emailModule.sendEmail;
} catch (e) {
  sendEmail = null;
}

async function sendEmployeeDigests() {
  try {
    if (!sendEmail) {
      console.log('[DIGEST] Email service not available');
      return;
    }

    const users = await db.getAllUsers();
    const allActivities = await db.getAllActivities();

    // Calculate last week's date range
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7);
    const lastFriday = new Date(lastMonday);
    lastFriday.setDate(lastMonday.getDate() + 4);

    const startDate = lastMonday.toISOString().split('T')[0];
    const endDate = lastFriday.toISOString().split('T')[0];

    for (const user of users) {
      try {
        const prefs = await db.getEmailPreferences(user.email);
        if (!prefs.weeklyDigests) continue;

        const userActivities = allActivities.filter(a => {
          if (a.email !== user.email) return false;
          const d = (a.week || a.createdAt || '').split('T')[0];
          return d >= startDate && d <= endDate;
        });

        const totalUnits = userActivities.reduce((sum, a) => sum + (a.hours || a.units || 0), 0);
        const byStatus = {};
        userActivities.forEach(a => {
          const s = a.status || 'draft';
          byStatus[s] = (byStatus[s] || 0) + 1;
        });

        const html = `
          <h2>Your Weekly Activity Summary</h2>
          <p>Hi ${user.name || 'there'},</p>
          <p>Here's your activity summary for ${startDate} to ${endDate}:</p>
          <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Activities</strong></td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${userActivities.length}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Units</strong></td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${totalUnits}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Submitted</strong></td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${byStatus.submitted || 0}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Reviewed</strong></td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${byStatus.reviewed || byStatus.approved || 0}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Draft</strong></td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${byStatus.draft || byStatus.pending || 0}</td>
            </tr>
          </table>
          <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a></p>
        `;

        await sendEmail(user.email, 'Your Weekly Activity Summary', html, 'weekly-digest');
      } catch (err) {
        console.error(`[DIGEST] Failed for ${user.email}:`, err.message);
      }
    }

    console.log('[DIGEST] Employee digests sent');
  } catch (error) {
    console.error('[DIGEST] Error:', error);
  }
}

async function sendAdminWeeklyReport() {
  try {
    if (!sendEmail) return;

    const users = await db.getAllUsers();
    const admins = users.filter(u => u.role === 'admin');
    const allActivities = await db.getAllActivities();

    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - 7);
    const lastFriday = new Date(lastMonday);
    lastFriday.setDate(lastMonday.getDate() + 4);

    const startDate = lastMonday.toISOString().split('T')[0];
    const endDate = lastFriday.toISOString().split('T')[0];

    const weekActivities = allActivities.filter(a => {
      const d = (a.week || a.createdAt || '').split('T')[0];
      return d >= startDate && d <= endDate;
    });

    const activeEmployees = new Set(weekActivities.map(a => a.email).filter(Boolean));
    const totalUnits = weekActivities.reduce((sum, a) => sum + (a.hours || a.units || 0), 0);

    const html = `
      <h2>Company Weekly Activity Report</h2>
      <p>Week of ${startDate} to ${endDate}</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr style="background: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Activities</strong></td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${weekActivities.length}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Active Employees</strong></td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${activeEmployees.size} / ${users.length}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>Total Units</strong></td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;">${totalUnits}</td>
        </tr>
      </table>
      <p><a href="${process.env.APP_URL || 'https://your-app.replit.app'}/admin-management.html" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Admin Dashboard</a></p>
    `;

    for (const admin of admins) {
      try {
        const prefs = await db.getEmailPreferences(admin.email);
        if (!prefs.weeklyDigests) continue;
        await sendEmail(admin.email, 'Company Weekly Activity Report', html, 'admin-weekly-report');
      } catch (err) {
        console.error(`[DIGEST] Admin report failed for ${admin.email}:`, err.message);
      }
    }

    console.log('[DIGEST] Admin weekly reports sent');
  } catch (error) {
    console.error('[DIGEST] Admin report error:', error);
  }
}

function initWeeklyDigest() {
  try {
    const cron = require('node-cron');

    // Monday 8:00 AM — employee digests
    cron.schedule('0 8 * * 1', () => {
      console.log('[CRON] Running employee weekly digest...');
      sendEmployeeDigests();
    });

    // Monday 8:30 AM — admin weekly report
    cron.schedule('30 8 * * 1', () => {
      console.log('[CRON] Running admin weekly report...');
      sendAdminWeeklyReport();
    });

    console.log('[CRON] Weekly digest jobs scheduled');
  } catch (error) {
    console.log('[CRON] node-cron not available, weekly digests disabled');
  }
}

module.exports = { initWeeklyDigest, sendEmployeeDigests, sendAdminWeeklyReport };
