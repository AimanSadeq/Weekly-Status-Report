-- VIF Activity Tracker - Assign Employees to Departments
-- Run this in Supabase SQL Editor AFTER adding all employees

-- =====================================================
-- CREATE EMPLOYEE_DEPARTMENTS JUNCTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_ed_employee ON employee_departments(employee_id);
CREATE INDEX IF NOT EXISTS idx_ed_department ON employee_departments(department_id);

ALTER TABLE employee_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on employee_departments" ON employee_departments;
CREATE POLICY "Allow all operations on employee_departments"
ON employee_departments
FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTION TO ASSIGN EMPLOYEE TO DEPARTMENT
-- =====================================================

CREATE OR REPLACE FUNCTION assign_employee_to_department(
  employee_email TEXT,
  dept_name TEXT,
  is_primary_dept BOOLEAN DEFAULT false
)
RETURNS void AS $$
DECLARE
  emp_id UUID;
  dept_id UUID;
BEGIN
  SELECT id INTO emp_id FROM employees WHERE email = employee_email;
  IF emp_id IS NULL THEN
    RAISE NOTICE 'Employee not found: %', employee_email;
    RETURN;
  END IF;

  SELECT id INTO dept_id FROM departments WHERE name = dept_name;
  IF dept_id IS NULL THEN
    RAISE NOTICE 'Department not found: %', dept_name;
    RETURN;
  END IF;

  INSERT INTO employee_departments (employee_id, department_id, is_primary)
  VALUES (emp_id, dept_id, is_primary_dept)
  ON CONFLICT (employee_id, department_id) DO UPDATE SET
    is_primary = EXCLUDED.is_primary;

  RAISE NOTICE 'Assigned % to %', employee_email, dept_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ASSIGN ALL EMPLOYEES TO THEIR DEPARTMENTS
-- =====================================================

-- Aiman: Consultants (Primary), Management (Secondary)
SELECT assign_employee_to_department('asadeq@viftraining.com', 'Consultants', true);
SELECT assign_employee_to_department('asadeq@viftraining.com', 'Management', false);

-- Omar: Website & Digital Marketing (Primary)
SELECT assign_employee_to_department('omar@viftraining.com', 'Website & Digital Marketing', true);

-- Ahmad: Operations (Primary), Consultants (Secondary)
SELECT assign_employee_to_department('ahmadg@viftraining.com', 'Operations', true);
SELECT assign_employee_to_department('ahmadg@viftraining.com', 'Consultants', false);

-- Amal: Business Development & Relationship Management (Primary), Consultants (Secondary)
SELECT assign_employee_to_department('akayed@viftraining.com', 'Business Development & Relationship Management', true);
SELECT assign_employee_to_department('akayed@viftraining.com', 'Consultants', false);

-- Alaa: Operations (Primary)
SELECT assign_employee_to_department('ajubain@viftraining.com', 'Operations', true);

-- Rima: Operations (Primary)
SELECT assign_employee_to_department('rima@viftraining.com', 'Operations', true);

-- Dalia: Operations (Primary)
SELECT assign_employee_to_department('dalia@viftraining.com', 'Operations', true);

-- Yousef: Operations (Primary)
SELECT assign_employee_to_department('yousef@viftraining.com', 'Operations', true);

-- MJ: Finance (Primary)
SELECT assign_employee_to_department('mohamad@viftraining.com', 'Finance', true);

-- Ibrahim: Consultants (Primary)
SELECT assign_employee_to_department('ikhanji@viftraining.com', 'Consultants', true);

-- Ammar: Consultants (Primary)
SELECT assign_employee_to_department('ammar@viftraining.com', 'Consultants', true);

-- Moayad: Consultants (Primary)
SELECT assign_employee_to_department('moayad@viftraining.com', 'Consultants', true);

-- Yassin: Consultants (Primary)
SELECT assign_employee_to_department('yassin@viftraining.com', 'Consultants', true);

-- Ali: Consultants (Primary)
SELECT assign_employee_to_department('ali@viftraining.com', 'Consultants', true);

-- Mufid: Consultants (Primary)
SELECT assign_employee_to_department('mishaq@viftraining.com', 'Consultants', true);

-- Wael: Business Development & Relationship Management (Primary)
SELECT assign_employee_to_department('wael@viftraining.com', 'Business Development & Relationship Management', true);

-- Asaad: Website & Digital Marketing (Primary)
SELECT assign_employee_to_department('asaad@viftraining.com', 'Website & Digital Marketing', true);

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
  e.full_name,
  e.email,
  d.name as department,
  CASE WHEN ed.is_primary THEN 'Primary' ELSE 'Secondary' END as role
FROM employee_departments ed
JOIN employees e ON ed.employee_id = e.id
JOIN departments d ON ed.department_id = d.id
ORDER BY e.full_name, ed.is_primary DESC, d.name;

SELECT 'Employee-Department assignments complete!' as status;
