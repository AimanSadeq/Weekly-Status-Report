const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Check if Supabase is configured
const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;

let supabase;
if (HAS_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ==================== EMPLOYEE MANAGEMENT ====================

// GET /api/users/employees — list all employees with department associations
router.get('/employees', async (req, res) => {
  try {
    if (HAS_SUPABASE) {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).json({ error: 'Failed to fetch employees' });
      }

      // Get department associations for all employees
      const { data: empDepts, error: deptError } = await supabase
        .from('employee_departments')
        .select(`
          employee_id,
          is_primary,
          departments (
            id,
            name
          )
        `);

      if (deptError) {
        console.error('Error fetching employee departments:', deptError);
      }

      // Map departments to each employee
      const employeesWithDepts = employees.map(emp => {
        const depts = (empDepts || [])
          .filter(ed => ed.employee_id === emp.id && ed.departments)
          .map(ed => ({
            id: ed.departments.id,
            name: ed.departments.name,
            isPrimary: ed.is_primary
          }));

        return {
          id: emp.id,
          name: emp.full_name || emp.name,
          email: emp.email,
          role: emp.is_admin ? 'admin' : 'employee',
          visibilityScope: emp.visibility_scope || 'self',
          isActive: emp.is_active !== false,
          departments: depts,
          createdAt: emp.created_at
        };
      });

      return res.json({ success: true, employees: employeesWithDepts });
    }

    // Fallback for non-Supabase mode
    const users = await db.getAllUsers();
    res.json({ success: true, employees: users });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST /api/users/employees — create employee with department assignments
router.post('/employees', async (req, res) => {
  try {
    const { name, email, role, visibilityScope, departments: deptAssignments } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (HAS_SUPABASE) {
      // Create employee
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .insert([{
          full_name: name,
          email: email,
          is_admin: role === 'admin',
          visibility_scope: visibilityScope || 'self',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (empError) {
        console.error('Error creating employee:', empError);
        return res.status(500).json({ error: 'Failed to create employee', details: empError.message });
      }

      // Assign departments if provided
      if (deptAssignments && deptAssignments.length > 0) {
        const deptLinks = deptAssignments.map(d => ({
          employee_id: employee.id,
          department_id: d.id,
          is_primary: d.isPrimary || false
        }));

        const { error: linkError } = await supabase
          .from('employee_departments')
          .insert(deptLinks);

        if (linkError) {
          console.error('Error assigning departments:', linkError);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        employee: {
          id: employee.id,
          name: employee.full_name,
          email: employee.email,
          role: employee.is_admin ? 'admin' : 'employee'
        }
      });
    }

    // Fallback
    const user = await db.createUser({ name, email, role: role || 'employee' });
    res.status(201).json({ success: true, message: 'Employee created', employee: user });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// PUT /api/users/employees/:id — update employee and department links
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, visibilityScope, departments: deptAssignments } = req.body;

    if (HAS_SUPABASE) {
      // Update employee record
      const updates = { updated_at: new Date().toISOString() };
      if (name) updates.full_name = name;
      if (email) updates.email = email;
      if (role !== undefined) updates.is_admin = role === 'admin';
      if (visibilityScope !== undefined) updates.visibility_scope = visibilityScope;

      const { data: employee, error: empError } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (empError) {
        console.error('Error updating employee:', empError);
        return res.status(500).json({ error: 'Failed to update employee', details: empError.message });
      }

      // Update department assignments if provided
      if (deptAssignments) {
        // Remove existing assignments
        await supabase
          .from('employee_departments')
          .delete()
          .eq('employee_id', id);

        // Insert new assignments
        if (deptAssignments.length > 0) {
          const deptLinks = deptAssignments.map(d => ({
            employee_id: id,
            department_id: d.id,
            is_primary: d.isPrimary || false
          }));

          const { error: linkError } = await supabase
            .from('employee_departments')
            .insert(deptLinks);

          if (linkError) {
            console.error('Error reassigning departments:', linkError);
          }
        }
      }

      return res.json({
        success: true,
        message: 'Employee updated successfully',
        employee: {
          id: employee.id,
          name: employee.full_name,
          email: employee.email,
          role: employee.is_admin ? 'admin' : 'employee'
        }
      });
    }

    // Fallback
    if (email) {
      const user = await db.updateUser(email, { name, role });
      return res.json({ success: true, message: 'Employee updated', employee: user });
    }
    res.status(400).json({ error: 'Email required for non-Supabase mode' });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// DELETE /api/users/employees/:id — soft-delete employee
router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (HAS_SUPABASE) {
      // Soft-delete: set is_active to false
      const { data, error } = await supabase
        .from('employees')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deactivating employee:', error);
        return res.status(500).json({ error: 'Failed to deactivate employee' });
      }

      return res.json({
        success: true,
        message: 'Employee deactivated successfully'
      });
    }

    res.status(501).json({ error: 'Delete not supported in non-Supabase mode' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// ==================== EXISTING USER ROUTES ====================

// Get single user
router.get('/:email', async (req, res) => {
  try {
    const user = await db.getUser(req.params.email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user (admin only)
router.post('/', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    const user = await db.createUser(userData);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:email', async (req, res) => {
  try {
    const user = await db.updateUser(req.params.email, req.body);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user's email preferences
router.get('/:email/email-preferences', async (req, res) => {
  try {
    const preferences = await db.getEmailPreferences(req.params.email);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Get email preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user's email preferences
router.put('/:email/email-preferences', async (req, res) => {
  try {
    const preferences = await db.updateEmailPreferences(
      req.params.email,
      req.body
    );
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Update email preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;
