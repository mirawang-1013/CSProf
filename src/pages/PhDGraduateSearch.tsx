import React, { useState, useEffect, useCallback } from 'react';
import { SearchInterface, type SearchFilters } from '../components/SearchInterface';
import { UniversityList } from '../components/UniversityList';
import { CandidateProfile } from '../components/CandidateProfile';
import type { Candidate } from '../data/mockData';
import { fetchUniversitiesWithCandidates, type SearchFilters as DBSearchFilters } from '../api/research';

export default function PhDGraduateSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    yearRange: { start: 2020, end: 2024 },
    minCitations: 0,
    selectedTopics: [],
    viewMode: 'by-university',
    topPercentile: 0
  });
  
  const [filteredUniversities, setFilteredUniversities] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleSearch = useCallback(async (preserveSelection: boolean = false) => {
    const dbUniversities = await fetchUniversitiesWithCandidates(filters as unknown as DBSearchFilters);
    setFilteredUniversities(dbUniversities);

    if (!preserveSelection) {
      if (selectedCandidate) {
        const candidateStillExists = dbUniversities.some(uni => 
          uni.candidates.some(candidate => candidate.id === selectedCandidate.id)
        );
        if (!candidateStillExists) {
          setSelectedCandidate(null);
        }
      }
    }
  }, [filters, selectedCandidate]);

  const handlePercentileChange = useCallback((percentile: number) => {
    const newFilters = { ...filters, topPercentile: percentile };
    setFilters(newFilters);
  }, [filters]);

  // Initial load
  useEffect(() => {
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-search when filters change (except topPercentile)
  useEffect(() => {
    handleSearch(true); // Preserve selection during auto-search
  }, [filters.searchQuery, filters.selectedTopics, filters.minCitations, filters.yearRange.start, filters.yearRange.end, handleSearch]);

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.32))] overflow-hidden">
      {/* Left Panel - University List */}
      <div className="w-[320px] sm:w-[360px] md:w-[384px] lg:w-[400px] xl:w-[420px] 2xl:w-[440px] bg-white border-r border-slate-200/60 shadow-sm flex-shrink-0">
        <UniversityList
          universities={filteredUniversities}
          onCandidateSelect={setSelectedCandidate}
          selectedCandidateId={selectedCandidate?.id || null}
          viewMode={filters.viewMode}
          topPercentile={filters.topPercentile}
          onPercentileChange={handlePercentileChange}
        />
      </div>
      
      {/* Subtle Divider */}
      <div className="w-px bg-gradient-to-b from-slate-200/40 via-slate-300/60 to-slate-200/40 flex-shrink-0"></div>
      
      {/* Right Panel - Candidate Profile */}
      <div className="flex-1 min-w-0 bg-slate-50/20 overflow-hidden">
        <CandidateProfile candidate={selectedCandidate} />
      </div>
    </div>
  );
}
