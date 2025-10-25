import { useState, useEffect } from 'react';
import { UniversityInput } from '../components/UniversityInput';
import { TimePeriodSelector } from '../components/TimePeriodSelector';
import { UniversityCard } from '../components/UniversityCard';
import { AcademicOutputChart } from '../components/AcademicOutputChart';
import { ConferenceDistributionChart } from '../components/ConferenceDistributionChart';
import { KeywordHeatmap } from '../components/KeywordHeatmap';
import { EmergingTopicsChart } from '../components/EmergingTopicsChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { sampleUniversities } from '../utils/mockData';
import { 
  fetchAcademicMetrics, 
  fetchConferenceDistribution, 
  fetchTopicHeatmap, 
  fetchEmergingTopics 
} from '../api/universityComparison';
import type { AcademicData, ConferenceData, HeatmapData, EmergingTopicData } from '../utils/mockData';

export default function UniversityComparison() {
  const [universities, setUniversities] = useState<string[]>(sampleUniversities.slice(0, 3));
  const [selectedUniversity, setSelectedUniversity] = useState<string>(sampleUniversities[0]);
  const [timePeriod, setTimePeriod] = useState<string>('2020-2024');
  
  // Data state
  const [academicData, setAcademicData] = useState<AcademicData[]>([]);
  const [conferenceData, setConferenceData] = useState<ConferenceData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [emergingTopicsData, setEmergingTopicsData] = useState<EmergingTopicData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parse time period
  const parseTimePeriod = (period: string): [number, number] => {
    return period.split('-').map(Number) as [number, number];
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (universities.length === 0) {
        setAcademicData([]);
        setConferenceData([]);
        setHeatmapData([]);
        setEmergingTopicsData([]);
        return;
      }

      setIsLoading(true);
      const [startYear, endYear] = parseTimePeriod(timePeriod);

      try {
        // Fetch academic metrics
        const metrics = await fetchAcademicMetrics(universities, startYear, endYear);
        
        // Transform academic metrics to chart format
        const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => 
          (startYear + i).toString()
        );
        
        const transformedAcademicData: AcademicData[] = years.map(year => {
          const data: AcademicData = { year };
          for (const university of universities) {
            const universityMetrics = metrics.filter(m => m.university_name === university && m.year.toString() === year);
            const metric = universityMetrics[0];
            data[`${university}_papers`] = metric?.publications_count || 0;
            data[`${university}_citations`] = metric?.total_citations || 0;
          }
          return data;
        });
        setAcademicData(transformedAcademicData);

        // Fetch conference distribution
        const conferences = await fetchConferenceDistribution(universities, startYear, endYear);
        setConferenceData(conferences);

        // Fetch topic heatmap
        const heatmap = await fetchTopicHeatmap(universities, startYear, endYear);
        setHeatmapData(heatmap);

        // Fetch emerging topics
        const emerging = await fetchEmergingTopics(universities, startYear, endYear);
        setEmergingTopicsData(emerging);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [universities, timePeriod]);

  const handleAddUniversity = (university: string) => {
    if (!universities.includes(university)) {
      setUniversities([...universities, university]);
      if (!selectedUniversity) {
        setSelectedUniversity(university);
      }
    }
  };

  const handleRemoveUniversity = (university: string) => {
    const newUniversities = universities.filter(u => u !== university);
    setUniversities(newUniversities);
    
    if (selectedUniversity === university) {
      setSelectedUniversity(newUniversities[0] || '');
    }
  };

  const handleSelectUniversity = (university: string) => {
    setSelectedUniversity(university);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Comparison</CardTitle>
          <CardDescription>
            Add universities to compare and select a time period for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UniversityInput onAddUniversity={handleAddUniversity} />
          
          <div className="flex items-center justify-between">
            <TimePeriodSelector
              selectedPeriod={timePeriod}
              onPeriodChange={setTimePeriod}
            />
            <div className="text-sm text-muted-foreground">
              {universities.length} {universities.length === 1 ? 'university' : 'universities'} selected
            </div>
          </div>

          {universities.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <label>Universities in Comparison:</label>
                <div className="flex flex-wrap gap-2">
                  {universities.map((university) => (
                    <UniversityCard
                      key={university}
                      university={university}
                      isSelected={selectedUniversity === university}
                      onSelect={handleSelectUniversity}
                      onRemove={handleRemoveUniversity}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  All charts below show data for all universities in comparison
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      {universities.length > 0 && (
        <div className="grid gap-6">
          {isLoading ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Loading comparison data...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <AcademicOutputChart
                data={academicData}
                universities={universities}
                timePeriod={timePeriod}
              />
              
              {universities.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <ConferenceDistributionChart
                    data={conferenceData}
                    universities={universities}
                    timePeriod={timePeriod}
                  />
                  <EmergingTopicsChart
                    data={emergingTopicsData}
                    universities={universities}
                    timePeriod={timePeriod}
                  />
                </div>
              )}
              
              {universities.length > 0 && (
                <KeywordHeatmap
                  data={heatmapData}
                  universities={universities}
                  timePeriod={timePeriod}
                />
              )}
            </>
          )}
        </div>
      )}

      {universities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Add a university above to start comparing academic performance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
