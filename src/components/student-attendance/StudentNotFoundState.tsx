
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function StudentNotFoundState() {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-16">
      <User className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
      <h2 className="text-xl font-semibold">Student not found</h2>
      <p className="text-muted-foreground mt-2">This student may have been removed or you don't have permission to view their details.</p>
      <Button variant="outline" className="mt-6" onClick={() => navigate('/attendance')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Attendance
      </Button>
    </div>
  );
}
