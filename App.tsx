import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Adventure } from './pages/Adventure';
import { Workshop } from './pages/Workshop';
import { useGameLoop } from './hooks/useGameLoop';
import { processOfflineGains, gainAttribute } from './store/slices/characterSlice';
import { RootState } from './store/store';
import { addLog } from './store/slices/logSlice';
import { DAYS_PER_YEAR, AGE_MILESTONE_MESSAGES, ATTRIBUTE_EPIPHANY_MESSAGES, LIFESPAN_WARNINGS } from './constants';
import { MajorRealm, BaseAttributes } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);
  
  const dispatch = useDispatch();
  
  // Start the Global Game Loop
  useGameLoop();

  // Watch for Age milestones & Lifespan warnings
  const { age, lifespan, majorRealm, isInitialized, isDead } = useSelector((state: RootState) => state.character);
  const lastAgeYearRef = useRef<number>(0);
  const lastWarningAgeRef = useRef<number>(0);

  // Process offline gains on mount
  useEffect(() => {
    dispatch(processOfflineGains());
  }, [dispatch]);

  // Global Age Logger & Yearly Epiphany System
  useEffect(() => {
    if (!isInitialized || isDead) return;
    
    const currentYear = Math.floor(age / DAYS_PER_YEAR);
    const daysRemaining = lifespan - age;
    const yearsRemaining = Math.ceil(daysRemaining / DAYS_PER_YEAR);

    // --- LIFESPAN WARNING SYSTEM ---
    let shouldWarn = false;
    let warningType: 'warning-low' | 'warning-med' | 'warning-critical' | null = null;
    let warningMsg = "";

    // Stage 3: < 1 Year (Critical) - Every 30 days
    if (daysRemaining <= 365 && daysRemaining > 0) {
       if (age - lastWarningAgeRef.current >= 30) {
           shouldWarn = true;
           warningType = 'warning-critical';
           const msgs = LIFESPAN_WARNINGS.critical;
           warningMsg = msgs[Math.floor(Math.random() * msgs.length)]
              .replace('${days}', Math.floor(daysRemaining).toString());
       }
    } 
    // Stage 2: <= 3 Years - Every 6 months (approx 182 days)
    else if (daysRemaining <= 3 * 365) {
       if (age - lastWarningAgeRef.current >= 182) {
           shouldWarn = true;
           warningType = 'warning-med';
           const msgs = LIFESPAN_WARNINGS.med;
           warningMsg = msgs[Math.floor(Math.random() * msgs.length)];
       }
    }
    // Stage 1: <= 5 Years - Every 1 year (365 days)
    else if (daysRemaining <= 5 * 365) {
       if (age - lastWarningAgeRef.current >= 365) {
           shouldWarn = true;
           warningType = 'warning-low';
           const msgs = LIFESPAN_WARNINGS.low;
           warningMsg = msgs[Math.floor(Math.random() * msgs.length)]
              .replace('${years}', yearsRemaining.toString());
       }
    }

    if (shouldWarn && warningType) {
        dispatch(addLog({ message: warningMsg, type: warningType }));
        lastWarningAgeRef.current = age;
    }

    // --- YEARLY AGE EVENTS ---
    if (lastAgeYearRef.current === 0) {
        lastAgeYearRef.current = currentYear;
        return;
    }

    if (currentYear > lastAgeYearRef.current) {
        lastAgeYearRef.current = currentYear;
        
        const EPIPHANY_CHANCE = 0.02; // 2% chance
        const isEpiphany = Math.random() < EPIPHANY_CHANCE;

        if (isEpiphany) {
            const attributes: (keyof BaseAttributes)[] = ['physique', 'rootBone', 'insight', 'comprehension', 'fortune', 'charm'];
            const randomAttr = attributes[Math.floor(Math.random() * attributes.length)];
            const messages = ATTRIBUTE_EPIPHANY_MESSAGES[randomAttr];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            const attrNames: Record<keyof BaseAttributes, string> = {
                physique: '體魄', rootBone: '根骨', insight: '神識',
                comprehension: '悟性', fortune: '福緣', charm: '魅力'
            };

            dispatch(gainAttribute(randomAttr));
            dispatch(addLog({ 
                message: `${randomMessage}【${attrNames[randomAttr]}+1】`, 
                type: 'epiphany' 
            }));

        } else {
            const messages = AGE_MILESTONE_MESSAGES[majorRealm] || AGE_MILESTONE_MESSAGES[MajorRealm.Mortal] || [];
            if (messages.length > 0) {
                const template = messages[Math.floor(Math.random() * messages.length)];
                const message = template
                    .replace('${age}', currentYear.toString())
                    .replace('${year}', (currentYear - 10).toString());
                
                dispatch(addLog({ message, type: 'age' }));
            } else {
                 dispatch(addLog({ message: `歲月流逝，你已滿 ${currentYear} 歲。`, type: 'age' }));
            }
        }
    }
  }, [age, isInitialized, isDead, majorRealm, lifespan, dispatch]);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-stone-950 text-stone-200 font-serif overflow-hidden">
      
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
      <main className="flex-1 h-[calc(100vh-65px)] md:h-screen overflow-hidden relative transition-all duration-300">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;