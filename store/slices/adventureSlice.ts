
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
              state.activeMonsters.push({
                  instanceId: Math.random().toString(36),
                  templateId: template.id,
                  x: Math.floor(Math.random() * mapData.width),
                  y: Math.floor(Math.random() * mapData.height),
                  currentHp: template.maxHp,
                  rank: template.rank
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
                  x: mapData.bossSpawn.x,
                  y: mapData.bossSpawn.y,
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
              state.activeMonsters.splice(collidedMonsterIndex, 1);
          } else {
              // Template not found (invalid/outdated monster), remove it silently
              console.warn(`[Collision] Template not found for monster: ${monster.templateId} on map ${state.currentMapId}`, {
                  enemiesOnMap: mapData.enemies.map(e => e.id)
              });
              state.activeMonsters.splice(collidedMonsterIndex, 1);
          }
      }
    },

    tickMonsters: (state) => {
       if (state.isBattling || !state.currentMapId) return;
       const mapData = MAPS.find(m => m.id === state.currentMapId);
       if (!mapData) return;

       state.tickCount += 1;

       // --- Respawn Logic ---
       const commonPool = mapData.enemies.filter(e => e.rank === EnemyRank.Common);
       const elitePool = mapData.enemies.filter(e => e.rank === EnemyRank.Elite);

       const spawnMonster = (template: Enemy) => {
           // Simple collision-free spawn
           let rx = Math.floor(Math.random() * mapData.width);
           let ry = Math.floor(Math.random() * mapData.height);
           
           // Evade player and portals
           const isInvalid = (x: number, y: number) => 
               (x === state.playerPosition.x && y === state.playerPosition.y) || 
               mapData.portals.some(p => p.x === x && p.y === y);

           if (isInvalid(rx, ry)) {
               rx = (rx + 2) % mapData.width;
               ry = (ry + 2) % mapData.height;
           }

           state.activeMonsters.push({
               instanceId: Math.random().toString(36),
               templateId: template.id,
               x: rx,
               y: ry,
               currentHp: template.maxHp,
               rank: template.rank
           });
       };

       // Respawn Common (5s)
       if (state.tickCount % 5 === 0 && state.activeMonsters.filter(m => m.rank === EnemyRank.Common).length < 12) {
           if (commonPool.length > 0) spawnMonster(commonPool[Math.floor(Math.random() * commonPool.length)]);
       }
       // Respawn Elite (30s)
       if (state.tickCount % 30 === 0 && state.activeMonsters.filter(m => m.rank === EnemyRank.Elite).length < 3) {
           if (elitePool.length > 0) spawnMonster(elitePool[Math.floor(Math.random() * elitePool.length)]);
       }

       // --- Movement Logic ---
       state.activeMonsters.forEach(monster => {
           if (monster.rank === EnemyRank.Boss) return; // Boss stationary

           let dx = 0, dy = 0;

           // Elite AI: Track Player if nearby (radius 5)
           if (monster.rank === EnemyRank.Elite) {
               const dist = Math.abs(monster.x - state.playerPosition.x) + Math.abs(monster.y - state.playerPosition.y);
               if (dist <= 5) {
                   if (monster.x < state.playerPosition.x) dx = 1;
                   else if (monster.x > state.playerPosition.x) dx = -1;
                   else if (monster.y < state.playerPosition.y) dy = 1;
                   else if (monster.y > state.playerPosition.y) dy = -1;
               }
           }

           // Common AI (or Elite not tracking): Random
           if (dx === 0 && dy === 0) {
                const move = Math.floor(Math.random() * 8); // Less frequent random move
                if (move === 0) dx = 1;
                else if (move === 1) dx = -1;
                else if (move === 2) dy = 1;
                else if (move === 3) dy = -1;
           }

           const nx = monster.x + dx;
           const ny = monster.y + dy;

           if (nx >= 0 && nx < mapData.width && ny >= 0 && ny < mapData.height) {
               monster.x = nx;
               monster.y = ny;
           }

           // Check Collision (Monster hit Player)
           if (monster.x === state.playerPosition.x && monster.y === state.playerPosition.y) {
              const template = mapData.enemies.find(e => e.id === monster.templateId);
              if (template) {
                  state.currentEnemy = template;
                  state.isBattling = true;
                  state.battleLogs = [];
                  state.lastBattleResult = null;
                  monster.currentHp = -1; // Mark for cleanup
              }
           }
       });

       state.activeMonsters = state.activeMonsters.filter(m => m.currentHp > 0);
    },

    resolveBattle: (state, action: PayloadAction<{ won: boolean; logs: CombatLog[] }>) => {
        state.battleLogs = action.payload.logs;
        state.lastBattleResult = action.payload.won ? 'won' : 'lost';
        if (action.payload.won) {
            state.currentEnemy = null;
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
