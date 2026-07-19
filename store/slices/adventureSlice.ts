
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ActiveMonster,
  AutoConsumableSettings,
  CombatLog,
  Coordinate,
  Enemy,
  EnemyRank,
  MapData,
  NPC,
  VisualEffect,
} from '../../types';
import { MAPS } from '../../data/maps';
import {
  BOSS_RESPAWN_MINUTES,
  COMMON_MONSTER_RESPAWN_MS,
  ELITE_MONSTER_RESPAWN_MS,
  MONSTER_MOVE_MAX_DELAY_MS,
  MONSTER_MOVE_MIN_DELAY_MS,
} from '../../constants';
import {
  getEnemyAggroRange,
  getEnemyEngagementRange,
  getGridDistance,
  shouldEnemyHoldPreferredRange,
  shouldEnemyRetreatFromCloseRange,
  shouldEnemyStrafeNearRange,
} from '../../utils/worldCombat';
import {
  DEFAULT_AUTO_CONSUMABLE_SETTINGS,
  sanitizeAutoConsumableSettings,
} from '../../utils/autoConsumableSettings';
import { isAdventureTerrainBlocked } from '../../utils/adventureTerrainNavigation';

interface AdventureState {
  currentMapId: string | null;
  playerPosition: Coordinate;
  visitedCells: Record<string, boolean>;
  activeMonsters: ActiveMonster[];
  mapHistory: Record<string, boolean>;
  isBattling: boolean;
  currentEnemy: Enemy | null;
  currentEnemyInstanceId: string | null;
  battleLogs: CombatLog[];
  lastBattleResult: 'won' | 'lost' | null;
  tickCount: number;
  lastCommonSpawnTime: number;
  lastEliteSpawnTime: number;
  lastBossSpawnCheckTime: number;
  visualEffects: VisualEffect[];
  autoConsumableSettings: AutoConsumableSettings;
  worldPlayerResources: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
  } | null;
}

const initialState: AdventureState = {
  currentMapId: null,
  playerPosition: { x: 0, y: 0 },
  visitedCells: {},
  activeMonsters: [],
  mapHistory: {},
  isBattling: false,
  currentEnemy: null,
  currentEnemyInstanceId: null,
  battleLogs: [],
  lastBattleResult: null,
  tickCount: 0,
  lastCommonSpawnTime: 0,
  lastEliteSpawnTime: 0,
  lastBossSpawnCheckTime: 0,
  visualEffects: [],
  autoConsumableSettings: DEFAULT_AUTO_CONSUMABLE_SETTINGS,
  worldPlayerResources: null,
};

const getMapPopulationCaps = (width: number, height: number, hasElites: boolean) => {
    let totalCap = 30; // Small (<100)
    if (width >= 200 || height >= 200) totalCap = 100; // Huge
    else if (width >= 150 || height >= 150) totalCap = 75; // Large
    else if (width >= 100 || height >= 100) totalCap = 50; // Standard

    // Elite Ratio: 20%
    const eliteCap = hasElites ? Math.floor(totalCap * 0.2) : 0;
    const commonCap = totalCap - eliteCap;

    return { commonCap, eliteCap };
};

const getRandomMoveDelay = () =>
  Math.random() * (MONSTER_MOVE_MAX_DELAY_MS - MONSTER_MOVE_MIN_DELAY_MS) +
  MONSTER_MOVE_MIN_DELAY_MS;

const isOccupiedCell = (
  monsters: ActiveMonster[],
  x: number,
  y: number,
  playerPosition?: Coordinate,
  ignoreInstanceId?: string
) => {
  if (playerPosition && playerPosition.x === x && playerPosition.y === y) {
    return true;
  }

  return monsters.some(
    (monster) =>
      monster.instanceId !== ignoreInstanceId && monster.x === x && monster.y === y
  );
};

const isNpcCell = (npcs: NPC[] = [], x: number, y: number) =>
  npcs.some((npc) => npc.x === x && npc.y === y);

