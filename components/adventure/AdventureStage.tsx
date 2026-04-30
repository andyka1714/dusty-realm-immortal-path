import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { useSelector, useDispatch } from 'react-redux'; // Added Redux hooks
import { RootState } from '../../store/store'; // Fixed import path
import { clearVisualEffect } from '../../store/slices/adventureSlice';
import { MapData, Coordinate, Portal, EnemyRank, ActiveMonster, MajorRealm, Quest, QuestStatus, VisualEffect, Gender } from '../../types';
import { MOVEMENT_SPEEDS } from '../../constants';
import { QUESTS } from '../../data/quests'; // Import QUESTS
import { current } from '@reduxjs/toolkit';
import { getVisualEffectPresentation } from '../../utils/visualEffectPresentation';
import type { WorldCombatStagePresentation } from '../../utils/worldCombatPresentation';
import {
  assertAdventureTerrainTilesAreSafeForOfficialStage,
  buildAdventureTerrainTiles,
  resolveAdventureTerrainRenderMotif,
  type AdventureTerrainTile,
  resolveAdventureTerrainPalette,
} from '../../utils/adventureTerrainPixelization';
import { getAssetFileUrl, getAssetFrameFileUrls } from '../../data/assets';
import {
  getCharacterSpriteLayout,
  getCharacterTileAnchorPosition,
  getPlayerCombatSpriteFrame,
  getPlayerSpriteDirectionFromDelta,
  getPlayerSpriteDirectionTowardTarget,
  getPlayerSpriteFrame,
  shouldFaceClickedInteractionTarget,
  shouldUsePlayerCombatSprite,
  type PlayerSpriteDirection,
} from '../../utils/playerSpriteAnimation';
import {
  getPlayerCombatSpriteAssetId,
  getPlayerSpriteAssetId,
} from '../../utils/playerSpriteAsset';
import { resolveNpcSpriteAssetId } from '../../utils/npcSpriteAsset';

interface AdventureStageProps {
  mapData: MapData;
  playerPosition: Coordinate;
  activeMonsters: ActiveMonster[];
  portals: Portal[];
  targetMonsterId: string | null;
  combatPresentation?: WorldCombatStagePresentation | null;
  canPlayCombatAnimation?: boolean;
  majorRealm: MajorRealm;
  isBattling: boolean;
  onTileClick: (x: number, y: number) => void;
  onPlayerArrive?: (x: number, y: number) => void;
  width: number;
  height: number;
  cellSize: number;
  key?: React.Key;
  playerName: string;
  playerGender: Gender;
  moveDestination?: Coordinate | null;
  activeQuests: Record<string, any>; // Passed from parent
  completedQuests: string[]; // Passed from parent
}

// --- Constants ---
const GRID_COLOR = 0x44403c;
const GRID_BG = 0x0c0a09; // stone-950

const THEME_COLORS = {
    [EnemyRank.Common]: 0x9ca3af, // Gray-400
    [EnemyRank.Elite]:  0x60a5fa, // Blue-400
    [EnemyRank.Boss]:   0xf87171, // Red-400
};
const PLAYER_COLOR = 0x4ade80; // Green-400
const PLAYER_COMBAT_SPRITE_ROWS = 4;
const PLAYER_COMBAT_SPRITE_COLS = 6;

const drawAdventureTerrainTile = ({
  graphics,
  tile,
  cellSize,
}: {
  graphics: PIXI.Graphics;
  tile: AdventureTerrainTile;
  cellSize: number;
}) => {
  const px = tile.x * cellSize;
  const py = tile.y * cellSize;

  graphics.beginFill(tile.fillColor, 1);
  graphics.drawRect(px, py, cellSize, cellSize);
  graphics.endFill();

  if (tile.detailKind !== 'none') {
      graphics.beginFill(tile.detailColor, tile.kind === 'path' ? 0.18 : 0.24);

      if (tile.detailKind === 'bars') {
          graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.18, cellSize * 0.08, cellSize * 0.42);
          graphics.drawRect(px + cellSize * 0.44, py + cellSize * 0.14, cellSize * 0.08, cellSize * 0.5);
          graphics.drawRect(px + cellSize * 0.7, py + cellSize * 0.22, cellSize * 0.08, cellSize * 0.36);
      } else if (tile.detailKind === 'dots') {
          graphics.drawRect(px + cellSize * 0.28, py + cellSize * 0.26, cellSize * 0.1, cellSize * 0.1);
          graphics.drawRect(px + cellSize * 0.6, py + cellSize * 0.54, cellSize * 0.1, cellSize * 0.1);
      } else if (tile.detailKind === 'ripples') {
          graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.26, cellSize * 0.22, cellSize * 0.05);
          graphics.drawRect(px + cellSize * 0.48, py + cellSize * 0.52, cellSize * 0.24, cellSize * 0.05);
      } else if (tile.detailKind === 'cracks') {
          graphics.drawRect(px + cellSize * 0.22, py + cellSize * 0.3, cellSize * 0.36, cellSize * 0.05);
          graphics.drawRect(px + cellSize * 0.5, py + cellSize * 0.48, cellSize * 0.2, cellSize * 0.05);
          graphics.drawRect(px + cellSize * 0.62, py + cellSize * 0.44, cellSize * 0.05, cellSize * 0.18);
      } else if (tile.detailKind === 'glyph') {
          graphics.drawRect(px + cellSize * 0.28, py + cellSize * 0.2, cellSize * 0.14, cellSize * 0.14);
          graphics.drawRect(px + cellSize * 0.58, py + cellSize * 0.58, cellSize * 0.14, cellSize * 0.14);
          graphics.drawRect(px + cellSize * 0.58, py + cellSize * 0.2, cellSize * 0.08, cellSize * 0.32);
      }

      graphics.endFill();
  }

  const motif = resolveAdventureTerrainRenderMotif(tile);
  if (motif.kind === 'baseTexture') return;

  graphics.beginFill(motif.color, motif.alpha);

  if (motif.kind === 'corridorEdges') {
      if (motif.orientation === 'vertical' || motif.orientation === 'cross') {
          graphics.drawRect(px + cellSize * 0.12, py + cellSize * 0.18, cellSize * 0.06, cellSize * 0.64);
          graphics.drawRect(px + cellSize * 0.82, py + cellSize * 0.18, cellSize * 0.06, cellSize * 0.64);
      }
      if (motif.orientation === 'horizontal' || motif.orientation === 'cross') {
          graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.12, cellSize * 0.64, cellSize * 0.06);
          graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.82, cellSize * 0.64, cellSize * 0.06);
      }
  } else if (motif.kind === 'landmarkSigil') {
      graphics.drawRect(px + cellSize * 0.42, py + cellSize * 0.2, cellSize * 0.16, cellSize * 0.6);
      graphics.drawRect(px + cellSize * 0.2, py + cellSize * 0.42, cellSize * 0.6, cellSize * 0.16);
      graphics.drawRect(px + cellSize * 0.38, py + cellSize * 0.38, cellSize * 0.24, cellSize * 0.24);
  } else if (motif.kind === 'resourceCluster') {
      graphics.drawRect(px + cellSize * 0.24, py + cellSize * 0.24, cellSize * 0.12, cellSize * 0.12);
      graphics.drawRect(px + cellSize * 0.64, py + cellSize * 0.26, cellSize * 0.12, cellSize * 0.12);
      graphics.drawRect(px + cellSize * 0.46, py + cellSize * 0.46, cellSize * 0.14, cellSize * 0.14);
      graphics.drawRect(px + cellSize * 0.26, py + cellSize * 0.64, cellSize * 0.12, cellSize * 0.12);
      graphics.drawRect(px + cellSize * 0.64, py + cellSize * 0.64, cellSize * 0.12, cellSize * 0.12);
  } else if (motif.kind === 'hazardVeins') {
      if (motif.orientation === 'horizontal') {
          graphics.drawRect(px + cellSize * 0.12, py + cellSize * 0.36, cellSize * 0.76, cellSize * 0.08);
          graphics.drawRect(px + cellSize * 0.28, py + cellSize * 0.58, cellSize * 0.5, cellSize * 0.08);
      } else if (motif.orientation === 'vertical') {
          graphics.drawRect(px + cellSize * 0.36, py + cellSize * 0.12, cellSize * 0.08, cellSize * 0.76);
          graphics.drawRect(px + cellSize * 0.58, py + cellSize * 0.28, cellSize * 0.08, cellSize * 0.5);
      } else {
          graphics.drawRect(px + cellSize * 0.22, py + cellSize * 0.22, cellSize * 0.38, cellSize * 0.08);
          graphics.drawRect(px + cellSize * 0.42, py + cellSize * 0.42, cellSize * 0.38, cellSize * 0.08);
          graphics.drawRect(px + cellSize * 0.32, py + cellSize * 0.58, cellSize * 0.3, cellSize * 0.08);
      }
  } else if (motif.kind === 'portalThreshold') {
      graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.18, cellSize * 0.64, cellSize * 0.08);
      graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.74, cellSize * 0.64, cellSize * 0.08);
      graphics.drawRect(px + cellSize * 0.18, py + cellSize * 0.18, cellSize * 0.08, cellSize * 0.64);
      graphics.drawRect(px + cellSize * 0.74, py + cellSize * 0.18, cellSize * 0.08, cellSize * 0.64);
  } else if (motif.kind === 'arenaRunes') {
      graphics.drawRect(px + cellSize * 0.16, py + cellSize * 0.16, cellSize * 0.26, cellSize * 0.08);
      graphics.drawRect(px + cellSize * 0.16, py + cellSize * 0.16, cellSize * 0.08, cellSize * 0.26);
      graphics.drawRect(px + cellSize * 0.58, py + cellSize * 0.16, cellSize * 0.26, cellSize * 0.08);
      graphics.drawRect(px + cellSize * 0.76, py + cellSize * 0.16, cellSize * 0.08, cellSize * 0.26);
      graphics.drawRect(px + cellSize * 0.16, py + cellSize * 0.76, cellSize * 0.26, cellSize * 0.08);
      graphics.drawRect(px + cellSize * 0.16, py + cellSize * 0.58, cellSize * 0.08, cellSize * 0.26);
      graphics.drawRect(px + cellSize * 0.58, py + cellSize * 0.76, cellSize * 0.26, cellSize * 0.08);
      graphics.drawRect(px + cellSize * 0.76, py + cellSize * 0.58, cellSize * 0.08, cellSize * 0.26);
  } else if (motif.kind === 'waterBands') {
      graphics.drawRect(px + cellSize * 0.14, py + cellSize * 0.3, cellSize * 0.34, cellSize * 0.06);
      graphics.drawRect(px + cellSize * 0.52, py + cellSize * 0.52, cellSize * 0.34, cellSize * 0.06);
      if (motif.orientation === 'cross') {
          graphics.drawRect(px + cellSize * 0.3, py + cellSize * 0.14, cellSize * 0.06, cellSize * 0.34);
          graphics.drawRect(px + cellSize * 0.62, py + cellSize * 0.52, cellSize * 0.06, cellSize * 0.34);
      }
  } else if (motif.kind === 'poiPavers') {
      graphics.drawRect(px + cellSize * 0.2, py + cellSize * 0.2, cellSize * 0.18, cellSize * 0.18);
      graphics.drawRect(px + cellSize * 0.62, py + cellSize * 0.2, cellSize * 0.18, cellSize * 0.18);
      graphics.drawRect(px + cellSize * 0.2, py + cellSize * 0.62, cellSize * 0.18, cellSize * 0.18);
      graphics.drawRect(px + cellSize * 0.62, py + cellSize * 0.62, cellSize * 0.18, cellSize * 0.18);
  }

  graphics.endFill();
};

