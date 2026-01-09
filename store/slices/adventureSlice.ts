
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Enemy, CombatLog, Coordinate, ActiveMonster, EnemyRank } from '../../types';
import { MAPS } from '../../data/maps';

interface AdventureState {
  currentMapId: string | null;
  playerPosition: Coordinate;
  visitedCells: Record<string, boolean>;
  activeMonsters: ActiveMonster[];
  mapHistory: Record<string, boolean>;
  isBattling: boolean;
  currentEnemy: Enemy | null;
  battleLogs: CombatLog[];
  lastBattleResult: 'won' | 'lost' | null;
  tickCount: number;
  lastCommonSpawnTime: number;
  lastEliteSpawnTime: number;
  lastBossSpawnCheckTime: number;
}

const initialState: AdventureState = {
  currentMapId: null,
  playerPosition: { x: 0, y: 0 },
  visitedCells: {},
  activeMonsters: [],
  mapHistory: {},
  isBattling: false,
  currentEnemy: null,
  battleLogs: [],
  lastBattleResult: null,
  tickCount: 0,
  lastCommonSpawnTime: 0,
  lastEliteSpawnTime: 0,
  lastBossSpawnCheckTime: 0,
};

const MAX_MONSTERS_PER_MAP = 20;

const adventureSlice = createSlice({
  name: 'adventure',
  initialState,
  reducers: {
    enterMap: (state, action: PayloadAction<{ mapId: string; startX?: number; startY?: number }>) => {
      const { mapId, startX, startY } = action.payload;
      const mapData = MAPS.find(m => m.id === mapId);
      if (!mapData) return;

      state.currentMapId = mapId;
      state.playerPosition = { x: startX ?? 0, y: startY ?? 0 };
      state.visitedCells = { [`${state.playerPosition.x},${state.playerPosition.y}`]: true };
      
      // Spawn Monsters Logic
      state.activeMonsters = [];
      
      // Filter templates
      const commonPool = mapData.enemies.filter(e => e.rank === EnemyRank.Common);
      const elitePool = mapData.enemies.filter(e => e.rank === EnemyRank.Elite);

      // Spawn Logic: 80% Common, 20% Elite roughly, capped at MAX
      for(let i=0; i<MAX_MONSTERS_PER_MAP; i++) {
          const isElite = Math.random() < 0.2 && elitePool.length > 0;
          const template = isElite 
              ? elitePool[Math.floor(Math.random() * elitePool.length)]
              : commonPool.length > 0 ? commonPool[Math.floor(Math.random() * commonPool.length)] : null;
          
          if (template) {
              const rx = Math.floor(Math.random() * mapData.width);
              const ry = Math.floor(Math.random() * mapData.height);
              state.activeMonsters.push({
                  instanceId: Math.random().toString(36),
                  templateId: template.id,
                  name: template.name,
                  symbol: template.symbol,
                  x: rx,
                  y: ry,
                  spawnX: rx,
                  spawnY: ry,
                  currentHp: template.maxHp,
                  rank: template.rank,
                  nextMoveTime: Date.now() + Math.random() * 2000 + 2000 // 2-4s initial delay
              });
          }
      }

      // Add Boss (Fixed)
      if (mapData.bossSpawn) {
          const bossTemplate = mapData.enemies.find(e => e.rank === EnemyRank.Boss);
          if (bossTemplate) {
             state.activeMonsters.push({
                  instanceId: 'boss_instance',
                  templateId: bossTemplate.id,
                  name: bossTemplate.name,
                  symbol: bossTemplate.symbol,
                  x: mapData.bossSpawn.x,
                  y: mapData.bossSpawn.y,
                  spawnX: mapData.bossSpawn.x,
                  spawnY: mapData.bossSpawn.y,
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

      state.playerPosition = { x: newX, y: newY };
      state.visitedCells[`${newX},${newY}`] = true;

      // Collision Check
      const collidedMonsterIndex = state.activeMonsters.findIndex(m => m.x === newX && m.y === newY);
      if (collidedMonsterIndex !== -1) {
          const monster = state.activeMonsters[collidedMonsterIndex];
          const template = mapData.enemies.find(e => e.id === monster.templateId);
          if (template) {
              state.currentEnemy = template;
              state.isBattling = true;
              state.battleLogs = [];
              state.lastBattleResult = null;
              // Do NOT remove monster yet. Only remove if player wins.
          } else {
              // Template not found, safe to remove
              state.activeMonsters.splice(collidedMonsterIndex, 1);
          }
      }
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

       const spawnMonster = (template: Enemy, isBoss: boolean = false) => {
           let rx, ry;
           if (isBoss && mapData.bossSpawn) {
               rx = mapData.bossSpawn.x;
               ry = mapData.bossSpawn.y;
           } else {
               rx = Math.floor(Math.random() * mapData.width);
               ry = Math.floor(Math.random() * mapData.height);
               if ((rx === state.playerPosition.x && ry === state.playerPosition.y) || 
                   mapData.portals.some(p => p.x === rx && p.y === ry)) {
                   rx = (rx + 2) % mapData.width;
                   ry = (ry + 2) % mapData.height;
               }
           }

           state.activeMonsters.push({
               instanceId: isBoss ? 'boss_instance' : Math.random().toString(36),
               templateId: template.id,
               name: template.name,
               symbol: template.symbol,
               x: rx, 
               y: ry,
               spawnX: rx,
               spawnY: ry,
               currentHp: template.maxHp,
               rank: template.rank,
               nextMoveTime: now + Math.random() * 2000 + 2000 // 2-4s delay
           });
       };

       // 1. Common Respawn (Every 1 min if < 12)
       if (now - state.lastCommonSpawnTime > 60000 && commonCount < 12 && commonPool.length > 0) {
           spawnMonster(commonPool[Math.floor(Math.random() * commonPool.length)]);
           state.lastCommonSpawnTime = now;
       }

       // 2. Elite Respawn (Every 2 min if < 3)
       if (now - state.lastEliteSpawnTime > 120000 && eliteCount < 3 && elitePool.length > 0) {
           spawnMonster(elitePool[Math.floor(Math.random() * elitePool.length)]);
           state.lastEliteSpawnTime = now;
       }

       // 3. Boss Respawn (At 00, 15, 30, 45 mins of current hour)
       const currentMinute = new Date(now).getMinutes();
       if ([0, 15, 30, 45].includes(currentMinute)) {
           // Only check if time advanced to a new check window
           // Prevent multiple checks within the same minute frame, or just simplistic check
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
           let aggroRange = 0;
           if (monster.rank === EnemyRank.Elite) aggroRange = 6;
           if (monster.rank === EnemyRank.Boss) aggroRange = 10;

           const distToPlayer = Math.abs(monster.x - state.playerPosition.x) + Math.abs(monster.y - state.playerPosition.y);
           let dx = 0, dy = 0;

           if (aggroRange > 0 && distToPlayer <= aggroRange) {
               // Chase Player
               if (monster.x < state.playerPosition.x) dx = 1;
               else if (monster.x > state.playerPosition.x) dx = -1;
               
               if (monster.y < state.playerPosition.y) dy = 1;
               else if (monster.y > state.playerPosition.y) dy = -1;
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
               if (nx >= 0 && nx < mapData.width && ny >= 0 && ny < mapData.height) {
                   monster.x = nx;
                   monster.y = ny;
               }
           }

           // Set next move time (2-4s)
           monster.nextMoveTime = now + Math.random() * 2000 + 2000;

           // Check Collision (Monster hit Player)
           if (monster.x === state.playerPosition.x && monster.y === state.playerPosition.y) {
              const template = mapData.enemies.find(e => e.id === monster.templateId);
              if (template) {
                  state.currentEnemy = template;
                  state.isBattling = true;
                  state.battleLogs = [];
                  state.lastBattleResult = null;
                  // Do NOT mark for cleanup. Wait for resolveBattle result.
              }
           }
       });

       state.activeMonsters = state.activeMonsters.filter(m => m.currentHp > 0);
    },

    resolveBattle: (state, action: PayloadAction<{ won: boolean; logs: CombatLog[] }>) => {
        state.battleLogs = action.payload.logs;
        state.lastBattleResult = action.payload.won ? 'won' : 'lost';
        
        if (action.payload.won) {
            // Remove the monster on tile
            if (state.currentEnemy) {
                 state.activeMonsters = state.activeMonsters.filter(m => 
                    !(m.x === state.playerPosition.x && m.y === state.playerPosition.y && m.templateId === state.currentEnemy!.id)
                );
            }
            // state.currentEnemy = null; // Keep currentEnemy for the report UI. Cleared in closeBattleReport.
        } else {
            // Player Lost: Teleport to Qingyun Sect (Map 0)
            state.currentMapId = '0';
            state.playerPosition = { x: 20, y: 20 }; // Safe center of Start Map
            state.visitedCells = { '20,20': true };
            state.activeMonsters = []; // Map 0 is safe zone
            state.battleLogs.push({ 
                turn: 0, 
                isPlayer: false, 
                message: "戰敗重傷，已被傳送回青雲仙宗修養。", 
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
        state.battleLogs = [];
        state.lastBattleResult = null;
    }
  },
});

export const { enterMap, movePlayer, tickMonsters, resolveBattle, closeBattleReport, markMapVisited } = adventureSlice.actions;
export default adventureSlice.reducer;
