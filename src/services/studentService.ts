
import { supabase } from "@/integrations/supabase/client";
import { StudentRecord } from "@/types";

export const studentService = {
  async getStudents(): Promise<StudentRecord[]> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("class", { ascending: true })
      .order("roll_number", { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      throw error;
    }

    return data || [];
  },

  async getStudentById(id: string): Promise<StudentRecord> {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching student with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  async createStudent(student: Omit<StudentRecord, "id" | "created_at" | "updated_at">): Promise<StudentRecord> {
    // Cast the table name to any to avoid TypeScript errors
    // This is needed until the Supabase types are properly generated
    const { data, error } = await (supabase
      .from("students" as any)
      .insert([student])
      .select()
      .single());

    if (error) {
      console.error("Error creating student:", error);
      throw error;
    }

    return data;
  },

  async updateStudent(id: string, student: Partial<Omit<StudentRecord, "id" | "created_at" | "updated_at">>): Promise<StudentRecord> {
    // Cast the table name to any to avoid TypeScript errors
    const { data, error } = await (supabase
      .from("students" as any)
      .update(student)
      .eq("id", id)
      .select()
      .single());

    if (error) {
      console.error(`Error updating student with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    // Cast the table name to any to avoid TypeScript errors
    const { error } = await (supabase
      .from("students" as any)
      .delete()
      .eq("id", id));

    if (error) {
      console.error(`Error deleting student with ID ${id}:`, error);
      throw error;
    }
  },

  async getStudentsByClass(classNum: number): Promise<StudentRecord[]> {
    // Cast the table name to any to avoid TypeScript errors
    const { data, error } = await (supabase
      .from("students" as any)
      .select("*")
      .eq("class", classNum)
      .order("roll_number", { ascending: true }));

    if (error) {
      console.error(`Error fetching students for class ${classNum}:`, error);
      throw error;
    }

    return data || [];
  }
};
