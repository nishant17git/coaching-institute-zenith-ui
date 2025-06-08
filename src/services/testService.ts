
import { supabase } from "@/integrations/supabase/client";
import { TestRecordDb, TestRecord, HistoryStats, SubjectStat } from "@/types";
import { isValid, parseISO } from "date-fns";

export const testService = {
  // Get all test records from test_results table
  async getTestRecords(): Promise<any[]> {
    const { data, error } = await supabase
      .from("test_results")
      .select(`
        *,
        students!inner(full_name, class),
        tests!inner(test_name, subject, test_date, test_type)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching test records:", error);
      throw error;
    }

    return data || [];
  },

  // Get test records for a specific student
  async getStudentTestRecords(studentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("test_results")
      .select(`
        *,
        tests!inner(test_name, subject, test_date, test_type)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching test records for student ${studentId}:`, error);
      throw error;
    }

    return data || [];
  },

  // Helper function to safely parse and validate dates
  safeParseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    try {
      const parsed = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
      return isValid(parsed) ? parsed : null;
    } catch (error) {
      console.warn('Invalid date value:', dateValue);
      return null;
    }
  },

  // Create a new test and test result
  async createTestRecord(testRecord: any): Promise<any> {
    // Validate and format the test date
    const testDate = this.safeParseDate(testRecord.test_date);
    if (!testDate) {
      throw new Error('Invalid test date provided');
    }

    // First create the test
    const { data: testData, error: testError } = await supabase
      .from("tests")
      .insert([{
        test_name: testRecord.test_name,
        subject: testRecord.subject,
        test_date: testDate.toISOString(),
        class: testRecord.class || 10,
        total_marks: testRecord.total_marks,
        test_type: testRecord.test_type
      }])
      .select()
      .single();

    if (testError) {
      console.error("Error creating test:", testError);
      throw testError;
    }

    // Then create the test result
    const { data: resultData, error: resultError } = await supabase
      .from("test_results")
      .insert([{
        student_id: testRecord.student_id,
        test_id: testData.id,
        marks_obtained: testRecord.marks,
        total_marks: testRecord.total_marks
      }])
      .select()
      .single();

    if (resultError) {
      console.error("Error creating test result:", resultError);
      throw resultError;
    }

    return resultData;
  },

  // Update a test result
  async updateTestRecord(id: string, testRecord: any): Promise<any> {
    const { data, error } = await supabase
      .from("test_results")
      .update({
        marks_obtained: testRecord.marks,
        total_marks: testRecord.total_marks
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating test result with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  // Delete a test result
  async deleteTestRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from("test_results")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting test result with ID ${id}:`, error);
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
      testRecords.reduce((sum, record) => sum + (record.marks_obtained / record.total_marks) * 100, 0) / totalTests
    );

    // Extract subjects with proper type checking and filtering
    const subjectsSet = new Set<string>();
    testRecords.forEach(record => {
      if (record.tests?.subject && typeof record.tests.subject === 'string') {
        subjectsSet.add(record.tests.subject);
      }
    });
    const subjects: string[] = Array.from(subjectsSet);

    // Calculate grade distribution
    const gradeDistribution = testRecords.reduce((grades, record) => {
      const percentage = (record.marks_obtained / record.total_marks) * 100;
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

    // Calculate progress data with safe date handling
    const progressData = testRecords.map(record => {
      const testDate = this.safeParseDate(record.tests?.test_date);
      return {
        date: testDate ? testDate.toISOString() : new Date().toISOString(),
        score: Math.round((record.marks_obtained / record.total_marks) * 100),
        subject: typeof record.tests?.subject === 'string' ? record.tests.subject : 'Unknown',
        test: typeof record.tests?.test_name === 'string' ? record.tests.test_name : 'Unknown Test'
      };
    });

    // Calculate subject performance with proper type checking
    const subjectPerformance: SubjectStat[] = subjects.map((subject: string) => {
      const subjectRecords = testRecords.filter(record => 
        typeof record.tests?.subject === 'string' && record.tests.subject === subject
      );
      const avgScore = Math.round(
        subjectRecords.reduce((sum, record) => sum + (record.marks_obtained / record.total_marks) * 100, 0) / subjectRecords.length
      );
      
      return {
        name: subject,
        score: avgScore,
        fill: this.getSubjectColor(subject)
      };
    });

    const bestSubject = subjectPerformance.length > 0 
      ? subjectPerformance.reduce((best, current) => 
          current.score > best.score ? current : best, subjectPerformance[0]
        )
      : null;

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

  // Map test result to TestRecord format
  mapToTestRecord(dbRecord: any, studentName: string): TestRecord {
    const testDate = this.safeParseDate(dbRecord.tests?.test_date);
    
    return {
      id: dbRecord.id,
      studentId: dbRecord.student_id,
      name: studentName,
      subject: dbRecord.tests?.subject || 'Unknown',
      date: testDate ? testDate.toISOString() : new Date().toISOString(),
      score: dbRecord.marks_obtained,
      maxScore: dbRecord.total_marks
    };
  }
};
