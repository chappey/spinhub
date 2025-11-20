import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Disc, Search } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { CollectionItem } from '@/types';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectResult: (item: CollectionItem) => void;
}

export function SearchDialog({ open, onOpenChange, onSelectResult }: SearchDialogProps) {
    const { query, setQuery, results, isSearching, hasSearched } = useSearch();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-4 py-3 border-b">
                    <DialogTitle className="sr-only">Search Collection</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search albums, artists, or catalog numbers..."
                            className="border-0 focus-visible:ring-0 px-0 h-auto text-base"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto p-2">
                    {isSearching && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            Searching...
                        </div>
                    )}

                    {!isSearching && hasSearched && results.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    )}

                    {!isSearching && results.length > 0 && (
                        <div className="space-y-1">
                            {results.map((item) => (
                                <Button
                                    key={item.CollectionID}
                                    variant="ghost"
                                    className="w-full justify-start h-auto py-3 px-3"
                                    onClick={() => {
                                        onSelectResult(item);
                                        onOpenChange(false);
                                    }}
                                >
                                    <div className="flex items-center gap-3 w-full text-left">
                                        <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                            {item.CacheID ? (
                                                <img
                                                    src={`/api/images/${item.CacheID}`}
                                                    alt={item.AlbumTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Disc className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{item.AlbumTitle}</div>
                                            <div className="text-sm text-muted-foreground truncate">{item.ArtistName}</div>
                                        </div>
                                        {item.CatalogNumber && (
                                            <div className="text-xs text-muted-foreground hidden sm:block">
                                                {item.CatalogNumber}
                                            </div>
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    )}

                    {!hasSearched && !query && (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            Type to search your collection...
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
