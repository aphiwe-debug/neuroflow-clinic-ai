-- Function to check for appointment conflicts
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  p_clinic_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  patient_name TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    p.full_name as patient_name,
    a.start_time,
    a.end_time
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  WHERE a.clinic_id = p_clinic_id
    AND a.status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
      -- Check for any overlap
      (a.start_time < p_end_time AND a.end_time > p_start_time)
    )
  ORDER BY a.start_time;
END;
$$;