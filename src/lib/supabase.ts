import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface University {
  id: string
  name: string
  country: string
  ranking?: number
  logo_url?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  name: string
  university_id: string
  graduation_year: number
  total_citations: number
  h_index?: number
  research_interests: string[]
  profile_image_url?: string
  linkedin_url?: string
  google_scholar_url?: string
  created_at: string
  updated_at: string
}

export interface Publication {
  id: string
  candidate_id: string
  title: string
  authors: string[]
  venue: string
  year: number
  citations: number
  type?: 'conference' | 'journal' | 'workshop'
  doi?: string
  abstract?: string
  created_at: string
  updated_at: string
}

export interface ResearchTopic {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CandidateTopic {
  candidate_id: string
  topic_id: string
  created_at: string
}

export interface AcademicMetric {
  id: string
  university_id: string
  year: number
  publications_count: number
  total_citations: number
  h_index_avg: number
  conference_papers: number
  journal_papers: number
  created_at: string
  updated_at: string
}
