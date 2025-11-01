import { supabase } from "../lib/supabase";
import type { Publication as UIPublication } from "../data/mockData";

export type ViewMode = "by-university" | "by-ranking";

export interface SearchFilters {
  searchQuery: string;
  yearRange: { start: number; end: number };
  minCitations: number;
  selectedTopics: string[];
  viewMode: ViewMode;
  topPercentile: number;
}

export interface UICandidate {
  id: string;
  name: string;
  university: string;
  department: string;
  advisor: string;
  researchAreas: string[];
  publications: UIPublication[];
  publicationCount?: number;
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

/** Compute ranking score based on citation and h-index */
function computeRankingScore(totalCitations: number, hIndex: number): number {
  const citationsScore = Math.min(100, Math.log10(Math.max(1, totalCitations)) * 20);
  const hIndexScore = Math.min(100, hIndex * 3);
  return Math.round(Math.min(100, citationsScore * 0.6 + hIndexScore * 0.4));
}

/** Fetch all Supabase pages by looping through 1000-sized chunks */
async function fetchAllCandidates(baseQuery: any, pageSize = 1000) {
  let all: any[] = [];
  let start = 0;
  let fetched = 0;

  do {
    const { data, error } = await baseQuery.range(start, start + pageSize - 1);
    if (error) {
      console.error("fetchAllCandidates error:", error);
      break;
    }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    fetched = data.length;
    start += pageSize;
  } while (fetched === pageSize);

  return all;
}

/** Main function to fetch universities and candidates */
export async function fetchUniversitiesWithCandidates(filters: SearchFilters): Promise<UIUniversity[]> {
  const topics = filters.selectedTopics;

  let query = supabase
    .from("candidates")
    .select(
      `id,name,university_id,graduation_year,total_citations,h_index,research_interests,google_scholar_url,linkedin_url,
       universities:university_id ( id, name, country, ranking )`
    )
    .gte("graduation_year", filters.yearRange.start)
    .lte("graduation_year", filters.yearRange.end)
    .gte("total_citations", filters.minCitations);

  if (filters.searchQuery) {
    const q = filters.searchQuery.trim();
    query = query.ilike("name", `%${q}%`);
  }

  if (topics && topics.length > 0) {
    query = query.contains("research_interests", topics);
  }

  const data = await fetchAllCandidates(query);
  if (!data || data.length === 0) {
    console.warn("No candidates found");
    return [];
  }

  const candidateIds = data.map((row) => row.id);
  const metaEnv = (import.meta as any)?.env;
  if (metaEnv?.DEV) {
    console.debug("[research] candidates fetched", {
      totalCandidates: candidateIds.length,
      sampleCandidates: candidateIds.slice(0, 5),
    });
  }

  const publicationsByCandidate: Record<string, UIPublication[]> = {};

  if (candidateIds.length > 0) {
    const chunkSize = 100;
    const candidateIdChunks: string[][] = [];
    for (let i = 0; i < candidateIds.length; i += chunkSize) {
      candidateIdChunks.push(candidateIds.slice(i, i + chunkSize));
    }

    const aggregatedPublications: any[] = [];

    for (const chunk of candidateIdChunks) {
      const { data: chunkData, error: chunkError } = await supabase
        .from("publications")
        .select("*")
        .in("candidate_id", chunk)
        .order("year", { ascending: false })
        .order("citations", { ascending: false });

      if (chunkError) {
        console.error("Failed to fetch publications chunk:", chunkError);
        continue;
      }

      if (chunkData) aggregatedPublications.push(...chunkData);
    }

    aggregatedPublications.forEach((pub) => {
      const rawAuthorsSource =
        (pub as any).authors ??
        (pub as any).authors_json ??
        (pub as any).authors_text ??
        (pub as any).author_list ??
        (pub as any).author_names ??
        [];

      const normalizedAuthors = Array.isArray(rawAuthorsSource)
        ? rawAuthorsSource.map((a) => String(a))
        : typeof rawAuthorsSource === "string"
          ? (() => {
              try {
                const parsed = JSON.parse(rawAuthorsSource);
                if (Array.isArray(parsed)) return parsed.map((a) => String(a));
              } catch {
                return rawAuthorsSource
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean);
              }
              return [];
            })()
          : [];

      const rawTypeSource = (pub as any).type ?? (pub as any).category ?? (pub as any).publication_type;
      const rawType = typeof rawTypeSource === "string" ? rawTypeSource.toLowerCase() : "";
      const normalizedType: UIPublication["type"] =
        rawType === "journal" || rawType === "workshop" || rawType === "conference"
          ? (rawType as UIPublication["type"])
          : "conference";

      const publication: UIPublication = {
        id: pub.id,
        title: (pub as any).title ?? "Untitled",
        authors: normalizedAuthors,
        venue: (pub as any).venue ?? "",
        year: typeof (pub as any).year === "number" ? (pub as any).year : 0,
        citations: typeof (pub as any).citations === "number" ? (pub as any).citations : 0,
        type: normalizedType,
      };

      const candidateId = (pub as any).candidate_id ?? null;
      if (!candidateId) return;
      if (!publicationsByCandidate[candidateId]) publicationsByCandidate[candidateId] = [];
      publicationsByCandidate[candidateId].push(publication);
    });

    for (const key of Object.keys(publicationsByCandidate)) {
      publicationsByCandidate[key].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.citations - a.citations;
      });
    }
  }

  const uniIdToUniversity: Record<string, UIUniversity> = {};

  for (const row of data) {
    const uni = row.universities as { id: string; name: string; country: string; ranking: number | null } | null;
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

    const publications = publicationsByCandidate[row.id] || [];
    const publicationCount = publications.length;

    const topConferenceVenues = ["ICML", "NeurIPS", "ICLR", "AAAI", "IJCAI", "CVPR", "ICCV", "ECCV", "ACL", "EMNLP", "KDD", "SIGGRAPH", "CHI"];
    const topVenueCount = publications.filter((p) =>
      topConferenceVenues.some((venue) => p.venue?.toUpperCase().includes(venue))
    ).length;

    const mostCitedPublication = publications.reduce<UIPublication | null>((acc, p) => {
      if (!acc) return p;
      if (p.citations > acc.citations) return p;
      return acc;
    }, null);

    const overallCitations = Math.min(100, (row.total_citations ?? 0) / 20);
    const publicationVolume = Math.min(100, publicationCount * 12);
    const topVenuePresence = Math.min(100, topVenueCount * 25);
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
      overallCitations * 0.25 +
        publicationVolume * 0.25 +
        topVenuePresence * 0.2 +
        firstAuthorImpact * 0.15 +
        hotTopicCitations * 0.15
    );

    const primaryResearchAreas = Array.isArray(row.research_interests) ? row.research_interests : [];
    const focusAreasSummary = primaryResearchAreas.length > 0 ? primaryResearchAreas.slice(0, 3).join(", ") : "Not specified";

    const keyStrengths: string[] = [];
    if (publicationCount >= 3) keyStrengths.push("Consistent publication record");
    else if (publicationCount > 0) keyStrengths.push("Emerging publication record");
    else keyStrengths.push("Active research at early publication stage");

    if (topVenueCount > 0) keyStrengths.push("Evidence of publications in top-tier venues");
    else if (primaryResearchAreas.length > 0) keyStrengths.push(`Clear focus in ${primaryResearchAreas[0]}`);
    else keyStrengths.push("Defined research direction");

    const analysis = {
      bio: "Recent PhD graduate with research spanning multiple areas.",
      researchSummary: `Focus areas: ${focusAreasSummary}.` +
        (mostCitedPublication
          ? ` Notable work: "${mostCitedPublication.title}" (${mostCitedPublication.venue}, ${mostCitedPublication.citations} citations).`
          : ""),
      scoreExplanation: {
        totalScore,
        breakdown: {
          citations: { score: Math.round(overallCitations), explanation: "Citations relative to peers." },
          hIndex: { score: Math.round(firstAuthorImpact), explanation: "H-index based impact." },
          publications: { score: Math.round(publicationVolume), explanation: "Publication volume in recent years." },
          impact: { score: Math.round(firstAuthorImpact), explanation: "First-author and impact indicators." },
        },
      },
      keyStrengths,
      potentialConcerns: [],
    };

    const candidate: UICandidate = {
      id: row.id,
      name: row.name,
      university: uni.name,
      department: "Computer Science",
      advisor: "",
      researchAreas: primaryResearchAreas,
      publications,
      publicationCount,
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

  const search = filters.searchQuery.trim().toLowerCase();
  let universities = Object.values(uniIdToUniversity);
  if (search) {
    universities = universities
      .map((u) => ({
        ...u,
        candidates: u.candidates.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.researchAreas.some((area) => area.toLowerCase().includes(search))
        ),
      }))
      .filter((u) => u.name.toLowerCase().includes(search) || u.candidates.length > 0);
  }

  for (const u of universities) {
    u.candidates.sort((a, b) => b.rankingScore - a.rankingScore);
  }

  universities.sort((a, b) => a.ranking - b.ranking);

  return universities;
}
