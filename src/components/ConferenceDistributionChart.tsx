import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ConferenceData {
  conference: string;
  [key: string]: number | string; // Allow dynamic university keys
}

interface ConferenceDistributionChartProps {
  data: ConferenceData[];
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

export function ConferenceDistributionChart({ data, universities, timePeriod }: ConferenceDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conference Distribution</CardTitle>
        <CardDescription>
          Papers published across various conferences by all universities in comparison ({timePeriod})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="conference" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {universities.map((university, index) => (
              <Bar 
                key={university}
                dataKey={university} 
                fill={universityColors[index % universityColors.length]} 
                name={university}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}