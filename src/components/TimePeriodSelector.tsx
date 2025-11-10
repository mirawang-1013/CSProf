import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export function TimePeriodSelector({ selectedPeriod, onPeriodChange }: TimePeriodSelectorProps) {
  // Parse the current period string (format: "start-end")
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');

  // Initialize from selectedPeriod prop
  useEffect(() => {
    if (selectedPeriod) {
      const [start, end] = selectedPeriod.split('-');
      setStartYear(start || '');
      setEndYear(end || '');
    }
  }, [selectedPeriod]);

  // Update parent when years change
  const handleYearChange = (type: 'start' | 'end', value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    if (type === 'start') {
      setStartYear(value);
      if (value && endYear) {
        onPeriodChange(`${value}-${endYear}`);
      }
    } else {
      setEndYear(value);
      if (startYear && value) {
        onPeriodChange(`${startYear}-${value}`);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Label className="whitespace-nowrap">Time Period:</Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="start-year" className="text-sm text-muted-foreground whitespace-nowrap">
            Start:
          </Label>
          <Input
            id="start-year"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={startYear}
            onChange={(e) => handleYearChange('start', e.target.value)}
            placeholder="2020"
            className="w-20"
            maxLength={4}
          />
        </div>
        <span className="text-muted-foreground">-</span>
        <div className="flex items-center gap-2">
          <Label htmlFor="end-year" className="text-sm text-muted-foreground whitespace-nowrap">
            End:
          </Label>
          <Input
            id="end-year"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={endYear}
            onChange={(e) => handleYearChange('end', e.target.value)}
            placeholder="2024"
            className="w-20"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  );
}