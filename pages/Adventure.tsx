
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { MAPS } from '../data/maps';
import { ITEMS } from '../data/items';
import { QUESTS } from '../data/quests';
import { enterMap, movePlayer, tickMonsters, applyWorldDamageToMonster, resolveBattle, closeBattleReport, cancelBattle, markMapVisited, addVisualEffect } from '../store/slices/adventureSlice';
import { runAutoBattle, calculatePlayerStats, resolvePlayerWorldStrike, resolveEnemyWorldStrike, getResolvedSkillCooldownSeconds } from '../utils/battleSystem';
import { addItem } from '../store/slices/inventorySlice';
import { addLog } from '../store/slices/logSlice';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Skull, Footprints, Navigation, Map as MapIcon, X, Lock, Globe, Target, MapPin, Info, Users, Move, Swords, Flame, Droplets, Shield, ShieldOff, Zap, Snowflake, Sparkles } from 'lucide-react';
import { parseBattleLog } from '../utils/logParser';
import { EnemyRank, Coordinate, MapData, MajorRealm, ElementType, ItemCategory, NPC, NPCType, ProfessionType, ActiveMonster } from '../types';
import { MOVEMENT_SPEEDS, REALM_NAMES, ELEMENT_COLORS, ELEMENT_NAMES } from '../constants';
import clsx from 'clsx';
import { Modal } from '../components/Modal';
import { getDropRewards } from '@/data/drop_tables';
import { addSpiritStones, gainExperience, setProfession } from '@/store/slices/characterSlice';
import { formatSpiritStone } from '@/utils/currency';
import AdventureStage from '../components/adventure/AdventureStage';
import ShopPanel from '../components/adventure/ShopPanel';
import { QuestModal } from '../components/adventure/QuestModal';
import { GameHintBubble } from '../components/game/GameHintBubble';
import { GameSection } from '../components/game/GameSection';
import { GameTooltip } from '../components/game/GameTooltip';
import { SHOPS } from '../data/shops';
import { getEnemyEngagementRange, getGridDistance, getPlayerEngagementRange, getWorldSkillAreaTargets } from '../utils/worldCombat';
import { getLearnedSkillEngagementRange } from '../utils/skillRealtime';
import { getFormalSkillByName, normalizeLearnedSkills } from '../data/skills';
import { generateDrops } from '../utils/dropSystem';


// --- VISUAL CONFIG ---
const TARGET_CELL_SIZE_DESKTOP = 42; // px
const TARGET_CELL_SIZE_MOBILE = 34; // px
const GRID_SCALE_X = 140; 
const GRID_SCALE_Y = 120; 
const NODE_WIDTH = 100;
const NODE_HEIGHT = 70;

const STATUS_META: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    className: string;
  }
> = {
  燃燒: { label: '燃燒', icon: Flame, className: 'border-orange-700 bg-orange-950/60 text-orange-300' },
  中毒: { label: '中毒', icon: Droplets, className: 'border-emerald-700 bg-emerald-950/60 text-emerald-300' },
  流血: { label: '流血', icon: Droplets, className: 'border-rose-700 bg-rose-950/60 text-rose-300' },
  護盾: { label: '護盾', icon: Shield, className: 'border-cyan-700 bg-cyan-950/60 text-cyan-300' },
  元素護盾: { label: '元素護盾', icon: Shield, className: 'border-sky-700 bg-sky-950/60 text-sky-300' },
  破甲: { label: '破甲', icon: ShieldOff, className: 'border-amber-700 bg-amber-950/60 text-amber-300' },
  暈眩: { label: '暈眩', icon: Zap, className: 'border-violet-700 bg-violet-950/60 text-violet-300' },
  凍結: { label: '凍結', icon: Snowflake, className: 'border-blue-700 bg-blue-950/60 text-blue-300' },
  麻痺: { label: '麻痺', icon: Zap, className: 'border-yellow-700 bg-yellow-950/60 text-yellow-300' },
  反震: { label: '反震', icon: Sparkles, className: 'border-fuchsia-700 bg-fuchsia-950/60 text-fuchsia-300' },
  放逐: { label: '放逐', icon: Sparkles, className: 'border-indigo-700 bg-indigo-950/60 text-indigo-300' },
  神國侵蝕: { label: '神國侵蝕', icon: Sparkles, className: 'border-red-700 bg-red-950/60 text-red-300' },
};

const renderStatusBadges = (statuses: string[] = []) => {
  if (statuses.length === 0) {
    return <div className="text-[11px] text-stone-600">無特殊狀態</div>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((status) => {
        const meta = STATUS_META[status] ?? {
          label: status,
          icon: Info,
          className: 'border-stone-700 bg-stone-900 text-stone-300',
        };
        const Icon = meta.icon;
        return (
          <span
            key={status}
            className={clsx(
              'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold',
              meta.className
            )}
          >
            <Icon size={12} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
};

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

    const getPos = (map: MapData) => {
        return {
            x: centerX + (map.worldX * GRID_SCALE_X),
            y: centerY - (map.worldY * GRID_SCALE_Y) // Invert Y for screen coords
        };
    };

    useEffect(() => {
        if (scrollContainerRef.current) {
            let targetX = centerX;
            let targetY = centerY;

            const currentMap = MAPS.find(m => m.id === currentMapId);
            if (currentMap) {
                const pos = getPos(currentMap);
                targetX = pos.x;
                targetY = pos.y;
            }

            const startY = targetY - (scrollContainerRef.current.clientHeight / 2);
            const startX = targetX - (scrollContainerRef.current.clientWidth / 2);
            scrollContainerRef.current.scrollTop = startY;
            scrollContainerRef.current.scrollLeft = startX;
        }
    }, []);

    const getSmartConnection = (sourceMap: MapData, targetMap: MapData, explicitDir?: string) => {
        const sourcePos = getPos(sourceMap);
        const targetPos = getPos(targetMap);
        
        const halfW = NODE_WIDTH / 2;
        const halfH = NODE_HEIGHT / 2;
        
        let x1 = sourcePos.x;
        let y1 = sourcePos.y;
        let x2 = targetPos.x;
        let y2 = targetPos.y;

        // Determine Start Point based on Explicit Direction
        if (explicitDir === "North") { y1 -= halfH; }
        else if (explicitDir === "South") { y1 += halfH; }
        else if (explicitDir === "West") { x1 -= halfW; }
        else if (explicitDir === "East") { x1 += halfW; }
        else if (explicitDir === "NorthWest") { x1 -= halfW; y1 -= halfH; }
        else if (explicitDir === "NorthEast") { x1 += halfW; y1 -= halfH; }
        else if (explicitDir === "SouthWest") { x1 -= halfW; y1 += halfH; }
        else if (explicitDir === "SouthEast") { x1 += halfW; y1 += halfH; }
        else {
            // Default heuristic if no dir (or for Target end if we don't look up reciprocal yet)
            const dx = targetPos.x - sourcePos.x;
            const dy = targetPos.y - sourcePos.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                x1 = dx > 0 ? sourcePos.x + halfW : sourcePos.x - halfW;
            } else {
                y1 = dy > 0 ? sourcePos.y + halfH : sourcePos.y - halfH;
            }
        }

        // Determine End Point (Simple nearest edge heuristic)
        // Ideally we would look up the reciprocal portal, but nearest edge works for visual lines
        const dx = x2 - x1;
        const dy = y2 - y1;
        if (Math.abs(dx) > Math.abs(dy)) {
             x2 = dx > 0 ? targetPos.x - halfW : targetPos.x + halfW;
        } else {
             y2 = dy > 0 ? targetPos.y - halfH : targetPos.y + halfH;
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
                    
                    // Find the specific portal to get direction
                    const portal = map.portals.find(p => p.targetMapId === targetId);
                    const portalDir = portal?.dir;

                    const { x1, y1, x2, y2 } = getSmartConnection(map, targetMap, portalDir);

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
                    <GameTooltip
                        eyebrow="REGION INTEL"
                        title={map.name}
                        footer={`${REALM_NAMES[map.minRealm]} · 區域地圖情報`}
                        widthClassName="w-80 max-w-[calc(100vw-2rem)]"
                        className="animate-fade-in"
                        style={{ left: 16, top: 16 }}
                    >
                        <p className="text-sm text-stone-400 font-serif leading-relaxed line-clamp-3">
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
                    </GameTooltip>
                );
            })()}
        </div>
    );
};

interface AdventureProps {
  isInputBlocked?: boolean;
}

