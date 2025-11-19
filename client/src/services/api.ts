import { 
  Artist, Label, Album, Release, CollectionItem, WishlistItem, Stats, DiscogsResult 
} from '../types';

const API_BASE = 'http://localhost:3000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Artists
  getArtists: () => fetchJson<Artist[]>('/artists'),
  createArtist: (data: Partial<Artist>) => fetchJson<Artist>('/artists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Labels
  getLabels: () => fetchJson<Label[]>('/labels'),
  createLabel: (data: Partial<Label>) => fetchJson<Label>('/labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Albums
  getAlbums: () => fetchJson<Album[]>('/albums'),
  createAlbum: (data: Partial<Album>) => fetchJson<Album>('/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Releases
  createRelease: (data: Partial<Release>) => fetchJson<Release>('/releases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),

  // Collection
  getCollection: () => fetchJson<CollectionItem[]>('/collection'),
  addToCollection: (data: Partial<CollectionItem>) => fetchJson<{ CollectionID: number }>('/collection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateCollectionItem: (id: number, data: Partial<CollectionItem>) => fetchJson<{ message: string }>(`/collection/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteCollectionItem: (id: number) => fetchJson<{ message: string }>(`/collection/${id}`, {
    method: 'DELETE'
  }),

  // Wishlist
  getWishlist: () => fetchJson<WishlistItem[]>('/wishlist'),
  addToWishlist: (data: Partial<WishlistItem>) => fetchJson<{ WishlistID: number }>('/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateWishlistItem: (id: number, data: Partial<WishlistItem>) => fetchJson<{ message: string }>(`/wishlist/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteWishlistItem: (id: number) => fetchJson<{ message: string }>(`/wishlist/${id}`, {
    method: 'DELETE'
  }),

  // Search & Stats
  search: (query: string) => fetchJson<CollectionItem[]>(`/search?query=${encodeURIComponent(query)}`),
  getStats: () => fetchJson<Stats>('/stats'),
  searchDiscogs: (query: string) => fetchJson<{ results: DiscogsResult[] }>(`/discogs/search?q=${encodeURIComponent(query)}`),
};
