
import React, { Suspense, lazy, useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { MAPS } from '../data/maps';
import { ITEMS } from '../data/items';
import { QUESTS } from '../data/quests';
import { enterMap, movePlayer, tickMonsters, applyWorldDamageToMonster, cancelBattle, markMapVisited } from '../store/slices/adventureSlice';
import { removeItem } from '../store/slices/inventorySlice';
import {
  clearAllCombatTimers,
  clearCombatTimerBucket,
  createCombatTimerBuckets,
  createClearWorldCombatEncounterState,
  createResetWorldCombatEncounterState,
  calculatePlayerStats,
  resolvePlayerWorldStrike,
  resolveEnemyWorldStrike,
  runEnemyWorldStrikePipeline,
  runPlayerWorldStrikePipeline,
  getResolvedSkillCooldownSeconds,
} from '../utils/battleSystem';
import { addLog } from '../store/slices/logSlice';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Skull, Footprints, Navigation, Map as MapIcon, X, Lock, Globe, Target, MapPin, Info, Users, Move, Swords, Flame, Droplets, Shield, ShieldOff, Zap, Snowflake, Sparkles } from 'lucide-react';
import { parseBattleLog } from '../utils/logParser';
import { EnemyRank, Coordinate, MapData, MajorRealm, ElementType, ItemCategory, NPC, NPCType, ProfessionType, ActiveMonster, Enemy, ConsumableItem } from '../types';
import { MOVEMENT_SPEEDS, REALM_NAMES, ELEMENT_COLORS, ELEMENT_NAMES } from '../constants';
import clsx from 'clsx';
import { Modal } from '../components/Modal';
import { setProfession } from '@/store/slices/characterSlice';
import AdventureStage from '../components/adventure/AdventureStage';
import ShopPanel from '../components/adventure/ShopPanel';
import { QuestModal } from '../components/adventure/QuestModal';
import { GameHintBubble } from '../components/game/GameHintBubble';
import { GameSection } from '../components/game/GameSection';
import { GameTooltip } from '../components/game/GameTooltip';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { SHOPS } from '../data/shops';
import { getEnemyEngagementRange, getGridDistance, getPlayerEngagementRange } from '../utils/worldCombat';
import { getLearnedSkillEngagementRange } from '../utils/skillRealtime';
import { normalizeLearnedSkills } from '../data/skills';
import {
  resolveAdventureCombatUiState,
  resolveWorldCombatTargetSelection,
} from '../utils/adventureCombatUiState';
import {
  resolveWorldCombatStatusCues,
  resolveWorldCombatTargetPresentation,
  type WorldCombatCueIconKey,
  type WorldCombatCueTone,
  type WorldCombatEventCue,
  type WorldCombatStatusCue,
} from '../utils/worldCombatPresentation';
import {
  PIXEL_PROTOTYPE_MAP_ID,
  resolveAdventureStageRenderMode,
  type AdventureStageRenderMode,
} from '../utils/pixelAdventurePrototype';
import { createAdventureBattleUiBridge } from '../utils/adventureBattleUiBridge';
import { createAdventureBattleVisualBridge } from '../utils/adventureBattleVisualBridge';
import {
  useAutoBattleReplayControllerEffect,
  useBattleResultLifecycleEffect,
  useWorldCombatControllerEffect,
} from '../hooks/useAdventureBattleEffects';
import { resolveAdventureTerrainPalette } from '../utils/adventureTerrainPixelization';
import {
  applyConsumableRecoveryEffects,
  getConsumableRecoveryBlockedReason,
  hasRecoveryEffect,
} from '../utils/consumableEffects';
import {
  calculateEnemyCombatPower,
  formatCombatPower,
} from '../utils/combatPower';

const AdventurePixelStagePrototype = lazy(() =>
  import('../components/adventure/AdventurePixelStagePrototype').then((module) => ({
    default: module.AdventurePixelStagePrototype,
  }))
);


// --- VISUAL CONFIG ---
const TARGET_CELL_SIZE_DESKTOP = 42; // px
const TARGET_CELL_SIZE_MOBILE = 34; // px
const GRID_SCALE_X = 140; 
const GRID_SCALE_Y = 120; 
const NODE_WIDTH = 100;
const NODE_HEIGHT = 70;

const toHexColor = (value: number) => `#${value.toString(16).padStart(6, '0')}`;

type CombatCueRenderable = {
  key: string;
  label: string;
  detail?: string;
  timingLabel?: string;
  tone: WorldCombatCueTone;
  iconKey: WorldCombatCueIconKey;
};

const getEnemyAiLabel = (aiStyle?: Enemy["aiStyle"]) => {
  switch (aiStyle) {
    case "ranged":
      return "遠程";
    case "caster":
      return "施法";
    default:
      return "近戰";
  }
};

const formatEnemyElements = (elements?: ElementType[]) =>
  elements && elements.length > 0
    ? elements.map((element) => ELEMENT_NAMES[element]).join("、")
    : "無";

const formatEnemySpecialAttack = (enemy: Enemy) =>
  enemy.specialAttack
    ? `${enemy.specialAttack.name} / ${enemy.specialAttack.cooldownSeconds}s`
    : "無特殊攻擊";

const COMBAT_CUE_ICON_MAP: Record<
  WorldCombatCueIconKey,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  target: Target,
  swords: Swords,
  move: Move,
  sparkles: Sparkles,
  shield: Shield,
  shieldOff: ShieldOff,
  zap: Zap,
  snowflake: Snowflake,
  flame: Flame,
  droplets: Droplets,
  skull: Skull,
};

const COMBAT_CUE_TONE_STYLES: Record<
  WorldCombatCueTone,
  { badge: string; subText: string }
