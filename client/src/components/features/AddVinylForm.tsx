import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Disc } from 'lucide-react';
import { Artist, Label as LabelType, Album, DiscogsResult } from '@/types';
import { useDiscogs } from '@/hooks/useDiscogs';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AddVinylFormProps {
    artists: Artist[];
    labels: LabelType[];
    albums: Album[];
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: {
        artistName?: string;
        albumTitle?: string;
        format?: string;
    };
}

export function AddVinylForm({ artists, labels, onSuccess, onCancel, initialData }: AddVinylFormProps) {
    const [step, setStep] = useState(1);
    const [activeTab, setActiveTab] = useState<'collection' | 'wishlist'>('collection');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search state
    const { query: searchQuery, setQuery: setSearchQuery, results: searchResults, loading: isSearching, error: searchError } = useDiscogs();

    // Form state
    const [formData, setFormData] = useState({
        artist: initialData?.artistName || '',
        artistId: undefined as number | undefined,
        album: initialData?.albumTitle || '',
        albumId: undefined as number | undefined,
        year: '',
        genre: '',
        label: '',
        labelId: undefined as number | undefined,
        catNo: '',
        format: initialData?.format || 'LP',
        discogsId: undefined as number | undefined,
        thumbUrl: '',
        condition: 'Very Good Plus',
        price: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const { toast } = useToast();

    const handleDiscogsSelect = (result: DiscogsResult) => {
        // Parse artist and album from title "Artist - Album"
        let artistName = result.artist || '';
        let albumTitle = result.title || '';

        if (!artistName && result.title.includes(' - ')) {
            const parts = result.title.split(' - ');
            artistName = parts[0];
            albumTitle = parts.slice(1).join(' - ');
        }

        setFormData({
            ...formData,
            artist: artistName,
            album: albumTitle,
            year: result.year || '',
            genre: result.genre?.[0] || '',
            label: result.label?.[0] || '',
            catNo: result.catno || '',
            format: result.format?.[0] || 'LP',
            discogsId: result.id,
            thumbUrl: result.thumb,
        });
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!formData.artist || !formData.album) {
            toast({
                title: "Validation Error",
                description: "Artist and Album are required.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create/Get Artist
            let artistId = formData.artistId;
            if (!artistId) {
                // Check if artist exists in our list first
                const existingArtist = artists.find(a => a.Name.toLowerCase() === formData.artist.toLowerCase());
                if (existingArtist) {
                    artistId = existingArtist.ArtistID;
                } else {
                    const newArtist = await api.createArtist({ Name: formData.artist });
                    artistId = newArtist.ArtistID;
                }
            }

            // 2. Create/Get Label (Optional)
            let labelId = formData.labelId;
            if (formData.label && !labelId) {
                const existingLabel = labels.find(l => l.Name.toLowerCase() === formData.label.toLowerCase());
                if (existingLabel) {
                    labelId = existingLabel.LabelID;
                } else {
                    const newLabel = await api.createLabel({ Name: formData.label });
                    labelId = newLabel.LabelID;
                }
            }

            // 3. Create Album
            const newAlbum = await api.createAlbum({
                Title: formData.album,
                ArtistID: artistId,
                OriginalReleaseYear: formData.year ? parseInt(formData.year) : undefined,
                Genre: formData.genre,
                Format: formData.format
            });
            const albumId = newAlbum.AlbumID;

            // 4. Create Release
            const newRelease = await api.createRelease({
                AlbumID: albumId,
                FormatVariant: formData.format,
                CatalogNumber: formData.catNo,
                LabelID: labelId,
                DiscogsID: formData.discogsId,
                ThumbURL: formData.thumbUrl
            });
            const releaseId = newRelease.ReleaseID;

            // 5. Add to Collection or Wishlist
            if (activeTab === 'collection') {
                await api.addToCollection({
                    ReleaseID: releaseId,
                    Condition: formData.condition,
                    PurchasePrice: formData.price ? parseFloat(formData.price) : undefined,
                    PurchaseDate: formData.purchaseDate,
                    Notes: formData.notes
                });
                toast({
                    title: "Success",
                    description: "Added to collection successfully!",
                });
            } else {
                await api.addToWishlist({
                    ReleaseID: releaseId,
                    Notes: formData.notes,
                    Priority: 'Medium' // Default priority
                });
                toast({
                    title: "Success",
                    description: "Added to wishlist successfully!",
                });
            }

            onSuccess();
        } catch (error) {
            console.error('Failed to add vinyl:', error);
            toast({
                title: "Error",
                description: "Failed to save. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto p-6 border rounded-lg bg-card shadow-sm">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'collection' | 'wishlist')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="collection">Add to Collection</TabsTrigger>
                    <TabsTrigger value="wishlist">Add to Wishlist</TabsTrigger>
                </TabsList>

                {/* Search Step */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Search Discogs (Optional)</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search for artist or album..."
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                {isSearching && <div className="flex items-center px-2"><LoadingSpinner size={16} /></div>}
                            </div>
                            {searchError && <p className="text-sm text-destructive">{searchError}</p>}
                        </div>

                        {searchResults.length > 0 && (
                            <ScrollArea className="h-[300px] border rounded-md p-4">
                                <div className="space-y-2">
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.id}
                                            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                                            onClick={() => handleDiscogsSelect(result)}
                                        >
                                            {result.thumb ? (
                                                <img src={result.thumb} alt={result.title} className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                                    <Disc className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-medium truncate">{result.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {result.year} • {result.format?.join(', ')}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm">Select</Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setStep(2)}>
                                Skip Search
                            </Button>
                        </div>
                    </div>
                )}

                {/* Details Step */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="artist">Artist *</Label>
                                <Input
                                    id="artist"
                                    value={formData.artist}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, artist: e.target.value })}
                                    placeholder="Artist Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="album">Album Title *</Label>
                                <Input
                                    id="album"
                                    value={formData.album}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, album: e.target.value })}
                                    placeholder="Album Title"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    value={formData.year}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, year: e.target.value })}
                                    placeholder="YYYY"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="genre">Genre</Label>
                                <Input
                                    id="genre"
                                    value={formData.genre}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, genre: e.target.value })}
                                    placeholder="Rock, Jazz, etc."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={formData.label}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="Record Label"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="catNo">Catalog Number</Label>
                                <Input
                                    id="catNo"
                                    value={formData.catNo}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, catNo: e.target.value })}
                                    placeholder="e.g. ABC-123"
                                />
                            </div>
                        </div>

                        {activeTab === 'collection' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="condition">Condition</Label>
                                        <Select
                                            value={formData.condition}
                                            onValueChange={(value) => setFormData({ ...formData, condition: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select condition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Mint">Mint (M)</SelectItem>
                                                <SelectItem value="Near Mint">Near Mint (NM)</SelectItem>
                                                <SelectItem value="Very Good Plus">Very Good Plus (VG+)</SelectItem>
                                                <SelectItem value="Very Good">Very Good (VG)</SelectItem>
                                                <SelectItem value="Good">Good (G)</SelectItem>
                                                <SelectItem value="Fair">Fair (F)</SelectItem>
                                                <SelectItem value="Poor">Poor (P)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Purchase Price</Label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, price: e.target.value })}
                                                className="pl-6"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                                    <Input
                                        id="purchaseDate"
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes..."
                                className="h-20"
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                                Back
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <LoadingSpinner size={16} className="mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Record'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Tabs>
        </div>
    );
}
