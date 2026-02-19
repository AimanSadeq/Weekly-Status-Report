-- Add soft delete support to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
CREATE INDEX idx_activities_deleted ON activities(deleted_at) WHERE deleted_at IS NULL;
