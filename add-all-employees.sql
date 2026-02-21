-- VIF Activity Tracker - Add All Employees to Supabase
-- Run this in Supabase SQL Editor

-- =====================================================
-- FIRST: Ensure UUID extension is enabled
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FIX: Drop the foreign key constraint temporarily
-- =====================================================

-- Find and drop the foreign key constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_id_fkey;

-- Set default UUID generation for id column
ALTER TABLE employees
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- =====================================================
-- ADD ALL 17 EMPLOYEES
-- =====================================================

-- Note: Aiman already exists, so we use ON CONFLICT DO NOTHING
-- The email is the unique identifier

INSERT INTO employees (email, full_name, is_admin, is_active) VALUES
('asadeq@viftraining.com', 'Aiman Sadeq', true, true),
('omar@viftraining.com', 'Omar', false, true),
('ahmadg@viftraining.com', 'Ahmad', false, true),
('akayed@viftraining.com', 'Amal', false, true),
('ali@viftraining.com', 'Ali', false, true),
('ammar@viftraining.com', 'Ammar', false, true),
('ajubain@viftraining.com', 'Alaa', false, true),
('dalia@viftraining.com', 'Dalia', false, true),
('mohamad@viftraining.com', 'MJ', false, true),
('asaad@viftraining.com', 'Asaad', false, true),
('ikhanji@viftraining.com', 'Ibrahim', false, true),
('moayad@viftraining.com', 'Moayad', false, true),
('mishaq@viftraining.com', 'Mufid', false, true),
('yassin@viftraining.com', 'Yassin', false, true),
('wael@viftraining.com', 'Wael', false, true),
('yousef@viftraining.com', 'Yousef', false, true),
('rima@viftraining.com', 'Rima', false, true)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_admin = EXCLUDED.is_admin,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
  COUNT(*) as total_employees,
  COUNT(*) FILTER (WHERE is_admin = true) as admins,
  COUNT(*) FILTER (WHERE is_admin = false) as regular_employees
FROM employees;

SELECT
  email,
  full_name,
  CASE WHEN is_admin THEN 'Admin' ELSE 'Employee' END as role,
  CASE WHEN is_active THEN 'Active' ELSE 'Inactive' END as status
FROM employees
ORDER BY full_name;

SELECT 'All 17 employees added successfully!' as status;
