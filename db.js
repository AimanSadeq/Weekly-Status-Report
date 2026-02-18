const fs = require('fs').promises;
const path = require('path');

/**
 * VIF Activity Tracker - Hybrid Database Model
 * Works locally (JSON files) AND on Replit (Replit DB)
 * Automatically detects environment and uses appropriate storage
 */

// Detect if running on Replit
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

// Initialize the appropriate storage
const storage = IS_REPLIT ? new ReplitStorage() : new LocalStorage();

console.log(`📦 Database Mode: ${IS_REPLIT ? 'Replit DB' : 'Local File Storage'}`);

class DBModel {
  
  // ==================== USERS ====================
  
  async getUser(email) {
    const user = await storage.get(`user:${email}`);
    return user ? JSON.parse(user) : null;
  }

  async createUser(userData) {
    const key = `user:${userData.email}`;
    await storage.set(key, JSON.stringify(userData));
    return userData;
  }

  async updateUser(email, updates) {
    const user = await this.getUser(email);
    if (!user) return null;
    
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    await storage.set(`user:${email}`, JSON.stringify(updated));
    return updated;
  }

  async getAllUsers() {
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
    const activity = await storage.get(`activity:${id}`);
    return activity ? JSON.parse(activity) : null;
  }

  async createActivity(activityData) {
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
    const activity = await this.getActivity(id);
    if (!activity) return false;
    
    await storage.delete(`activity:${id}`);
    await this.removeActivityFromUser(activity.email, id);
    return true;
  }

  async getAllActivities() {
    const keys = await storage.list('activity:');
    const activities = [];
    for (const key of keys) {
      const activity = await storage.get(key);
      activities.push(JSON.parse(activity));
    }
    return activities;
  }

  async getActivitiesByUser(email) {
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

  async getActivitiesByWeek(weekEnding) {
    const allActivities = await this.getAllActivities();
    return allActivities.filter(a => a.week === weekEnding);
  }

  async getActivitiesByStatus(status) {
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
