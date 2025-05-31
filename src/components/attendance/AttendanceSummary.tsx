
import { motion } from "framer-motion";
import { AttendanceStatCard } from "./AttendanceStatCard";

interface AttendanceSummaryProps {
  stats: {
    presentCount: number;
    absentCount: number;
    leaveCount: number;
    totalStudents: number;
    attendancePercentage: number;
  };
}

export function AttendanceSummary({ stats }: AttendanceSummaryProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      <AttendanceStatCard
        type="total"
        count={stats.totalStudents}
        label="Overall"
        percentage={stats.attendancePercentage}
      />
      
      <AttendanceStatCard
        type="present"
        count={stats.presentCount}
        label="Present"
        percentage={stats.totalStudents > 0 ? Math.round((stats.presentCount / stats.totalStudents) * 100) : 0}
      />
      
      <AttendanceStatCard
        type="absent"
        count={stats.absentCount}
        label="Absent"
        percentage={stats.totalStudents > 0 ? Math.round((stats.absentCount / stats.totalStudents) * 100) : 0}
      />
      
      <AttendanceStatCard
        type="leave"
        count={stats.leaveCount}
        label="Leave"
        percentage={stats.totalStudents > 0 ? Math.round((stats.leaveCount / stats.totalStudents) * 100) : 0}
      />
    </motion.div>
  );
}
