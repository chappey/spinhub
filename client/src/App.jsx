import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Kbd } from '@/components/ui/kbd'
import { Moon, Sun, Disc, Disc3, Search, Command, CalendarIcon, Plus, Grid3X3, List, Home, Library, Heart, BarChart3, Settings, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [artists, setArtists] = useState([]);
  const [labels, setLabels] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [sortBy, setSortBy] = useState('artist');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState(null);
  const [purchaseDate, setPurchaseDate] = useState(null);
  const { toast } = useToast();
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [albumFormat, setAlbumFormat] = useState('LP');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [condition, setCondition] = useState('Very Good');
  const [sleeveCondition, setSleeveCondition] = useState('Very Good');
  const [modalCondition, setModalCondition] = useState('Very Good');
  const [modalSleeveCondition, setModalSleeveCondition] = useState('Very Good');
  const [newArtistForm, setNewArtistForm] = useState(false);
  const [newAlbumForm, setNewAlbumForm] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormPurchaseDate, setAddFormPurchaseDate] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadData();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Add keyboard shortcut for search
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+K pressed, opening search dialog');
        setSearchDialogOpen(true);
      }
    };

    // Use capture phase to ensure we handle the event before browser defaults
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        console.log('Searching for:', searchQuery);
        const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(searchQuery)}`);
        console.log('Search response status:', res.status);
        if (!res.ok) {
          throw new Error(`Search failed: ${res.status}`);
        }
        const results = await res.json();
        console.log('Search results:', results);
        setSearchResults(results);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
        showToast('Search failed: ' + error.message, 'error');
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [collectionRes, wishlistRes, statsRes, artistsRes, labelsRes, albumsRes] = await Promise.all([
        fetch(`${API_BASE}/collection`),
        fetch(`${API_BASE}/wishlist`),
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/artists`),
        fetch(`${API_BASE}/labels`),
        fetch(`${API_BASE}/albums`)
      ]);
      setCollection(await collectionRes.json());
      setWishlist(await wishlistRes.json());
      setStats(await statsRes.json());
      setArtists(await artistsRes.json());
      setLabels(await labelsRes.json());
      setAlbums(await albumsRes.json());
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    try {
      setIsSearching(true);
      console.log('Manual search for:', searchQuery);
      const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(searchQuery)}`);
      console.log('Search response status:', res.status);
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`);
      }
      const results = await res.json();
      console.log('Search results:', results);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
      showToast('Search failed: ' + error.message, 'error');
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const sortedCollection = useMemo(() => {
    return [...collection].sort((a, b) => {
      switch (sortBy) {
        case 'artist':
          return a.ArtistName.localeCompare(b.ArtistName);
        case 'album':
          return a.AlbumTitle.localeCompare(b.AlbumTitle);
        case 'year':
          return (a.ReleaseYear || 0) - (b.ReleaseYear || 0);
        case 'condition':
          const conditions = ['Poor', 'Fair', 'Good', 'Good Plus', 'Very Good', 'Very Good Plus', 'Near Mint', 'Mint'];
          return conditions.indexOf(a.Condition) - conditions.indexOf(b.Condition);
        case 'price':
          return (a.PurchasePrice || 0) - (b.PurchasePrice || 0);
        default:
          return 0;
      }
    });
  }, [collection, sortBy]);

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

  const sortCollection = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const showToast = (message, type = 'success') => {
    toast({
      title: type === 'error' ? 'Error' : 'Success',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const openModal = (type, data) => {
    setModalType(type);
    setModalData(data);
    setPurchaseDate(data?.PurchaseDate ? new Date(data.PurchaseDate) : null);
    setModalCondition(data?.Condition || 'Very Good');
    setModalSleeveCondition(data?.SleeveCondition || 'Very Good');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType('');
    setModalData(null);
  };

  const saveModal = async () => {
    if (modalType === 'collection') {
      try {
        const data = {
          PurchaseDate: purchaseDate ? purchaseDate.toISOString().split('T')[0] : null,
          PurchasePrice: document.getElementById('modalPurchasePrice').value || null,
          Condition: modalCondition,
          SleeveCondition: modalSleeveCondition,
          StorageLocation: document.getElementById('modalStorageLocation').value || null,
          Notes: document.getElementById('modalNotes').value || null,
          AcquiredFrom: document.getElementById('modalAcquiredFrom').value || null
        };
        await fetch(`${API_BASE}/collection/${modalData.CollectionID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        loadData();
        showToast('Collection item updated successfully');
        closeModal();
      } catch (error) {
        showToast('Failed to update', 'error');
      }
    }
    // For wishlist, can add later if needed
  };

  const handleArtistChange = async (artistId) => {
    setSelectedArtist(artistId);
    if (artistId) {
      try {
        const res = await fetch(`${API_BASE}/albums`);
        const allAlbums = await res.json();
        const filtered = allAlbums.filter(album => album.ArtistID == artistId);
        setAlbums(filtered);
      } catch (error) {
        console.error('Failed to load albums:', error);
      }
    } else {
      setAlbums([]);
    }
  };

  const saveNewArtist = async () => {
    const name = document.getElementById('artistName').value.trim();
    if (!name) {
      showToast('Artist name is required', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/artists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: name,
          CountryOfOrigin: document.getElementById('artistCountry').value,
          PrimaryGenre: document.getElementById('artistGenre').value
        })
      });
      const result = await res.json();
      setArtists([...artists, result]);
      setSelectedArtist(result.ArtistID);
      setNewArtistForm(false);
      document.getElementById('artistName').value = '';
      document.getElementById('artistCountry').value = '';
      document.getElementById('artistGenre').value = '';
      showToast('Artist added successfully');
    } catch (error) {
      showToast('Failed to add artist', 'error');
    }
  };

  const saveNewAlbum = async () => {
    const title = document.getElementById('albumTitle').value.trim();
    if (!title || !selectedArtist) {
      showToast('Album title and artist are required', 'error');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Title: title,
          ArtistID: selectedArtist,
          Genre: document.getElementById('albumGenre').value,
          OriginalReleaseYear: document.getElementById('albumYear').value || null,
          Format: albumFormat
        })
      });
      const result = await res.json();
      setAlbums([...albums, result]);
      setNewAlbumForm(false);
      document.getElementById('albumTitle').value = '';
      document.getElementById('albumGenre').value = '';
      document.getElementById('albumYear').value = '';
      showToast('Album added successfully');
    } catch (error) {
      showToast('Failed to add album', 'error');
    }
  };

  const addToCollection = async () => {
    if (!selectedAlbum) {
      showToast('Please select an album', 'error');
      return;
    }
    try {
      // Create release
      const releaseData = {
        AlbumID: selectedAlbum,
        LabelID: selectedLabel || null,
        CatalogNumber: document.getElementById('catalogNumber').value || null,
        CountryOfRelease: document.getElementById('countryOfRelease').value || null,
        ReleaseYear: document.getElementById('releaseYear').value || null,
        FormatVariant: document.getElementById('formatVariant').value || null,
        ColorOrEdition: document.getElementById('colorEdition').value || null
      };
      const releaseRes = await fetch(`${API_BASE}/releases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(releaseData)
      });
      const release = await releaseRes.json();

      // Add to collection
      const collectionData = {
        ReleaseID: release.ReleaseID,
        PurchaseDate: addFormPurchaseDate ? addFormPurchaseDate.toISOString().split('T')[0] : null,
        PurchasePrice: document.getElementById('purchasePrice').value || null,
        Condition: condition,
        SleeveCondition: sleeveCondition,
        StorageLocation: document.getElementById('storageLocation').value || null,
        AcquiredFrom: document.getElementById('acquiredFrom').value || null,
        Notes: document.getElementById('notes').value || null
      };
      await fetch(`${API_BASE}/collection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionData)
      });

      // Reload data
      loadData();
      showToast('Added to collection successfully');
      
      // Reset form
      setSelectedArtist('');
      setSelectedAlbum('');
      setSelectedLabel('');
      setCondition('Very Good');
      setSleeveCondition('Very Good');
      setAddFormPurchaseDate(null);
      setNewArtistForm(false);
      setNewAlbumForm(false);
    } catch (error) {
      showToast('Failed to add to collection', 'error');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'collection', label: 'My Collection', icon: Library },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  const renderSidebar = () => (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <circle cx="12" cy="12" r="10" stroke="url(#sidebarLogoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12c0-1.7.7-3.2 1.8-4.2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 12c0 1.7-.7 3.2-1.8 4.2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">SpinHub</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(true)}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentPage(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
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
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
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
            <div className="text-2xl font-bold">${stats.totalValue}</div>
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
            <div className="text-2xl font-bold">{stats.totalArtists}</div>
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
            <div className="text-2xl font-bold">{stats.wishlistItems}</div>
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
              {collection.slice(0, 5).map((item) => (
                <div key={item.CollectionID} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.AlbumTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.ArtistName}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    ${item.PurchasePrice}
                  </div>
                </div>
              ))}
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
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Record
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setSearchDialogOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Collection
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCurrentPage('collection')}
            >
              <Library className="mr-2 h-4 w-4" />
              Browse Collection
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCollection = () => (
    <div>
      <div className="flex gap-3 mb-6">
        <Select value={sortBy} onValueChange={sortCollection}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artist">Sort by Artist</SelectItem>
            <SelectItem value="album">Sort by Album</SelectItem>
            <SelectItem value="year">Sort by Year</SelectItem>
            <SelectItem value="condition">Sort by Condition</SelectItem>
            <SelectItem value="price">Sort by Price</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCollection.map(item => (
            <Card key={item.CollectionID} className="grok-card hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => openModal('collection', item)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-primary">{item.AlbumTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Artist:</span>
                  <span className="font-medium">{item.ArtistName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Catalog:</span>
                  <span className="font-medium">{item.CatalogNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Condition:</span>
                  <span className="font-medium">{item.Condition}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Label:</span>
                  <span className="font-medium">{item.LabelName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedCollection.map(item => (
            <div
              key={item.CollectionID}
              className="grok-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => openModal('collection', item)}
            >
              <div className="flex items-center justify-between">
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
          ))}
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div>
      <div className="flex gap-3 mb-6">
        <Select value={sortBy} onValueChange={sortCollection}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artist">Sort by Artist</SelectItem>
            <SelectItem value="album">Sort by Album</SelectItem>
            <SelectItem value="year">Sort by Year</SelectItem>
            <SelectItem value="priority">Sort by Priority</SelectItem>
            <SelectItem value="price">Sort by Price</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWishlist.map(item => (
            <Card key={item.WishlistID} className="grok-card hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => openModal('wishlist', item)}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-primary">{item.AlbumTitle || 'N/A'}</CardTitle>
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
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedWishlist.map(item => (
            <div
              key={item.WishlistID}
              className="grok-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => openModal('wishlist', item)}
            >
              <div className="flex items-center justify-between">
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
          ))}
        </div>
      )}
    </div>
  );

  const renderAdd = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="grok-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">1. Select or Create Artist</h3>
        <div className="flex gap-3">
          <Select value={selectedArtist} onValueChange={handleArtistChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="-- Select Artist --" />
            </SelectTrigger>
            <SelectContent>
              {artists.map(artist => (
                <SelectItem key={artist.ArtistID} value={artist.ArtistID}>{artist.Name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setNewArtistForm(!newArtistForm)} variant="outline">+ New Artist</Button>
        </div>
        
        {newArtistForm && (
          <div className="space-y-3 border-t pt-4">
            <Input id="artistName" placeholder="Artist Name" />
            <Input id="artistCountry" placeholder="Country" />
            <Input id="artistGenre" placeholder="Genre" />
            <div className="flex gap-3">
              <Button onClick={saveNewArtist}>Save Artist</Button>
              <Button onClick={() => setNewArtistForm(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="grok-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">2. Select or Create Album</h3>
        <div className="flex gap-3">
          <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="-- Select Album --" />
            </SelectTrigger>
            <SelectContent>
              {albums.map(album => (
                <SelectItem key={album.AlbumID} value={album.AlbumID}>{album.Title} ({album.OriginalReleaseYear || 'N/A'})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setNewAlbumForm(!newAlbumForm)} variant="outline" disabled={!selectedArtist}>+ New Album</Button>
        </div>
        
        {newAlbumForm && (
          <div className="space-y-3 border-t pt-4">
            <Input id="albumTitle" placeholder="Album Title" />
            <Input id="albumGenre" placeholder="Genre" />
            <Input id="albumYear" type="number" placeholder="Release Year" />
            <Select value={albumFormat} onValueChange={setAlbumFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LP">LP</SelectItem>
                <SelectItem value="EP">EP</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="12-inch">12-inch</SelectItem>
                <SelectItem value="7-inch">7-inch</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button onClick={saveNewAlbum}>Save Album</Button>
              <Button onClick={() => setNewAlbumForm(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="grok-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">3. Release Details</h3>
        <Select value={selectedLabel} onValueChange={setSelectedLabel}>
          <SelectTrigger>
            <SelectValue placeholder="-- Select Label (Optional) --" />
          </SelectTrigger>
          <SelectContent>
            {labels.map(label => (
              <SelectItem key={label.LabelID} value={label.LabelID}>{label.Name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input id="catalogNumber" placeholder="Catalog Number" />
        <Input id="countryOfRelease" placeholder="Country of Release" />
        <Input id="releaseYear" type="number" placeholder="Release Year" />
        <Input id="formatVariant" placeholder="Format Variant (e.g., 180g, Picture Disc)" />
        <Input id="colorEdition" placeholder="Color/Edition (e.g., Blue Vinyl, Gatefold)" />
      </div>

      <div className="grok-card p-6 space-y-4">
        <h3 className="text-lg font-semibold">4. Collection Info</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !addFormPurchaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {addFormPurchaseDate ? format(addFormPurchaseDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={addFormPurchaseDate}
                onSelect={setAddFormPurchaseDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Input id="purchasePrice" type="number" step="0.01" placeholder="Purchase Price" />
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mint">Mint (M)</SelectItem>
            <SelectItem value="Near Mint">Near Mint (NM)</SelectItem>
            <SelectItem value="Very Good Plus">Very Good Plus (VG+)</SelectItem>
            <SelectItem value="Very Good">Very Good (VG)</SelectItem>
            <SelectItem value="Good Plus">Good Plus (G+)</SelectItem>
            <SelectItem value="Good">Good (G)</SelectItem>
            <SelectItem value="Fair">Fair (F)</SelectItem>
            <SelectItem value="Poor">Poor (P)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sleeveCondition} onValueChange={setSleeveCondition}>
          <SelectTrigger>
            <SelectValue placeholder="Select sleeve condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mint">Sleeve: Mint (M)</SelectItem>
            <SelectItem value="Near Mint">Sleeve: Near Mint (NM)</SelectItem>
            <SelectItem value="Very Good Plus">Sleeve: Very Good Plus (VG+)</SelectItem>
            <SelectItem value="Very Good">Sleeve: Very Good (VG)</SelectItem>
            <SelectItem value="Good Plus">Sleeve: Good Plus (G+)</SelectItem>
            <SelectItem value="Good">Sleeve: Good (G)</SelectItem>
            <SelectItem value="Fair">Sleeve: Fair (F)</SelectItem>
            <SelectItem value="Poor">Sleeve: Poor (P)</SelectItem>
          </SelectContent>
        </Select>
        <Input id="storageLocation" placeholder="Storage Location (e.g., Shelf A)" />
        <Input id="acquiredFrom" placeholder="Acquired From" />
        <Textarea id="notes" placeholder="Notes" />
      </div>

      <Button onClick={addToCollection} className="grok-button w-full">Add to Collection</Button>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`grid transition-all duration-300 ${sidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-5'}`}>
        {/* Sidebar */}
        <div className={`hidden lg:block border-r border-border/50 bg-card/30 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'lg:col-span-1'
        }`}>
          {!sidebarCollapsed && renderSidebar()}
        </div>

        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <div className="hidden lg:block fixed left-0 top-20 z-40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="ml-2 rounded-r-md rounded-l-none shadow-lg hover:scale-105 transition-transform"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Content */}
        <div className={`col-span-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-4'}`}>
          <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center lg:hidden">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="headerLogoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                      <circle cx="12" cy="12" r="10" stroke="url(#headerLogoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 12c0-1.7.7-3.2 1.8-4.2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 12c0 1.7-.7 3.2-1.8 4.2" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                    {currentPage === 'dashboard' ? 'Dashboard' :
                     currentPage === 'collection' ? 'My Collection' :
                     currentPage === 'wishlist' ? 'Wishlist' :
                     'Statistics'}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Search button clicked');
                      setSearchDialogOpen(true);
                    }}
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                    <Kbd className="hidden sm:inline-flex">
                      <Command className="h-3 w-3" />
                      <span>K</span>
                    </Kbd>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={toggleDarkMode} className="hover:scale-105 transition-transform">
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="container mx-auto p-6">
            {showAddForm ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="flex items-center gap-2"
                  >
                    ← Back
                  </Button>
                  <h2 className="text-2xl font-bold">Add New Vinyl</h2>
                </div>
                {renderAdd()}
              </div>
            ) : currentPage === 'dashboard' ? (
              renderDashboard()
            ) : currentPage === 'collection' ? (
              renderCollection()
            ) : currentPage === 'wishlist' ? (
              renderWishlist()
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>
                  <p className="text-muted-foreground">
                    Detailed analytics coming soon...
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50">
        <div className="flex justify-around py-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3",
                  currentPage === item.id && "text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modalType === 'collection' ? 'Edit Collection Item' : 'Wishlist Item'}</DialogTitle>
          </DialogHeader>
          {modalType === 'collection' && modalData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Album</label>
                  <p className="text-lg">{modalData.AlbumTitle}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Artist</label>
                  <p className="text-lg">{modalData.ArtistName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Catalog Number</label>
                  <p>{modalData.CatalogNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium">Label</label>
                  <p>{modalData.LabelName || 'Unknown'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !purchaseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {purchaseDate ? format(purchaseDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={purchaseDate}
                        onSelect={setPurchaseDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Price</label>
                  <Input id="modalPurchasePrice" type="number" step="0.01" defaultValue={modalData.PurchasePrice} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <Select value={modalCondition} onValueChange={setModalCondition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mint">Mint (M)</SelectItem>
                      <SelectItem value="Near Mint">Near Mint (NM)</SelectItem>
                      <SelectItem value="Very Good Plus">Very Good Plus (VG+)</SelectItem>
                      <SelectItem value="Very Good">Very Good (VG)</SelectItem>
                      <SelectItem value="Good Plus">Good Plus (G+)</SelectItem>
                      <SelectItem value="Good">Good (G)</SelectItem>
                      <SelectItem value="Fair">Fair (F)</SelectItem>
                      <SelectItem value="Poor">Poor (P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sleeve Condition</label>
                  <Select value={modalSleeveCondition} onValueChange={setModalSleeveCondition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mint">Mint (M)</SelectItem>
                      <SelectItem value="Near Mint">Near Mint (NM)</SelectItem>
                      <SelectItem value="Very Good Plus">Very Good Plus (VG+)</SelectItem>
                      <SelectItem value="Very Good">Very Good (VG)</SelectItem>
                      <SelectItem value="Good Plus">Good Plus (G+)</SelectItem>
                      <SelectItem value="Good">Good (G)</SelectItem>
                      <SelectItem value="Fair">Fair (F)</SelectItem>
                      <SelectItem value="Poor">Poor (P)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Storage Location</label>
                <Input id="modalStorageLocation" defaultValue={modalData.StorageLocation} placeholder="Storage Location" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Acquired From</label>
                <Input id="modalAcquiredFrom" defaultValue={modalData.AcquiredFrom} placeholder="Acquired From" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea id="modalNotes" defaultValue={modalData.Notes} placeholder="Notes" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button onClick={closeModal} variant="outline">Cancel</Button>
                <Button onClick={saveModal}>Save Changes</Button>
              </div>
            </div>
          )}
          {modalType === 'wishlist' && modalData && (
            <div className="space-y-4">
              <h2>{modalData.AlbumTitle || 'Unknown Album'}</h2>
              <h3>{modalData.ArtistName || 'Unknown Artist'}</h3>
              <hr />
              <p><strong>Priority:</strong> <span className={`priority-${modalData.Priority.toLowerCase()}`}>{modalData.Priority}</span></p>
              <p><strong>Max Price:</strong> {modalData.MaxPrice ? '$' + parseFloat(modalData.MaxPrice).toFixed(2) : 'Not set'}</p>
              {modalData.ReleaseYear && <p><strong>Year:</strong> {modalData.ReleaseYear}</p>}
              {modalData.CatalogNumber && <p><strong>Catalog Number:</strong> {modalData.CatalogNumber}</p>}
              {modalData.LabelName && <p><strong>Label:</strong> {modalData.LabelName}</p>}
              {modalData.Notes && <p><strong>Notes:</strong> {modalData.Notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={searchDialogOpen} onOpenChange={(open) => {
        console.log('Search dialog open state changed to:', open);
        setSearchDialogOpen(open);
        if (!open) {
          // Reset search state when dialog closes
          setSearchQuery('');
          setSearchResults([]);
          setHasSearched(false);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Search Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by artist, album, or catalog number..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            <div className="flex justify-end">
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto" : "space-y-2 max-h-96 overflow-y-auto"}>
              {isSearching ? (
                <div className={viewMode === 'grid' ? "col-span-full text-center py-8" : "text-center py-8"}>
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length === 0 && hasSearched && searchQuery.trim() ? (
                <div className={viewMode === 'grid' ? "col-span-full text-center py-8 text-muted-foreground" : "text-center py-8 text-muted-foreground"}>
                  No results found for "{searchQuery}"
                </div>
              ) : searchResults.length > 0 ? (
                viewMode === 'grid' ? (
                  searchResults.map(item => (
                    <Card key={item.CollectionID} className="grok-card hover:scale-105 transition-transform duration-200 cursor-pointer" onClick={() => { setSearchDialogOpen(false); openModal('collection', item); }}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-primary">{item.AlbumTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Artist:</span>
                          <span className="font-medium">{item.ArtistName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Catalog:</span>
                          <span className="font-medium">{item.CatalogNumber}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  searchResults.map(item => (
                    <div
                      key={item.CollectionID}
                      className="grok-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => { setSearchDialogOpen(false); openModal('collection', item); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-primary truncate">{item.AlbumTitle}</h3>
                            <span className="text-sm text-muted-foreground">by</span>
                            <span className="text-sm font-medium truncate">{item.ArtistName}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Catalog: {item.CatalogNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : hasSearched ? null : (
                <div className={viewMode === 'grid' ? "col-span-full text-center py-8 text-muted-foreground" : "text-center py-8 text-muted-foreground"}>
                  Start typing to search your collection...
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default App
