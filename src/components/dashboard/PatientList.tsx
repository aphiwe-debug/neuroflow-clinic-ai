import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Edit } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;

interface PatientListProps {
  onSelectPatient: (patientId: string) => void;
  selectedPatientId: string | null;
  onEditPatient: (patient: Patient) => void;
}

export const PatientList = ({ onSelectPatient, selectedPatientId, onEditPatient }: PatientListProps) => {
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Patient[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No patients yet. Add your first patient to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => (
        <Card 
          key={patient.id}
          className={`cursor-pointer transition-all hover:shadow-card ${
            selectedPatientId === patient.id ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardHeader onClick={() => onSelectPatient(patient.id)}>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {patient.full_name}
                </CardTitle>
                <CardDescription>
                  {patient.email || 'No email provided'}
                </CardDescription>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPatient(patient);
                }}
                className="shrink-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent onClick={() => onSelectPatient(patient.id)}>
            <div className="space-y-1 text-sm">
              {patient.phone && (
                <p className="text-muted-foreground">📞 {patient.phone}</p>
              )}
              {patient.date_of_birth && (
                <p className="text-muted-foreground">
                  🎂 {new Date(patient.date_of_birth).toLocaleDateString()}
                </p>
              )}
              {patient.emergency_contact_name && (
                <p className="text-muted-foreground">
                  🚨 Emergency: {patient.emergency_contact_name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};