
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { MAPS } from '../data/maps';
import { ITEMS } from '../data/items';
import { enterMap, movePlayer, tickMonsters, resolveBattle, closeBattleReport, markMapVisited } from '../store/slices/adventureSlice';
import { runAutoBattle, calculatePlayerStats } from '../utils/battleSystem';
import { addItem } from '../store/slices/inventorySlice';
import { addLog } from '../store/slices/logSlice';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Skull, Footprints, Navigation, Map as MapIcon, X, Lock, Globe, Target, MapPin, Info, Users, Move } from 'lucide-react';
import { EnemyRank, Coordinate, MapData, MajorRealm, ElementType } from '../types';
import { MOVEMENT_SPEEDS, REALM_NAMES, ELEMENT_COLORS, ELEMENT_NAMES } from '../constants';
import clsx from 'clsx';
import { Modal } from '../components/Modal';
import { getDropRewards } from '@/data/drop_tables';
import { addSpiritStones } from '@/store/slices/characterSlice';
import { formatSpiritStone } from '@/utils/currency';

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

        const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
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
        const isVisited = mapHistory[map.id];
        const isLocked = character.majorRealm < map.minRealm;
        const isAdjacent = currentMapData?.portals.some(p => p.targetMapId === map.id);
        const canEnter = !isLocked && (isVisited || isAdjacent);
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
                {isLocked && <Lock size={14} className="mt-1 text-stone-600" />}
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
                
                return (
                    <div className="absolute top-4 left-4 z-50 p-4 bg-stone-900/95 border border-amber-500/50 rounded-lg shadow-2xl backdrop-blur max-w-xs animate-fade-in pointer-events-none">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-800">
                            <h3 className="text-lg font-bold text-amber-500">{map.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
                                {REALM_NAMES[map.minRealm]}
                            </span>
                        </div>
                        <p className="text-sm text-stone-400 mb-4 font-serif leading-relaxed line-clamp-3">
                            {map.introText.replace(/踏入.*?，/, '') /* Clean up generic prefix for cleaner tooltip */}
                        </p>
                        
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                                <Skull size={12} /> 區域妖獸
                            </div>
                            {uniqueMonsters.length > 0 ? (
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
                            ) : (
                                <span className="text-xs text-stone-600 italic">此地似乎安全...</span>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export const Adventure: React.FC = () => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const { 
    currentMapId, playerPosition, activeMonsters, visitedCells, 
    mapHistory, isBattling, currentEnemy, battleLogs, lastBattleResult 
  } = useSelector((state: RootState) => state.adventure);
  
  const [showIntro, setShowIntro] = useState(false);
  const [portalModal, setPortalModal] = useState<{ targetMapId: string, targetX: number, targetY: number, label: string } | null>(null);
  
  // Expanded Map State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTab, setMapTab] = useState<'area' | 'world'>('area');

  // Auto-Movement State
  const [autoMovePath, setAutoMovePath] = useState<Coordinate[]>([]);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Dynamic Viewport Logic
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null); // Ref for Grid Counter-Act
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
        // contentRect provides the size of the content box (excluding padding)
        const { width, height } = entry.contentRect;
        
        if (width === 0 || height === 0) return;

        const isMobile = window.innerWidth < 768;
        const targetSize = isMobile ? TARGET_CELL_SIZE_MOBILE : TARGET_CELL_SIZE_DESKTOP;

        // Calculate potential columns/rows based on target size
        let cols = Math.floor(width / targetSize);
        let rows = Math.floor(height / targetSize);

        // Ensure odd numbers for centering
        if (cols % 2 === 0) cols -= 1;
        if (rows % 2 === 0) rows -= 1;

        // Min bounds
        cols = Math.max(7, cols);
        rows = Math.max(7, rows);

        // Calculate exact cell size that fits both dimensions
        // We find the limiting dimension
        const maxCellW = width / cols;
        const maxCellH = height / rows;
        const finalCellSize = Math.floor(Math.min(maxCellW, maxCellH)); // floor to avoid sub-pixel gaps

        // Calculate final exact dimensions
        const pixelWidth = finalCellSize * cols;
        const pixelHeight = finalCellSize * rows;

        setGridMetrics({ cols, rows, cellSize: finalCellSize, pixelWidth, pixelHeight });
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
      if (isBattling || showIntro || portalModal) {
          setAutoMovePath([]);
          if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      }
  }, [isBattling, showIntro, portalModal, currentMapId]);

  // Handle Auto-Movement Loop
  useEffect(() => {
      if (autoMovePath.length > 0 && !isBattling && !portalModal && !showIntro) {
          const nextStep = autoMovePath[0];
          const speed = MOVEMENT_SPEEDS[character.majorRealm] || 500;

          moveTimerRef.current = setTimeout(() => {
              const dx = nextStep.x - playerPosition.x;
              const dy = nextStep.y - playerPosition.y;
              if (Math.abs(dx) + Math.abs(dy) === 1) {
                  dispatch(movePlayer({ dx, dy }));
                  setAutoMovePath(prev => prev.slice(1));
              } else {
                  setAutoMovePath([]);
              }
          }, speed);
      }
      return () => { if (moveTimerRef.current) clearTimeout(moveTimerRef.current); };
  }, [autoMovePath, playerPosition, isBattling, character.majorRealm, dispatch, portalModal, showIntro]);

  // Monster Ticker
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isBattling && !showIntro && !portalModal) {
            dispatch(tickMonsters());
        }
    }, 1000); 
    return () => clearInterval(interval);
  }, [dispatch, isBattling, showIntro, portalModal]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (isBattling || showIntro || portalModal || isMapModalOpen) return;
        
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
  }, [dispatch, isBattling, showIntro, portalModal, isMapModalOpen]);

  // Map Intro
  useEffect(() => {
    if (currentMapId && !mapHistory[currentMapId] && mapData) setShowIntro(true);
  }, [currentMapId, mapHistory, mapData]);

  const finishIntro = () => {
      if (currentMapId) dispatch(markMapVisited(currentMapId));
      setShowIntro(false);
  };

  // Portal Check
  useEffect(() => {
    if (mapData && !isBattling) {
        const portal = mapData.portals.find(p => p.x === playerPosition.x && p.y === playerPosition.y);
        if (portal) {
             setPortalModal(portal);
        }
    }
  }, [playerPosition, mapData, isBattling]);

  // Battle Logic
  useEffect(() => {
      if (isBattling && currentEnemy && !lastBattleResult) {
          const playerStats = calculatePlayerStats(character.attributes, character.majorRealm, character.spiritRootId);
          const { won, logs } = runAutoBattle(playerStats, currentEnemy);
          setTimeout(() => {
              dispatch(resolveBattle({ won, logs }));
              if (won) {
                  // XP Logic
                  dispatch(addLog({ message: `擊敗 ${currentEnemy.name}，獲得經驗 ${currentEnemy.exp}`, type: 'gain' }));
                  
                  // Spirit Stones Drop
                  const { spiritStones } = getDropRewards(currentEnemy);
                  if (spiritStones > 0) {
                      dispatch(addSpiritStones({ amount: spiritStones, source: 'battle' }));
                      dispatch(addLog({ message: `獲得靈石 ${formatSpiritStone(spiritStones)}`, type: 'gain' }));
                  }

                  // Item Drops (Legacy - kept for compatibility)
                  currentEnemy.drops.forEach(dropId => {
                      if (Math.random() < 0.5) { // 50% for now
                          dispatch(addItem({ itemId: dropId, count: 1 }));
                          dispatch(addLog({ message: `獲得戰利品: ${ITEMS[dropId]?.name}`, type: 'gold' }));
                      }
                  });
              } else {
                  dispatch(addLog({ message: `不敵 ${currentEnemy.name}，狼狽逃回。`, type: 'danger' }));
              }
          }, 500);
      }
  }, [isBattling, currentEnemy, lastBattleResult, character, dispatch]);

  const handleGridClick = (targetX: number, targetY: number) => {
      if (isBattling || showIntro || portalModal || !mapData) return;
      const path = findPath(playerPosition, { x: targetX, y: targetY }, mapData.width, mapData.height);
      if (path.length > 0) setAutoMovePath(path);
  };

  // --- Viewport & Smooth Scrolling Logic ---
  const { cols, rows, pixelWidth, pixelHeight, cellSize } = gridMetrics;
  let startX = 0;
  let startY = 0;
  let drawW = 0;
  let drawH = 0;

  if (mapData) {
      startX = Math.max(0, Math.min(mapData.width - cols, playerPosition.x - Math.floor(cols/2)));
      startY = Math.max(0, Math.min(mapData.height - rows, playerPosition.y - Math.floor(rows/2)));
      drawW = Math.min(cols, mapData.width);
      drawH = Math.min(rows, mapData.height);
  }

  // Ensure strict squareness by rendering exactly what we draw
  const finalPixelWidth = cellSize * drawW;
  const finalPixelHeight = cellSize * drawH;

  // Counter-Act Animation for Smooth Scroll
  useLayoutEffect(() => {
    if (!gridRef.current) return;

    const dx = startX - prevStartRef.current.x;
    const dy = startY - prevStartRef.current.y;

    if ((dx !== 0 || dy !== 0) && Math.abs(dx) < 5 && Math.abs(dy) < 5) {
        const moveSpeed = MOVEMENT_SPEEDS[character.majorRealm] || 500;

        // Since we are using exact pixels, we can't use percentages of drawW if it changes (but it's stable mostly)
        // However, standard percentage based on grid tracks works perfectly if grid is consistent
        const xPct = (dx / drawW) * 100;
        const yPct = (dy / drawH) * 100;

        gridRef.current.style.transition = 'none';
        gridRef.current.style.transform = `translate(${xPct}%, ${yPct}%)`;

        void gridRef.current.offsetHeight;

        gridRef.current.style.transition = `transform ${moveSpeed}ms linear`;
        gridRef.current.style.transform = 'translate(0, 0)';
    } else {
        gridRef.current.style.transition = 'none';
        gridRef.current.style.transform = 'translate(0, 0)';
    }

    prevStartRef.current = { x: startX, y: startY };
  }, [startX, startY, drawW, drawH, character.majorRealm]);


  // Helper to render Grid Cells
  const renderCells = () => {
      if (!mapData) return null;

      const isInPath = (cx: number, cy: number) => autoMovePath.some(p => p.x === cx && p.y === cy);
      const cells = [];

      // We render exactly the number of cells defined by gridMetrics (or less if near map edge, handled by grid layout)
      for (let y = startY; y < startY + drawH; y++) {
          for (let x = startX; x < startX + drawW; x++) {
              const monster = activeMonsters.find(m => m.x === x && m.y === y);
              const portal = mapData.portals.find(p => p.x === x && p.y === y);
              const isTargetInPath = isInPath(x, y);
              
              const isVisited = visitedCells[`${x},${y}`];
              const isVisible = Math.abs(x - playerPosition.x) <= 2 && Math.abs(y - playerPosition.y) <= 2;
              
              let content = null;
              let bgClass = "bg-stone-900";
              let borderClass = "border-stone-800";

              if (!isVisited && !isVisible) {
                  bgClass = "bg-black";
                  borderClass = "border-stone-900";
              } else if (!isVisible) {
                  bgClass = "bg-stone-900/50";
                  if (portal) content = <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-900/50"></div>;
                  else if (monster?.rank === EnemyRank.Boss) content = <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-900/50"></div>;
              } else {
                  if (monster) {
                      if (monster.rank === EnemyRank.Boss) {
                          content = <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-red-600 shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-pulse border-2 border-red-300 z-10"></div>;
                      } else if (monster.rank === EnemyRank.Elite) {
                          content = <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-bounce border border-blue-200 z-10"></div>;
                      } else {
                          // Flashing Grey-White for Common
                          content = <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-stone-400 shadow-[0_0_10px_rgba(168,162,158,0.4)] animate-pulse border border-stone-200 z-10"></div>;
                      }
                  } else if (portal) {
                      content = <div className="portal-vortex z-0 w-full h-full scale-75"></div>;
                  } else if (isTargetInPath) {
                      content = <div className="w-1.5 h-1.5 rounded-full bg-stone-600 opacity-50"></div>;
                  }
              }

              cells.push(
                  <div 
                    key={`${x}-${y}`} 
                    onClick={() => handleGridClick(x, y)}
                    // Removed aspect-ratio: 1/1 here because the container is now pixel-perfectly sized
                    // and grid-template-columns will handle the square shape naturally.
                    className={`border ${borderClass} ${bgClass} flex items-center justify-center relative cursor-pointer hover:border-stone-500 hover:bg-stone-800 transition-colors`} 
                    style={{ width: '100%', height: '100%' }}
                  >
                      <div className="absolute inset-0 flex items-center justify-center">{content}</div>
                  </div>
              );
          }
      }
      return cells;
  };

  const moveSpeed = MOVEMENT_SPEEDS[character.majorRealm] || 500;
  // Calculate Player Relative Position for Overlay
  const playerRelX = playerPosition.x - startX;
  const playerRelY = playerPosition.y - startY;
  const isPlayerVisible = playerRelX >= 0 && playerRelX < drawW && playerRelY >= 0 && playerRelY < drawH;

  if (isBattling) {
      return (
          <div className="h-full flex flex-col p-6 items-center justify-center relative overflow-hidden bg-black">
               <div className="absolute inset-0 bg-red-900/10 animate-pulse z-0"></div>
               <div className="relative z-10 w-full max-w-2xl bg-stone-900 border border-red-900 rounded-xl p-6 shadow-2xl flex flex-col h-[80vh]">
                   <div className="flex justify-between items-center mb-4 border-b border-red-900/50 pb-4">
                       <h2 className={`text-2xl font-bold flex items-center gap-2 ${currentEnemy?.rank === EnemyRank.Boss ? 'text-red-500 uppercase tracking-widest' : 'text-stone-300'}`}>
                           <Skull /> {currentEnemy?.rank === EnemyRank.Boss ? '守關妖王' : '遭遇強敵'}：{currentEnemy?.name}
                       </h2>
                       <div className="text-stone-500 text-sm">Lv.{currentEnemy?.realm}</div>
                   </div>
                   <div className="flex-1 overflow-y-auto space-y-2 font-mono text-sm p-4 bg-black/30 rounded inner-shadow custom-scrollbar">
                       {battleLogs.map((log, i) => (
                           <div key={i} className={log.isPlayer ? "text-blue-300" : "text-red-300"}>{log.message}</div>
                       ))}
                   </div>
                   {lastBattleResult && (
                       <div className="mt-4 flex justify-center">
                           <button onClick={() => dispatch(closeBattleReport())} className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-lg">
                               {lastBattleResult === 'won' ? '戰鬥勝利' : '戰鬥失敗'}
                           </button>
                       </div>
                   )}
               </div>
          </div>
      );
  }

  if (showIntro && mapData) {
      return (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 cursor-pointer text-center" onClick={finishIntro}>
              <h1 className="text-4xl md:text-6xl font-bold text-stone-200 mb-8 tracking-[0.5em] border-y-2 border-stone-800 py-4 animate-fade-in">{mapData.name}</h1>
              <p className="text-lg md:text-xl text-stone-400 font-serif leading-loose max-w-2xl fade-in-text">{mapData.introText}</p>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden select-none">
        
        {/* Top Right Mini-Map */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
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
            <div className="text-stone-400 text-xs bg-black/50 px-2 py-1 rounded backdrop-blur border border-stone-800 font-bold tracking-wider">{mapData?.name}</div>
        </div>

        {/* Main Grid Render - FILLS AVAILABLE SPACE */}
        <div 
            ref={containerRef}
            className="flex-1 flex items-center justify-center bg-stone-950/80 relative overflow-hidden p-1 md:p-4"
        >
            {/* The Grid itself - Now constrained by exact pixels calculated from containerRef */}
            <div 
              className="relative shadow-2xl bg-black transition-none ease-out overflow-hidden" 
              style={{ 
                 width: finalPixelWidth, 
                 height: finalPixelHeight,
                 margin: '0 auto',
                 border: '1px solid #44403c',
                 lineHeight: 0, 
                 fontSize: 0,   
              }}
            >
                {/* Background Layer */}
                <div 
                    ref={gridRef}
                    className="grid gap-0 w-full h-full will-change-transform"
                    style={{ 
                        gridTemplateColumns: `repeat(${drawW}, 1fr)`, 
                        // gridTemplateRows will be implicit based on children, but since height is fixed, 1fr works automatically
                        gridTemplateRows: `repeat(${drawH}, 1fr)` 
                    }}
                >
                    {renderCells()}
                </div>

                {/* Player Overlay - Sibling Layer */}
                {isPlayerVisible && (
                  <div 
                    className="absolute z-30 pointer-events-none flex items-center justify-center will-change-[top,left]"
                    style={{
                        left: `${(playerRelX / drawW) * 100}%`,
                        top: `${(playerRelY / drawH) * 100}%`,
                        width: `${100 / drawW}%`,
                        height: `${100 / drawH}%`,
                        // Use linear easing and match duration to game tick for continuous feel
                        transition: `left ${moveSpeed}ms linear, top ${moveSpeed}ms linear`
                    }}
                  >
                     <div className="w-3 h-3 md:w-5 md:h-5 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse border-2 border-green-300"></div>
                  </div>
                )}
            </div>
        </div>

        {/* Control Pad */}
        <div className="p-3 md:p-4 bg-stone-900 border-t border-stone-800 flex justify-between items-center z-10 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] md:text-xs text-stone-500 space-y-1 font-mono">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> <span>吾身</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> <span>精英</span></div>
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> <span>妖王</span></div>
            </div>
            
            <div className="grid grid-cols-3 gap-1 md:gap-2 scale-90 md:scale-100 origin-right">
                <div></div>
                <button className="w-10 h-10 md:w-12 md:h-12 bg-stone-800 rounded flex items-center justify-center border border-stone-700 active:bg-stone-700 hover:border-stone-500 transition-colors shadow" onClick={() => { setAutoMovePath([]); dispatch(movePlayer({ dx: 0, dy: -1 })); }}><ArrowUp size={20}/></button>
                <div></div>
                <button className="w-10 h-10 md:w-12 md:h-12 bg-stone-800 rounded flex items-center justify-center border border-stone-700 active:bg-stone-700 hover:border-stone-500 transition-colors shadow" onClick={() => { setAutoMovePath([]); dispatch(movePlayer({ dx: -1, dy: 0 })); }}><ArrowLeft size={20}/></button>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-stone-900 rounded flex items-center justify-center border border-stone-800"><Footprints size={18} className="text-stone-600" /></div>
                <button className="w-10 h-10 md:w-12 md:h-12 bg-stone-800 rounded flex items-center justify-center border border-stone-700 active:bg-stone-700 hover:border-stone-500 transition-colors shadow" onClick={() => { setAutoMovePath([]); dispatch(movePlayer({ dx: 1, dy: 0 })); }}><ArrowRight size={20}/></button>
                <div></div>
                <button className="w-10 h-10 md:w-12 md:h-12 bg-stone-800 rounded flex items-center justify-center border border-stone-700 active:bg-stone-700 hover:border-stone-500 transition-colors shadow" onClick={() => { setAutoMovePath([]); dispatch(movePlayer({ dx: 0, dy: 1 })); }}><ArrowDown size={20}/></button>
                <div></div>
            </div>
        </div>

        {/* Portal Modal */}
        {portalModal && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-stone-900 border border-blue-500/50 p-4 rounded-xl shadow-2xl z-50 w-64 text-center animate-fade-in">
                <h3 className="text-blue-400 font-bold mb-2 flex items-center justify-center gap-2"><Navigation size={16} /> 傳送陣</h3>
                <p className="text-sm text-stone-300 mb-4">{portalModal.label}</p>
                <div className="flex gap-2">
                    <button onClick={() => {
                            const targetMap = MAPS.find(m => m.id === portalModal.targetMapId);
                            if (targetMap && character.majorRealm < targetMap.minRealm) {
                                dispatch(addLog({ message: "修為不足，無法傳送！", type: 'danger' }));
                                return;
                            }
                            dispatch(enterMap({ mapId: portalModal.targetMapId, startX: portalModal.targetX, startY: portalModal.targetY }));
                            setPortalModal(null);
                        }} className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-2 rounded">前往</button>
                    <button onClick={() => { 
                        // Just close modal, let player move freely
                        setPortalModal(null); 
                    }} className="flex-1 bg-stone-800 text-stone-400 py-2 rounded">離開</button>
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
                                 const targetX = Math.floor((x / rect.width) * mapData.width);
                                 const targetY = Math.floor((y / rect.height) * mapData.height);
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
                                        m.rank === EnemyRank.Boss ? "w-2 h-2 md:w-3 md:h-3 bg-red-600 border border-red-400" : m.rank === EnemyRank.Elite ? "w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500" : "w-1 h-1 bg-red-400/70"
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
