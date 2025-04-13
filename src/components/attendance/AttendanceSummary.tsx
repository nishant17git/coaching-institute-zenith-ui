
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
      <Card className="glass-card">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Today's Attendance</p>
            <h3 className="text-2xl font-bold">{stats.attendancePercentage}%</h3>
            <p className="text-xs text-apple-blue">{stats.presentCount} of {stats.totalStudents}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <Calendar className="h-5 w-5 text-apple-blue" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Present</p>
            <h3 className="text-2xl font-bold">{stats.presentCount}</h3>
            <p className="text-xs text-apple-green">
              {stats.totalStudents > 0
                ? Math.round((stats.presentCount / stats.totalStudents) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <Check className="h-5 w-5 text-apple-green" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Absent</p>
            <h3 className="text-2xl font-bold">{stats.absentCount}</h3>
            <p className="text-xs text-apple-red">
              {stats.totalStudents > 0
                ? Math.round((stats.absentCount / stats.totalStudents) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-full">
            <X className="h-5 w-5 text-apple-red" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Leave</p>
            <h3 className="text-2xl font-bold">{stats.leaveCount}</h3>
            <p className="text-xs text-apple-orange">
              {stats.totalStudents > 0
                ? Math.round((stats.leaveCount / stats.totalStudents) * 100)
                : 0}%
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-full">
            <Clock className="h-5 w-5 text-apple-orange" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
