import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface HeatmapData {
  year: string;
  topic: string;
  papers: number;
  university: string;
  x: number;
  y: number;
  z: number;
}

interface KeywordHeatmapProps {
  data: HeatmapData[];
  universities: string[];
  timePeriod: string;
}

export function KeywordHeatmap({ data, universities, timePeriod }: KeywordHeatmapProps) {
  const [universityA, setUniversityA] = useState<string>(universities[0] || '');
  const [universityB, setUniversityB] = useState<string>(universities[1] || universities[0] || '');
  
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  const topics = Array.from(new Set(data.map(d => d.topic)));
  
  // Create a map for quick lookups
  const dataMap = new Map<string, number>();
  data.forEach(item => {
    const key = `${item.university}-${item.year}-${item.topic}`;
    dataMap.set(key, item.papers);
  });
  
  const getDataPoint = (university: string, year: string, topic: string) => {
    const key = `${university}-${year}-${topic}`;
    return dataMap.get(key) || 0;
  };

  // Calculate all differences to determine min/max range
  const allDifferences: number[] = [];
  years.forEach(year => {
    topics.forEach(topic => {
      const papersA = getDataPoint(universityA, year, topic);
      const papersB = getDataPoint(universityB, year, topic);
      const diff = papersA - papersB;
      allDifferences.push(diff);
    });
  });

  const maxDiff = Math.max(...allDifferences, 0);
  const minDiff = Math.min(...allDifferences, 0);
  
  // Range slider state
  const [differenceRange, setDifferenceRange] = useState<[number, number]>([minDiff, maxDiff]);

  // Check if a data point is within the selected range
  const isInRange = (diff: number) => {
    return diff >= differenceRange[0] && diff <= differenceRange[1];
  };

  const getIntensityColor = (diff: number) => {
    if (!isInRange(diff)) {
      return { backgroundColor: '#f8f9fa', opacity: 0.3 }; // Very light and transparent for out-of-range
    }
    
    if (diff === 0) {
      return { backgroundColor: '#f1f5f9' }; // Neutral light gray
    }

    if (diff > 0) {
      // Positive difference - Green shades (University A has more)
      const maxPositive = Math.max(...allDifferences.filter(d => d > 0), 1);
      const intensity = Math.min(diff / maxPositive, 1);
      
      if (intensity < 0.2) return { backgroundColor: '#d1fae5' }; // Very light green
      if (intensity < 0.4) return { backgroundColor: '#6ee7b7' }; // Light green
      if (intensity < 0.6) return { backgroundColor: '#10b981' }; // Medium green
      if (intensity < 0.8) return { backgroundColor: '#059669' }; // Dark green
      return { backgroundColor: '#047857' }; // Very dark green
    } else {
      // Negative difference - Red shades (University B has more)
      const minNegative = Math.min(...allDifferences.filter(d => d < 0), -1);
      const intensity = Math.min(Math.abs(diff) / Math.abs(minNegative), 1);
      
      if (intensity < 0.2) return { backgroundColor: '#fee2e2' }; // Very light red
      if (intensity < 0.4) return { backgroundColor: '#fca5a5' }; // Light red
      if (intensity < 0.6) return { backgroundColor: '#ef4444' }; // Medium red
      if (intensity < 0.8) return { backgroundColor: '#dc2626' }; // Dark red
      return { backgroundColor: '#b91c1c' }; // Very dark red
    }
  };

  const getColorLegend = () => {
    const maxPositive = Math.max(...allDifferences.filter(d => d > 0), 1);
    const minNegative = Math.min(...allDifferences.filter(d => d < 0), -1);

    return [
      { range: `${Math.floor(minNegative)}`, color: '#b91c1c', label: `Very high (${universityB} leads by ${Math.abs(Math.floor(minNegative))}+)`, type: 'negative' },
      { range: `${Math.floor(minNegative * 0.6)}`, color: '#dc2626', label: `High (${universityB} leads)`, type: 'negative' },
      { range: `${Math.floor(minNegative * 0.4)}`, color: '#ef4444', label: `Medium (${universityB} leads)`, type: 'negative' },
      { range: `${Math.floor(minNegative * 0.2)}`, color: '#fca5a5', label: `Low (${universityB} leads)`, type: 'negative' },
      { range: '0', color: '#f1f5f9', label: 'Equal', type: 'neutral' },
      { range: `${Math.ceil(maxPositive * 0.2)}`, color: '#d1fae5', label: `Low (${universityA} leads)`, type: 'positive' },
      { range: `${Math.ceil(maxPositive * 0.4)}`, color: '#6ee7b7', label: `Medium (${universityA} leads)`, type: 'positive' },
      { range: `${Math.ceil(maxPositive * 0.6)}`, color: '#10b981', label: `High (${universityA} leads)`, type: 'positive' },
      { range: `${Math.ceil(maxPositive)}`, color: '#047857', label: `Very high (${universityA} leads by ${Math.ceil(maxPositive)}+)`, type: 'positive' },
    ];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Topics Heatmap - Comparative Analysis</CardTitle>
        <CardDescription>
          Compare publication frequency across research areas between two universities ({timePeriod})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* University Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm">University A (Base)</label>
              <Select value={universityA} onValueChange={setUniversityA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(university => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm">University B (Compare)</label>
              <Select value={universityB} onValueChange={setUniversityB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(university => (
                    <SelectItem key={university} value={university}>
                      {university}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Difference Range Filter:</span>
              <span className="text-sm text-muted-foreground">
                Showing: {differenceRange[0]} to {differenceRange[1]} papers
              </span>
            </div>
            <div className="px-3">
              <Slider
                value={differenceRange}
                onValueChange={(value) => setDifferenceRange(value as [number, number])}
                max={maxDiff}
                min={minDiff}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{minDiff} ({universityB} leads)</span>
                <span>0 (equal)</span>
                <span>{maxDiff} ({universityA} leads)</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Color Legend (Difference: {universityA} - {universityB}):
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Negative (Red - University B leads) */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{universityB} leads (Red)</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {getColorLegend().filter(s => s.type === 'negative').map((segment, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded border border-border/30" 
                        style={{ backgroundColor: segment.color }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Neutral */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Equal</p>
                <div className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-4 h-4 rounded border border-border/30" 
                    style={{ backgroundColor: '#f1f5f9' }}
                  ></div>
                </div>
              </div>

              {/* Positive (Green - University A leads) */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{universityA} leads (Green)</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {getColorLegend().filter(s => s.type === 'positive').map((segment, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded border border-border/30" 
                        style={{ backgroundColor: segment.color }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * Green indicates {universityA} has more papers, Red indicates {universityB} has more papers
            </p>
            <p className="text-xs text-muted-foreground">
              * Values outside the selected range are shown in light gray with reduced opacity
            </p>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header with years */}
              <div className="grid grid-cols-[200px_repeat(var(--years),1fr)] gap-1 mb-2" style={{'--years': years.length} as any}>
                <div className="text-sm font-medium">Research Area</div>
                {years.map(year => (
                  <div key={year} className="text-sm font-medium text-center px-2">
                    {year}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              <TooltipProvider>
                <div className="space-y-1">
                  {topics.map(topic => (
                    <div key={topic} className="grid grid-cols-[200px_repeat(var(--years),1fr)] gap-1" style={{'--years': years.length} as any}>
                      <div className="text-sm truncate pr-2" title={topic}>
                        {topic}
                      </div>
                      {years.map(year => {
                        const papersA = getDataPoint(universityA, year, topic);
                        const papersB = getDataPoint(universityB, year, topic);
                        const difference = papersA - papersB;
                        
                        return (
                          <Tooltip key={`${topic}-${year}`}>
                            <TooltipTrigger asChild>
                              <div 
                                className="h-8 rounded cursor-pointer transition-all hover:scale-110 hover:shadow-lg border border-border/20"
                                style={getIntensityColor(difference)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center space-y-1">
                                <p className="font-medium">{topic}</p>
                                <p className="text-sm text-muted-foreground">{year}</p>
                                <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
                                  <p className="text-sm">{universityA}: <span className="font-medium">{papersA} papers</span></p>
                                  <p className="text-sm">{universityB}: <span className="font-medium">{papersB} papers</span></p>
                                  <p className="text-sm font-medium" style={{ 
                                    color: difference > 0 ? '#10b981' : difference < 0 ? '#ef4444' : '#6b7280' 
                                  }}>
                                    Difference: {difference > 0 ? '+' : ''}{difference}
                                  </p>
                                </div>
                                {!isInRange(difference) && (
                                  <p className="text-xs text-yellow-600 font-medium mt-1">
                                    Outside selected range ({differenceRange[0]} to {differenceRange[1]})
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
