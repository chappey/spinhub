import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Disc, Eye, Edit, Trash2 } from 'lucide-react';
import { CollectionItem } from '@/types';
import { SortControls } from '../shared/SortControls';
import { VinylModal } from '../shared/VinylModal';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface CollectionListProps {
    collection: CollectionItem[];
    onRefresh: () => void;
}

export function CollectionList({ collection, onRefresh }: CollectionListProps) {
    const [sortBy, setSortBy] = useState('artist');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const checkThumbnails = () => {
            const stored = localStorage.getItem('thumbnailsEnabled');
            setShowThumbnails(stored !== 'false');
        };
        checkThumbnails();
        window.addEventListener('storage', checkThumbnails);
        return () => window.removeEventListener('storage', checkThumbnails);
    }, []);

    const sortedCollection = useMemo(() => {
        return [...collection].sort((a, b) => {
            switch (sortBy) {
                case 'artist':
                    return (a.ArtistName || '').localeCompare(b.ArtistName || '');
                case 'album':
                    return (a.AlbumTitle || '').localeCompare(b.AlbumTitle || '');
                case 'year':
                    return (a.ReleaseYear || 0) - (b.ReleaseYear || 0);
                case 'condition':
                    const conditions = ['Poor', 'Fair', 'Good', 'Good Plus', 'Very Good', 'Very Good Plus', 'Near Mint', 'Mint'];
                    return conditions.indexOf(a.Condition || '') - conditions.indexOf(b.Condition || '');
                case 'price':
                    return (a.PurchasePrice || 0) - (b.PurchasePrice || 0);
                default:
                    return 0;
            }
        });
    }, [collection, sortBy]);

    const handleViewDetails = (item: CollectionItem) => {
        setSelectedItem(item);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleEditItem = (item: CollectionItem) => {
        setSelectedItem(item);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleDeleteItem = (item: CollectionItem) => {
        setItemToDelete(item);
        setConfirmDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.deleteCollectionItem(itemToDelete.CollectionID);
            toast({ title: 'Item deleted successfully' });
            onRefresh();
        } catch (error) {
            toast({ title: 'Failed to delete item', variant: 'destructive' });
        }
        setConfirmDialogOpen(false);
        setItemToDelete(null);
    };

    return (
        <div>
            <SortControls
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {sortedCollection.map(item => (
                        <ContextMenu key={item.CollectionID}>
                            <ContextMenuTrigger>
                                <Card className="grok-card hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => handleViewDetails(item)}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                                {showThumbnails && item.CacheID ? (
                                                    <img
                                                        src={`/api/images/${item.CacheID}`}
                                                        alt={item.AlbumTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Disc className="w-8 h-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-semibold text-primary">{item.AlbumTitle}</CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Artist:</span>
                                            <span className="font-medium">{item.ArtistName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Catalog:</span>
                                            <span className="font-medium">{item.CatalogNumber || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Condition:</span>
                                            <span className="font-medium">{item.Condition}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Label:</span>
                                            <span className="font-medium">{item.LabelName || 'Unknown'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => handleViewDetails(item)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleEditItem(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
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
                    {sortedCollection.map(item => (
                        <ContextMenu key={item.CollectionID}>
                            <ContextMenuTrigger>
                                <div
                                    className="grok-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => handleViewDetails(item)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                                                {showThumbnails && item.CacheID ? (
                                                    <img
                                                        src={`/api/images/${item.CacheID}`}
                                                        alt={item.AlbumTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Disc className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-primary truncate">{item.AlbumTitle}</h3>
                                                    <span className="text-sm text-muted-foreground">by</span>
                                                    <span className="text-sm font-medium truncate">{item.ArtistName}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span>Catalog: {item.CatalogNumber || 'N/A'}</span>
                                                    <span>Condition: {item.Condition}</span>
                                                    <span>Label: {item.LabelName || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => handleViewDetails(item)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleEditItem(item)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
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

            <VinylModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                type="collection"
                mode={modalMode}
                data={selectedItem}
                onSave={onRefresh}
            />

            <ConfirmDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                onConfirm={confirmDelete}
                title="Delete from Collection"
                description={`Are you sure you want to delete "${itemToDelete?.AlbumTitle}" from your collection?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}
