const fs = require('fs').promises;
const path = require('path');

/**
 * VIF Activity Tracker - Hybrid Database Model
 * Works with: Local JSON files, Replit DB, or Supabase
 * Automatically detects environment and uses appropriate storage
 */

// Detect storage mode
const HAS_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_KEY;
const IS_REPLIT = process.env.REPL_ID || process.env.REPLIT_DB_URL;

// Storage adapter interface
class StorageAdapter {
  async get(key) {}
  async set(key, value) {}
  async list(prefix) {}
  async delete(key) {}
}

// Local file-based storage (for local development)
class LocalStorage extends StorageAdapter {
  constructor() {
    super();
    this.dataDir = path.join(__dirname, '../../.local-data');
    this.initDir();
  }

  async initDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (err) {
      // Directory already exists
    }
  }

  getFilePath(key) {
    // Sanitize key for filename
    const sanitized = key.replace(/[^a-zA-Z0-9@._-]/g, '_');
    return path.join(this.dataDir, `${sanitized}.json`);
  }

  async get(key) {
    try {
      const data = await fs.readFile(this.getFilePath(key), 'utf-8');
      return data;
    } catch (err) {
      return null;
    }
  }

  async set(key, value) {
    await this.initDir();
    await fs.writeFile(this.getFilePath(key), value, 'utf-8');
  }

  async list(prefix) {
    try {
      await this.initDir();
      const files = await fs.readdir(this.dataDir);
      const sanitizedPrefix = prefix.replace(/[^a-zA-Z0-9@._-]/g, '_');
      return files
        .filter(f => f.startsWith(sanitizedPrefix))
        .map(f => f.replace('.json', '').replace(/_/g, ':'));
    } catch (err) {
      return [];
    }
  }

  async delete(key) {
    try {
      await fs.unlink(this.getFilePath(key));
    } catch (err) {
      // File doesn't exist, ignore
    }
  }

  async clearAll() {
    try {
      const files = await fs.readdir(this.dataDir);
      for (const file of files) {
        await fs.unlink(path.join(this.dataDir, file));
      }
    } catch (err) {
      // Directory doesn't exist, ignore
    }
  }
}

// Replit Database storage (for Replit environment)
class ReplitStorage extends StorageAdapter {
  constructor() {
    super();
    const Database = require('@replit/database');
    this.db = new Database();
  }

  async get(key) {
    return await this.db.get(key);
  }

  async set(key, value) {
    await this.db.set(key, value);
  }

  async list(prefix) {
    return await this.db.list(prefix);
  }

  async delete(key) {
    await this.db.delete(key);
  }

  async clearAll() {
    const keys = await this.db.list();
    for (const key of keys) {
      await this.db.delete(key);
    }
  }
}

// Supabase storage (for production with PostgreSQL)
class SupabaseStorage extends StorageAdapter {
  constructor() {
    super();
    const { createClient } = require('@supabase/supabase-js');
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // Initialize adapter for data transformation
    const SupabaseAdapter = require('./supabase-adapter');
    this.adapter = new SupabaseAdapter(this.supabase);

    console.log('✅ Supabase client initialized');
  }

  async get(key) {
    // Not used in Supabase mode - using direct table access instead
    return null;
  }

  async set(key, value) {
    // Not used in Supabase mode - using direct table access instead
  }

  async list(prefix) {
    // Not used in Supabase mode - using direct table access instead
    return [];
  }

  async delete(key) {
    // Not used in Supabase mode - using direct table access instead
  }

  async clearAll() {
    // Not used in Supabase mode
  }
}

// Initialize the appropriate storage
let storage;
let STORAGE_MODE;

if (HAS_SUPABASE) {
  storage = new SupabaseStorage();
  STORAGE_MODE = 'Supabase (PostgreSQL)';
} else if (IS_REPLIT) {
  storage = new ReplitStorage();
  STORAGE_MODE = 'Replit DB';
} else {
  storage = new LocalStorage();
  STORAGE_MODE = 'Local File Storage';
}

console.log(`📦 Database Mode: ${STORAGE_MODE}`);

class DBModel {

