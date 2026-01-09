
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { MAPS } from '../data/maps';
import { ITEMS } from '../data/items';
import { enterMap, movePlayer, tickMonsters, resolveBattle, closeBattleReport, markMapVisited } from '../store/slices/adventureSlice';
import { runAutoBattle, calculatePlayerStats } from '../utils/battleSystem';
import { addItem } from '../store/slices/inventorySlice';
import { addLog } from '../store/slices/logSlice';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Skull, Footprints, Navigation, Map as MapIcon, X, Lock, Globe, Target, MapPin, Info, Users, Move, Swords } from 'lucide-react';
import { parseBattleLog } from '../utils/logParser';
import { EnemyRank, Coordinate, MapData, MajorRealm, ElementType, ItemCategory } from '../types';
import { MOVEMENT_SPEEDS, REALM_NAMES, ELEMENT_COLORS, ELEMENT_NAMES } from '../constants';
import clsx from 'clsx';
import { Modal } from '../components/Modal';
import { getDropRewards } from '@/data/drop_tables';
import { addSpiritStones, gainExperience } from '@/store/slices/characterSlice';
import { formatSpiritStone } from '@/utils/currency';
import AdventureStage from '../components/adventure/AdventureStage';

// --- VISUAL CONFIG ---
const TARGET_CELL_SIZE_DESKTOP = 42; // px
const TARGET_CELL_SIZE_MOBILE = 34; // px
const GRID_SCALE_X = 140; 
const GRID_SCALE_Y = 120; 
const NODE_WIDTH = 100;
const NODE_HEIGHT = 70;

