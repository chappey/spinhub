import { useState, useEffect, useMemo } from 'react'
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
import { Moon, Sun, Disc, Search, Command, CalendarIcon, Plus, Grid3X3, List } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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
        setSearchDialogOpen(true);
      }
    };

    // Use capture phase to ensure we handle the event before browser defaults
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(searchQuery)}`);
      const results = await res.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
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
          {wishlist.map(item => (
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
          {wishlist.map(item => (
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
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full grok-gradient flex items-center justify-center">
                <Disc className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                SpinHub
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchDialogOpen(true)}
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
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <div className="grok-card px-4 py-3 rounded-lg text-center min-w-[100px]">
              <div className="text-xl font-bold text-primary">{stats.totalRecords}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Records</div>
            </div>
            <div className="grok-card px-4 py-3 rounded-lg text-center min-w-[100px]">
              <div className="text-xl font-bold text-primary">{stats.totalArtists}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Artists</div>
            </div>
            <div className="grok-card px-4 py-3 rounded-lg text-center min-w-[100px]">
              <div className="text-xl font-bold text-primary">${stats.totalValue}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Value</div>
            </div>
            <div className="grok-card px-4 py-3 rounded-lg text-center min-w-[100px]">
              <div className="text-xl font-bold text-primary">{stats.wishlistItems}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Wishlist</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {showAddForm ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-2"
              >
                ← Back to Collection
              </Button>
              <h2 className="text-2xl font-bold">Add New Vinyl</h2>
            </div>
            {renderAdd()}
          </div>
        ) : (
          <Tabs defaultValue="collection" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 grok-card p-1">
              <TabsTrigger value="collection" className="data-[state=active]:grok-gradient data-[state=active]:text-white">My Collection</TabsTrigger>
              <TabsTrigger value="wishlist" className="data-[state=active]:grok-gradient data-[state=active]:text-white">Wishlist</TabsTrigger>
            </TabsList>
            <TabsContent value="collection" className="mt-6">
              {renderCollection()}
            </TabsContent>
            <TabsContent value="wishlist" className="mt-6">
              {renderWishlist()}
            </TabsContent>
          </Tabs>
        )}
      </main>

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

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-2xl">
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
              <Button onClick={handleSearch}>
                Search
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
              {searchResults.map(item => (
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
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default App
