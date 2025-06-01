
import { supabase } from "@/integrations/supabase/client";
import { TestRecordDb, TestRecord, HistoryStats, SubjectStat } from "@/types";

export const testService = {
  // Get all test records
  async getTestRecords(): Promise<TestRecordDb[]> {
    const { data, error } = await supabase
      .from("test_records")
      .select("*")
      .order("test_date", { ascending: false });

    if (error) {
      console.error("Error fetching test records:", error);
      throw error;
    }

    return data || [];
  },

  // Get test records for a specific student
  async getStudentTestRecords(studentId: string): Promise<TestRecordDb[]> {
    const { data, error } = await supabase
      .from("test_records")
      .select("*")
      .eq("student_id", studentId)
      .order("test_date", { ascending: false });

    if (error) {
      console.error(`Error fetching test records for student ${studentId}:`, error);
      throw error;
    }

    return data || [];
  },

  // Create a new test record
  async createTestRecord(testRecord: Omit<TestRecordDb, "id">): Promise<TestRecordDb> {
    const { data, error } = await supabase
      .from("test_records")
      .insert([testRecord])
      .select()
      .single();

    if (error) {
      console.error("Error creating test record:", error);
      throw error;
    }

    return data;
  },

  // Update a test record
  async updateTestRecord(id: string, testRecord: Partial<Omit<TestRecordDb, "id">>): Promise<TestRecordDb> {
    const { data, error } = await supabase
      .from("test_records")
      .update(testRecord)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating test record with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  // Delete a test record
  async deleteTestRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from("test_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting test record with ID ${id}:`, error);
      throw error;
    }
  },

  // Get test history statistics for a student
  async getStudentTestHistory(studentId: string): Promise<HistoryStats> {
    const testRecords = await this.getStudentTestRecords(studentId);
    
    if (!testRecords.length) {
      return {
        totalTests: 0,
        averageScore: 0,
        subjects: [],
        gradeDistribution: [],
        progressData: [],
        subjectPerformance: [],
        bestSubject: null,
        latestTest: null
      };
    }

    const totalTests = testRecords.length;
    const averageScore = Math.round(
      testRecords.reduce((sum, record) => sum + (record.marks / record.total_marks) * 100, 0) / totalTests
    );

    const subjects = [...new Set(testRecords.map(record => record.subject))];

    // Calculate grade distribution
    const gradeDistribution = testRecords.reduce((grades, record) => {
      const percentage = (record.marks / record.total_marks) * 100;
      let grade: string;
      let color: string;

      if (percentage >= 90) {
        grade = "A+";
        color = "#10B981";
      } else if (percentage >= 80) {
        grade = "A";
        color = "#3B82F6";
      } else if (percentage >= 70) {
        grade = "B";
        color = "#8B5CF6";
      } else if (percentage >= 60) {
        grade = "C";
        color = "#F59E0B";
      } else {
        grade = "D";
        color = "#EF4444";
      }

      const existing = grades.find(g => g.name === grade);
      if (existing) {
        existing.count++;
      } else {
        grades.push({ name: grade, count: 1, color });
      }

      return grades;
    }, [] as { name: string; count: number; color: string }[]);

    // Calculate progress data
    const progressData = testRecords.map(record => ({
      date: record.test_date,
      score: Math.round((record.marks / record.total_marks) * 100),
      subject: record.subject,
      test: record.test_name
    }));

    // Calculate subject performance
    const subjectPerformance: SubjectStat[] = subjects.map(subject => {
      const subjectRecords = testRecords.filter(record => record.subject === subject);
      const avgScore = Math.round(
        subjectRecords.reduce((sum, record) => sum + (record.marks / record.total_marks) * 100, 0) / subjectRecords.length
      );
      
      return {
        name: subject,
        score: avgScore,
        fill: this.getSubjectColor(subject)
      };
    });

    const bestSubject = subjectPerformance.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const latestTest = testRecords[0] || null;

    return {
      totalTests,
      averageScore,
      subjects,
      gradeDistribution,
      progressData,
      subjectPerformance,
      bestSubject,
      latestTest
    };
  },

  // Helper function to get consistent colors for subjects
  getSubjectColor(subject: string): string {
    const colors: Record<string, string> = {
      'Mathematics': '#3B82F6',
      'Physics': '#8B5CF6',
      'Chemistry': '#10B981',
      'Biology': '#F59E0B',
      'English': '#EF4444',
      'Science': '#06B6D4',
      'Social Studies': '#EC4899',
      'Hindi': '#84CC16',
      'Computer Science': '#6366F1'
    };
    
    return colors[subject] || '#6B7280';
  },

  // Map TestRecordDb to TestRecord format
  mapToTestRecord(dbRecord: TestRecordDb, studentName: string): TestRecord {
    return {
      id: dbRecord.id,
      studentId: dbRecord.student_id,
      name: studentName,
      subject: dbRecord.subject,
      date: dbRecord.test_date,
      score: dbRecord.marks,
      maxScore: dbRecord.total_marks
    };
  }
};
