
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Clock, Calendar } from "lucide-react";

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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:col-span-1">
      <Card className="glass-card bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Today's Attendance</p>
            <h3 className="text-3xl font-bold mt-1">{stats.attendancePercentage}%</h3>
            <p className="text-xs text-apple-blue mt-1">{stats.presentCount} of {stats.totalStudents}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <Calendar className="h-6 w-6 text-apple-blue" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Present</p>
            <h3 className="text-3xl font-bold mt-1">{stats.presentCount}</h3>
            <p className="text-xs text-apple-green mt-1">
              {stats.totalStudents > 0
                ? Math.round((stats.presentCount / stats.totalStudents) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl">
            <Check className="h-6 w-6 text-apple-green" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Absent</p>
            <h3 className="text-3xl font-bold mt-1">{stats.absentCount}</h3>
            <p className="text-xs text-apple-red mt-1">
              {stats.totalStudents > 0
                ? Math.round((stats.absentCount / stats.totalStudents) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-xl">
            <X className="h-6 w-6 text-apple-red" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Leave</p>
            <h3 className="text-3xl font-bold mt-1">{stats.leaveCount}</h3>
            <p className="text-xs text-apple-orange mt-1">
              {stats.totalStudents > 0
                ? Math.round((stats.leaveCount / stats.totalStudents) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl">
            <Clock className="h-6 w-6 text-apple-orange" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
