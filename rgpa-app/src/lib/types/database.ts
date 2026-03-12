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
      projects: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          slug: string
          description: string | null
          category: 'residential' | 'commercial' | 'mixed-use'
          status: 'completed' | 'in-progress' | 'coming-soon' | 'archived'
          location: string | null
          year: number | null
          sq_footage: number | null
          featured_image_url: string | null
          body_content: Json | null
          testimonial: string | null
          client_name: string | null
          seo_title: string | null
          seo_description: string | null
          featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          slug: string
          description?: string | null
          category: 'residential' | 'commercial' | 'mixed-use'
          status?: 'completed' | 'in-progress' | 'coming-soon' | 'archived'
          location?: string | null
          year?: number | null
          sq_footage?: number | null
          featured_image_url?: string | null
          body_content?: Json | null
          testimonial?: string | null
          client_name?: string | null
          seo_title?: string | null
          seo_description?: string | null
          featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          slug?: string
          description?: string | null
          category?: 'residential' | 'commercial' | 'mixed-use'
          status?: 'completed' | 'in-progress' | 'coming-soon' | 'archived'
          location?: string | null
          year?: number | null
          sq_footage?: number | null
          featured_image_url?: string | null
          body_content?: Json | null
          testimonial?: string | null
          client_name?: string | null
          seo_title?: string | null
          seo_description?: string | null
          featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          project_id: string
          type: 'image' | 'video'
          url: string
          alt_text: string | null
          caption: string | null
          file_size: number | null
          dimensions: Json | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'image' | 'video'
          url: string
          alt_text?: string | null
          caption?: string | null
          file_size?: number | null
          dimensions?: Json | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'image' | 'video'
          url?: string
          alt_text?: string | null
          caption?: string | null
          file_size?: number | null
          dimensions?: Json | null
          sort_order?: number
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          bio: string | null
          image_url: string | null
          email: string | null
          social_links: Json | null
          sort_order: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          bio?: string | null
          image_url?: string | null
          email?: string | null
          social_links?: Json | null
          sort_order?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          bio?: string | null
          image_url?: string | null
          email?: string | null
          social_links?: Json | null
          sort_order?: number
          active?: boolean
          created_at?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          description: string | null
          icon_name: string | null
          featured_order: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          icon_name?: string | null
          featured_order?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon_name?: string | null
          featured_order?: number
          active?: boolean
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          client_name: string
          project_id: string | null
          content: string
          rating: number | null
          featured: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          project_id?: string | null
          content: string
          rating?: number | null
          featured?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          project_id?: string | null
          content?: string
          rating?: number | null
          featured?: boolean
          sort_order?: number
          created_at?: string
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

export type Project = Database['public']['Tables']['projects']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
