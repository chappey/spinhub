import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stats, CollectionItem } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Disc, DollarSign, Layers } from 'lucide-react';

interface StatisticsProps {
    stats: Partial<Stats>;
    collection: CollectionItem[];
    loading?: boolean;
}

export function Statistics({ stats, collection, loading }: StatisticsProps) {
    // Calculate derived stats
    const insights = useMemo(() => {
        if (!collection.length) return null;

        // Top Artists
        const artistCounts: Record<string, number> = {};
        collection.forEach(item => {
            if (item.ArtistName) {
                artistCounts[item.ArtistName] = (artistCounts[item.ArtistName] || 0) + 1;
            }
        });
        const topArtists = Object.entries(artistCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        // Top Genres (assuming Album has Genre, but CollectionItem doesn't explicitly have it in the interface I saw earlier? 
        // Let's check CollectionItem interface again. It has AlbumTitle, ArtistName, but maybe not Genre directly joined?
        // The schema has Genre on Albums. The CollectionItem interface in types/index.ts didn't show Genre.
        // I'll skip Genre for now if it's not available, or check if I can infer it.)

        // Decades
        const decadeCounts: Record<string, number> = {};
        collection.forEach(item => {
            if (item.ReleaseYear) {
                const decade = Math.floor(item.ReleaseYear / 10) * 10;
                decadeCounts[`${decade}s`] = (decadeCounts[`${decade}s`] || 0) + 1;
            }
        });
        const decades = Object.entries(decadeCounts)
            .sort(([a], [b]) => a.localeCompare(b));

        return { topArtists, decades };
    }, [collection]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
                <p className="text-muted-foreground">
                    Deep dive into your collection data.
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalValue?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground">
                            Estimated market value
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${(stats.totalRecords && stats.totalValue) ? (stats.totalValue / stats.totalRecords).toFixed(2) : '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per record
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
                        <Disc className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalArtists}</div>
                        <p className="text-xs text-muted-foreground">
                            Unique artists
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRecords}</div>
                        <p className="text-xs text-muted-foreground">
                            In collection
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Condition Breakdown */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Condition Breakdown</CardTitle>
                        <CardDescription>Distribution of record conditions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.conditionBreakdown?.map((item) => (
                                <div key={item.Condition} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{item.Condition}</span>
                                        <span className="text-muted-foreground">
                                            {item.count} ({stats.totalRecords ? Math.round((item.count / stats.totalRecords) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${stats.totalRecords ? (item.count / stats.totalRecords) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!stats.conditionBreakdown || stats.conditionBreakdown.length === 0) && (
                                <p className="text-sm text-muted-foreground">No condition data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Artists */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Top Artists</CardTitle>
                        <CardDescription>Most collected artists</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {insights?.topArtists.map(([artist, count], index) => (
                                <div key={artist} className="flex items-center">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">{artist}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-muted-foreground">
                                        {count} records
                                    </div>
                                </div>
                            ))}
                            {(!insights?.topArtists.length) && (
                                <p className="text-sm text-muted-foreground">No artist data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Decades */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Eras</CardTitle>
                        <CardDescription>Collection by decade</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {insights?.decades.map(([decade, count]) => (
                                <div key={decade} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{decade}</span>
                                        <span className="text-muted-foreground">{count}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${stats.totalRecords ? (count / stats.totalRecords) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!insights?.decades.length) && (
                                <p className="text-sm text-muted-foreground">No release year data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
