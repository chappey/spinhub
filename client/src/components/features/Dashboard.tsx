import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Library, BarChart3, Disc, Heart, Plus, Search } from 'lucide-react';
import { Stats, CollectionItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProps {
    stats: Partial<Stats>;
    recentAdditions: CollectionItem[];
    loading?: boolean;
    onAddClick: () => void;
    onSearchClick: () => void;
    onBrowseClick: () => void;
}

export function Dashboard({ stats, recentAdditions, loading, onAddClick, onSearchClick, onBrowseClick }: DashboardProps) {
    const [showThumbnails, setShowThumbnails] = useState(true);

    useEffect(() => {
        const checkThumbnails = () => {
            const stored = localStorage.getItem('thumbnailsEnabled');
            setShowThumbnails(stored !== 'false');
        };
        checkThumbnails();
        window.addEventListener('storage', checkThumbnails);
        return () => window.removeEventListener('storage', checkThumbnails);
    }, []);
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back! Here's an overview of your vinyl collection.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <Library className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.totalRecords || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            In your collection
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">${stats.totalValue ? stats.totalValue.toFixed(2) : '0.00'}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Collection worth
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Artists</CardTitle>
                        <Disc className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.totalArtists || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Unique artists
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.wishlistItems || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Items to acquire
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Additions</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="space-y-4">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                    </div>
                                ))
                            ) : recentAdditions.length > 0 ? (
                                recentAdditions.slice(0, 5).map((item) => (
                                    <div key={item.CollectionID} className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                            {showThumbnails && item.CacheID ? (
                                                <img
                                                    src={`/api/images/${item.CacheID}`}
                                                    alt={item.AlbumTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Disc className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {item.AlbumTitle}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.ArtistName}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            ${item.PurchasePrice ? Number(item.PurchasePrice).toFixed(2) : '0.00'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground pl-2">No records added yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button
                            className="w-full justify-start"
                            onClick={onAddClick}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Record
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onSearchClick}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Search Collection
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={onBrowseClick}
                        >
                            <Library className="mr-2 h-4 w-4" />
                            Browse Collection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
