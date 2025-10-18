// Mock data for the academic platform

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  citations: number;
  type: 'conference' | 'journal' | 'workshop';
}

export interface Candidate {
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

export interface University {
  id: string;
  name: string;
  ranking: number;
  location: string;
  candidates: Candidate[];
}

// Generate mock radar data based on candidate profile
// Data sources: Publication records, Google Scholar metrics, venue rankings (CSRankings), topic classification
const generateRadarData = (candidate: any) => {
  const topConferences = ['ICML', 'NeurIPS', 'ICLR', 'AAAI', 'IJCAI', 'CVPR', 'ICCV', 'ECCV', 'ACL', 'EMNLP'];
  const hotTopics = ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Reinforcement Learning'];
  
  // Calculate first author publications (assume 40% are first author for mock data)
  const firstAuthorPubs = Math.ceil(candidate.publications.length * 0.4);
  const firstAuthorCitations = Math.ceil(candidate.totalCitations * 0.3); // First author papers typically get 30% of total citations
  
  // Calculate top conference publications
  const topConferencePapers = candidate.publications.filter(p => 
    topConferences.some(conf => p.venue.includes(conf))
  ).length;
  
  // Calculate hot topic citations (simulate based on research areas)
  const hotTopicCitations = Math.ceil(candidate.totalCitations * 0.25); // Assume 25% of citations are on hot topics
  
  return [
    { 
      subject: 'Publication Volume', 
      value: Math.min(candidate.publications.length * 12, 100), 
      fullMark: 100,
      source: 'Total paper count from publication records'
    },
    { 
      subject: 'First Author Impact', 
      value: Math.min(firstAuthorCitations / 8, 100), 
      fullMark: 100,
      source: 'Citations to first-author publications'
    },
    { 
      subject: 'Top Venue Presence', 
      value: Math.min(topConferencePapers * 25, 100), 
      fullMark: 100,
      source: 'Papers in top conferences (CSRankings weighted)'
    },
    { 
      subject: 'Hot Topic Citations', 
      value: Math.min(hotTopicCitations / 6, 100), 
      fullMark: 100,
      source: 'Citations on trending research topics'
    },
    { 
      subject: 'Overall Citations', 
      value: Math.min(candidate.totalCitations / 20, 100), 
      fullMark: 100,
      source: 'Total citation count from Google Scholar'
    }
  ];
};

// Mock publications
const mockPublications: Publication[] = [
  {
    id: 'pub1',
    title: 'Deep Learning Approaches for Computer Vision: A Comprehensive Survey',
    authors: ['Sarah Chen', 'Michael Johnson', 'David Wilson'],
    venue: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    year: 2021,
    citations: 245,
    type: 'journal'
  },
  {
    id: 'pub2',
    title: 'Attention Mechanisms in Neural Machine Translation',
    authors: ['Alex Rodriguez', 'Emma Thompson', 'James Lee'],
    venue: 'AAAI Conference on Artificial Intelligence',
    year: 2020,
    citations: 189,
    type: 'conference'
  },
  {
    id: 'pub3',
    title: 'Reinforcement Learning for Autonomous Navigation',
    authors: ['Maria Garcia', 'Robert Brown', 'Lisa Wang'],
    venue: 'International Conference on Machine Learning',
    year: 2021,
    citations: 156,
    type: 'conference'
  },
  {
    id: 'pub4',
    title: 'Graph Neural Networks for Social Network Analysis',
    authors: ['Kevin Park', 'Jennifer Davis', 'Tom Anderson'],
    venue: 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining',
    year: 2020,
    citations: 203,
    type: 'conference'
  },
  {
    id: 'pub5',
    title: 'Federated Learning with Privacy Preservation',
    authors: ['Raj Patel', 'Sophie Martin', 'Chris Taylor'],
    venue: 'Conference on Neural Information Processing Systems',
    year: 2021,
    citations: 178,
    type: 'conference'
  },
  {
    id: 'pub6',
    title: 'Quantum Machine Learning: Progress and Challenges',
    authors: ['Research Author', 'Co-Author 1', 'Co-Author 2'],
    venue: 'Nature Machine Intelligence',
    year: 2021,
    citations: 312,
    type: 'journal'
  },
  {
    id: 'pub7',
    title: 'Transformer Networks for Code Generation',
    authors: ['Research Author', 'Co-Author 1'],
    venue: 'International Conference on Software Engineering',
    year: 2020,
    citations: 167,
    type: 'conference'
  },
  {
    id: 'pub8',
    title: 'Privacy-Preserving Blockchain Technologies',
    authors: ['Research Author', 'Co-Author 1', 'Co-Author 2'],
    venue: 'ACM Conference on Computer and Communications Security',
    year: 2021,
    citations: 234,
    type: 'conference'
  },
  {
    id: 'pub9',
    title: 'Edge Computing for IoT Applications',
    authors: ['Research Author', 'Co-Author 1'],
    venue: 'IEEE Internet of Things Journal',
    year: 2020,
    citations: 198,
    type: 'journal'
  },
  {
    id: 'pub10',
    title: 'Neural Architecture Search with Evolutionary Algorithms',
    authors: ['Research Author', 'Co-Author 1', 'Co-Author 2'],
    venue: 'Genetic and Evolutionary Computation Conference',
    year: 2021,
    citations: 143,
    type: 'conference'
  }
];

// Create mock candidates
const createMockCandidate = (
  id: string,
  name: string,
  university: string,
  department: string,
  advisor: string,
  researchAreas: string[],
  graduationYear: number,
  publicationCount: number = 3
): Candidate => {
  const candidatePublications = mockPublications.slice(0, publicationCount).map((pub, index) => ({
    ...pub,
    id: `${id}_pub_${index}`,
    authors: [name, ...pub.authors.slice(1)]
  }));

  const totalCitations = candidatePublications.reduce((sum, pub) => sum + pub.citations, 0);
  const hIndex = Math.min(Math.floor(Math.sqrt(totalCitations / 10)), candidatePublications.length);
  
  const candidate = {
    id,
    name,
    university,
    department,
    advisor,
    researchAreas,
    publications: candidatePublications,
    totalCitations,
    hIndex,
    graduationYear,
    email: `${name.toLowerCase().replace(' ', '.')}@university.edu`,
    website: Math.random() > 0.5 ? `https://${name.toLowerCase().replace(' ', '')}.github.io` : undefined,
    radarData: [],
    rankingScore: 0
  };

  candidate.radarData = generateRadarData(candidate);
  
  // Calculate normalized scores for each component (0-100 scale)
  const citationScore = Math.min((candidate.totalCitations / 10), 100); // Max 1000 citations = 100 points
  const hIndexScore = Math.min(candidate.hIndex * 12, 100); // Max ~8 h-index = 100 points  
  const publicationScore = Math.min(candidate.publications.length * 15, 100); // Max ~7 pubs = 100 points
  const impactScore = Math.min((candidate.totalCitations / candidate.publications.length) / 3, 100); // Avg citations per paper
  
  // Weighted average capped at 100
  candidate.rankingScore = Math.min(
    Math.round(
      citationScore * 0.35 + 
      hIndexScore * 0.25 + 
      publicationScore * 0.25 + 
      impactScore * 0.15
    ), 
    100
  );

  // Generate analysis
  const topVenue = candidatePublications.reduce((prev, current) => 
    (prev.citations > current.citations) ? prev : current
  );
  
  const avgCitationsPerPaper = Math.round(candidate.totalCitations / candidate.publications.length);
  
  candidate.analysis = {
    bio: `${name} completed their PhD at ${university} under the supervision of ${advisor}. Their research focuses on the intersection of ${researchAreas.slice(0, 2).join(' and ')}, with particular emphasis on practical applications and theoretical foundations. During their doctoral studies, they demonstrated strong research capabilities through ${candidatePublications.length} high-quality publications.`,
    
    researchSummary: `Their research primarily concentrates on ${researchAreas[0]}, with significant contributions to ${researchAreas.slice(1).join(', ')}. Most notably, their work on "${topVenue.title}" has gained substantial attention in the research community. Their approach combines theoretical rigor with practical implementations, positioning them well for both academic and industry roles.`,
    
    scoreExplanation: {
      totalScore: candidate.rankingScore,
      breakdown: {
        citations: {
          score: Math.round(citationScore),
          explanation: `${candidate.totalCitations} total citations (${avgCitationsPerPaper} avg per paper) indicates ${candidate.totalCitations > 500 ? 'excellent' : candidate.totalCitations > 200 ? 'strong' : 'moderate'} research impact and community recognition.`
        },
        hIndex: {
          score: Math.round(hIndexScore),
          explanation: `h-index of ${candidate.hIndex} demonstrates ${candidate.hIndex >= 6 ? 'strong' : candidate.hIndex >= 4 ? 'solid' : 'developing'} research productivity with sustained citation impact across multiple publications.`
        },
        publications: {
          score: Math.round(publicationScore),
          explanation: `${candidatePublications.length} publications in ${graduationYear - 2016}-${graduationYear} shows ${candidatePublications.length >= 4 ? 'excellent' : candidatePublications.length >= 3 ? 'good' : 'adequate'} research output for a PhD graduate.`
        },
        impact: {
          score: Math.round(impactScore),
          explanation: `Research quality evidenced by publication in venues like ${topVenue.venue} and average ${avgCitationsPerPaper} citations per paper.`
        }
      }
    },
    
    keyStrengths: [
      candidate.totalCitations > 400 ? 'High-impact research with strong citation metrics' : 'Solid research foundation with growing impact',
      `Expertise in ${researchAreas[0]} with interdisciplinary knowledge`,
      candidatePublications.length >= 4 ? 'Prolific publication record' : 'Consistent publication output',
      `Mentorship from renowned advisor ${advisor.split(' ').slice(-1)[0]}`
    ],
    
    potentialConcerns: [
      candidate.totalCitations < 200 ? 'Moderate citation impact may indicate emerging research visibility' : null,
      candidatePublications.length < 3 ? 'Limited publication count for PhD level' : null,
      candidate.hIndex < 4 ? 'Developing h-index suggests need for continued research impact' : null
    ].filter(Boolean)
  };

  return candidate;
};

// Mock universities with candidates
export const mockUniversities: University[] = [
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    ranking: 1,
    location: 'Cambridge, MA',
    candidates: [
      createMockCandidate(
        'mit1',
        'Sarah Chen',
        'MIT',
        'Computer Science and Artificial Intelligence Laboratory',
        'Prof. Regina Barzilay',
        ['Machine Learning', 'Computer Vision', 'Deep Learning'],
        2021,
        4
      ),
      createMockCandidate(
        'mit2',
        'Alex Rodriguez',
        'MIT',
        'Computer Science and Artificial Intelligence Laboratory',
        'Prof. Tomaso Poggio',
        ['Natural Language Processing', 'Machine Learning', 'Computational Linguistics'],
        2021,
        3
      ),
      createMockCandidate(
        'mit3',
        'Maria Garcia',
        'MIT',
        'Computer Science and Artificial Intelligence Laboratory',
        'Prof. Leslie Kaelbling',
        ['Reinforcement Learning', 'Robotics', 'Artificial Intelligence'],
        2020,
        5
      ),
      createMockCandidate(
        'mit4',
        'Daniel Kim',
        'MIT',
        'Computer Science and Artificial Intelligence Laboratory',
        'Prof. Antonio Torralba',
        ['Computer Vision', 'Deep Learning', 'Neural Networks'],
        2021,
        3
      )
    ]
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    ranking: 2,
    location: 'Stanford, CA',
    candidates: [
      createMockCandidate(
        'stanford1',
        'Kevin Park',
        'Stanford University',
        'Computer Science Department',
        'Prof. Jure Leskovec',
        ['Graph Neural Networks', 'Data Mining', 'Machine Learning'],
        2021,
        4
      ),
      createMockCandidate(
        'stanford2',
        'Emma Thompson',
        'Stanford University',
        'Computer Science Department',
        'Prof. Christopher Manning',
        ['Natural Language Processing', 'Deep Learning', 'Information Extraction'],
        2020,
        3
      ),
      createMockCandidate(
        'stanford3',
        'Ryan Zhang',
        'Stanford University',
        'Computer Science Department',
        'Prof. Fei-Fei Li',
        ['Computer Vision', 'Human-Computer Interaction', 'AI Ethics'],
        2021,
        4
      )
    ]
  },
  {
    id: 'cmu',
    name: 'Carnegie Mellon University',
    ranking: 3,
    location: 'Pittsburgh, PA',
    candidates: [
      createMockCandidate(
        'cmu1',
        'Raj Patel',
        'Carnegie Mellon University',
        'School of Computer Science',
        'Prof. Ruslan Salakhutdinov',
        ['Federated Learning', 'Privacy', 'Machine Learning'],
        2021,
        3
      ),
      createMockCandidate(
        'cmu2',
        'Lisa Wang',
        'Carnegie Mellon University',
        'Robotics Institute',
        'Prof. Sebastian Thrun',
        ['Autonomous Systems', 'Computer Vision', 'Robotics'],
        2020,
        4
      ),
      createMockCandidate(
        'cmu3',
        'James Wilson',
        'Carnegie Mellon University',
        'Language Technologies Institute',
        'Prof. Graham Neubig',
        ['Natural Language Processing', 'Machine Translation', 'Deep Learning'],
        2021,
        3
      )
    ]
  },
  {
    id: 'berkeley',
    name: 'University of California, Berkeley',
    ranking: 4,
    location: 'Berkeley, CA',
    candidates: [
      createMockCandidate(
        'berkeley1',
        'Michael Johnson',
        'UC Berkeley',
        'Electrical Engineering and Computer Sciences',
        'Prof. Pieter Abbeel',
        ['Deep Reinforcement Learning', 'Robotics', 'Machine Learning'],
        2021,
        4
      ),
      createMockCandidate(
        'berkeley2',
        'Jennifer Davis',
        'UC Berkeley',
        'Electrical Engineering and Computer Sciences',
        'Prof. Dawn Song',
        ['Cybersecurity', 'Machine Learning', 'Privacy'],
        2020,
        3
      ),
      createMockCandidate(
        'berkeley3',
        'Anna Martinez',
        'UC Berkeley',
        'Electrical Engineering and Computer Sciences',
        'Prof. Stuart Russell',
        ['Artificial Intelligence', 'AI Safety', 'Decision Theory'],
        2021,
        4
      )
    ]
  },
  {
    id: 'princeton',
    name: 'Princeton University',
    ranking: 5,
    location: 'Princeton, NJ',
    candidates: [
      createMockCandidate(
        'princeton1',
        'David Wilson',
        'Princeton University',
        'Computer Science Department',
        'Prof. Olga Russakovsky',
        ['Computer Vision', 'Machine Learning', 'Fairness in AI'],
        2021,
        3
      ),
      createMockCandidate(
        'princeton2',
        'Sophie Martin',
        'Princeton University',
        'Computer Science Department',
        'Prof. Sanjeev Arora',
        ['Theory of Machine Learning', 'Deep Learning', 'Optimization'],
        2020,
        4
      )
    ]
  },
  {
    id: 'caltech',
    name: 'California Institute of Technology',
    ranking: 6,
    location: 'Pasadena, CA',
    candidates: [
      createMockCandidate(
        'caltech1',
        'Thomas Anderson',
        'Caltech',
        'Computing and Mathematical Sciences',
        'Prof. Pietro Perona',
        ['Computer Vision', 'Machine Learning', 'Computational Biology'],
        2021,
        3
      ),
      createMockCandidate(
        'caltech2',
        'Grace Liu',
        'Caltech',
        'Computing and Mathematical Sciences',
        'Prof. Yaser Abu-Mostafa',
        ['Machine Learning', 'Data Mining', 'Financial Engineering'],
        2020,
        4
      )
    ]
  },
  {
    id: 'cornell',
    name: 'Cornell University',
    ranking: 7,
    location: 'Ithaca, NY',
    candidates: [
      createMockCandidate(
        'cornell1',
        'Michelle Brown',
        'Cornell University',
        'Computer Science Department',
        'Prof. Thorsten Joachims',
        ['Machine Learning', 'Information Retrieval', 'Human-Computer Interaction'],
        2021,
        3
      ),
      createMockCandidate(
        'cornell2',
        'Robert Taylor',
        'Cornell University',
        'Computer Science Department',
        'Prof. Kilian Weinberger',
        ['Deep Learning', 'Computer Vision', 'Optimization'],
        2020,
        4
      ),
      createMockCandidate(
        'cornell3',
        'Alice Chang',
        'Cornell University',
        'Computer Science Department',
        'Prof. Serge Belongie',
        ['Computer Vision', 'Machine Learning', 'Visual Recognition'],
        2021,
        3
      )
    ]
  },
  {
    id: 'georgia_tech',
    name: 'Georgia Institute of Technology',
    ranking: 8,
    location: 'Atlanta, GA',
    candidates: [
      createMockCandidate(
        'gatech1',
        'Carlos Rodriguez',
        'Georgia Tech',
        'School of Computer Science',
        'Prof. Devi Parikh',
        ['Computer Vision', 'Natural Language Processing', 'Multimodal AI'],
        2021,
        4
      ),
      createMockCandidate(
        'gatech2',
        'Priya Sharma',
        'Georgia Tech',
        'School of Computer Science',
        'Prof. Le Song',
        ['Machine Learning', 'Deep Learning', 'Computational Biology'],
        2020,
        3
      )
    ]
  },
  {
    id: 'illinois',
    name: 'University of Illinois at Urbana-Champaign',
    ranking: 9,
    location: 'Urbana, IL',
    candidates: [
      createMockCandidate(
        'illinois1',
        'Eric Johnson',
        'UIUC',
        'Computer Science Department',
        'Prof. Jiawei Han',
        ['Data Mining', 'Machine Learning', 'Big Data Analytics'],
        2021,
        4
      ),
      createMockCandidate(
        'illinois2',
        'Rachel Green',
        'UIUC',
        'Computer Science Department',
        'Prof. Derek Hoiem',
        ['Computer Vision', 'Machine Learning', 'Visual Understanding'],
        2020,
        3
      )
    ]
  },
  {
    id: 'washington',
    name: 'University of Washington',
    ranking: 10,
    location: 'Seattle, WA',
    candidates: [
      createMockCandidate(
        'washington1',
        'Steven Lee',
        'University of Washington',
        'Paul G. Allen School of Computer Science & Engineering',
        'Prof. Emily Fox',
        ['Machine Learning', 'Bayesian Methods', 'Time Series Analysis'],
        2021,
        3
      ),
      createMockCandidate(
        'washington2',
        'Maya Patel',
        'University of Washington',
        'Paul G. Allen School of Computer Science & Engineering',
        'Prof. Ali Farhadi',
        ['Computer Vision', 'Natural Language Processing', 'Robotics'],
        2020,
        4
      ),
      createMockCandidate(
        'washington3',
        'Jordan Smith',
        'University of Washington',
        'Paul G. Allen School of Computer Science & Engineering',
        'Prof. Noah Smith',
        ['Natural Language Processing', 'Computational Linguistics', 'Machine Learning'],
        2021,
        3
      )
    ]
  }
];

