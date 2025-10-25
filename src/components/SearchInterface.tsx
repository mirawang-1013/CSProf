import React, { useState } from 'react';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Filter, Calendar, X, Users, Building2, Crown, Star, Award, RotateCcw, Plus } from "lucide-react";
import type { ViewMode } from './UniversityList';

export interface SearchFilters {
  searchQuery: string;
  yearRange: {
    start: number;
    end: number;
  };
  minCitations: number;
  selectedTopics: string[];
  viewMode: ViewMode;
  topPercentile: number; // 0 = all, 1 = top 1%, 5 = top 5%, etc.
}

interface SearchInterfaceProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (preserveSelection?: boolean) => void;
}

const PREDEFINED_TOPICS = [
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'Artificial Intelligence',
  'Reinforcement Learning',
  'Human-Computer Interaction',
  'Database Systems',
  'Computer Networks',
  'Cybersecurity',
  'Software Engineering',
  'Computer Graphics',
  'Computer Architecture',
  'Distributed Systems',
  'Data Mining',
  'Data Science',
  'Robotics',
  'Theory of Computation',
  'Programming Languages',
  'Algorithms',
  'Computational Biology',
  'Quantum Computing',
  'Blockchain',
  'IoT',
  'Cloud Computing',
  'Information Retrieval',
  'Speech Recognition',
  'Computer Music',
  'Computational Linguistics'
];

