const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Check if Supabase is configured
const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;

let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// ==================== DEPARTMENT MANAGEMENT ====================

// Get all departments (with optional stats)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { includeStats, includeInactive } = req.query;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Build query
    let query = supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    // Filter active/inactive
    if (!includeInactive || includeInactive === 'false') {
      query = query.eq('is_active', true);
    }

    const { data: departments, error } = await query;

    if (error) {
      console.error('Error fetching departments:', error);
      return res.status(500).json({ error: 'Failed to fetch departments' });
    }

    // If stats requested, get employee count and activity metrics
    if (includeStats === 'true') {
      const departmentsWithStats = await Promise.all(
        departments.map(async (dept) => {
          // Get employee count
          const { count: employeeCount } = await supabase
            .from('employee_departments')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id);

          // Get activity count for this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { count: activityCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .gte('report_date', startOfMonth.toISOString());

          // Get total hours this month
          const { data: activities } = await supabase
            .from('activities')
            .select('units_completed')
            .eq('department_id', dept.id)
            .gte('report_date', startOfMonth.toISOString());

          const totalHours = activities?.reduce((sum, a) => sum + (a.units_completed || 0), 0) || 0;

          return {
            ...dept,
            stats: {
              employeeCount: employeeCount || 0,
              activityCount: activityCount || 0,
              totalHours: Math.round(totalHours * 10) / 10
            }
          };
        })
      );

      return res.json({ success: true, departments: departmentsWithStats });
    }

    res.json({ success: true, departments });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single department by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: department, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      return res.status(404).json({ error: 'Department not found' });
    }

    // Get department head info if exists
    if (department.head_employee_id) {
      const { data: head } = await supabase
        .from('employees')
        .select('id, name, email')
        .eq('id', department.head_employee_id)
        .single();

      department.head = head;
    }

    // Get employee count
    const { count: employeeCount } = await supabase
      .from('employee_departments')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);

    department.employeeCount = employeeCount || 0;

    res.json({ success: true, department });

  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new department
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Check if department with same name exists
    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .ilike('name', name);

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Department with this name already exists' });
    }

    // Create department - only use fields that exist in the table
    const { data: department, error } = await supabase
      .from('departments')
      .insert([{
        name,
        description: description || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      return res.status(500).json({ error: 'Failed to create department', details: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update department
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Build update object - only use fields that exist in the table
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: department, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      return res.status(500).json({ error: 'Failed to update department', details: error.message });
    }

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      department
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete department (soft delete - set is_active to false)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Check if department has activities
    const { count: activityCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);

    if (activityCount > 0 && hardDelete !== 'true') {
      // Soft delete if has activities
      const { error } = await supabase
        .from('departments')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating department:', error);
        return res.status(500).json({ error: 'Failed to deactivate department' });
      }

      return res.json({
        success: true,
        message: 'Department deactivated successfully (has existing activities)'
      });
    }

    // Hard delete if no activities or explicitly requested
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      return res.status(500).json({ error: 'Failed to delete department' });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get department performance metrics
router.get('/:id/metrics', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Default to current month if no dates provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    // Get activities for date range
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        employees (name, email),
        activity_types (name, category)
      `)
      .eq('department_id', id)
      .gte('report_date', start.toISOString())
      .lte('report_date', end.toISOString());

    if (error) {
      console.error('Error fetching department metrics:', error);
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }

    // Calculate metrics
    const totalActivities = activities.length;
    const totalHours = activities.reduce((sum, a) => sum + (a.units_completed || 0), 0);
    const avgHoursPerActivity = totalActivities > 0 ? totalHours / totalActivities : 0;

    // Activity type breakdown
    const activityTypeBreakdown = activities.reduce((acc, a) => {
      const typeName = a.activity_types?.name || 'Unknown';
      if (!acc[typeName]) {
        acc[typeName] = { count: 0, hours: 0 };
      }
      acc[typeName].count++;
      acc[typeName].hours += a.units_completed || 0;
      return acc;
    }, {});

    // Employee performance
    const employeePerformance = activities.reduce((acc, a) => {
      const employeeName = a.employees?.name || 'Unknown';
      if (!acc[employeeName]) {
        acc[employeeName] = {
          count: 0,
          hours: 0,
          email: a.employees?.email
        };
      }
      acc[employeeName].count++;
      acc[employeeName].hours += a.units_completed || 0;
      return acc;
    }, {});

    // Top performers
    const topPerformers = Object.entries(employeePerformance)
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    res.json({
      success: true,
      metrics: {
        dateRange: { start: start.toISOString(), end: end.toISOString() },
        summary: {
          totalActivities,
          totalHours: Math.round(totalHours * 10) / 10,
          avgHoursPerActivity: Math.round(avgHoursPerActivity * 10) / 10
        },
        activityTypeBreakdown,
        employeePerformance,
        topPerformers
      }
    });

  } catch (error) {
    console.error('Get department metrics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get department employees
router.get('/:id/employees', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: employeeDepts, error } = await supabase
      .from('employee_departments')
      .select(`
        is_primary,
        employees (
          id,
          name,
          email,
          role
        )
      `)
      .eq('department_id', id)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching department employees:', error);
      return res.status(500).json({ error: 'Failed to fetch employees' });
    }

    const employees = employeeDepts.map(ed => ({
      ...ed.employees,
      isPrimary: ed.is_primary
    }));

    res.json({ success: true, employees });

  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