> = {
  neutral: {
    badge: 'border-stone-700 bg-stone-900/90 text-stone-300',
    subText: 'text-stone-500',
  },
  warning: {
    badge: 'border-amber-700 bg-amber-950/60 text-amber-200',
    subText: 'text-amber-300/80',
  },
  danger: {
    badge: 'border-rose-700 bg-rose-950/60 text-rose-200',
    subText: 'text-rose-300/80',
  },
  ready: {
    badge: 'border-red-500/70 bg-red-950/70 text-red-100',
    subText: 'text-red-200/80',
  },
  buff: {
    badge: 'border-emerald-700 bg-emerald-950/50 text-emerald-200',
    subText: 'text-emerald-300/80',
  },
  debuff: {
    badge: 'border-orange-700 bg-orange-950/60 text-orange-200',
    subText: 'text-orange-300/80',
  },
  control: {
    badge: 'border-violet-700 bg-violet-950/60 text-violet-200',
    subText: 'text-violet-300/80',
  },
  immune: {
    badge: 'border-cyan-700 bg-cyan-950/60 text-cyan-200',
    subText: 'text-cyan-300/80',
  },
};

const renderCombatCueBadges = ({
  cues,
  emptyLabel,
  maxVisible = 4,
  compact = false,
}: {
  cues: CombatCueRenderable[];
  emptyLabel: string;
  maxVisible?: number;
  compact?: boolean;
}) => {
  if (cues.length === 0) {
    return <div className="text-[11px] text-stone-600">{emptyLabel}</div>;
  }

  const visibleCues = cues.slice(0, maxVisible);
  const hiddenCount = Math.max(0, cues.length - visibleCues.length);

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleCues.map((cue) => {
        const Icon = COMBAT_CUE_ICON_MAP[cue.iconKey] ?? Info;
        const toneStyle = COMBAT_CUE_TONE_STYLES[cue.tone];
        const secondaryText = cue.timingLabel ?? cue.detail;

        return (
          <span
            key={cue.key}
            className={clsx(
              compact
                ? 'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold'
                : 'inline-flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold',
              toneStyle.badge
            )}
          >
            <Icon size={12} className="mt-0.5 shrink-0" />
            <span className={clsx('min-w-0', compact ? '' : 'flex flex-col leading-tight')}>
              <span>{cue.label}</span>
              {!compact && secondaryText && (
                <span className={clsx('text-[10px] font-medium', toneStyle.subText)}>
                  {secondaryText}
                </span>
              )}
            </span>
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center rounded-full border border-stone-700 bg-stone-900/80 px-2 py-1 text-[11px] font-semibold text-stone-300">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

const asRenderableCue = (
  cue: WorldCombatStatusCue | WorldCombatEventCue,
  index: number
): CombatCueRenderable => ({
  key: `${cue.label}:${cue.tone}:${index}`,
  label: cue.label,
  detail: cue.detail,
  timingLabel: 'timingLabel' in cue ? cue.timingLabel : undefined,
  tone: cue.tone,
  iconKey: cue.iconKey,
});

const renderStatusBadges = (
  statuses: string[] = [],
  owner: 'player' | 'enemy' = 'player'
) =>
  renderCombatCueBadges({
    cues: resolveWorldCombatStatusCues({ statuses, owner }).map((cue, index) =>
      asRenderableCue(cue, index)
    ),
    emptyLabel: '無特殊狀態',
    compact: true,
    maxVisible: 5,
  });

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
        <div className="relative h-full w-full overflow-hidden bg-stone-950" data-testid="adventure-world-map">
            <div
              ref={scrollContainerRef}
              className="custom-scrollbar relative h-full w-full overflow-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-stone-950"
              data-testid="adventure-world-map-scroll"
            >
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
  mapOpenRequest?: number;
}

export const Adventure: React.FC<AdventureProps> = ({
  isInputBlocked = false,
  mapOpenRequest = 0,
}) => {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character);
  const { attributes, majorRealm, spiritRootId, isInitialized, profession } = character;
  const { equipmentStats, items: inventoryItems } = useSelector((state: RootState) => state.inventory);
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
        clearAllCombatTimers(combatTimersRef.current);
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
  const [stageRenderMode, setStageRenderMode] = useState<AdventureStageRenderMode>('official');

  useEffect(() => {
    if (mapOpenRequest <= 0) return;
    setMapTab('area');
    setIsMapModalOpen(true);
  }, [mapOpenRequest]);

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
  const [worldUiNow, setWorldUiNow] = useState(() => Date.now());
  const combatTimersRef = useRef(createCombatTimerBuckets());
  
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

  const applyGridMetrics = (nextMetrics: typeof gridMetrics) => {
    setGridMetrics((previousMetrics) => {
      if (
        previousMetrics.cols === nextMetrics.cols &&
        previousMetrics.rows === nextMetrics.rows &&
        previousMetrics.cellSize === nextMetrics.cellSize &&
        previousMetrics.pixelWidth === nextMetrics.pixelWidth &&
        previousMetrics.pixelHeight === nextMetrics.pixelHeight
      ) {
        return previousMetrics;
      }

      return nextMetrics;
    });
  };
  
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
            applyGridMetrics({
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

            applyGridMetrics({
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
  const areaMapSurfaceStyle = useMemo<React.CSSProperties>(() => {
    if (!mapData) return {};

    const palette = resolveAdventureTerrainPalette(mapData.theme);
    const base = toHexColor(palette.fillColors.base);
    const alt = toHexColor(palette.fillColors.alt);
    const accent = toHexColor(palette.fillColors.accent);
    const path = toHexColor(palette.fillColors.path);
    const water = toHexColor(palette.fillColors.water);
    const grid = toHexColor(palette.gridColor);

    return {
      backgroundColor: base,
      backgroundImage: [
        `linear-gradient(90deg, ${grid}55 1px, transparent 1px)`,
        `linear-gradient(${grid}55 1px, transparent 1px)`,
        `radial-gradient(circle at 18% 22%, ${accent} 0 5%, transparent 6%)`,
        `radial-gradient(circle at 78% 72%, ${water} 0 7%, transparent 8%)`,
        `linear-gradient(135deg, transparent 0 42%, ${path}88 43% 48%, transparent 49%)`,
        `linear-gradient(180deg, ${alt}99, ${base})`,
      ].join(", "),
      backgroundSize: "5% 5%, 5% 5%, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
    };
  }, [mapData]);
  const hasCombatEncounters = Boolean(mapData?.enemies.length);
  const combatUiState = resolveAdventureCombatUiState({
    hasCombatEncounters,
    isInSeclusion: character.isInSeclusion,
    showIntro,
    isBattling,
    isMapModalOpen,
  });
  const canPreviewPixelPrototype = mapData?.id === PIXEL_PROTOTYPE_MAP_ID;
  const activeStageRenderMode = resolveAdventureStageRenderMode({
    requestedMode: stageRenderMode,
    mapId: mapData?.id ?? null,
  });
  const currentTimestamp = worldUiNow;
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
  const primaryActiveSkillCooldownMs = primaryActiveSkill
    ? getResolvedSkillCooldownSeconds(primaryActiveSkill, character.skills) * 1000
    : 0;
  const worldCombatPresentation =
    targetedMonster &&
    targetedMonsterTemplate &&
    targetDistance !== null
      ? resolveWorldCombatTargetPresentation({
          now: currentTimestamp,
          distance: targetDistance,
          playerEngagementRange,
          profession,
          playerSpeed: playerStats.speed,
          playerActionReadyAt,
          playerSkillReadyAt,
          playerSkillTotalMs: primaryActiveSkillCooldownMs,
          enemy: targetedMonsterTemplate,
          enemyActionReadyAt:
            enemyActionReadyAtById[targetedMonster.instanceId] ?? 0,
          enemySpecialReadyAt:
            enemySpecialReadyAtById[targetedMonster.instanceId] ?? 0,
          worldCombatTargetId,
          targetMonsterInstanceId: targetedMonster.instanceId,
          isAutoBattling,
          playerStatusNames: worldCombatPlayerStatuses,
          enemyStatusNames: worldCombatTargetStatuses,
          recentMessage: worldLastCombatMessage,
        })
      : null;
  const combatSupplySlot = inventoryItems.find((slot) => {
    const item = ITEMS[slot.itemId];
    return (
      item?.category === ItemCategory.Consumable &&
      hasRecoveryEffect((item as ConsumableItem).effects)
    );
  });
  const combatSupply = combatSupplySlot
    ? ITEMS[combatSupplySlot.itemId] as ConsumableItem
    : null;
  const combatSupplyBlockedReason = combatSupply
    ? getConsumableRecoveryBlockedReason(combatSupply.effects, {
        hp: { current: worldPlayerHp, max: playerStats.maxHp },
      })
    : "沒有可用補給";

  const useCombatSupply = () => {
    if (!combatSupply || !combatSupplySlot || combatSupplyBlockedReason) {
      if (combatSupplyBlockedReason) {
        dispatch(addLog({
          message: `補給無法使用：${combatSupplyBlockedReason}。`,
          type: 'warning-low',
        }));
      }
      return;
    }

    const recovery = applyConsumableRecoveryEffects(combatSupply.effects, {
      hp: { current: worldPlayerHp, max: playerStats.maxHp },
    });

    if (recovery.appliedEffects <= 0 || !recovery.hp) {
      dispatch(addLog({
        message: `補給無法使用：沒有可恢復的戰鬥資源。`,
        type: 'warning-low',
      }));
      return;
    }

    setWorldPlayerHp(recovery.hp.current);
    dispatch(removeItem({
      itemId: combatSupplySlot.itemId,
      count: 1,
      instanceId: combatSupplySlot.instanceId,
    }));
    dispatch(addLog({
      message: `你服用了 [${combatSupply.name}]，氣血恢復至 ${Math.floor(recovery.hp.current)} / ${playerStats.maxHp}。`,
      type: 'gain',
    }));
  };

  useEffect(() => {
    if (!targetedMonster || isBattling || showIntro) {
      setWorldUiNow(Date.now());
      return;
    }

    setWorldUiNow(Date.now());
    const timer = setInterval(() => {
      setWorldUiNow(Date.now());
    }, 120);

    return () => clearInterval(timer);
  }, [targetedMonster, isBattling, showIntro]);

  useEffect(() => {
    if (stageRenderMode === 'pixel_prototype' && !canPreviewPixelPrototype) {
      setStageRenderMode('official');
    }
  }, [stageRenderMode, canPreviewPixelPrototype]);

  useEffect(() => {
    setWorldPlayerHp(playerStats.maxHp);
    applyWorldCombatEncounterState(createResetWorldCombatEncounterState());
  }, [currentMapId, playerStats.maxHp]);

  useEffect(() => {
    if (worldPlayerHp > playerStats.maxHp) {
      setWorldPlayerHp(playerStats.maxHp);
    }
  }, [worldPlayerHp, playerStats.maxHp]);

  useEffect(() => {
    if (worldCombatTargetId && !activeMonsters.some((monster) => monster.instanceId === worldCombatTargetId)) {
      clearCombatTimerBucket(combatTimersRef.current, 'world');
      applyWorldCombatEncounterState(
        createClearWorldCombatEncounterState({
          worldPlayerShield,
          playerActionReadyAt,
          playerSkillReadyAt,
        })
      );
    }
  }, [activeMonsters, worldCombatTargetId, worldPlayerShield, playerActionReadyAt, playerSkillReadyAt]);

  const resetWorldCombatState = () => {
    clearCombatTimerBucket(combatTimersRef.current, 'world');
    applyWorldCombatEncounterState(createResetWorldCombatEncounterState());
  };

  const clearWorldEncounterState = () => {
    clearCombatTimerBucket(combatTimersRef.current, 'world');
    applyWorldCombatEncounterState(
      createClearWorldCombatEncounterState({
        worldPlayerShield,
        playerActionReadyAt,
        playerSkillReadyAt,
      })
    );
  };

  const {
    dispatchWorldStrikeVisualPlan,
    dispatchPlayerWorldStrikeCastEffect,
    dispatchEnemyWorldStrikeCastEffect,
  } = createAdventureBattleVisualBridge({
    dispatch,
  });

  const {
    applyBattleReplayState,
    applyWorldCombatEncounterState,
    applyBattleRewardApplicationPlan,
    applyWorldPlayerDefeatStatePlan,
  } = createAdventureBattleUiBridge({
    dispatch,
    setDisplayedLogs,
    setReplayQueue,
    setBattleSnapshot,
    setIsReplayingBattle,
    setWorldCombatTargetId,
    setWorldCombatTargetStatuses,
    setWorldCombatPlayerStatuses,
    setWorldLastCombatMessage,
    setWorldPlayerShield,
    setPlayerActionReadyAt,
    setPlayerSkillReadyAt,
    setEnemyActionReadyAtById,
    setEnemySpecialReadyAtById,
    setTargetMonsterId,
    setAutoMovePath,
    setIsAutoBattling,
    setWorldPlayerHp,
    clearWorldCombatTimers: () => clearCombatTimerBucket(combatTimersRef.current, 'world'),
  });

  const runPlayerWorldAction = (useSkill: boolean) =>
    runPlayerWorldStrikePipeline({
      readyAt: playerActionReadyAt,
      canExecute: () => Boolean(canEngageTarget && targetedMonster && targetedMonsterTemplate),
      target: targetedMonster ?? undefined,
      primaryActiveSkill,
      playerSkillReadyAt,
      useSkill,
      resolveStrike: (chosenSkill) =>
        resolvePlayerWorldStrike(playerStats, targetedMonsterTemplate, chosenSkill),
      activeMonsters,
      playerPosition,
      mapEnemies: mapData?.enemies,
      playerMaxHp: playerStats.maxHp,
      currentWorldPlayerHp: worldPlayerHp,
      currentShield: worldPlayerShield,
      timerSet: combatTimersRef.current.world,
      applyCastEffect: ({ chosenSkill, strike }) =>
        dispatchPlayerWorldStrikeCastEffect({
          profession: chosenSkill?.profession,
          castTimeMs: chosenSkill?.castTimeMs,
          executionTimeMs: strike.executionTimeMs,
          isProjectile: strike.isProjectile,
          sourceX: playerPosition.x,
          sourceY: playerPosition.y,
          targetX: targetedMonster?.x ?? playerPosition.x,
          targetY: targetedMonster?.y ?? playerPosition.y,
        }),
      applyPreviewStatePlan: (previewPlan) => {
        setWorldCombatTargetId(previewPlan.worldCombatTargetId);
        setWorldCombatTargetStatuses(previewPlan.worldCombatTargetStatuses);
        setWorldCombatPlayerStatuses(previewPlan.worldCombatPlayerStatuses);
        setWorldPlayerShield(previewPlan.nextWorldPlayerShield);
        setWorldLastCombatMessage(previewPlan.worldLastCombatMessage);
        setPlayerActionReadyAt(previewPlan.nextPlayerActionReadyAt);
        if (previewPlan.nextPlayerSkillReadyAt !== undefined) {
          setPlayerSkillReadyAt(previewPlan.nextPlayerSkillReadyAt);
        }
      },
      applyMonsterDamage: ({ monsterInstanceId, damage }) => {
        dispatch(applyWorldDamageToMonster({
          monsterInstanceId,
          damage,
        }));
      },
      applyVisualPlan: dispatchWorldStrikeVisualPlan,
      applyRewardApplicationPlan: applyBattleRewardApplicationPlan,
      appendLogEntry: (logEntry) => {
        dispatch(addLog(logEntry));
      },
      setWorldLastCombatMessage,
      setWorldPlayerHp,
      clearEncounter: () => {
        setTargetMonsterId(null);
        clearWorldEncounterState();
      },
    });

  const runEnemyWorldAction = () =>
    targetedMonsterTemplate
      ? runEnemyWorldStrikePipeline({
          enemySpecialReadyAt:
            enemySpecialReadyAtById[targetedMonster.instanceId] ?? 0,
          enemyInstanceId: targetedMonster.instanceId,
          enemyName: targetedMonsterTemplate.name,
          enemyPosition: targetedMonster,
          fallbackSourcePosition: {
            x: targetedMonsterTemplate.attackRange ?? 0,
            y: playerPosition.y,
          },
          playerPosition,
          currentShield: worldPlayerShield,
          currentHp: worldPlayerHp,
          currentStatuses: worldCombatPlayerStatuses,
          completedQuestIds: completedQuests,
          playerMaxHp: playerStats.maxHp,
          resolveStrike: (canUseSpecial) =>
            resolveEnemyWorldStrike(
              targetedMonsterTemplate,
              playerStats,
              canUseSpecial,
              worldCombatPlayerStatuses
            ),
          timerSet: combatTimersRef.current.world,
          applyCastEffect: ({ strike }) =>
            dispatchEnemyWorldStrikeCastEffect({
              hasSkillName: Boolean(strike.skillName),
              executionTimeMs: strike.executionTimeMs,
              isProjectile: strike.isProjectile,
              sourceX: targetedMonster?.x ?? playerPosition.x,
              sourceY: targetedMonster?.y ?? playerPosition.y,
              targetX: playerPosition.x,
              targetY: playerPosition.y,
              warningRadius:
                strike.skillName &&
                ((strike.areaShape &&
                  strike.areaShape !== 'single' &&
                  strike.areaShape !== 'self')
                  ? Math.max(1, strike.areaRadius ?? 1)
                  : targetedMonsterTemplate.rank === EnemyRank.Boss
                    ? 0.95
                    : undefined),
              isBossThreat:
                targetedMonsterTemplate.rank === EnemyRank.Boss &&
                Boolean(strike.skillName),
            }),
          applyPreviewStatePlan: (previewPlan, enemyInstanceId) => {
            setEnemyActionReadyAtById((prev) => ({
              ...prev,
              [enemyInstanceId]: previewPlan.nextEnemyActionReadyAt,
            }));

            if (previewPlan.nextEnemySpecialReadyAt !== undefined) {
              setEnemySpecialReadyAtById((prev) => ({
                ...prev,
                [enemyInstanceId]: previewPlan.nextEnemySpecialReadyAt,
              }));
            }

            setWorldLastCombatMessage(previewPlan.worldLastCombatMessage);
          },
          setWorldPlayerShield,
          setWorldPlayerHp,
          setWorldCombatPlayerStatuses,
          setWorldLastCombatMessage,
          applyVisualPlan: dispatchWorldStrikeVisualPlan,
          applyDefeatStatePlan: applyWorldPlayerDefeatStatePlan,
        })
      : undefined;

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

  useWorldCombatControllerEffect({
    showIntro,
    isBattling,
    isAutoBattling,
    targetMonsterId,
    activeMonsters,
    playerPosition,
    targetedMonster,
    targetedMonsterTemplate,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    enemyActionReadyAtById,
    enemySpecialReadyAtById,
    worldCombatTargetId,
    primaryActiveSkill,
    setTargetMonsterId,
    runPlayerWorldAction,
    runEnemyWorldAction,
  });

  // --- Auto-Battle Logic ---

  useBattleResultLifecycleEffect({
    dispatch,
    lastBattleResult,
    isReplayingBattle,
    isAutoBattling,
    setTargetMonsterId,
    setAutoMovePath,
    setIsAutoBattling,
  });

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
                runPlayerWorldAction(e.key.toLowerCase() === 'q');
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
  }, [
    dispatch,
    isBattling,
    showIntro,
    isMapModalOpen,
    isInputBlocked,
    targetedMonster,
    canEngageTarget,
    targetedMonsterTemplate,
    playerActionReadyAt,
    primaryActiveSkill,
    playerSkillReadyAt,
    playerStats,
    activeMonsters,
  ]);

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

  useAutoBattleReplayControllerEffect({
    dispatch,
    isBattling,
    lastBattleResult,
    isReplayingBattle,
    replayQueue,
    battleSnapshot,
    displayedLogs,
    currentEnemy,
    currentEnemyInstanceId,
    activeMonsters,
    activeQuests,
    completedQuests,
    playerPosition,
    attributes,
    majorRealm,
    spiritRootId,
    equipmentStats,
    characterName: character.name,
    profession,
    characterSkills: character.skills,
    battleProcessedRef,
    replayTimerSet: combatTimersRef.current.replay,
    applyBattleReplayState,
    dispatchWorldStrikeVisualPlan,
    applyBattleRewardApplicationPlan,
    clearReplayTimers: () => clearCombatTimerBucket(combatTimersRef.current, 'replay'),
  });

  // Auto-Scroll Battle Logs
  useEffect(() => {
    if (battleLogRef.current) {
        battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [displayedLogs, isReplayingBattle, lastBattleResult]);

  const handleGridClick = (targetX: number, targetY: number) => {
      if (isInputBlocked || isBattling || showIntro || !mapData) return;
      
      // 1. Check Monster
      const targetMonster = activeMonsters.find(m => m.x === targetX && m.y === targetY);

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
          const targetSelection = resolveWorldCombatTargetSelection({
              clickedMonsterInstanceId: targetMonster.instanceId,
              isAutoBattling,
          });
          setTargetMonsterId(targetSelection.nextTargetMonsterId);
          setWorldCombatTargetId(targetSelection.nextWorldCombatTargetId);
          if (targetSelection.nextIsAutoBattling !== isAutoBattling) {
              setIsAutoBattling(targetSelection.nextIsAutoBattling);
          }
          if (getGridDistance(playerPosition, targetMonster) <= playerEngagementRange) {
              setAutoMovePath((prev) => (prev.length > 0 ? [] : prev));
              return;
          }
      } else {
          const targetSelection = resolveWorldCombatTargetSelection({
              clickedMonsterInstanceId: null,
              isAutoBattling,
          });
          setTargetMonsterId(targetSelection.nextTargetMonsterId);
          setWorldCombatTargetId(targetSelection.nextWorldCombatTargetId);
          if (targetSelection.nextIsAutoBattling !== isAutoBattling) {
              setIsAutoBattling(targetSelection.nextIsAutoBattling);
          }
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
            <Button
              onClick={() => { setIsMapModalOpen(true); setMapTab('area'); }}
              variant="ghost"
              className="bg-black/90 border border-stone-600 p-1 w-24 h-24 md:w-32 md:h-32 rounded shadow-lg backdrop-blur relative overflow-hidden group hover:border-amber-500 transition-colors"
              data-testid="adventure-minimap-open"
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
            </Button>
             <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                     <Button
                        onClick={() =>
                          setStageRenderMode((currentMode) =>
                            currentMode === 'pixel_prototype' ? 'official' : 'pixel_prototype'
                          )
                        }
                        disabled={!canPreviewPixelPrototype}
                        variant="ghost"
                        size="icon"
                        className={clsx(
                            "h-8 w-8 flex items-center justify-center rounded backdrop-blur border transition-all group relative",
                            activeStageRenderMode === 'pixel_prototype'
                                ? "bg-emerald-900/80 border-emerald-500 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                                : canPreviewPixelPrototype
                                  ? "bg-black/50 border-stone-800 text-stone-500 hover:text-stone-200 hover:border-stone-600"
                                  : "bg-black/30 border-stone-900 text-stone-700 cursor-not-allowed opacity-70"
                        )}
                        data-testid="adventure-pixel-prototype-toggle"
                     >
                         <Sparkles size={16} />
                         
                         <GameHintBubble
                           eyebrow="PIXEL PROTOTYPE"
                           className="left-1/2 top-full mt-1 -translate-x-1/2"
                         >
                            {canPreviewPixelPrototype
                              ? activeStageRenderMode === 'pixel_prototype'
                                ? "切回正式 AdventureStage"
                                : "切換到像素風 vertical slice 原型"
                              : "目前只在東郊靈田開放像素原型預覽"}
                         </GameHintBubble>
                     </Button>
                     {combatUiState.showTopCombatControls && (
                         <Button
                            onClick={() => setIsAutoBattling(!isAutoBattling)}
                            variant="ghost"
                            size="icon"
                            className={clsx(
                                "h-8 w-8 flex items-center justify-center rounded backdrop-blur border transition-all group relative",
                                isAutoBattling
                                    ? "bg-red-900/80 border-red-500 text-red-200 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse"
                                    : "bg-black/50 border-stone-800 text-stone-500 hover:text-stone-300 hover:border-stone-600"
                            )}
                            data-testid="adventure-auto-battle-toggle"
                         >
                             <Swords size={16} />

                             <GameHintBubble
                               eyebrow="BATTLE FLOW"
                               className="left-1/2 top-full mt-1 -translate-x-1/2"
                             >
                                {isAutoBattling ? "停止掛機" : "自動戰鬥"}
                             </GameHintBubble>
                         </Button>
                     )}
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
                            <div
                                className="mt-2 flex flex-wrap gap-2 text-[11px] text-stone-300"
                                data-testid="adventure-target-enemy-intel"
                            >
                                <span className="rounded border border-amber-900/50 bg-amber-950/30 px-2 py-1 font-bold text-amber-200">
                                    戰力 {formatCombatPower(calculateEnemyCombatPower(targetedMonsterTemplate))}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/70 px-2 py-1">
                                    攻擊 {targetedMonsterTemplate.attack}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/70 px-2 py-1">
                                    防禦 {targetedMonsterTemplate.defense}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/70 px-2 py-1">
                                    AI：{getEnemyAiLabel(targetedMonsterTemplate.aiStyle)}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/70 px-2 py-1">
                                    特殊攻擊：{formatEnemySpecialAttack(targetedMonsterTemplate)}
                                </span>
                            </div>
                            {worldCombatPresentation && (
                                <div className="mt-1 text-[11px] text-stone-400">
                                    {worldCombatPresentation.rolePresentation.label} · {worldCombatPresentation.rolePresentation.detail}
                                </div>
                            )}
                            {worldCombatPresentation && (
                                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                                    <span className="rounded-full border border-stone-700 bg-stone-900/80 px-2 py-1 text-stone-300">
                                        角色分工：{worldCombatPresentation.rolePresentation.label}
                                    </span>
                                    <span
                                        className={clsx(
                                            "rounded-full border px-2 py-1 font-semibold",
                                            worldCombatPresentation.intentTone === 'ready'
                                              ? "border-rose-500/60 bg-rose-950/60 text-rose-200"
                                              : worldCombatPresentation.intentTone === 'danger'
                                                ? "border-amber-500/60 bg-amber-950/60 text-amber-200"
                                                : worldCombatPresentation.intentTone === 'warning'
                                                  ? "border-sky-500/60 bg-sky-950/60 text-sky-200"
                                                  : "border-stone-700 bg-stone-900/80 text-stone-300"
                                        )}
                                    >
                                        敵方意圖：{worldCombatPresentation.intentLabel}
                                    </span>
                                    <span className="rounded-full border border-stone-700 bg-stone-900/80 px-2 py-1 text-stone-300">
                                        {worldCombatPresentation.rangeHint}
                                    </span>
                                    <span
                                        className={clsx(
                                            "rounded-full border px-2 py-1 font-semibold",
                                            COMBAT_CUE_TONE_STYLES[worldCombatPresentation.recentEventCue.tone].badge
                                        )}
                                    >
                                        {worldCombatPresentation.recentEventCue.label}
                                    </span>
                                </div>
                            )}
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
                            <div className="mt-3 flex items-center gap-2">
                                <Button
                                    onClick={useCombatSupply}
                                    disabled={!combatSupply || Boolean(combatSupplyBlockedReason)}
                                    variant={combatSupply && !combatSupplyBlockedReason ? "emerald" : "stone"}
                                    size="sm"
                                    className="min-w-0 flex-1 text-xs"
                                    data-testid="adventure-use-combat-supply"
                                >
                                    {combatSupply ? `服用 ${combatSupply.name}` : '無補給'}
                                </Button>
                                <span className="min-w-0 flex-1 text-[11px] text-stone-500">
                                    {combatSupplyBlockedReason ?? `剩餘 ${combatSupplySlot?.count ?? 0}`}
                                </span>
                            </div>
                            <div className="mt-2">
                                {worldCombatPresentation
                                  ? renderCombatCueBadges({
                                      cues: worldCombatPresentation.playerStatusCues.map((cue, index) =>
                                        asRenderableCue(cue, index)
                                      ),
                                      emptyLabel: '目前無主要增益',
                                      maxVisible: 4,
                                    })
                                  : renderStatusBadges(worldCombatPlayerStatuses, 'player')}
                            </div>
                            {worldCombatPresentation && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                                            <span>普攻節奏</span>
                                            <span className={worldCombatPresentation.playerAction.ready ? 'text-emerald-300' : 'text-amber-300'}>
                                                {worldCombatPresentation.playerAction.ready ? '可出手' : worldCombatPresentation.playerAction.label}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                            <div
                                                className={clsx(
                                                    "h-full transition-all duration-150",
                                                    worldCombatPresentation.playerAction.ready ? "bg-emerald-500" : "bg-amber-500"
                                                )}
                                                style={{ width: `${worldCombatPresentation.playerAction.fillPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                    {primaryActiveSkill && worldCombatPresentation.playerSkill && (
                                        <div>
                                            <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                                                <span>{primaryActiveSkill.name}</span>
                                                <span className={worldCombatPresentation.playerSkill.ready ? 'text-emerald-300' : 'text-amber-300'}>
                                                    {worldCombatPresentation.playerSkill.ready ? '可施放' : worldCombatPresentation.playerSkill.label}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                                <div
                                                    className={clsx(
                                                        "h-full transition-all duration-150",
                                                        worldCombatPresentation.playerSkill.ready ? "bg-emerald-500" : "bg-amber-500"
                                                    )}
                                                    style={{ width: `${worldCombatPresentation.playerSkill.fillPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="rounded-lg border border-rose-900/50 bg-stone-950/70 p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-rose-300">{targetedMonster.name}</div>
                                    {worldCombatPresentation && (
                                        <div className="mt-1 text-[11px] text-stone-500">
                                            {worldCombatPresentation.rolePresentation.label} · {worldCombatPresentation.rolePresentation.summary}
                                        </div>
                                    )}
                                </div>
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
                            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-stone-400">
                                <span className="rounded border border-amber-900/40 bg-amber-950/20 px-2 py-1 font-semibold text-amber-200">
                                    戰力 {formatCombatPower(calculateEnemyCombatPower(targetedMonsterTemplate))}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/60 px-2 py-1">
                                    {targetedMonsterTemplate.element !== ElementType.None ? ELEMENT_NAMES[targetedMonsterTemplate.element] : '無屬性'}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/60 px-2 py-1">
                                    弱點 {formatEnemyElements(targetedMonsterTemplate.weaknesses)}
                                </span>
                                <span className="rounded border border-stone-700 bg-stone-950/60 px-2 py-1">
                                    抗性 {formatEnemyElements(targetedMonsterTemplate.resistances)}
                                </span>
                                <span className="col-span-2 rounded border border-stone-700 bg-stone-950/60 px-2 py-1">
                                    特殊攻擊：{formatEnemySpecialAttack(targetedMonsterTemplate)}
                                </span>
                            </div>
                            <div className="mt-2">
                                {worldCombatPresentation
                                  ? renderCombatCueBadges({
                                      cues: worldCombatPresentation.enemyStatusCues.map((cue, index) =>
                                        asRenderableCue(cue, index)
                                      ),
                                      emptyLabel: '目前無主要壓制',
                                      maxVisible: 4,
                                    })
                                  : renderStatusBadges(worldCombatTargetStatuses, 'enemy')}
                            </div>
                            {worldCombatPresentation && (
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                                            <span>敵方出手</span>
                                            <span className={worldCombatPresentation.enemyAction.ready ? 'text-rose-300' : 'text-amber-300'}>
                                                {worldCombatPresentation.enemyAction.ready ? '已就緒' : worldCombatPresentation.enemyAction.label}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                            <div
                                                className={clsx(
                                                    "h-full transition-all duration-150",
                                                    worldCombatPresentation.enemyAction.ready ? "bg-rose-500" : "bg-amber-500"
                                                )}
                                                style={{ width: `${worldCombatPresentation.enemyAction.fillPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                    {worldCombatPresentation.enemySpecial && (
                                        <div>
                                            <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                                                <span>{worldCombatPresentation.enemySpecial.name}</span>
                                                <span className={worldCombatPresentation.enemySpecial.ready ? 'text-rose-300' : 'text-amber-300'}>
                                                    {worldCombatPresentation.enemySpecial.ready ? '特招就緒' : worldCombatPresentation.enemySpecial.label}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full border border-stone-800 bg-stone-950">
                                                <div
                                                    className={clsx(
                                                        "h-full transition-all duration-150",
                                                        worldCombatPresentation.enemySpecial.ready ? "bg-rose-500" : "bg-amber-500"
                                                    )}
                                                    style={{ width: `${worldCombatPresentation.enemySpecial.fillPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-stone-800 bg-stone-950/70 px-3 py-2">
                        <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                            <span>最近戰況</span>
                        </div>
                        <div className="text-sm text-stone-300">
                            {worldLastCombatMessage ?? '尚未開始交手'}
                        </div>
                        {worldCombatPresentation && (
                            <div className={clsx(
                                'mt-2 text-[11px]',
                                COMBAT_CUE_TONE_STYLES[worldCombatPresentation.recentEventCue.tone].subText
                            )}>
                                {worldCombatPresentation.recentEventCue.detail}
                            </div>
                        )}
                        {worldCombatPresentation && (
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                <span className="rounded-full border border-emerald-900/60 bg-emerald-950/40 px-2 py-1 text-emerald-200">
                                    你的距離 {playerEngagementRange} 格
                                </span>
                                <span className="rounded-full border border-rose-900/60 bg-rose-950/40 px-2 py-1 text-rose-200">
                                    敵方危險區 {worldCombatPresentation.enemyEngagementRange} 格
                                </span>
                                <span className="rounded-full border border-stone-700 bg-stone-900/80 px-2 py-1 text-stone-300">
                                    {worldCombatPresentation.rolePresentation.label}
                                </span>
                                <span
                                    className={clsx(
                                        "rounded-full border px-2 py-1 font-semibold",
                                        COMBAT_CUE_TONE_STYLES[worldCombatPresentation.recentEventCue.tone].badge
                                    )}
                                >
                                    {worldCombatPresentation.recentEventCue.label}
                                </span>
                                {worldCombatPresentation.enemySpecial && (
                                    <span className="rounded-full border border-amber-900/60 bg-amber-950/40 px-2 py-1 text-amber-200">
                                        {worldCombatPresentation.enemySpecial.warningLabel}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Transition Overlay */}
            <div className={clsx(
                "absolute inset-0 z-50 bg-black pointer-events-none transition-opacity duration-500",
                isTransitioning ? "opacity-100" : "opacity-0"
            )} data-testid="adventure-transition-overlay"></div>

            {/* PixiJS Stage */}
            {gridMetrics.pixelWidth > 0 && mapData && (
                 activeStageRenderMode === 'pixel_prototype' ? (
                   <Suspense fallback={<div className="h-full w-full bg-stone-950" />}>
                     <AdventurePixelStagePrototype
                        key={`${currentMapId}-pixel-prototype`}
                        mapData={mapData}
                        playerPosition={playerPosition}
                        activeMonsters={activeMonsters}
                        portals={mapData.portals}
                        targetMonsterId={targetMonsterId}
                        combatPresentation={worldCombatPresentation?.stagePresentation ?? null}
                        width={gridMetrics.pixelWidth}
                        height={gridMetrics.pixelHeight}
                        onTileClick={handleGridClick}
                        onPlayerArrive={handlePlayerArrive}
                     />
                   </Suspense>
                 ) : (
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
                        combatPresentation={worldCombatPresentation?.stagePresentation ?? null}
                        isBattling={isBattling}
                        playerName={character.name}
                        moveDestination={autoMovePath.length > 0 ? autoMovePath[autoMovePath.length - 1] : null}
                        activeQuests={activeQuests}
                        completedQuests={completedQuests}
                     />
                 )
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
                                    {renderStatusBadges(latestBattleLog?.playerStatuses, 'player')}
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
                                    {renderStatusBadges(latestBattleLog?.enemyStatuses, 'enemy')}
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

        {combatUiState.showCombatCommandSurface && (
            <div
              className="pointer-events-none fixed bottom-24 right-4 z-[3100] flex flex-col items-end gap-2"
              data-testid="adventure-action-wheel"
            >
                <div className="pointer-events-auto flex items-end gap-2 rounded-[22px] border border-stone-700/80 bg-stone-950/86 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <Button
                            onClick={() => {
                                if (targetedMonster && canEngageTarget) {
                                    runPlayerWorldAction(false);
                                    setAutoMovePath([]);
                                }
                            }}
                            disabled={!targetedMonster || !canEngageTarget}
                            variant={targetedMonster && canEngageTarget ? "danger" : "stone"}
                            size="icon"
                            className={clsx(
                                "group relative h-12 w-12 rounded-2xl border",
                                targetedMonster && canEngageTarget
                                  ? "border-red-700 bg-red-950/60 text-red-200"
                                  : "cursor-not-allowed border-stone-800 bg-stone-950/60 text-stone-500"
                            )}
                            data-testid="adventure-action-basic-attack"
                        >
                            <Swords size={18} />
                            <GameHintBubble eyebrow="BASIC ATTACK" className="bottom-full right-0 mb-2">
                                {targetedMonster
                                  ? canEngageTarget
                                    ? '普攻：直接在場景內出手'
                                    : '目標尚未進入距離'
                                  : '未鎖定目標'}
                            </GameHintBubble>
                        </Button>

                        <Button
                            onClick={() => {
                                if (targetedMonster && canEngageTarget) {
                                    runPlayerWorldAction(true);
                                    setAutoMovePath([]);
                                }
                            }}
                            disabled={!primaryActiveSkill || !targetedMonster || !canEngageTarget}
                            variant={primaryActiveSkill && targetedMonster && canEngageTarget ? "amber" : "stone"}
                            size="icon"
                            className={clsx(
                                "group relative h-12 w-12 rounded-2xl border",
                                primaryActiveSkill && targetedMonster && canEngageTarget
                                  ? "border-amber-700 bg-amber-950/45 text-amber-200"
                                  : "cursor-not-allowed border-stone-800 bg-stone-950/60 text-stone-500"
                            )}
                            data-testid="adventure-action-active-skill"
                        >
                            <Zap size={18} />
                            <GameHintBubble eyebrow="ACTIVE SKILL" className="bottom-full right-0 mb-2">
                                {primaryActiveSkill?.name ?? '主動術式'}：{' '}
                                {primaryActiveSkill ? '直接施放主修術式' : '尚未習得主動術式'}
                            </GameHintBubble>
                        </Button>

                        <Button
                            onClick={() => setIsAutoBattling((prev) => !prev)}
                            variant={isAutoBattling ? "emerald" : "stone"}
                            size="icon"
                            className={clsx(
                                "group relative h-12 w-12 rounded-2xl border",
                                isAutoBattling
                                  ? "border-emerald-700 bg-emerald-950/45 text-emerald-200"
                                  : "border-stone-700 bg-stone-950/60 text-stone-300"
                            )}
                            data-testid="adventure-action-auto-battle"
                        >
                            <Target size={18} />
                            <GameHintBubble eyebrow="AUTO BATTLE" className="bottom-full right-0 mb-2">
                                {isAutoBattling ? '停止掛機' : '掛機：自動尋敵與追擊'}
                            </GameHintBubble>
                        </Button>

                        <Button
                            onClick={() => {
                                setIsMapModalOpen(true);
                                setMapTab('area');
                            }}
                            variant="stone"
                            size="icon"
                            className="group relative h-12 w-12 rounded-2xl border border-stone-700 bg-stone-950/60 text-stone-300"
                            data-testid="adventure-action-map"
                        >
                            <MapIcon size={18} />
                            <GameHintBubble eyebrow="MAP" className="bottom-full right-0 mb-2">
                                展開地區 / 世界地圖
                            </GameHintBubble>
                        </Button>
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
             <Button
               onClick={() => setIsMapModalOpen(false)}
               variant="stone"
               size="sm"
               data-testid="adventure-map-modal-close"
             >
               關閉
             </Button>
          }
        >
            <div className="flex h-full min-h-0 flex-col" data-testid="adventure-map-modal-content">
                {/* Tabs */}
                <Tabs
                    value={mapTab}
                    onValueChange={(value) => setMapTab(value as 'area' | 'world')}
                    className="mb-0 flex-none border-b border-stone-800 bg-stone-900 px-4 pt-2 md:bg-transparent md:px-0 md:pt-0"
                >
                    <TabsList className="grid min-h-0 w-full grid-cols-2 rounded-none border-0 border-stone-800 bg-transparent p-0">
                        <TabsTrigger
                            value="area"
                            className="rounded-none border-x-0 border-t-0 py-3"
                            data-testid="adventure-map-tab-area"
                        >
                            <Target size={16} /> 區域地圖
                        </TabsTrigger>
                        <TabsTrigger
                            value="world"
                            className="rounded-none border-x-0 border-t-0 py-3"
                            data-testid="adventure-map-tab-world"
                        >
                            <Globe size={16} /> 世界地圖
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative min-h-0 flex-1 overflow-hidden border-stone-800 bg-stone-950 md:rounded md:border">
                    {mapTab === 'area' && mapData && (
                        <div
                          className="custom-scrollbar relative flex h-full w-full items-center justify-center overflow-auto bg-stone-950 p-4"
                          data-testid="adventure-area-map"
                        >
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
                             className="relative cursor-pointer overflow-hidden border border-stone-800 shadow-2xl"
                             data-testid="adventure-area-map-surface"
                             style={{ 
                                 width: '100%', 
                                 maxWidth: '800px', // Slightly larger max width for big screen
                                 aspectRatio: `${mapData.width} / ${mapData.height}`,
                                 minWidth: '300px',
                                 ...areaMapSurfaceStyle,
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
                              <div
                                className="absolute z-20 h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-[0_0_10px_green] md:h-3 md:w-3"
                                data-testid="adventure-area-map-player"
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