const isBlockedForPlayer = (
  mapData: MapData,
  monsters: ActiveMonster[],
  x: number,
  y: number
) =>
  isAdventureTerrainBlocked(mapData, x, y) ||
  isNpcCell(mapData.npcs, x, y) ||
  isOccupiedCell(monsters, x, y);

const resolvePlayerStartPosition = (
  mapData: MapData,
  preferred: Coordinate
) => {
  const candidates: Coordinate[] = [
    preferred,
    { x: preferred.x + 1, y: preferred.y },
    { x: preferred.x - 1, y: preferred.y },
    { x: preferred.x, y: preferred.y + 1 },
    { x: preferred.x, y: preferred.y - 1 },
  ];

  return (
    candidates.find(
      (candidate) =>
        candidate.x >= 0 &&
        candidate.x < mapData.width &&
        candidate.y >= 0 &&
        candidate.y < mapData.height &&
        !isAdventureTerrainBlocked(mapData, candidate.x, candidate.y) &&
        !isNpcCell(mapData.npcs, candidate.x, candidate.y)
    ) ?? preferred
  );
};

const findOpenCoordinate = (
  mapData: MapData,
  monsters: ActiveMonster[],
  playerPosition: Coordinate,
  preferred?: Coordinate
) => {
  const tryPositions: Coordinate[] = preferred ? [preferred] : [];

  for (let attempt = 0; attempt < 24; attempt += 1) {
    tryPositions.push({
      x: Math.floor(Math.random() * mapData.width),
      y: Math.floor(Math.random() * mapData.height),
    });
  }

  for (const position of tryPositions) {
    if (
      position.x < 0 ||
      position.x >= mapData.width ||
      position.y < 0 ||
      position.y >= mapData.height
    ) {
      continue;
    }

    if (
      !isAdventureTerrainBlocked(mapData, position.x, position.y) &&
      !isOccupiedCell(monsters, position.x, position.y, playerPosition)
    ) {
      return position;
    }
  }

  return null;
};

const beginBattleWithMonster = (
  state: AdventureState,
  mapId: string,
  monsterInstanceId: string
) => {
  const mapData = MAPS.find(m => m.id === mapId);
  if (!mapData) return false;

  const monster = state.activeMonsters.find(m => m.instanceId === monsterInstanceId);
  if (!monster) return false;

  const template = mapData.enemies.find(e => e.id === monster.templateId);
  if (!template) {
    state.activeMonsters = state.activeMonsters.filter(m => m.instanceId !== monsterInstanceId);
    return false;
  }

  state.currentEnemy = template;
  state.currentEnemyInstanceId = monsterInstanceId;
  state.isBattling = true;
  state.battleLogs = [];
  state.lastBattleResult = null;
  return true;
};

