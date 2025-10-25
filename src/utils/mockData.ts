// Mock data generator for university comparison

export interface AcademicData {
  year: string;
  [key: string]: number | string;
}

export interface ConferenceData {
  conference: string;
  [key: string]: number | string; // Allow dynamic university keys
}

export interface HeatmapData {
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
  [key: string]: number | string; // Allow dynamic university keys
}

const conferences = [
  'ICML', 'NeurIPS', 'ICLR', 'AAAI', 'IJCAI', 'ACL', 'EMNLP', 'CVPR', 
  'ICCV', 'ECCV', 'SIGMOD', 'VLDB', 'KDD', 'WWW', 'CHI', 'UIST'
];

const researchTopics = [
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Reinforcement Learning',
  'Quantum Computing',
  'Blockchain',
  'Cybersecurity',
  'Data Mining',
  'Human-Computer Interaction',
  'Robotics',
  'Artificial Intelligence',
  'Database Systems',
  'Distributed Systems',
  'Bioinformatics'
];

const emergingTopics = [
  'Large Language Models',
  'Generative AI',
  'Federated Learning',
  'Edge Computing',
  'Explainable AI',
  'Neural Architecture Search',
  'Graph Neural Networks',
  'Multimodal Learning',
  'Zero-Shot Learning',
  'Sustainable Computing'
];

export function generateAcademicData(universities: string[], timePeriod: string): AcademicData[] {
  const [startYear, endYear] = timePeriod.split('-').map(Number);
  const years = [];
  
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }

  return years.map(year => {
    const data: AcademicData = { year };
    
    universities.forEach(university => {
      // Generate realistic academic data with some variation
      const baseMultiplier = getUniversityMultiplier(university);
      const yearFactor = (parseInt(year) - startYear + 1) / (endYear - startYear + 1);
      
      // Papers increase slightly over time with some randomness
      const papers = Math.floor((50 + Math.random() * 100) * baseMultiplier * (0.8 + yearFactor * 0.4));
      
      // Citations are typically 10-30x the number of papers
      const citations = Math.floor(papers * (10 + Math.random() * 20) * baseMultiplier);
      
      data[`${university}_papers`] = papers;
      data[`${university}_citations`] = citations;
    });
    
    return data;
  });
}

export function generateConferenceData(universities: string[]): ConferenceData[] {
  const conferenceDataMap = new Map<string, ConferenceData>();
  
  universities.forEach(university => {
    const multiplier = getUniversityMultiplier(university);
    
    conferences.forEach(conference => {
      const papers = Math.floor((5 + Math.random() * 25) * multiplier);
      
      if (!conferenceDataMap.has(conference)) {
        conferenceDataMap.set(conference, { conference });
      }
      
      const conferenceData = conferenceDataMap.get(conference)!;
      conferenceData[university] = papers;
    });
  });
  
  // Convert to array and calculate total papers for sorting
  const data = Array.from(conferenceDataMap.values()).map(item => {
    const totalPapers = universities.reduce((sum, university) => {
      return sum + (item[university] as number || 0);
    }, 0);
    return { ...item, total: totalPapers };
  });
  
  return data
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 12); // Show top 12 conferences
}

function getUniversityMultiplier(university: string): number {
  // Give different universities different research output levels
  const hash = university.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 0.5 + (hash % 100) / 100; // Between 0.5 and 1.5
}

export function generateHeatmapData(universities: string[], timePeriod: string): HeatmapData[] {
  const [startYear, endYear] = timePeriod.split('-').map(Number);
  const years = [];
  
  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }
  
  const data: HeatmapData[] = [];
  
  universities.forEach(university => {
    const multiplier = getUniversityMultiplier(university);
    
    researchTopics.forEach((topic, topicIndex) => {
      years.forEach((year, yearIndex) => {
        const basePapers = Math.floor((3 + Math.random() * 12) * multiplier);
        // Some topics trend up over time
        const trendFactor = topic.includes('Learning') || topic.includes('AI') ? 
          1 + (yearIndex * 0.2) : 1;
        
        data.push({
          year,
          topic,
          papers: Math.floor(basePapers * trendFactor),
          university,
          x: yearIndex,
          y: topicIndex,
          z: Math.floor(basePapers * trendFactor)
        });
      });
    });
  });
  
  return data;
}

export function generateEmergingTopicsData(universities: string[]): EmergingTopicData[] {
  const topicDataMap = new Map<string, EmergingTopicData>();
  
  universities.forEach(university => {
    const multiplier = getUniversityMultiplier(university);
    
    emergingTopics.forEach(topic => {
      const papers = Math.floor((8 + Math.random() * 25) * multiplier);
      
      if (!topicDataMap.has(topic)) {
        topicDataMap.set(topic, { topic });
      }
      
      const topicData = topicDataMap.get(topic)!;
      topicData[university] = papers;
    });
  });
  
  // Convert to array and calculate total papers for sorting
  const data = Array.from(topicDataMap.values()).map(item => {
    const totalPapers = universities.reduce((sum, university) => {
      return sum + (item[university] as number || 0);
    }, 0);
    return { ...item, total: totalPapers };
  });
  
  return data
    .filter(item => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8); // Top 8 emerging topics
}

export const sampleUniversities = [
  'Stanford University',
  'Massachusetts Institute of Technology',
  'University of California, Berkeley',
  'Carnegie Mellon University',
  'University of Washington'
];