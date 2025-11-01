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
    topPercentile: 100, // ✅ 默认显示所有候选人
  });

  const [filteredUniversities, setFilteredUniversities] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  /** 🔍 主搜索函数 */
  const handleSearch = useCallback(
    async (preserveSelection: boolean = false) => {
      try {
        const dbUniversities = await fetchUniversitiesWithCandidates(filters as unknown as DBSearchFilters);
        setFilteredUniversities(dbUniversities);

        // 若未选择保留，则检查当前选中的候选人是否仍在结果中
        if (!preserveSelection && selectedCandidate) {
          const candidateStillExists = dbUniversities.some((uni) =>
            uni.candidates.some((candidate) => candidate.id === selectedCandidate.id)
          );
          if (!candidateStillExists) setSelectedCandidate(null);
        }
      } catch (err) {
        console.error('Failed to fetch universities:', err);
      }
    },
    [filters, selectedCandidate]
  );

  /** 🧮 百分位变化 */
  const handlePercentileChange = useCallback(
    (percentile: number) => {
      const newFilters = { ...filters, topPercentile: percentile };
      setFilters(newFilters);
    },
    [filters]
  );

  /** 🧭 初始化加载 */
  useEffect(() => {
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** ⚡ 当主要过滤字段变化时自动刷新（保留选中） */
  useEffect(() => {
    handleSearch(true);
  }, [
    filters.searchQuery,
    filters.selectedTopics,
    filters.minCitations,
    filters.yearRange.start,
    filters.yearRange.end,
    filters.viewMode,
    handleSearch,
  ]);

  /** 💡 当 topPercentile 改变时也要刷新 */
  useEffect(() => {
    handleSearch(true);
  }, [filters.topPercentile, handleSearch]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.32))] overflow-hidden bg-slate-50">
      {/* 🔍 顶部搜索栏 */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <SearchInterface filters={filters} onFiltersChange={setFilters} onSearch={handleSearch} />
      </div>

      {/* 📊 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 🏫 左侧大学/候选人列表 */}
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

        {/* 分隔线 */}
        <div className="w-px bg-gradient-to-b from-slate-200/40 via-slate-300/60 to-slate-200/40 flex-shrink-0" />

        {/* 👤 右侧候选人详情 */}
        <div className="flex-1 min-w-0 bg-slate-50/20 overflow-hidden">
          <CandidateProfile candidate={selectedCandidate} />
        </div>
      </div>
    </div>
  );
}
