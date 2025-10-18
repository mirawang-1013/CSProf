import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface UniversityCardProps {
  university: string;
  isSelected: boolean;
  onSelect: (university: string) => void;
  onRemove: (university: string) => void;
}

export function UniversityCard({ university, isSelected, onSelect, onRemove }: UniversityCardProps) {
  return (
    <div className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
      isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-accent'
    }`}>
      <Badge 
        variant={isSelected ? "default" : "secondary"}
        className="cursor-pointer"
        onClick={() => onSelect(university)}
      >
        {university}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(university)}
        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}