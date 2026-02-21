-- Add last login tracking
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
