import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { MapData, Coordinate, Portal, EnemyRank, ActiveMonster, MajorRealm } from '../../types';
import { MOVEMENT_SPEEDS } from '../../constants';
import { current } from '@reduxjs/toolkit';

interface AdventureStageProps {
  mapData: MapData;
  playerPosition: Coordinate;
  activeMonsters: ActiveMonster[];
  portals: Portal[];
  targetMonsterId: string | null;
  majorRealm: MajorRealm;
  isBattling: boolean;
  onTileClick: (x: number, y: number) => void;
  onPlayerArrive?: (x: number, y: number) => void; // New Callback
  width: number;
  height: number;
  cellSize: number;
}

// --- Constants ---
const GRID_COLOR = 0x44403c;
const GRID_BG = 0x0c0a09; // stone-950

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
}: AdventureStageProps) {
  
  const moveTimerRef = useRef<number>(0);
  const isMovingRef = useRef(false);
  const onPlayerArriveRef = useRef(onPlayerArrive);
  
  useEffect(() => {
      onPlayerArriveRef.current = onPlayerArrive;
  }, [onPlayerArrive]);
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  
  // Visual State for Interpolation
  const visualRef = useRef({
      player: { x: playerPosition.x, y: playerPosition.y },
      monsters: new Map<string, { x: number, y: number }>(),
      cam: { x: (playerPosition.x + 0.5) * cellSize, y: (playerPosition.y + 0.5) * cellSize },
      rotation: 0
  });

  const onTileClickRef = useRef(onTileClick);
  const entitiesRef = useRef({ monsters: activeMonsters, portals: portals });
  const latestDataRef = useRef({ mapData, playerPosition, activeMonsters, portals, targetMonsterId, majorRealm, isBattling });

  // Sync latest props
  useEffect(() => {
      onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  useEffect(() => {
    entitiesRef.current.monsters = activeMonsters;
    entitiesRef.current.portals = portals;
    latestDataRef.current = { mapData, playerPosition, activeMonsters, portals, targetMonsterId, majorRealm, isBattling };
  }, [mapData, playerPosition, activeMonsters, portals, targetMonsterId, majorRealm, isBattling]);

  // Force Snap Camera on Map Change (Prevent Drift)
  useEffect(() => {
       visualRef.current.cam.x = (playerPosition.x + 0.5) * cellSize;
       visualRef.current.cam.y = (playerPosition.y + 0.5) * cellSize;
       visualRef.current.player.x = playerPosition.x;
       visualRef.current.player.y = playerPosition.y;
  }, [mapData.id]);
  
  // Snap on Map Change (Legacy - kept for safety but simplified)
  useEffect(() => {
     visualRef.current.player = { x: playerPosition.x, y: playerPosition.y };
     visualRef.current.monsters.clear();
  }, [mapData?.id]);


  // Initialize Pixi App
  useEffect(() => {
      if (!containerRef.current || !mapData) return;
      
      // Create App
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

      // 1. Grid Background
      const gridGraphics = new PIXI.Graphics();
      world.addChild(gridGraphics);

      // 2. Interactive Layer
      const hitArea = new PIXI.Graphics();
      hitArea.interactive = true;
      hitArea.alpha = 0; 
      world.addChild(hitArea);
      
      hitArea.on('pointertap', (e) => {
          const local = e.getLocalPosition(world);
          const gx = Math.floor(local.x / cellSize);
          const gy = Math.floor(local.y / cellSize);
          onTileClickRef.current(gx, gy);
      });

      // 3. Entity Layer
      const entityGraphics = new PIXI.Graphics();
      world.addChild(entityGraphics);

      // 4. Player Graphics
      const playerGraphics = new PIXI.Graphics();
      world.addChild(playerGraphics);




      // --- Render Static ---
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

      // --- Animation Loop ---
      const ticker = (delta: number) => {
          if (latestDataRef.current.isBattling) {
               // Force snap to actual position to stop wandering/floating
               visualRef.current.player.x = latestDataRef.current.playerPosition.x;
               visualRef.current.player.y = latestDataRef.current.playerPosition.y;
          }

          // Dynamic Speed Calculation designed for Continuous Movement
          // Logic Tick: Every X ms. Visual Move: Should take ~X ms.
          const msPerTile = MOVEMENT_SPEEDS[latestDataRef.current.majorRealm] || 500;
          
          // We assume delta=1 is 16.66ms. 
          // We want to cross 1.0 tile in (msPerTile) ms.
          // speed (tiles/tick) = 1 / (msPerTile / 16.66)
          // We speed it up by 5% (multiply by 1.05) to ensure we arrive just before the next tick.
          const MOVE_SPEED = (16.66 / msPerTile) * 1.05 * delta;
          
          const CAM_LERP = 0.06 * delta;

          // 1. Interpolate Player (Linear MoveTowards)
          const targetPx = latestDataRef.current.playerPosition.x;
          const targetPy = latestDataRef.current.playerPosition.y;
          
          const dx = targetPx - visualRef.current.player.x;
          const dy = targetPy - visualRef.current.player.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.001) {
              isMovingRef.current = true;

              if (dist <= MOVE_SPEED) {
                  visualRef.current.player.x = targetPx;
                  visualRef.current.player.y = targetPy;
                  
                  if (isMovingRef.current) {
                      isMovingRef.current = false;
                      onPlayerArriveRef.current?.(latestDataRef.current.playerPosition.x, latestDataRef.current.playerPosition.y);
                  }
              } else {
                  const ratio = MOVE_SPEED / dist;
                  visualRef.current.player.x += dx * ratio;
                  visualRef.current.player.y += dy * ratio;
              }
          } else {
              visualRef.current.player.x = targetPx;
              visualRef.current.player.y = targetPy;
              isMovingRef.current = false; 
          }
          
          // 2. Camera Follow Visual Player
          const targetCamX = (visualRef.current.player.x + 0.5) * cellSize;
          const targetCamY = (visualRef.current.player.y + 0.5) * cellSize;
          
          visualRef.current.cam.x += (targetCamX - visualRef.current.cam.x) * CAM_LERP;
          visualRef.current.cam.y += (targetCamY - visualRef.current.cam.y) * CAM_LERP;

          // Apply Camera
          world.x = width / 2 - visualRef.current.cam.x;
          world.y = height / 2 - visualRef.current.cam.y;

          // --- Draw Entities ---
          entityGraphics.clear();
          
          visualRef.current.rotation += 0.05 * delta;
          const rot = visualRef.current.rotation;

          // A. Portals (Blue + Rotate + Shadow + Flash)
          entitiesRef.current.portals.forEach(p => {
              const cx = (p.x + 0.5) * cellSize;
              const cy = (p.y + 0.5) * cellSize;
              const size = cellSize * 0.45;

              // Shadow
              entityGraphics.beginFill(0x000000, 0.4);
              entityGraphics.drawEllipse(cx, cy + size * 0.6, size, size * 0.3);
              entityGraphics.endFill();
              
              const alpha = 0.6 + Math.sin(rot * 0.5) * 0.4; // Flash

              // Outer Ring
              entityGraphics.lineStyle(2, 0x3b82f6, alpha);
              entityGraphics.drawCircle(cx, cy, size);
              
              // Rotating Square/Diamond
              entityGraphics.lineStyle(2, 0x60a5fa, 0.8);
              // Calculate rotating points
              const corners = [0, Math.PI/2, Math.PI, Math.PI*1.5].map(offset => ({
                  x: cx + Math.cos(rot + offset) * size * 0.8,
                  y: cy + Math.sin(rot + offset) * size * 0.8
              }));
              entityGraphics.moveTo(corners[0].x, corners[0].y);
              corners.slice(1).forEach(c => entityGraphics.lineTo(c.x, c.y));
              entityGraphics.lineTo(corners[0].x, corners[0].y); // Close path
              
              // Core
              entityGraphics.lineStyle(0);
              entityGraphics.beginFill(0x93c5fd, 0.9);
              entityGraphics.drawCircle(cx, cy, size * 0.3);
              entityGraphics.endFill();
          });

          // B. Monsters (Interpolated)
          const activeIds = new Set<string>();
          entitiesRef.current.monsters.forEach(m => {
              activeIds.add(m.instanceId);
              let vis = visualRef.current.monsters.get(m.instanceId);
              if (!vis) {
                  vis = { x: m.x, y: m.y };
                  visualRef.current.monsters.set(m.instanceId, vis);
              }
              
              // Linear MoveTowards
              const dx = m.x - vis.x;
              const dy = m.y - vis.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              // Monsters update every 1000ms. We want to take ~800ms to move.
              // That is ~1.25 tiles/sec. 
              // MOVE_SPEED is 2.7. So factor 0.45.
              const mSpeed = MOVE_SPEED * 0.45;

              if (dist > 0.001) {
                  if (dist <= mSpeed) {
                      vis.x = m.x;
                      vis.y = m.y;
                  } else {
                      const ratio = mSpeed / dist;
                      vis.x += dx * ratio;
                      vis.y += dy * ratio;
                  }
              } else {
                 vis.x = m.x;
                 vis.y = m.y;
              }
              
              // Draw
              let color = 0xa8a29e;
              let size = cellSize * 0.4;
              if (m.rank === EnemyRank.Boss) { color = 0xdc2626; size = cellSize * 0.6; }
              else if (m.rank === EnemyRank.Elite) { color = 0x3b82f6; size = cellSize * 0.5; }

              const mx = (vis.x + 0.5) * cellSize;
              const my = (vis.y + 0.5) * cellSize;

              entityGraphics.lineStyle(0);
              entityGraphics.beginFill(color);
              entityGraphics.drawCircle(mx, my, size / 2);
              entityGraphics.endFill();

              // Target Marker
              if (latestDataRef.current.targetMonsterId === m.instanceId) {
                   const R = cellSize * 0.45; // Radius
                   const L = cellSize * 0.15; // Log length
                   const color = 0xef4444; // Red-500

                   entityGraphics.lineStyle(2, color, 1);
                   
                   // Top Left
                   entityGraphics.moveTo(mx - R, my - R + L);
                   entityGraphics.lineTo(mx - R, my - R);
                   entityGraphics.lineTo(mx - R + L, my - R);

                   // Top Right
                   entityGraphics.moveTo(mx + R - L, my - R);
                   entityGraphics.lineTo(mx + R, my - R);
                   entityGraphics.lineTo(mx + R, my - R + L);

                   // Bottom Right
                   entityGraphics.moveTo(mx + R, my + R - L);
                   entityGraphics.lineTo(mx + R, my + R);
                   entityGraphics.lineTo(mx + R - L, my + R);

                   // Bottom Left
                   entityGraphics.moveTo(mx - R + L, my + R);
                   entityGraphics.lineTo(mx - R, my + R);
                   entityGraphics.lineTo(mx - R, my + R - L);
              }
          });
          
          // Cleanup Dead Monsters
          for (const id of visualRef.current.monsters.keys()) {
              if (!activeIds.has(id)) visualRef.current.monsters.delete(id);
          }
          
          // --- Draw Player (Visual Pos) ---
          playerGraphics.clear();
          const px = (visualRef.current.player.x + 0.5) * cellSize;
          const py = (visualRef.current.player.y + 0.5) * cellSize;
          
          playerGraphics.beginFill(0x22c55e); 
          playerGraphics.drawCircle(px, py, cellSize * 0.4);
          playerGraphics.endFill();
          
          const pulse = (Math.sin(Date.now() / 200) + 1) * 0.5; 
          playerGraphics.lineStyle(2, 0x86efac, 0.5 + (pulse * 0.5));
          playerGraphics.drawCircle(px, py, cellSize * 0.4 + (pulse * 2));
      };
      
      app.ticker.add(ticker);

      // Cleanup
      return () => {
          app.destroy(true, { children: true });
      };
  }, [width, height, cellSize, mapData?.id]); // Re-init on resize or map change




  return <div ref={containerRef} />;
}
