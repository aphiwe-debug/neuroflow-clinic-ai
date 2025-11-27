import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Patient = Tables<"patients">;
type AIRecommendation = Tables<"ai_recommendations">;

interface PatientDetailsProps {
  patientId: string;
}

export const PatientDetails = ({ patientId }: PatientDetailsProps) => {
  const [symptoms, setSymptoms] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) throw error;
      return data as Patient;
    },
  });

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AIRecommendation[];
    },
  });

  const generateRecommendations = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-treatment-recommendations', {
        body: {
          patientId,
          medicalHistory: patient?.medical_history || '',
          symptoms,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Recommendations generated",
        description: "AI-powered treatment recommendations are ready.",
      });
      queryClient.invalidateQueries({ queryKey: ['recommendations', patientId] });
      setSymptoms("");
    },
    onError: (error: any) => {
      toast({
        title: "Error generating recommendations",
        description: error.message || "Failed to generate recommendations",
        variant: "destructive",
      });
    },
  });

  if (patientLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Patient not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{patient.full_name}</CardTitle>
          <CardDescription>Patient Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{patient.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{patient.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {patient.date_of_birth 
                  ? new Date(patient.date_of_birth).toLocaleDateString()
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{patient.address || 'Not provided'}</p>
            </div>
          </div>

          {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3 font-semibold">Emergency Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {patient.emergency_contact_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{patient.emergency_contact_name}</p>
                  </div>
                )}
                {patient.emergency_contact_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient.emergency_contact_phone}</p>
                  </div>
                )}
                {patient.emergency_contact_relationship && (
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium">{patient.emergency_contact_relationship}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {patient.medical_history && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Medical History</p>
              <p className="text-sm whitespace-pre-wrap">{patient.medical_history}</p>
            </div>
          )}

          {patient.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            AI Treatment Recommendations
          </CardTitle>
          <CardDescription>
            Generate evidence-based treatment recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Symptoms (Optional)</label>
            <Textarea
              placeholder="Describe current symptoms or concerns..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
            />
          </div>
          <Button 
            onClick={() => generateRecommendations.mutate()}
            disabled={generateRecommendations.isPending}
            className="w-full bg-accent hover:bg-accent/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateRecommendations.isPending 
              ? "Generating..." 
              : "Generate Recommendations"}
          </Button>
        </CardContent>
      </Card>

      {recsLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Previous Recommendations
          </h3>
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardDescription>
                    {new Date(rec.created_at).toLocaleString()}
                  </CardDescription>
                  {rec.confidence_score && (
                    <Badge variant="secondary">
                      Confidence: {Math.round(rec.confidence_score * 100)}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{rec.recommendation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};