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

// ==================== ACTIVITY TYPE MANAGEMENT ====================

// Get all activity types (with optional stats and filters)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { includeStats, includeInactive, category } = req.query;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Build query
    let query = supabase
      .from('activity_types')
      .select('*')
      .order('display_order', { ascending: true });

    // Filter active/inactive
    if (!includeInactive || includeInactive === 'false') {
      query = query.eq('is_active', true);
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category);
    }

    const { data: activityTypes, error } = await query;

    if (error) {
      console.error('Error fetching activity types:', error);
      return res.status(500).json({ error: 'Failed to fetch activity types' });
    }

    // Always include department associations
    const activityTypesWithDepts = await Promise.all(
      activityTypes.map(async (type) => {
        const { data: deptLinks } = await supabase
          .from('activity_type_departments')
          .select(`
            department_id,
            departments!inner(id, name)
          `)
          .eq('activity_type_id', type.id);

        const departments = deptLinks?.map(link => ({
          id: link.departments.id,
          name: link.departments.name
        })) || [];

        return {
          ...type,
          departments
        };
      })
    );

    // If stats requested, get usage metrics
    if (includeStats === 'true') {
      const activityTypesWithStats = await Promise.all(
        activityTypesWithDepts.map(async (type) => {
          // Get usage count for this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const { count: usageCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('activity_type_id', type.id)
            .gte('report_date', startOfMonth.toISOString());

          // Get total hours
          const { data: activities } = await supabase
            .from('activities')
            .select('units_completed')
            .eq('activity_type_id', type.id)
            .gte('report_date', startOfMonth.toISOString());

          const totalHours = activities?.reduce((sum, a) => sum + (a.units_completed || 0), 0) || 0;

          return {
            ...type,
            stats: {
              usageCount: usageCount || 0,
              totalHours: Math.round(totalHours * 10) / 10,
              departmentCount: type.departments?.length || 0
            }
          };
        })
      );

      return res.json({ success: true, activityTypes: activityTypesWithStats });
    }

    res.json({ success: true, activityTypes: activityTypesWithDepts });

  } catch (error) {
    console.error('Get activity types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single activity type by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { data: activityType, error } = await supabase
      .from('activity_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching activity type:', error);
      return res.status(404).json({ error: 'Activity type not found' });
    }

    // Get associated departments
    const { data: deptLinks } = await supabase
      .from('activity_type_departments')
      .select(`
        departments (
          id,
          name
        )
      `)
      .eq('activity_type_id', id);

    activityType.departments = deptLinks?.map(d => d.departments).filter(Boolean) || [];

    res.json({ success: true, activityType });

  } catch (error) {
    console.error('Get activity type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new activity type
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      category,
      isConsultantOnly,
      isMandatory,
      displayOrder,
      departmentIds
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Activity type name is required' });
    }

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Check if activity type with same name exists
    const { data: existing } = await supabase
      .from('activity_types')
      .select('id')
      .eq('name', name)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Activity type with this name already exists' });
    }

    // If no displayOrder provided, get the max + 1
    let order = displayOrder;
    if (!order) {
      const { data: maxOrderData } = await supabase
        .from('activity_types')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      order = (maxOrderData?.display_order || 0) + 1;
    }

    // Create activity type
    const { data: activityType, error } = await supabase
      .from('activity_types')
      .insert([{
        name,
        category: category || null,
        is_consultant_only: isConsultantOnly || false,
        is_mandatory: isMandatory || false,
        display_order: order,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating activity type:', error);
      return res.status(500).json({ error: 'Failed to create activity type' });
    }

    // Associate with departments if provided
    if (departmentIds && departmentIds.length > 0) {
      const deptLinks = departmentIds.map(deptId => ({
        activity_type_id: activityType.id,
        department_id: deptId
      }));

      const { error: linkError } = await supabase
        .from('activity_type_departments')
        .insert(deptLinks);

      if (linkError) {
        console.error('Error linking departments:', linkError);
        // Don't fail the request, just log the error
      }
    }

    res.status(201).json({
      success: true,
      message: 'Activity type created successfully',
      activityType
    });

  } catch (error) {
    console.error('Create activity type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update activity type
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      isConsultantOnly,
      isMandatory,
      displayOrder,
      isActive,
      departmentIds
    } = req.body;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Build update object
    const updates = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (isConsultantOnly !== undefined) updates.is_consultant_only = isConsultantOnly;
    if (isMandatory !== undefined) updates.is_mandatory = isMandatory;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    if (isActive !== undefined) updates.is_active = isActive;

    const { data: activityType, error } = await supabase
      .from('activity_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating activity type:', error);
      return res.status(500).json({ error: 'Failed to update activity type' });
    }

    // Update department associations if provided
    if (departmentIds !== undefined) {
      // Delete existing associations
      await supabase
        .from('activity_type_departments')
        .delete()
        .eq('activity_type_id', id);

      // Add new associations
      if (departmentIds.length > 0) {
        const deptLinks = departmentIds.map(deptId => ({
          activity_type_id: id,
          department_id: deptId
        }));

        await supabase
          .from('activity_type_departments')
          .insert(deptLinks);
      }
    }

    res.json({
      success: true,
      message: 'Activity type updated successfully',
      activityType
    });

  } catch (error) {
    console.error('Update activity type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete activity type (soft delete - set is_active to false)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete } = req.query;

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Check if activity type has activities
    const { count: activityCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type_id', id);

    if (activityCount > 0 && hardDelete !== 'true') {
      // Soft delete if has activities
      const { error } = await supabase
        .from('activity_types')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating activity type:', error);
        return res.status(500).json({ error: 'Failed to deactivate activity type' });
      }

      return res.json({
        success: true,
        message: 'Activity type deactivated successfully (has existing activities)'
      });
    }

    // Delete department associations first
    await supabase
      .from('activity_type_departments')
      .delete()
      .eq('activity_type_id', id);

    // Hard delete if no activities or explicitly requested
    const { error } = await supabase
      .from('activity_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting activity type:', error);
      return res.status(500).json({ error: 'Failed to delete activity type' });
    }

    res.json({
      success: true,
      message: 'Activity type deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity type analytics
router.get('/:id/analytics', requireAuth, async (req, res) => {
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
        departments (name)
      `)
      .eq('activity_type_id', id)
      .gte('report_date', start.toISOString())
      .lte('report_date', end.toISOString());

    if (error) {
      console.error('Error fetching activity type analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }

    // Calculate metrics
    const totalUsage = activities.length;
    const totalHours = activities.reduce((sum, a) => sum + (a.units_completed || 0), 0);
    const avgHoursPerUsage = totalUsage > 0 ? totalHours / totalUsage : 0;

    // Department breakdown
    const departmentBreakdown = activities.reduce((acc, a) => {
      const deptName = a.departments?.name || 'Unknown';
      if (!acc[deptName]) {
        acc[deptName] = { count: 0, hours: 0 };
      }
      acc[deptName].count++;
      acc[deptName].hours += a.units_completed || 0;
      return acc;
    }, {});

    // Employee usage
    const employeeUsage = activities.reduce((acc, a) => {
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

    // Top users
    const topUsers = Object.entries(employeeUsage)
      .sort((a, b) => b[1].hours - a[1].hours)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));

    // Daily trend (group by date)
    const dailyTrend = activities.reduce((acc, a) => {
      const date = new Date(a.report_date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, hours: 0 };
      }
      acc[date].count++;
      acc[date].hours += a.units_completed || 0;
      return acc;
    }, {});

    res.json({
      success: true,
      analytics: {
        dateRange: { start: start.toISOString(), end: end.toISOString() },
        summary: {
          totalUsage,
          totalHours: Math.round(totalHours * 10) / 10,
          avgHoursPerUsage: Math.round(avgHoursPerUsage * 10) / 10
        },
        departmentBreakdown,
        employeeUsage,
        topUsers,
        dailyTrend
      }
    });

  } catch (error) {
    console.error('Get activity type analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder activity types (batch update display_order)
router.post('/reorder', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }

    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Update display_order for each activity type
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('activity_types')
        .update({ display_order: index + 1 })
        .eq('id', id)
    );

    await Promise.all(updates);

    res.json({
      success: true,
      message: 'Activity types reordered successfully'
    });

  } catch (error) {
    console.error('Reorder activity types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