export function SearchInterface({ filters, onFiltersChange, onSearch }: SearchInterfaceProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [newFieldInput, setNewFieldInput] = useState('');
  const [customFields, setCustomFields] = useState<string[]>([]);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };



  const addTopic = (topic: string) => {
    if (!filters.selectedTopics.includes(topic)) {
      updateFilters({
        selectedTopics: [...filters.selectedTopics, topic]
      });
    }
  };

  const removeTopic = (topic: string) => {
    updateFilters({
      selectedTopics: filters.selectedTopics.filter(t => t !== topic)
    });
  };

  const addCustomField = () => {
    const trimmedField = newFieldInput.trim();
    if (trimmedField) {
      // Check if field already exists in predefined topics or custom fields
      const fieldExists = PREDEFINED_TOPICS.includes(trimmedField) || 
                         customFields.includes(trimmedField);
      
      if (!fieldExists) {
        setCustomFields(prev => [...prev, trimmedField]);
      }
      
      // Also add to selected topics if not already selected
      if (!filters.selectedTopics.includes(trimmedField)) {
        updateFilters({
          selectedTopics: [...filters.selectedTopics, trimmedField]
        });
      }
      
      setNewFieldInput('');
    }
  };

  const handleCustomFieldKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomField();
    }
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      searchQuery: '',
      yearRange: { start: 2020, end: 2024 },
      minCitations: 0,
      selectedTopics: [],
      viewMode: 'by-university',
      topPercentile: 0
    };
    onFiltersChange(defaultFilters);
    onSearch(false); // Don't preserve selection when resetting
  };

  const hasActiveFilters = () => {
    return filters.searchQuery !== '' || 
           filters.selectedTopics.length > 0 || 
           filters.minCitations > 0 ||
           filters.yearRange.start !== 2020 || 
           filters.yearRange.end !== 2024;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find PhD Graduates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, research field, or university (e.g., 'Sarah Chen', 'Machine Learning', 'Stanford')..."
                value={filters.searchQuery}
                onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch(false); // Don't preserve selection on Enter key search
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button onClick={() => onSearch(false)} size="lg">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              size="lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                onClick={resetFilters}
                size="lg"
                className="text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Search Tips and Research Topics Quick Selection */}
          {filters.searchQuery === '' && filters.selectedTopics.length === 0 && (
            <div className="space-y-3">
              {/* Search Tips */}
              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="font-medium">💡 Search Tips:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-blue-600">
                    <div>• "sarah chen" → Find by name</div>
                    <div>• "machine learn" → Fuzzy field search</div>
                    <div>• "stanford nlp" → University + field</div>
                    <div>• "prof smith" → Search advisors</div>
                  </div>
                </div>
              </div>
              
              {/* Popular Research Fields */}
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Popular Research Fields</span>
                </div>
                <div className="space-y-3">
                  {/* Add Custom Field Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newFieldInput}
                      onChange={(e) => setNewFieldInput(e.target.value)}
                      onKeyPress={handleCustomFieldKeyPress}
                      placeholder="Add your own research field..."
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={addCustomField}
                      disabled={!newFieldInput.trim()}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Custom Fields (if any) */}
                  {customFields.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">Your custom fields:</div>
                      <div className="flex flex-wrap gap-2">
                        {customFields.map(topic => (
                          <Button
                            key={topic}
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-700 border-green-200/50 bg-green-50/30"
                            onClick={() => addTopic(topic)}
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predefined Topics */}
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_TOPICS.slice(0, 8).map(topic => (
                      <Button
                        key={topic}
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                        onClick={() => addTopic(topic)}
                      >
                        {topic}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs text-slate-500"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      View all fields...
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Show popular fields when there's a search query but no selected topics */}
          {filters.searchQuery !== '' && filters.selectedTopics.length === 0 && (
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Add Research Field Filter</span>
              </div>
              <div className="space-y-3">
                {/* Add Custom Field Input */}
                <div className="flex gap-2">
                  <Input
                    value={newFieldInput}
                    onChange={(e) => setNewFieldInput(e.target.value)}
                    onKeyPress={handleCustomFieldKeyPress}
                    placeholder="Add custom research field..."
                    className="h-7 text-xs flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={addCustomField}
                    disabled={!newFieldInput.trim()}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Custom Fields (if any) */}
                {customFields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customFields.map(topic => (
                      <Button
                        key={topic}
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs hover:bg-green-50 hover:border-green-200 hover:text-green-700 border-green-200/50 bg-green-50/30"
                        onClick={() => addTopic(topic)}
                      >
                        + {topic}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Predefined Topics */}
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TOPICS.slice(0, 6).map(topic => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => addTopic(topic)}
                    >
                      + {topic}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Topics Display */}
          {filters.selectedTopics.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-700">Active Filters:</span>
              {filters.selectedTopics.map(topic => (
                <Badge key={topic} variant="secondary" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                  {topic}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-blue-900" 
                    onClick={() => removeTopic(topic)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-slate-500 hover:text-slate-700"
                onClick={() => updateFilters({ selectedTopics: [] })}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* View Mode and Percentile Selection */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">View:</span>
              <Select
                value={filters.viewMode}
                onValueChange={(value: ViewMode) => updateFilters({ viewMode: value })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="by-university">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      By University
                    </div>
                  </SelectItem>
                  <SelectItem value="by-ranking">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Overall Ranking
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filters.viewMode === 'by-ranking' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Show:</span>
                <Select
                  value={filters.topPercentile.toString()}
                  onValueChange={(value) => updateFilters({ topPercentile: parseInt(value) })}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All Candidates
                      </div>
                    </SelectItem>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        Top 1% Elite
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-500" />
                        Top 2% Exceptional
                      </div>
                    </SelectItem>
                    <SelectItem value="5">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        Top 5% Outstanding
                      </div>
                    </SelectItem>
                    <SelectItem value="10">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-emerald-500" />
                        Top 10% Excellent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="border-t pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Graduation Year Range
                </label>
                <div className="flex gap-2 items-center">
                  <Select
                    value={filters.yearRange.start.toString()}
                    onValueChange={(value) => updateFilters({
                      yearRange: { ...filters.yearRange, start: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-slate-500">to</span>
                  <Select
                    value={filters.yearRange.end.toString()}
                    onValueChange={(value) => updateFilters({
                      yearRange: { ...filters.yearRange, end: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Minimum Citations
                </label>
                <Select
                  value={filters.minCitations.toString()}
                  onValueChange={(value) => updateFilters({ minCitations: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any citations</SelectItem>
                    <SelectItem value="10">10+ citations</SelectItem>
                    <SelectItem value="50">50+ citations</SelectItem>
                    <SelectItem value="100">100+ citations</SelectItem>
                    <SelectItem value="500">500+ citations</SelectItem>
                    <SelectItem value="1000">1000+ citations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Star className="h-4 w-4" />
                Research Fields & Topics
              </label>
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50 space-y-4">
                {/* Add Custom Field in Advanced Filters */}
                <div className="flex gap-2 pb-3 border-b border-slate-200">
                  <Input
                    value={newFieldInput}
                    onChange={(e) => setNewFieldInput(e.target.value)}
                    onKeyPress={handleCustomFieldKeyPress}
                    placeholder="Add custom research field..."
                    className="h-8 text-xs flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                    onClick={addCustomField}
                    disabled={!newFieldInput.trim()}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Custom Fields */}
                {customFields.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-600">Your Custom Fields:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {customFields
                        .filter(topic => !filters.selectedTopics.includes(topic))
                        .map(topic => (
                        <Button
                          key={topic}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-xs justify-start hover:bg-green-50 hover:border-green-200 hover:text-green-700 border-green-200/50 bg-green-50/30"
                          onClick={() => addTopic(topic)}
                        >
                          + {topic}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predefined Topics */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-600">Predefined Fields:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {PREDEFINED_TOPICS
                      .filter(topic => !filters.selectedTopics.includes(topic))
                      .map(topic => (
                      <Button
                        key={topic}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs justify-start hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                        onClick={() => addTopic(topic)}
                      >
                        + {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}