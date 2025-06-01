
import { supabase } from "@/integrations/supabase/client";
import { AttendanceRecord } from "@/types";

export const attendanceService = {
  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*")
      .eq("date", date);

    if (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }

    return data.map(record => ({
      id: record.id,
      studentId: record.student_id,
      date: record.date,
      status: record.status
    })) || [];
  },

  async markAttendance(records: { studentId: string; date: string; status: string }[]): Promise<void> {
    const dbRecords = records.map(record => ({
      student_id: record.studentId,
      date: record.date,
      status: record.status
    }));

    const { error } = await supabase
      .from("attendance_records")
      .upsert(dbRecords, {
        onConflict: 'student_id,date',
        ignoreDuplicates: false
      });

    if (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  }
};
