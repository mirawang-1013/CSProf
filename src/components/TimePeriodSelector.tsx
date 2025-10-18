import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const timePeriods = [
  { value: '2020-2024', label: '2020-2024' },
  { value: '2019-2023', label: '2019-2023' },
  { value: '2018-2022', label: '2018-2022' },
  { value: '2017-2021', label: '2017-2021' },
  { value: '2016-2020', label: '2016-2020' },
];

export function TimePeriodSelector({ selectedPeriod, onPeriodChange }: TimePeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="whitespace-nowrap">Time Period:</label>
      <Select value={selectedPeriod} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {timePeriods.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}