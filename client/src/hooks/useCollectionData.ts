import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { CollectionItem, WishlistItem, Stats, Artist, Label, Album } from '../types';
import { useToast } from './use-toast';

export function useCollectionData() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [artists, setArtists] = useState<Artist[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        collectionData,
        wishlistData,
        statsData,
        artistsData,
        labelsData,
        albumsData
      ] = await Promise.all([
        api.getCollection(),
        api.getWishlist(),
        api.getStats(),
        api.getArtists(),
        api.getLabels(),
        api.getAlbums()
      ]);

      setCollection(collectionData);
      setWishlist(wishlistData);
      setStats(statsData);
      setArtists(artistsData);
      setLabels(labelsData);
      setAlbums(albumsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = loadData;

  return {
    collection,
    wishlist,
    stats,
    artists,
    labels,
    albums,
    loading,
    error,
    refreshData,
    setArtists,
    setAlbums
  };
}
