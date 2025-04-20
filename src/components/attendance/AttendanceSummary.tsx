
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
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
      <Card className="bg-white/50 backdrop-blur-sm border">
        <CardContent className="p-4 flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Today's Attendance</p>
            <h3 className="text-2xl font-bold mt-1">{stats.attendancePercentage}%</h3>
            <p className="text-xs text-apple-blue mt-0.5">{stats.presentCount} of {stats.totalStudents}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-apple-blue" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border">
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
          <div className="bg-green-50 p-2 rounded-lg">
            <Check className="h-5 w-5 text-apple-green" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border">
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
          <div className="bg-red-50 p-2 rounded-lg">
            <X className="h-5 w-5 text-apple-red" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border">
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
          <div className="bg-orange-50 p-2 rounded-lg">
            <Clock className="h-5 w-5 text-apple-orange" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
