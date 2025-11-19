import { Button } from '@/components/ui/button';
import { Search, Command, Plus, Sun, Moon } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

interface HeaderProps {
    currentPage: string;
    onSearchClick: () => void;
    onAddClick: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export function Header({ currentPage, onSearchClick, onAddClick, darkMode, toggleDarkMode }: HeaderProps) {
    const getTitle = () => {
        switch (currentPage) {
            case 'dashboard': return 'Dashboard';
            case 'collection': return 'My Collection';
            case 'wishlist': return 'Wishlist';
            case 'stats': return 'Statistics';
            default: return 'SpinHub';
        }
    };

    return (
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center lg:hidden">
                            <img src="/spin.svg" alt="SpinHub Logo" className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                            {getTitle()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSearchClick}
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
                            onClick={onAddClick}
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
    );
}
