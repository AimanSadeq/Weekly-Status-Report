const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const db = require('../models/db');

const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// GET /api/analytics/employee-summary — aggregates activities based on user visibility
router.get('/employee-summary', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { email, role, visibilityScope } = req.user;

    let userActivities;
    if (visibilityScope === 'all' || (role === 'admin' && !visibilityScope)) {
      userActivities = await db.getAllActivities();
    } else if (visibilityScope === 'department') {
      userActivities = await db.getActivitiesByUserDepartments(email);
    } else {
      userActivities = await db.getActivitiesByUser(email);
    }

    // Filter by date range
    let filtered = userActivities;
    if (startDate) {
      filtered = filtered.filter(a => {
        const d = a.week || a.createdAt;
        return d >= startDate;
      });
    }
    if (endDate) {
      filtered = filtered.filter(a => {
        const d = a.week || a.createdAt;
        return d <= endDate;
      });
    }

    // Aggregate by activity type
    const byType = {};
    filtered.forEach(a => {
      const type = a.activityType || a.title || 'Other';
      if (!byType[type]) byType[type] = { count: 0, units: 0 };
      byType[type].count++;
      byType[type].units += (a.hours || a.units || 0);
    });

    // Aggregate by department
    const byDepartment = {};
    filtered.forEach(a => {
      const dept = a.department || 'Unknown';
      if (!byDepartment[dept]) byDepartment[dept] = { count: 0, units: 0 };
      byDepartment[dept].count++;
      byDepartment[dept].units += (a.hours || a.units || 0);
    });

    // Weekly trend (group by week date)
    const weeklyTrend = {};
    filtered.forEach(a => {
      const date = (a.week || a.createdAt || '').split('T')[0];
      if (!weeklyTrend[date]) weeklyTrend[date] = { count: 0, units: 0 };
      weeklyTrend[date].count++;
      weeklyTrend[date].units += (a.hours || a.units || 0);
    });

    // Sort weekly trend by date
    const sortedTrend = Object.entries(weeklyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    // Status breakdown
    const byStatus = {};
    filtered.forEach(a => {
      const status = a.status || 'draft';
      if (!byStatus[status]) byStatus[status] = 0;
      byStatus[status]++;
    });

    const totalUnits = filtered.reduce((sum, a) => sum + (a.hours || a.units || 0), 0);

    res.json({
      success: true,
      summary: {
        totalActivities: filtered.length,
        totalUnits,
        byType,
        byDepartment,
        weeklyTrend: sortedTrend,
        byStatus
      }
    });
  } catch (error) {
    console.error('Employee summary error:', error);
    res.status(500).json({ error: 'Failed to fetch employee summary' });
  }
});

