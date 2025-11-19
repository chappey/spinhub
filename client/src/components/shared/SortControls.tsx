import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';

interface SortControlsProps {
    sortBy: string;
    onSortChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    sortOptions?: { value: string; label: string }[];
}

export function SortControls({
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
    sortOptions = [
        { value: 'artist', label: 'Sort by Artist' },
        { value: 'album', label: 'Sort by Album' },
        { value: 'year', label: 'Sort by Year' },
        { value: 'condition', label: 'Sort by Condition' },
        { value: 'price', label: 'Sort by Price' },
    ]
}: SortControlsProps) {
    return (
        <div className="flex gap-3 mb-6">
            <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                    {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex border rounded-md">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="rounded-r-none"
                >
                    <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="rounded-l-none"
                >
                    <List className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
