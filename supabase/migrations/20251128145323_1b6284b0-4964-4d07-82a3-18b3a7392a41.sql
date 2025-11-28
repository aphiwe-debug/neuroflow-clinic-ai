-- Add recurrence fields to appointments table
ALTER TABLE appointments 
ADD COLUMN recurrence_rule TEXT,
ADD COLUMN recurrence_parent_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
ADD COLUMN is_recurring BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX idx_appointments_recurrence_parent ON appointments(recurrence_parent_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);