// Fuzzy search function that supports partial matches and word order flexibility
const fuzzySearch = (searchText: string, targetText: string): boolean => {
  if (!searchText.trim()) return true;
  
  const search = searchText.toLowerCase().trim();
  const target = targetText.toLowerCase();
  
  // Exact match
  if (target.includes(search)) return true;
  
  // Split search into words and check if all words exist in target
  const searchWords = search.split(/\s+/).filter(word => word.length > 0);
  if (searchWords.length === 0) return true;
  
  // Check if all search words are found in the target (order doesn't matter)
  const allWordsFound = searchWords.every(word => {
    // Check for partial word matches (at least 3 characters)
    if (word.length >= 3) {
      return target.includes(word) || target.split(/\s+/).some(targetWord => 
        targetWord.startsWith(word) || word.startsWith(targetWord.substring(0, 3))
      );
    }
    return target.includes(word);
  });
  
  return allWordsFound;
};

// Filter candidates based on search criteria
export const filterCandidates = (
  universities: University[],
  filters: {
    searchQuery: string;
    yearRange: { start: number; end: number };
    minCitations: number;
    selectedTopics: string[];
  }
) => {
  return universities.map(uni => ({
    ...uni,
    candidates: uni.candidates.filter(candidate => {
      // Filter by search query (name or research field) with fuzzy search
      if (filters.searchQuery) {
        const nameMatch = fuzzySearch(filters.searchQuery, candidate.name);
        const fieldMatch = candidate.researchAreas.some(area => 
          fuzzySearch(filters.searchQuery, area)
        );
        // Also search in advisor name and university for more comprehensive results
        const advisorMatch = fuzzySearch(filters.searchQuery, candidate.advisor);
        const universityMatch = fuzzySearch(filters.searchQuery, candidate.university);
        
        if (!nameMatch && !fieldMatch && !advisorMatch && !universityMatch) return false;
      }

      // Filter by graduation year
      if (candidate.graduationYear < filters.yearRange.start || 
          candidate.graduationYear > filters.yearRange.end) {
        return false;
      }

      // Filter by minimum citations
      if (candidate.totalCitations < filters.minCitations) {
        return false;
      }

      // Filter by selected topics
      if (filters.selectedTopics.length > 0) {
        const topicMatch = filters.selectedTopics.some(topic =>
          candidate.researchAreas.some(area => 
            area.toLowerCase().includes(topic.toLowerCase())
          )
        );
        if (!topicMatch) return false;
      }

      return true;
    })
  })).filter(uni => uni.candidates.length > 0);
};