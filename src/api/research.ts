import { supabase } from "../lib/supabase";

export type ViewMode = "by-university" | "by-ranking";

export interface SearchFilters {
  searchQuery: string;
  yearRange: { start: number; end: number };
  minCitations: number;
  selectedTopics: string[];
  viewMode: ViewMode;
  topPercentile: number;
}

// Shapes expected by existing UI
export interface UICandidate {
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
  radarData: { subject: string; value: number; fullMark: number }[];
  rankingScore: number;
  analysis?: any;
}

export interface UIUniversity {
  id: string;
  name: string;
  ranking: number;
  location: string;
  candidates: UICandidate[];
}

function computeRankingScore(totalCitations: number, hIndex: number): number {
  // Simple heuristic: normalize and combine
  const citationsScore = Math.min(100, Math.log10(Math.max(1, totalCitations)) * 20);
  const hIndexScore = Math.min(100, hIndex * 3);
  return Math.round(Math.min(100, citationsScore * 0.6 + hIndexScore * 0.4));
}

export async function fetchUniversitiesWithCandidates(filters: SearchFilters): Promise<UIUniversity[]> {
  // Build base candidate query with filters
  const topics = filters.selectedTopics;

  // We will fetch candidates joined with universities; publications can be fetched count-only later if needed
  let query = supabase
    .from("candidates")
    .select(
      `id,name,university_id,graduation_year,total_citations,h_index,research_interests,google_scholar_url,linkedin_url,
       universities:university_id ( id, name, country, ranking )`
    )
    .gte("graduation_year", filters.yearRange.start)
    .lte("graduation_year", filters.yearRange.end)
    .gte("total_citations", filters.minCitations)
    .limit(2000);

  if (filters.searchQuery) {
    const q = filters.searchQuery.trim();
    // Search by name OR research interests
    // Note: Supabase doesn't support OR directly in filters, so we'll search name first
    // and then client-side filter can handle research interests
    query = query.ilike("name", `%${q}%`);
  }

  if (topics && topics.length > 0) {
    // research_interests is an array; use overlap operator
    query = query.contains("research_interests", topics);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch candidates:", error);
    return [];
  }

  // Group by university
  const uniIdToUniversity: Record<string, UIUniversity> = {};

  for (const row of data || []) {
    const uni = (row.universities as any) as { id: string; name: string; country: string; ranking: number | null } | null;
    if (!uni) continue;

    if (!uniIdToUniversity[uni.id]) {
      uniIdToUniversity[uni.id] = {
        id: uni.id,
        name: uni.name,
        ranking: typeof uni.ranking === "number" ? uni.ranking : 999,
        location: uni.country,
        candidates: [],
      };
    }

    const publications: any[] = [];

    // Create simple radar data based on available metrics
    const overallCitations = Math.min(100, (row.total_citations ?? 0) / 20);
    const publicationVolume = Math.min(100, publications.length * 10);
    const topVenuePresence = Math.min(100, publications.filter((p) => p.venue && /ICML|NeurIPS|ICLR|CVPR|ACL|EMNLP|AAAI/i.test(p.venue)).length * 20);
    const firstAuthorImpact = Math.min(100, Math.round((row.h_index ?? 0) * 5));
    const hotTopicCitations = Math.min(100, Math.round((row.total_citations ?? 0) * 0.1));

    const radarData = [
      { subject: "Overall Citations", value: overallCitations, fullMark: 100 },
      { subject: "Publication Volume", value: publicationVolume, fullMark: 100 },
      { subject: "Top Venue Presence", value: topVenuePresence, fullMark: 100 },
      { subject: "First Author Impact", value: firstAuthorImpact, fullMark: 100 },
      { subject: "Hot Topic Citations", value: hotTopicCitations, fullMark: 100 },
    ];

    const totalScore = Math.round(
      overallCitations * 0.25 + publicationVolume * 0.25 + topVenuePresence * 0.2 + firstAuthorImpact * 0.15 + hotTopicCitations * 0.15
    );

    const analysis = {
      bio: "Recent PhD graduate with research spanning multiple areas.",
      researchSummary: `Focus areas: ${(Array.isArray(row.research_interests) ? row.research_interests : []).slice(0, 3).join(", ")}.`,
      scoreExplanation: {
        totalScore,
        breakdown: {
          citations: { score: Math.round(overallCitations), explanation: "Citations relative to peers." },
          hIndex: { score: Math.round(firstAuthorImpact), explanation: "H-index based impact." },
          publications: { score: Math.round(publicationVolume), explanation: "Publication volume in recent years." },
          impact: { score: Math.round(firstAuthorImpact), explanation: "First-author and impact indicators." },
        },
      },
      keyStrengths: ["Consistent publication record", "Clear research focus"],
      potentialConcerns: [],
    };

    const candidate: UICandidate = {
      id: row.id,
      name: row.name,
      university: uni.name,
      department: "Computer Science",
      advisor: "",
      researchAreas: Array.isArray(row.research_interests) ? row.research_interests : [],
      publications,
      totalCitations: row.total_citations ?? 0,
      hIndex: row.h_index ?? 0,
      graduationYear: row.graduation_year,
      email: "",
      website: row.google_scholar_url || row.linkedin_url || undefined,
      radarData,
      rankingScore: computeRankingScore(row.total_citations ?? 0, row.h_index ?? 0),
      analysis,
    };

    uniIdToUniversity[uni.id].candidates.push(candidate);
  }

  // If searchQuery targets universities, also include that filter client-side
  const search = filters.searchQuery.trim().toLowerCase();
  let universities = Object.values(uniIdToUniversity);
  if (search) {
    universities = universities.map(u => ({
      ...u,
      candidates: u.candidates.filter((c) => 
        c.name.toLowerCase().includes(search) ||
        c.researchAreas.some(area => area.toLowerCase().includes(search))
      )
    })).filter(
      (u) => u.name.toLowerCase().includes(search) || u.candidates.length > 0
    );
  }

  // Sort university candidates by our ranking score descending
  for (const u of universities) {
    u.candidates.sort((a, b) => b.rankingScore - a.rankingScore);
  }

  // Sort universities by ranking if available
  universities.sort((a, b) => a.ranking - b.ranking);

  return universities;
}


