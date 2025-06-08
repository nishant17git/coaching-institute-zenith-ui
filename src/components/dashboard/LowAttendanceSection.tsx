import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, ChevronRight, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export function LowAttendanceSection() {
  const navigate = useNavigate();
  const {
    data: lowAttendanceStudents = []
  } = useQuery({
    queryKey: ['lowAttendanceStudents'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('students').select('*').lt('attendance_percentage', 75).order('attendance_percentage', {
        ascending: true
      }).limit(5);
      if (error) throw error;
      return data || [];
    }
  });
  return <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle className="font-geist flex items-center gap-2 text-xl">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Low Attendance
        </CardTitle>
        <CardDescription className="font-geist text-sm">
          Students with less than 75% attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-geist">Name</TableHead>
                <TableHead className="hidden sm:table-cell font-geist">Class</TableHead>
                <TableHead className="text-right font-geist">Attendance</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowAttendanceStudents.map(student => <TableRow key={student.id}>
                  <TableCell className="font-medium font-geist">{student.full_name}</TableCell>
                  <TableCell className="hidden sm:table-cell font-geist">Class {student.class}</TableCell>
                  <TableCell className="text-right">
                    <span className={(student.attendance_percentage || 0) < 60 ? "text-red-600 font-medium font-geist" : "text-orange-600 font-medium font-geist"}>
                      {student.attendance_percentage || 0}%
                    </span>
                  </TableCell>
                  <TableCell className="w-10 p-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/students/${student.id}`)} className="p-1.5 h-auto">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>)}
              {lowAttendanceStudents.length === 0 && <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 font-geist">
                    All students have good attendance
                  </TableCell>
                </TableRow>}
            </TableBody>
          </Table>
        </div>
        <Button variant="ghost" className="w-full mt-4 font-geist" onClick={() => navigate('/attendance')}>
          View Attendance <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>;
}