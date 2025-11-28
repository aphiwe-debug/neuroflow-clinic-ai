import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConflictCheck {
  clinic_id: string;
  start_time: string;
  end_time: string;
  exclude_appointment_id?: string;
}

interface Conflict {
  id: string;
  title: string;
  patient_name: string;
  start_time: string;
  end_time: string;
}

export const useAppointmentConflicts = (params: ConflictCheck | null) => {
  return useQuery({
    queryKey: ["appointment-conflicts", params],
    queryFn: async () => {
      if (!params) return [];

      const { data, error } = await supabase.rpc("check_appointment_conflict", {
        p_clinic_id: params.clinic_id,
        p_start_time: params.start_time,
        p_end_time: params.end_time,
        p_exclude_appointment_id: params.exclude_appointment_id || null,
      });

      if (error) throw error;
      return data as Conflict[];
    },
    enabled: !!params,
  });
};