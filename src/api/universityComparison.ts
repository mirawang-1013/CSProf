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

// Predefined emerging topics with keyword variations
// Expanded to include more research areas beyond just AI/ML
const EMERGING_TOPICS = [
  // AI/ML Topics
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
  'Reinforcement Learning from Human Feedback',
  // High-Performance Computing & Systems
  'High-Performance Computing',
  'Distributed Systems',
  'Parallel Computing',
  'Cloud Computing',
  // Materials Science & Engineering
  'Materials Science',
  'Advanced Materials',
  'Additive Manufacturing',
  'Computational Materials',
  'Nuclear Materials',
  'Fusion Materials',
  // Energy Systems
  'Nuclear Engineering',
  'Fusion Technology',
  'Advanced Energy Systems',
  'Renewable Energy',
  'Energy Storage',
  // Control & Automation
  'Control Systems',
  'Automation Engineering',
  'Cyber-Physical Systems',
  'Robotics',
  'Autonomous Systems',
  // Computational Methods
  'Computational Mechanics',
  'Computational Physics',
  'Simulation',
  'Modeling',
  // Other Emerging Areas
  'Plasma Physics',
  'Thermal Hydraulics',
  'Reactor Safety',
  'Radiation Damage'
];

// Keyword mappings for better matching (topic -> keywords)
const TOPIC_KEYWORDS: Record<string, string[]> = {
  // AI/ML
  'Large Language Models': ['llm', 'large language model', 'language model', 'gpt', 'bert', 'transformer model'],
  'Generative AI': ['generative', 'generative ai', 'gan', 'generative adversarial', 'text generation', 'image generation'],
  'Federated Learning': ['federated', 'federated learning', 'distributed learning', 'privacy-preserving'],
  'Edge Computing': ['edge', 'edge computing', 'edge ai', 'mobile computing', 'iot'],
  'Explainable AI': ['explainable', 'xai', 'interpretable', 'model interpretability', 'explainability'],
  'Neural Architecture Search': ['nas', 'neural architecture', 'architecture search', 'auto ml'],
  'Graph Neural Networks': ['gnn', 'graph neural', 'graph network', 'graph learning', 'graph convolution'],
  'Multimodal Learning': ['multimodal', 'multi-modal', 'vision-language', 'cross-modal'],
  'Zero-Shot Learning': ['zero-shot', 'zero shot', 'few-shot', 'few shot', 'transfer learning'],
  'Sustainable Computing': ['sustainable', 'green computing', 'energy efficient', 'carbon footprint'],
  'Foundation Models': ['foundation model', 'foundation models', 'pre-trained model', 'base model'],
  'Transformers': ['transformer', 'attention mechanism', 'self-attention', 'bert', 'gpt'],
  'Diffusion Models': ['diffusion', 'diffusion model', 'stable diffusion', 'denoising'],
  'Prompt Engineering': ['prompt', 'prompting', 'in-context learning', 'few-shot prompting'],
  'Reinforcement Learning from Human Feedback': ['rlhf', 'reinforcement learning from human', 'human feedback', 'preference learning'],
  // High-Performance Computing
  'High-Performance Computing': ['high-performance computing', 'hpc', 'supercomputing', 'parallel computing', 'distributed computing'],
  'Distributed Systems': ['distributed systems', 'distributed computing', 'distributed architecture'],
  'Parallel Computing': ['parallel computing', 'parallel processing', 'parallel algorithms'],
  'Cloud Computing': ['cloud computing', 'cloud systems', 'cloud infrastructure'],
  // Materials Science
  'Materials Science': ['materials science', 'material science', 'materials engineering', 'material engineering'],
  'Advanced Materials': ['advanced materials', 'novel materials', 'smart materials'],
  'Additive Manufacturing': ['additive manufacturing', '3d printing', 'rapid prototyping'],
  'Computational Materials': ['computational materials', 'materials simulation', 'materials modeling'],
  'Nuclear Materials': ['nuclear materials', 'nuclear material', 'fusion materials', 'reactor materials'],
  'Fusion Materials': ['fusion materials', 'fusion material', 'nuclear fusion materials'],
  // Energy Systems
  'Nuclear Engineering': ['nuclear engineering', 'nuclear', 'reactor', 'nuclear reactor'],
  'Fusion Technology': ['fusion technology', 'fusion', 'nuclear fusion', 'fusion energy'],
  'Advanced Energy Systems': ['advanced energy', 'energy systems', 'energy technology'],
  'Renewable Energy': ['renewable energy', 'solar', 'wind energy', 'clean energy'],
  'Energy Storage': ['energy storage', 'battery', 'energy storage systems'],
  // Control & Automation
  'Control Systems': ['control systems', 'control engineering', 'control theory'],
  'Automation Engineering': ['automation', 'automation engineering', 'industrial automation'],
  'Cyber-Physical Systems': ['cyber-physical', 'cyber physical', 'cps', 'embedded systems'],
  'Robotics': ['robotics', 'robotic', 'robot', 'autonomous robot'],
  'Autonomous Systems': ['autonomous systems', 'autonomous', 'self-driving'],
  // Computational Methods
  'Computational Mechanics': ['computational mechanics', 'computational engineering', 'numerical methods'],
  'Computational Physics': ['computational physics', 'physics simulation', 'numerical physics'],
  'Simulation': ['simulation', 'modeling', 'computational modeling'],
  'Modeling': ['modeling', 'modelling', 'computational modeling', 'simulation'],
  // Other
  'Plasma Physics': ['plasma physics', 'plasma', 'plasma science'],
  'Thermal Hydraulics': ['thermal hydraulics', 'thermal hydraulic', 'heat transfer'],
  'Reactor Safety': ['reactor safety', 'nuclear safety', 'safety analysis'],
  'Radiation Damage': ['radiation damage', 'radiation', 'irradiation', 'damage modeling']
};

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
    console.log('[Conference Distribution] Querying for:', universityNames, `(${startYear}-${endYear})`);
    
    // First, get university IDs
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .in('name', universityNames);

    if (!universities || universities.length === 0) {
      console.warn('[Conference Distribution] No universities found for names:', universityNames);
      return [];
    }

    console.log('[Conference Distribution] Found universities:', universities.map(u => ({ id: u.id, name: u.name })));

    const universityIds = universities.map(u => u.id);
    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Get candidate IDs for these universities
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, university_id')
      .in('university_id', universityIds);

    if (!candidates || candidates.length === 0) {
      console.warn('[Conference Distribution] No candidates found for university IDs:', universityIds);
      return [];
    }

    console.log('[Conference Distribution] Found candidates:', candidates.length);

    const candidateIds = candidates.map(c => c.id);
    const candidateUniversityMap = new Map(candidates.map(c => [c.id, c.university_id]));

    // Fetch all publications first to check availability
    const { data: allPublications, error: allError } = await supabase
      .from('publications')
      .select('venue, year, candidate_id')
      .in('candidate_id', candidateIds);

    if (allError) {
      console.error('[Conference Distribution] Error fetching all publications:', allError);
    } else {
      console.log('[Conference Distribution] Total publications (all years):', allPublications?.length || 0);
      if (allPublications && allPublications.length > 0) {
        const years = [...new Set(allPublications.map(p => p.year))].sort();
        console.log('[Conference Distribution] Available years:', years);
      }
    }

    // Now filter by year
    const { data: publications, error } = await supabase
      .from('publications')
      .select('venue, year, candidate_id')
      .in('candidate_id', candidateIds)
      .gte('year', startYear)
      .lte('year', endYear);

    if (error) {
      console.error('[Conference Distribution] Error fetching publications:', error);
      return [];
    }

    console.log('[Conference Distribution] Found publications in period:', publications?.length || 0);
    if (publications && publications.length > 0) {
      console.log('[Conference Distribution] Sample venues:', 
        [...new Set(publications.slice(0, 10).map(p => p.venue))]);
    } else {
      console.warn(`[Conference Distribution] No publications in period ${startYear}-${endYear}`);
    }

    // Aggregate by conference and university
    const conferenceMap = new Map<string, Map<string, number>>();
    let skippedCount = 0;
    let normalizedCount = 0;

    for (const pub of publications || []) {
      const universityId = candidateUniversityMap.get(pub.candidate_id);
      if (!universityId) {
        skippedCount++;
        continue;
      }

      const universityName = universityMap.get(universityId);
      if (!universityName) {
        skippedCount++;
        continue;
      }

      const conference = normalizeConferenceName(pub.venue);
      if (!conference) {
        skippedCount++;
        continue;
      }
      normalizedCount++;

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

    console.log('[Conference Distribution] Normalized conferences:', normalizedCount, 'Skipped:', skippedCount);
    console.log('[Conference Distribution] Final result count:', result.length);

    // Sort by total and return top 12
    return result
      .sort((a, b) => (b as any).total - (a as any).total)
      .slice(0, 12);
  } catch (error) {
    console.error('[Conference Distribution] Error:', error);
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
    console.log('[Emerging Topics] Querying for:', universityNames, `(${startYear}-${endYear})`);
    
    // Get university IDs
    const { data: universities } = await supabase
      .from('universities')
      .select('id, name')
      .in('name', universityNames);

    if (!universities || universities.length === 0) {
      console.warn('[Emerging Topics] No universities found for names:', universityNames);
      return [];
    }

    console.log('[Emerging Topics] Found universities:', universities.map(u => ({ id: u.id, name: u.name })));

    const universityIds = universities.map(u => u.id);
    const universityMap = new Map(universities.map(u => [u.id, u.name]));

    // Fetch candidates with research interests
    const { data: candidates } = await supabase
      .from('candidates')
      .select('id, university_id, research_interests')
      .in('university_id', universityIds);

    if (!candidates) {
      console.warn('[Emerging Topics] No candidates found for university IDs:', universityIds);
      return [];
    }

    console.log('[Emerging Topics] Found candidates:', candidates.length);

    // Fetch publications (without year filter first to check if they exist)
    const { data: allPublications } = await supabase
      .from('publications')
      .select('candidate_id, year')
      .in('candidate_id', candidates.map(c => c.id));
    
    console.log(`[Emerging Topics] Total publications for candidates (all years):`, allPublications?.length || 0);
    
    // Now filter by year
    const publications = allPublications?.filter(p => 
      p.year >= startYear && p.year <= endYear
    ) || [];

    if (!publications || publications.length === 0) {
      console.warn(`[Emerging Topics] No publications found in period ${startYear}-${endYear}`);
      if (allPublications && allPublications.length > 0) {
        const years = [...new Set(allPublications.map(p => p.year))].sort();
        console.warn(`[Emerging Topics] Available years in data:`, years);
      }
      return [];
    }
    
    // Debug: Log data availability
    const candidatesWithInterests = candidates.filter(c => 
      c.research_interests && 
      Array.isArray(c.research_interests) && 
      c.research_interests.length > 0
    );
    console.log(`[Emerging Topics] Found ${candidates.length} candidates, ${candidatesWithInterests.length} with research interests`);
    console.log(`[Emerging Topics] Found ${publications.length} publications in period ${startYear}-${endYear}`);
    if (candidatesWithInterests.length > 0) {
      const sampleInterests = candidatesWithInterests.slice(0, 5).map(c => c.research_interests);
      console.log(`[Emerging Topics] Sample research interests:`, sampleInterests);
      // Log all unique research interests to see what we're working with
      const allInterests = candidatesWithInterests.flatMap(c => 
        Array.isArray(c.research_interests) ? c.research_interests : []
      );
      const uniqueInterests = [...new Set(allInterests)];
      console.log(`[Emerging Topics] All unique research interests (${uniqueInterests.length}):`, uniqueInterests);
    } else {
      console.warn(`[Emerging Topics] No candidates have research_interests!`);
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
        if (!topic || typeof topic !== 'string') continue;
        
        const topicLower = topic.toLowerCase().trim();
        let matchedEmerging: string | null = null;
        
        // First, try exact/contains match with topic names
        for (const et of EMERGING_TOPICS) {
          const etLower = et.toLowerCase();
          
          // Exact match or contains match
          if (topicLower === etLower || 
              topicLower.includes(etLower) || 
              etLower.includes(topicLower)) {
            matchedEmerging = et;
            break;
          }
        }
        
        // If no match, try keyword-based matching
        if (!matchedEmerging) {
          for (const [et, keywords] of Object.entries(TOPIC_KEYWORDS)) {
            for (const keyword of keywords) {
              if (topicLower.includes(keyword.toLowerCase())) {
                matchedEmerging = et;
                break;
              }
            }
            if (matchedEmerging) break;
          }
        }
        
        // If still no match, try partial keyword matching
        if (!matchedEmerging) {
          for (const et of EMERGING_TOPICS) {
            const etLower = et.toLowerCase();
            const etKeywords = etLower.split(/\s+/);
            const topicKeywords = topicLower.split(/\s+/);
            
            // Check if at least 2 keywords match (for multi-word topics)
            if (etKeywords.length > 1) {
              const matchingKeywords = etKeywords.filter(ek => 
                topicKeywords.some(tk => tk.includes(ek) || ek.includes(tk))
              );
              if (matchingKeywords.length >= Math.min(2, etKeywords.length)) {
                matchedEmerging = et;
                break;
              }
            }
          }
        }

        if (matchedEmerging) {
          if (!topicMap.has(matchedEmerging)) {
            topicMap.set(matchedEmerging, new Map());
          }
          const universityCounts = topicMap.get(matchedEmerging)!;
          const currentCount = universityCounts.get(university) || 0;
          universityCounts.set(university, currentCount + 1);
          console.log(`[Emerging Topics] Matched "${topic}" -> "${matchedEmerging}"`);
        } else {
          // Log unmatched topics for debugging
          console.log(`[Emerging Topics] No match for topic: "${topic}"`);
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
    const sortedResult = result
      .sort((a, b) => (b as any).total - (a as any).total)
      .slice(0, 8);
    
    // Debug: Log results
    console.log(`[Emerging Topics] Found ${sortedResult.length} emerging topics`);
    if (sortedResult.length === 0) {
      console.warn('[Emerging Topics] No topics found. Possible reasons:');
      console.warn('  - research_interests may be empty or null');
      console.warn('  - research_interests may not match predefined emerging topics');
      console.warn('  - Try checking candidate data for the selected university');
    } else {
      console.log('[Emerging Topics] Topics found:', sortedResult.map(r => r.topic));
    }
    
    return sortedResult;
  } catch (error) {
    console.error('Error in fetchEmergingTopics:', error);
    return [];
  }
}

