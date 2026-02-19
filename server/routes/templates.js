const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// GET /api/templates — user's templates + shared templates
router.get('/', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true, templates: [] });
    }

    const email = req.user.email;

    // Get employee ID
    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email)
      .single();

    if (!emp) {
      return res.json({ success: true, templates: [] });
    }

    // Get user's templates + shared templates
    const { data, error } = await supabase
      .from('activity_templates')
      .select('*')
      .or(`employee_id.eq.${emp.id},is_shared.eq.true`)
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Templates query error:', error);
      return res.json({ success: true, templates: [] });
    }

    res.json({ success: true, templates: data || [] });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST /api/templates — create template
router.post('/', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { name, departmentName, activityTypeText, description, unitsCompleted, isShared } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    // Get employee ID
    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('email', req.user.email)
      .single();

    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { data, error } = await supabase
      .from('activity_templates')
      .insert([{
        employee_id: emp.id,
        name,
        department_name: departmentName || null,
        activity_type_text: activityTypeText || null,
        description: description || null,
        units_completed: unitsCompleted || null,
        is_shared: isShared || false,
        usage_count: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Create template error:', error);
      return res.status(500).json({ error: 'Failed to create template' });
    }

    res.status(201).json({ success: true, template: data });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /api/templates/:id — update template (owner only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const { name, departmentName, activityTypeText, description, unitsCompleted, isShared } = req.body;

    // Get employee ID
    const { data: emp } = await supabase
      .from('employees')
      .select('id')
      .eq('email', req.user.email)
      .single();

    // Verify ownership
    const { data: template } = await supabase
      .from('activity_templates')
      .select('employee_id')
      .eq('id', id)
      .single();

    if (!template || template.employee_id !== emp?.id) {
      return res.status(403).json({ error: 'Not authorized to edit this template' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (departmentName !== undefined) updates.department_name = departmentName;
    if (activityTypeText !== undefined) updates.activity_type_text = activityTypeText;
    if (description !== undefined) updates.description = description;
    if (unitsCompleted !== undefined) updates.units_completed = unitsCompleted;
    if (isShared !== undefined) updates.is_shared = isShared;

    const { data, error } = await supabase
      .from('activity_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update template error:', error);
      return res.status(500).json({ error: 'Failed to update template' });
    }

    res.json({ success: true, template: data });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id — delete (owner or admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      // Get employee ID
      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('email', req.user.email)
        .single();

      // Verify ownership
      const { data: template } = await supabase
        .from('activity_templates')
        .select('employee_id')
        .eq('id', id)
        .single();

      if (!template || template.employee_id !== emp?.id) {
        return res.status(403).json({ error: 'Not authorized to delete this template' });
      }
    }

    const { error } = await supabase
      .from('activity_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete template error:', error);
      return res.status(500).json({ error: 'Failed to delete template' });
    }

    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// POST /api/templates/:id/use — increment usage count
router.post('/:id/use', requireAuth, async (req, res) => {
  try {
    if (!HAS_SUPABASE) {
      return res.json({ success: true });
    }

    const { data: template } = await supabase
      .from('activity_templates')
      .select('usage_count')
      .eq('id', req.params.id)
      .single();

    if (template) {
      await supabase
        .from('activity_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', req.params.id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Use template error:', error);
    res.json({ success: true }); // Don't fail on counter update
  }
});

module.exports = router;
