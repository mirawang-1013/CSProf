import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';

interface EmergingTopicData {
  topic: string;
  [key: string]: number | string; // Allow dynamic university keys
}

interface EmergingTopicsChartProps {
  data: EmergingTopicData[];
  universities: string[];
  timePeriod: string;
}

const universityColors = [
  '#00D4FF', // Electric cyan
  '#8B5CF6', // Sharp purple
  '#10B981', // Bright emerald
  '#F59E0B', // Amber
  '#EF4444', // Sharp red
];

export function EmergingTopicsChart({ data, universities, timePeriod }: EmergingTopicsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span style={{ color: entry.color }}>{entry.dataKey}:</span>{' '}
              <span className="text-foreground">{entry.value}</span> papers
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Emerging Topics
        </CardTitle>
        <CardDescription>
          Rapidly growing research areas across all universities in comparison ({timePeriod})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="topic" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              fontSize={12}
            />
            <YAxis 
              label={{ value: 'Number of Papers', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {universities.map((university, index) => (
              <Bar 
                key={university}
                dataKey={university} 
                fill={universityColors[index % universityColors.length]} 
                name={university}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        
        {/* University indicators */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {universities.map((university, index) => (
            <div 
              key={university}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
            >
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: universityColors[index % universityColors.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{university}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}