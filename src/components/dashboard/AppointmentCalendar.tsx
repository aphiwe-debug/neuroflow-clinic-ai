import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { CalendarView } from "./CalendarView";
import { AppointmentFormDialog } from "./AppointmentFormDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Appointment = Tables<"appointments"> & {
  patients?: Tables<"patients">;
};

export const AppointmentCalendar = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [defaultSlot, setDefaultSlot] = useState<{ start: Date; end: Date } | undefined>();
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patients (
            full_name,
            email
          )
        `)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({
      id,
      start_time,
      end_time,
    }: {
      id: string;
      start_time: Date;
      end_time: Date;
    }) => {
      const { error } = await supabase
        .from("appointments")
        .update({
          start_time: start_time.toISOString(),
          end_time: end_time.toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update appointment: " + error.message);
    },
  });

  const handleSelectEvent = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDefaultSlot(undefined);
    setDialogOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedAppointment(undefined);
    setDefaultSlot(slotInfo);
    setDialogOpen(true);
  };

  const handleEventDrop = ({
    event,
    start,
    end,
  }: {
    event: any;
    start: Date;
    end: Date;
  }) => {
    updateAppointmentMutation.mutate({
      id: event.resource.id,
      start_time: start,
      end_time: end,
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAppointment(undefined);
    setDefaultSlot(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[700px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointment Calendar</h2>
        <Button onClick={() => {
          setSelectedAppointment(undefined);
          setDefaultSlot(undefined);
          setDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {!appointments || appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No appointments scheduled. Create your first appointment.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CalendarView
          appointments={appointments}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
        />
      )}

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        appointment={selectedAppointment}
        defaultStartTime={defaultSlot?.start}
        defaultEndTime={defaultSlot?.end}
      />
    </div>
  );
};