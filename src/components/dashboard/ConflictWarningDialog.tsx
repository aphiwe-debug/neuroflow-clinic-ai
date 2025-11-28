import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Conflict {
  id: string;
  title: string;
  patient_name: string;
  start_time: string;
  end_time: string;
}

interface ConflictWarningDialogProps {
  open: boolean;
  conflicts: Conflict[];
  onCancel: () => void;
  onProceed: () => void;
}

export const ConflictWarningDialog = ({
  open,
  conflicts,
  onCancel,
  onProceed,
}: ConflictWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Scheduling Conflict Detected</AlertDialogTitle>
              <AlertDialogDescription>
                This appointment overlaps with {conflicts.length} existing{" "}
                {conflicts.length === 1 ? "appointment" : "appointments"}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3 my-4">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="p-4 rounded-lg border bg-muted/50 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{conflict.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{conflict.patient_name}</span>
                  </div>
                </div>
                <Badge variant="destructive">Conflict</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(conflict.start_time), "MMM d, yyyy h:mm a")} -{" "}
                  {format(new Date(conflict.end_time), "h:mm a")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Warning:</strong> Double-booking may cause scheduling issues and
            patient confusion. Consider rescheduling to avoid conflicts.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onProceed}
            className="bg-destructive hover:bg-destructive/90"
          >
            Book Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};