// GET /api/analytics/admin-summary — company-wide metrics
router.get('/admin-summary', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const allActivities = await db.getAllActivities();
    const allUsers = await db.getAllUsers();

    // Filter by date range
    let filtered = allActivities;
    if (startDate) {
      filtered = filtered.filter(a => {
        const d = a.week || a.createdAt;
        return d >= startDate;
      });
    }
    if (endDate) {
      filtered = filtered.filter(a => {
        const d = a.week || a.createdAt;
        return d <= endDate;
      });
    }

    // Active employees (those with activities in period)
    const activeEmails = new Set(filtered.map(a => a.email).filter(Boolean));

    // Department comparison
    const byDepartment = {};
    filtered.forEach(a => {
      const dept = a.department || 'Unknown';
      if (!byDepartment[dept]) byDepartment[dept] = { count: 0, units: 0, employees: new Set() };
      byDepartment[dept].count++;
      byDepartment[dept].units += (a.hours || a.units || 0);
      if (a.email) byDepartment[dept].employees.add(a.email);
    });

    // Convert Sets to counts
    const departmentComparison = {};
    for (const [dept, data] of Object.entries(byDepartment)) {
      departmentComparison[dept] = {
        count: data.count,
        units: data.units,
        employeeCount: data.employees.size
      };
    }

    // Top performers
    const byEmployee = {};
    filtered.forEach(a => {
      const name = a.name || a.email || 'Unknown';
      if (!byEmployee[name]) byEmployee[name] = { count: 0, units: 0, email: a.email };
      byEmployee[name].count++;
      byEmployee[name].units += (a.hours || a.units || 0);
    });

    const topPerformers = Object.entries(byEmployee)
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }));

    // Activity type distribution
    const byType = {};
    filtered.forEach(a => {
      const type = a.activityType || a.title || 'Other';
      if (!byType[type]) byType[type] = { count: 0, units: 0 };
      byType[type].count++;
      byType[type].units += (a.hours || a.units || 0);
    });

    // Daily trend
    const dailyTrend = {};
    filtered.forEach(a => {
      const date = (a.week || a.createdAt || '').split('T')[0];
      if (!dailyTrend[date]) dailyTrend[date] = { count: 0, units: 0 };
      dailyTrend[date].count++;
      dailyTrend[date].units += (a.hours || a.units || 0);
    });

    const sortedTrend = Object.entries(dailyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    // Status breakdown
    const byStatus = {};
    filtered.forEach(a => {
      const status = a.status || 'draft';
      if (!byStatus[status]) byStatus[status] = 0;
      byStatus[status]++;
    });

    const totalUnits = filtered.reduce((sum, a) => sum + (a.hours || a.units || 0), 0);

    res.json({
      success: true,
      summary: {
        totalActivities: filtered.length,
        totalUnits,
        totalEmployees: allUsers.length,
        activeEmployees: activeEmails.size,
        avgUnitsPerEmployee: activeEmails.size > 0 ? Math.round((totalUnits / activeEmails.size) * 10) / 10 : 0,
        pendingReviews: byStatus['submitted'] || 0,
        departmentComparison,
        topPerformers,
        byType,
        dailyTrend: sortedTrend,
        byStatus
      }
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ error: 'Failed to fetch admin summary' });
  }
});

// GET /api/analytics/activity-trends — daily activity trend data
router.get('/activity-trends', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { period } = req.query;
    const days = period === '90d' ? 90 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const allActivities = await db.getAllActivities();
    const filtered = allActivities.filter(a => {
      const d = (a.week || a.createdAt || '').split('T')[0];
      return d >= cutoffStr;
    });

    // Group by date
    const byDate = {};
    filtered.forEach(a => {
      const date = (a.week || a.createdAt || '').split('T')[0];
      if (!byDate[date]) byDate[date] = { count: 0, units: 0 };
      byDate[date].count++;
      byDate[date].units += (a.hours || a.units || 0);
    });

    // Fill missing dates
    const trend = [];
    const current = new Date(cutoff);
    const today = new Date();
    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0];
      trend.push({
        date: dateStr,
        count: byDate[dateStr]?.count || 0,
        units: byDate[dateStr]?.units || 0
      });
      current.setDate(current.getDate() + 1);
    }

    res.json({ success: true, trend, period: `${days}d` });
  } catch (error) {
    console.error('Activity trends error:', error);
    res.status(500).json({ error: 'Failed to fetch activity trends' });
  }
});

// GET /api/analytics/audit-log — admin audit log viewer
router.get('/audit-log', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { entityType, actorEmail, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    if (!HAS_SUPABASE) {
      return res.json({ success: true, logs: [], total: 0 });
    }

    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (entityType) query = query.eq('entity_type', entityType);
    if (actorEmail) query = query.eq('actor_email', actorEmail);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data, error, count } = await query;

    if (error) {
      // Table might not exist yet
      console.error('Audit log query error:', error);
      return res.json({ success: true, logs: [], total: 0 });
    }

    res.json({
      success: true,
      logs: data || [],
      total: count || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

module.exports = router;
