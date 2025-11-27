import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type Patient = Tables<"patients">;

const patientSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .max(20, "Phone must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  address: z.string()
    .trim()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  medical_history: z.string()
    .trim()
    .max(5000, "Medical history must be less than 5000 characters")
    .optional()
    .or(z.literal("")),
  notes: z.string()
    .trim()
    .max(2000, "Notes must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  emergency_contact_name: z.string()
    .trim()
    .max(100, "Emergency contact name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  emergency_contact_phone: z.string()
    .trim()
    .max(20, "Emergency phone must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  emergency_contact_relationship: z.string()
    .trim()
    .max(50, "Relationship must be less than 50 characters")
    .optional()
    .or(z.literal("")),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
}

export const PatientFormDialog = ({ open, onOpenChange, patient }: PatientFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient ? {
      full_name: patient.full_name,
      email: patient.email || "",
      phone: patient.phone || "",
      date_of_birth: patient.date_of_birth || "",
      address: patient.address || "",
      medical_history: patient.medical_history || "",
      notes: patient.notes || "",
      emergency_contact_name: patient.emergency_contact_name || "",
      emergency_contact_phone: patient.emergency_contact_phone || "",
      emergency_contact_relationship: patient.emergency_contact_relationship || "",
    } : {
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      address: "",
      medical_history: "",
      notes: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert empty strings to null for optional fields
      const cleanedData = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        address: data.address || null,
        medical_history: data.medical_history || null,
        notes: data.notes || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_contact_relationship: data.emergency_contact_relationship || null,
      };

      if (patient) {
        // Update existing patient
        const { error } = await supabase
          .from("patients")
          .update(cleanedData)
          .eq("id", patient.id);
        
        if (error) throw error;
      } else {
        // Create new patient
        const { error } = await supabase
          .from("patients")
          .insert({
            clinic_id: user.id,
            full_name: cleanedData.full_name,
            email: cleanedData.email,
            phone: cleanedData.phone,
            date_of_birth: cleanedData.date_of_birth,
            address: cleanedData.address,
            medical_history: cleanedData.medical_history,
            notes: cleanedData.notes,
            emergency_contact_name: cleanedData.emergency_contact_name,
            emergency_contact_phone: cleanedData.emergency_contact_phone,
            emergency_contact_relationship: cleanedData.emergency_contact_relationship,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: patient ? "Patient updated" : "Patient created",
        description: patient 
          ? "Patient information has been updated successfully." 
          : "New patient has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save patient information",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PatientFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
          <DialogDescription>
            {patient 
              ? "Update patient information and medical records." 
              : "Enter patient information and medical details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth")}
              />
              {errors.date_of_birth && (
                <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("address")}
                placeholder="123 Main St, City, State 12345"
                rows={2}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>
            
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Contact Name</Label>
              <Input
                id="emergency_contact_name"
                {...register("emergency_contact_name")}
                placeholder="Jane Doe"
              />
              {errors.emergency_contact_name && (
                <p className="text-sm text-destructive">{errors.emergency_contact_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  {...register("emergency_contact_phone")}
                  placeholder="+1 (555) 987-6543"
                />
                {errors.emergency_contact_phone && (
                  <p className="text-sm text-destructive">{errors.emergency_contact_phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  {...register("emergency_contact_relationship")}
                  placeholder="Spouse, Parent, Sibling, etc."
                />
                {errors.emergency_contact_relationship && (
                  <p className="text-sm text-destructive">{errors.emergency_contact_relationship.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Medical Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="medical_history">Medical History</Label>
              <Textarea
                id="medical_history"
                {...register("medical_history")}
                placeholder="Previous conditions, surgeries, allergies, medications..."
                rows={4}
              />
              {errors.medical_history && (
                <p className="text-sm text-destructive">{errors.medical_history.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional information..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              className="bg-accent hover:bg-accent/90"
            >
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {patient ? "Update Patient" : "Create Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};