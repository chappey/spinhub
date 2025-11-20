import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, Library, Heart, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

export function Sidebar({ collapsed, setCollapsed, currentPage, setCurrentPage }: SidebarProps) {
    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'collection', label: 'My Collection', icon: Library },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'stats', label: 'Statistics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="pb-12 min-h-screen">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img src="/spin.svg" alt="SpinHub Logo" className="w-8 h-8" />
                            </div>
                            <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">SpinHub</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollapsed(true)}
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
}
