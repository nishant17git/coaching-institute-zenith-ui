
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <motion.div variants={item} className="w-full">
        <Card className="bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Today's Attendance</p>
              <h3 className="text-2xl font-bold mt-1">{stats.attendancePercentage}%</h3>
              <p className="text-xs text-apple-blue mt-0.5">{stats.presentCount} of {stats.totalStudents}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl">
              <Calendar className="h-5 w-5 text-apple-blue" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="w-full mt-3">
        <Card className="bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Present</p>
              <h3 className="text-2xl font-bold mt-1">{stats.presentCount}</h3>
              <p className="text-xs text-apple-green mt-0.5">
                {stats.totalStudents > 0
                  ? Math.round((stats.presentCount / stats.totalStudents) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-green-50 p-2 rounded-xl">
              <Check className="h-5 w-5 text-apple-green" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="w-full mt-3">
        <Card className="bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Absent</p>
              <h3 className="text-2xl font-bold mt-1">{stats.absentCount}</h3>
              <p className="text-xs text-apple-red mt-0.5">
                {stats.totalStudents > 0
                  ? Math.round((stats.absentCount / stats.totalStudents) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-red-50 p-2 rounded-xl">
              <X className="h-5 w-5 text-apple-red" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="w-full mt-3">
        <Card className="bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Leave</p>
              <h3 className="text-2xl font-bold mt-1">{stats.leaveCount}</h3>
              <p className="text-xs text-apple-orange mt-0.5">
                {stats.totalStudents > 0
                  ? Math.round((stats.leaveCount / stats.totalStudents) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-orange-50 p-2 rounded-xl">
              <Clock className="h-5 w-5 text-apple-orange" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
