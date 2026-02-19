/**
 * Supabase Adapter - Maps between app data structure and existing Supabase schema
 *
 * App Structure (camelCase):
 * - email, name, department, activityType, description, hours, week, status
 *
 * Supabase Structure (snake_case with UUIDs):
 * - employee_id (uuid), activity_type_id (uuid), department_id (uuid)
 * - report_date, description, units_completed, percentage_complete
 */

class SupabaseAdapter {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.employeeCache = new Map();
    this.activityTypeCache = new Map();
    this.departmentCache = new Map();
  }

  // ==================== LOOKUP HELPERS ====================

  async getEmployeeByEmail(email) {
    if (this.employeeCache.has(email)) {
      return this.employeeCache.get(email);
    }

    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching employee:', error);
      return null;
    }

    this.employeeCache.set(email, data);
    return data;
  }

  async getEmployeeById(id) {
    const { data, error } = await this.supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching employee by id:', error);
      return null;
    }

    if (data && data.email) {
      this.employeeCache.set(data.email, data);
    }
    return data;
  }

  async getActivityTypeByName(name) {
    if (this.activityTypeCache.has(name)) {
      return this.activityTypeCache.get(name);
    }

    const { data, error } = await this.supabase
      .from('activity_types')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching activity type:', error);
      return null;
    }

    this.activityTypeCache.set(name, data);
    return data;
  }

  async getActivityTypeById(id) {
    const { data, error } = await this.supabase
      .from('activity_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching activity type by id:', error);
      return null;
    }

    if (data && data.name) {
      this.activityTypeCache.set(data.name, data);
    }
    return data;
  }

  async getDepartmentByName(name) {
    if (this.departmentCache.has(name)) {
      return this.departmentCache.get(name);
    }

    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      return null;
    }

    this.departmentCache.set(name, data);
    return data;
  }

  async getDepartmentById(id) {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching department by id:', error);
      return null;
    }

    if (data && data.name) {
      this.departmentCache.set(data.name, data);
    }
    return data;
  }

  // ==================== DATA TRANSFORMATION ====================

  /**
   * Convert app activity data to Supabase schema
   * @param {Object} appData - Activity data from the app
   * @returns {Object} Supabase-formatted data
   */
  async toSupabaseActivity(appData) {
    const employee = await this.getEmployeeByEmail(appData.email);
    // Activity type lookup is optional — free-text entries may not match an existing type
    const activityType = appData.activityType ? await this.getActivityTypeByName(appData.activityType) : null;
    const department = appData.department ? await this.getDepartmentByName(appData.department) : null;

    // Calculate week ending date from week string (format: YYYY-MM-DD)
    const weekEnding = appData.week ? new Date(appData.week) : new Date();

    // Calculate week number and year
    const weekNumber = this.getWeekNumber(weekEnding);
    const year = weekEnding.getFullYear();

    const supabaseData = {
      employee_id: employee?.id || null,
      employee_name: employee?.full_name || employee?.name || null,
      activity_type_id: activityType?.id || null, // null if free-text doesn't match existing type
      activity_type_text: appData.activityType || null, // store raw free-text activity type
      department_id: department?.id || null,
      report_date: appData.week || new Date().toISOString().split('T')[0],
      description: appData.description || '',
      units_completed: appData.hours ? Math.round(parseFloat(appData.hours)) : null,
      percentage_complete: appData.percentageComplete ? Math.round(parseFloat(appData.percentageComplete)) : null,
      status: appData.status || 'submitted',
      week_number: weekNumber,
      year: year,
      week_ending: appData.week || new Date().toISOString().split('T')[0],
    };

    // Add timestamps
    if (appData.id) {
      // Update operation
      supabaseData.updated_at = new Date().toISOString();
    } else {
      // Create operation
      supabaseData.created_at = new Date().toISOString();
      supabaseData.updated_at = new Date().toISOString();
      supabaseData.submitted_at = appData.status === 'submitted' ? new Date().toISOString() : null;
    }

    if (appData.reviewedBy) {
      supabaseData.reviewed_at = new Date().toISOString();
    }

    return supabaseData;
  }

  /**
   * Convert Supabase activity to app format
   * @param {Object} supabaseData - Activity data from Supabase
   * @returns {Object} App-formatted data
   */
  async toAppActivity(supabaseData) {
    if (!supabaseData) return null;

    // Fetch related data
    const employee = supabaseData.employee_id ? await this.getEmployeeById(supabaseData.employee_id) : null;
    const activityType = supabaseData.activity_type_id ? await this.getActivityTypeById(supabaseData.activity_type_id) : null;
    const department = supabaseData.department_id ? await this.getDepartmentById(supabaseData.department_id) : null;

    return {
      id: supabaseData.id,
      email: employee?.email || '',
      name: supabaseData.employee_name || employee?.full_name || employee?.name || '',
      department: department?.name || '',
      activityType: activityType?.name || supabaseData.activity_type_text || '',
      description: supabaseData.description || '',
      hours: supabaseData.units_completed || 0,
      percentageComplete: supabaseData.percentage_complete || null,
      week: supabaseData.week_ending || supabaseData.report_date,
      status: supabaseData.status || 'submitted',
      feedback: supabaseData.feedback || '',
      reviewedBy: supabaseData.reviewed_by || null,
      reviewedAt: supabaseData.reviewed_at || null,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at,
      submittedAt: supabaseData.submitted_at
    };
  }

  /**
   * Convert multiple Supabase activities to app format
   */
  async toAppActivities(supabaseDataArray) {
    if (!supabaseDataArray || !Array.isArray(supabaseDataArray)) return [];

    const promises = supabaseDataArray.map(item => this.toAppActivity(item));
    return await Promise.all(promises);
  }

  // ==================== UTILITY ====================

  /**
   * Get week number from date (weeks end on Friday)
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayOfWeek = d.getUTCDay(); // 0=Sun .. 6=Sat

    // Find this week's Friday (week-ending day)
    const daysToFriday = dayOfWeek === 6 ? 6 : (5 - dayOfWeek);
    const friday = new Date(d);
    friday.setUTCDate(d.getUTCDate() + daysToFriday);

    // Find the first Friday of the year
    const yearStart = new Date(Date.UTC(friday.getUTCFullYear(), 0, 1));
    const ysDay = yearStart.getUTCDay();
    const daysToFirstFriday = ysDay <= 5 ? (5 - ysDay) : 6;
    const firstFriday = new Date(yearStart);
    firstFriday.setUTCDate(1 + daysToFirstFriday);

    return Math.floor((friday - firstFriday) / (7 * 86400000)) + 1;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.employeeCache.clear();
    this.activityTypeCache.clear();
    this.departmentCache.clear();
  }
}

module.exports = SupabaseAdapter;
