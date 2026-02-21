-- VIF Activity Tracker - Activity Type and Department Relationship Matrix
-- Run this in Supabase SQL Editor to set up the many-to-many relationship

-- =====================================================
-- 1. CREATE JUNCTION TABLE
-- =====================================================

-- Create a junction table to link activity types with departments
CREATE TABLE IF NOT EXISTS activity_type_departments (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(activity_type_id, department_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_atd_activity_type ON activity_type_departments(activity_type_id);
CREATE INDEX IF NOT EXISTS idx_atd_department ON activity_type_departments(department_id);

-- Enable RLS
ALTER TABLE activity_type_departments ENABLE ROW LEVEL SECURITY;

-- Create permissive policy
CREATE POLICY "Allow all operations on activity_type_departments"
ON activity_type_departments
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- 2. HELPER FUNCTION TO ADD RELATIONSHIPS
-- =====================================================

-- Function to link an activity type to multiple departments by name
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
  -- Get activity type ID
  SELECT id INTO activity_id
  FROM activity_types
  WHERE name = activity_name;

  IF activity_id IS NULL THEN
    RAISE NOTICE 'Activity type not found: %', activity_name;
    RETURN;
  END IF;

  -- Link to each department
  FOREACH dept_name IN ARRAY dept_names
  LOOP
    SELECT id INTO dept_id
    FROM departments
    WHERE name = dept_name;

    IF dept_id IS NOT NULL THEN
      INSERT INTO activity_type_departments (activity_type_id, department_id)
      VALUES (activity_id, dept_id)
      ON CONFLICT (activity_type_id, department_id) DO NOTHING;
    ELSE
      RAISE NOTICE 'Department not found: %', dept_name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. POPULATE RELATIONSHIPS BASED ON MATRIX
-- =====================================================

-- Clear existing relationships (if re-running)
TRUNCATE activity_type_departments;

-- Website (Digital/Marketing) activities
SELECT link_activity_to_departments('Designing and posting social media content', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Email marketing campaigns and newsletters', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Managing digital ads (Google, LinkedIn, Meta campaigns)', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Monitoring web traffic and lead conversion performance', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Search Engine Optimization (SEO) and Google Analytics tracking', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Updating event calendars and registration forms', ARRAY['Website & Digital Marketing']);
SELECT link_activity_to_departments('Website content updates (course pages, trainer profiles, blogs)', ARRAY['Website & Digital Marketing']);

-- Operations activities
SELECT link_activity_to_departments('Coordinating between Business Development, Consultants, and Clients', ARRAY['Operations', 'Consultants']);
SELECT link_activity_to_departments('Coordinating with Consultants to design  course content', ARRAY['Operations']);
SELECT link_activity_to_departments('Managing logistics for classroom and online sessions (venue, materials, trainer travel)', ARRAY['Operations']);
SELECT link_activity_to_departments('eLearning vouchers', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing and sending certificates, evaluations, and post-course reports', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing course outlines', ARRAY['Operations']);
SELECT link_activity_to_departments('Tracking course timelines, attendance, and completion status.', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing training proposals', ARRAY['Operations']);
SELECT link_activity_to_departments('Preparing consulting proposals', ARRAY['Operations']);

-- Consultants activities
SELECT link_activity_to_departments('designing customized course outlines', ARRAY['Consultants']);
SELECT link_activity_to_departments('Delivering classroom, virtual, consulting, ITP, and coaching sessions', ARRAY['Consultants']);
SELECT link_activity_to_departments('Reviewing and updating course content', ARRAY['Consultants']);
SELECT link_activity_to_departments('Designing new courses', ARRAY['Consultants']);
SELECT link_activity_to_departments('Designing eLearning', ARRAY['Consultants']);
SELECT link_activity_to_departments('Proposal Support', ARRAY['Consultants']);
SELECT link_activity_to_departments('Bringing-in business (BD)', ARRAY['Consultants']);
SELECT link_activity_to_departments('Attending conferences', ARRAY['Consultants']);
SELECT link_activity_to_departments('Consultant support', ARRAY['Consultants']);
SELECT link_activity_to_departments('Special projects', ARRAY['Consultants']);
SELECT link_activity_to_departments('Course materials design/audit', ARRAY['Consultants']);
SELECT link_activity_to_departments('Delivering Training (Billing Days)', ARRAY['Consultants']);

-- Finance activities
SELECT link_activity_to_departments('Handling VAT and tax compliance for UAE and KSA operations.', ARRAY['Finance']);
SELECT link_activity_to_departments('Maintaining budget control and cost allocation by department or client.', ARRAY['Finance']);
SELECT link_activity_to_departments('Managing invoicing, collections, and payments (clients, trainers, vendors).', ARRAY['Finance']);
SELECT link_activity_to_departments('Managing trainer contracts, payroll, and expense claims.', ARRAY['Finance']);
SELECT link_activity_to_departments('Monitoring course profitability and billing day utilization.', ARRAY['Finance']);
SELECT link_activity_to_departments('Preparing monthly and annual financial statements (P&L, balance sheet, cash flow).', ARRAY['Finance']);
SELECT link_activity_to_departments('Supporting management with financial performance dashboards and cost optimization insights.', ARRAY['Finance']);

-- Management activities
SELECT link_activity_to_departments('Approving major proposals, budgets, and partnerships.', ARRAY['Management']);
SELECT link_activity_to_departments('Driving organizational innovation (eLearning, gamification, AI tools).', ARRAY['Management']);
SELECT link_activity_to_departments('Leading leadership and performance review meetings.', ARRAY['Management']);
SELECT link_activity_to_departments('Managing key stakeholder and partner relationships (ministries, academies, institutions).', ARRAY['Management']);
SELECT link_activity_to_departments('Overseeing policy creation, governance, and compliance.', ARRAY['Management']);
SELECT link_activity_to_departments('Overseeing quality assurance and client satisfaction metrics.', ARRAY['Management']);
SELECT link_activity_to_departments('Reviewing monthly performance dashboards and pipeline reports.', ARRAY['Management']);
SELECT link_activity_to_departments('Setting corporate strategy, annual targets, and departmental KPIs.', ARRAY['Management']);

-- Business Development & Relationship Management activities
SELECT link_activity_to_departments('Collaborating with the Marketing team for campaigns and promotions.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Conducting client meetings, needs assessments, and follow-ups.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Coordinating with Operations to develop customized proposals and course outlines.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Identifying and engaging corporate and government clients (KSA, UAE, Iraq, Jordan).', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Maintaining a database of opportunities and relationships.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Managing the sales pipeline (calls, visits, proposals requested, proposals confirmed).', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Representing VIFM at events, conferences, and exhibitions.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Strengthening existing client relationships through continuous engagement and feedback.', ARRAY['Business Development & Relationship Management']);
SELECT link_activity_to_departments('Procurement and vendor portal management', ARRAY['Business Development & Relationship Management']);

-- Activities available to ALL departments
SELECT link_activity_to_departments('Sick', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Vacation', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Other activities', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);
SELECT link_activity_to_departments('Professional development', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);

-- Note: Maternity/Paternity should be added if it exists as an activity type
-- SELECT link_activity_to_departments('Maternity/Paternity', ARRAY['Website & Digital Marketing', 'Operations', 'Consultants', 'Finance', 'Management', 'Business Development & Relationship Management']);

-- =====================================================
-- 4. VERIFICATION QUERY
-- =====================================================

-- View the relationships created
SELECT
  d.name as department,
  at.name as activity_type,
  at.category
FROM activity_type_departments atd
JOIN activity_types at ON atd.activity_type_id = at.id
JOIN departments d ON atd.department_id = d.id
ORDER BY d.name, at.name;

-- Count activities per department
SELECT
  d.name as department,
  COUNT(*) as activity_count
FROM activity_type_departments atd
JOIN departments d ON atd.department_id = d.id
GROUP BY d.name
ORDER BY d.name;

SELECT 'Activity-Department relationships created successfully!' as status;
