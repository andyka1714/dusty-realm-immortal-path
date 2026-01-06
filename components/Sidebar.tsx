import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Home, Sword, Hammer, Backpack, Lock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: '道始中心', icon: Home },
  { id: 'adventure', label: '修仙歷練', icon: Sword },
  { id: 'workshop', label: '洞府百業', icon: Hammer },
  { id: 'inventory', label: '行囊空間', icon: Backpack },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed
}) => {
  const { isInSeclusion } = useSelector((state: RootState) => state.character);

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[49] md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div className={clsx(
        "bg-stone-900 border-r border-stone-800 flex flex-col transition-all duration-300 ease-in-out",
        // Mobile Styles: Fixed drawer
        "fixed inset-y-0 left-0 z-[50] w-64 md:relative",
        // Desktop Styles: Sticky and variable width
        "md:h-screen md:sticky md:top-0",
        // Width/Transform control based on state
        !isMobileOpen && "-translate-x-full md:translate-x-0", // Hide on mobile if closed
        isCollapsed ? "md:w-20" : "md:w-64" // Collapse on desktop
      )}>
        
        {/* Header / Logo */}
        <div className={clsx(
            "p-6 border-b border-stone-800 flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="text-2xl font-bold text-amber-500 tracking-widest">塵寰仙途</h1>
              <p className="text-stone-500 text-xs mt-1">Dusty Realm</p>
            </div>
          )}
          {isCollapsed && (
             <span className="text-amber-500 font-bold text-xl">仙</span>
          )}

          {/* Mobile Close Button */}
          <button 
            className="md:hidden text-stone-500 hover:text-stone-200"
            onClick={() => setIsMobileOpen(false)}
          >
             <X size={24} />
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2 overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.id === 'adventure' && isInSeclusion;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveTab(item.id)}
                disabled={isDisabled}
                title={isCollapsed ? item.label : undefined}
                className={clsx(
                  "w-full flex items-center rounded-lg transition-all duration-200 border group relative",
                  isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3 space-x-3",
                  isActive 
                    ? "bg-stone-800 border-amber-600/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]" 
                    : isDisabled
                      ? "border-transparent text-stone-600 cursor-not-allowed bg-stone-950/50"
                      : "border-transparent text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
                )}
              >
                <div className="relative">
                    {isDisabled ? <Lock size={20} /> : <Icon size={20} />}
                    {isDisabled && isCollapsed && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                </div>
                
                {!isCollapsed && <span className="tracking-widest whitespace-nowrap">{item.label}</span>}
                
                {/* Tooltip for Disabled Adventure */}
                {isDisabled && (
                  <div className={clsx(
                      "absolute top-1/2 -translate-y-1/2 px-2 py-1 bg-red-900/90 text-red-200 text-xs rounded border border-red-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] transition-opacity",
                      isCollapsed ? "left-full ml-4" : "left-full ml-2"
                  )}>
                    閉關中
                  </div>
                )}
                
                {/* Tooltip for Collapsed State Hover */}
                {isCollapsed && !isDisabled && (
                   <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-stone-800 text-stone-200 text-xs rounded border border-stone-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-[100] transition-opacity">
                      {item.label}
                   </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / Toggle Button */}
        <div className="p-4 border-t border-stone-800 flex flex-col gap-4">
           {/* Desktop Collapse Toggle */}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="hidden md:flex w-full items-center justify-center p-2 rounded hover:bg-stone-800 text-stone-500 transition-colors"
             title={isCollapsed ? "展開選單" : "收合選單"}
           >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
           </button>

           <div className={clsx("text-center text-stone-600 text-[10px]", isCollapsed && "hidden")}>
             <p>V 0.1.1 Alpha</p>
           </div>
        </div>
      </div>
    </>
  );
};