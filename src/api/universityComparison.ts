import { supabase } from "../lib/supabase";

export interface AcademicMetric {
  university_name: string;
  year: number;
  publications_count: number;
  total_citations: number;
}

export interface ConferenceData {
  conference: string;
  [university: string]: number | string;
}

export interface TopicHeatmapData {
  year: string;
  topic: string;
  papers: number;
  university: string;
  x: number;
  y: number;
  z: number;
}

export interface EmergingTopicData {
  topic: string;
  [university: string]: number | string;
}

// Map of known conference patterns (venue name -> standardized name)
const CONFERENCE_PATTERNS: Record<string, string> = {
  'icml': 'ICML',
  'neurips': 'NeurIPS',
  'nips': 'NeurIPS',
  'iclr': 'ICLR',
  'aaai': 'AAAI',
  'ijcai': 'IJCAI',
  'acl': 'ACL',
  'emnlp': 'EMNLP',
  'cvpr': 'CVPR',
  'iccv': 'ICCV',
  'eccv': 'ECCV',
  'sigmod': 'SIGMOD',
  'vldb': 'VLDB',
  'kdd': 'KDD',
  'www': 'WWW',
  'chi': 'CHI',
  'uist': 'UIST',
  'usenix': 'USENIX',
  'osdi': 'OSDI',
  'sosp': 'SOSP',
  'ccs': 'CCS',
  'ndss': 'NDSS',
};

// Predefined emerging topics
const EMERGING_TOPICS = [
  'Large Language Models',
  'Generative AI',
  'Federated Learning',
  'Edge Computing',
  'Explainable AI',
  'Neural Architecture Search',
  'Graph Neural Networks',
  'Multimodal Learning',
  'Zero-Shot Learning',
  'Sustainable Computing',
  'Foundation Models',
  'Transformers',
  'Diffusion Models',
  'Prompt Engineering',
  'Reinforcement Learning from Human Feedback'
];

/**
 * Normalize venue name to standardized conference name
 */
function normalizeConferenceName(venue: string): string | null {
  if (!venue) return null;
  
  const venueLower = venue.toLowerCase();
  
  // Check if venue matches any known pattern
  for (const [pattern, conference] of Object.entries(CONFERENCE_PATTERNS)) {
    if (venueLower.includes(pattern)) {
      return conference;
    }
  }
  
  return null;
}

/**
 * Fetch academic metrics for multiple universities over a time period
 */
export async function fetchAcademicMetrics(
  universityNames: string[],
  startYear: number,
  endYear: number
): Promise<AcademicMetric[]> {
  try {
    // First, get university IDs
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .in('name', universityNames);

    if (!universities || universities.length === 0) {
      return [];
    }

    const universityIds = universities.map(u => u.id);
    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Now fetch academic metrics
    const { data, error } = await supabase
      .from('academic_metrics')
      .select(`
        year,
        publications_count,
        total_citations,
        university_id
      `)
      .in('university_id', universityIds)
      .gte('year', startYear)
      .lte('year', endYear)
      .order('year', { ascending: true });

    if (error) {
      console.error('Error fetching academic metrics:', error);
      return [];
    }

    // Transform the data
    const metrics: AcademicMetric[] = [];
    for (const row of data || []) {
      const universityName = universityMap.get(row.university_id);
      if (universityName) {
        metrics.push({
          university_name: universityName,
          year: row.year,
          publications_count: row.publications_count || 0,
          total_citations: row.total_citations || 0,
        });
      }
    }

    return metrics;
  } catch (error) {
    console.error('Error in fetchAcademicMetrics:', error);
    return [];
  }
}

/**
 * Fetch conference distribution data
 * Aggregates publications by venue/conference for each university
 */
