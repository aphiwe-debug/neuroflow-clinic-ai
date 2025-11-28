import { useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
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
    
    // Check if this event overlaps with any other event
    const hasConflict = events.some((otherEvent) => {
      if (otherEvent.id === event.id) return false;
      if (otherEvent.resource.status === 'cancelled' || otherEvent.resource.status === 'no_show') return false;
      
      const eventStart = event.start.getTime();
      const eventEnd = event.end.getTime();
      const otherStart = otherEvent.start.getTime();
      const otherEnd = otherEvent.end.getTime();
      
      return (eventStart < otherEnd && eventEnd > otherStart);
    });

    return {
      style: {
        backgroundColor: statusColors[status],
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: hasConflict ? "2px solid hsl(var(--destructive))" : "0",
        boxShadow: hasConflict ? "0 0 0 2px hsl(var(--destructive) / 0.2)" : "none",
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "500",
      },
    };
  }, [events]);

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