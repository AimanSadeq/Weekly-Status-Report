-- Add missing columns to activities table used by the supabase adapter
ALTER TABLE activities ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS activity_type_text VARCHAR(255);
ALTER TABLE activities ADD COLUMN IF NOT EXISTS week_ending DATE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES employees(id);
