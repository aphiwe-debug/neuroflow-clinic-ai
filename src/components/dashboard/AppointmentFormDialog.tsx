import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RRule, Frequency } from "rrule";
import { addDays, addWeeks, addMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  patient_id: z.string().min(1, "Patient is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  description: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
  is_recurring: z.boolean().default(false),
  recurrence_frequency: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_days: z.array(z.number()).optional(),
  recurrence_end_type: z.enum(["never", "count", "until"]).optional(),
  recurrence_count: z.number().min(1).optional(),
  recurrence_until: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Tables<"appointments">;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
}

export const AppointmentFormDialog = ({
  open,
  onOpenChange,
  appointment,
  defaultStartTime,
  defaultEndTime,
}: AppointmentFormDialogProps) => {
  const queryClient = useQueryClient();
  const [showRecurrence, setShowRecurrence] = useState(false);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment
      ? {
          title: appointment.title,
          patient_id: appointment.patient_id,
          start_time: new Date(appointment.start_time).toISOString().slice(0, 16),
          end_time: new Date(appointment.end_time).toISOString().slice(0, 16),
          description: appointment.description || "",
          status: appointment.status,
          is_recurring: appointment.is_recurring || false,
        }
      : {
          title: "",
          patient_id: "",
          start_time: defaultStartTime?.toISOString().slice(0, 16) || "",
          end_time: defaultEndTime?.toISOString().slice(0, 16) || "",
          description: "",
          status: "scheduled",
          is_recurring: false,
          recurrence_frequency: "weekly",
          recurrence_interval: 1,
          recurrence_days: [],
          recurrence_end_type: "never",
        },
  });

  const createMutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const baseAppointment = {
        title: values.title,
        patient_id: values.patient_id,
        start_time: new Date(values.start_time).toISOString(),
        end_time: new Date(values.end_time).toISOString(),
        description: values.description,
        status: values.status,
        clinic_id: user.id,
        is_recurring: values.is_recurring,
      };

      if (values.is_recurring && values.recurrence_frequency) {
        const rrule = generateRRule(values);
        const { data: parentApt, error: parentError } = await supabase
          .from("appointments")
          .insert({ ...baseAppointment, recurrence_rule: rrule.toString() })
          .select()
          .single();

        if (parentError) throw parentError;

        const occurrences = rrule.all();
        const duration = new Date(values.end_time).getTime() - new Date(values.start_time).getTime();

        const childAppointments = occurrences.slice(1).map((date) => ({
          ...baseAppointment,
          start_time: date.toISOString(),
          end_time: new Date(date.getTime() + duration).toISOString(),
          recurrence_parent_id: parentApt.id,
        }));

        if (childAppointments.length > 0) {
          const { error: childError } = await supabase
            .from("appointments")
            .insert(childAppointments);

          if (childError) throw childError;
        }
      } else {
        const { error } = await supabase.from("appointments").insert(baseAppointment);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment created successfully");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create appointment: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      if (!appointment) return;

      const { error } = await supabase
        .from("appointments")
        .update({
          title: values.title,
          patient_id: values.patient_id,
          start_time: new Date(values.start_time).toISOString(),
          end_time: new Date(values.end_time).toISOString(),
          description: values.description,
          status: values.status,
        })
        .eq("id", appointment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update appointment: " + error.message);
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    if (appointment) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const generateRRule = (values: AppointmentFormValues): RRule => {
    const startDate = new Date(values.start_time);
    let freq: Frequency;
    let byweekday: number[] | undefined;

    switch (values.recurrence_frequency) {
      case "daily":
        freq = RRule.DAILY;
        break;
      case "weekly":
        freq = RRule.WEEKLY;
        byweekday = values.recurrence_days;
        break;
      case "monthly":
        freq = RRule.MONTHLY;
        break;
      case "custom":
        freq = RRule.WEEKLY;
        byweekday = values.recurrence_days;
        break;
      default:
        freq = RRule.WEEKLY;
    }

    const options: any = {
      freq,
      dtstart: startDate,
      interval: values.recurrence_interval || 1,
    };

    if (byweekday) {
      options.byweekday = byweekday;
    }

    if (values.recurrence_end_type === "count" && values.recurrence_count) {
      options.count = values.recurrence_count;
    } else if (values.recurrence_end_type === "until" && values.recurrence_until) {
      options.until = new Date(values.recurrence_until);
    } else {
      options.count = 52; // Default to 1 year of weekly appointments
    }

    return new RRule(options);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Create Appointment"}
          </DialogTitle>
          <DialogDescription>
            {appointment
              ? "Update appointment details"
              : "Schedule a new appointment"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Annual Checkup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!appointment && (
              <>
                <FormField
                  control={form.control}
                  name="is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setShowRecurrence(checked as boolean);
                          }}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Recurring Appointment</FormLabel>
                    </FormItem>
                  )}
                />

                {showRecurrence && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="recurrence_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="custom">Custom Days</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurrence_interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repeat Every</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(form.watch("recurrence_frequency") === "weekly" ||
                      form.watch("recurrence_frequency") === "custom") && (
                      <FormField
                        control={form.control}
                        name="recurrence_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repeat On</FormLabel>
                            <div className="flex gap-2 flex-wrap">
                              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                (day, index) => (
                                  <Button
                                    key={day}
                                    type="button"
                                    variant={
                                      field.value?.includes(index)
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => {
                                      const current = field.value || [];
                                      if (current.includes(index)) {
                                        field.onChange(
                                          current.filter((d) => d !== index)
                                        );
                                      } else {
                                        field.onChange([...current, index]);
                                      }
                                    }}
                                  >
                                    {day}
                                  </Button>
                                )
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="recurrence_end_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="never">Never</SelectItem>
                              <SelectItem value="count">After # of times</SelectItem>
                              <SelectItem value="until">On date</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("recurrence_end_type") === "count" && (
                      <FormField
                        control={form.control}
                        name="recurrence_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Occurrences</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("recurrence_end_type") === "until" && (
                      <FormField
                        control={form.control}
                        name="recurrence_until"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {appointment ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};