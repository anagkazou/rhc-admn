export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type SubmissionRow = {
  created_at: string | null
  email: string
  id: number
  message: string
  telegram_username: string
}

type SubmissionInsert = {
  created_at?: string | null
  email: string
  id?: number
  message: string
  telegram_username: string
}

type SubmissionUpdate = {
  created_at?: string | null
  email?: string
  id?: number
  message?: string
  telegram_username?: string
}

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: SubmissionRow
        Insert: SubmissionInsert
        Update: SubmissionUpdate
        Relationships: []
      }
      partner_submissions: {
        Row: SubmissionRow
        Insert: SubmissionInsert
        Update: SubmissionUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      list_admin_sessions: {
        Args: never
        Returns: {
          id: string
          user_id: string
          email: string
          created_at: string
          refreshed_at: string | null
          not_after: string | null
          user_agent: string | null
          ip: string | null
        }[]
      }
      terminate_session: {
        Args: { target_session_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type AdminSession =
  Database['public']['Functions']['list_admin_sessions']['Returns'][number]

export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type PartnerSubmission = Database['public']['Tables']['partner_submissions']['Row']
export type Submission = ContactSubmission | PartnerSubmission
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type SubmissionTable = 'contact_submissions' | 'partner_submissions'
