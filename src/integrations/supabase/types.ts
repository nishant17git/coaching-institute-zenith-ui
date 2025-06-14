export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance_records: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          date: string
          id: string
          marked_by: string | null
          period: number | null
          remarks: string | null
          status: string
          student_id: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date: string
          id?: string
          marked_by?: string | null
          period?: number | null
          remarks?: string | null
          status: string
          student_id: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          marked_by?: string | null
          period?: number | null
          remarks?: string | null
          status?: string
          student_id?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          estimated_time: string | null
          id: string
          name: string
          progress: number | null
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          name: string
          progress?: number | null
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          name?: string
          progress?: number | null
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure: {
        Row: {
          academic_year: string
          amount: number
          class: number
          created_at: string | null
          description: string | null
          fee_type: string
          frequency: string
          id: string
          is_mandatory: boolean | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          amount: number
          class: number
          created_at?: string | null
          description?: string | null
          fee_type: string
          frequency: string
          id?: string
          is_mandatory?: boolean | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          class?: number
          created_at?: string | null
          description?: string | null
          fee_type?: string
          frequency?: string
          id?: string
          is_mandatory?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fee_transactions: {
        Row: {
          academic_year: string
          amount: number
          created_at: string | null
          discount: number | null
          due_date: string | null
          id: string
          late_fee: number | null
          notes: string | null
          payment_date: string
          payment_mode: string
          purpose: string
          receipt_number: string
          student_id: string
          term: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          amount: number
          created_at?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          late_fee?: number | null
          notes?: string | null
          payment_date?: string
          payment_mode: string
          purpose: string
          receipt_number: string
          student_id: string
          term?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          late_fee?: number | null
          notes?: string | null
          payment_date?: string
          payment_mode?: string
          purpose?: string
          receipt_number?: string
          student_id?: string
          term?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: string
          created_at: string
          difficulty: string
          estimated_time: string | null
          explanation: string | null
          id: string
          is_favorite: boolean | null
          marks: number
          options: string[] | null
          question: string
          source: string | null
          topic_id: string
          type: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          difficulty: string
          estimated_time?: string | null
          explanation?: string | null
          id?: string
          is_favorite?: boolean | null
          marks?: number
          options?: string[] | null
          question: string
          source?: string | null
          topic_id: string
          type: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          difficulty?: string
          estimated_time?: string | null
          explanation?: string | null
          id?: string
          is_favorite?: boolean | null
          marks?: number
          options?: string[] | null
          question?: string
          source?: string | null
          topic_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          admission_date: string | null
          attendance_percentage: number | null
          blood_group: string | null
          class: number
          contact_number: string
          created_at: string | null
          date_of_birth: string
          email: string | null
          father_name: string
          fee_status: string | null
          full_name: string
          gender: string | null
          guardian_name: string | null
          id: string
          mother_name: string | null
          paid_fees: number | null
          roll_number: number
          status: string | null
          total_fees: number | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          admission_date?: string | null
          attendance_percentage?: number | null
          blood_group?: string | null
          class: number
          contact_number: string
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          father_name: string
          fee_status?: string | null
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          id?: string
          mother_name?: string | null
          paid_fees?: number | null
          roll_number: number
          status?: string | null
          total_fees?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          admission_date?: string | null
          attendance_percentage?: number | null
          blood_group?: string | null
          class?: number
          contact_number?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          father_name?: string
          fee_status?: string | null
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          id?: string
          mother_name?: string | null
          paid_fees?: number | null
          roll_number?: number
          status?: string | null
          total_fees?: number | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          class: number
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          class: number
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          class?: number
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          absent: boolean | null
          created_at: string | null
          grade: string | null
          id: string
          marks_obtained: number
          percentage: number | null
          rank: number | null
          remarks: string | null
          student_id: string
          test_id: string
          total_marks: number
          updated_at: string | null
        }
        Insert: {
          absent?: boolean | null
          created_at?: string | null
          grade?: string | null
          id?: string
          marks_obtained: number
          percentage?: number | null
          rank?: number | null
          remarks?: string | null
          student_id: string
          test_id: string
          total_marks: number
          updated_at?: string | null
        }
        Update: {
          absent?: boolean | null
          created_at?: string | null
          grade?: string | null
          id?: string
          marks_obtained?: number
          percentage?: number | null
          rank?: number | null
          remarks?: string | null
          student_id?: string
          test_id?: string
          total_marks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          class: number
          created_at: string | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          subject: string
          syllabus_covered: string | null
          test_date: string
          test_name: string
          test_type: string | null
          total_marks: number
          updated_at: string | null
        }
        Insert: {
          class: number
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          subject: string
          syllabus_covered?: string | null
          test_date: string
          test_name: string
          test_type?: string | null
          total_marks: number
          updated_at?: string | null
        }
        Update: {
          class?: number
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          subject?: string
          syllabus_covered?: string | null
          test_date?: string
          test_name?: string
          test_type?: string | null
          total_marks?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          chapter_id: string
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          last_used: string | null
          name: string
          type: string | null
          updated_at: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          last_used?: string | null
          name: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          last_used?: string | null
          name?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