export default function AdventureStage({
  mapData,
  playerPosition,
  activeMonsters,
  portals,
  targetMonsterId,
  combatPresentation,
  canPlayCombatAnimation = false,
  majorRealm,
  isBattling,
  onTileClick,
  width,
  height,
  cellSize = 40,
  onPlayerArrive,
  playerName,
  playerGender,
  moveDestination,
  activeQuests,
  completedQuests
}: AdventureStageProps) {
  const dispatch = useDispatch();
  const visualEffects = useSelector((state: RootState) => state.adventure.visualEffects);
  const activeEffectsRef = useRef<Map<string, {
    type: VisualEffect["type"];
    displayObject: PIXI.DisplayObject;
    startTime: number;
    lifeTime: number;
    startX?: number;
    startY?: number;
    targetX?: number;
    targetY?: number;
    radiusPx?: number;
  }>>(new Map());
  const lastSpawnTimeRef = useRef<number>(0);

  const moveTimerRef = useRef<number>(0);
  const isMovingRef = useRef(false);
  const lastPlayerFacingRef = useRef<PlayerSpriteDirection>("down");
  const playerMoveStartedAtRef = useRef(Date.now());
  const onPlayerArriveRef = useRef(onPlayerArrive);
  const framesRenderedRef = useRef(0);
  
  const [isPixiReady, setIsPixiReady] = useState(false);

  // --- Effects Sync ---
  useEffect(() => {
      if (!isPixiReady || !displayRefs.current.effectsLayer) return;
      
      (visualEffects || []).forEach(eff => {
          if (!activeEffectsRef.current.has(eff.id)) {
               const presentation = getVisualEffectPresentation({
                   effect: eff,
                   playerPosition: visualRef.current.player,
                   cellSize,
               });
               const { effectType, startX, startY, targetX, targetY, radiusPx, lifeTime } = presentation;
               const color = eff.colorInt || 0xffffff;
               let displayObject: PIXI.DisplayObject;

               if (effectType === 'projectile') {
                   const projectile = new PIXI.Graphics();
                   projectile.beginFill(color, 0.95);
                   projectile.drawCircle(0, 0, Math.max(4, cellSize * 0.12));
                   projectile.endFill();
                   projectile.lineStyle(2, 0xffffff, 0.3);
                   projectile.drawCircle(0, 0, Math.max(6, cellSize * 0.16));
                   projectile.lineStyle(2, color, 0.45);
                   projectile.moveTo(-Math.max(8, cellSize * 0.2), 0);
                   projectile.lineTo(-Math.max(16, cellSize * 0.35), 0);
                   projectile.x = startX;
                   projectile.y = startY + 20;
                   displayObject = projectile;
               } else if (effectType === 'area') {
                   const area = new PIXI.Graphics();
                   area.lineStyle(2, color, 0.9);
                   area.beginFill(color, 0.16);
                   area.drawCircle(0, 0, radiusPx ?? cellSize);
                   area.endFill();
                   area.lineStyle(1, 0xffffff, 0.2);
                   area.drawCircle(0, 0, (radiusPx ?? cellSize) * 0.62);
                   area.x = targetX ?? startX;
                   area.y = targetY ?? startY;
                   displayObject = area;
               } else if (effectType === 'impact') {
                   const impact = new PIXI.Graphics();
                   impact.lineStyle(3, color, 0.95);
                   impact.drawCircle(0, 0, radiusPx ?? cellSize * 0.2);
                   impact.lineStyle(1, 0xffffff, 0.35);
                   impact.drawCircle(0, 0, (radiusPx ?? cellSize * 0.2) * 0.6);
                   const burstRadius = radiusPx ?? cellSize * 0.2;
                   impact.lineStyle(2, color, 0.75);
                   impact.moveTo(-burstRadius, 0);
                   impact.lineTo(burstRadius, 0);
                   impact.moveTo(0, -burstRadius);
                   impact.lineTo(0, burstRadius);
                   impact.x = targetX ?? startX;
                   impact.y = targetY ?? startY;
                   displayObject = impact;
               } else if (effectType === 'cast') {
                   const cast = new PIXI.Graphics();
                   cast.lineStyle(2, color, 0.9);
                   cast.drawCircle(0, 0, radiusPx ?? cellSize * 0.3);
                   cast.lineStyle(1, 0xffffff, 0.28);
                   cast.drawCircle(0, 0, (radiusPx ?? cellSize * 0.3) * 0.65);
                   cast.lineStyle(1, color, 0.35);
                   cast.drawCircle(0, 0, (radiusPx ?? cellSize * 0.3) * 1.35);
                   cast.x = targetX ?? startX;
                   cast.y = targetY ?? startY;
                   displayObject = cast;
               } else {
                   const text = new PIXI.Text(eff.text, {
                       fontFamily: 'Arial',
                       fontSize: 16,
                       fontWeight: 'bold',
                       fill: color,
                       stroke: 0x000000,
                       strokeThickness: 3,
                       dropShadow: true,
                       dropShadowColor: 0x000000,
                       dropShadowBlur: 2,
                       dropShadowDistance: 1
                   });
                   text.anchor.set(0.5);
                   text.x = startX;
                   text.y = startY;
                   displayObject = text;
               }

               displayRefs.current.effectsLayer!.addChild(displayObject);

               // Schedule start time
               const now = Date.now();
               const spawnTime =
                 effectType === 'text'
                   ? Math.max(now, lastSpawnTimeRef.current + 500)
                   : now;
               lastSpawnTimeRef.current = spawnTime;

               activeEffectsRef.current.set(eff.id, {
                   type: effectType,
                   displayObject,
                   startTime: spawnTime,
                   startX,
                   startY,
                   targetX,
                   targetY,
                   radiusPx,
                   lifeTime
               });

               if (spawnTime > now) {
                   displayObject.visible = false;
               }
               
               // Clear from Redux so we don't re-process
               dispatch(clearVisualEffect(eff.id));
          }
      });
  }, [visualEffects, isPixiReady, cellSize, dispatch]);

  useEffect(() => {
      onPlayerArriveRef.current = onPlayerArrive;
  }, [onPlayerArrive]);

  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  
  // Visual State for Interpolation (Virtual Position)
  const visualRef = useRef({
      player: { x: playerPosition.x, y: playerPosition.y },
      cam: { x: (playerPosition.x + 0.5) * cellSize, y: (playerPosition.y + 0.5) * cellSize },
      monsterCoords: new Map<string, { x: number, y: number }>(), 
      rotation: 0
  });

  // Retained Display Objects
  const displayRefs = useRef({
      terrainLayer: null as PIXI.Graphics | null,
      playerContainer: null as PIXI.Container | null,
      monsterContainers: new Map<string, PIXI.Container>(),
      entityLayer: null as PIXI.Container | null,
      combatOverlay: null as PIXI.Graphics | null,
      portalsLayer: null as PIXI.Container | null,
      targetMarker: null as PIXI.Graphics | null,
      destinationMarker: null as PIXI.Graphics | null,
      npcLayer: null as PIXI.Container | null,
      effectsLayer: null as PIXI.Container | null,
  });



  const onTileClickRef = useRef(onTileClick);
  const entitiesRef = useRef({ monsters: activeMonsters, portals: portals });
  const latestDataRef = useRef({ mapData, playerPosition, activeMonsters, portals, targetMonsterId, combatPresentation, canPlayCombatAnimation, majorRealm, isBattling, playerName, playerGender, moveDestination, activeQuests, completedQuests });

  // Sync latest props
  useEffect(() => {
      onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  useLayoutEffect(() => {
    entitiesRef.current.monsters = activeMonsters;
    entitiesRef.current.portals = portals;
    latestDataRef.current = { mapData, playerPosition, activeMonsters, portals, targetMonsterId, combatPresentation, canPlayCombatAnimation, majorRealm, isBattling, playerName, playerGender, moveDestination, activeQuests, completedQuests };
  }, [mapData, playerPosition, activeMonsters, portals, targetMonsterId, combatPresentation, canPlayCombatAnimation, majorRealm, isBattling, playerName, playerGender, moveDestination, activeQuests, completedQuests]);

  // Force Snap (New Map)
  useLayoutEffect(() => {
       visualRef.current.cam.x = (playerPosition.x + 0.5) * cellSize;
       visualRef.current.cam.y = (playerPosition.y + 0.5) * cellSize;
       visualRef.current.player.x = playerPosition.x;
       visualRef.current.player.y = playerPosition.y;
       visualRef.current.monsterCoords.clear();
       
       // Clear retained containers on map change to be safe
       displayRefs.current.monsterContainers.forEach(c => c.destroy());
       displayRefs.current.monsterContainers.clear();
  }, [mapData.id]);

  // --- Dynamic NPC Rendering (Quest Markers) ---
  const renderNPCs = React.useCallback(() => {
     const npcLayer = displayRefs.current.npcLayer;
     if (!npcLayer || !mapData || !mapData.npcs) return;
     
     const NPC_COLOR = 0xa0522d; // Sienna
     npcLayer.removeChildren();

     mapData.npcs.forEach(npc => {
         const container = new PIXI.Container();
         const cx = (npc.x + 0.5) * cellSize;
         const cy = (npc.y + 0.5) * cellSize;
         
         container.x = cx;
         container.y = cy;
         
         // BG
         const bg = new PIXI.Graphics();
         const size = cellSize;
         bg.lineStyle(2, NPC_COLOR, 1);
         bg.beginFill(0x3e2723, 0.8);
         bg.drawRoundedRect(-size/2 + 4, -size/2 + 4, size - 8, size - 8, 6);
         bg.endFill();
         
         // Text
         const text = new PIXI.Text(npc.symbol, {
             fontFamily: 'Arial',
             fontSize: cellSize * 0.5,
             fontWeight: 'bold',
             fill: 0xffd700,
             align: 'center',
         });
         text.anchor.set(0.5);
         
         container.addChild(bg);
         container.addChild(text);

         const npcSpriteAssetId = resolveNpcSpriteAssetId(npc);
         if (npcSpriteAssetId) {
             const frameUrls = getAssetFrameFileUrls(npcSpriteAssetId);
             Promise.all(frameUrls.map((url) => PIXI.Assets.load(url)))
                 .then((textures) => {
                     if (container.destroyed || textures.length === 0) return;
                     textures.forEach((texture) => {
                         texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                     });
                     const firstTexture = textures[0];
                     if (!firstTexture?.baseTexture.valid) return;

                     const npcSprite = new PIXI.AnimatedSprite(textures);
                     const layout = getCharacterSpriteLayout({
                         cellSize,
                         frameHeight: firstTexture.height,
                     });
                     npcSprite.anchor.set(layout.anchorX, layout.anchorY);
                     npcSprite.x = layout.x;
                     npcSprite.y = layout.y;
                     npcSprite.width = layout.width;
                     npcSprite.height = layout.height;
                     npcSprite.animationSpeed = 0.025;
                     npcSprite.roundPixels = true;
                     npcSprite.play();
                     container.addChildAt(npcSprite, 0);
                     bg.visible = false;
                     text.visible = false;
                 })
                 .catch(() => {
                     bg.visible = true;
                     text.visible = true;
                 });
         }
         
         // Name Label (Above)
         const labelText = npc.affiliationLabel
             ? `${npc.affiliationLabel}\n${npc.name}`
             : npc.name;
         const label = new PIXI.Text(labelText, {
             fontFamily: 'Arial',
             fontSize: cellSize * 0.24,
             fill: 0xcccccc,
             align: 'center',
         });
         label.anchor.set(0.5);
         label.y = -size/2 - 5;
         container.addChild(label);
         
         // --- QUEST MARKER LOGIC ---
         let markerSymbol = '';
         let markerColor = 0xffffff;
         
         // 1. Check for Submit (Green ?)
         const submitQuestId = Object.keys(activeQuests).find(qid => {
            const q = QUESTS[qid];
            if (!q) return false;
            const isSubmitTarget = (q.submitNpcId === npc.id) || (!q.submitNpcId && q.giverId === npc.id);
            if (!isSubmitTarget) return false;
            return true;
         });
         
         if (submitQuestId) {
             const isReady = activeQuests[submitQuestId].isReadyToComplete;
             const q = QUESTS[submitQuestId];
             let visualReady = isReady;
             
             if (!isReady) {
                 const dialogueReq = q.requirements.find(r => r.type === 'dialogue' && (r.targetNpcId === npc.id || (!r.targetNpcId && q.submitNpcId === npc.id)));
                 if (dialogueReq) visualReady = true; 
             }

             if (visualReady) {
                 markerSymbol = '?';
                 markerColor = 0x4ade80; // Green
             } else {
                 markerSymbol = '?';
                 markerColor = 0x9ca3af; // Grey (Not ready yet)
             }
         }
         
         // 2. Check for New Quest (Yellow !)
         if (!markerSymbol && npc.questIds) {
             const availableQuestId = npc.questIds.find(qid => {
                 if (activeQuests[qid] || completedQuests.includes(qid)) return false;
                 const q = QUESTS[qid];
                 if (!q) return false;
                 if (q.prerequisiteQuestId && !completedQuests.includes(q.prerequisiteQuestId)) return false;
                 const realmReq = q.requirements.find(r => r.type === 'level');
                 if (realmReq && realmReq.minRealm !== undefined && majorRealm < realmReq.minRealm) return false;
                 return true;
             });
             
             if (availableQuestId) {
                 markerSymbol = '!';
                 markerColor = 0xfacc15; // Yellow
             }
         }

         if (markerSymbol) {
             // Pulse Animation container
             const mCont = new PIXI.Container();
             mCont.name = 'quest_marker_container';
             mCont.y = -size/2 - 30; // Increased spacing (Base pos)

             // Ripple (Water wave)
             const ripple = new PIXI.Graphics();
             ripple.lineStyle(2, markerColor, 1);
             ripple.drawCircle(0, 0, 8); // Base radius same as marker
             ripple.endFill();
             ripple.name = 'ripple';
             ripple.alpha = 0;
             mCont.addChild(ripple);

             const mG = new PIXI.Graphics();
             mG.beginFill(0x000000, 0.8);
             mG.lineStyle(1, markerColor, 1);
             mG.drawCircle(0, 0, 8);
             mG.endFill();
             
             const mT = new PIXI.Text(markerSymbol, {
                 fontFamily: 'Arial',
                 fontSize: 12,
                 fontWeight: 'bold',
                 fill: markerColor,
                 align: 'center'
             });
             mT.anchor.set(0.5);
             
             mCont.addChild(mG);
             mCont.addChild(mT);
             
             container.addChild(mCont);
         }

         npcLayer.addChild(container);
     });
  }, [mapData, cellSize, activeQuests, completedQuests, majorRealm]);

  // Trigger Render on State Changes (if Pixi ready)
  useEffect(() => {
     if (isPixiReady) renderNPCs();
  }, [renderNPCs, isPixiReady]);

  // Initialize Pixi App
  useEffect(() => {
      if (!containerRef.current || !mapData) return;

      // Brute-force clear any existing canvases (Fixes duplicate canvas issue)
      while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      const app = new PIXI.Application({
          width,
          height,
          backgroundColor: GRID_BG,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
      });

      containerRef.current.appendChild(app.view as HTMLCanvasElement);
      appRef.current = app;

      // Pre-cache monster textures/styles
      mapData.enemies.forEach(m => {
          // pre-cache textures or styles if we wanted, for now just create raw
      });
      
      setIsPixiReady(true);
      
      // --- Scene Graph ---
      const world = new PIXI.Container();
      app.stage.addChild(world);

      // Layers
      const terrainLayer = new PIXI.Graphics();
      world.addChild(terrainLayer);
      displayRefs.current.terrainLayer = terrainLayer;

      const gridGraphics = new PIXI.Graphics();
      world.addChild(gridGraphics);

      const hitArea = new PIXI.Graphics();
      hitArea.interactive = true;
      hitArea.alpha = 0; 
      world.addChild(hitArea);

      const combatOverlay = new PIXI.Graphics();
      world.addChild(combatOverlay);
      displayRefs.current.combatOverlay = combatOverlay;

      // Portals Layer
      const portalsLayer = new PIXI.Container();
      world.addChild(portalsLayer);
      displayRefs.current.portalsLayer = portalsLayer;

      // NPC Layer
      const npcLayer = new PIXI.Container();
      world.addChild(npcLayer);
      displayRefs.current.npcLayer = npcLayer;
      
      // Force Initial Render of NPCs immediately
      renderNPCs();

      // Entities Layer (Monsters + Player)
      const entityLayer = new PIXI.Container();
      entityLayer.sortableChildren = true;
      world.addChild(entityLayer);
      displayRefs.current.entityLayer = entityLayer;

      // --- Create Player Avatar ---
      const playerContainer = new PIXI.Container();
      playerContainer.sortableChildren = true;
      // BG (Border Only)
      const pBg = new PIXI.Graphics();
      pBg.lineStyle(2, PLAYER_COLOR, 1);
      pBg.beginFill(0x000000, 0.01); // Minimal fill for hit testing if needed, or practically transparent
      pBg.drawRoundedRect(-cellSize/2 + 2, -cellSize/2 + 2, cellSize - 4, cellSize - 4, 8);
      pBg.endFill();
      
      // Text
      const pText = new PIXI.Text(latestDataRef.current.playerName[0] || '?', {
          fontFamily: 'Arial',
          fontSize: cellSize * 0.6,
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: PLAYER_COLOR,
          strokeThickness: 4,
          align: 'center',
          lineJoin: 'round',
      });
      pText.anchor.set(0.5);
      
      playerContainer.addChild(pBg);
      playerContainer.addChild(pText);
      entityLayer.addChild(playerContainer); // Add to layer
      displayRefs.current.playerContainer = playerContainer;

      let playerSprite: PIXI.Sprite | null = null;
      let playerFrameTextures: PIXI.Texture[] = [];
      let playerCombatFrameTextures: PIXI.Texture[] = [];
      let didDestroyStage = false;

      const playerWalkFrameUrls = getAssetFrameFileUrls(
        getPlayerSpriteAssetId(latestDataRef.current.playerGender)
      );

      Promise.all([
        Promise.all(playerWalkFrameUrls.map((url) => PIXI.Assets.load(url))),
        PIXI.Assets.load(getAssetFileUrl(getPlayerCombatSpriteAssetId(latestDataRef.current.playerGender), "sheet")),
      ])
        .then(([walkTextures, combatTexture]) => {
          const firstWalkTexture = walkTextures[0];
          if (
            didDestroyStage ||
            !firstWalkTexture?.baseTexture.valid ||
            walkTextures.length === 0
          ) {
            return;
          }

          walkTextures.forEach((walkTexture) => {
            walkTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
          });

          const frameHeight = firstWalkTexture.height;
          const walkLayout = getCharacterSpriteLayout({
            cellSize,
            frameHeight,
          });
          playerFrameTextures = walkTextures;
          if (combatTexture?.baseTexture.valid) {
            combatTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            const combatFrameWidth = combatTexture.width / PLAYER_COMBAT_SPRITE_COLS;
            const combatFrameHeight = combatTexture.height / PLAYER_COMBAT_SPRITE_ROWS;
            playerCombatFrameTextures = Array.from(
              { length: PLAYER_COMBAT_SPRITE_ROWS * PLAYER_COMBAT_SPRITE_COLS },
              (_, index) => {
                const row = Math.floor(index / PLAYER_COMBAT_SPRITE_COLS);
                const col = index % PLAYER_COMBAT_SPRITE_COLS;
                return new PIXI.Texture(
                  combatTexture.baseTexture,
                  new PIXI.Rectangle(
                    col * combatFrameWidth,
                    row * combatFrameHeight,
                    combatFrameWidth,
                    combatFrameHeight
                  )
                );
              }
            );
          }

          const idleFrame = getPlayerSpriteFrame({
            direction: lastPlayerFacingRef.current,
            isMoving: false,
            elapsedMs: 0,
          });
          playerSprite = new PIXI.Sprite(playerFrameTextures[idleFrame.frameIndex]);
          playerSprite.anchor.set(walkLayout.anchorX, walkLayout.anchorY);
          playerSprite.x = walkLayout.x;
          playerSprite.y = walkLayout.y;
          playerSprite.width = walkLayout.width;
          playerSprite.height = walkLayout.height;
          playerSprite.roundPixels = true;
          playerContainer.addChild(playerSprite);
          pBg.visible = false;
          pText.visible = false;
        })
        .catch(() => {
          pBg.visible = true;
          pText.visible = true;
        });

      // --- Target Marker (Shared instance, moved around) ---
      const targetMarker = new PIXI.Graphics();
      targetMarker.visible = false;
      // Draw Logic
      const R = cellSize * 0.45;
      const L = cellSize * 0.15;
      targetMarker.lineStyle(2, 0xef4444, 1);
      // TL
      targetMarker.moveTo(-R, -R + L); targetMarker.lineTo(-R, -R); targetMarker.lineTo(-R + L, -R);
      // TR
      targetMarker.moveTo(R - L, -R); targetMarker.lineTo(R, -R); targetMarker.lineTo(R, -R + L);
      // BR
      targetMarker.moveTo(R, R - L); targetMarker.lineTo(R, R); targetMarker.lineTo(R - L, R);
      // BL
      targetMarker.moveTo(-R + L, R); targetMarker.lineTo(-R, R); targetMarker.lineTo(-R, R - L);
      entityLayer.addChild(targetMarker);
      displayRefs.current.targetMarker = targetMarker;

      // --- Destination Marker (Green Bracket/Pulse) ---
      const destMarker = new PIXI.Graphics();
      destMarker.visible = false;
      const dS = cellSize * 0.4;
      const dL = cellSize * 0.15;
      destMarker.lineStyle(2, 0x4ade80, 0.8); // Green
      // Corners
      // TL
      destMarker.moveTo(-dS, -dS + dL); destMarker.lineTo(-dS, -dS); destMarker.lineTo(-dS + dL, -dS);
      // TR
      destMarker.moveTo(dS - dL, -dS); destMarker.lineTo(dS, -dS); destMarker.lineTo(dS, -dS + dL);
      // BR
      destMarker.moveTo(dS, dS - dL); destMarker.lineTo(dS, dS); destMarker.lineTo(dS - dL, dS);
      // BL
      destMarker.moveTo(-dS + dL, dS); destMarker.lineTo(-dS, dS); destMarker.lineTo(-dS, dS - dL);
      
      // Center Dot
      destMarker.beginFill(0x4ade80, 0.5);
      destMarker.drawCircle(0, 0, 3);
      destMarker.endFill();

      entityLayer.addChild(destMarker);
      displayRefs.current.destinationMarker = destMarker;

      // Interactions
      hitArea.on('pointertap', (e) => {
          const local = e.getLocalPosition(world);
          const gx = Math.floor(local.x / cellSize);
          const gy = Math.floor(local.y / cellSize);
          const clickedTarget = { x: gx, y: gy };
          const clickedInteractionTarget =
              latestDataRef.current.mapData.npcs?.some(
                  (npc) => npc.x === gx && npc.y === gy
              ) ||
              latestDataRef.current.activeMonsters.some(
                  (monster) => monster.x === gx && monster.y === gy
              );
          if (
              shouldFaceClickedInteractionTarget({
                  source: latestDataRef.current.playerPosition,
                  target: clickedTarget,
                  hasInteractionTarget: Boolean(clickedInteractionTarget),
              })
          ) {
              lastPlayerFacingRef.current = getPlayerSpriteDirectionTowardTarget({
                  source: latestDataRef.current.playerPosition,
                  target: clickedTarget,
                  fallback: lastPlayerFacingRef.current,
              });
              playerMoveStartedAtRef.current = Date.now();
          }
          onTileClickRef.current(gx, gy);
      });

      // --- Render Static Grid ---
      const renderStatic = () => {
          if (!mapData) return;
          const drawW = mapData.width;
          const drawH = mapData.height;
          const terrainPalette = resolveAdventureTerrainPalette(mapData.theme);
          const terrainTiles = buildAdventureTerrainTiles({
              mapId: mapData.id,
              theme: mapData.theme,
              width: drawW,
              height: drawH,
              portals: latestDataRef.current.portals,
              npcs: mapData.npcs,
              bossSpawn: mapData.bossSpawn
          });
          assertAdventureTerrainTilesAreSafeForOfficialStage(terrainTiles);

          terrainLayer.clear();
          terrainLayer.beginFill(terrainPalette.backgroundColor);
          terrainLayer.drawRect(0, 0, drawW * cellSize, drawH * cellSize);
          terrainLayer.endFill();
          terrainTiles.forEach((tile) =>
              drawAdventureTerrainTile({
                  graphics: terrainLayer,
                  tile,
                  cellSize,
              })
          );

          gridGraphics.clear();
          gridGraphics.lineStyle(1, terrainPalette.gridColor || GRID_COLOR, 0.18);
          for (let x = 0; x <= drawW; x++) {
             gridGraphics.moveTo(x * cellSize, 0);
             gridGraphics.lineTo(x * cellSize, drawH * cellSize);
          }
          for (let y = 0; y <= drawH; y++) {
             gridGraphics.moveTo(0, y * cellSize);
             gridGraphics.lineTo(drawW * cellSize, y * cellSize);
          }
          
          hitArea.clear();
          hitArea.beginFill(0xffffff);
          hitArea.drawRect(0, 0, drawW * cellSize, drawH * cellSize);
          hitArea.endFill();
      };
      renderStatic();

      // Render NPCs logic moved to separate effect

      const effectsLayer = new PIXI.Container();
      world.addChild(effectsLayer);
      displayRefs.current.effectsLayer = effectsLayer;


      // ... (Rest of setup: MonsterAvatar, Ticker ...)

      // --- Helper: Create Monster Avatar ---
      const createMonsterAvatar = (m: ActiveMonster) => {
          const container = new PIXI.Container();
          const color = THEME_COLORS[m.rank];
          
          // BG (Border Only)
          const bg = new PIXI.Graphics();
          const size = cellSize; 
          
          bg.lineStyle(2, color, 1);
          bg.beginFill(0x000000, 0.01);
          bg.drawRoundedRect(-size/2 + 2, -size/2 + 2, size - 4, size - 4, 8);
          bg.endFill();
          
          // Text
          let symbol = m.symbol || (m.name && m.name[0]);
          if (!symbol) {
              const template = mapData.enemies.find(e => e.id === m.templateId);
              symbol = template?.symbol || (template?.name && template.name[0]) || '?';
          }
          
          const text = new PIXI.Text(symbol, {
              fontFamily: 'Arial',
              fontSize: cellSize * 0.6,
              fontWeight: m.rank === EnemyRank.Common ? 'normal' : 'bold',
              fill: 0xffffff,
              stroke: color,
              strokeThickness: 4,
              align: 'center',
              lineJoin: 'round',
          });
          text.anchor.set(0.5);

          container.addChild(bg);
          container.addChild(text);
          return container;
      };

      // --- Ticker ---
      const ticker = (delta: number) => {
          // Warmup
          if (framesRenderedRef.current < 5) {
               // Snap Logic
               const snapX = latestDataRef.current.playerPosition.x;
               const snapY = latestDataRef.current.playerPosition.y;
               visualRef.current.player.x = snapX;
               visualRef.current.player.y = snapY;
               visualRef.current.cam.x = (snapX + 0.5) * cellSize;
               visualRef.current.cam.y = (snapY + 0.5) * cellSize;
               framesRenderedRef.current++;
               
               // Apply to Container
               if (playerContainer) {
                   const playerAnchor = getCharacterTileAnchorPosition({
                       tileX: snapX,
                       tileY: snapY,
                       cellSize,
                   });
                   playerContainer.x = playerAnchor.x;
                   playerContainer.y = playerAnchor.y;
               }
               // Update Camera
               world.x = width / 2 - visualRef.current.cam.x;
               world.y = height / 2 - visualRef.current.cam.y;
               return;
          }

          // --- 1. Player Movement ---
          if (latestDataRef.current.isBattling) {
               visualRef.current.player.x = latestDataRef.current.playerPosition.x;
               visualRef.current.player.y = latestDataRef.current.playerPosition.y;
          }
          
          const msPerTile = MOVEMENT_SPEEDS[latestDataRef.current.majorRealm] || 500;
          const MOVE_SPEED = (16.66 / msPerTile) * 1.05 * delta;
          const targetPx = latestDataRef.current.playerPosition.x;
          const targetPy = latestDataRef.current.playerPosition.y;
          
          const pdx = targetPx - visualRef.current.player.x;
          const pdy = targetPy - visualRef.current.player.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          if (pDist > 0.001) {
              const wasMoving = isMovingRef.current;
              isMovingRef.current = true;
              const nextFacing = getPlayerSpriteDirectionFromDelta(
                  pdx,
                  pdy,
                  lastPlayerFacingRef.current
              );
              if (!wasMoving || nextFacing !== lastPlayerFacingRef.current) {
                  lastPlayerFacingRef.current = nextFacing;
                  playerMoveStartedAtRef.current = Date.now();
              }
              if (pDist <= MOVE_SPEED) {
                  visualRef.current.player.x = targetPx;
                  visualRef.current.player.y = targetPy;
                  if (isMovingRef.current) {
                      isMovingRef.current = false;
                      onPlayerArriveRef.current?.(targetPx, targetPy);
                  }
              } else {
                  const ratio = MOVE_SPEED / pDist;
                  visualRef.current.player.x += pdx * ratio;
                  visualRef.current.player.y += pdy * ratio;
              }
          } else {
              visualRef.current.player.x = targetPx;
              visualRef.current.player.y = targetPy;
              isMovingRef.current = false;
          }

          const facingTargetId = latestDataRef.current.targetMonsterId;
          const facingTarget = facingTargetId
              ? latestDataRef.current.activeMonsters.find(
                    (monster) => monster.instanceId === facingTargetId
                )
              : null;
          if (!isMovingRef.current && facingTarget) {
              const nextFacing = getPlayerSpriteDirectionTowardTarget({
                  source: visualRef.current.player,
                  target: facingTarget,
                  fallback: lastPlayerFacingRef.current,
              });
              if (nextFacing !== lastPlayerFacingRef.current) {
                  lastPlayerFacingRef.current = nextFacing;
                  playerMoveStartedAtRef.current = Date.now();
              }
          }

          if (playerSprite && playerFrameTextures.length > 0) {
              const attackCycle = latestDataRef.current.combatPresentation?.playerAttackCycle;
              const elapsedSinceActionMs = attackCycle
                  ? attackCycle.ready
                      ? 0
                      : attackCycle.totalMs - attackCycle.remainingMs
                  : 0;
              if (
                  shouldUsePlayerCombatSprite({
                      isMoving: isMovingRef.current,
                      hasCombatPresentation: Boolean(latestDataRef.current.combatPresentation),
                      canPlayCombatAnimation: latestDataRef.current.canPlayCombatAnimation,
                      isAttackReady: attackCycle?.ready ?? false,
                      elapsedSinceActionMs,
                      attackIntervalMs: attackCycle?.totalMs ?? 0,
                  }) &&
                  playerCombatFrameTextures.length > 0
              ) {
                  const combatFrame = getPlayerCombatSpriteFrame({
                      direction: lastPlayerFacingRef.current,
                      elapsedSinceActionMs,
                      attackIntervalMs: attackCycle?.totalMs ?? 0,
                  });
                  playerSprite.texture =
                      playerCombatFrameTextures[combatFrame.frameIndex] ?? playerSprite.texture;
                  const combatLayout = getCharacterSpriteLayout({
                      cellSize,
                      frameHeight: playerSprite.texture.height,
                  });
                  playerSprite.anchor.set(combatLayout.anchorX, combatLayout.anchorY);
                  playerSprite.x = combatLayout.x;
                  playerSprite.y = combatLayout.y;
                  playerSprite.width = combatLayout.width;
                  playerSprite.height = combatLayout.height;
              } else {
                  const frame = getPlayerSpriteFrame({
                      direction: lastPlayerFacingRef.current,
                      isMoving: isMovingRef.current,
                      elapsedMs: Date.now() - playerMoveStartedAtRef.current,
                  });
                  playerSprite.texture = playerFrameTextures[frame.frameIndex] ?? playerSprite.texture;
                  const walkLayout = getCharacterSpriteLayout({
                      cellSize,
                      frameHeight: playerSprite.texture.height,
                  });
                  playerSprite.anchor.set(walkLayout.anchorX, walkLayout.anchorY);
                  playerSprite.x = walkLayout.x;
                  playerSprite.y = walkLayout.y;
                  playerSprite.width = walkLayout.width;
                  playerSprite.height = walkLayout.height;
              }
          }


          const time = Date.now() / 1000;
          
          if (playerContainer) {
              const playerAnchor = getCharacterTileAnchorPosition({
                  tileX: visualRef.current.player.x,
                  tileY: visualRef.current.player.y,
                  cellSize,
              });
              playerContainer.x = playerAnchor.x;
              playerContainer.y = playerAnchor.y;
              playerContainer.scale.set(1);
              playerContainer.zIndex = playerContainer.y;
          }

          const combatOverlay = displayRefs.current.combatOverlay;
          if (combatOverlay) {
              combatOverlay.clear();
              const presentation = latestDataRef.current.combatPresentation;
              if (presentation) {
                  const playerCenterX = (visualRef.current.player.x + 0.5) * cellSize;
                  const playerCenterY = (visualRef.current.player.y + 0.5) * cellSize;
                  const playerPulse = 0.98 + Math.sin(time * 3.5) * 0.03;

                  if (presentation.bossTelegraphRadius) {
                      const telegraphColor =
                          presentation.bossTelegraphState === 'ready' ? 0xfb7185 : 0xf59e0b;
                      const telegraphAlpha =
                          presentation.bossTelegraphState === 'ready' ? 0.18 : 0.12;
                      combatOverlay.lineStyle(2, telegraphColor, 0.8);
                      combatOverlay.beginFill(telegraphColor, telegraphAlpha);
                      combatOverlay.drawCircle(
                          playerCenterX,
                          playerCenterY,
                          presentation.bossTelegraphRadius * cellSize * (0.94 + Math.sin(time * 5.4) * 0.04)
                      );
                      combatOverlay.endFill();
                  }

                  combatOverlay.lineStyle(2, 0x4ade80, 0.3);
                  combatOverlay.drawCircle(
                      playerCenterX,
                      playerCenterY,
                      presentation.playerRangeRadius * cellSize * playerPulse
                  );

                  const targetId = latestDataRef.current.targetMonsterId;
                  const targetCoords = targetId
                      ? visualRef.current.monsterCoords.get(targetId)
                      : undefined;

                  if (targetCoords) {
                      const targetCenterX = (targetCoords.x + 0.5) * cellSize;
                      const targetCenterY = (targetCoords.y + 0.5) * cellSize;
                      const enemyPulse = 0.98 + Math.sin(time * 4.8) * 0.03;

                      if (presentation.showEnemyDangerFill) {
                          combatOverlay.beginFill(
                              presentation.enemyRoleAccentColor,
                              presentation.enemyDangerFillAlpha
                          );
                          combatOverlay.drawCircle(
                              targetCenterX,
                              targetCenterY,
                              presentation.enemyRangeRadius * cellSize * enemyPulse
                          );
                          combatOverlay.endFill();
                      }

                      if (presentation.showEnemyAggroRing) {
                          combatOverlay.lineStyle(1, presentation.enemyAggroColor, 0.18);
                          combatOverlay.drawCircle(
                              targetCenterX,
                              targetCenterY,
                              presentation.enemyAggroRadius * cellSize
                          );
                      }

                      if (presentation.showEnemyPreferredRing) {
                          combatOverlay.lineStyle(1.5, presentation.enemyPreferredColor, 0.24);
                          combatOverlay.drawCircle(
                              targetCenterX,
                              targetCenterY,
                              presentation.enemyPreferredRadius * cellSize
                          );
                      }

                      if (presentation.showEnemyRetreatBand) {
                          combatOverlay.lineStyle(1.25, presentation.enemyPreferredColor, 0.2);
                          combatOverlay.drawCircle(
                              targetCenterX,
                              targetCenterY,
                              Math.max(
                                  presentation.enemyRangeRadius,
                                  presentation.enemyPreferredRadius - 0.4
                              ) * cellSize
                          );
                      }

                      if (presentation.enemyChargeRadius) {
                          const chargeColor =
                              presentation.enemyChargeState === 'ready'
                                  ? 0xfb7185
                                  : presentation.enemyChargeColor ?? presentation.enemyRoleAccentColor;
                          combatOverlay.lineStyle(2, chargeColor, 0.75);
                          combatOverlay.drawCircle(
                              targetCenterX,
                              targetCenterY,
                              presentation.enemyChargeRadius *
                                  cellSize *
                                  (0.9 + Math.sin(time * 5.8) * 0.06)
                          );
                      }

                      combatOverlay.lineStyle(2, presentation.enemyRoleAccentColor, 0.3);
                      combatOverlay.drawCircle(
                          targetCenterX,
                          targetCenterY,
                          presentation.enemyRangeRadius * cellSize * enemyPulse
                      );

                      if (presentation.showTargetFocusReticle) {
                          const reticleRadius = Math.max(8, cellSize * 0.22);
                          combatOverlay.lineStyle(1.5, presentation.enemyRoleAccentColor, 0.55);
                          combatOverlay.drawCircle(targetCenterX, targetCenterY, reticleRadius);
                          combatOverlay.moveTo(targetCenterX - reticleRadius - 6, targetCenterY);
                          combatOverlay.lineTo(targetCenterX - reticleRadius + 2, targetCenterY);
                          combatOverlay.moveTo(targetCenterX + reticleRadius - 2, targetCenterY);
                          combatOverlay.lineTo(targetCenterX + reticleRadius + 6, targetCenterY);
                          combatOverlay.moveTo(targetCenterX, targetCenterY - reticleRadius - 6);
                          combatOverlay.lineTo(targetCenterX, targetCenterY - reticleRadius + 2);
                          combatOverlay.moveTo(targetCenterX, targetCenterY + reticleRadius - 2);
                          combatOverlay.lineTo(targetCenterX, targetCenterY + reticleRadius + 6);
                      }
                  }
              }
          }

          // --- 2. Camera ---
          const CAM_LERP = 0.06 * delta;
          const targetCamX = (visualRef.current.player.x + 0.5) * cellSize;
          const targetCamY = (visualRef.current.player.y + 0.5) * cellSize;
          visualRef.current.cam.x += (targetCamX - visualRef.current.cam.x) * CAM_LERP;
          visualRef.current.cam.y += (targetCamY - visualRef.current.cam.y) * CAM_LERP;
          
          world.x = width / 2 - visualRef.current.cam.x;
          world.y = height / 2 - visualRef.current.cam.y;


          // --- 3. Monster Management ---
          const activeIds = new Set<string>();
          entitiesRef.current.monsters.forEach(m => {
              activeIds.add(m.instanceId);
              
              // A. Logic/Visual Coords
              let visCoords = visualRef.current.monsterCoords.get(m.instanceId);
              if (!visCoords) {
                  visCoords = { x: m.x, y: m.y };
                  visualRef.current.monsterCoords.set(m.instanceId, visCoords);
              }

              // Interpolation
              const dx = m.x - visCoords.x;
              const dy = m.y - visCoords.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const mSpeed = MOVE_SPEED * 0.45; 

              if (dist > 0.001) {
                  if (dist <= mSpeed) {
                      visCoords.x = m.x;
                      visCoords.y = m.y;
                  } else {
                      const ratio = mSpeed / dist;
                      visCoords.x += dx * ratio;
                      visCoords.y += dy * ratio;
                  }
              } else {
                 visCoords.x = m.x;
                 visCoords.y = m.y;
              }

              // B. Container Management
              let container = displayRefs.current.monsterContainers.get(m.instanceId);
              if (!container) {
                  // Create New
                  container = createMonsterAvatar(m);
                  if (displayRefs.current.entityLayer) {
                      displayRefs.current.entityLayer.addChild(container);
                  }
                  displayRefs.current.monsterContainers.set(m.instanceId, container);
              }

              // Update Container Pos & Anim
              container.x = (visCoords.x + 0.5) * cellSize;
              container.y = (visCoords.y + 0.5) * cellSize;
              container.zIndex = container.y;
              
              // Random Phase Pulse
              // Simple hash from instanceId for phase
              const phase = m.instanceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
              const mPulse = 1 + Math.sin(time * 3 + phase) * 0.05;
              container.scale.set(mPulse);
          });


          // Cleanup missing monsters (visuals)
          // 4. Duplicate cleanup block removed from here.

          // --- 4. Effects Animation ---
          if (displayRefs.current.effectsLayer) {
              const now = Date.now();
              activeEffectsRef.current.forEach((effect, id) => {
                  const elapsed = now - effect.startTime;
                  if (elapsed > effect.lifeTime) {
                      effect.displayObject.destroy();
                      activeEffectsRef.current.delete(id);
                  } else if (elapsed >= 0) {
                      effect.displayObject.visible = true;
                      const progress = elapsed / effect.lifeTime;

                      if (effect.type === 'text') {
                          const text = effect.displayObject as PIXI.Text;
                          const yOffset = progress * 60;
                          text.y = (effect.startY ?? text.y) - yOffset;
                          text.alpha = 1 - Math.pow(progress, 3);
                      } else if (effect.type === 'projectile') {
                          const projectile = effect.displayObject as PIXI.Graphics;
                          const sx = effect.startX ?? projectile.x;
                          const sy = (effect.startY ?? projectile.y) + 20;
                          const tx = effect.targetX ?? sx;
                          const ty = effect.targetY ?? sy;
                          projectile.x = sx + (tx - sx) * progress;
                          projectile.y = sy + (ty - sy) * progress;
                          projectile.alpha = 0.65 + (1 - progress) * 0.35;
                          projectile.rotation = Math.atan2(ty - sy, tx - sx);
                          projectile.scale.set(1 - progress * 0.12, 1 - progress * 0.18);
                      } else if (effect.type === 'area') {
                          const area = effect.displayObject as PIXI.Graphics;
                          area.alpha = 0.75 * (1 - progress * 0.85);
                          area.scale.set(0.96 + progress * 0.24);
                      } else if (effect.type === 'impact') {
                          const impact = effect.displayObject as PIXI.Graphics;
                          impact.alpha = 0.9 * (1 - progress);
                          impact.scale.set(1 + progress * 0.55);
                      } else if (effect.type === 'cast') {
                          const cast = effect.displayObject as PIXI.Graphics;
                          cast.alpha = 0.8 * (1 - progress * 0.7);
                          cast.scale.set(0.85 + progress * 0.55);
                      }
                  } else {
                      effect.displayObject.visible = false;
                  }
              });
          }

          // Update Target Marker (Red for Monster)
          if (latestDataRef.current.targetMonsterId && displayRefs.current.targetMarker) {
               // Find current position of the target monster container
               const mContainer = displayRefs.current.monsterContainers.get(latestDataRef.current.targetMonsterId);
               
               if (mContainer) {
                   displayRefs.current.targetMarker.visible = true;
                   displayRefs.current.targetMarker.x = mContainer.x;
                   displayRefs.current.targetMarker.y = mContainer.y;
                   displayRefs.current.targetMarker.tint = 0xffffff; // Reset tint
                   displayRefs.current.targetMarker.scale.set(1 + Math.sin(time * 10) * 0.1); 
                   displayRefs.current.targetMarker.rotation += 0.05 * delta;
               } else {
                   displayRefs.current.targetMarker.visible = false;
               }
          } else if (displayRefs.current.targetMarker) {
              displayRefs.current.targetMarker.visible = false;
          }

          // Update Move Destination Marker (Green for Location)
          if (latestDataRef.current.moveDestination && displayRefs.current.destinationMarker) {
              const dest = latestDataRef.current.moveDestination;
              const mId = latestDataRef.current.targetMonsterId;
              const isMonsterTarget = mId && visualRef.current.monsterCoords.has(mId);
              
              if (!isMonsterTarget) {
                  displayRefs.current.destinationMarker.visible = true;
                  displayRefs.current.destinationMarker.x = (dest.x + 0.5) * cellSize;
                  displayRefs.current.destinationMarker.y = (dest.y + 0.5) * cellSize;
                  
                  // Pulse
                  displayRefs.current.destinationMarker.alpha = 0.5 + Math.sin(time * 8) * 0.3;
                  displayRefs.current.destinationMarker.scale.set(1 + Math.sin(time * 5) * 0.1);
              } else {
                  displayRefs.current.destinationMarker.visible = false;
              }
          } else if (displayRefs.current.destinationMarker) {
              displayRefs.current.destinationMarker.visible = false;
          }

          // Cleanup Dead Monsters
          const containers = displayRefs.current.monsterContainers;
          for (const [id, container] of containers.entries()) {
              if (!activeIds.has(id)) {
                  container.destroy(); // Remove from PIXI
                  containers.delete(id); // Remove from Map
                  visualRef.current.monsterCoords.delete(id); // Remove coords
              }
          }
            
          // Hide marker if target invalid (Redundant check but safe)
          if (displayRefs.current.targetMarker && !activeIds.has(latestDataRef.current.targetMonsterId || '')) {
              displayRefs.current.targetMarker.visible = false;
          }

           // --- 5. Portals ---
          const portalsLayer = displayRefs.current.portalsLayer;
          if (portalsLayer) {
            portalsLayer.removeChildren(); // clear old graphics
            const pG = new PIXI.Graphics();
            portalsLayer.addChild(pG);
            
            visualRef.current.rotation += 0.05 * delta;
            const rot = visualRef.current.rotation;

            entitiesRef.current.portals.forEach(p => {
                const cx = (p.x + 0.5) * cellSize;
                const cy = (p.y + 0.5) * cellSize;
                const size = cellSize * 0.45;
                
                 // Shadow
                pG.beginFill(0x000000, 0.4);
                pG.drawEllipse(cx, cy + size * 0.6, size, size * 0.3);
                pG.endFill();
                
                const alpha = 0.6 + Math.sin(rot * 0.5) * 0.4;
                pG.lineStyle(2, 0x3b82f6, alpha);
                pG.drawCircle(cx, cy, size);
                
                pG.lineStyle(2, 0x60a5fa, 0.8);
                const corners = [0, Math.PI/2, Math.PI, Math.PI*1.5].map(offset => ({
                    x: cx + Math.cos(rot + offset) * size * 0.8,
                    y: cy + Math.sin(rot + offset) * size * 0.8
                }));
                pG.moveTo(corners[0].x, corners[0].y);
                corners.slice(1).forEach(c => pG.lineTo(c.x, c.y));
                pG.lineTo(corners[0].x, corners[0].y);
                
                pG.lineStyle(0);
                pG.beginFill(0x93c5fd, 0.9);
                pG.drawCircle(cx, cy, size * 0.3);
                pG.endFill();
            });
          }

          // --- 6. Animate NPC Quest Markers ---
          const npcLayer = displayRefs.current.npcLayer; // Now accessed from ref
          if (npcLayer) {
             npcLayer.children.forEach((npcCont: PIXI.Container) => {
                 const marker = npcCont.getChildByName('quest_marker_container') as PIXI.Container;
                 if (marker) {
                     // Floating effect
                     marker.y = -cellSize/2 - 30 + Math.sin(time * 3) * 3;

                     // Ripple effect
                     const ripple = marker.getChildByName('ripple') as PIXI.Graphics;
                     if (ripple) {
                         const rScale = (time * 2) % 1.5; // 0 to 1.5
                         ripple.scale.set(1 + rScale);
                         ripple.alpha = 1 - (rScale / 1.5);
                     }
                 }
             });
          }
      };
      
      app.ticker.add(ticker);

      return () => {
          didDestroyStage = true;
          setIsPixiReady(false);
          try {
            app.destroy(true, { children: true, texture: true, baseTexture: true });
          } catch (e) {
            console.warn('PIXI Destroy Error:', e);
          }
          appRef.current = null;
      };
  }, [width, height, cellSize, mapData?.id, playerGender]);

  return <div ref={containerRef} data-testid="adventure-stage" />;
}
