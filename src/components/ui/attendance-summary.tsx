
import React from "react";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";

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
  return <AttendanceSummary stats={stats} />;
}
