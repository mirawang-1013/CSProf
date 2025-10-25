-- Research Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Universities table
CREATE TABLE universities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    ranking INTEGER,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Research topics table
CREATE TABLE research_topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Candidates table
CREATE TABLE candidates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    graduation_year INTEGER NOT NULL,
    total_citations INTEGER DEFAULT 0,
    h_index INTEGER DEFAULT 0,
    research_interests TEXT[] DEFAULT '{}',
    profile_image_url TEXT,
    linkedin_url TEXT,
    google_scholar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Publications table
CREATE TABLE publications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paper_id VARCHAR(255),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    topic_id VARCHAR(255),
    title TEXT NOT NULL,
    venue VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    citations INTEGER DEFAULT 0,
    doi TEXT,
    abstract TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Candidate-Topic many-to-many relationship
CREATE TABLE candidate_topics (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES research_topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (candidate_id, topic_id)
);

-- 6. Academic metrics for university comparison
CREATE TABLE academic_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    publications_count INTEGER DEFAULT 0,
    total_citations INTEGER DEFAULT 0,
    h_index_avg DECIMAL(5,2) DEFAULT 0,
    conference_papers INTEGER DEFAULT 0,
    journal_papers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(university_id, year)
);

-- Create indexes for better performance
CREATE INDEX idx_candidates_university_id ON candidates(university_id);
CREATE INDEX idx_candidates_graduation_year ON candidates(graduation_year);
CREATE INDEX idx_candidates_citations ON candidates(total_citations);
CREATE INDEX idx_publications_candidate_id ON publications(candidate_id);
CREATE INDEX idx_publications_paper_id ON publications(paper_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_citations ON publications(citations);
CREATE INDEX idx_academic_metrics_university_year ON academic_metrics(university_id, year);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_publications_updated_at BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_topics_updated_at BEFORE UPDATE ON research_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academic_metrics_updated_at BEFORE UPDATE ON academic_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - since no auth needed, we'll make all data publicly readable
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Allow public read access on candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Allow public read access on publications" ON publications FOR SELECT USING (true);
CREATE POLICY "Allow public read access on research_topics" ON research_topics FOR SELECT USING (true);
CREATE POLICY "Allow public read access on candidate_topics" ON candidate_topics FOR SELECT USING (true);
CREATE POLICY "Allow public read access on academic_metrics" ON academic_metrics FOR SELECT USING (true);
