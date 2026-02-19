-- Activity Templates table
CREATE TABLE IF NOT EXISTS activity_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255),
  activity_type_text VARCHAR(255),
  description TEXT,
  units_completed INTEGER,
  is_shared BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_employee ON activity_templates(employee_id);
CREATE INDEX idx_templates_shared ON activity_templates(is_shared) WHERE is_shared = TRUE;
