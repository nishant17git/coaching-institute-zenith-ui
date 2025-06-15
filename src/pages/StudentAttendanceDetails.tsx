
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EnhancedPageHeader } from "@/components/enhanced-page-header";
import { useStudentAttendance } from "@/hooks/useStudentAttendance";
import { StudentOverviewCard } from "@/components/student-attendance/StudentOverviewCard";
import { AttendanceHistoryCard } from "@/components/student-attendance/AttendanceHistoryCard";
import { StudentNotFoundState } from "@/components/student-attendance/StudentNotFoundState";
import { Suspense, lazy, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Use React.lazy for code splitting
const LazyAttendanceHistoryCard = lazy(() => 
  import("@/components/student-attendance/AttendanceHistoryCard").then(mod => ({ 
    default: mod.AttendanceHistoryCard 
  }))
);

export default function StudentAttendanceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    student,
    attendanceHistory,
    attendanceStats,
    isLoading
  } = useStudentAttendance(id);

  // Show loading toast for initial data fetch
  useEffect(() => {
    if (isLoading) {
      toast({
        title: "Loading attendance data",
        description: "Please wait while we fetch the attendance records."
      });
    }
  }, [isLoading, toast]);

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }} 
      className="space-y-6 container px-0 sm:px-4 mx-auto max-w-5xl"
    >
      <EnhancedPageHeader 
        title="Student Attendance" 
        showBackButton 
        onBack={() => navigate('/attendance')} 
      />

      {isLoading ? (
        renderLoadingSkeleton()
      ) : !student ? (
        <StudentNotFoundState />
      ) : (
        <div className="space-y-6">
          <StudentOverviewCard 
            student={student}
            attendanceStats={attendanceStats}
            attendanceHistory={attendanceHistory}
          />
          
          <Suspense fallback={renderLoadingSkeleton()}>
            <LazyAttendanceHistoryCard 
              attendanceHistory={attendanceHistory}
            />
          </Suspense>
        </div>
      )}
    </motion.div>
  );
}
