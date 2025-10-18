import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface AcademicData {
  year: string;
  [key: string]: number | string;
}

interface AcademicOutputChartProps {
  data: AcademicData[];
  universities: string[];
  timePeriod: string;
}

const techColors = ['#00D4FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

export function AcademicOutputChart({ data, universities, timePeriod }: AcademicOutputChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Output and Citation Performance</CardTitle>
        <CardDescription>
          Papers published (lines) and citations received (bars) for {timePeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                value,
                name.includes('Papers') ? 'Papers' : 'Citations'
              ]}
            />
            <Legend />
            
            {universities.map((university, index) => (
              <Bar
                key={`${university}-citations`}
                yAxisId="right"
                dataKey={`${university}_citations`}
                name={`${university} Citations`}
                fill={techColors[index % techColors.length]}
                opacity={0.6}
              />
            ))}
            
            {universities.map((university, index) => (
              <Line
                key={`${university}-papers`}
                yAxisId="left"
                type="monotone"
                dataKey={`${university}_papers`}
                name={`${university} Papers`}
                stroke={techColors[index % techColors.length]}
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}