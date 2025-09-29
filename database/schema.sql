-- VIF Training Employee Activity Tracking System
-- Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert departments
INSERT INTO departments (name) VALUES 
    ('Consultants'),
    ('Website (Digital/Marketing)'),
    ('Operations'),
    ('Business Development & Relationship Management'),
    ('Finance'),
    ('Management');

-- Activity types table
CREATE TABLE activity_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    is_consultant_only BOOLEAN DEFAULT FALSE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    category VARCHAR(50), -- 'BSC' or 'Other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert activity types
INSERT INTO activity_types (name, is_consultant_only, is_mandatory, category) VALUES 
    -- Consultant-only activities
    ('Consulting', TRUE, FALSE, 'Other'),
    ('Clinic', TRUE, FALSE, 'Other'),
    ('Training (Billing Days)', TRUE, FALSE, 'Other'),
    ('Coaching', TRUE, FALSE, 'Other'),
    ('ITP', TRUE, FALSE, 'Other'),
    ('BSC - BDRM', TRUE, FALSE, 'BSC'),
    ('BSC - eLearning', TRUE, TRUE, 'BSC'),
    ('BSC - New Courses', TRUE, TRUE, 'BSC'),
    ('BSC - Certifications', TRUE, TRUE, 'BSC'),
    -- General activities (available to all departments)
    ('Special Projects', FALSE, FALSE, 'Other'),
    ('Conference', FALSE, FALSE, 'Other'),
    ('Course Outline Support/Design', FALSE, FALSE, 'Other'),
    ('Proposal Support', FALSE, FALSE, 'Other'),
    ('Vacation', FALSE, FALSE, 'Other'),
    ('Sick', FALSE, FALSE, 'Other'),
    ('Consultant Support', FALSE, FALSE, 'Other'),
    ('Client Support', FALSE, FALSE, 'Other'),
    ('Course Materials Design/Audit', FALSE, FALSE, 'Other'),
    ('Personal Days Off', FALSE, FALSE, 'Other');

-- Department-Activity mapping table
CREATE TABLE department_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    activity_type_id UUID REFERENCES activity_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, activity_type_id)
);

-- Populate department-activity mappings
-- Consultants get ALL activities
INSERT INTO department_activities (department_id, activity_type_id)
SELECT 
    d.id,
    at.id
FROM departments d
CROSS JOIN activity_types at
WHERE d.name = 'Consultants';

-- Other departments get only non-consultant activities
INSERT INTO department_activities (department_id, activity_type_id)
SELECT 
    d.id,
    at.id
FROM departments d
CROSS JOIN activity_types at
WHERE d.name != 'Consultants' 
    AND at.is_consultant_only = FALSE;

-- Employees table (extends Supabase auth.users)
CREATE TABLE employees (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employee-Department mapping table (supports multiple departments per employee)
CREATE TABLE employee_departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, department_id)
);

-- Activities table (main activity entries)
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    description TEXT NOT NULL,
    units_completed INTEGER,
    percentage_complete INTEGER CHECK (percentage_complete >= 0 AND percentage_complete <= 100),
    activity_type_id UUID REFERENCES activity_types(id),
    department_id UUID REFERENCES departments(id),
    bsc_category VARCHAR(50), -- 'BSC' or 'Other'
    status VARCHAR(50) DEFAULT 'submitted', -- 'draft', 'submitted', 'reviewed', 'needs_clarification'
    week_number INTEGER,
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_activities_employee_date ON activities(employee_id, report_date);
CREATE INDEX idx_activities_week_year ON activities(year, week_number);
CREATE INDEX idx_activities_status ON activities(status);

-- Feedback/Comments table
CREATE TABLE activity_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    commenter_id UUID REFERENCES employees(id),
    comment TEXT NOT NULL,
    is_admin_comment BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'submission_reminder', 'admin_feedback', 'activity_submitted'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create index for unread notifications
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read);

-- Insert employee data with department mappings
-- This will be populated after auth setup
-- Sample structure for reference:
/*
INSERT INTO employees (id, email, full_name, is_admin) VALUES 
    ('admin-uuid', 'ahmad@viftraining.com', 'Ahmad Samara', TRUE);

-- Insert employee-department mappings based on your provided data
INSERT INTO employee_departments (employee_id, department_id, is_primary) VALUES
    -- Rakan - BDRM (primary)
    ('rakan-uuid', (SELECT id FROM departments WHERE name = 'Business Development & Relationship Management'), TRUE),
    -- Omar - Website (primary) & Consultants
    ('omar-uuid', (SELECT id FROM departments WHERE name = 'Website (Digital/Marketing)'), TRUE),
    ('omar-uuid', (SELECT id FROM departments WHERE name = 'Consultants'), FALSE),
    -- And so on for all employees...
*/

-- Row Level Security (RLS) Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Employees can only see their own activities (admins can see all)
CREATE POLICY "Employees can view own activities" ON activities
    FOR SELECT USING (
        auth.uid() = employee_id 
        OR EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Employees can insert their own activities
CREATE POLICY "Employees can insert own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = employee_id);

-- Employees can update their own activities (only if not reviewed)
CREATE POLICY "Employees can update own activities" ON activities
    FOR UPDATE USING (
        auth.uid() = employee_id AND status != 'reviewed'
    );

-- Similar policies for feedback and notifications
CREATE POLICY "View feedback on own activities or as admin" ON activity_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM activities 
            WHERE activities.id = activity_feedback.activity_id 
            AND (activities.employee_id = auth.uid() 
                OR EXISTS (SELECT 1 FROM employees WHERE id = auth.uid() AND is_admin = TRUE))
        )
    );

CREATE POLICY "View own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- Function to automatically set week number and year
CREATE OR REPLACE FUNCTION set_week_year()
RETURNS TRIGGER AS $$
BEGIN
    NEW.week_number := EXTRACT(WEEK FROM NEW.report_date);
    NEW.year := EXTRACT(YEAR FROM NEW.report_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_activity_week_year
    BEFORE INSERT OR UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION set_week_year();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_types_updated_at BEFORE UPDATE ON activity_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_feedback_updated_at BEFORE UPDATE ON activity_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
