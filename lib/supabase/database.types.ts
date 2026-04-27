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
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type PartnerSubmission = Database['public']['Tables']['partner_submissions']['Row']
export type Submission = ContactSubmission | PartnerSubmission
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type SubmissionTable = 'contact_submissions' | 'partner_submissions'
