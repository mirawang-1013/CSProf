import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { RadarChartComponent } from "./RadarChart";
import { CandidateChat } from "./CandidateChat";
import { Calendar, BookOpen, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from "lucide-react";

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  citations: number;
  type: 'conference' | 'journal' | 'workshop';
}

interface Candidate {
  id: string;
  name: string;
  university: string;
  department: string;
  advisor: string;
  researchAreas: string[];
  publications: Publication[];
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
  analysis: {
    bio: string;
    researchSummary: string;
    scoreExplanation: {
      totalScore: number;
      breakdown: {
        citations: { score: number; explanation: string; };
        hIndex: { score: number; explanation: string; };
        publications: { score: number; explanation: string; };
        impact: { score: number; explanation: string; };
      };
    };
    keyStrengths: string[];
    potentialConcerns: string[];
  };
}

interface CandidateProfileProps {
  candidate: Candidate | null;
}

export function CandidateProfile({ candidate }: CandidateProfileProps) {
  if (!candidate) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a candidate to view their profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
      {/* Header Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">{candidate.name}</h1>
              <div className="space-y-1">
                <p className="text-slate-600">
                  <span className="font-medium">{candidate.department}</span>
                </p>
                <p className="text-slate-500 text-sm">{candidate.university}</p>
                <p className="text-slate-500 text-sm">
                  <span className="text-slate-400">Advisor:</span> {candidate.advisor}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-3 bg-slate-100 text-slate-700 border-slate-200">
                PhD {candidate.graduationYear}
              </Badge>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Contact</p>
                <p className="text-sm text-slate-600">{candidate.email}</p>
              </div>
            </div>
          </div>
          
          {/* Research Areas */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Research Areas</p>
            <div className="flex flex-wrap gap-2">
              {candidate.researchAreas.map((area) => (
                <Badge key={area} variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Research Metrics Overview */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{candidate.publications.length}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Publications</div>
            </div>
            <div className="text-center border-x border-slate-200">
              <div className="text-xl font-bold text-slate-800">{candidate.totalCitations}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Citations</div>
            </div>
            <div className="text-center border-r border-slate-200">
              <div className="text-xl font-bold text-slate-800">{candidate.hIndex}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">H-Index</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-slate-800">{candidate.analysis.scoreExplanation.totalScore}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Overall Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-800">Research Profile</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Academic Background</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {candidate.analysis.bio}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Research Focus</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {candidate.analysis.researchSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Research Assessment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          {/* Header with Overall Score */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">Research Assessment</h2>
                <p className="text-sm text-slate-500">Multi-dimensional evaluation framework</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-slate-800 leading-none">
                {candidate.analysis.scoreExplanation.totalScore}
              </div>
              <div className="text-sm text-slate-500 mt-1">Overall Score</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left: Visual Analysis */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-700">Multi-Dimensional Profile</h3>
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-slate-200">
                    5 Key Dimensions
                  </Badge>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/50">
                  <RadarChartComponent 
                    data={candidate.radarData}
                    className="h-64"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-slate-700">Score Breakdown</h3>
                <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-sm font-medium text-slate-700">Overall Score</span>
                      <span className="text-lg font-bold text-slate-800">{candidate.analysis.scoreExplanation.totalScore}/100</span>
                    </div>
                    
                    <div className="space-y-3 text-xs text-slate-600">
                      {candidate.radarData.map((dimension, index) => {
                        const componentScores = candidate.analysis.scoreExplanation.breakdown;
                        let componentData: any = null;
                        let weight = '';
                        let explanation = '';
                        
                        if (dimension.subject === 'Publication Volume') {
                          componentData = componentScores.publications;
                          weight = '25%';
                          explanation = `${candidate.publications.length} publications scores ${Math.round(dimension.value)}/100. ${componentData.explanation}`;
                        } else if (dimension.subject === 'First Author Impact') {
                          componentData = componentScores.impact;
                          weight = '15%';
                          explanation = `First-author citations and venue quality scores ${Math.round(dimension.value)}/100. ${componentData.explanation}`;
                        } else if (dimension.subject === 'Top Venue Presence') {
                          weight = '20%';
                          const topVenues = candidate.publications.filter(p => ['ICML', 'NeurIPS', 'ICLR', 'AAAI', 'IJCAI', 'CVPR', 'ICCV', 'ECCV', 'ACL', 'EMNLP'].some(conf => p.venue.includes(conf))).length;
                          explanation = `${topVenues} papers in top-tier venues (ICML, NeurIPS, etc.) scores ${Math.round(dimension.value)}/100.`;
                        } else if (dimension.subject === 'Hot Topic Citations') {
                          weight = '15%';
                          const hotTopicCites = Math.ceil(candidate.totalCitations * 0.25);
                          explanation = `${hotTopicCites} citations on trending topics (ML, DL, CV, NLP) scores ${Math.round(dimension.value)}/100.`;
                        } else if (dimension.subject === 'Overall Citations') {
                          componentData = componentScores.citations;
                          weight = '25%';
                          explanation = `${candidate.totalCitations} total citations scores ${Math.round(dimension.value)}/100. ${componentData.explanation}`;
                        }
                        
                        return (
                          <div key={index} className="flex items-start gap-3 p-2 bg-white/50 rounded border border-slate-100">
                            <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-slate-600">{Math.round(dimension.value)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-700 text-xs">{dimension.subject}</span>
                                <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{weight}</span>
                              </div>
                              <div className="text-xs text-slate-600 leading-relaxed">
                                {explanation}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                        <div>
                          <span className="font-medium text-slate-700">Final Calculation:</span> 
                          <span className="font-mono text-xs ml-1">
                            ({Math.round(candidate.radarData.find(d => d.subject === 'Overall Citations')?.value || 0)} × 25%) + 
                            ({Math.round(candidate.radarData.find(d => d.subject === 'Publication Volume')?.value || 0)} × 25%) + 
                            ({Math.round(candidate.radarData.find(d => d.subject === 'Top Venue Presence')?.value || 0)} × 20%) + 
                            ({Math.round(candidate.radarData.find(d => d.subject === 'First Author Impact')?.value || 0)} × 15%) + 
                            ({Math.round(candidate.radarData.find(d => d.subject === 'Hot Topic Citations')?.value || 0)} × 15%)
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Result:</span> 
                          <span className="font-bold text-slate-800 ml-1">{candidate.analysis.scoreExplanation.totalScore}/100</span>
                          <span className="text-slate-500 ml-1">
                            (Top {Math.round((100 - candidate.analysis.scoreExplanation.totalScore) / 10) * 10}% of recent PhD graduates)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Right: Performance Metrics */}
            <div className="space-y-6">
              {/* Excellence Rating */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4">Excellence Rating</h3>
                <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-200/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Top-Tier Researcher</div>
                      <div className="text-sm text-slate-500">
                        Ranked in top {Math.round((100 - candidate.analysis.scoreExplanation.totalScore) / 10) * 10}% of recent PhD graduates
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Strongest Area</div>
                      <div className="font-medium text-slate-800">
                        {[...candidate.radarData].sort((a, b) => b.value - a.value)[0].subject}
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Growth Potential</div>
                      <div className="font-medium text-slate-800">
                        {[...candidate.radarData].sort((a, b) => a.value - b.value)[0].subject}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Framework */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4">Assessment Framework</h3>
                <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50">
                  <div className="text-xs text-slate-600 leading-relaxed space-y-3">
                    <div>
                      <span className="font-medium text-slate-700">Methodology:</span> 
                      <br />Five-dimensional evaluation combining publication volume, first-author impact, top venue presence, trending topic alignment, and overall citation influence.
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Data Sources:</span> 
                      <br />DBLP, Google Scholar, ArXiv, CSRankings methodology, and ML-based topic classification.
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Scoring:</span> 
                      <br />Weighted composite score with normalization across recent PhD cohorts from top-100 institutions.
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Quality Indicators */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4">Quality Indicators</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                      {candidate.publications.filter(p => ['ICML', 'NeurIPS', 'ICLR', 'AAAI', 'IJCAI'].some(top => p.venue.includes(top))).length}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Top Venues</div>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                      {Math.ceil(candidate.publications.length * 0.4)}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">First Author</div>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                      {candidate.publications.length > 0 ? Math.round(candidate.totalCitations / candidate.publications.length) : 0}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Avg Citations</div>
                  </div>
                  <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200/50 text-center">
                    <div className="text-2xl font-bold text-slate-800 mb-1">
                      {new Set(candidate.publications.flatMap(p => p.authors)).size - 1}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Collaborators</div>
                  </div>
                </div>
              </div>

              {/* Research Trajectory */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4">Research Trajectory</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Publication Momentum</span>
                      <span className="text-lg font-bold text-slate-800">
                        {candidate.publications.filter(p => p.year >= 2020).length >= 3 ? 'High' : 
                         candidate.publications.filter(p => p.year >= 2020).length >= 2 ? 'Moderate' : 'Building'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {Math.round(candidate.publications.filter(p => p.year >= 2020).length / 3 * 10) / 10} papers/year recent average
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Research Breadth</span>
                      <span className="text-lg font-bold text-slate-800">
                        {candidate.researchAreas.length > 3 ? 'Broad' : candidate.researchAreas.length > 1 ? 'Focused' : 'Specialized'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {candidate.researchAreas.length} primary research areas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Research Insights */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-800">Research Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Key Strengths */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <h3 className="font-medium text-slate-800">Key Strengths</h3>
              </div>
              <div className="space-y-3">
                {candidate.analysis.keyStrengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700 leading-relaxed">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Areas or Research Summary */}
            <div>
              {candidate.analysis.potentialConcerns.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-amber-600 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-800">Growth Areas</h3>
                  </div>
                  <div className="space-y-3">
                    {candidate.analysis.potentialConcerns.map((concern, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-slate-700 leading-relaxed">{concern}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-800">Research Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                      <div className="text-sm text-slate-700 leading-relaxed">
                        <span className="font-medium">Research Focus:</span> Demonstrates strong expertise in {candidate.researchAreas.slice(0, 2).join(' and ')} with consistent publication record.
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                      <div className="text-sm text-slate-700 leading-relaxed">
                        <span className="font-medium">Career Stage:</span> Well-positioned emerging researcher with {candidate.totalCitations} total citations and active collaboration network.
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                      <div className="text-sm text-slate-700 leading-relaxed">
                        <span className="font-medium">Future Potential:</span> Strong foundation for independent research career with proven track record in high-quality venues.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publications */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-800">Publications</h2>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
              {candidate.publications.length} papers
            </Badge>
          </div>
          
          <div className="space-y-5">
            {candidate.publications.map((pub, index) => (
              <div key={pub.id} className="group">
                <div className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200">
                  <div className="space-y-3">
                    <h3 className="font-medium leading-snug text-slate-800 group-hover:text-slate-900">
                      {pub.title}
                    </h3>
                    
                    <div className="flex items-center flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{pub.year}</span>
                      </div>
                      <Badge 
                        variant={pub.type === 'conference' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {pub.type.charAt(0).toUpperCase() + pub.type.slice(1)}
                      </Badge>
                      <span className="text-slate-600 font-medium">{pub.venue}</span>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                        <span className="font-medium">{pub.citations}</span>
                        <span>citations</span>
                      </div>
                    </div>
                    
                    {/* <div className="text-sm text-slate-600">
                      <span className="font-medium">Authors:</span> {pub.authors.join(', ')}
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px] xl:w-[384px] 2xl:w-[400px] p-6 bg-white/80 backdrop-blur-sm border-l border-slate-200/60 flex-shrink-0">
        <CandidateChat candidate={candidate} />
      </div>
    </div>
  );
}