// Simple BFS for Pathfinding
const findPath = (start: Coordinate, end: Coordinate, width: number, height: number): Coordinate[] => {
    const queue: { pos: Coordinate; path: Coordinate[] }[] = [{ pos: start, path: [] }];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    let iterations = 0;
    while (queue.length > 0 && iterations < 2000) {
        iterations++;
        const { pos, path } = queue.shift()!;
        if (pos.x === end.x && pos.y === end.y) return path;

        const dirs = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
            { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }
        ];
        // Heuristic sort to prioritize direction towards target
        dirs.sort((a, b) => {
             const distA = Math.abs((pos.x + a.x) - end.x) + Math.abs((pos.y + a.y) - end.y);
             const distB = Math.abs((pos.x + b.x) - end.x) + Math.abs((pos.y + b.y) - end.y);
             return distA - distB;
        });

        for (const dir of dirs) {
            const nextX = pos.x + dir.x;
            const nextY = pos.y + dir.y;
            if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height) {
                const key = `${nextX},${nextY}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ pos: { x: nextX, y: nextY }, path: [...path, { x: nextX, y: nextY }] });
                }
            }
        }
    }
    return [];
};

// --- Extracted WorldMap Component ---
const WorldMap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const dispatch = useDispatch();
    const character = useSelector((state: RootState) => state.character);
    const { currentMapId, mapHistory } = useSelector((state: RootState) => state.adventure);
    const [hoveredMapId, setHoveredMapId] = useState<string | null>(null);
    
    // Canvas dimensions
    const canvasWidth = 3000; 
    const canvasHeight = 4200; 
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight - 1300; 
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const startY = centerY - (scrollContainerRef.current.clientHeight / 2);
            const startX = centerX - (scrollContainerRef.current.clientWidth / 2);
            scrollContainerRef.current.scrollTop = startY;
            scrollContainerRef.current.scrollLeft = startX;
        }
    }, []);

    const getPos = (map: MapData) => {
        return {
            x: centerX + (map.worldX * GRID_SCALE_X),
            y: centerY - (map.worldY * GRID_SCALE_Y) // Invert Y for screen coords
        };
    };

    const getSmartConnection = (sourceMap: MapData, targetMap: MapData) => {
        const sourcePos = getPos(sourceMap);
        const targetPos = getPos(targetMap);
        
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        
        const halfW = NODE_WIDTH / 2;
        const halfH = NODE_HEIGHT / 2;
        
        let x1, y1, x2, y2;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) { x1 = sourcePos.x + halfW; y1 = sourcePos.y; x2 = targetPos.x - halfW; y2 = targetPos.y; }
            else { x1 = sourcePos.x - halfW; y1 = sourcePos.y; x2 = targetPos.x + halfW; y2 = targetPos.y; }
        } else {
            if (dy > 0) { x1 = sourcePos.x; y1 = sourcePos.y + halfH; x2 = targetPos.x; y2 = targetPos.y - halfH; }
            else { x1 = sourcePos.x; y1 = sourcePos.y - halfH; x2 = targetPos.x; y2 = targetPos.y + halfH; }
        }
        return { x1, y1, x2, y2 };
    };

    const connections: React.ReactNode[] = [];
    const drawnConnections = new Set<string>();

    MAPS.forEach(map => {
        const mapConfig = map.portals.map(p => p.targetMapId);
        
        mapConfig.forEach(targetId => {
            const targetMap = MAPS.find(m => m.id === targetId);

            if (targetMap) {
                const key = [map.id, targetId].sort().join('-');
                
                if (!drawnConnections.has(key)) {
                    drawnConnections.add(key);
                    const isVisitedSource = mapHistory[map.id];
                    const isVisitedTarget = mapHistory[targetId];
                    const isCurrent = currentMapId === map.id;
                    const isVisible = isVisitedSource || isCurrent || isVisitedTarget;
                    const strokeColor = (isVisitedSource && isVisitedTarget) ? "#f59e0b" : "#44403c"; 
                    const opacity = isVisible ? 1 : 0.15;
                    
                    const { x1, y1, x2, y2 } = getSmartConnection(map, targetMap);

                    connections.push(
                        <line 
                            key={key}
                            x1={x1} y1={y1}
                            x2={x2} y2={y2}
                            stroke={strokeColor}
                            strokeWidth="2"
                            opacity={opacity}
                        />
                    );
                }
            }
        });
    });

    const currentMapData = MAPS.find(m => m.id === currentMapId);

    const nodes = MAPS.map(map => {
        const pos = getPos(map);
        const isCurrent = currentMapId === map.id;
        const isVisited = !!mapHistory[map.id]; 
        // Fast Travel Rule: Must have visited the map to teleport.
        const canEnter = isVisited; 
        const isHovered = hoveredMapId === map.id;

        return (
            <div 
                key={map.id}
                onMouseEnter={() => setHoveredMapId(map.id)}
                onMouseLeave={() => setHoveredMapId(null)}
                onClick={() => {
                    if (canEnter && map.id !== currentMapId) {
                         let startX = Math.floor(map.width / 2);
                         let startY = Math.floor(map.height / 2);

                         const connection = currentMapData?.portals.find(p => p.targetMapId === map.id);
                         if (connection) {
                             startX = connection.targetX;
                             startY = connection.targetY;
                         }

                         dispatch(enterMap({ mapId: map.id, startX, startY }));
                         onClose();
                    }
                }}
                className={clsx(
                    "absolute flex flex-col items-center justify-center p-2 rounded transition-all duration-300 border-2 shadow-lg",
                    isCurrent 
                        ? "bg-amber-900/90 border-amber-500 z-30 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.5)] cursor-default"
                        : canEnter
                            ? "bg-stone-800 border-stone-600 hover:border-amber-400 hover:bg-stone-700 cursor-pointer z-20"
                            : "bg-stone-900 border-stone-800 opacity-60 grayscale cursor-not-allowed z-10",
                    isHovered && "scale-105 border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.4)] z-40"
                )}
                style={{
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className={clsx(
                    "absolute -top-3 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider border",
                    canEnter ? "bg-stone-950 border-stone-600 text-stone-400" : "bg-stone-950 border-stone-800 text-stone-600"
                )}>
                    {REALM_NAMES[map.minRealm]}
                </div>
                <div className={clsx("font-bold text-sm text-center leading-tight", canEnter ? "text-stone-200" : "text-stone-600")}>
                    {map.name}
                </div>
                {isCurrent && <MapPin size={16} className="absolute -right-2 -bottom-2 text-amber-500 animate-bounce drop-shadow" />}
                {!canEnter && <Lock size={14} className="mt-1 text-stone-600" />}
                {isCurrent && <div className="absolute -inset-1 border border-amber-500/50 rounded animate-ping"></div>}
            </div>
        );
    });

    return (
        <div className="relative w-full h-full bg-stone-950 overflow-hidden">
            <div ref={scrollContainerRef} className="w-full h-full overflow-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-stone-950 custom-scrollbar relative">
                <div style={{ width: canvasWidth, height: canvasHeight, position: 'relative', margin: '0 auto' }}>
                    <svg width={canvasWidth} height={canvasHeight} className="absolute inset-0 pointer-events-none z-0">
                        {connections}
                    </svg>
                    {nodes}
                </div>
            </div>


            {/* Map Info Tooltip */}
            {hoveredMapId && (() => {
                const map = MAPS.find(m => m.id === hoveredMapId);
                if (!map) return null;
                
                // Get unique monster info (deduplicate by name)
                const uniqueMonstersMap = new Map();
                map.enemies.forEach(e => {
                    if (!uniqueMonstersMap.has(e.name)) {
                        uniqueMonstersMap.set(e.name, e);
                    }
                });
                const uniqueMonsters = Array.from(uniqueMonstersMap.values());
                
                // Calculate Drops
                const dropsSet = new Set<string>();
                uniqueMonsters.forEach(m => {
                    m.drops.forEach(d => dropsSet.add(d));
                });
                
                const drops = Array.from(dropsSet).map(id => ITEMS[id]).filter(Boolean);
                
                const hasSpiritStones = drops.some(d => d.id === 'spirit_stone');
                const breakthroughItems = drops.filter(d => d.category === ItemCategory.Breakthrough);
                const equipmentItems = drops.filter(d => d.category === ItemCategory.Equipment);
                const materialItems = drops.filter(d => d.category === ItemCategory.Material);
                const otherItems = drops.filter(d => 
                    d.category !== ItemCategory.Breakthrough && 
                    d.category !== ItemCategory.Equipment && 
                    d.category !== ItemCategory.Material && 
                    d.id !== 'spirit_stone'
                );

                return (
                    <div className="absolute top-4 left-4 z-50 p-4 bg-stone-900/95 border border-amber-500/50 rounded-lg shadow-2xl backdrop-blur max-w-xs animate-fade-in pointer-events-none">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-800">
                            <h3 className="text-lg font-bold text-amber-500">{map.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                                {REALM_NAMES[map.minRealm]}
                            </span>
                        </div>
                        <p className="text-sm text-stone-400 mb-4 font-serif leading-relaxed line-clamp-3">
                            {map.introText.replace(/踏入.*?，/, '')}
                        </p>
                        
                        {uniqueMonsters.length > 0 && (
                            <div className="space-y-4">
                                {/* Monsters */}
                                <div className="space-y-1">
                                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                                        <Skull size={12} /> 區域妖獸
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {uniqueMonsters.map(monster => {
                                            let styleClass = "text-stone-400 bg-stone-950 border-stone-800"; // Common
                                            if (monster.rank === EnemyRank.Elite) styleClass = "text-blue-400 bg-blue-950/30 border-blue-800";
                                            if (monster.rank === EnemyRank.Boss) styleClass = "text-red-500 bg-red-950/30 border-red-800";
                                            
                                            return (
                                                <span key={monster.name} className={`text-xs px-1.5 py-0.5 rounded border ${styleClass}`}>
                                                    {monster.name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Drops */}
                                <div className="space-y-1 pt-2 border-t border-stone-800/50">
                                    <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                                        <Target size={12} /> 掉落情報
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {hasSpiritStones && (
                                            <div className="text-xs text-amber-400 flex items-center gap-1.5 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]"></div> 靈石
                                            </div>
                                        )}
                                        
                                        {breakthroughItems.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {breakthroughItems.map(item => (
                                                    <span key={item.id} className="text-[10px] px-1.5 py-0.5 rounded border border-purple-800 bg-purple-950/30 text-purple-300 shadow-[0_0_8px_rgba(147,51,234,0.2)]">
                                                        {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {equipmentItems.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {equipmentItems.map(item => (
                                                    <span key={item.id} className="text-[10px] px-1.5 py-0.5 rounded border border-stone-600 bg-stone-800 text-stone-300">
                                                        {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {(materialItems.length > 0 || otherItems.length > 0) && (
                                            <div className="flex flex-wrap gap-1">
                                                {[...materialItems, ...otherItems].map(item => (
                                                    <span key={item.id} className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">
                                                        {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

export const Adventure: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const { attributes, majorRealm, spiritRootId, isInitialized } = character;
  const { equipmentStats } = useSelector((state: RootState) => state.inventory);
  const { 
    currentMapId, playerPosition, activeMonsters, visitedCells, 
    mapHistory, isBattling, currentEnemy, battleLogs, lastBattleResult 
  } = useSelector((state: RootState) => state.adventure);
  
  const [showIntro, setShowIntro] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true); // Default to true (Black) for smooth entry
  
  // Battle Replay State
  const [isReplayingBattle, setIsReplayingBattle] = useState(false);
  const [replayQueue, setReplayQueue] = useState<any[]>([]);
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);
  const [battleSnapshot, setBattleSnapshot] = useState<{
      playerHp: number; playerMaxHp: number;
      enemyHp: number; enemyMaxHp: number;
      won: boolean; rewards?: any;
  } | null>(null);

  // Initial Entry Fade In
  useEffect(() => {
     const timer = setTimeout(() => setIsTransitioning(false), 100);
     return () => clearTimeout(timer);
  }, []);
  
  // Expanded Map State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTab, setMapTab] = useState<'area' | 'world'>('area');

  // Auto-Movement State
  const [autoMovePath, setAutoMovePath] = useState<Coordinate[]>([]);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [targetMonsterId, setTargetMonsterId] = useState<string | null>(null);
  const [isAutoBattling, setIsAutoBattling] = useState(false);
  
  // Dynamic Viewport Logic
  const containerRef = useRef<HTMLDivElement>(null); // Ref for Grid Counter-Act
  const battleLogRef = useRef<HTMLDivElement>(null); // Ref for Battle Log Auto-Scroll
  const prevStartRef = useRef({ x: 0, y: 0 }); // Track previous viewport origin
  
  // Precise Grid Metrics for perfect centering
  const [gridMetrics, setGridMetrics] = useState({
      cols: 15,
      rows: 15,
      cellSize: 40,
      pixelWidth: 600,
      pixelHeight: 600
  });
  
  // Detect Resize and Update Viewport
  useLayoutEffect(() => {
    // Using ResizeObserver to get exact content box dimensions
    const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        // Resized
        
        if (width === 0 || height === 0) return;

        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            // Mobile Strategy: Fill the screen completely (Fill & Crop)
            // 1. Determine base columns to fit width (Odd number)
            const targetSize = TARGET_CELL_SIZE_MOBILE;
            let cols = Math.round(width / targetSize);
            if (cols % 2 === 0) cols += 1; // Ensure Odd
            
            // 2. Force exact cell size to fill width 100%
            // This eliminates left/right whitespace
            const finalCellSize = width / cols;
            
            // 3. Determine rows to cover height 
            let rows = Math.ceil(height / finalCellSize);
            if (rows % 2 === 0) rows += 1; // Ensure Odd
            
            // 4. If this row count is slightly less than height (due to odd adjustment), add 2 more
            if (rows * finalCellSize < height) rows += 2;

            // Result: Width is exact, Height is >= container
            setGridMetrics({ 
                cols, 
                rows, 
                cellSize: finalCellSize, 
                pixelWidth: width, 
                pixelHeight: rows * finalCellSize 
            });

        } else {
            // Desktop Strategy: Square Viewport (1:1), Contained
            const targetSize = TARGET_CELL_SIZE_DESKTOP;
            let cols = Math.floor(width / targetSize);
            let rows = Math.floor(height / targetSize);
            
            // Enforce Square
            const minDim = Math.min(cols, rows);
            cols = minDim;
            rows = minDim;

            // Ensure odd
            if (cols % 2 === 0) cols -= 1;
            if (rows % 2 === 0) rows -= 1;
            
            cols = Math.max(7, cols);
            rows = Math.max(7, rows);

            // Calculate integer cell size to fit
            const finalCellSize = Math.floor(Math.min(width / cols, height / rows));

            setGridMetrics({ 
                cols, 
                rows, 
                cellSize: finalCellSize, 
                pixelWidth: cols * finalCellSize, 
                pixelHeight: rows * finalCellSize 
            });
        }
    });
    
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!currentMapId) {
        dispatch(enterMap({ mapId: '0', startX: 20, startY: 20 }));
    }
  }, [currentMapId, dispatch]);

  const mapData = MAPS.find(m => m.id === currentMapId);

  // Stop auto-move if battle starts or map changes
  useEffect(() => {
      if (isBattling || showIntro) {
          setAutoMovePath([]);
          if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      }
  }, [isBattling, showIntro, currentMapId]);

  // 1. Dynamic Tracking Logic (Effect: Updates autoMovePath)
  useEffect(() => {
      if (isBattling || showIntro || !mapData || !targetMonsterId) return;

      const targetMonster = activeMonsters.find(m => m.instanceId === targetMonsterId);
      if (targetMonster) {
          const currentDest = autoMovePath.length > 0 ? autoMovePath[autoMovePath.length - 1] : null;
          
          if (!currentDest || currentDest.x !== targetMonster.x || currentDest.y !== targetMonster.y) {
               // Target moved or new target! Recalculate path.
               const newPath = findPath(playerPosition, { x: targetMonster.x, y: targetMonster.y }, mapData.width, mapData.height);
               if (newPath.length > 0) {
                   setAutoMovePath(newPath);
               }
          }
      } else {
          // Monster dead or gone? Stop targeting.
          setTargetMonsterId(null);
      }
  }, [targetMonsterId, activeMonsters, mapData, isBattling, showIntro, playerPosition, autoMovePath]);

  // 2. Movement Execution Logic (Effect: Runs Timer)
  useEffect(() => {
      if (!isBattling && !showIntro && autoMovePath.length > 0) {
          const nextStep = autoMovePath[0];
          const speed = MOVEMENT_SPEEDS[character.majorRealm] || 500;

          moveTimerRef.current = setTimeout(() => {
              const dx = nextStep.x - playerPosition.x;
              const dy = nextStep.y - playerPosition.y;
              // Allow diagonal (max diff 1)
              if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                  dispatch(movePlayer({ dx, dy }));
                  setAutoMovePath(prev => prev.slice(1));
              } else {
                  setAutoMovePath([]);
              }
          }, speed);
      }
      return () => { if (moveTimerRef.current) clearTimeout(moveTimerRef.current); };
  }, [autoMovePath, playerPosition, isBattling, character.majorRealm, dispatch, showIntro]);

  // Monster Ticker
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isBattling && !showIntro) {
            dispatch(tickMonsters());
        }
    }, 1000); 
    return () => clearInterval(interval);
  }, [dispatch, isBattling, showIntro]);

  // --- Auto-Battle Logic ---
  
  // 1. Auto-Target: Find nearest monster when idle
  useEffect(() => {
      if (!isAutoBattling || isBattling || targetMonsterId || showIntro || activeMonsters.length === 0) return;

      // Find nearest
      let nearestId: string | null = null;
      let minDist = Infinity;

      activeMonsters.forEach(m => {
          // Verify path exists? For now just euclidean distance is enough approximation
          const dist = Math.abs(m.x - playerPosition.x) + Math.abs(m.y - playerPosition.y);
          if (dist < minDist) {
              minDist = dist;
              nearestId = m.instanceId;
          }
      });

      if (nearestId) {
          setTargetMonsterId(nearestId);
      }
  }, [isAutoBattling, isBattling, targetMonsterId, activeMonsters, playerPosition, showIntro]);

  // 2. Auto-Close Battle Report
  useEffect(() => {
      if (isAutoBattling && lastBattleResult) {
          const timer = setTimeout(() => {
              dispatch(closeBattleReport());
          }, 1500); // 1.5s delay to see loot
          return () => clearTimeout(timer);
      }
  }, [isAutoBattling, lastBattleResult, dispatch]);

  // 3. Handle Battle Result (Clear State on Loss)
  useEffect(() => {
      if (lastBattleResult === 'lost') {
          setTargetMonsterId(null);
          setAutoMovePath([]);
          setIsAutoBattling(false);
      } else if (lastBattleResult === 'won') {
         setAutoMovePath([]); 
      }
  }, [lastBattleResult]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isBattling || showIntro || isMapModalOpen) return;
        
        const isMoveKey = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key);
        if (isMoveKey) setAutoMovePath([]); 

        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
        
        if (e.key === 'ArrowUp' || e.key === 'w') dispatch(movePlayer({ dx: 0, dy: -1 }));
        if (e.key === 'ArrowDown' || e.key === 's') dispatch(movePlayer({ dx: 0, dy: 1 }));
        if (e.key === 'ArrowLeft' || e.key === 'a') dispatch(movePlayer({ dx: -1, dy: 0 }));
        if (e.key === 'ArrowRight' || e.key === 'd') dispatch(movePlayer({ dx: 1, dy: 0 }));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isBattling, showIntro, isMapModalOpen]);

  // Map Intro
  useEffect(() => {
    if (currentMapId && !mapHistory[currentMapId] && mapData) setShowIntro(true);
  }, [currentMapId, mapHistory, mapData]);

  const finishIntro = () => {
      if (currentMapId) dispatch(markMapVisited(currentMapId));
      setShowIntro(false);
      // Ensure transition overlay is removed when intro finishes
      setIsTransitioning(false);
  };

  // Event Driven Portal Logic
  const handlePlayerArrive = (x: number, y: number) => {
      if (!mapData || isBattling) return;
      const portal = mapData.portals.find(p => p.x === x && p.y === y);
      if (portal) {
           // 1. Fade to Black first
           setIsTransitioning(true);
           
           // 2. Wait for fade (500ms), THEN warp
           setTimeout(() => {
               dispatch(enterMap({ mapId: portal.targetMapId, startX: portal.targetX, startY: portal.targetY }));
               // Note: The useEffect below will handle the Fade In logic once mapId changes
           }, 500);
      }
  };

  // Map Change Transition / Intro
  const prevMapIdRef = useRef<string | null>(currentMapId);

  useEffect(() => {
      if (!currentMapId) return;
      
      const prevId = prevMapIdRef.current;
      if (currentMapId === prevId) return;
      
      prevMapIdRef.current = currentMapId;

      if (!mapData || showIntro) return; 

      const hasVisitedMap = mapHistory[currentMapId];
      
      if (!hasVisitedMap && currentMapId !== '0') {
           setShowIntro(true);
           dispatch(markMapVisited(currentMapId));
      } else {
           // Only trigger blink if this is a REAL map switch (prevId existed)
           // If prevId was null (App Boot), skip the black blink for visited maps.
           if (prevId) {
               setIsTransitioning(true);
               const timer = setTimeout(() => setIsTransitioning(false), 500);
               return () => clearTimeout(timer);
           }
      }
  }, [currentMapId, mapData, showIntro, mapHistory]);

  // Battle Logic Effect
  const battleProcessedRef = useRef(false);

  // Replay Effect
  useEffect(() => {
    if (!isReplayingBattle || replayQueue.length === 0) {
        if (isReplayingBattle && replayQueue.length === 0 && battleSnapshot) {
             // Replay Finished -> Apply Final Results
             setIsReplayingBattle(false);
             dispatch(resolveBattle({ won: battleSnapshot.won, logs: displayedLogs })); // Use displayed logs as final source of truth for Redux if needed (or just use original)
             
             // Process Rewards
              if (battleSnapshot.won && battleSnapshot.rewards) {
                   const { rewards } = battleSnapshot;
                  // 1. EXP Log
                  if (currentEnemy) {
                      const expAmount = rewards.exp > 0 ? rewards.exp : currentEnemy.exp; // Fallback
                      if (expAmount > 0) {
                          dispatch(gainExperience(expAmount));
                          dispatch(addLog({ 
                              message: `擊敗 <enemy rank="${currentEnemy.rank}">${currentEnemy.name}</enemy>，獲得 <exp>${expAmount} 修為</exp>`, 
                              type: 'gain' 
                          }));
                      }
                  }

                  // 2. Loot Log (Combine Stones + Items)

                   let spiritStones = rewards.spiritStones || 0;
                   const drops = rewards.drops || [];
                   const finalDrops: any[] = [];
                   let stonesFromDrops = 0;

                   drops.forEach((d: any) => {
                       if (d.itemId === 'spirit_stone') {
                           stonesFromDrops += d.count;
                       } else {
                           finalDrops.push(d);
                       }
                   });
                   
                   const totalStones = spiritStones + stonesFromDrops;

                   if (totalStones > 0 || finalDrops.length > 0) {
                       const lootParts: string[] = [];

                       if (totalStones > 0) {
                           const high = Math.floor(totalStones / 1000000);
                           const medium = Math.floor((totalStones % 1000000) / 1000);
                           const low = totalStones % 1000;
                           
                           if (high > 0) lootParts.push(`<stones q="2">${high} 上品 靈石</stones>`);
                           if (medium > 0) lootParts.push(`<stones q="1">${medium} 中品 靈石</stones>`);
                           if (low > 0) lootParts.push(`<stones q="0">${low} 下品 靈石</stones>`);
                       }

                       finalDrops.forEach((drop: any) => {
                           dispatch(addItem({ itemId: drop.itemId, count: drop.count, instance: drop.instance }));
                           
                           const item = ITEMS[drop.itemId];
                           if (item) {
                               let itemStr = item.name;
                               let qVal = 0;
                               
                               if (drop.instance) {
                                   qVal = drop.instance.quality;
                               } else {
                                   qVal = item ? (item.quality || 0) : 0;
                               }
                               
                                if (qVal === 0) itemStr += '(下品)';
                                if (qVal === 1) itemStr += '(中品)';
                                if (qVal === 2) itemStr += '(上品)';
                                if (qVal === 3) itemStr += '(仙品)';
                               
                               let finalStr = `<item q="${qVal}">${itemStr}</item>`;
                               if (drop.count > 1) {
                                   finalStr += ` x${drop.count}`;
                               }
                               lootParts.push(finalStr);
                           }
                       });
                       
                       dispatch(addLog({
                           message: `獲得戰利品：${lootParts.join('，')}`,
                           type: 'gold' 
                       }));
                       
                       // Dispatch Currency Updates
                       if (spiritStones > 0) dispatch(addSpiritStones({ amount: spiritStones, source: 'battle' }));
                       if (stonesFromDrops > 0) dispatch(addSpiritStones({ amount: stonesFromDrops, source: 'battle' }));
                   }

              } else if (!battleSnapshot.won && currentEnemy) {
                  dispatch(addLog({ message: `不敵 ${currentEnemy.name}，狼狽逃回。`, type: 'danger' }));
              }
        }
        return;
    }

    const timer = setTimeout(() => {
        const nextLog = replayQueue[0];
        setDisplayedLogs(prev => [...prev, nextLog]);
        setReplayQueue(prev => prev.slice(1));
        
        // Update Snapshot for UI
        if (nextLog.playerHp !== undefined) {
             setBattleSnapshot(prev => prev ? { ...prev, playerHp: nextLog.playerHp, enemyHp: nextLog.enemyHp } : null);
        }

        // Auto Scroll
        const logContainer = document.getElementById('battle-log-container');
        if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;

    }, 500); // 0.5 Second Delay per turn

    return () => clearTimeout(timer);
  }, [isReplayingBattle, replayQueue, battleSnapshot]);

  // Auto-Scroll Battle Logs
  useEffect(() => {
    if (battleLogRef.current) {
        battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [displayedLogs, isReplayingBattle, lastBattleResult]);

  useEffect(() => {
      // Reset ref when battle ends
      if (!isBattling) {
          battleProcessedRef.current = false;
          setDisplayedLogs([]);
          setReplayQueue([]);
          setIsReplayingBattle(false);
          setBattleSnapshot(null);
          return;
      }

      if (isBattling && currentEnemy && !lastBattleResult && !battleProcessedRef.current) {
          battleProcessedRef.current = true;
          // Calculate Stats
          const playerStats = calculatePlayerStats(attributes, majorRealm, spiritRootId, equipmentStats, character.name);
          const { won, logs, rewards } = runAutoBattle(playerStats, currentEnemy);
          
          // Start Replay
          // Pre-fill first log immediately so screen isn't empty
          const firstLog = logs[0];
          const remainingLogs = logs.slice(1);

          setDisplayedLogs([firstLog]);
          setReplayQueue(remainingLogs);
          
          setBattleSnapshot({
              playerHp: firstLog.playerHp ?? playerStats.hp,
              playerMaxHp: firstLog.playerMaxHp ?? playerStats.maxHp,
              enemyHp: firstLog.enemyHp ?? currentEnemy.hp,
              enemyMaxHp: firstLog.enemyMaxHp ?? currentEnemy.maxHp,
              won,
              rewards
          });
          setIsReplayingBattle(true);
      }
  }, [isBattling, currentEnemy, lastBattleResult, character, dispatch]);

  const handleGridClick = (targetX: number, targetY: number) => {
      if (isBattling || showIntro || !mapData) return;
      
      // Check if clicking on a monster
      const targetMonster = activeMonsters.find(m => m.x === targetX && m.y === targetY);
      
      // Auto-Battle Override: Stop if manual interaction occurs
      if (isAutoBattling) {
           // If clicking a different monster, or clicking empty ground (manual move)
           if (!targetMonster || (targetMonster && targetMonster.instanceId !== targetMonsterId)) {
               setIsAutoBattling(false);
           }
      }

      if (targetMonster) {
          setTargetMonsterId(targetMonster.instanceId);
      } else {
          setTargetMonsterId(null);
      }

      const path = findPath(playerPosition, { x: targetX, y: targetY }, mapData.width, mapData.height);
      if (path.length > 0) setAutoMovePath(path);
  };

    // PixiJS handles rendering and camera movement now.
    // We retain gridMetrics for proper sizing.





  if (showIntro && mapData) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 cursor-pointer text-center" onClick={finishIntro}>
              <h1 className="text-4xl md:text-6xl font-bold text-stone-200 mb-8 tracking-[0.5em] border-y-2 border-stone-800 py-4 animate-fade-in">{mapData.name}</h1>
              <p className="text-lg md:text-xl text-stone-400 font-serif leading-loose max-w-2xl fade-in-text">{mapData.introText}</p>
          </div>
      );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-[100dvh] flex flex-col bg-black overflow-hidden select-none pt-16 md:pt-0">
        
        {/* Top Right Mini-Map */}
        <div className="absolute top-20 md:top-4 right-4 z-20 flex flex-col items-end gap-2">
            <button 
              onClick={() => { setIsMapModalOpen(true); setMapTab('area'); }}
              className="bg-black/90 border border-stone-600 p-1 w-24 h-24 md:w-32 md:h-32 rounded shadow-lg backdrop-blur relative overflow-hidden group hover:border-amber-500 transition-colors"
            >
                 <div className="w-full h-full relative opacity-80">
                      <div className="absolute w-1.5 h-1.5 bg-green-500 rounded-full z-20 shadow-[0_0_5px_green]" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}></div>
                      <div className="absolute inset-0 border-2 border-green-500/20 rounded-full animate-ping opacity-20"></div>
                      {activeMonsters.map(m => {
                          const relX = m.x - playerPosition.x;
                          const relY = m.y - playerPosition.y;
                          if (Math.abs(relX) < 10 && Math.abs(relY) < 10) {
                              const leftPct = 50 + (relX * 5); 
                              const topPct = 50 + (relY * 5);
                              return (
                                  <div key={m.instanceId} 
                                    className={`absolute w-1 h-1 rounded-full ${m.rank === EnemyRank.Boss ? 'bg-red-500 z-10 w-1.5 h-1.5' : 'bg-red-400/80'} animate-pulse`} 
                                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                                  ></div>
                              );
                          }
                          return null;
                      })}
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                     <span className="text-xs text-amber-200 font-bold tracking-widest flex items-center gap-1"><MapIcon size={12}/> 展開</span>
                 </div>
                 <div className="absolute bottom-0 right-0 bg-stone-900/80 text-[9px] px-1 text-stone-400 border-tl rounded font-mono">
                     {playerPosition.x},{playerPosition.y}
                 </div>
            </button>
             <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                     <button
                        onClick={() => setIsAutoBattling(!isAutoBattling)}
                        className={clsx(
                            "h-8 w-8 flex items-center justify-center rounded backdrop-blur border transition-all group relative",
                            isAutoBattling 
                                ? "bg-red-900/80 border-red-500 text-red-200 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse" 
                                : "bg-black/50 border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600"
                        )}
                     >
                         <Swords size={16} />
                         
                         {/* Tooltip */}
                         <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/90 border border-stone-800 text-[10px] text-stone-300 px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {isAutoBattling ? "停止掛機" : "自動戰鬥"}
                         </span>
                     </button>
                     <div className="h-8 flex items-center text-stone-400 text-xs bg-black/50 px-3 rounded backdrop-blur border border-stone-800 font-bold tracking-wider">
                        {mapData?.name}
                     </div>
                 </div>
                 
                 {/* Boss Timer */}
                 {mapData?.enemies.some(e => e.rank === EnemyRank.Boss) && (
                     <div className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded border border-stone-800/50 text-stone-500">
                         {activeMonsters.some(m => m.rank === EnemyRank.Boss) ? (
                             <span className="text-red-500 animate-pulse">BOSS 已出現</span>
                         ) : (
                             (() => {
                                 const now = new Date();
                                 const min = now.getMinutes();
                                 const sec = now.getSeconds();
                                 const nextSpawnMin = Math.ceil((min + 1) / 15) * 15;
                                 let diffMin = nextSpawnMin - min - 1;
                                 let diffSec = 60 - sec;
                                 if (diffSec === 60) { diffSec = 0; diffMin += 1; }
                                 if (diffMin < 0) diffMin += 60; // Wrap around hour

                                 // Special case: if exactly on spawn time (00, 15, etc) but delay hasn't spawned yet
                                 if (min % 15 === 0 && sec < 10) return <span className="text-stone-400">正在刷新...</span>;

                                 return (
                                     <span>
                                         Boss 刷新: <span className="text-amber-500">{diffMin.toString().padStart(2, '0')}:{diffSec.toString().padStart(2, '0')}</span>
                                     </span>
                                 );
                             })()
                         )}
                     </div>
                 )}
             </div>
         </div>

        {/* Main Grid Render - FILLS AVAILABLE SPACE */}
        <div 
            ref={containerRef}
            className="flex-1 flex items-center justify-center bg-stone-950/80 relative overflow-hidden"
        >
            {/* Transition Overlay */}
            <div className={clsx(
                "absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-500",
                isTransitioning ? "opacity-100" : "opacity-0"
            )}></div>

            {/* PixiJS Stage */}
            {gridMetrics.pixelWidth > 0 && mapData && (
                 <AdventureStage
                    key={currentMapId} // Force Remount on Map Change to prevent visual drift
                    mapData={mapData}
                    playerPosition={playerPosition}
                    activeMonsters={activeMonsters}
                    portals={mapData.portals}
                    onTileClick={handleGridClick}
                    onPlayerArrive={handlePlayerArrive}
                    width={gridMetrics.pixelWidth}
                    height={gridMetrics.pixelHeight}
                    cellSize={gridMetrics.cellSize}
                    majorRealm={character.majorRealm}
                    targetMonsterId={targetMonsterId}
                    isBattling={isBattling}
                    playerName={character.name}
                    moveDestination={autoMovePath.length > 0 ? autoMovePath[autoMovePath.length - 1] : null}
                 />
            )}
        </div>




        {/* Battle Layout Overlay - UNIFIED */}
        {(isBattling || lastBattleResult) && currentEnemy && (
            <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fade-in">
               <div className="absolute inset-0 bg-red-900/10 animate-pulse z-0 pointer-events-none"></div>
               
               <div className="relative z-10 w-full max-w-2xl bg-stone-950 border border-red-900/50 rounded-xl p-6 shadow-2xl flex flex-col h-[70vh] max-h-[600px] animate-scale-in">
                   <div className="flex justify-between items-center mb-4 border-b border-stone-800 pb-4">
                       <>
                           <h2 className={`text-2xl font-bold flex items-center gap-2 ${currentEnemy.rank === EnemyRank.Boss ? 'text-red-500 uppercase tracking-widest' : 'text-stone-300'}`}>
                               <Skull /> {currentEnemy.rank === EnemyRank.Boss ? '守關妖王' : '遭遇強敵'}：{currentEnemy.name}
                           </h2>
                           <div className="text-stone-500 font-mono text-lg font-semibold tracking-wider">
                                {REALM_NAMES[currentEnemy.realm]} <span className="text-stone-400">{currentEnemy.minorRealm}</span>
                            </div>
                       </>
                   </div>
                   
                   {/* Battle Status / HP Bars - Always show snapshot if available, or current logs imply it */}
                   {battleSnapshot && (
                        <div className="mb-4 grid grid-cols-2 gap-4">
                             {/* Player HP */}
                             <div className="bg-stone-900/80 p-3 rounded border border-stone-700">
                                 <div className="flex justify-between text-xs mb-1 text-emerald-400 font-bold">
                                     <span>{character.name}</span>
                                     <span>{Math.floor(battleSnapshot.playerHp)} / {Math.floor(battleSnapshot.playerMaxHp)}</span>
                                 </div>
                                 <div className="h-2 bg-stone-950 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(0, (battleSnapshot.playerHp / battleSnapshot.playerMaxHp) * 100)}%` }}></div>
                                 </div>
                             </div>

                             {/* Enemy HP */}
                             <div className="bg-stone-900/80 p-3 rounded border border-stone-700">
                                 <div className="flex justify-between text-xs mb-1 text-rose-400 font-bold">
                                     <span>{currentEnemy.name}</span>
                                     <span>{Math.floor(battleSnapshot.enemyHp)} / {Math.floor(battleSnapshot.enemyMaxHp)}</span>
                                 </div>
                                 <div className="h-2 bg-stone-950 rounded-full overflow-hidden">
                                     <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.max(0, (battleSnapshot.enemyHp / battleSnapshot.enemyMaxHp) * 100)}%` }}></div>
                                 </div>
                             </div>
                        </div>
                    )}

                   <div id="battle-log-container" ref={battleLogRef} className="flex-1 overflow-y-auto space-y-2 font-mono text-sm p-4 bg-black/30 rounded inner-shadow custom-scrollbar">
                       {displayedLogs.length > 0 ? displayedLogs.map((log, i) => (
                           <div key={i} className={log.isPlayer ? "text-stone-300" : "text-stone-400"}>
                               {parseBattleLog(log.message)}
                           </div>
                       )) : (
                            <div className="text-stone-600 text-center mt-10 italic">戰鬥開始...</div>
                       )}

                   </div>
                   
                   {/* Action Footer - Only shows when result is ready */}
                   {lastBattleResult && !isReplayingBattle && (
                       <div className="mt-4 flex justify-center animate-fade-in">
                           <button onClick={() => dispatch(closeBattleReport())} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-lg shadow-lg hover:border-amber-500 transition-colors">
                               {lastBattleResult === 'won' ? '戰鬥勝利' : '戰鬥失敗'}
                           </button>
                       </div>
                   )}
               </div>
            </div>
        )}



        {/* EXPANDED MAP MODAL */}
        <Modal 
          isOpen={isMapModalOpen} 
          onClose={() => setIsMapModalOpen(false)}
          title="玄天寶鑑"
          size="large"
          actions={
             <button onClick={() => setIsMapModalOpen(false)} className="px-4 py-2 bg-stone-800 text-stone-300 rounded hover:bg-stone-700 border border-stone-700">關閉</button>
          }
        >
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-stone-800 mb-0 flex-none bg-stone-900 md:bg-transparent px-4 md:px-0 pt-2 md:pt-0">
                    <button 
                        onClick={() => setMapTab('area')}
                        className={clsx("flex-1 py-3 flex items-center justify-center gap-2 transition-colors border-b-2", mapTab === 'area' ? "text-amber-500 border-amber-500 bg-amber-900/10" : "text-stone-500 border-transparent hover:text-stone-300")}
                    >
                        <Target size={16} /> 區域地圖
                    </button>
                    <button 
                        onClick={() => setMapTab('world')}
                        className={clsx("flex-1 py-3 flex items-center justify-center gap-2 transition-colors border-b-2", mapTab === 'world' ? "text-amber-500 border-amber-500 bg-amber-900/10" : "text-stone-500 border-transparent hover:text-stone-300")}
                    >
                        <Globe size={16} /> 世界地圖
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative bg-stone-950 md:rounded md:border border-stone-800">
                    {mapTab === 'area' && mapData && (
                        <div className="w-full h-full relative overflow-auto p-4 custom-scrollbar flex items-center justify-center bg-stone-950">
                           <div 
                             onClick={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const x = e.clientX - rect.left;
                                 const y = e.clientY - rect.top;
                                 let targetX = Math.floor((x / rect.width) * mapData.width);
                                 let targetY = Math.floor((y / rect.height) * mapData.height);
                                 
                                 // Clamp to bounds
                                 targetX = Math.max(0, Math.min(targetX, mapData.width - 1));
                                 targetY = Math.max(0, Math.min(targetY, mapData.height - 1));

                                 handleGridClick(targetX, targetY);
                                 setIsMapModalOpen(false); // Close map on click to move
                             }}
                             className="relative bg-stone-900 border border-stone-800 shadow-2xl cursor-pointer"
                             style={{ 
                                 width: '100%', 
                                 maxWidth: '800px', // Slightly larger max width for big screen
                                 aspectRatio: `${mapData.width} / ${mapData.height}`,
                                 minWidth: '300px'
                             }}
                           >
                              {/* Background Grid Lines */}
                              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                                   style={{ backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`, backgroundSize: `5% 5%` }}>
                              </div>

                              {/* Portals */}
                              {mapData.portals.map((p, i) => (
                                  <div key={i} className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500/50 rounded-full border border-blue-400 shadow-[0_0_10px_blue]"
                                    style={{ left: `${(p.x / mapData.width) * 100}%`, top: `${(p.y / mapData.height) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                    title={p.label}
                                  ></div>
                              ))}

                              {/* Player */}
                              <div className="absolute w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full shadow-[0_0_10px_green] z-20 animate-pulse"
                                style={{ left: `${(playerPosition.x / mapData.width) * 100}%`, top: `${(playerPosition.y / mapData.height) * 100}%`, transform: 'translate(-50%, -50%)' }}
                              >
                                 <div className="absolute -inset-2 bg-green-500/20 rounded-full animate-ping"></div>
                              </div>

                              {/* Monsters (Red Dots) */}
                              {activeMonsters.map(m => (
                                  <div key={m.instanceId} 
                                    className={clsx(
                                        "absolute rounded-full z-10 transition-all duration-1000", 
                                        m.rank === EnemyRank.Boss ? "w-2 h-2 md:w-3 md:h-3 bg-red-600 border border-red-400" : m.rank === EnemyRank.Elite ? "w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 shadow-[0_0_5px_blue]" : "w-1 h-1 bg-stone-500"
                                    )}
                                    style={{ left: `${(m.x / mapData.width) * 100}%`, top: `${(m.y / mapData.height) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                  ></div>
                              ))}
                           </div>
                           <div className="absolute top-4 right-4 bg-black/70 p-2 rounded text-xs text-stone-400 pointer-events-none border border-stone-800 backdrop-blur">
                              點擊任意位置移動
                           </div>
                        </div>
                    )}

                    {mapTab === 'world' && <WorldMap onClose={() => setIsMapModalOpen(false)} />}
                </div>
            </div>
        </Modal>
    </div>
  );
};