const adventureSlice = createSlice({
  name: 'adventure',
  initialState,
  reducers: {
    enterMap: (state, action: PayloadAction<{ mapId: string; startX?: number; startY?: number }>) => {
      const { mapId, startX, startY } = action.payload;
      const mapData = MAPS.find(m => m.id === mapId);
      if (!mapData) return;

      state.currentMapId = mapId;
      state.playerPosition = resolvePlayerStartPosition(mapData, {
        x: startX ?? 0,
        y: startY ?? 0,
      });
      state.visitedCells = { [`${state.playerPosition.x},${state.playerPosition.y}`]: true };
      
      // Spawn Monsters Logic
      state.activeMonsters = [];
      
      const commonPool = mapData.enemies.filter(e => e.rank === EnemyRank.Common);
      const elitePool = mapData.enemies.filter(e => e.rank === EnemyRank.Elite);
      
      const { commonCap, eliteCap } = getMapPopulationCaps(mapData.width, mapData.height, elitePool.length > 0);

      // 1. Spawn Common
      if (commonPool.length > 0) {
          for(let i=0; i<commonCap; i++) {
              const template = commonPool[Math.floor(Math.random() * commonPool.length)];
              const openPosition = findOpenCoordinate(
                mapData,
                state.activeMonsters,
                state.playerPosition
              );
              if (!openPosition) break;
              state.activeMonsters.push({
                   instanceId: Math.random().toString(36),
                   templateId: template.id,
                   name: template.name,
                   symbol: template.symbol,
                   x: openPosition.x, y: openPosition.y, spawnX: openPosition.x, spawnY: openPosition.y,
                   currentHp: template.maxHp,
                   rank: template.rank,
                   nextMoveTime: Date.now() + getRandomMoveDelay()
              });
          }
      }

      // 2. Spawn Elite
      if (elitePool.length > 0) {
          for(let i=0; i<eliteCap; i++) {
              const template = elitePool[Math.floor(Math.random() * elitePool.length)];
              const openPosition = findOpenCoordinate(
                mapData,
                state.activeMonsters,
                state.playerPosition
              );
              if (!openPosition) break;
              state.activeMonsters.push({
                   instanceId: Math.random().toString(36),
                   templateId: template.id,
                   name: template.name,
                   symbol: template.symbol,
                   x: openPosition.x, y: openPosition.y, spawnX: openPosition.x, spawnY: openPosition.y,
                   currentHp: template.maxHp,
                   rank: template.rank,
                   nextMoveTime: Date.now() + getRandomMoveDelay()
              });
          }
      }

      // Add Boss (Fixed)
      if (mapData.bossSpawn) {
          const bossTemplate = mapData.enemies.find(e => e.rank === EnemyRank.Boss);
          if (bossTemplate) {
             const bossPosition = findOpenCoordinate(
               mapData,
               state.activeMonsters,
               state.playerPosition,
               { x: mapData.bossSpawn.x, y: mapData.bossSpawn.y }
             );
             if (!bossPosition) return;
             state.activeMonsters.push({
                  instanceId: 'boss_instance',
                  templateId: bossTemplate.id,
                  name: bossTemplate.name,
                  symbol: bossTemplate.symbol,
                  x: bossPosition.x,
                  y: bossPosition.y,
                  spawnX: bossPosition.x,
                  spawnY: bossPosition.y,
                  currentHp: bossTemplate.maxHp,
                  rank: EnemyRank.Boss
             });
          }
      }
    },

    markMapVisited: (state, action: PayloadAction<string>) => {
        state.mapHistory[action.payload] = true;
    },

    movePlayer: (state, action: PayloadAction<{ dx: number; dy: number }>) => {
      if (state.isBattling || !state.currentMapId) return;
      const mapData = MAPS.find(m => m.id === state.currentMapId);
      if (!mapData) return;

      const newX = state.playerPosition.x + action.payload.dx;
      const newY = state.playerPosition.y + action.payload.dy;

      if (newX < 0 || newX >= mapData.width || newY < 0 || newY >= mapData.height) return;
      if (isBlockedForPlayer(mapData, state.activeMonsters, newX, newY)) return;

      state.playerPosition = { x: newX, y: newY };
      state.visitedCells[`${newX},${newY}`] = true;
    },

    engageMonster: (state, action: PayloadAction<{ monsterInstanceId: string }>) => {
      if (state.isBattling || !state.currentMapId) return;
      beginBattleWithMonster(state, state.currentMapId, action.payload.monsterInstanceId);
    },

    applyWorldDamageToMonster: (
      state,
      action: PayloadAction<{ monsterInstanceId: string; damage: number }>
    ) => {
      const monster = state.activeMonsters.find(
        (entry) => entry.instanceId === action.payload.monsterInstanceId
      );
      if (!monster) return;

      monster.currentHp = Math.max(
        0,
        monster.currentHp - Math.max(0, action.payload.damage)
      );
      state.activeMonsters = state.activeMonsters.filter(
        (entry) => entry.currentHp > 0
      );
    },

    tickMonsters: (state) => {
       if (state.isBattling || !state.currentMapId) return;
       const mapData = MAPS.find(m => m.id === state.currentMapId);
       if (!mapData) return;
       
       const now = Date.now();
       state.tickCount += 1;

       // --- Respawn Monitoring ---
       const commonCount = state.activeMonsters.filter(m => m.rank === EnemyRank.Common).length;
       const eliteCount = state.activeMonsters.filter(m => m.rank === EnemyRank.Elite).length;
       const commonPool = mapData.enemies.filter(e => e.rank === EnemyRank.Common);
       const elitePool = mapData.enemies.filter(e => e.rank === EnemyRank.Elite);
       const bossTemplate = mapData.enemies.find(e => e.rank === EnemyRank.Boss);

       // Reconfigure Caps based on same logic
       const { commonCap, eliteCap } = getMapPopulationCaps(mapData.width, mapData.height, elitePool.length > 0);

       const spawnMonster = (template: Enemy, isBoss: boolean = false) => {
           const preferredPosition =
             isBoss && mapData.bossSpawn
               ? { x: mapData.bossSpawn.x, y: mapData.bossSpawn.y }
               : undefined;
           const openPosition = findOpenCoordinate(
             mapData,
             state.activeMonsters,
             state.playerPosition,
             preferredPosition
           );
           if (!openPosition) return;

           state.activeMonsters.push({
               instanceId: isBoss ? 'boss_instance' : Math.random().toString(36),
               templateId: template.id,
               name: template.name,
               symbol: template.symbol,
               x: openPosition.x, 
               y: openPosition.y,
               spawnX: openPosition.x,
               spawnY: openPosition.y,
               currentHp: template.maxHp,
               rank: template.rank,
               nextMoveTime: now + getRandomMoveDelay()
           });
       };

       // 1. Common Respawn (Refill every 60s, Max 20% of Total Cap)
       if (now - state.lastCommonSpawnTime > COMMON_MONSTER_RESPAWN_MS && commonCount < commonCap && commonPool.length > 0) {
           const maxSpawn = Math.max(1, Math.floor(commonCap * 0.2)); // Cap at 20%
           let spawned = 0;
           while(commonCount + spawned < commonCap && spawned < maxSpawn) {
                spawnMonster(commonPool[Math.floor(Math.random() * commonPool.length)]);
                spawned++;
           }
           state.lastCommonSpawnTime = now;
       }

       // 2. Elite Respawn (Refill every 3 mins, Max 20% of Total Cap)
       if (now - state.lastEliteSpawnTime > ELITE_MONSTER_RESPAWN_MS && eliteCount < eliteCap && elitePool.length > 0) {
           const maxSpawn = Math.max(1, Math.floor(eliteCap * 0.2)); // Cap at 20%
           let spawned = 0;
           while(eliteCount + spawned < eliteCap && spawned < maxSpawn) {
                spawnMonster(elitePool[Math.floor(Math.random() * elitePool.length)]);
                spawned++;
           }
           state.lastEliteSpawnTime = now;
       }

       // 3. Boss Respawn (At 00, 15, 30, 45 mins)
       const currentMinute = new Date(now).getMinutes();
       if (BOSS_RESPAWN_MINUTES.includes(currentMinute as (typeof BOSS_RESPAWN_MINUTES)[number])) {
           const lastCheckDate = new Date(state.lastBossSpawnCheckTime);
           const isDifferentMinute = lastCheckDate.getMinutes() !== currentMinute || (now - state.lastBossSpawnCheckTime > 60000);
           
           if (isDifferentMinute && bossTemplate) {
               const isBossAlive = state.activeMonsters.some(m => m.rank === EnemyRank.Boss);
               if (!isBossAlive) {
                   spawnMonster(bossTemplate, true);
               }
               state.lastBossSpawnCheckTime = now;
           }
       }

       // --- Movement Logic ---
       state.activeMonsters.forEach(monster => {
           if (state.isBattling) return;
           
           // Interval Check (2-4s)
           // If nextMoveTime is undefined (legacy), defaulting to now.
           if (monster.nextMoveTime && now < monster.nextMoveTime) return;

           // Determine Aggro Range
           const template = mapData.enemies.find(e => e.id === monster.templateId);
           if (!template) {
             monster.currentHp = 0;
             return;
           }

           const aggroRange = getEnemyAggroRange(template);
           const engagementRange = getEnemyEngagementRange(template);
           const distToPlayer = getGridDistance(monster, state.playerPosition);
           let dx = 0, dy = 0;

           if (aggroRange > 0 && distToPlayer <= aggroRange) {
               if (shouldEnemyRetreatFromCloseRange(template, distToPlayer)) {
                   if (monster.x < state.playerPosition.x) dx = -1;
                   else if (monster.x > state.playerPosition.x) dx = 1;

                   if (monster.y < state.playerPosition.y) dy = -1;
                   else if (monster.y > state.playerPosition.y) dy = 1;
               } else if (shouldEnemyHoldPreferredRange(template, distToPlayer)) {
                   if (shouldEnemyStrafeNearRange(template, distToPlayer)) {
                       const deltaX = state.playerPosition.x - monster.x;
                       const deltaY = state.playerPosition.y - monster.y;
                       if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                           dy = Math.random() < 0.5 ? -1 : 1;
                       } else {
                           dx = Math.random() < 0.5 ? -1 : 1;
                       }
                   }
               } else if (shouldEnemyStrafeNearRange(template, distToPlayer)) {
                   const deltaX = state.playerPosition.x - monster.x;
                   const deltaY = state.playerPosition.y - monster.y;
                   if (Math.abs(deltaX) >= Math.abs(deltaY)) {
                       dy = Math.random() < 0.5 ? -1 : 1;
                   } else {
                       dx = Math.random() < 0.5 ? -1 : 1;
                   }
               } else {
                   // Chase Player
                   if (monster.x < state.playerPosition.x) dx = 1;
                   else if (monster.x > state.playerPosition.x) dx = -1;
                   
                   if (monster.y < state.playerPosition.y) dy = 1;
                   else if (monster.y > state.playerPosition.y) dy = -1;
               }
           } else {
               // Wander within Tether (Radius 3)
               // Pick random direction
               const tryDx = Math.floor(Math.random() * 3) - 1;
               const tryDy = Math.floor(Math.random() * 3) - 1;
               
               const potentialX = monster.x + tryDx;
               const potentialY = monster.y + tryDy;
               
               // Check Tether
               // If spawnX is undefined (legacy), use current as center or skip
               const sX = monster.spawnX ?? monster.x;
               const sY = monster.spawnY ?? monster.y;

               const distToSpawn = Math.abs(potentialX - sX) + Math.abs(potentialY - sY);
               
               if (distToSpawn <= 3) {
                   dx = tryDx;
                   dy = tryDy;
               } 
               
               // Return to tether if currently outside
               const currentDistToSpawn = Math.abs(monster.x - sX) + Math.abs(monster.y - sY);
               if (currentDistToSpawn > 3) {
                   if (monster.x < sX) dx = 1;
                   else if (monster.x > sX) dx = -1;
                   if (monster.y < sY) dy = 1;
                   else if (monster.y > sY) dy = -1;
               }
           }

           if (dx !== 0 || dy !== 0) {
               const nx = monster.x + dx;
               const ny = monster.y + dy;

               // Boundary Check
               if (
                 nx >= 0 &&
                 nx < mapData.width &&
                 ny >= 0 &&
                 ny < mapData.height &&
                 !isAdventureTerrainBlocked(mapData, nx, ny) &&
                 !isOccupiedCell(
                   state.activeMonsters,
                   nx,
                   ny,
                   state.playerPosition,
                   monster.instanceId
                 )
               ) {
                   monster.x = nx;
                   monster.y = ny;
               }
           }

           // Set next move time (2-4s)
           monster.nextMoveTime = now + getRandomMoveDelay();

       });

       state.activeMonsters = state.activeMonsters.filter(m => m.currentHp > 0);
    },

    resolveBattle: (state, action: PayloadAction<{ won: boolean; logs: CombatLog[]; respawnMapId?: string }>) => {
        state.battleLogs = action.payload.logs;
        state.lastBattleResult = action.payload.won ? 'won' : 'lost';
        
        if (action.payload.won) {
            if (state.currentEnemyInstanceId) {
                 state.activeMonsters = state.activeMonsters.filter(m => 
                    m.instanceId !== state.currentEnemyInstanceId
                );
            }
        } else {
            // Player Lost: Teleport to Respawn Point (Sect or Start)
            const respawnId = action.payload.respawnMapId || '0';
            const respawnName = respawnId === '0' ? '仙緣鎮' : (respawnId === '4' ? '凌霄劍宗' : (respawnId === '23' ? '縹緲仙宮' : (respawnId === '14' ? '萬獸山莊' : '安全區域')));

            state.currentMapId = respawnId;
            state.playerPosition = { x: 20, y: 20 }; // Safe center for 40x40+ maps
            state.visitedCells = { '20,20': true };
            state.activeMonsters = []; // Safe zone reset
            state.battleLogs.push({ 
                turn: 0, 
                isPlayer: false, 
                message: `戰敗重傷，已被傳送回${respawnName}修養。`, 
                damage: 0,
                playerHp: 0,
                playerMaxHp: 0,
                enemyHp: state.currentEnemy?.hp || 0,
                enemyMaxHp: state.currentEnemy?.maxHp || 0
            });
        }
    },
    
    closeBattleReport: (state) => {
        state.isBattling = false;
        state.currentEnemy = null;
        state.currentEnemyInstanceId = null;
        state.battleLogs = [];
        state.lastBattleResult = null;
    },

    cancelBattle: (state) => {
        state.isBattling = false;
        state.currentEnemy = null;
        state.currentEnemyInstanceId = null;
        state.battleLogs = [];
        state.lastBattleResult = null;
        // Monster is preserved in activeMonsters array automatically
    },
    
    addVisualEffect: (state, action: PayloadAction<Omit<VisualEffect, 'id'>>) => {
        if (!state.visualEffects) state.visualEffects = [];
        state.visualEffects.push({
            id: Math.random().toString(36),
            ...action.payload
        });
    },

    clearVisualEffect: (state, action: PayloadAction<string>) => {
        if (!state.visualEffects) return;
        state.visualEffects = state.visualEffects.filter(e => e.id !== action.payload);
    },
    setAutoConsumableSettings: (
      state,
      action: PayloadAction<Partial<AutoConsumableSettings>>
    ) => {
      state.autoConsumableSettings = sanitizeAutoConsumableSettings({
        ...state.autoConsumableSettings,
        ...action.payload,
      });
    },
    setWorldPlayerResources: (
      state,
      action: PayloadAction<NonNullable<AdventureState["worldPlayerResources"]>>
    ) => {
      state.worldPlayerResources = action.payload;
    },
    clearWorldPlayerResources: (state) => {
      state.worldPlayerResources = null;
    },
    resetAdventure: () => initialState,
  },
});

export const {
  enterMap,
  movePlayer,
  tickMonsters,
  engageMonster,
  applyWorldDamageToMonster,
  resolveBattle,
  closeBattleReport,
  cancelBattle,
  markMapVisited,
  addVisualEffect,
  clearVisualEffect,
  setAutoConsumableSettings,
  setWorldPlayerResources,
  clearWorldPlayerResources,
  resetAdventure,
} = adventureSlice.actions;
export default adventureSlice.reducer;
