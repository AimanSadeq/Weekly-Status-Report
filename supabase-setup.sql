-- VIF Activity Tracker - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- =====================================================
-- 1. ACTIVITIES TABLE
-- =====================================================

-- Drop existing table if you want to recreate it (CAUTION: This deletes data!)
-- DROP TABLE IF EXISTS activities CASCADE;

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  hours NUMERIC NOT NULL,
  week TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  feedback TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_email ON activities(email);
CREATE INDEX IF NOT EXISTS idx_activities_week ON activities(week);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  departments JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. EMAIL PREFERENCES TABLE (Optional)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_preferences (
  email TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
  deadline_reminders BOOLEAN DEFAULT TRUE,
  submission_confirmations BOOLEAN DEFAULT TRUE,
  feedback_notifications BOOLEAN DEFAULT TRUE,
  weekly_digests BOOLEAN DEFAULT TRUE,
  admin_alerts BOOLEAN DEFAULT TRUE,
  reminder_days INTEGER DEFAULT 2,
  digest_day TEXT DEFAULT 'Monday',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INSERT DEFAULT USERS
-- =====================================================

INSERT INTO users (email, name, role, departments) VALUES
  ('asadeq@viftraining.com', 'Aiman', 'admin', '["Management", "Consultants"]'),
  ('omar@viftraining.com', 'Omar', 'employee', '["Website & Digital Marketing", "Consultants"]'),
  ('ahmadg@viftraining.com', 'Ahmad', 'employee', '["Operations", "Consultants"]'),
  ('akayed@viftraining.com', 'Amal', 'employee', '["Business Development & Relationship Management", "Consultants"]'),
  ('ali@viftraining.com', 'Ali', 'employee', '["Consultants"]'),
  ('ammar@viftraining.com', 'Ammar', 'employee', '["Consultants"]'),
  ('ajubain@viftraining.com', 'Alaa', 'employee', '["Operations"]'),
  ('dalia@viftraining.com', 'Dalia', 'employee', '["Operations"]'),
  ('mohamad@viftraining.com', 'MJ', 'employee', '["Finance"]'),
  ('asaad@viftraining.com', 'Asaad', 'employee', '["Website & Digital Marketing"]'),
  ('ibrahim@viftraining.com', 'Ibrahim', 'employee', '["Consultants"]'),
  ('moayad@viftraining.com', 'Moayad', 'employee', '["Consultants"]'),
  ('mufid@viftraining.com', 'Mufid', 'employee', '["Consultants"]'),
  ('yassin@viftraining.com', 'Yassin', 'employee', '["Consultants"]'),
  ('wael@viftraining.com', 'Wael', 'employee', '["Consultants"]'),
  ('yousef@viftraining.com', 'Yousef', 'employee', '["Consultants"]'),
  ('rima@viftraining.com', 'Rima', 'employee', '["Operations"]')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) - Optional but Recommended
-- =====================================================

-- Enable RLS on tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (you can restrict later)
-- This allows the anon key to access all data
CREATE POLICY "Allow all for activities" ON activities FOR ALL USING (true);
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for email_preferences" ON email_preferences FOR ALL USING (true);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Verify setup:
SELECT 'Activities table ready' as status, COUNT(*) as count FROM activities
UNION ALL
SELECT 'Users loaded' as status, COUNT(*) as count FROM users;