export async function fetchConferenceDistribution(
  universityNames: string[],
  startYear: number,
  endYear: number
): Promise<ConferenceData[]> {
  try {
    // First, get university IDs
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .in('name', universityNames);

    if (!universities || universities.length === 0) {
      return [];
    }

    const universityIds = universities.map(u => u.id);
    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Get candidate IDs for these universities
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, university_id')
      .in('university_id', universityIds);

    if (!candidates || candidates.length === 0) {
      return [];
    }

    const candidateIds = candidates.map(c => c.id);
    const candidateUniversityMap = new Map(candidates.map(c => [c.id, c.university_id]));

    // Fetch publications for these candidates
    const { data: publications, error } = await supabase
      .from('publications')
      .select('venue, year, candidate_id')
      .in('candidate_id', candidateIds)
      .gte('year', startYear)
      .lte('year', endYear);

    if (error) {
      console.error('Error fetching publications:', error);
      return [];
    }

    // Aggregate by conference and university
    const conferenceMap = new Map<string, Map<string, number>>();

    for (const pub of publications || []) {
      const universityId = candidateUniversityMap.get(pub.candidate_id);
      if (!universityId) continue;

      const universityName = universityMap.get(universityId);
      if (!universityName) continue;

      const conference = normalizeConferenceName(pub.venue);
      if (!conference) continue;

      if (!conferenceMap.has(conference)) {
        conferenceMap.set(conference, new Map());
      }

      const universityCounts = conferenceMap.get(conference)!;
      const currentCount = universityCounts.get(universityName) || 0;
      universityCounts.set(universityName, currentCount + 1);
    }

    // Convert to array format
    const result: ConferenceData[] = [];
    for (const [conference, universityCounts] of conferenceMap) {
      const data: ConferenceData = { conference };
      let total = 0;
      
      for (const [university, count] of universityCounts) {
        data[university] = count;
        total += count;
      }
      
      // Add total for sorting
      (data as any).total = total;
      result.push(data);
    }

    // Sort by total and return top 12
    return result
      .sort((a, b) => (b as any).total - (a as any).total)
      .slice(0, 12);
  } catch (error) {
    console.error('Error in fetchConferenceDistribution:', error);
    return [];
  }
}

/**
 * Fetch topic heatmap data
 * Aggregates by research topic, year, and university
 */
