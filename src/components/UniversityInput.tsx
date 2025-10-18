import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus } from 'lucide-react';

interface UniversityInputProps {
  onAddUniversity: (university: string) => void;
}

export function UniversityInput({ onAddUniversity }: UniversityInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddUniversity(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter university name..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={!inputValue.trim()}>
        <Plus className="w-4 h-4 mr-2" />
        Add
      </Button>
    </form>
  );
}