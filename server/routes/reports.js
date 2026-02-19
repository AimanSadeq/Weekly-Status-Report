const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const db = require('../models/db');

// POST /api/reports/generate — custom report with filters
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, departments, activityTypes, employees, groupBy } = req.body;
    const isAdmin = req.user.role === 'admin';

    let allActivities;
    if (isAdmin) {
      allActivities = await db.getAllActivities();
    } else {
      allActivities = await db.getActivitiesByUser(req.user.email);
    }

    // Apply filters
    let filtered = allActivities;
    if (startDate) filtered = filtered.filter(a => (a.week || a.createdAt) >= startDate);
    if (endDate) filtered = filtered.filter(a => (a.week || a.createdAt) <= endDate);
    if (departments && departments.length) {
      filtered = filtered.filter(a => departments.includes(a.department));
    }
    if (activityTypes && activityTypes.length) {
      filtered = filtered.filter(a => activityTypes.includes(a.activityType || a.title));
    }
    if (employees && employees.length) {
      filtered = filtered.filter(a => employees.includes(a.email) || employees.includes(a.name));
    }

    // Group data
    const grouped = {};
    filtered.forEach(a => {
      let key;
      switch (groupBy) {
        case 'department': key = a.department || 'Unknown'; break;
        case 'employee': key = a.name || a.email || 'Unknown'; break;
        case 'type': key = a.activityType || a.title || 'Unknown'; break;
        case 'week': key = (a.week || a.createdAt || '').split('T')[0]; break;
        default: key = 'all';
      }
      if (!grouped[key]) grouped[key] = { items: [], totalUnits: 0, count: 0 };
      grouped[key].items.push(a);
      grouped[key].count++;
      grouped[key].totalUnits += (a.hours || a.units || 0);
    });

    res.json({
      success: true,
      report: {
        filters: { startDate, endDate, departments, activityTypes, employees, groupBy },
        totalActivities: filtered.length,
        totalUnits: filtered.reduce((sum, a) => sum + (a.hours || a.units || 0), 0),
        grouped,
        activities: filtered
      }
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/reports/standard/weekly — pre-built weekly summary
router.get('/standard/weekly', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';

    // Get this week's activities
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    const startDate = monday.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    let allActivities;
    if (isAdmin) {
      allActivities = await db.getAllActivities();
    } else {
      allActivities = await db.getActivitiesByUser(req.user.email);
    }

    const filtered = allActivities.filter(a => {
      const d = (a.week || a.createdAt || '').split('T')[0];
      return d >= startDate && d <= endDate;
    });

    // Summary
    const byDepartment = {};
    const byType = {};
    const byEmployee = {};

    filtered.forEach(a => {
      const dept = a.department || 'Unknown';
      const type = a.activityType || a.title || 'Other';
      const emp = a.name || a.email || 'Unknown';

      if (!byDepartment[dept]) byDepartment[dept] = { count: 0, units: 0 };
      byDepartment[dept].count++;
      byDepartment[dept].units += (a.hours || a.units || 0);

      if (!byType[type]) byType[type] = { count: 0, units: 0 };
      byType[type].count++;
      byType[type].units += (a.hours || a.units || 0);

      if (!byEmployee[emp]) byEmployee[emp] = { count: 0, units: 0 };
      byEmployee[emp].count++;
      byEmployee[emp].units += (a.hours || a.units || 0);
    });

    res.json({
      success: true,
      report: {
        period: { startDate, endDate },
        totalActivities: filtered.length,
        totalUnits: filtered.reduce((sum, a) => sum + (a.hours || a.units || 0), 0),
        byDepartment,
        byType,
        byEmployee
      }
    });
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// GET /api/reports/standard/monthly-department — admin department report
router.get('/standard/monthly-department', requireAuth, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDate = startOfMonth.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const allActivities = await db.getAllActivities();

    const filtered = allActivities.filter(a => {
      const d = (a.week || a.createdAt || '').split('T')[0];
      return d >= startDate && d <= endDate;
    });

    const byDepartment = {};
    filtered.forEach(a => {
      const dept = a.department || 'Unknown';
      if (!byDepartment[dept]) {
        byDepartment[dept] = { count: 0, units: 0, employees: new Set(), types: {} };
      }
      byDepartment[dept].count++;
      byDepartment[dept].units += (a.hours || a.units || 0);
      if (a.email) byDepartment[dept].employees.add(a.email);

      const type = a.activityType || 'Other';
      byDepartment[dept].types[type] = (byDepartment[dept].types[type] || 0) + 1;
    });

    // Convert Sets to counts
    const departments = Object.entries(byDepartment).map(([name, data]) => ({
      name,
      count: data.count,
      units: data.units,
      employeeCount: data.employees.size,
      topTypes: Object.entries(data.types)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type, count]) => ({ type, count }))
    }));

    res.json({
      success: true,
      report: {
        period: { startDate, endDate },
        totalActivities: filtered.length,
        totalUnits: filtered.reduce((sum, a) => sum + (a.hours || a.units || 0), 0),
        departments
      }
    });
  } catch (error) {
    console.error('Monthly department report error:', error);
    res.status(500).json({ error: 'Failed to generate department report' });
  }
});

module.exports = router;