export const Adventure: React.FC<AdventureProps> = ({
  isInputBlocked = false,
}) => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const { attributes, majorRealm, spiritRootId, isInitialized, profession } = character;
  const { equipmentStats } = useSelector((state: RootState) => state.inventory);
  const { 
    currentMapId, playerPosition, activeMonsters, visitedCells, 
    mapHistory, isBattling, currentEnemy, currentEnemyInstanceId, battleLogs, lastBattleResult 
  } = useSelector((state: RootState) => state.adventure);
  const { activeQuests, completedQuests } = useSelector((state: RootState) => state.quest);
  
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

  // Cancel Battle on Unmount (Tab Switch)
  useEffect(() => {
    return () => {
        worldActionTimersRef.current.forEach((timer) => clearTimeout(timer));
        worldActionTimersRef.current.clear();
        battleReplayTimersRef.current.forEach((timer) => clearTimeout(timer));
        battleReplayTimersRef.current.clear();
        dispatch(cancelBattle());
    };
  }, [dispatch]);
  
  // Auto-Repair Profession State (Fix for existing users)
  useEffect(() => {
    if (profession === ProfessionType.None) {
        if (completedQuests.includes('sect_sword_join')) dispatch(setProfession(ProfessionType.Sword));
        else if (completedQuests.includes('sect_beast_join')) dispatch(setProfession(ProfessionType.Body));
        else if (completedQuests.includes('sect_mystic_join')) dispatch(setProfession(ProfessionType.Mage));
    }
  }, [profession, completedQuests, dispatch]);
  
  // Expanded Map State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTab, setMapTab] = useState<'area' | 'world'>('area');

  // Auto-Movement State
  const [autoMovePath, setAutoMovePath] = useState<Coordinate[]>([]);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [targetMonsterId, setTargetMonsterId] = useState<string | null>(null);
  const [isAutoBattling, setIsAutoBattling] = useState(false);
  const [worldPlayerHp, setWorldPlayerHp] = useState(0);
  const [worldPlayerShield, setWorldPlayerShield] = useState(0);
  const [worldCombatTargetId, setWorldCombatTargetId] = useState<string | null>(null);
  const [worldCombatTargetStatuses, setWorldCombatTargetStatuses] = useState<string[]>([]);
  const [worldCombatPlayerStatuses, setWorldCombatPlayerStatuses] = useState<string[]>([]);
  const [worldLastCombatMessage, setWorldLastCombatMessage] = useState<string | null>(null);
  const [playerActionReadyAt, setPlayerActionReadyAt] = useState(0);
  const [playerSkillReadyAt, setPlayerSkillReadyAt] = useState(0);
  const [enemyActionReadyAtById, setEnemyActionReadyAtById] = useState<Record<string, number>>({});
  const [enemySpecialReadyAtById, setEnemySpecialReadyAtById] = useState<Record<string, number>>({});
  const worldActionTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const battleReplayTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  
  // NPC Interaction State
  const [interactingNPC, setInteractingNPC] = useState<NPC | null>(null);
  const [targetNPCId, setTargetNPCId] = useState<string | null>(null);
  
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
  const currentTimestamp = Date.now();
  const playerStats = calculatePlayerStats(
    attributes,
    majorRealm,
    spiritRootId,
    equipmentStats,
    character.name,
    profession,
    character.skills
  );
  const playerEngagementRange = Math.max(
    getPlayerEngagementRange(profession),
    getLearnedSkillEngagementRange(profession, character.skills)
  );
  const latestBattleLog = displayedLogs.length > 0 ? displayedLogs[displayedLogs.length - 1] : null;
  const targetedMonster = targetMonsterId
    ? activeMonsters.find((monster) => monster.instanceId === targetMonsterId) ?? null
    : null;
  const targetedMonsterTemplate = targetedMonster
    ? mapData?.enemies.find((enemy) => enemy.id === targetedMonster.templateId) ?? null
    : null;
  const targetDistance = targetedMonster
    ? getGridDistance(playerPosition, targetedMonster)
    : null;
  const primaryActiveSkill = profession !== ProfessionType.None
    ? normalizeLearnedSkills(character.skills)
        .find((skill) => skill.type === 'Active' && skill.profession === profession)
    : undefined;
  const canEngageTarget =
    Boolean(targetedMonster) &&
    targetDistance !== null &&
    targetDistance <= playerEngagementRange &&
    !isBattling &&
    !showIntro;

  useEffect(() => {
    setWorldPlayerHp(playerStats.maxHp);
    setWorldPlayerShield(0);
    setWorldCombatTargetId(null);
    setWorldCombatTargetStatuses([]);
    setWorldCombatPlayerStatuses([]);
    setWorldLastCombatMessage(null);
    setPlayerActionReadyAt(0);
    setPlayerSkillReadyAt(0);
    setEnemyActionReadyAtById({});
    setEnemySpecialReadyAtById({});
  }, [currentMapId, playerStats.maxHp]);

  useEffect(() => {
    if (worldPlayerHp > playerStats.maxHp) {
      setWorldPlayerHp(playerStats.maxHp);
    }
  }, [worldPlayerHp, playerStats.maxHp]);

  useEffect(() => {
    if (worldCombatTargetId && !activeMonsters.some((monster) => monster.instanceId === worldCombatTargetId)) {
      worldActionTimersRef.current.forEach((timer) => clearTimeout(timer));
      worldActionTimersRef.current.clear();
      setWorldCombatTargetId(null);
      setWorldCombatTargetStatuses([]);
      setWorldCombatPlayerStatuses([]);
      setWorldLastCombatMessage(null);
      setEnemyActionReadyAtById({});
      setEnemySpecialReadyAtById({});
    }
  }, [activeMonsters, worldCombatTargetId]);

  const resetWorldCombatState = () => {
    worldActionTimersRef.current.forEach((timer) => clearTimeout(timer));
    worldActionTimersRef.current.clear();
    setWorldCombatTargetId(null);
    setWorldCombatTargetStatuses([]);
    setWorldCombatPlayerStatuses([]);
    setWorldLastCombatMessage(null);
    setWorldPlayerShield(0);
    setPlayerActionReadyAt(0);
    setPlayerSkillReadyAt(0);
    setEnemyActionReadyAtById({});
    setEnemySpecialReadyAtById({});
  };

  const clearWorldEncounterState = () => {
    worldActionTimersRef.current.forEach((timer) => clearTimeout(timer));
    worldActionTimersRef.current.clear();
    setWorldCombatTargetId(null);
    setWorldCombatTargetStatuses([]);
    setWorldCombatPlayerStatuses([]);
    setWorldLastCombatMessage(null);
    setEnemyActionReadyAtById({});
    setEnemySpecialReadyAtById({});
  };

  const scheduleTimedCombatAction = ({
    delayMs,
    execute,
    timerSet,
  }: {
    delayMs: number | undefined;
    execute: () => void;
    timerSet?: Set<ReturnType<typeof setTimeout>>;
  }) => {
    if ((delayMs ?? 0) > 0) {
      const timer = setTimeout(() => {
        timerSet?.delete(timer);
        execute();
      }, delayMs);
      timerSet?.add(timer);
      return timer;
    }

    execute();
  };

  const queueTimedCombatPlan = ({
    delayMs,
    timerSet,
    onQueue,
    execute,
  }: {
    delayMs: number | undefined;
    timerSet?: Set<ReturnType<typeof setTimeout>>;
    onQueue?: () => void;
    execute: () => void;
  }) => {
    onQueue?.();
    return scheduleTimedCombatAction({
      delayMs,
      execute,
      timerSet,
    });
  };

  const queueWorldStrikePlan = ({
    delayMs,
    applyCastEffect,
    applyPreview,
    execute,
  }: {
    delayMs: number | undefined;
    applyCastEffect?: () => void;
    applyPreview: () => void;
    execute: () => void;
  }) => {
    queueTimedCombatPlan({
      delayMs,
      timerSet: worldActionTimersRef.current,
      onQueue: () => {
        applyCastEffect?.();
        applyPreview();
      },
      execute,
    });
  };

  const createResolvedWorldStrikePlan = ({
    delayMs,
    applyCastEffect,
    applyPreview,
    execute,
  }: {
    delayMs: number | undefined;
    applyCastEffect?: () => void;
    applyPreview: () => void;
    execute: () => void;
  }) => ({
    delayMs,
    applyCastEffect,
    applyPreview,
    execute,
  });

  const createPlayerWorldStrikePlan = ({
    now,
    strike,
    chosenSkill,
    targetedMonster,
  }: {
    now: number;
    strike: ReturnType<typeof resolvePlayerWorldStrike>;
    chosenSkill?: typeof primaryActiveSkill;
    targetedMonster: {
      instanceId: string;
      templateId: string;
      name: string;
      x: number;
      y: number;
      currentHp: number;
    };
  }) =>
    createResolvedWorldStrikePlan({
      delayMs: strike.executionTimeMs,
      applyCastEffect: () => dispatchPlayerWorldStrikeCastEffect({ chosenSkill, strike }),
      applyPreview: () => {
        setWorldCombatTargetId(targetedMonster.instanceId);
        applyPlayerWorldStrikePreview({
          now,
          strike,
          chosenSkill,
          targetName: targetedMonster.name,
        });
      },
      execute: () =>
        executePlayerWorldStrike({
          strike,
          chosenSkill,
          targetedMonster,
          activeMonsters,
          mapEnemies: mapData?.enemies,
        }),
    });

  const createEnemyWorldStrikePlan = ({
    now,
    enemyInstanceId,
    enemyTemplate,
    strike,
    canUseSpecial,
  }: {
    now: number;
    enemyInstanceId: string;
    enemyTemplate: NonNullable<typeof targetedMonsterTemplate>;
    strike: ReturnType<typeof resolveEnemyWorldStrike>;
    canUseSpecial: boolean;
  }) =>
    createResolvedWorldStrikePlan({
      delayMs: strike.executionTimeMs,
      applyCastEffect: () => dispatchEnemyWorldStrikeCastEffect({ strike }),
      applyPreview: () =>
        applyEnemyWorldStrikePreview({
          now,
          enemyInstanceId,
          enemyName: enemyTemplate.name,
          strike,
          canUseSpecial,
        }),
      execute: () => executeEnemyWorldStrike({ strike, enemyTemplate }),
    });

  const performResolvedTimedWorldAction = <TStrike,>({
    readyAt,
    canExecute,
    resolveStrike,
    createPlan,
  }: {
    readyAt?: number;
    canExecute?: () => boolean;
    resolveStrike: (now: number) => TStrike | undefined;
    createPlan: (now: number, strike: TStrike) => ReturnType<typeof createResolvedWorldStrikePlan>;
  }) =>
    performTimedWorldAction({
      readyAt,
      canExecute,
      execute: (now) => {
        const resolved = resolveStrike(now);
        if (!resolved) return;
        queueWorldStrikePlan(createPlan(now, resolved));
      },
    });

  const getPlayerWorldStrikePreviewMessage = (
    targetName: string,
    chosenSkill?: typeof primaryActiveSkill
  ) =>
    chosenSkill
      ? `你開始施展【${chosenSkill.name}】。`
      : `你朝 ${targetName} 發動攻擊。`;

  const getEnemyWorldStrikePreviewMessage = (
    enemyName: string,
    strike: ReturnType<typeof resolveEnemyWorldStrike>
  ) =>
    strike.skillName
      ? `${enemyName} 正在施展【${strike.skillName}】。`
      : `${enemyName} 朝你撲殺而來。`;

  const getPlayerWorldStrikeResolutionMessage = ({
    chosenSkill,
    targetName,
    damage,
    impactedTargetCount,
  }: {
    chosenSkill?: typeof primaryActiveSkill;
    targetName: string;
    damage: number;
    impactedTargetCount: number;
  }) =>
    chosenSkill
      ? `你施展【${chosenSkill.name}】造成 ${damage} 點傷害${
          impactedTargetCount > 1 ? `，波及 ${impactedTargetCount} 個目標` : ""
        }。`
      : `你對 ${targetName} 造成 ${damage} 點傷害。`;

  const getEnemyWorldStrikeResolutionMessage = ({
    enemyName,
    skillName,
    damage,
  }: {
    enemyName: string;
    skillName?: string;
    damage: number;
  }) =>
    skillName
      ? `${enemyName} 施展【${skillName}】對你造成 ${damage} 點傷害。`
      : `${enemyName} 對你造成 ${damage} 點傷害。`;

  const resolveWorldShieldedDamage = ({
    incomingDamage,
    currentShield,
  }: {
    incomingDamage: number;
    currentShield: number;
  }) => {
    const absorbed = Math.min(currentShield, incomingDamage);
    return {
      absorbed,
      damageTaken: incomingDamage - absorbed,
      remainingShield: Math.max(0, currentShield - absorbed),
    };
  };

  const dispatchWorldStrikeProjectileEffect = ({
    color,
    colorInt,
    sourceX,
    sourceY,
    targetX,
    targetY,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    durationMs: number;
  }) => {
    dispatch(addVisualEffect({
      type: 'projectile',
      text: '',
      color,
      x: sourceX,
      y: sourceY,
      targetX,
      targetY,
      colorInt,
      durationMs,
    }));
  };

  const dispatchWorldStrikeAreaEffect = ({
    color,
    colorInt,
    targetX,
    targetY,
    radius,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs: number;
  }) => {
    dispatch(addVisualEffect({
      type: 'area',
      text: '',
      color,
      targetX,
      targetY,
      radius,
      colorInt,
      durationMs,
    }));
  };

  const dispatchWorldStrikeImpactEffect = ({
    color,
    colorInt,
    targetX,
    targetY,
    radius,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs: number;
  }) => {
    dispatch(addVisualEffect({
      type: 'impact',
      text: '',
      color,
      targetX,
      targetY,
      radius,
      colorInt,
      durationMs,
    }));
  };

  const dispatchWorldStrikeTextEffect = ({
    text,
    color,
    colorInt,
    x,
    y,
    durationMs = 1200,
  }: {
    text: string;
    color: string;
    colorInt: number;
    x: number;
    y: number;
    durationMs?: number;
  }) => {
    dispatch(addVisualEffect({
      type: 'text',
      text,
      color,
      x,
      y,
      colorInt,
      durationMs,
    }));
  };

  type WorldStrikeImpactPlan = {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    damageText: string;
    damageTextColor: string;
    damageTextColorInt: number;
  };

  type WorldStrikeVisualPlan = {
    projectile?: {
      color: string;
      colorInt: number;
      sourceX: number;
      sourceY: number;
      targetX: number;
      targetY: number;
      durationMs: number;
    };
    area?: {
      color: string;
      colorInt: number;
      targetX: number;
      targetY: number;
      radius: number;
      durationMs: number;
    };
    impact?: WorldStrikeImpactPlan;
  };

  const dispatchWorldStrikeCastEffect = ({
    color,
    colorInt,
    targetX,
    targetY,
    durationMs,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    durationMs: number;
  }) => {
    dispatch(addVisualEffect({
      type: 'cast',
      text: '',
      color,
      colorInt,
      targetX,
      targetY,
      radius: 0.7,
      durationMs,
    }));
  };

  const dispatchPlayerWorldStrikeCastEffect = ({
    chosenSkill,
    strike,
  }: {
    chosenSkill?: typeof primaryActiveSkill;
    strike: ReturnType<typeof resolvePlayerWorldStrike>;
  }) => {
    if ((!strike.executionTimeMs && !chosenSkill?.castTimeMs) || !chosenSkill) {
      return;
    }

    dispatchWorldStrikeCastEffect({
      color: chosenSkill.profession === ProfessionType.Mage ? '#60a5fa' : '#f59e0b',
      colorInt: chosenSkill.profession === ProfessionType.Mage ? 0x60a5fa : 0xf59e0b,
      targetX: playerPosition.x,
      targetY: playerPosition.y,
      durationMs: Math.max(180, chosenSkill.castTimeMs ?? 220),
    });
  };

  const dispatchEnemyWorldStrikeCastEffect = ({
    strike,
  }: {
    strike: ReturnType<typeof resolveEnemyWorldStrike>;
  }) => {
    if (!strike.skillName) {
      return;
    }

    dispatchWorldStrikeCastEffect({
      color: '#f87171',
      colorInt: 0xf87171,
      targetX: targetedMonster?.x ?? playerPosition.x,
      targetY: targetedMonster?.y ?? playerPosition.y,
      durationMs: 220,
    });
  };

  const applyWorldStrikeImpactBundle = ({
    color,
    colorInt,
    targetX,
    targetY,
    damageText,
    damageTextColor,
    damageTextColorInt,
    radius,
  }: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    damageText: string;
    damageTextColor: string;
    damageTextColorInt: number;
    radius: number;
  }) => {
    dispatchWorldStrikeImpactEffect({
      color,
      colorInt,
      targetX,
      targetY,
      radius,
      durationMs: 220,
    });
    dispatchWorldStrikeTextEffect({
      text: damageText,
      color: damageTextColor,
      colorInt: damageTextColorInt,
      x: targetX,
      y: targetY,
    });
  };

  const dispatchWorldStrikeVisualPlan = ({
    projectile,
    area,
    impact,
  }: WorldStrikeVisualPlan) => {
    if (projectile) {
      dispatchWorldStrikeProjectileEffect(projectile);
    }

    if (area) {
      dispatchWorldStrikeAreaEffect(area);
    }

    if (impact) {
      applyWorldStrikeImpactBundle(impact);
    }
  };

  const createBattleReplayAttackVisualPlan = ({
    nextLog,
    targetMonster,
    normalizedUsedSkill,
  }: {
    nextLog: NonNullable<typeof replayQueue>[number];
    targetMonster: ActiveMonster | null;
    normalizedUsedSkill?: ReturnType<typeof getFormalSkillByName>;
  }): WorldStrikeVisualPlan => {
    if (normalizedUsedSkill && nextLog.isPlayer && targetMonster) {
      const projectile =
        (normalizedUsedSkill.castRange ?? 1) > 1
          ? {
              color: '#60a5fa',
              colorInt: 0x60a5fa,
              sourceX: playerPosition.x,
              sourceY: playerPosition.y,
              targetX: targetMonster.x,
              targetY: targetMonster.y,
              durationMs: Math.max(220, normalizedUsedSkill.castTimeMs ?? 280),
            }
          : undefined;
      const area =
        normalizedUsedSkill.areaShape &&
        normalizedUsedSkill.areaShape !== 'single' &&
        normalizedUsedSkill.areaShape !== 'self' &&
        (normalizedUsedSkill.areaRadius ?? 0) > 0
          ? {
              color: '#a78bfa',
              colorInt: 0xa78bfa,
              targetX: targetMonster.x,
              targetY: targetMonster.y,
              radius: normalizedUsedSkill.areaRadius,
              durationMs: 520,
            }
          : undefined;

      return {
        projectile,
        area,
      };
    }

    if (!nextLog.isPlayer && (currentEnemy?.attackRange ?? 1) > 1 && targetMonster) {
      return {
        projectile: {
          color: '#fb7185',
          colorInt: 0xfb7185,
          sourceX: targetMonster.x,
          sourceY: targetMonster.y,
          targetX: playerPosition.x,
          targetY: playerPosition.y,
          durationMs: 260,
        },
      };
    }

    return {};
  };

  const createBattleReplayDamageVisualPlan = ({
    nextLog,
    targetMonster,
  }: {
    nextLog: NonNullable<typeof replayQueue>[number];
    targetMonster: ActiveMonster | null;
  }): WorldStrikeVisualPlan => {
    if (!nextLog.damage || nextLog.damage <= 0) {
      return {};
    }

    const impactX = nextLog.isPlayer ? targetMonster?.x : playerPosition.x;
    const impactY = nextLog.isPlayer ? targetMonster?.y : playerPosition.y;

    return {
      impact: {
        color: nextLog.isPlayer ? '#fde68a' : '#fca5a5',
        colorInt: nextLog.isPlayer ? 0xfde68a : 0xfca5a5,
        targetX: impactX,
        targetY: impactY,
        radius: 0.55,
        damageText: `${nextLog.damage}`,
        damageTextColor: nextLog.isPlayer ? '#fbbf24' : '#fb7185',
        damageTextColorInt: nextLog.isPlayer ? 0xfbbf24 : 0xfb7185,
      },
    };
  };

  const dispatchBattleReplayVisuals = ({
    nextLog,
    targetMonster,
    normalizedUsedSkill,
  }: {
    nextLog: NonNullable<typeof replayQueue>[number];
    targetMonster: ActiveMonster | null;
    normalizedUsedSkill?: ReturnType<typeof getFormalSkillByName>;
  }) => {
    dispatchWorldStrikeVisualPlan({
      ...createBattleReplayAttackVisualPlan({
        nextLog,
        targetMonster,
        normalizedUsedSkill,
      }),
      ...createBattleReplayDamageVisualPlan({
        nextLog,
        targetMonster,
      }),
    });
  };

  const createBattleReplayVisualPlan = ({
    nextLog,
    targetMonster,
    normalizedUsedSkill,
  }: {
    nextLog: NonNullable<typeof replayQueue>[number];
    targetMonster: ActiveMonster | null;
    normalizedUsedSkill?: ReturnType<typeof getFormalSkillByName>;
  }) => ({
    nextLog,
    targetMonster,
    normalizedUsedSkill,
  });

  const createBattleReplayContext = (
    nextLog: NonNullable<typeof replayQueue>[number]
  ) => {
    const targetMonster = currentEnemyInstanceId
      ? activeMonsters.find((monster) => monster.instanceId === currentEnemyInstanceId)
      : null;
    const skillMatch = nextLog.message.match(/施展【([^】]+)】/);
    const normalizedUsedSkill = skillMatch
      ? getFormalSkillByName(skillMatch[1])
      : undefined;

    return {
      nextLog,
      targetMonster: targetMonster ?? null,
      normalizedUsedSkill,
    };
  };

  const processBattleReplayStep = ({
    nextLog,
    targetMonster,
    normalizedUsedSkill,
  }: {
    nextLog: NonNullable<typeof replayQueue>[number];
    targetMonster: ActiveMonster | null;
    normalizedUsedSkill?: ReturnType<typeof getFormalSkillByName>;
  }) => {
    setDisplayedLogs((prev) => [...prev, nextLog]);
    setReplayQueue((prev) => prev.slice(1));

    if (nextLog.playerHp !== undefined) {
      setBattleSnapshot((prev) =>
        prev ? { ...prev, playerHp: nextLog.playerHp, enemyHp: nextLog.enemyHp } : null
      );
    }

    const logContainer = document.getElementById('battle-log-container');
    if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;

    dispatchBattleReplayVisuals(
      createBattleReplayVisualPlan({
        nextLog,
        targetMonster,
        normalizedUsedSkill,
      })
    );
  };

  const createBattleReplayStepPlan = (
    nextLog: NonNullable<typeof replayQueue>[number]
  ) => {
    const previousTime = displayedLogs[displayedLogs.length - 1]?.timeMs ?? 0;
    const nextTime = nextLog?.timeMs ?? previousTime + 500;
    const replayDelay = Math.max(180, Math.min(900, nextTime - previousTime || 250));

    return {
      replayDelay,
      ...createBattleReplayContext(nextLog),
    };
  };

  const queueBattleReplayStep = (
    nextLog: NonNullable<typeof replayQueue>[number]
  ) => {
    const { replayDelay, nextLog: replayLog, targetMonster, normalizedUsedSkill } =
      createBattleReplayStepPlan(nextLog);

    return queueTimedCombatPlan({
      delayMs: replayDelay,
      timerSet: battleReplayTimersRef.current,
      execute: () => {
        processBattleReplayStep({
          nextLog: replayLog,
          targetMonster,
          normalizedUsedSkill,
        });
      },
    });
  };

  const executePlayerWorldStrike = ({
    strike,
    chosenSkill,
    targetedMonster,
    activeMonsters,
    mapEnemies,
  }: {
    strike: ReturnType<typeof resolvePlayerWorldStrike>;
    chosenSkill?: typeof primaryActiveSkill;
    targetedMonster: {
      instanceId: string;
      templateId: string;
      name: string;
      x: number;
      y: number;
      currentHp: number;
    };
    activeMonsters: ActiveMonster[];
    mapEnemies: MapData["enemies"] | undefined;
  }) => {
    const strikeColor =
      chosenSkill?.profession === ProfessionType.Mage ? '#60a5fa' : '#f59e0b';
    const strikeColorInt =
      chosenSkill?.profession === ProfessionType.Mage ? 0x60a5fa : 0xf59e0b;
    const impactedMonsters = getWorldSkillAreaTargets({
      origin: playerPosition,
      primaryTarget: { x: targetedMonster.x, y: targetedMonster.y },
      monsters: activeMonsters,
      primaryTargetId: targetedMonster.instanceId,
      areaShape: strike.areaShape,
      areaRadius: strike.areaRadius,
      maxTargets: strike.maxTargets,
    });

    impactedMonsters.forEach((monster, index) => {
      if (strike.damage <= 0) return;

      dispatch(applyWorldDamageToMonster({
        monsterInstanceId: monster.instanceId,
        damage: strike.damage,
      }));

      dispatchWorldStrikeVisualPlan({
        impact: {
          color: strikeColor,
          colorInt: strikeColorInt,
          targetX: monster.x,
          targetY: monster.y,
          radius: strike.areaShape && strike.areaShape !== 'single' ? 0.8 : 0.45,
          damageText: `${index === 0 && strike.isCrit ? '暴擊 ' : ''}${strike.damage}`,
          damageTextColor: index === 0 && strike.isCrit ? '#facc15' : '#ffffff',
          damageTextColorInt: index === 0 && strike.isCrit ? 0xfacc15 : 0xffffff,
        },
      });
    });

    dispatchWorldStrikeVisualPlan({
      projectile: strike.isProjectile
        ? {
            color: strikeColor,
            colorInt: strikeColorInt,
            sourceX: playerPosition.x,
            sourceY: playerPosition.y,
            targetX: targetedMonster.x,
            targetY: targetedMonster.y,
            durationMs: Math.max(240, strike.executionTimeMs || 360),
          }
        : undefined,
      area:
        strike.areaShape && strike.areaShape !== 'single' && strike.areaShape !== 'self'
          ? {
              color: strikeColor,
              colorInt: strikeColorInt,
              targetX: targetedMonster.x,
              targetY: targetedMonster.y,
              radius: Math.max(0.8, strike.areaRadius ?? 1),
              durationMs: 420,
            }
          : undefined,
    });

    setWorldLastCombatMessage(
      getPlayerWorldStrikeResolutionMessage({
        chosenSkill,
        targetName: targetedMonster.name,
        damage: strike.damage,
        impactedTargetCount: impactedMonsters.length,
      })
    );

    let primaryDefeated = false;
    impactedMonsters.forEach((monster) => {
      const remainingHp = Math.max(0, monster.currentHp - strike.damage);
      if (remainingHp > 0) return;

      const monsterTemplate = mapEnemies?.find((enemy) => enemy.id === monster.templateId);
      if (!monsterTemplate) return;

      grantMonsterRewards(monsterTemplate);
      recoverAfterWorldKill();
      dispatch(addLog({
        message: `你擊敗了 ${monster.name}。`,
        type: 'success',
      }));
      if (monster.instanceId === targetedMonster.instanceId) {
        primaryDefeated = true;
      }
    });

    if (primaryDefeated) {
      setTargetMonsterId(null);
      clearWorldEncounterState();
    }
  };

  const executeEnemyWorldStrike = ({
    strike,
    enemyTemplate,
  }: {
    strike: ReturnType<typeof resolveEnemyWorldStrike>;
    enemyTemplate: NonNullable<typeof targetedMonsterTemplate>;
  }) => {
    const shieldResolution = resolveWorldShieldedDamage({
      incomingDamage: strike.damage,
      currentShield: worldPlayerShield,
    });
    const incomingDamage = shieldResolution.damageTaken;
    const absorbed = shieldResolution.absorbed;
    if (absorbed > 0) {
      setWorldPlayerShield(shieldResolution.remainingShield);
    }

    const nextHp = Math.max(0, worldPlayerHp - incomingDamage);
    setWorldPlayerHp(nextHp);
    setWorldCombatPlayerStatuses((prev) =>
      Array.from(new Set([...prev, ...strike.statusNames]))
    );
    setWorldLastCombatMessage(
      getEnemyWorldStrikeResolutionMessage({
        enemyName: enemyTemplate.name,
        skillName: strike.skillName,
        damage: incomingDamage,
      })
    );

    dispatchWorldStrikeVisualPlan({
      projectile: strike.isProjectile
        ? {
            color: '#f87171',
            colorInt: 0xf87171,
            sourceX: targetedMonster?.x ?? enemyTemplate.attackRange ?? 0,
            sourceY: targetedMonster?.y ?? playerPosition.y,
            targetX: playerPosition.x,
            targetY: playerPosition.y,
            durationMs: Math.max(240, strike.executionTimeMs || 320),
          }
        : undefined,
      area:
        strike.areaShape && strike.areaShape !== 'single' && strike.areaShape !== 'self'
          ? {
              color: '#f87171',
              colorInt: 0xf87171,
              targetX: playerPosition.x,
              targetY: playerPosition.y,
              radius: Math.max(0.8, strike.areaRadius ?? 1),
              durationMs: 360,
            }
          : undefined,
      impact: {
        color: '#f87171',
        colorInt: 0xf87171,
        targetX: playerPosition.x,
        targetY: playerPosition.y,
        radius: 0.45,
        damageText: absorbed > 0 ? `-${incomingDamage} / 格擋 ${absorbed}` : `-${incomingDamage}`,
        damageTextColor: absorbed > 0 ? '#67e8f9' : '#fca5a5',
        damageTextColorInt: absorbed > 0 ? 0x67e8f9 : 0xfca5a5,
      },
    });

    if (nextHp <= 0) {
      handleWorldPlayerDefeat();
    }
  };

  const applyPlayerWorldStrikePreview = ({
    now,
    strike,
    chosenSkill,
    targetName,
  }: {
    now: number;
    strike: ReturnType<typeof resolvePlayerWorldStrike>;
    chosenSkill?: typeof primaryActiveSkill;
    targetName: string;
  }) => {
    setWorldCombatTargetStatuses(strike.enemyStatusNames);
    setWorldCombatPlayerStatuses(strike.playerStatusNames);
    setWorldPlayerShield((prev) => prev + strike.playerShieldGain);
    setWorldLastCombatMessage(getPlayerWorldStrikePreviewMessage(targetName, chosenSkill));
    setPlayerActionReadyAt(now + strike.nextActionDelayMs);
    if (chosenSkill) {
      setPlayerSkillReadyAt(now + strike.skillCooldownMs);
    }
  };

  const applyEnemyWorldStrikePreview = ({
    now,
    enemyInstanceId,
    enemyName,
    strike,
    canUseSpecial,
  }: {
    now: number;
    enemyInstanceId: string;
    enemyName: string;
    strike: ReturnType<typeof resolveEnemyWorldStrike>;
    canUseSpecial: boolean;
  }) => {
    setEnemyActionReadyAtById((prev) => ({
      ...prev,
      [enemyInstanceId]: now + strike.nextActionDelayMs,
    }));

    if (canUseSpecial && strike.specialCooldownMs > 0) {
      setEnemySpecialReadyAtById((prev) => ({
        ...prev,
        [enemyInstanceId]: now + strike.specialCooldownMs,
      }));
    }

    setWorldLastCombatMessage(getEnemyWorldStrikePreviewMessage(enemyName, strike));
  };

  const recoverAfterWorldKill = () => {
    const healAmount = Math.max(8, Math.floor(playerStats.maxHp * 0.08));
    setWorldPlayerHp((prev) => Math.min(playerStats.maxHp, prev + healAmount));
    dispatch(addLog({
      message: `脫戰調息，恢復 <heal>${healAmount} 氣血</heal>。`,
      type: 'gain',
    }));
  };

  const grantMonsterRewards = (enemy: NonNullable<typeof targetedMonsterTemplate>) => {
    const expAmount = enemy.exp;
    if (expAmount > 0) {
      dispatch(gainExperience(expAmount));
      dispatch(addLog({
        message: `擊敗 <enemy rank="${enemy.rank}">${enemy.name}</enemy>，獲得 <exp>${expAmount} 修為</exp>`,
        type: 'gain',
      }));
    }

    const { spiritStones } = getDropRewards(enemy);
    const drops = generateDrops(enemy);
    const lootParts: string[] = [];

    if (spiritStones > 0) {
      dispatch(addSpiritStones({ amount: spiritStones, source: 'battle' }));
      lootParts.push(formatSpiritStone(spiritStones));
    }

    drops.forEach((drop) => {
      if (drop.itemId === 'spirit_stone') {
        dispatch(addSpiritStones({ amount: drop.count, source: 'battle' }));
        lootParts.push(formatSpiritStone(drop.count));
        return;
      }

      dispatch(addItem({ itemId: drop.itemId, count: drop.count, instance: drop.instance }));
      const item = ITEMS[drop.itemId];
      if (!item) return;

      const qualityValue = drop.instance?.quality ?? item.quality ?? 0;
      let itemStr = item.name;
      if (qualityValue === 0) itemStr += '(下品)';
      if (qualityValue === 1) itemStr += '(中品)';
      if (qualityValue === 2) itemStr += '(上品)';
      if (qualityValue === 3) itemStr += '(仙品)';

      lootParts.push(
        `${drop.count > 1 ? `<item q="${qualityValue}">${itemStr}</item> x${drop.count}` : `<item q="${qualityValue}">${itemStr}</item>`}`
      );
    });

    if (lootParts.length > 0) {
      dispatch(addLog({
        message: `獲得戰利品：${lootParts.join('，')}`,
        type: 'gold',
      }));
    }
  };

  const handleWorldPlayerDefeat = () => {
    const respawnMapId = completedQuests.includes('sect_sword_join')
      ? '4'
      : completedQuests.includes('sect_beast_join')
        ? '14'
        : completedQuests.includes('sect_mystic_join')
          ? '23'
          : '0';
    dispatch(addLog({
      message: '你在野外遭受重創，被傳送回安全地帶調息。',
      type: 'danger',
    }));
    dispatch(enterMap({ mapId: respawnMapId, startX: 20, startY: 20 }));
    setTargetMonsterId(null);
    setAutoMovePath([]);
    setIsAutoBattling(false);
    setWorldPlayerHp(playerStats.maxHp);
    resetWorldCombatState();
  };

  const performTimedWorldAction = ({
    readyAt,
    canExecute = () => true,
    execute,
  }: {
    readyAt?: number;
    canExecute?: () => boolean;
    execute: (now: number) => void;
  }) => {
    if (!canExecute()) return false;

    const now = Date.now();
    if (readyAt !== undefined && now < readyAt) return false;

    execute(now);
    return true;
  };

  const performWorldPlayerAction = (useSkill: boolean) => {
    return performResolvedTimedWorldAction({
      readyAt: playerActionReadyAt,
      canExecute: () => Boolean(targetedMonster && targetedMonsterTemplate && canEngageTarget),
      resolveStrike: (now) => {
        if (!targetedMonster) return;

        const chosenSkill = useSkill && primaryActiveSkill && now >= playerSkillReadyAt
          ? primaryActiveSkill
          : undefined;
        return {
          chosenSkill,
          targetedMonster,
          strike: resolvePlayerWorldStrike(playerStats, targetedMonsterTemplate, chosenSkill),
        };
      },
      createPlan: (now, resolved) =>
        createPlayerWorldStrikePlan({
          now,
          strike: resolved.strike,
          chosenSkill: resolved.chosenSkill,
          targetedMonster: resolved.targetedMonster,
        }),
    });
  };

  const performWorldEnemyAction = (
    enemyInstanceId: string,
    enemyTemplate: NonNullable<typeof targetedMonsterTemplate>
  ) =>
    performResolvedTimedWorldAction({
      resolveStrike: (now) => {
        const canUseSpecial = now >= (enemySpecialReadyAtById[enemyInstanceId] ?? 0);
        return {
          strike: resolveEnemyWorldStrike(enemyTemplate, playerStats, canUseSpecial),
          canUseSpecial,
        };
      },
      createPlan: (now, resolved) =>
        createEnemyWorldStrikePlan({
          now,
          enemyInstanceId,
          enemyTemplate,
          strike: resolved.strike,
          canUseSpecial: resolved.canUseSpecial,
        }),
    });

  // Stop auto-move if battle starts or map changes
  useEffect(() => {
      if (isBattling || showIntro) {
          setAutoMovePath((prev) => (prev.length > 0 ? [] : prev));
          if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      }
  }, [isBattling, showIntro, currentMapId]);

  // 1. Dynamic Tracking Logic (Effect: Updates autoMovePath)
  useEffect(() => {
      if (isBattling || showIntro || !mapData || !targetMonsterId) return;

      const targetMonster = activeMonsters.find(m => m.instanceId === targetMonsterId);
      if (targetMonster) {
          if (getGridDistance(playerPosition, targetMonster) <= playerEngagementRange) {
              setAutoMovePath((prev) => (prev.length > 0 ? [] : prev));
              return;
          }

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
  }, [targetMonsterId, activeMonsters, mapData, isBattling, showIntro, playerPosition, autoMovePath, playerEngagementRange, dispatch]);

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
                  // Check if this was the last step
                  if (autoMovePath.length === 1) {
                        setAutoMovePath([]);
                        // Check NPC Interaction on arrival
                        if (targetNPCId && mapData) {
                            const npc = mapData.npcs?.find(n => n.id === targetNPCId);
                            if (npc) {
                                const dist = Math.abs(nextStep.x - npc.x) + Math.abs(nextStep.y - npc.y);
                                if (dist <= 1) {
                                    setInteractingNPC(npc);
                                    setTargetNPCId(null);
                                }
                            }
                        }
                  } else {
                      setAutoMovePath(prev => prev.slice(1));
                  }
              } else {
                  // Invalid step (teleport?), clear path
                  setAutoMovePath([]);
              }
          }, speed);
      }
      return () => { if (moveTimerRef.current) clearTimeout(moveTimerRef.current); };
  }, [autoMovePath, playerPosition, isBattling, character.majorRealm, dispatch, showIntro, targetNPCId, mapData]);

  // Monster Ticker
  useEffect(() => {
    const interval = setInterval(() => {
        if (!isBattling && !showIntro) {
            dispatch(tickMonsters());
        }
    }, 1000); 
    return () => clearInterval(interval);
  }, [dispatch, isBattling, showIntro]);

  useEffect(() => {
      if (showIntro || isBattling || !targetedMonster || !targetedMonsterTemplate) return;

      const interval = setInterval(() => {
          const now = Date.now();
          const distance = getGridDistance(playerPosition, targetedMonster);

          if (isAutoBattling && distance <= playerEngagementRange && now >= playerActionReadyAt) {
              performWorldPlayerAction(Boolean(primaryActiveSkill && now >= playerSkillReadyAt));
          }

          const enemyRange = getEnemyEngagementRange(targetedMonsterTemplate);
          const engagedTargetId = worldCombatTargetId ?? (isAutoBattling ? targetedMonster.instanceId : null);
          if (
            engagedTargetId === targetedMonster.instanceId &&
            distance <= enemyRange &&
            now >= (enemyActionReadyAtById[targetedMonster.instanceId] ?? 0)
          ) {
              performWorldEnemyAction(targetedMonster.instanceId, targetedMonsterTemplate);
          }
      }, 120);

      return () => clearInterval(interval);
  }, [
    showIntro,
    isBattling,
    targetedMonster,
    targetedMonsterTemplate,
    playerPosition,
    isAutoBattling,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    enemyActionReadyAtById,
    worldCombatTargetId,
    primaryActiveSkill,
    worldPlayerHp,
    worldPlayerShield,
  ]);

  // --- Auto-Battle Logic ---
  
  // 1. Auto-Target: Find nearest monster when idle
  useEffect(() => {
      if (!isAutoBattling || isBattling || targetMonsterId || showIntro || activeMonsters.length === 0) return;

      // Find nearest
      let nearestId: string | null = null;
      let minDist = Infinity;

      activeMonsters.forEach(m => {
          // Verify path exists? For now just euclidean distance is enough approximation
          const dist = getGridDistance(playerPosition, m);
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

  useEffect(() => {
      if (!lastBattleResult || isReplayingBattle) return;

      const timer = setTimeout(() => {
          dispatch(closeBattleReport());
      }, isAutoBattling ? 1500 : 2200);

      return () => clearTimeout(timer);
  }, [lastBattleResult, isReplayingBattle, isAutoBattling, dispatch]);

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
        if (isInputBlocked || isBattling || showIntro || isMapModalOpen) return;
        
        const isMoveKey = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key);
        if (isMoveKey) setAutoMovePath([]); 

        if (e.key.toLowerCase() === 'm') {
            e.preventDefault();
            setIsMapModalOpen(true);
            setMapTab('area');
            return;
        }

        if (e.key.toLowerCase() === 'r') {
            e.preventDefault();
            setIsAutoBattling(prev => !prev);
            return;
        }

        if ((e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'q') && targetedMonster) {
            e.preventDefault();
            if (canEngageTarget) {
                performWorldPlayerAction(e.key.toLowerCase() === 'q');
                setAutoMovePath([]);
            }
            return;
        }

        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
        
        if (e.key === 'ArrowUp' || e.key === 'w') dispatch(movePlayer({ dx: 0, dy: -1 }));
        if (e.key === 'ArrowDown' || e.key === 's') dispatch(movePlayer({ dx: 0, dy: 1 }));
        if (e.key === 'ArrowLeft' || e.key === 'a') dispatch(movePlayer({ dx: -1, dy: 0 }));
        if (e.key === 'ArrowRight' || e.key === 'd') dispatch(movePlayer({ dx: 1, dy: 0 }));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, isBattling, showIntro, isMapModalOpen, isInputBlocked, targetedMonster, canEngageTarget]);

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
             const defeatedMonster = currentEnemyInstanceId
               ? activeMonsters.find((monster) => monster.instanceId === currentEnemyInstanceId)
               : null;

             if (battleSnapshot.won && defeatedMonster) {
                 dispatch(addVisualEffect({
                     type: 'area',
                     text: '',
                     color: '#fca5a5',
                     colorInt: 0xfca5a5,
                     targetX: defeatedMonster.x,
                     targetY: defeatedMonster.y,
                     radius: 0.9,
                     durationMs: 420,
                 }));
                 dispatch(addVisualEffect({
                     type: 'impact',
                     text: '',
                     color: '#ffffff',
                     colorInt: 0xffffff,
                     targetX: defeatedMonster.x,
                     targetY: defeatedMonster.y,
                     radius: 0.85,
                     durationMs: 320,
                 }));
             }

             // Calculate Respawn ID based on Profession if lost
             let respawnMapId: string | undefined;
             if (!battleSnapshot.won) {
                 if (profession === ProfessionType.Sword) respawnMapId = '4'; // 凌霄劍宗
                 else if (profession === ProfessionType.Mage) respawnMapId = '23'; // 縹緲仙宮
                 else if (profession === ProfessionType.Body) respawnMapId = '14'; // 萬獸山莊 (Base)
                 else respawnMapId = '0'; // 仙緣鎮
             }

             dispatch(resolveBattle({ won: battleSnapshot.won, logs: displayedLogs, respawnMapId })); // Use displayed logs as final source of truth for Redux if needed (or just use original)
             
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

    const nextLog = replayQueue[0];
    const timer = queueBattleReplayStep(nextLog);

    return () => clearTimeout(timer);
  }, [isReplayingBattle, replayQueue, battleSnapshot, displayedLogs, currentEnemyInstanceId, activeMonsters, playerPosition, dispatch]);

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
          battleReplayTimersRef.current.forEach((timer) => clearTimeout(timer));
          battleReplayTimersRef.current.clear();
          setDisplayedLogs([]);
          setReplayQueue([]);
          setIsReplayingBattle(false);
          setBattleSnapshot(null);
          return;
      }

      if (isBattling && currentEnemy && !lastBattleResult && !battleProcessedRef.current) {
          battleProcessedRef.current = true;
          // Calculate Stats
          const playerStats = calculatePlayerStats(
            attributes,
            majorRealm,
            spiritRootId,
            equipmentStats,
            character.name,
            profession,
            character.skills
          );
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
      if (isInputBlocked || isBattling || showIntro || !mapData) return;
      
      // 1. Check Monster
      const targetMonster = activeMonsters.find(m => m.x === targetX && m.y === targetY);
      
      // Auto-Battle Override
      if (isAutoBattling) {
           if (!targetMonster || (targetMonster && targetMonster.instanceId !== targetMonsterId)) {
               setIsAutoBattling(false);
           }
      }

      // 2. Check NPC
      const targetNPC = mapData.npcs && mapData.npcs.find(n => n.x === targetX && n.y === targetY);
      
      if (targetNPC) {
          setTargetNPCId(targetNPC.id);
          // Set visible target indicator? Maybe reusing targetMonsterId variable is confusing.
          // Just auto-move to it.
      } else {
          setTargetNPCId(null);
      }

      if (targetMonster) {
          setTargetMonsterId(targetMonster.instanceId);
          if (getGridDistance(playerPosition, targetMonster) <= playerEngagementRange) {
              setAutoMovePath([]);
              return;
          }
      } else {
          setTargetMonsterId(null);
      }

      // Pathfinding
      const path = findPath(playerPosition, { x: targetX, y: targetY }, mapData.width, mapData.height);
      if (path.length > 0) {
          setAutoMovePath(path);
      } else if (targetNPC) {
          // You might be clicking the NPC while standing next to it
           if (Math.abs(playerPosition.x - targetX) + Math.abs(playerPosition.y - targetY) <= 1) {
               setInteractingNPC(targetNPC);
               setTargetNPCId(null); // Done
           }
      }
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
    <div className="fixed inset-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-black select-none">
        
        {/* Top Right Mini-Map */}
        <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
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
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                     <span className="flex items-center gap-1 text-xs font-bold tracking-widest text-amber-200"><MapIcon size={12}/> 展開</span>
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
                         
                         <GameHintBubble
                           eyebrow="BATTLE FLOW"
                           className="left-1/2 top-full mt-1 -translate-x-1/2"
                         >
                            {isAutoBattling ? "停止掛機" : "自動戰鬥"}
                         </GameHintBubble>
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
            {targetedMonster && targetedMonsterTemplate && !isBattling && (
                <div className="absolute left-1/2 top-4 z-30 w-[min(420px,calc(100%-9rem))] -translate-x-1/2 rounded-xl border border-stone-700/90 bg-black/80 px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.55)] backdrop-blur">
                    <div className="mb-2 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={clsx(
                                    "rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider",
                                    targetedMonster.rank === EnemyRank.Boss
                                      ? "border-red-700 bg-red-950/50 text-red-300"
                                      : targetedMonster.rank === EnemyRank.Elite
                                        ? "border-blue-700 bg-blue-950/50 text-blue-300"
                                        : "border-stone-700 bg-stone-900 text-stone-300"
                                )}>
                                    {targetedMonster.rank === EnemyRank.Boss ? "Boss" : targetedMonster.rank === EnemyRank.Elite ? "Elite" : "Common"}
                                </span>
                                <span className="truncate text-sm font-bold text-stone-200">
                                    {targetedMonster.name}
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-stone-500">
                                {REALM_NAMES[targetedMonsterTemplate.realm]} {targetedMonsterTemplate.minorRealm}
                            </div>
                        </div>
                        <div className="text-right text-xs text-stone-400">
                            <div>距離 {targetDistance}</div>
                            <div className={clsx(
                                "mt-1 font-bold",
                                targetDistance !== null && targetDistance <= playerEngagementRange
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                            )}>
                                {targetDistance !== null && targetDistance <= playerEngagementRange ? "已進入攻擊距離" : `攻擊距離 ${playerEngagementRange}`}
                            </div>
                        </div>
                    </div>
                    <div className="h-2 rounded-full border border-stone-800 bg-stone-950 overflow-hidden">
                        <div
                            className={clsx(
                                "h-full transition-all duration-300",
                                targetedMonster.rank === EnemyRank.Boss
                                  ? "bg-red-500"
                                  : targetedMonster.rank === EnemyRank.Elite
                                    ? "bg-blue-500"
                                    : "bg-stone-400"
                            )}
                            style={{
                                width: `${Math.max(0, (targetedMonster.currentHp / targetedMonsterTemplate.maxHp) * 100)}%`,
                            }}
                        />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
                        <span>氣血 {targetedMonster.currentHp} / {targetedMonsterTemplate.maxHp}</span>
                        <span>{targetedMonsterTemplate.element !== ElementType.None ? ELEMENT_NAMES[targetedMonsterTemplate.element] : '無屬性'}</span>
                    </div>
                </div>
            )}

            {targetedMonster && targetedMonsterTemplate && !isBattling && (
                <div className="absolute right-4 bottom-24 z-30 w-[min(420px,calc(100%-2rem))] rounded-xl border border-stone-700/90 bg-black/80 px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.55)] backdrop-blur">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-emerald-900/50 bg-stone-950/70 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-bold text-emerald-300">{character.name}</div>
                                <div className="text-[11px] text-stone-500">你</div>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-200"
                                    style={{ width: `${Math.max(0, (worldPlayerHp / playerStats.maxHp) * 100)}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                                <span>氣血 {Math.floor(worldPlayerHp)} / {playerStats.maxHp}</span>
                                <span>{worldPlayerShield > 0 ? `護盾 ${Math.floor(worldPlayerShield)}` : '無護盾'}</span>
                            </div>
                            <div className="mt-2">{renderStatusBadges(worldCombatPlayerStatuses)}</div>
                        </div>
                        <div className="rounded-lg border border-rose-900/50 bg-stone-950/70 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="text-sm font-bold text-rose-300">{targetedMonster.name}</div>
                                <div className="text-[11px] text-stone-500">{targetedMonster.rank === EnemyRank.Boss ? 'Boss' : targetedMonster.rank === EnemyRank.Elite ? 'Elite' : 'Common'}</div>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                <div
                                    className="h-full bg-rose-500 transition-all duration-200"
                                    style={{ width: `${Math.max(0, (targetedMonster.currentHp / targetedMonsterTemplate.maxHp) * 100)}%` }}
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                                <span>氣血 {targetedMonster.currentHp} / {targetedMonsterTemplate.maxHp}</span>
                                <span>射程 {getEnemyEngagementRange(targetedMonsterTemplate)}</span>
                            </div>
                            <div className="mt-2">{renderStatusBadges(worldCombatTargetStatuses)}</div>
                        </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-stone-800 bg-stone-950/70 px-3 py-2">
                        <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                            <span>最近戰況</span>
                        </div>
                        <div className="text-sm text-stone-300">
                            {worldLastCombatMessage ?? '尚未開始交手'}
                        </div>
                        {primaryActiveSkill && (
                            <div className="mt-3">
                                <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                                    <span>{primaryActiveSkill.name}</span>
                                    <span className={(currentTimestamp < playerSkillReadyAt) ? 'text-amber-300' : 'text-emerald-300'}>
                                        {currentTimestamp < playerSkillReadyAt ? `${((playerSkillReadyAt - currentTimestamp) / 1000).toFixed(1)}s` : '可施放'}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                    <div
                                        className={clsx(
                                            "h-full transition-all duration-200",
                                            currentTimestamp < playerSkillReadyAt ? "bg-amber-500" : "bg-emerald-500"
                                        )}
                                        style={{
                                          width: `${
                                            getResolvedSkillCooldownSeconds(
                                              primaryActiveSkill,
                                              character.skills
                                            )
                                              ? Math.max(
                                                  0,
                                                  100 -
                                                    ((Math.max(
                                                      0,
                                                      playerSkillReadyAt - currentTimestamp
                                                    ) /
                                                      (getResolvedSkillCooldownSeconds(
                                                        primaryActiveSkill,
                                                        character.skills
                                                      ) *
                                                        1000)) *
                                                      100)
                                                )
                                              : 100
                                          }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                    activeQuests={activeQuests}
                    completedQuests={completedQuests}
                 />
            )}
        </div>




        {/* Battle Layout Overlay - UNIFIED */}
        {(isBattling || lastBattleResult) && currentEnemy && ReactDOM.createPortal(
            <div className="fixed bottom-4 right-4 z-[5002] w-[min(520px,calc(100vw-1rem))] md:bottom-6 md:right-6 animate-fade-in">
               <div className="relative w-full bg-stone-950/95 border border-red-900/45 rounded-xl p-4 shadow-2xl flex flex-col h-[min(70vh,600px)] animate-scale-in backdrop-blur-md">
                   <div className="flex justify-between items-center mb-3 border-b border-stone-800/80 pb-3">
                       <>
                           <h2 className={`text-lg font-bold flex items-center gap-2 ${currentEnemy.rank === EnemyRank.Boss ? 'text-red-500 uppercase tracking-[0.2em]' : 'text-stone-300'}`}>
                               <Skull size={18} /> {currentEnemy.rank === EnemyRank.Boss ? '守關妖王' : '遭遇強敵'}：{currentEnemy.name}
                           </h2>
                           <div className="text-stone-500 font-mono text-sm font-semibold tracking-wider">
                                {REALM_NAMES[currentEnemy.realm]} <span className="text-stone-400">{currentEnemy.minorRealm}</span>
                            </div>
                       </>
                   </div>
                   
                   {/* Battle Status / HP Bars - Always show snapshot if available, or current logs imply it */}
                   {battleSnapshot && (
                        <div className="mb-4 space-y-3">
                             <div className="grid grid-cols-2 gap-3">
                             {/* Player HP */}
                             <div className="bg-stone-900/90 p-3 rounded-lg border border-emerald-900/60 shadow-[0_0_18px_rgba(16,185,129,0.08)]">
                                 <div className="mb-2 flex items-center justify-between">
                                     <div>
                                         <div className="text-[11px] tracking-[0.25em] uppercase text-stone-500">玩家</div>
                                         <div className="text-sm font-bold text-emerald-300">{character.name}</div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-[11px] text-stone-500">氣血</div>
                                         <div className="text-xs font-mono text-emerald-300">
                                             {Math.floor(battleSnapshot.playerHp)} / {Math.floor(battleSnapshot.playerMaxHp)}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                                     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.max(0, (battleSnapshot.playerHp / battleSnapshot.playerMaxHp) * 100)}%` }}></div>
                                 </div>
                                 <div className="mt-2 text-[11px] text-stone-500">
                                     剩餘生命 {Math.max(0, Math.round((battleSnapshot.playerHp / battleSnapshot.playerMaxHp) * 100))}%
                                 </div>
                                 {latestBattleLog?.playerActiveSkillName && (
                                    <div className="mt-3 rounded-lg border border-stone-800 bg-black/35 px-3 py-2">
                                        <div className="mb-1 flex items-center justify-between gap-3">
                                            <span className="text-[10px] tracking-[0.22em] uppercase text-stone-500">主動術式</span>
                                            <span className={clsx(
                                              "text-xs font-semibold",
                                              (latestBattleLog.playerActiveSkillCooldownRemainingMs ?? 0) > 0
                                                ? "text-amber-300"
                                                : "text-emerald-300"
                                            )}>
                                              {(latestBattleLog.playerActiveSkillCooldownRemainingMs ?? 0) > 0
                                                ? `${((latestBattleLog.playerActiveSkillCooldownRemainingMs ?? 0) / 1000).toFixed(1)}s`
                                                : "可施放"}
                                            </span>
                                        </div>
                                        <div className="truncate text-sm font-bold text-stone-200">
                                            {latestBattleLog.playerActiveSkillName}
                                        </div>
                                        <div className="mt-2 h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                            <div
                                              className={clsx(
                                                "h-full transition-all duration-300",
                                                (latestBattleLog.playerActiveSkillCooldownRemainingMs ?? 0) > 0
                                                  ? "bg-amber-500"
                                                  : "bg-emerald-500"
                                              )}
                                              style={{
                                                width: `${
                                                  latestBattleLog.playerActiveSkillCooldownTotalMs
                                                    ? Math.max(
                                                        0,
                                                        100 -
                                                          ((latestBattleLog.playerActiveSkillCooldownRemainingMs ?? 0) /
                                                            latestBattleLog.playerActiveSkillCooldownTotalMs) *
                                                            100
                                                      )
                                                    : 100
                                                }%`,
                                              }}
                                            />
                                        </div>
                                    </div>
                                 )}
                                 <div className="mt-3 border-t border-stone-800/70 pt-2">
                                    <div className="mb-1 text-[10px] tracking-[0.22em] uppercase text-stone-500">狀態</div>
                                    {renderStatusBadges(latestBattleLog?.playerStatuses)}
                                 </div>
                             </div>

                             {/* Enemy HP */}
                             <div className="bg-stone-900/90 p-3 rounded-lg border border-rose-900/60 shadow-[0_0_18px_rgba(244,63,94,0.08)]">
                                 <div className="mb-2 flex items-center justify-between">
                                     <div>
                                         <div className="text-[11px] tracking-[0.25em] uppercase text-stone-500">目標</div>
                                         <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-rose-300">{currentEnemy.name}</span>
                                            <span className={clsx(
                                                "rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wider",
                                                currentEnemy.rank === EnemyRank.Boss
                                                  ? "border-red-700 bg-red-950/50 text-red-300"
                                                  : currentEnemy.rank === EnemyRank.Elite
                                                    ? "border-blue-700 bg-blue-950/50 text-blue-300"
                                                    : "border-stone-700 bg-stone-950 text-stone-300"
                                            )}>
                                                {currentEnemy.rank === EnemyRank.Boss ? "Boss" : currentEnemy.rank === EnemyRank.Elite ? "Elite" : "Common"}
                                            </span>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-[11px] text-stone-500">氣血</div>
                                         <div className="text-xs font-mono text-rose-300">
                                             {Math.floor(battleSnapshot.enemyHp)} / {Math.floor(battleSnapshot.enemyMaxHp)}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                                     <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${Math.max(0, (battleSnapshot.enemyHp / battleSnapshot.enemyMaxHp) * 100)}%` }}></div>
                                 </div>
                                 <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
                                    <span>{REALM_NAMES[currentEnemy.realm]} {currentEnemy.minorRealm}</span>
                                    <span>剩餘生命 {Math.max(0, Math.round((battleSnapshot.enemyHp / battleSnapshot.enemyMaxHp) * 100))}%</span>
                                 </div>
                                 <div className="mt-3 border-t border-stone-800/70 pt-2">
                                    <div className="mb-1 text-[10px] tracking-[0.22em] uppercase text-stone-500">狀態</div>
                                    {renderStatusBadges(latestBattleLog?.enemyStatuses)}
                                 </div>
                             </div>
                        </div>

                        {latestBattleLog && (
                            <div className="rounded-lg border border-stone-800 bg-black/55 px-4 py-3">
                                <div className="mb-1 text-[11px] tracking-[0.25em] uppercase text-stone-500">最近戰況</div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1 text-sm text-stone-300">
                                        {parseBattleLog(latestBattleLog.message)}
                                    </div>
                                    <div className={clsx(
                                        "shrink-0 rounded-full border px-3 py-1 text-xs font-bold",
                                        latestBattleLog.damage > 0
                                          ? latestBattleLog.isPlayer
                                            ? "border-amber-700 bg-amber-950/50 text-amber-300"
                                            : "border-red-700 bg-red-950/50 text-red-300"
                                          : "border-stone-700 bg-stone-900 text-stone-400"
                                    )}>
                                        {latestBattleLog.damage > 0 ? `${latestBattleLog.damage} 傷害` : '狀態變化'}
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                   )}

                   <div id="battle-log-container" ref={battleLogRef} className="flex-1 overflow-y-auto space-y-2 font-mono text-sm p-3 bg-black/35 rounded inner-shadow custom-scrollbar">
                       {displayedLogs.length > 0 ? displayedLogs.map((log, i) => (
                           <div key={i} className={log.isPlayer ? "text-stone-300" : "text-stone-400"}>
                               {parseBattleLog(log.message)}
                           </div>
                       )) : (
                            <div className="text-stone-600 text-center mt-10 italic">戰鬥開始...</div>
                       )}

                   </div>
                   
                   {lastBattleResult && !isReplayingBattle && (
                       <div className="mt-3 flex justify-center animate-fade-in">
                           <div className={clsx(
                               "rounded-full border px-4 py-2 text-sm font-bold tracking-[0.2em]",
                               lastBattleResult === 'won'
                                 ? "border-emerald-700 bg-emerald-950/45 text-emerald-300"
                                 : "border-red-700 bg-red-950/45 text-red-300"
                           )}>
                               {lastBattleResult === 'won' ? '戰鬥勝利' : '戰鬥失敗'}
                           </div>
                       </div>
                   )}
               </div>
            </div>,
            document.body
        )}

        {!showIntro && !isBattling && !isMapModalOpen && (
            <div className="pointer-events-none fixed bottom-4 left-1/2 z-[5001] -translate-x-1/2">
                <div className="pointer-events-auto">
                    <GameSection
                        eyebrow="BATTLE COMMAND"
                        title="戰鬥快捷列"
                        titleIcon={<Swords size={15} className="text-amber-500" />}
                        className="min-w-[min(92vw,44rem)] shadow-[0_0_30px_rgba(0,0,0,0.55)] backdrop-blur"
                        bodyClassName="grid grid-cols-2 gap-2 p-3 md:grid-cols-4"
                    >
                        <button
                            onClick={() => {
                                if (targetedMonster && canEngageTarget) {
                                    performWorldPlayerAction(false);
                                    setAutoMovePath([]);
                                }
                            }}
                            disabled={!targetedMonster || !canEngageTarget}
                            className={clsx(
                                "min-w-24 rounded-xl border px-3 py-2 text-left transition-colors",
                                targetedMonster && canEngageTarget
                                  ? "border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900/60"
                                  : "cursor-not-allowed border-stone-800 bg-stone-950/60 text-stone-500"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-bold">普攻</span>
                                <span className="rounded border border-stone-700 bg-stone-900 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">F</span>
                            </div>
                            <div className="mt-1 text-[11px] text-stone-400">
                                {targetedMonster
                                  ? canEngageTarget
                                    ? '直接在場景內出手'
                                    : '目標尚未進入距離'
                                  : '未鎖定目標'}
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                if (targetedMonster && canEngageTarget) {
                                    performWorldPlayerAction(true);
                                    setAutoMovePath([]);
                                }
                            }}
                            disabled={!primaryActiveSkill || !targetedMonster || !canEngageTarget}
                            className={clsx(
                                "min-w-36 rounded-xl border px-3 py-2 text-left transition-colors",
                                primaryActiveSkill && targetedMonster && canEngageTarget
                                  ? "border-amber-700 bg-amber-950/45 text-amber-200 hover:bg-amber-900/60"
                                  : "cursor-not-allowed border-stone-800 bg-stone-950/60 text-stone-500"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="truncate text-sm font-bold">
                                    {primaryActiveSkill?.name ?? '主動術式'}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-900 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">Q</span>
                            </div>
                            <div className="mt-1 text-[11px] text-stone-400">
                                {primaryActiveSkill ? '直接施放主修術式' : '尚未習得主動術式'}
                            </div>
                        </button>

                        <button
                            onClick={() => setIsAutoBattling((prev) => !prev)}
                            className={clsx(
                                "min-w-24 rounded-xl border px-3 py-2 text-left transition-colors",
                                isAutoBattling
                                  ? "border-emerald-700 bg-emerald-950/45 text-emerald-200 hover:bg-emerald-900/60"
                                  : "border-stone-700 bg-stone-950/60 text-stone-300 hover:bg-stone-900/70"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-bold">{isAutoBattling ? '掛機中' : '掛機'}</span>
                                <span className="rounded border border-stone-700 bg-stone-900 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">R</span>
                            </div>
                            <div className="mt-1 text-[11px] text-stone-400">自動尋敵與追擊</div>
                        </button>

                        <button
                            onClick={() => {
                                setIsMapModalOpen(true);
                                setMapTab('area');
                            }}
                            className="min-w-24 rounded-xl border border-stone-700 bg-stone-950/60 px-3 py-2 text-left text-stone-300 transition-colors hover:bg-stone-900/70"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-bold">地圖</span>
                                <span className="rounded border border-stone-700 bg-stone-900 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">M</span>
                            </div>
                            <div className="mt-1 text-[11px] text-stone-400">展開地區 / 世界地圖</div>
                        </button>
                    </GameSection>
                </div>
            </div>
        )}



        {/* NPC Interaction - Shop Panel */}
        {/* NPC Interaction Logic */}
        {(() => {
            if (!interactingNPC) return null;

            // Helper: Check if there is a priority Quest Interaction?
            const hasQuestAction = (() => {
                 // 1. Submit?
                 const submitQuestId = Object.keys(activeQuests).find(qid => {
                    const q = QUESTS[qid];
                    if (!q) return false;
                    return (q.submitNpcId === interactingNPC.id) || (!q.submitNpcId && q.giverId === interactingNPC.id);
                 });
                 if (submitQuestId) return true;

                 // 2. New?
                 if (interactingNPC.questIds) {
                     const availableQuestId = interactingNPC.questIds.find(qid => {
                         if (activeQuests[qid] || completedQuests.includes(qid)) return false;
                         const q = QUESTS[qid];
                         if (!q) return false;
                         if (q.prerequisiteQuestId && !completedQuests.includes(q.prerequisiteQuestId)) return false;
                         const realmReq = q.requirements.find(r => r.type === 'level');
                         if (realmReq && realmReq.minRealm !== undefined && majorRealm < realmReq.minRealm) return false;
                         return true;
                     });
                     if (availableQuestId) return true;
                 }
                 return false;
            })();

            // Logic:
            // 1. If Quest Action -> QuestModal
            // 2. Else If Shop -> ShopPanel
            // 3. Else -> QuestModal (Default Dialogue)

            if (hasQuestAction) {
                return (
                    <QuestModal
                        npc={interactingNPC}
                        onClose={() => setInteractingNPC(null)}
                    />
                );
            } else if (interactingNPC.type === NPCType.Shop && interactingNPC.shopId) {
                return (
                    <ShopPanel 
                        shopId={interactingNPC.shopId} 
                        onClose={() => setInteractingNPC(null)} 
                    />
                );
            } else {
                 return (
                    <QuestModal
                        npc={interactingNPC}
                        onClose={() => setInteractingNPC(null)}
                    />
                );
            }
        })()}

        {/* EXPANDED MAP MODAL */}
        <Modal 
          isOpen={isMapModalOpen} 
          onClose={() => setIsMapModalOpen(false)}
          title="玄天寶鑑"
          eyebrow="WORLD SURVEY"
          icon={<MapIcon size={18} className="text-amber-500" />}
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
                                  <div
                                    key={i}
                                    className="group absolute"
                                    style={{ left: `${(p.x / mapData.width) * 100}%`, top: `${(p.y / mapData.height) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full border border-blue-400 bg-blue-500/50 shadow-[0_0_10px_blue] md:h-2 md:w-2"></div>
                                    <GameHintBubble eyebrow="MAP PORTAL" className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                                      {p.label}
                                    </GameHintBubble>
                                  </div>
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

                              {/* NPCs (Brown w/ Text) */}
                              {mapData.npcs && mapData.npcs.map(npc => (
                                  <div key={npc.id}
                                    className="group absolute z-15"
                                    style={{ 
                                        left: `${(npc.x / mapData.width) * 100}%`, 
                                        top: `${(npc.y / mapData.height) * 100}%`, 
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                  >
                                      <div
                                        className="flex items-center justify-center rounded-sm border border-orange-900/50 bg-[#a0522d] shadow-sm"
                                        style={{
                                          width: '18px',
                                          height: '18px',
                                          fontSize: '10px',
                                          color: '#ffd700',
                                          fontWeight: 'bold',
                                        }}
                                      >
                                      {npc.symbol}
                                      </div>
                                      <GameHintBubble eyebrow="MAP NPC" className="bottom-full left-1/2 mb-2 -translate-x-1/2">
                                        {npc.name}
                                      </GameHintBubble>
                                  </div>
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
