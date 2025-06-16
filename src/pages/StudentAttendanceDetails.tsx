
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
import { Calendar, Award, CreditCard, TrendingUp } from "lucide-react";

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

  // Create overview cards data
  const overviewCards = student && attendanceStats ? [
    {
      title: "Attendance",
      value: `${attendanceStats.percentage || 0}%`,
      description: `${attendanceStats.present || 0} of ${attendanceStats.total || 0} days`,
      icon: <Calendar className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Test Average",
      value: "N/A",
      description: "No test data",
      icon: <Award className="h-5 w-5" />,
      color: "green"
    },
    {
      title: "Fee Status",
      value: student.fee_status || "Unknown",
      description: `₹${student.paid_fees || 0} of ₹${student.total_fees || 0}`,
      icon: <CreditCard className="h-5 w-5" />,
      color: student.fee_status === 'Paid' ? 'green' : student.fee_status === 'Partial' ? 'yellow' : 'red'
    },
    {
      title: "Class Rank",
      value: "#-",
      description: "Coming soon",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "purple"
    }
  ] : [];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, index) => (
              <StudentOverviewCard 
                key={index}
                title={card.title}
                value={card.value}
                description={card.description}
                icon={card.icon}
                color={card.color}
              />
            ))}
          </div>
          
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
