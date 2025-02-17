export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'instructor'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'student' | 'instructor'
        }
        Update: {
          email?: string
          full_name?: string
          role?: 'student' | 'instructor'
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string
          instructor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string
          instructor_id: string
        }
        Update: {
          name?: string
          description?: string
        }
      }
      course_enrollments: {
        Row: {
          course_id: string
          user_id: string
          enrolled_at: string
        }
        Insert: {
          course_id: string
          user_id: string
          enrolled_at?: string
        }
      }
      // Add other table types as needed
    }
  }
} 