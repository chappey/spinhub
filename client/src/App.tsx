import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/components/features/Dashboard';
import { CollectionList } from '@/components/features/CollectionList';
import { Wishlist } from '@/components/features/Wishlist';
import { AddVinylForm } from '@/components/features/AddVinylForm';
import { SearchDialog } from '@/components/shared/SearchDialog';
import { VinylModal } from '@/components/shared/VinylModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorState } from '@/components/ui/error-state';
import { useCollectionData } from '@/hooks/useCollectionData';
import { CollectionItem, WishlistItem } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { Statistics } from '@/components/features/Statistics';

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Modal state for search results
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
    const [itemToMove, setItemToMove] = useState<WishlistItem | null>(null);

    const {
        collection,
        wishlist,
        stats,
        artists,
        labels,
        albums,
        loading,
        error,
        refreshData
    } = useCollectionData();

    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        // Add keyboard shortcut for search
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                e.stopPropagation();
                setSearchDialogOpen(true);
            }
        };

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

    const handleSearchResultSelect = (item: CollectionItem) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleMoveToCollection = (item: WishlistItem) => {
        setItemToMove(item);
        setShowAddForm(true);
    };

    if (loading && !collection.length) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size={48} />
            </div>
        );
    }

    if (error && !collection.length) {
        return (
            <ErrorState
                fullScreen
                onRetry={refreshData}
                message={error.message || "Failed to load application data."}
            />
        );
    }

    return (
        <>
            <Layout
                currentPage={currentPage}
                setCurrentPage={(page) => {
                    setCurrentPage(page);
                    setShowAddForm(false);
                    setItemToMove(null);
                }}
                onSearchClick={() => setSearchDialogOpen(true)}
                onAddClick={() => {
                    setItemToMove(null);
                    setShowAddForm(true);
                }}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
            >
                {showAddForm ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setItemToMove(null);
                                }}
                                className="flex items-center gap-2 text-sm font-medium hover:underline"
                            >
                                ← Back
                            </button>
                            <h2 className="text-2xl font-bold">{itemToMove ? 'Move to Collection' : 'Add New Vinyl'}</h2>
                        </div>
                        <AddVinylForm
                            artists={artists}
                            labels={labels}
                            albums={albums}
                            initialData={itemToMove ? {
                                artistName: itemToMove.ArtistName,
                                albumTitle: itemToMove.AlbumTitle,
                                format: itemToMove.Format
                            } : undefined}
                            onSuccess={() => {
                                setShowAddForm(false);
                                setItemToMove(null);
                                refreshData();
                            }}
                            onCancel={() => {
                                setShowAddForm(false);
                                setItemToMove(null);
                            }}
                        />
                    </div>
                ) : currentPage === 'dashboard' ? (
                    <Dashboard
                        stats={stats}
                        recentAdditions={collection}
                        loading={loading}
                        onAddClick={() => setShowAddForm(true)}
                        onSearchClick={() => setSearchDialogOpen(true)}
                        onBrowseClick={() => setCurrentPage('collection')}
                    />
                ) : currentPage === 'collection' ? (
                    <CollectionList
                        collection={collection}
                        onRefresh={refreshData}
                    />
                ) : currentPage === 'wishlist' ? (
                    <Wishlist
                        wishlist={wishlist}
                        onRefresh={refreshData}
                        onMoveToCollection={handleMoveToCollection}
                    />
                ) : (
                    <Statistics
                        stats={stats}
                        collection={collection}
                        loading={loading}
                    />
                )}
            </Layout>

            <SearchDialog
                open={searchDialogOpen}
                onOpenChange={setSearchDialogOpen}
                onSelectResult={handleSearchResultSelect}
            />

            <VinylModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                type="collection"
                mode="view"
                data={selectedItem}
                onSave={refreshData}
            />

            <Toaster />
        </>
    );
}

export default App;
