-- VIF Activity Tracker - Convert Units to Whole Numbers
-- This script updates all decimal unit values to integers and changes column types

-- =====================================================
-- 1. ROUND ALL EXISTING DECIMAL VALUES
-- =====================================================

-- Update units_completed to rounded whole numbers
UPDATE activities
SET units_completed = ROUND(units_completed)
WHERE units_completed IS NOT NULL;

-- Update percentage_complete to rounded whole numbers
UPDATE activities
SET percentage_complete = ROUND(percentage_complete)
WHERE percentage_complete IS NOT NULL;

-- =====================================================
-- 2. CHANGE COLUMN TYPES TO INTEGER
-- =====================================================

-- Change units_completed from NUMERIC to INTEGER
ALTER TABLE activities
ALTER COLUMN units_completed TYPE INTEGER
USING ROUND(units_completed)::INTEGER;

-- Change percentage_complete from NUMERIC to INTEGER
ALTER TABLE activities
ALTER COLUMN percentage_complete TYPE INTEGER
USING ROUND(percentage_complete)::INTEGER;

-- =====================================================
-- 3. VERIFY THE CHANGES
-- =====================================================

-- Check for any remaining decimal values (should return 0 rows)
SELECT id, units_completed, percentage_complete
FROM activities
WHERE units_completed::TEXT LIKE '%.%'
   OR percentage_complete::TEXT LIKE '%.%';

-- Show sample data to verify
SELECT id, units_completed, percentage_complete, description
FROM activities
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- COMPLETE!
-- =====================================================
