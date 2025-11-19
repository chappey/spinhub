import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Moon, Sun } from 'lucide-react'

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [collection, setCollection] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [stats, setStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadData();
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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
      const [collectionRes, wishlistRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/collection`),
        fetch(`${API_BASE}/wishlist`),
        fetch(`${API_BASE}/stats`)
      ]);
      setCollection(await collectionRes.json());
      setWishlist(await wishlistRes.json());
      setStats(await statsRes.json());
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

  const renderCollection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collection.map(item => (
        <Card key={item.CollectionID} className="grok-card hover:scale-105 transition-transform duration-200">
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
  );

  const renderWishlist = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlist.map(item => (
        <Card key={item.WishlistID} className="grok-card hover:scale-105 transition-transform duration-200">
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
  );

  const renderSearch = () => (
    <div>
      <div className="flex gap-3 mb-6">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by artist, album, or catalog number..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 grok-card"
        />
        <Button onClick={handleSearch} className="grok-button px-6">
          Search
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map(item => (
          <Card key={item.CollectionID} className="grok-card hover:scale-105 transition-transform duration-200">
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
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                Vinyl Collection Manager
              </h1>
            </div>
            <Button variant="outline" size="icon" onClick={toggleDarkMode} className="hover:scale-105 transition-transform">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
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
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 grok-card p-1">
            <TabsTrigger value="collection" className="data-[state=active]:grok-gradient data-[state=active]:text-white">My Collection</TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:grok-gradient data-[state=active]:text-white">Wishlist</TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:grok-gradient data-[state=active]:text-white">Search</TabsTrigger>
          </TabsList>
          <TabsContent value="collection" className="mt-6">
            {renderCollection()}
          </TabsContent>
          <TabsContent value="wishlist" className="mt-6">
            {renderWishlist()}
          </TabsContent>
          <TabsContent value="search" className="mt-6">
            {renderSearch()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App
