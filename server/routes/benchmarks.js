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

// GET /api/benchmarks/employee-comparison
router.get('/employee-comparison', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const employeeIds = req.query.employeeIds ? req.query.employeeIds.split(',') : [];

    const allActivities = await db.getAllActivities();

    let filtered = allActivities;
    if (startDate) filtered = filtered.filter(a => (a.week || a.createdAt) >= startDate);
    if (endDate) filtered = filtered.filter(a => (a.week || a.createdAt) <= endDate);

    // Group by employee
    const byEmployee = {};
    filtered.forEach(a => {
      const key = a.email || a.name || 'Unknown';
      if (employeeIds.length > 0 && !employeeIds.includes(key)) return;
      if (!byEmployee[key]) {
        byEmployee[key] = { name: a.name || key, email: a.email, count: 0, units: 0, types: {} };
      }
      byEmployee[key].count++;
      byEmployee[key].units += (a.hours || a.units || 0);
      const type = a.activityType || 'Other';
      byEmployee[key].types[type] = (byEmployee[key].types[type] || 0) + 1;
    });

    const comparison = Object.values(byEmployee)
      .sort((a, b) => b.units - a.units);

    res.json({ success: true, comparison });
  } catch (error) {
    console.error('Employee comparison error:', error);
    res.status(500).json({ error: 'Failed to compare employees' });
  }
});

// GET /api/benchmarks/department-comparison
router.get('/department-comparison', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const departmentIds = req.query.departmentIds ? req.query.departmentIds.split(',') : [];

    const allActivities = await db.getAllActivities();

    let filtered = allActivities;
    if (startDate) filtered = filtered.filter(a => (a.week || a.createdAt) >= startDate);
    if (endDate) filtered = filtered.filter(a => (a.week || a.createdAt) <= endDate);

    const byDept = {};
    filtered.forEach(a => {
      const dept = a.department || 'Unknown';
      if (departmentIds.length > 0 && !departmentIds.includes(dept)) return;
      if (!byDept[dept]) {
        byDept[dept] = { name: dept, count: 0, units: 0, employees: new Set(), types: {} };
      }
      byDept[dept].count++;
      byDept[dept].units += (a.hours || a.units || 0);
      if (a.email) byDept[dept].employees.add(a.email);
      const type = a.activityType || 'Other';
      byDept[dept].types[type] = (byDept[dept].types[type] || 0) + 1;
    });

    const comparison = Object.values(byDept)
      .map(d => ({ ...d, employeeCount: d.employees.size, employees: undefined }))
      .sort((a, b) => b.units - a.units);

    res.json({ success: true, comparison });
  } catch (error) {
    console.error('Department comparison error:', error);
    res.status(500).json({ error: 'Failed to compare departments' });
  }
});

// GET /api/benchmarks/period-comparison
router.get('/period-comparison', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { currentStart, currentEnd, previousStart, previousEnd } = req.query;

    const allActivities = await db.getAllActivities();

    const filterByRange = (acts, start, end) => {
      return acts.filter(a => {
        const d = a.week || a.createdAt;
        return d >= start && d <= end;
      });
    };

    const currentPeriod = filterByRange(allActivities, currentStart, currentEnd);
    const previousPeriod = filterByRange(allActivities, previousStart, previousEnd);

    const summarize = (acts) => {
      const employees = new Set(acts.map(a => a.email).filter(Boolean));
      return {
        totalActivities: acts.length,
        totalUnits: acts.reduce((sum, a) => sum + (a.hours || a.units || 0), 0),
        activeEmployees: employees.size,
        avgUnitsPerEmployee: employees.size > 0
          ? Math.round(acts.reduce((sum, a) => sum + (a.hours || a.units || 0), 0) / employees.size * 10) / 10
          : 0
      };
    };

    const current = summarize(currentPeriod);
    const previous = summarize(previousPeriod);

    // Calculate change percentages
    const change = {
      activities: previous.totalActivities > 0
        ? Math.round(((current.totalActivities - previous.totalActivities) / previous.totalActivities) * 100)
        : 0,
      units: previous.totalUnits > 0
        ? Math.round(((current.totalUnits - previous.totalUnits) / previous.totalUnits) * 100)
        : 0,
      employees: previous.activeEmployees > 0
        ? Math.round(((current.activeEmployees - previous.activeEmployees) / previous.activeEmployees) * 100)
        : 0
    };

    res.json({ success: true, current, previous, change });
  } catch (error) {
    console.error('Period comparison error:', error);
    res.status(500).json({ error: 'Failed to compare periods' });
  }
});

module.exports = router;
