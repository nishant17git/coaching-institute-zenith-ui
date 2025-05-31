
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export function useStudentAttendance(id: string | undefined) {
  // Fetch student details
  const {
    data: student,
    isLoading: studentLoading
  } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch student attendance history - Now 12 months instead of 3
  const {
    data: attendanceHistory = [],
    isLoading: attendanceLoading
  } = useQuery({
    queryKey: ['attendance', 'student', id],
    queryFn: async () => {
      if (!id) return [];

      // Get attendance for the past 12 months
      const twelveMonthsAgo = subMonths(new Date(), 12);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', id)
        .gte('date', format(twelveMonthsAgo, 'yyyy-MM-dd'))
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });

  // Calculate attendance stats
  const attendanceStats = {
    present: attendanceHistory?.filter(record => record.status === "Present").length || 0,
    absent: attendanceHistory?.filter(record => record.status === "Absent").length || 0,
    leave: attendanceHistory?.filter(record => record.status === "Leave").length || 0,
    holiday: attendanceHistory?.filter(record => record.status === "Holiday").length || 0,
    total: attendanceHistory?.length || 0,
    percentage: attendanceHistory?.length > 0 ? 
      Math.round(attendanceHistory.filter(record => record.status === "Present").length / attendanceHistory.length * 100) : 0
  };

  const isLoading = studentLoading || attendanceLoading;

  return {
    student,
    attendanceHistory,
    attendanceStats,
    isLoading
  };
}