export async function fetchTopicHeatmap(
  universityNames: string[],
  startYear: number,
  endYear: number
): Promise<TopicHeatmapData[]> {
  try {
    // Get university IDs
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .in('name', universityNames);

    if (!universities || universities.length === 0) {
      return [];
    }

    const universityIds = universities.map(u => u.id);
    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Fetch candidates with their research interests
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, university_id, research_interests')
      .in('university_id', universityIds);

    if (!candidates) {
      return [];
    }

    // Fetch publications
    const { data: publications } = await supabase
      .from('publications')
      .select('candidate_id, year')
      .in('candidate_id', candidates.map(c => c.id))
      .gte('year', startYear)
      .lte('year', endYear);

    if (!publications) {
      return [];
    }

    // Create a map of candidate to university
    const candidateUniversityMap = new Map<string, string>();
    for (const candidate of candidates) {
      candidateUniversityMap.set(candidate.id, universityMap.get(candidate.university_id) || '');
    }

    // Aggregate: for each publication, distribute it across candidate's research interests
    const topicMap = new Map<string, Map<string, Map<string, number>>>();
    // Structure: university -> year -> topic -> count

    for (const pub of publications) {
      const university = candidateUniversityMap.get(pub.candidate_id);
      if (!university) continue;

      const candidate = candidates.find(c => c.id === pub.candidate_id);
      if (!candidate || !candidate.research_interests) continue;

      const year = pub.year.toString();
      const topics = Array.isArray(candidate.research_interests) 
        ? candidate.research_interests 
        : [];

      // Distribute this publication across all the candidate's research interests
      for (const topic of topics) {
        if (!topicMap.has(university)) {
          topicMap.set(university, new Map());
        }
        const yearMap = topicMap.get(university)!;
        
        if (!yearMap.has(year)) {
          yearMap.set(year, new Map());
        }
        const topicCountMap = yearMap.get(year)!;
        
        // Increment count (weighted: each paper counts as 1 per topic)
        const currentCount = topicCountMap.get(topic) || 0;
        topicCountMap.set(topic, currentCount + 1);
      }
    }

    // Convert to flat array
    const result: TopicHeatmapData[] = [];
    const topics = Array.from(
      new Set(
        Array.from(topicMap.values())
          .flatMap(yearMap => Array.from(yearMap.values()))
          .flatMap(topicMap => Array.from(topicMap.keys()))
      )
    ).sort();

    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => 
      (startYear + i).toString()
    );

    let topicIndex = 0;
    for (const topic of topics) {
      const y = topicIndex++;
      
      for (const university of universityNames) {
        const yearMap = topicMap.get(university);
        if (!yearMap) continue;

        let yearIndex = 0;
        for (const year of years) {
          const x = yearIndex++;
          const topicCountMap = yearMap.get(year);
          const papers = topicCountMap?.get(topic) || 0;

          result.push({
            year,
            topic,
            papers,
            university,
            x,
            y,
            z: papers,
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error in fetchTopicHeatmap:', error);
    return [];
  }
}

/**
 * Fetch emerging topics data
 * Aggregates papers for predefined emerging topics
 */
export async function fetchEmergingTopics(
  universityNames: string[],
  startYear: number,
  endYear: number
): Promise<EmergingTopicData[]> {
  try {
    // Get university IDs
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .in('name', universityNames);

    if (!universities || universities.length === 0) {
      return [];
    }

    const universityIds = universities.map(u => u.id);
    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Fetch candidates with research interests
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, university_id, research_interests')
      .in('university_id', universityIds);

    if (!candidates) {
      return [];
    }

    // Fetch publications
    const { data: publications } = await supabase
      .from('publications')
      .select('candidate_id, year')
      .in('candidate_id', candidates.map(c => c.id))
      .gte('year', startYear)
      .lte('year', endYear);

    if (!publications) {
      return [];
    }

    // Create candidate to university map
    const candidateUniversityMap = new Map<string, string>();
    for (const candidate of candidates) {
      candidateUniversityMap.set(candidate.id, universityMap.get(candidate.university_id) || '');
    }

    // Aggregate by emerging topic
    const topicMap = new Map<string, Map<string, number>>();
    // Structure: topic -> university -> count

    for (const pub of publications) {
      const university = candidateUniversityMap.get(pub.candidate_id);
      if (!university) continue;

      const candidate = candidates.find(c => c.id === pub.candidate_id);
      if (!candidate || !candidate.research_interests) continue;

      const topics = Array.isArray(candidate.research_interests) 
        ? candidate.research_interests 
        : [];

      // Check if any of the candidate's topics match emerging topics
      for (const topic of topics) {
        // Fuzzy match: check if topic contains any emerging topic keywords
        const matchedEmerging = EMERGING_TOPICS.find(et => 
          topic.toLowerCase().includes(et.toLowerCase()) || 
          et.toLowerCase().includes(topic.toLowerCase())
        );

        if (matchedEmerging) {
          if (!topicMap.has(matchedEmerging)) {
            topicMap.set(matchedEmerging, new Map());
          }
          const universityCounts = topicMap.get(matchedEmerging)!;
          const currentCount = universityCounts.get(university) || 0;
          universityCounts.set(university, currentCount + 1);
        }
      }
    }

    // Convert to array format
    const result: EmergingTopicData[] = [];
    for (const [topic, universityCounts] of topicMap) {
      const data: EmergingTopicData = { topic };
      let total = 0;

      for (const [university, count] of universityCounts) {
        data[university] = count;
        total += count;
      }

      (data as any).total = total;
      result.push(data);
    }

    // Sort by total and return top 8
    return result
      .sort((a, b) => (b as any).total - (a as any).total)
      .slice(0, 8);
  } catch (error) {
    console.error('Error in fetchEmergingTopics:', error);
    return [];
  }
}

