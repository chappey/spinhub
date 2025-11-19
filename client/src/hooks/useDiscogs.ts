import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DiscogsResult } from '../types';

export function useDiscogs() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DiscogsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError('');
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.searchDiscogs(query);
        setResults(data.results || []);
      } catch (err: any) {
        setError(err.message || 'Failed to search Discogs');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    setResults
  };
}
