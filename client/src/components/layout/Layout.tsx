import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
    currentPage: string;
    setCurrentPage: (page: string) => void;
    onSearchClick: () => void;
    onAddClick: () => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export function Layout({
    children,
    currentPage,
    setCurrentPage,
    onSearchClick,
    onAddClick,
    darkMode,
    toggleDarkMode
}: LayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className={`grid transition-all duration-300 ${sidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-5'}`}>
                {/* Sidebar */}
                <div className={`hidden lg:block border-r border-border/50 bg-card/30 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden' : 'lg:col-span-1'
                    }`}>
                    {!sidebarCollapsed && (
                        <Sidebar
                            collapsed={sidebarCollapsed}
                            setCollapsed={setSidebarCollapsed}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    )}
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
                    <Header
                        currentPage={currentPage}
                        onSearchClick={onSearchClick}
                        onAddClick={onAddClick}
                        darkMode={darkMode}
                        toggleDarkMode={toggleDarkMode}
                    />
                    <main className="container mx-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
