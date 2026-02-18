-- VIF Activity Tracker - Add New Activity Types and Create Relationships
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. FIRST: Fix duplicate department name
-- =====================================================

-- Delete the duplicate "Website (Digital/Marketing)" if it exists
DELETE FROM departments WHERE name = 'Website (Digital/Marketing)';

-- Make sure "Website & Digital Marketing" exists
INSERT INTO departments (name, is_active)
VALUES ('Website & Digital Marketing', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. ADD ALL NEW ACTIVITY TYPES FROM MATRIX
-- =====================================================

-- Website & Digital Marketing activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('Designing and posting social media content', 'Website', false, true),
('Email marketing campaigns and newsletters', 'Website', false, true),
('Managing digital ads (Google, LinkedIn, Meta campaigns)', 'Website', false, true),
('Monitoring web traffic and lead conversion performance', 'Website', false, true),
('Search Engine Optimization (SEO) and Google Analytics tracking', 'Website', false, true),
('Updating event calendars and registration forms', 'Website', false, true),
('Website content updates (course pages, trainer profiles, blogs)', 'Website', false, true)
ON CONFLICT (name) DO NOTHING;

-- Operations activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('Coordinating between Business Development, Consultants, and Clients', 'Operations', false, true),
('Coordinating with Consultants to design  course content', 'Operations', false, true),
('Managing logistics for classroom and online sessions (venue, materials, trainer travel)', 'Operations', false, true),
('eLearning vouchers', 'Operations', false, true),
('Preparing and sending certificates, evaluations, and post-course reports', 'Operations', false, true),
('Preparing course outlines', 'Operations', false, true),
('Tracking course timelines, attendance, and completion status.', 'Operations', false, true),
('Preparing training proposals', 'Operations', false, true),
('Preparing consulting proposals', 'Operations', false, true)
ON CONFLICT (name) DO NOTHING;

-- Consultants activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('designing customized course outlines', 'Consultants', true, true),
('Delivering classroom, virtual, consulting, ITP, and coaching sessions', 'Consultants', true, true),
('Reviewing and updating course content', 'Consultants', true, true),
('Designing new courses', 'Consultants', true, true),
('Designing eLearning', 'Consultants', true, true),
('Bringing-in business (BD)', 'Consultants', true, true),
('Attending conferences', 'Consultants', true, true),
('Delivering Training (Billing Days)', 'Consultants', true, true)
ON CONFLICT (name) DO NOTHING;

-- Finance activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('Handling VAT and tax compliance for UAE and KSA operations.', 'Finance', false, true),
('Maintaining budget control and cost allocation by department or client.', 'Finance', false, true),
('Managing invoicing, collections, and payments (clients, trainers, vendors).', 'Finance', false, true),
('Managing trainer contracts, payroll, and expense claims.', 'Finance', false, true),
('Monitoring course profitability and billing day utilization.', 'Finance', false, true),
('Preparing monthly and annual financial statements (P&L, balance sheet, cash flow).', 'Finance', false, true),
('Supporting management with financial performance dashboards and cost optimization insights.', 'Finance', false, true)
ON CONFLICT (name) DO NOTHING;

-- Management activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('Approving major proposals, budgets, and partnerships.', 'Management', false, true),
('Driving organizational innovation (eLearning, gamification, AI tools).', 'Management', false, true),
('Leading leadership and performance review meetings.', 'Management', false, true),
('Managing key stakeholder and partner relationships (ministries, academies, institutions).', 'Management', false, true),
('Overseeing policy creation, governance, and compliance.', 'Management', false, true),
('Overseeing quality assurance and client satisfaction metrics.', 'Management', false, true),
('Reviewing monthly performance dashboards and pipeline reports.', 'Management', false, true),
('Setting corporate strategy, annual targets, and departmental KPIs.', 'Management', false, true)
ON CONFLICT (name) DO NOTHING;

-- Business Development & Relationship Management activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('Collaborating with the Marketing team for campaigns and promotions.', 'BDRM', false, true),
('Conducting client meetings, needs assessments, and follow-ups.', 'BDRM', false, true),
('Coordinating with Operations to develop customized proposals and course outlines.', 'BDRM', false, true),
('Identifying and engaging corporate and government clients (KSA, UAE, Iraq, Jordan).', 'BDRM', false, true),
('Maintaining a database of opportunities and relationships.', 'BDRM', false, true),
('Managing the sales pipeline (calls, visits, proposals requested, proposals confirmed).', 'BDRM', false, true),
('Representing VIFM at events, conferences, and exhibitions.', 'BDRM', false, true),
('Strengthening existing client relationships through continuous engagement and feedback.', 'BDRM', false, true),
('Procurement and vendor portal management', 'BDRM', false, true)
ON CONFLICT (name) DO NOTHING;

-- Universal activities
INSERT INTO activity_types (name, category, is_consultant_only, is_active) VALUES
('Other activities', 'Universal', false, true),
('Professional development', 'Universal', false, true),
('Maternity/Paternity', 'Universal', false, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 3. CREATE JUNCTION TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_type_departments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_type_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_atd_activity_type ON activity_type_departments(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_atd_department ON activity_type_departments(department_id);

ALTER TABLE activity_type_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on activity_type_departments" ON activity_type_departments;
CREATE POLICY "Allow all operations on activity_type_departments"
ON activity_type_departments
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4. CLEAR AND REBUILD ALL RELATIONSHIPS
-- =====================================================

TRUNCATE activity_type_departments;

-- Helper function
CREATE OR REPLACE FUNCTION link_activity_to_departments(
  activity_name TEXT,
  dept_names TEXT[]
)
RETURNS void AS $$
DECLARE
  activity_id UUID;
  dept_id UUID;
  dept_name TEXT;
BEGIN
  SELECT id INTO activity_id FROM activity_types WHERE name = activity_name;
  IF activity_id IS NULL THEN
    RAISE NOTICE 'Activity type not found: %', activity_name;
    RETURN;
  END IF;

  FOREACH dept_name IN ARRAY dept_names
  LOOP
    SELECT id INTO dept_id FROM departments WHERE name = dept_name;
    IF dept_id IS NOT NULL THEN
      INSERT INTO activity_type_departments (activity_type_id, department_id)
      VALUES (activity_id, dept_id)
      ON CONFLICT DO NOTHING;
    ELSE
      RAISE NOTICE 'Department not found: %', dept_name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Website & Digital Marketing (7 activities)
SELECT link_activity_to_departments('Designing and posting social media content', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Email marketing campaigns and newsletters', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Managing digital ads (Google, LinkedIn, Meta campaigns)', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Monitoring web traffic and lead conversion performance', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Search Engine Optimization (SEO) and Google Analytics tracking', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Updating event calendars and registration forms', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Website content updates (course pages, trainer profiles, blogs)', ARRAY['Website & Digital Marketing']);

-- Operations (9 activities - 1 shared with Consultants)
SELECT link_activity_to_departments('Coordinating between Business Development, Consultants, and Clients', ARRAY['Operations', 'Consultants']);
SELECT link_activity_to_departments('Coordinating with Consultants to design  course content', ARRAY['Operations']);
SELECT link_activity_to_departments('Managing logistics for classroom and online sessions (venue, materials, trainer travel)', ARRAY['Operations']);
SELECT link_activity_to_departments('eLearning vouchers', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing and sending certificates, evaluations, and post-course reports', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing course outlines', ARRAY['Operations']);
SELECT link_activity_to_departments('Tracking course timelines, attendance, and completion status.', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing training proposals', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing consulting proposals', ARRAY['Operations']);

-- Consultants (12 activities)
SELECT link_activity_to_departments('designing customized course outlines', ARRAY['Consultants']);
SELECT link_activity_to_departments('Delivering classroom, virtual, consulting, ITP, and coaching sessions', ARRAY['Consultants']);
SELECT link_activity_to_departments('Reviewing and updating course content', ARRAY['Consultants']);
SELECT link_activity_to_departments('Designing new courses', ARRAY['Consultants']);
SELECT link_activity_to_departments('Designing eLearning', ARRAY['Consultants']);
SELECT link_activity_to_departments('Proposal Support', ARRAY['Consultants']);
SELECT link_activity_to_departments('Bringing-in business (BD)', ARRAY['Consultants']);
SELECT link_activity_to_departments('Attending conferences', ARRAY['Consultants']);
SELECT link_activity_to_departments('Consultant Support', ARRAY['Consultants']);
SELECT link_activity_to_departments('Special Projects', ARRAY['Consultants']);
SELECT link_activity_to_departments('Course Materials Design/Audit', ARRAY['Consultants']);
SELECT link_activity_to_departments('Delivering Training (Billing Days)', ARRAY['Consultants']);

-- Finance (7 activities)
SELECT link_activity_to_departments('Handling VAT and tax compliance for UAE and KSA operations.', ARRAY['Finance']);
SELECT link_activity_to_departments('Maintaining budget control and cost allocation by department or client.', ARRAY['Finance']);
SELECT link_activity_to_departments('Managing invoicing, collections, and payments (clients, trainers, vendors).', ARRAY['Finance']);
SELECT link_activity_to_departments('Managing trainer contracts, payroll, and expense claims.', ARRAY['Finance']);
SELECT link_activity_to_departments('Monitoring course profitability and billing day utilization.', ARRAY['Finance']);
SELECT link_activity_to_departments('Preparing monthly and annual financial statements (P&L, balance sheet, cash flow).', ARRAY['Finance']);
SELECT link_activity_to_departments('Supporting management with financial performance dashboards and cost optimization insights.', ARRAY['Finance']);

-- Management (8 activities)
SELECT link_activity_to_departments('Approving major proposals, budgets, and partnerships.', ARRAY['Management']);
SELECT link_activity_to_departments('Driving organizational innovation (eLearning, gamification, AI tools).', ARRAY['Management']);
SELECT link_activity_to_departments('Leading leadership and performance review meetings.', ARRAY['Management']);
SELECT link_activity_to_departments('Managing key stakeholder and partner relationships (ministries, academies, institutions).', ARRAY['Management']);
SELECT link_activity_to_departments('Overseeing policy creation, governance, and compliance.', ARRAY['Management']);
SELECT link_activity_to_departments('Overseeing quality assurance and client satisfaction metrics.', ARRAY['Management']);
SELECT link_activity_to_departments('Reviewing monthly performance dashboards and pipeline reports.', ARRAY['Management']);
SELECT link_activity_to_departments('Setting corporate strategy, annual targets, and departmental KPIs.', ARRAY['Management']);

-- Business Development & Relationship Management (9 activities)
SELECT link_activity_to_departments('Collaborating with the Marketing team for campaigns and promotions.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Conducting client meetings, needs assessments, and follow-ups.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Coordinating with Operations to develop customized proposals and course outlines.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Identifying and engaging corporate and government clients (KSA, UAE, Iraq, Jordan).', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Maintaining a database of opportunities and relationships.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Managing the sales pipeline (calls, visits, proposals requested, proposals confirmed).', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Representing VIFM at events, conferences, and exhibitions.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Strengthening existing client relationships through continuous engagement and feedback.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Procurement and vendor portal management', ARRAY['Business Development & Relationship Management']);

-- Universal activities (ALL departments)
SELECT link_activity_to_departments('Sick', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Vacation', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Other activities', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Professional development', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Maternity/Paternity', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

SELECT
  d.name as department,
  COUNT(*) as activity_count
FROM activity_type_departments atd
JOIN departments d ON atd.department_id = d.id
GROUP BY d.name
ORDER BY d.name;

SELECT 'Setup complete! Activity types and relationships created.' as status;
