-- Employee and Department Mapping Seed Data for VIF Training
-- Based on provided employee list

-- This script should be run after users are created through Supabase Auth
-- The IDs here are placeholders - actual IDs will come from auth.users

-- Step 1: Create a temporary mapping table for easier reference
CREATE TEMP TABLE employee_dept_mapping (
    employee_name VARCHAR(255),
    email VARCHAR(255),
    departments TEXT[]
);

-- Insert employee-department relationships based on provided data
INSERT INTO employee_dept_mapping (employee_name, email, departments) VALUES
    ('Rakan', 'rakan@viftraining.com', ARRAY['Business Development & Relationship Management']),
    ('Omar', 'omar@viftraining.com', ARRAY['Website (Digital/Marketing)', 'Consultants']),
    ('Ahmad', 'ahmad@viftraining.com', ARRAY['Operations', 'Consultants']),
    ('Aiman', 'aiman@viftraining.com', ARRAY['Management', 'Consultants']),
    ('Hamda', 'hamda@viftraining.com', ARRAY['Finance']),
    ('Farah', 'farah@viftraining.com', ARRAY['Consultants']),
    ('Leen', 'leen@viftraining.com', ARRAY['Business Development & Relationship Management']),
    ('Mira', 'mira@viftraining.com', ARRAY['Consultants']),
    ('Saja', 'saja@viftraining.com', ARRAY['Finance']),
    ('Adnan', 'adnan@viftraining.com', ARRAY['Consultants']),
    ('Malak', 'malak@viftraining.com', ARRAY['Consultants']),
    ('Natalie', 'natalie@viftraining.com', ARRAY['Operations']),
    ('Hani', 'hani@viftraining.com', ARRAY['Consultants']),
    ('Rahaf', 'rahaf@viftraining.com', ARRAY['Operations']),
    ('Faisal', 'faisal@viftraining.com', ARRAY['Consultants']),
    ('Ahmad Younes', 'ahmadyounes@viftraining.com', ARRAY['Website (Digital/Marketing)']),
    ('Heba', 'heba@viftraining.com', ARRAY['Operations']),
    ('Tala', 'tala@viftraining.com', ARRAY['Operations']);

-- Note: You (Ahmad Samara) will be set as admin
-- Your email should be added when you register

-- Function to seed employee departments after auth users are created
CREATE OR REPLACE FUNCTION seed_employee_departments()
RETURNS void AS $$
DECLARE
    emp RECORD;
    dept_name TEXT;
    dept_id UUID;
    emp_id UUID;
    is_first BOOLEAN;
BEGIN
    -- Loop through each employee in the mapping
    FOR emp IN SELECT * FROM employee_dept_mapping LOOP
        -- Get the employee ID from the employees table
        SELECT id INTO emp_id 
        FROM employees 
        WHERE email = emp.email;
        
        IF emp_id IS NOT NULL THEN
            is_first := TRUE;
            -- Loop through each department for this employee
            FOREACH dept_name IN ARRAY emp.departments LOOP
                -- Get the department ID
                SELECT id INTO dept_id 
                FROM departments 
                WHERE name = dept_name;
                
                IF dept_id IS NOT NULL THEN
                    -- Insert the employee-department relationship
                    INSERT INTO employee_departments (employee_id, department_id, is_primary)
                    VALUES (emp_id, dept_id, is_first)
                    ON CONFLICT (employee_id, department_id) DO NOTHING;
                    
                    is_first := FALSE; -- Only first department is primary
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to set up initial admin user
CREATE OR REPLACE FUNCTION setup_admin_user(admin_email VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE employees 
    SET is_admin = TRUE 
    WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql;

-- Sample notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notification_templates (type, title_template, message_template) VALUES
    ('submission_reminder', 
     'Weekly Activity Report Reminder', 
     'Please submit your weekly activities by end of day Thursday.'),
    ('admin_feedback', 
     'Feedback on Your Activity Report', 
     'You have received feedback on your activity report for {{date}}.'),
    ('activity_submitted', 
     'New Activity Report Submitted', 
     '{{employee_name}} has submitted their activity report for {{date}}.'),
    ('needs_clarification', 
     'Clarification Needed on Activity Report', 
     'Your activity report for {{date}} needs clarification. Please review the feedback.'),
    ('activity_reviewed', 
     'Activity Report Reviewed', 
     'Your activity report for {{date}} has been reviewed.');

-- Create a scheduled job function for Thursday reminders (to be called by cron)
CREATE OR REPLACE FUNCTION send_thursday_reminders()
RETURNS void AS $$
DECLARE
    emp RECORD;
    current_week INTEGER;
    current_year INTEGER;
BEGIN
    current_week := EXTRACT(WEEK FROM CURRENT_DATE);
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Check if today is Thursday
    IF EXTRACT(DOW FROM CURRENT_DATE) = 4 THEN
        -- Loop through all active employees
        FOR emp IN 
            SELECT id, full_name, email 
            FROM employees 
            WHERE is_active = TRUE AND is_admin = FALSE
        LOOP
            -- Check if they haven't submitted for this week
            IF NOT EXISTS (
                SELECT 1 FROM activities 
                WHERE employee_id = emp.id 
                AND week_number = current_week 
                AND year = current_year
                AND status IN ('submitted', 'reviewed')
            ) THEN
                -- Create a reminder notification
                INSERT INTO notifications (
                    recipient_id, 
                    type, 
                    title, 
                    message
                ) VALUES (
                    emp.id,
                    'submission_reminder',
                    'Weekly Activity Report Reminder',
                    'Hi ' || emp.full_name || ', please submit your weekly activities by end of day today (Thursday).'
                );
            END IF;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW activity_statistics AS
SELECT 
    e.full_name,
    e.email,
    d.name as department_name,
    COUNT(a.id) as total_activities,
    COUNT(CASE WHEN a.status = 'submitted' THEN 1 END) as pending_review,
    COUNT(CASE WHEN a.status = 'reviewed' THEN 1 END) as reviewed,
    COUNT(CASE WHEN a.status = 'needs_clarification' THEN 1 END) as needs_clarification,
    MAX(a.report_date) as last_submission_date,
    EXTRACT(WEEK FROM CURRENT_DATE) as current_week,
    EXTRACT(YEAR FROM CURRENT_DATE) as current_year
FROM employees e
LEFT JOIN employee_departments ed ON e.id = ed.employee_id AND ed.is_primary = TRUE
LEFT JOIN departments d ON ed.department_id = d.id
LEFT JOIN activities a ON e.id = a.employee_id
WHERE e.is_active = TRUE
GROUP BY e.id, e.full_name, e.email, d.name;

-- Create view for weekly submission status
CREATE OR REPLACE VIEW weekly_submission_status AS
SELECT 
    e.full_name,
    e.email,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM activities a
            WHERE a.employee_id = e.id
            AND a.week_number = EXTRACT(WEEK FROM CURRENT_DATE)
            AND a.year = EXTRACT(YEAR FROM CURRENT_DATE)
        ) THEN 'Submitted'
        ELSE 'Not Submitted'
    END as submission_status,
    COUNT(a.id) as activities_count
FROM employees e
LEFT JOIN activities a ON e.id = a.employee_id
    AND a.week_number = EXTRACT(WEEK FROM CURRENT_DATE)
    AND a.year = EXTRACT(YEAR FROM CURRENT_DATE)
WHERE e.is_active = TRUE AND e.is_admin = FALSE
GROUP BY e.id, e.full_name, e.email;