  // Helper: Convert camelCase to snake_case for Supabase
  toSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const snakeObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      snakeObj[snakeKey] = value;
    }
    return snakeObj;
  }

  // Helper: Convert snake_case to camelCase for app compatibility
  toCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const camelObj = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = value;
    }
    return camelObj;
  }

  // ==================== USERS ====================

  async getUser(email) {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error);
        return null;
      }

      if (!data) return null;

      // Map to app user format
      return {
        email: data.email,
        name: data.full_name || data.name,
        role: data.is_admin ? 'admin' : 'employee',
        visibilityScope: data.visibility_scope || 'self',
        departments: [],
        id: data.id
      };
    }

    const user = await storage.get(`user:${email}`);
    return user ? JSON.parse(user) : null;
  }

  async createUser(userData) {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }
      return data;
    }

    const key = `user:${userData.email}`;
    await storage.set(key, JSON.stringify(userData));
    return userData;
  }

  async updateUser(email, updates) {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }
      return data;
    }

    const user = await this.getUser(email);
    if (!user) return null;

    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    await storage.set(`user:${email}`, JSON.stringify(updated));
    return updated;
  }

  async getAllUsers() {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return data || [];
    }

    const keys = await storage.list('user:');
    const users = [];
    for (const key of keys) {
      const user = await storage.get(key);
      users.push(JSON.parse(user));
    }
    return users;
  }

  // ==================== ACTIVITIES ====================

  async getActivity(id) {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching activity:', error);
        return null;
      }
      return await storage.adapter.toAppActivity(data);
    }

    const activity = await storage.get(`activity:${id}`);
    return activity ? JSON.parse(activity) : null;
  }

  async createActivity(activityData) {
    if (HAS_SUPABASE) {
      // Convert app data to Supabase schema using adapter
      const supabaseData = await storage.adapter.toSupabaseActivity(activityData);

      const { data: inserted, error } = await storage.supabase
        .from('activities')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        return null;
      }

      // Convert back to app format
      return await storage.adapter.toAppActivity(inserted);
    }

    const key = `activity:${activityData.id}`;
    const data = {
      ...activityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await storage.set(key, JSON.stringify(data));

    // Add to user's activity list
    await this.addActivityToUser(activityData.email, activityData.id);

    return data;
  }

  async updateActivity(id, updates) {
    if (HAS_SUPABASE) {
      // Convert app updates to Supabase schema
      const supabaseUpdates = await storage.adapter.toSupabaseActivity(updates);
      supabaseUpdates.updated_at = new Date().toISOString();

      const { data, error } = await storage.supabase
        .from('activities')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity:', error);
        return null;
      }
      return await storage.adapter.toAppActivity(data);
    }

    const activity = await this.getActivity(id);
    if (!activity) return null;

    const updated = {
      ...activity,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await storage.set(`activity:${id}`, JSON.stringify(updated));
    return updated;
  }

  async deleteActivity(id) {
    if (HAS_SUPABASE) {
      const { error } = await storage.supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting activity:', error);
        return false;
      }
      return true;
    }

    const activity = await this.getActivity(id);
    if (!activity) return false;

    await storage.delete(`activity:${id}`);
    await this.removeActivityFromUser(activity.email, id);
    return true;
  }

  async getAllActivities() {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        return [];
      }
      return await storage.adapter.toAppActivities(data || []);
    }

    const keys = await storage.list('activity:');
    const activities = [];
    for (const key of keys) {
      const activity = await storage.get(key);
      activities.push(JSON.parse(activity));
    }
    return activities;
  }

  async getActivitiesByUser(email) {
    if (HAS_SUPABASE) {
      // First get the employee by email
      const employee = await storage.adapter.getEmployeeByEmail(email);
      if (!employee) {
        console.log('Employee not found for email:', email);
        return [];
      }

      const { data, error } = await storage.supabase
        .from('activities')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user activities:', error);
        return [];
      }
      return await storage.adapter.toAppActivities(data || []);
    }

    const userActivities = await storage.get(`user_activities:${email}`);
    if (!userActivities) return [];

    const activityIds = JSON.parse(userActivities);
    const activities = [];

    for (const id of activityIds) {
      const activity = await this.getActivity(id);
      if (activity) activities.push(activity);
    }

    return activities;
  }

  async getActivitiesByUserDepartments(email) {
    if (HAS_SUPABASE) {
      // Get the employee's department IDs via the employee_departments junction table
      const employee = await storage.adapter.getEmployeeByEmail(email);
      if (!employee) {
        console.log('Employee not found for email:', email);
        return [];
      }

      const { data: empDepts, error: deptError } = await storage.supabase
        .from('employee_departments')
        .select('department_id')
        .eq('employee_id', employee.id);

      if (deptError) {
        console.error('Error fetching employee departments:', deptError);
        return [];
      }

      if (!empDepts || empDepts.length === 0) {
        console.log('No departments found for employee:', email);
        return [];
      }

      const departmentIds = empDepts.map(ed => ed.department_id);

      const { data, error } = await storage.supabase
        .from('activities')
        .select('*')
        .in('department_id', departmentIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities by departments:', error);
        return [];
      }
      return await storage.adapter.toAppActivities(data || []);
    }

    // Fallback: return user's own activities for non-Supabase mode
    return await this.getActivitiesByUser(email);
  }

  async getActivitiesByWeek(weekEnding) {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('activities')
        .select('*')
        .eq('week_ending', weekEnding)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities by week:', error);
        return [];
      }
      return await storage.adapter.toAppActivities(data || []);
    }

    const allActivities = await this.getAllActivities();
    return allActivities.filter(a => a.week === weekEnding);
  }

  async getActivitiesByStatus(status) {
    if (HAS_SUPABASE) {
      const { data, error } = await storage.supabase
        .from('activities')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities by status:', error);
        return [];
      }
      return await storage.adapter.toAppActivities(data || []);
    }

    const allActivities = await this.getAllActivities();
    return allActivities.filter(a => a.status === status);
  }

  // Helper: Add activity to user's list
  async addActivityToUser(email, activityId) {
    const key = `user_activities:${email}`;
    const existing = await storage.get(key);
    const activityIds = existing ? JSON.parse(existing) : [];
    
    if (!activityIds.includes(activityId)) {
      activityIds.push(activityId);
      await storage.set(key, JSON.stringify(activityIds));
    }
  }

  // Helper: Remove activity from user's list
  async removeActivityFromUser(email, activityId) {
    const key = `user_activities:${email}`;
    const existing = await storage.get(key);
    if (!existing) return;
    
    const activityIds = JSON.parse(existing);
    const filtered = activityIds.filter(id => id !== activityId);
    await storage.set(key, JSON.stringify(filtered));
  }

  // ==================== EMAIL PREFERENCES ====================
  
  async getEmailPreferences(email) {
    const prefs = await storage.get(`email_prefs:${email}`);
    return prefs ? JSON.parse(prefs) : this.getDefaultEmailPreferences();
  }

  async updateEmailPreferences(email, preferences) {
    const key = `email_prefs:${email}`;
    await storage.set(key, JSON.stringify(preferences));
    return preferences;
  }

  getDefaultEmailPreferences() {
    return {
      deadlineReminders: true,
      submissionConfirmations: true,
      feedbackNotifications: true,
      weeklyDigests: true,
      adminAlerts: true,
      reminderDays: 2,
      digestDay: 'Monday'
    };
  }

  // ==================== UTILITY ====================
  
  async clearAll() {
    // WARNING: Only use for testing/development
    const keys = await storage.list();
    for (const key of keys) {
      await storage.delete(key);
    }
    return { message: 'All data cleared' };
  }

  async getStats() {
    const users = await this.getAllUsers();
    const activities = await this.getAllActivities();
    
    return {
      totalUsers: users.length,
      totalActivities: activities.length,
      submittedActivities: activities.filter(a => a.status === 'submitted').length,
      reviewedActivities: activities.filter(a => a.status === 'reviewed').length,
      draftActivities: activities.filter(a => a.status === 'draft').length
    };
  }
}

module.exports = new DBModel();
