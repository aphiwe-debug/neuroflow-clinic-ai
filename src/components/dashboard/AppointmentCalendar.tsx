import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Appointment = Tables<"appointments"> & {
  patients?: Tables<"patients">;
};

const statusColors = {
  scheduled: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  no_show: "bg-gray-500",
};

export const AppointmentCalendar = () => {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            full_name,
            email
          )
        `)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No appointments scheduled. Create your first appointment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => {
        const startTime = new Date(appointment.start_time);
        const endTime = new Date(appointment.end_time);

        return (
          <Card key={appointment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{appointment.title}</CardTitle>
                  <CardDescription>
                    {appointment.patients?.full_name || 'Unknown Patient'}
                  </CardDescription>
                </div>
                <Badge 
                  className={`${statusColors[appointment.status]} text-white`}
                >
                  {appointment.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {startTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {endTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </div>
                {appointment.description && (
                  <p className="text-sm mt-2">{appointment.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};