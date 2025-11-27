import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, LogOut, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PatientList } from "@/components/dashboard/PatientList";
import { AppointmentCalendar } from "@/components/dashboard/AppointmentCalendar";
import { PatientDetails } from "@/components/dashboard/PatientDetails";
import { PatientFormDialog } from "@/components/dashboard/PatientFormDialog";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "Come back soon!",
    });
    navigate('/');
  };

  const handleAddPatient = () => {
    setEditingPatient(null);
    setIsPatientFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsPatientFormOpen(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">NeuroFlow Systems</h1>
              <p className="text-sm text-muted-foreground">Patient Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedPatientId}>
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Patients</h2>
              <Button 
                className="bg-accent hover:bg-accent/90"
                onClick={handleAddPatient}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>
            <PatientList 
              onSelectPatient={setSelectedPatientId}
              selectedPatientId={selectedPatientId}
              onEditPatient={handleEditPatient}
            />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appointments</h2>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
            <AppointmentCalendar />
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedPatientId && (
              <PatientDetails patientId={selectedPatientId} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      <PatientFormDialog
        open={isPatientFormOpen}
        onOpenChange={setIsPatientFormOpen}
        patient={editingPatient}
      />
    </div>
  );
};

export default Dashboard;