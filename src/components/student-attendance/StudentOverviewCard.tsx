import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportAttendanceToPDF } from "@/services/pdfService";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
interface StudentOverviewCardProps {
  student: any;
  attendanceStats: {
    present: number;
    absent: number;
    leave: number;
    holiday: number;
    total: number;
    percentage: number;
  };
  attendanceHistory: any[];
}
export function StudentOverviewCard({
  student,
  attendanceStats,
  attendanceHistory
}: StudentOverviewCardProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Helper functions
  const getInitials = (name: string = "") => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  // Handle PDF export
  const handleExportPDF = () => {
    if (!student) return;

    // Format attendance records for PDF - properly cast the status to the correct type
    const records = attendanceHistory.map(record => ({
      id: record.id,
      studentId: record.student_id,
      date: record.date,
      status: record.status as "Present" | "Absent" | "Leave" | "Holiday"
    }));

    // Calculate attendance percentage
    const presentCount = records.filter(r => r.status === 'Present').length;
    const totalDays = records.length;
    const attendancePercentage = totalDays > 0 ? Math.round(presentCount / totalDays * 100) : 0;

    // Export as PDF
    exportAttendanceToPDF({
      records,
      studentData: {
        id: student.id,
        name: student.full_name,
        class: student.class,
        attendancePercentage
      },
      title: "Student Attendance Report",
      subtitle: `Attendance Report for ${student.full_name} - Class ${student.class}`,
      chartImage: null // We could add a chart image in the future
    });
    toast.success("PDF exported successfully", {
      description: `Attendance report for ${student.full_name} has been downloaded`
    });
  };
  return <Card className="bg-white shadow-sm border overflow-hidden">
      <div className="h-12 bg-gradient-to-r from-[#FF00AA] to-[#FF7722]"></div>
      <div className="px-4 sm:px-6 pb-6 pt-0 relative">
        <Avatar className="h-16 sm:h-20 w-16 sm:w-20 -mt-8 sm:-mt-10 border-4 border-white shadow-sm">
          <AvatarFallback className={cn("text-base sm:text-xl", attendanceStats.percentage >= 90 ? "bg-emerald-100 text-emerald-700" : attendanceStats.percentage >= 75 ? "bg-blue-100 text-blue-700" : attendanceStats.percentage >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
            {getInitials(student.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{student.full_name}</h2>
            <div className="text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-3">
                <div>Class {student.class}</div>
                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                <div>Roll #{student.roll_number || student.id.slice(-4)}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              {!isMobile && "Export"} PDF
            </Button>
            <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              {!isMobile && "Share"} Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div>
            <h3 className="font-medium mb-2 text-base">Attendance Overview</h3>
            <div className="bg-gray-50 border rounded-lg p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Attendance Rate</div>
                <div className={cn("text-base sm:text-lg font-bold", attendanceStats.percentage >= 90 ? "text-emerald-600" : attendanceStats.percentage >= 75 ? "text-blue-600" : attendanceStats.percentage >= 50 ? "text-amber-600" : "text-red-600")}>
                  {attendanceStats.percentage}%
                </div>
              </div>
              <Progress value={attendanceStats.percentage} className="h-2" indicatorClassName={attendanceStats.percentage >= 90 ? "bg-emerald-500" : attendanceStats.percentage >= 75 ? "bg-blue-500" : attendanceStats.percentage >= 50 ? "bg-amber-500" : "bg-red-500"} />
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-600"></div>
                  <span className="sm:text-sm text-sm">Present: {attendanceStats.present}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ff0000]"></div>
                  <span className="sm:text-sm text-sm">Absent: {attendanceStats.absent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="sm:text-sm text-sm">Leave: {attendanceStats.leave}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="sm:text-sm text-sm">Total: {attendanceStats.total}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-base">Student Information</h3>
            <div className="bg-gray-50 border rounded-lg p-3 sm:p-4 space-y-2">
              {student.contact_number && <div className="flex justify-between">
                  <span className="sm:text-sm text-muted-foreground text-sm">Contact:</span>
                  <span className="sm:text-sm font-medium text-sm">{student.contact_number}</span>
                </div>}
              {student.aadhaar_number && <div className="flex justify-between">
                  <span className="sm:text-sm text-muted-foreground text-sm">Aadhaar:</span>
                  <span className="sm:text-sm font-medium text-sm">{student.aadhaar_number}</span>
                </div>}
              {student.guardian_name && <div className="flex justify-between">
                  <span className="sm:text-sm text-muted-foreground text-sm">Parent:</span>
                  <span className="sm:text-sm font-medium text-sm">{student.guardian_name}</span>
                </div>}
              {student.address && <div className="flex justify-between">
                  <span className="sm:text-sm text-muted-foreground text-sm">Address:</span>
                  <span className="sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[250px] text-sm">{student.address}</span>
                </div>}
              {student.gender && <div className="flex justify-between">
                  <span className="sm:text-sm text-muted-foreground text-sm">Gender:</span>
                  <span className="sm:text-sm font-medium text-sm">{student.gender}</span>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </Card>;
}