const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Check if Supabase is configured
const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;

let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// Get activity types for a specific department
router.get('/activity-types', requireAuth, async (req, res) => {
  try {
    const { department } = req.query;

    if (HAS_SUPABASE) {
      if (department) {
        // Get activity types filtered by department
        const { data, error } = await supabase
          .from('activity_type_departments')
          .select(`
            activity_types (
              id,
              name,
              category,
              is_consultant_only,
              is_mandatory,
              display_order,
              is_active
            ),
            departments!inner (
              name
            )
          `)
          .eq('departments.name', department)
          .eq('activity_types.is_active', true);

        if (error) {
          console.error('Error fetching filtered activity types:', error);
          return res.status(500).json({ error: 'Failed to fetch activity types' });
        }

        const activityTypes = data
          .map(item => item.activity_types)
          .filter(at => at !== null)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

        return res.json({
          success: true,
          activityTypes: activityTypes.map(at => ({
            id: at.id,
            name: at.name,
            category: at.category,
            isConsultantOnly: at.is_consultant_only,
            isMandatory: at.is_mandatory,
            displayOrder: at.display_order
          }))
        });
      }

      // Get all activity types (no filter)
      const { data, error } = await supabase
        .from('activity_types')
        .select('id, name, category, is_consultant_only, is_mandatory, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching activity types:', error);
        return res.status(500).json({ error: 'Failed to fetch activity types' });
      }

      return res.json({
        success: true,
        activityTypes: data.map(at => ({
          id: at.id,
          name: at.name,
          category: at.category,
          isConsultantOnly: at.is_consultant_only,
          isMandatory: at.is_mandatory,
          displayOrder: at.display_order
        }))
      });
    }

    // Fallback for non-Supabase mode
    const defaultActivityTypes = [
      { name: 'Consulting', category: null },
      { name: 'Training', category: null },
      { name: 'Research', category: null },
      { name: 'Meeting', category: null },
      { name: 'Administrative', category: null }
    ];

    res.json({ success: true, activityTypes: defaultActivityTypes });

  } catch (error) {
    console.error('Activity types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all departments
router.get('/departments', requireAuth, async (req, res) => {
  try {
    if (HAS_SUPABASE) {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching departments:', error);
        return res.status(500).json({ error: 'Failed to fetch departments' });
      }

      return res.json({
        success: true,
        departments: data.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description
        }))
      });
    }

    // Fallback for non-Supabase mode
    const defaultDepartments = [
      { name: 'Consultants' },
      { name: 'Operations' },
      { name: 'Finance' },
      { name: 'Management' },
      { name: 'Website & Digital Marketing' },
      { name: 'Business Development & Relationship Management' }
    ];

    res.json({ success: true, departments: defaultDepartments });

  } catch (error) {
    console.error('Departments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get metadata (both activity types and departments in one call)
router.get('/all', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;

    if (HAS_SUPABASE) {
      let departmentsResult;

      if (email) {
        // First get employee ID
        const { data: employeeData, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('email', email)
          .single();

        if (!empError && employeeData) {
          // Get their departments ordered by is_primary DESC (true first)
          departmentsResult = await supabase
            .from('employee_departments')
            .select(`
              departments!inner (
                id,
                name,
                description,
                is_active
              ),
              is_primary
            `)
            .eq('employee_id', employeeData.id)
            .eq('departments.is_active', true)
            .order('is_primary', { ascending: false });
        } else {
          departmentsResult = { data: [], error: empError };
        }
      } else {
        // Get all departments if no email provided
        departmentsResult = await supabase
          .from('departments')
          .select('id, name, description, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true });
      }

      const activityTypesResult = await supabase
        .from('activity_types')
        .select('id, name, category, is_consultant_only, is_mandatory, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (activityTypesResult.error || departmentsResult.error) {
        console.error('Error fetching metadata:', activityTypesResult.error || departmentsResult.error);
        return res.status(500).json({ error: 'Failed to fetch metadata' });
      }

      // Extract departments from the result
      let departments;
      if (email && departmentsResult.data && departmentsResult.data[0]?.departments) {
        // Extract departments from employee_departments join
        // Sort by is_primary (true first) then by name
        departments = departmentsResult.data
          .filter(item => item.departments !== null)
          .sort((a, b) => {
            // Primary departments first
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            // Then sort by name
            return a.departments.name.localeCompare(b.departments.name);
          })
          .map(item => ({ ...item.departments, isPrimary: item.is_primary }));
      } else {
        // Use departments directly
        departments = (departmentsResult.data || []).map(d => ({ ...d, isPrimary: false }));
      }

      return res.json({
        success: true,
        activityTypes: activityTypesResult.data.map(at => ({
          id: at.id,
          name: at.name,
          category: at.category,
          isConsultantOnly: at.is_consultant_only,
          isMandatory: at.is_mandatory,
          displayOrder: at.display_order
        })),
        departments: departments.map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          isPrimary: d.isPrimary || false
        }))
      });
    }

    // Fallback for non-Supabase mode
    res.json({
      success: true,
      activityTypes: [
        { name: 'Consulting' },
        { name: 'Training' },
        { name: 'Research' },
        { name: 'Meeting' },
        { name: 'Administrative' }
      ],
      departments: [
        { name: 'Consultants' },
        { name: 'Operations' },
        { name: 'Finance' },
        { name: 'Management' }
      ]
    });

  } catch (error) {
    console.error('Metadata error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
