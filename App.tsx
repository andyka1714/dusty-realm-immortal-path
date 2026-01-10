import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Adventure } from './pages/Adventure';
import { Workshop } from './pages/Workshop';
import { useGameLoop } from './hooks/useGameLoop';
import { processOfflineGains } from './store/slices/characterSlice';
import { RootState } from './store/store';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  
  const dispatch = useDispatch();
  
  // Start the Global Game Loop
  useGameLoop();
  
  const { isInitialized, isDead } = useSelector((state: RootState) => state.character);

  // Process offline gains on mount
  useEffect(() => {
    dispatch(processOfflineGains());
  }, [dispatch]);

  // Watch for Age milestones & Lifespan warnings
  // Logic migrated to checkTimeEvents in timeActions.ts


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'adventure':
        return <Adventure />;
      case 'workshop':
        return <Workshop />;
      case 'inventory':
        return <Inventory />;
      default:
        return <Dashboard />;
    }
  };

  // --- 1. FULL SCREEN INTRO / DEATH STATE ---
  // If not initialized or dead, show full screen dashboard (which handles these states) without sidebar
  if (!isInitialized || isDead) {
    return (
      <div className="h-screen w-screen bg-stone-950 text-stone-200 font-serif overflow-y-auto">
         {/* Direct Dashboard render ensures full centering without layout interference */}
         <Dashboard />
      </div>
    );
  }

  // --- 2. MAIN GAME LAYOUT ---
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen bg-stone-950 text-stone-200 font-serif overflow-hidden">
      
      {/* Mobile Header (Only visible on mobile) */}
      <div className="md:hidden flex-none bg-stone-900 border-b border-stone-800 p-4 flex justify-between items-center z-40 relative shadow-md">
         <span className="text-amber-500 font-bold tracking-widest text-lg">塵寰仙途</span>
         <button 
           onClick={() => setIsMobileMenuOpen(true)}
           className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
         >
           <Menu size={24} />
         </button>
      </div>

      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
           setActiveTab(tab);
           setIsMobileMenuOpen(false); // Close mobile menu on select
        }}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isDesktopSidebarCollapsed}
        setIsCollapsed={setIsDesktopSidebarCollapsed}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;