import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

// Generate 2-year periods from 2024-2025 backwards
const generateTimePeriods = (): Array<{ value: string; label: string }> => {
  const periods: Array<{ value: string; label: string }> = [];
  
  // Start from 2024-2025, go backwards in 2-year increments
  for (let i = 0; i < 8; i++) {
    const endYear = 2025 - (i * 2);
    const beginYear = endYear - 1;
    if (beginYear >= 2018) { // Stop at 2018-2019
      periods.push({
        value: `${beginYear}-${endYear}`,
        label: `${beginYear}-${endYear}`
      });
    }
  }
  
  return periods;
};

const timePeriods = generateTimePeriods();

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