import React, { useEffect, useRef, useLayoutEffect } from 'react';
import * as PIXI from 'pixi.js';
import { MapData, Coordinate, Portal, EnemyRank, ActiveMonster, MajorRealm } from '../../types';
import { MOVEMENT_SPEEDS } from '../../constants';

interface AdventureStageProps {
  mapData: MapData;
  playerPosition: Coordinate;
  activeMonsters: ActiveMonster[];
  portals: Portal[];
  targetMonsterId: string | null;
  majorRealm: MajorRealm;
  isBattling: boolean;
  onTileClick: (x: number, y: number) => void;
  onPlayerArrive?: (x: number, y: number) => void;
  width: number;
  height: number;
  cellSize: number;
  key?: React.Key;
  playerName: string;
  moveDestination?: Coordinate | null;
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

export default function AdventureStage({
  mapData,
  playerPosition,
  activeMonsters,
  portals,
  targetMonsterId,
  majorRealm,
  isBattling,
  onTileClick,
  width,
  height,
  cellSize = 40,
  onPlayerArrive,
  playerName,
  moveDestination
}: AdventureStageProps) {
  
  const moveTimerRef = useRef<number>(0);
  const isMovingRef = useRef(false);
  const onPlayerArriveRef = useRef(onPlayerArrive);
  const framesRenderedRef = useRef(0);
  
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
      playerContainer: null as PIXI.Container | null,
      monsterContainers: new Map<string, PIXI.Container>(),
      entityLayer: null as PIXI.Container | null,
      portalsLayer: null as PIXI.Container | null,
      targetMarker: null as PIXI.Graphics | null,
      destinationMarker: null as PIXI.Graphics | null,
  });

  const onTileClickRef = useRef(onTileClick);
  const entitiesRef = useRef({ monsters: activeMonsters, portals: portals });
  const latestDataRef = useRef({ mapData, playerPosition, activeMonsters, portals, targetMonsterId, majorRealm, isBattling, playerName, moveDestination });

  // Sync latest props
  useEffect(() => {
      onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  useLayoutEffect(() => {
    entitiesRef.current.monsters = activeMonsters;
    entitiesRef.current.portals = portals;
    latestDataRef.current = { mapData, playerPosition, activeMonsters, portals, targetMonsterId, majorRealm, isBattling, playerName, moveDestination };
  }, [mapData, playerPosition, activeMonsters, portals, targetMonsterId, majorRealm, isBattling, playerName, moveDestination]);

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


  // Initialize Pixi App
  useEffect(() => {
      if (!containerRef.current || !mapData) return;
      
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

      // --- Scene Graph ---
      const world = new PIXI.Container();
      app.stage.addChild(world);

      // Layers
      const gridGraphics = new PIXI.Graphics();
      world.addChild(gridGraphics);

      const hitArea = new PIXI.Graphics();
      hitArea.interactive = true;
      hitArea.alpha = 0; 
      world.addChild(hitArea);

      // Portals Layer
      const portalsLayer = new PIXI.Container();
      world.addChild(portalsLayer);
      displayRefs.current.portalsLayer = portalsLayer;

      // Entities Layer (Monsters + Player)
      const entityLayer = new PIXI.Container();
      world.addChild(entityLayer);
      displayRefs.current.entityLayer = entityLayer;

      // --- Create Player Avatar ---
      const playerContainer = new PIXI.Container();
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
          onTileClickRef.current(gx, gy);
      });

      // --- Render Static Grid ---
      const renderStatic = () => {
          if (!mapData) return;
          const drawW = mapData.width;
          const drawH = mapData.height;

          gridGraphics.clear();
          gridGraphics.beginFill(GRID_BG);
          gridGraphics.drawRect(0, 0, drawW * cellSize, drawH * cellSize);
          gridGraphics.endFill();
          
          gridGraphics.lineStyle(1, GRID_COLOR, 0.3);
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
                   playerContainer.x = (snapX + 0.5) * cellSize;
                   playerContainer.y = (snapY + 0.5) * cellSize;
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
              isMovingRef.current = true;
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


          // --- Animation Pulse ---
          // ~1.5s per cycle. Range 0.95 to 1.05
          const time = Date.now() / 1000;
          const pulse = 1 + Math.sin(time * 4) * 0.05; 
          
          if (playerContainer) {
              playerContainer.x = (visualRef.current.player.x + 0.5) * cellSize;
              playerContainer.y = (visualRef.current.player.y + 0.5) * cellSize;
              playerContainer.scale.set(pulse); // Apply Pulse
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
              
              // Random Phase Pulse
              // Simple hash from instanceId for phase
              const phase = m.instanceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
              const mPulse = 1 + Math.sin(time * 3 + phase) * 0.05;
              container.scale.set(mPulse);

              // Update Target Marker (Red for Monster)
              if (latestDataRef.current.targetMonsterId === m.instanceId && displayRefs.current.targetMarker) {
                   displayRefs.current.targetMarker.visible = true;
                   displayRefs.current.targetMarker.x = container.x;
                   displayRefs.current.targetMarker.y = container.y;
                   displayRefs.current.targetMarker.tint = 0xffffff; // Reset tint
                   displayRefs.current.targetMarker.scale.set(1 + Math.sin(time * 10) * 0.1); 
                   displayRefs.current.targetMarker.rotation += 0.05 * delta;
              }
          });

          // Update Move Destination Marker (Green for Location)
          if (latestDataRef.current.moveDestination && displayRefs.current.destinationMarker) {
              const dest = latestDataRef.current.moveDestination;
              // Check if we also have a target monster at this location? 
              // If targetMonsterId is set, usually we don't need this, BUT user might want to see path end regardless.
              // However, if targetMonsterId IS set, the Red Marker overrides/overlaps.
              // Let's only show Green Marker if NO targetMonsterId is active OR if the destination is NOT the monster.
              // Actually, simply showing it is fine, maybe slightly different visual.
              
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
           
          // Hide marker if target invalid
          if (displayRefs.current.targetMarker && !activeIds.has(latestDataRef.current.targetMonsterId || '')) {
              displayRefs.current.targetMarker.visible = false;
          }

          // --- 4. Portals ---
          if (portalsLayer) {
            // Note: Retained mode means we only create/destroy portals if list changes. 
            // For simplicity in this specific component (portals rarely move), we can simple-clear or diff.
            // Given portals are static, clearing/redrawing GRAPHICS inside ONE container is fine, 
            // OR managing Children. Let's do simple Clear+Draw on a Graphics object for Portals to save complexity,
            // since they don't have text or complex composition.
            // ... Actually, let's just make them retained too for consistency, or keep them as Graphics.
            // Let's use a single Graphics for portals for now as they are simple shapes.
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
      };
      
      app.ticker.add(ticker);

      return () => {
          app.destroy(true, { children: true });
      };
  }, [width, height, cellSize, mapData?.id]); 

  return <div ref={containerRef} />;
}
