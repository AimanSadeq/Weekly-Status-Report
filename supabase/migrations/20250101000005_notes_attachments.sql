-- Activity Notes table
CREATE TABLE IF NOT EXISTS activity_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  author_email VARCHAR(255) NOT NULL,
  author_name VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_activity ON activity_notes(activity_id);

-- Activity Attachments table
CREATE TABLE IF NOT EXISTS activity_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  storage_path VARCHAR(500) NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_activity ON activity_attachments(activity_id);
