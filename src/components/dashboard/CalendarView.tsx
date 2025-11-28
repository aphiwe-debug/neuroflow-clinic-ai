import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Tables } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Appointment = Tables<"appointments"> & {
  patients?: Tables<"patients">;
};

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

interface CalendarViewProps {
  appointments: Appointment[];
  onSelectEvent: (appointment: Appointment) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onEventDrop: (event: { event: CalendarEvent; start: Date; end: Date }) => void;
}

const statusColors = {
  scheduled: "hsl(var(--accent))",
  completed: "hsl(142, 76%, 36%)",
  cancelled: "hsl(var(--destructive))",
  no_show: "hsl(var(--muted-foreground))",
};

export const CalendarView = ({
  appointments,
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
}: CalendarViewProps) => {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());

  const events: CalendarEvent[] = useMemo(
    () =>
      appointments.map((apt) => ({
        id: apt.id,
        title: apt.title,
        start: new Date(apt.start_time),
        end: new Date(apt.end_time),
        resource: apt,
      })),
    [appointments]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectEvent(event.resource);
    },
    [onSelectEvent]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      onSelectSlot(slotInfo);
    },
    [onSelectSlot]
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      onEventDrop({ event, start, end });
    },
    [onEventDrop]
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const status = event.resource.status;
    return {
      style: {
        backgroundColor: statusColors[status],
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: "0",
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
      },
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="h-[700px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          selectable
          resizable
          popup
          eventPropGetter={eventStyleGetter}
          style={{ height: "100%" }}
          views={["month", "week", "day"]}
        />
      </div>
    </Card>
  );
};