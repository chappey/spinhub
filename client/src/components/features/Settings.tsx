import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function Settings() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ totalReleases: number; cachedReleases: number; uncachedReleases: number; queueLength: number; isProcessing: boolean } | null>(null);
    const [thumbnailsEnabled, setThumbnailsEnabled] = useState(true);

    useEffect(() => {
        fetchStats();
        const stored = localStorage.getItem('thumbnailsEnabled');
        if (stored !== null) {
            setThumbnailsEnabled(stored === 'true');
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/cache/status');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch cache stats:', error);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Are you sure you want to clear the Discogs cache? Images will need to be re-fetched.')) return;

        setLoading(true);
        try {
            await fetch('/api/cache/clear', { method: 'DELETE' });
            toast({
                title: "Cache Cleared",
                description: "All cached data and images have been removed.",
            });
            fetchStats();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to clear cache.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePopulateCache = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cache/populate', { method: 'POST' });
            const data = await res.json();
            toast({
                title: "Population Started",
                description: data.message,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to start cache population.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleThumbnails = (checked: boolean) => {
        setThumbnailsEnabled(checked);
        localStorage.setItem('thumbnailsEnabled', String(checked));
        // Dispatch a custom event so other components can react if needed
        window.dispatchEvent(new Event('storage'));
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Discogs Cache</CardTitle>
                    <CardDescription>Manage local storage of Discogs data and images.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="text-sm font-medium text-muted-foreground">Cached Releases</div>
                            <div className="text-2xl font-bold">{stats ? stats.cachedReleases : '-'}</div>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="text-sm font-medium text-muted-foreground">Total Releases</div>
                            <div className="text-2xl font-bold">{stats ? stats.totalReleases : '-'}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={handlePopulateCache}
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                            Populate Cache
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearCache}
                            disabled={loading}
                        >
                            {loading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
                            Clear Cache
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance & Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="thumbnails-mode" className="flex flex-col space-y-1">
                            <span>Show Thumbnails</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                Display album artwork in lists and tables.
                            </span>
                        </Label>
                        <Switch
                            id="thumbnails-mode"
                            checked={thumbnailsEnabled}
                            onCheckedChange={toggleThumbnails}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
