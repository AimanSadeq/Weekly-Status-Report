// lib/supabase/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_types: {
        Row: {
          id: string
          name: string
          is_consultant_only: boolean
          is_mandatory: boolean
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          is_consultant_only?: boolean
          is_mandatory?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_consultant_only?: boolean
          is_mandatory?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      department_activities: {
        Row: {
          id: string
          department_id: string
          activity_type_id: string
          created_at: string
        }
        Insert: {
          id?: string
          department_id: string
          activity_type_id: string
          created_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          activity_type_id?: string
          created_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          email: string
          full_name: string
          is_admin: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      employee_departments: {
        Row: {
          id: string
          employee_id: string
          department_id: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          department_id: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          department_id?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          employee_id: string
          report_date: string
          description: string
          units_completed: number | null
          percentage_complete: number | null
          activity_type_id: string | null
          department_id: string | null
          bsc_category: string | null
          status: string
          week_number: number | null
          year: number | null
          created_at: string
          updated_at: string
          submitted_at: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          report_date: string
          description: string
          units_completed?: number | null
          percentage_complete?: number | null
          activity_type_id?: string | null
          department_id?: string | null
          bsc_category?: string | null
          status?: string
          week_number?: number | null
          year?: number | null
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          report_date?: string
          description?: string
          units_completed?: number | null
          percentage_complete?: number | null
          activity_type_id?: string | null
          department_id?: string | null
          bsc_category?: string | null
          status?: string
          week_number?: number | null
          year?: number | null
          created_at?: string
          updated_at?: string
          submitted_at?: string | null
          reviewed_at?: string | null
        }
      }
      activity_feedback: {
        Row: {
          id: string
          activity_id: string
          commenter_id: string
          comment: string
          is_admin_comment: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          commenter_id: string
          comment: string
          is_admin_comment?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          commenter_id?: string
          comment?: string
          is_admin_comment?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: string
          title: string
          message: string | null
          related_activity_id: string | null
          is_read: boolean
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          recipient_id: string
          type: string
          title: string
          message?: string | null
          related_activity_id?: string | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: string
          title?: string
          message?: string | null
          related_activity_id?: string | null
          is_read?: boolean
          created_at?: string
          read_at?: string | null
        }
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
  }
}
