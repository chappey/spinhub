import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Disc, Eye, Edit, Trash2, Move } from 'lucide-react';
import { WishlistItem } from '@/types';
import { SortControls } from '../shared/SortControls';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface WishlistProps {
    wishlist: WishlistItem[];
    onRefresh: () => void;
    onMoveToCollection: (item: WishlistItem) => void;
}

export function Wishlist({ wishlist, onRefresh, onMoveToCollection }: WishlistProps) {
    const [sortBy, setSortBy] = useState('artist');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { toast } = useToast();

    const sortedWishlist = useMemo(() => {
        return [...wishlist].sort((a, b) => {
            switch (sortBy) {
                case 'artist':
                    return (a.ArtistName || '').localeCompare(b.ArtistName || '');
                case 'album':
                    return (a.AlbumTitle || '').localeCompare(b.AlbumTitle || '');
                case 'year':
                    return (a.ReleaseYear || 0) - (b.ReleaseYear || 0);
                case 'priority':
                    const priorities = ['Low', 'Medium', 'High'];
                    return priorities.indexOf(a.Priority) - priorities.indexOf(b.Priority);
                case 'price':
                    return (a.MaxPrice || 0) - (b.MaxPrice || 0);
                default:
                    return 0;
            }
        });
    }, [wishlist, sortBy]);

    const handleDeleteItem = async (item: WishlistItem) => {
        if (confirm(`Are you sure you want to remove "${item.AlbumTitle}" from wishlist?`)) {
            try {
                await api.deleteWishlistItem(item.WishlistID);
                toast({ title: 'Item removed from wishlist' });
                onRefresh();
            } catch (error) {
                toast({ title: 'Failed to remove item', variant: 'destructive' });
            }
        }
    };

    return (
        <div>
            <SortControls
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortOptions={[
                    { value: 'artist', label: 'Sort by Artist' },
                    { value: 'album', label: 'Sort by Album' },
                    { value: 'year', label: 'Sort by Year' },
                    { value: 'priority', label: 'Sort by Priority' },
                    { value: 'price', label: 'Sort by Price' },
                ]}
            />

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedWishlist.map(item => (
                        <ContextMenu key={item.WishlistID}>
                            <ContextMenuTrigger>
                                <Card className="grok-card hover:scale-105 transition-transform duration-200 cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                                                <Disc className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-semibold text-primary">{item.AlbumTitle || 'N/A'}</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Artist:</span>
                                            <span className="font-medium">{item.ArtistName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Priority:</span>
                                            <span className="font-medium">{item.Priority}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Max Price:</span>
                                            <span className="font-medium">${item.MaxPrice || 'N/A'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => onMoveToCollection(item)}>
                                    <Move className="mr-2 h-4 w-4" />
                                    Move to Collection
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleDeleteItem(item)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {sortedWishlist.map(item => (
                        <ContextMenu key={item.WishlistID}>
                            <ContextMenuTrigger>
                                <div className="grok-card p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                                <Disc className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-primary truncate">{item.AlbumTitle || 'Unknown Album'}</h3>
                                                    <span className="text-sm text-muted-foreground">by</span>
                                                    <span className="text-sm font-medium truncate">{item.ArtistName || 'Unknown Artist'}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span>Priority: {item.Priority}</span>
                                                    <span>Max Price: ${item.MaxPrice || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => onMoveToCollection(item)}>
                                    <Move className="mr-2 h-4 w-4" />
                                    Move to Collection
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleDeleteItem(item)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    ))}
                </div>
            )}
        </div>
    );
}
