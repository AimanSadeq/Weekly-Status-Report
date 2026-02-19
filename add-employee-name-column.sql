-- VIF Activity Tracker - Add employee_name column to activities table
-- This script adds a new column to store the employee name directly in the activities table

-- =====================================================
-- 1. ADD EMPLOYEE_NAME COLUMN
-- =====================================================

-- Add employee_name column to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS employee_name TEXT;

-- =====================================================
-- 2. POPULATE EXISTING RECORDS WITH EMPLOYEE NAMES
-- =====================================================

-- Update existing activities with employee names from the employees table
UPDATE activities a
SET employee_name = e.full_name
FROM employees e
WHERE a.employee_id = e.id
AND a.employee_name IS NULL;

-- =====================================================
-- 3. CREATE INDEX FOR BETTER QUERY PERFORMANCE
-- =====================================================

-- Create index on employee_name for faster searching
CREATE INDEX IF NOT EXISTS idx_activities_employee_name ON activities(employee_name);

-- =====================================================
-- 4. VERIFICATION QUERY
-- =====================================================

-- View sample activities with employee names
SELECT
  id,
  employee_name,
  employee_id,
  activity_type_id,
  department_id,
  report_date,
  units_completed,
  percentage_complete,
  description,
  created_at
FROM activities
ORDER BY created_at DESC
LIMIT 10;

-- Count activities with and without employee names
SELECT
  COUNT(*) FILTER (WHERE employee_name IS NOT NULL) as with_name,
  COUNT(*) FILTER (WHERE employee_name IS NULL) as without_name,
  COUNT(*) as total
FROM activities;

SELECT 'Employee name column added successfully!' as status;
