-- Fix Row Level Security Policies for VIF Activity Tracker
-- Run this in your Supabase SQL Editor

-- =====================================================
-- ACTIVITIES TABLE - Allow all operations
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all for activities" ON activities;
DROP POLICY IF EXISTS "Enable read access for all users" ON activities;
DROP POLICY IF EXISTS "Enable insert for all users" ON activities;
DROP POLICY IF EXISTS "Enable update for all users" ON activities;
DROP POLICY IF EXISTS "Enable delete for all users" ON activities;

-- Create permissive policies for development
CREATE POLICY "Allow all operations on activities"
ON activities
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- EMPLOYEES TABLE - Allow all operations
-- =====================================================

DROP POLICY IF EXISTS "Allow all for employees" ON employees;
DROP POLICY IF EXISTS "Enable read access for all users" ON employees;

CREATE POLICY "Allow all operations on employees"
ON employees
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- ACTIVITY_TYPES TABLE - Allow all operations
-- =====================================================

DROP POLICY IF EXISTS "Allow all for activity_types" ON activity_types;
DROP POLICY IF EXISTS "Enable read access for all users" ON activity_types;

CREATE POLICY "Allow all operations on activity_types"
ON activity_types
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- DEPARTMENTS TABLE - Allow all operations
-- =====================================================

DROP POLICY IF EXISTS "Allow all for departments" ON departments;
DROP POLICY IF EXISTS "Enable read access for all users" ON departments;

CREATE POLICY "Allow all operations on departments"
ON departments
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- Verify RLS is enabled
-- =====================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- These policies are PERMISSIVE for development.
-- For production, you should:
-- 1. Implement proper authentication
-- 2. Restrict policies based on user roles
-- 3. Only allow users to see/edit their own data
-- =====================================================

SELECT 'RLS policies updated successfully!' as status;
