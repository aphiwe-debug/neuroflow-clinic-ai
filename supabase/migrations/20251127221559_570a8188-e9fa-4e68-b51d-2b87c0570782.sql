-- Add emergency contact fields to patients table
ALTER TABLE public.patients 
ADD COLUMN emergency_contact_name TEXT,
ADD COLUMN emergency_contact_phone TEXT,
ADD COLUMN emergency_contact_relationship TEXT;