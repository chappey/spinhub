import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CollectionItem } from '../types';
import { useToast } from './use-toast';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CollectionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const data = await api.search(query);
        setResults(data);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
        toast({
          title: 'Error',
          description: 'Search failed. Please try again.',
          variant: 'destructive',
        });
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, toast]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasSearched
  };
}
