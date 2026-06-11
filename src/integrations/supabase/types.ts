export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      mentor_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_usage: {
        Row: {
          ai_messages: number
          id: string
          job_applications: number
          period: string
          resume_analyses: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_messages?: number
          id?: string
          job_applications?: number
          period: string
          resume_analyses?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_messages?: number
          id?: string
          job_applications?: number
          period?: string
          resume_analyses?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pro_waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch: string | null
          career_score: number
          confidence_level: number | null
          created_at: string
          current_skills: string[] | null
          dream_companies: string[] | null
          email: string | null
          full_name: string | null
          id: string
          is_pro: boolean
          onboarded: boolean
          target_career: string | null
          updated_at: string
          user_id: string
          weekly_hours: number | null
          year: number | null
        }
        Insert: {
          branch?: string | null
          career_score?: number
          confidence_level?: number | null
          created_at?: string
          current_skills?: string[] | null
          dream_companies?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_pro?: boolean
          onboarded?: boolean
          target_career?: string | null
          updated_at?: string
          user_id: string
          weekly_hours?: number | null
          year?: number | null
        }
        Update: {
          branch?: string | null
          career_score?: number
          confidence_level?: number | null
          created_at?: string
          current_skills?: string[] | null
          dream_companies?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_pro?: boolean
          onboarded?: boolean
          target_career?: string | null
          updated_at?: string
          user_id?: string
          weekly_hours?: number | null
          year?: number | null
        }
        Relationships: []
      }
      readiness_scores: {
        Row: {
          certifications_score: number
          estimated_weeks: number
          id: string
          improvement_plan: Json
          linkedin_score: number
          missing_items: Json
          projects_score: number
          resume_score: number
          roadmap_score: number
          skills_score: number
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications_score?: number
          estimated_weeks?: number
          id?: string
          improvement_plan?: Json
          linkedin_score?: number
          missing_items?: Json
          projects_score?: number
          resume_score?: number
          roadmap_score?: number
          skills_score?: number
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications_score?: number
          estimated_weeks?: number
          id?: string
          improvement_plan?: Json
          linkedin_score?: number
          missing_items?: Json
          projects_score?: number
          resume_score?: number
          roadmap_score?: number
          skills_score?: number
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_analyses: {
        Row: {
          ats_score: number
          created_at: string
          experience_score: number
          feedback: Json
          file_name: string
          formatting_score: number
          id: string
          keyword_score: number
          overall_score: number
          project_score: number
          target_role: string | null
          user_id: string
        }
        Insert: {
          ats_score?: number
          created_at?: string
          experience_score?: number
          feedback?: Json
          file_name: string
          formatting_score?: number
          id?: string
          keyword_score?: number
          overall_score?: number
          project_score?: number
          target_role?: string | null
          user_id: string
        }
        Update: {
          ats_score?: number
          created_at?: string
          experience_score?: number
          feedback?: Json
          file_name?: string
          formatting_score?: number
          id?: string
          keyword_score?: number
          overall_score?: number
          project_score?: number
          target_role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          id: string
          semesters: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          semesters?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          semesters?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_gap_results: {
        Row: {
          created_at: string
          estimated_weeks: number
          id: string
          learning_plan: Json
          match_percentage: number
          matched_skills: Json
          missing_skills: Json
          required_skills: Json
          target_role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_weeks?: number
          id?: string
          learning_plan?: Json
          match_percentage?: number
          matched_skills?: Json
          missing_skills?: Json
          required_skills?: Json
          target_role: string
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_weeks?: number
          id?: string
          learning_plan?: Json
          match_percentage?: number
          matched_skills?: Json
          missing_skills?: Json
          required_skills?: Json
          target_role?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_tasks: {
        Row: {
          created_at: string
          id: string
          tasks: Json
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          tasks?: Json
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          tasks?: Json
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
