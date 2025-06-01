
import React from "react";

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
          Total Students
        </div>
        <div className="text-2xl font-bold">{stats.totalStudents}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">{stats.attendancePercentage}% Overall</div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-2">
          Present
        </div>
        <div className="text-2xl font-bold">{stats.presentCount}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {stats.totalStudents > 0 ? Math.round((stats.presentCount / stats.totalStudents) * 100) : 0}%
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-b-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 mb-2">
          Absent
        </div>
        <div className="text-2xl font-bold">{stats.absentCount}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {stats.totalStudents > 0 ? Math.round((stats.absentCount / stats.totalStudents) * 100) : 0}%
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
          Leave
        </div>
        <div className="text-2xl font-bold">{stats.leaveCount}</div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {stats.totalStudents > 0 ? Math.round((stats.leaveCount / stats.totalStudents) * 100) : 0}%
        </div>
      </div>
    </div>
  );
}
