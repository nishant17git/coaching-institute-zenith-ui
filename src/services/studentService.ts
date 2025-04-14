
import { supabase } from "@/integrations/supabase/client";
import { StudentRecord } from "@/types";

// Create a type assertion function to help TypeScript understand our tables
function createSupabaseServiceClient() {
  return supabase as any;
}

// Create an instance of the client with the type assertion
const supabaseClient = createSupabaseServiceClient();

export const studentService = {
  async getStudents(): Promise<StudentRecord[]> {
    const { data, error } = await supabaseClient
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
    const { data, error } = await supabaseClient
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
    const { data, error } = await supabaseClient
      .from("students")
      .insert([student])
      .select()
      .single();

    if (error) {
      console.error("Error creating student:", error);
      throw error;
    }

    return data;
  },

  async updateStudent(id: string, student: Partial<Omit<StudentRecord, "id" | "created_at" | "updated_at">>): Promise<StudentRecord> {
    const { data, error } = await supabaseClient
      .from("students")
      .update(student)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating student with ID ${id}:`, error);
      throw error;
    }

    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting student with ID ${id}:`, error);
      throw error;
    }
  },

  async getStudentsByClass(classNum: number): Promise<StudentRecord[]> {
    const { data, error } = await supabaseClient
      .from("students")
      .select("*")
      .eq("class", classNum)
      .order("roll_number", { ascending: true });

    if (error) {
      console.error(`Error fetching students for class ${classNum}:`, error);
      throw error;
    }

    return data || [];
  }
};
