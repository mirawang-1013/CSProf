import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Star,
  Trophy,
  Users,
  Crown,
  Award,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface Candidate {
  id: string;
  name: string;
  university: string;
  department: string;
  advisor: string;
  researchAreas: string[];
  publications: any[];
  totalCitations: number;
  hIndex: number;
  graduationYear: number;
  email: string;
  website?: string;
  radarData: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
  rankingScore: number;
}

interface University {
  id: string;
  name: string;
  ranking: number;
  location: string;
  candidates: Candidate[];
}

export type ViewMode = 'by-university' | 'by-ranking';

interface UniversityListProps {
  universities: University[];
  onCandidateSelect: (candidate: Candidate) => void;
  selectedCandidateId: string | null;
  viewMode: ViewMode;
  topPercentile: number;
  onPercentileChange: (percentile: number) => void;
}

export function UniversityList({
  universities,
  onCandidateSelect,
  selectedCandidateId,
  viewMode,
  topPercentile,
  onPercentileChange,
}: UniversityListProps) {
  const [openUniversities, setOpenUniversities] = useState<
    Set<string>
  >(new Set());

  const toggleUniversity = (universityId: string) => {
    const newOpen = new Set(openUniversities);
    if (newOpen.has(universityId)) {
      newOpen.delete(universityId);
    } else {
      newOpen.add(universityId);
    }
    setOpenUniversities(newOpen);
  };

  // Get all candidates across universities for ranking view
  const allCandidates = universities.flatMap(uni => 
    uni.candidates.map(candidate => ({
      ...candidate,
      universityName: uni.name,
      universityRanking: uni.ranking
    }))
  ).sort((a, b) => b.rankingScore - a.rankingScore);

  // Apply top percentile filtering for ranking view
  const getFilteredCandidates = () => {
    if (viewMode !== 'by-ranking' || topPercentile === 0) {
      return allCandidates;
    }
    
    const totalCandidates = allCandidates.length;
    const cutoffIndex = Math.ceil((topPercentile / 100) * totalCandidates);
    return allCandidates.slice(0, cutoffIndex);
  };

  const filteredCandidates = getFilteredCandidates();

  const renderCandidateCard = (candidate: any, index?: number) => {
    const isTopTier = index !== undefined && index < 3;
    const isElite = index !== undefined && index === 0;
    
    return (
    <Button
      key={candidate.id}
      variant={selectedCandidateId === candidate.id ? "secondary" : "ghost"}
      className={`w-full justify-start p-3 h-auto ${
        isElite && viewMode === 'by-ranking' ? 'ring-2 ring-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50' :
        isTopTier && viewMode === 'by-ranking' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : ''
      }`}
      onClick={() => onCandidateSelect(candidate)}
    >
      <div className="flex w-full items-start gap-3">
        {viewMode === 'by-ranking' && (
          <div className="flex flex-col items-center justify-center min-w-8">
            <div className="flex items-center gap-1">
              {index !== undefined && index < 3 && (
                <Trophy className={`h-4 w-4 ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-gray-400' : 'text-amber-600'
                }`} />
              )}
              <span className="font-bold text-sm">#{(index || 0) + 1}</span>
            </div>
          </div>
        )}
        <div className="flex-1 text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm leading-tight">
              {candidate.name}
            </span>
            {candidate.rankingScore > 85 && (
              <Star className="h-3 w-3 text-yellow-500" />
            )}
          </div>
          {viewMode === 'by-ranking' && (
            <div className="text-xs text-muted-foreground">
              {candidate.universityName} (#{candidate.universityRanking})
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{candidate.totalCitations} citations</span>
            <span>•</span>
            <span>h-index: {candidate.hIndex}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {candidate.researchAreas.slice(0, 2).map((area: string) => (
              <Badge
                key={area}
                variant="outline"
                className="text-xs px-1 py-0"
              >
                {area}
              </Badge>
            ))}
            {candidate.researchAreas.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{candidate.researchAreas.length - 2}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div
            className={`text-lg font-bold ${
              candidate.rankingScore >= 90
                ? "text-green-600"
                : candidate.rankingScore >= 80
                  ? "text-blue-600"
                  : candidate.rankingScore >= 70
                    ? "text-orange-500"
                    : "text-gray-500"
            }`}
          >
            {candidate.rankingScore}
          </div>
          <div className="text-xs text-muted-foreground">/100</div>
        </div>
      </div>
    </Button>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 sm:p-4 border-b">
        <h2 className="font-medium flex items-center gap-2">
          {viewMode === 'by-university' ? (
            <>
              <GraduationCap className="h-5 w-5" />
              Top Universities (from CS Rankings)
            </>
          ) : (
            <>
              <Trophy className="h-5 w-5" />
              Overall Ranking
            </>
          )}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {viewMode === 'by-university' ? (
            <>
              {universities.length} universities •{" "}
              {universities.reduce(
                (sum, uni) => sum + uni.candidates.length,
                0,
              )}{" "}
              candidates
            </>
          ) : (
            <>
              {filteredCandidates.length} candidates 
              {topPercentile > 0 && (
                <span className="text-indigo-600 font-medium"> • Top {topPercentile}%</span>
              )}
              {topPercentile === 0 && " ranked by overall score"}
            </>
          )}
        </p>
        
        {/* Percentile Filter Buttons for Overall Ranking Mode */}
        {viewMode === 'by-ranking' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={topPercentile === 0 ? "default" : "outline"}
              className="h-7 px-2 text-xs"
              onClick={() => onPercentileChange(0)}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={topPercentile === 1 ? "default" : "outline"}
              className="h-7 px-2 text-xs"
              onClick={() => onPercentileChange(1)}
            >
              <Crown className="h-3 w-3 mr-1" />
              Top 1%
            </Button>
            <Button
              size="sm"
              variant={topPercentile === 5 ? "default" : "outline"}
              className="h-7 px-2 text-xs"
              onClick={() => onPercentileChange(5)}
            >
              <Award className="h-3 w-3 mr-1" />
              Top 5%
            </Button>
            <Button
              size="sm"
              variant={topPercentile === 10 ? "default" : "outline"}
              className="h-7 px-2 text-xs"
              onClick={() => onPercentileChange(10)}
            >
              <Star className="h-3 w-3 mr-1" />
              Top 10%
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-4 space-y-2">
          {viewMode === 'by-university' ? (
            /* University-grouped view */
            universities.map((university) => (
              <Card key={university.id} className="overflow-hidden">
                <Collapsible
                  open={openUniversities.has(university.id)}
                  onOpenChange={() => toggleUniversity(university.id)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="p-3 hover:bg-accent cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm leading-tight">
                            #{university.ranking} {university.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {university.location} • {university.candidates.length} candidates
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {openUniversities.has(university.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="p-0">
                      <div className="space-y-1">
                        {university.candidates
                          .sort((a, b) => b.rankingScore - a.rankingScore)
                          .map((candidate) => renderCandidateCard(candidate))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          ) : (
            /* Ranking view */
            <div className="space-y-1">
              {filteredCandidates.map((candidate, index) => 
                renderCandidateCard(candidate, index)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}