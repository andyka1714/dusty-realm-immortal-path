import React, { useEffect, useMemo, useRef } from "react";
import * as PIXI from "pixi.js-legacy";
import { ActiveMonster, Coordinate, MapData, Portal } from "../../types";
import type { WorldCombatStagePresentation } from "../../utils/worldCombatPresentation";
import {
  buildPixelPrototypeScene,
  createPixelPrototypePixiAppOptions,
} from "../../utils/pixelAdventurePrototype";

interface AdventurePixelStagePrototypeProps {
  mapData: MapData;
  playerPosition: Coordinate;
  activeMonsters: ActiveMonster[];
  portals: Portal[];
  targetMonsterId: string | null;
  combatPresentation?: WorldCombatStagePresentation | null;
  width: number;
  height: number;
  onTileClick: (x: number, y: number) => void;
  onPlayerArrive?: (x: number, y: number) => void;
  onPrototypeReady?: (runtime: { renderFrame: () => void } | null) => void;
}

const TERRAIN_FILL_COLORS = {
  grass: 0x406a37,
  dirt: 0x6f5133,
  field: 0x6f8f3a,
  water: 0x2a6b83,
  path: 0x8a744d,
  portal: 0x3f4a2b,
} as const;

const drawTerrainTile = ({
  graphics,
  x,
  y,
  cellSize,
  kind,
}: {
  graphics: PIXI.Graphics;
  x: number;
  y: number;
  cellSize: number;
  kind: keyof typeof TERRAIN_FILL_COLORS;
}) => {
  const px = x * cellSize;
  const py = y * cellSize;
  const fill = TERRAIN_FILL_COLORS[kind];

  graphics.beginFill(fill, 1);
  graphics.drawRect(px, py, cellSize, cellSize);
  graphics.endFill();

  graphics.lineStyle(1, 0x132114, 0.25);
  graphics.drawRect(px, py, cellSize, cellSize);

  if (kind === "field") {
    graphics.beginFill(0xa6cf4a, 0.65);
    graphics.drawRect(px + cellSize * 0.15, py + cellSize * 0.2, cellSize * 0.12, cellSize * 0.45);
    graphics.drawRect(px + cellSize * 0.42, py + cellSize * 0.12, cellSize * 0.12, cellSize * 0.55);
    graphics.drawRect(px + cellSize * 0.7, py + cellSize * 0.22, cellSize * 0.12, cellSize * 0.42);
    graphics.endFill();
  }

  if (kind === "water") {
    graphics.beginFill(0x9be2ff, 0.35);
    graphics.drawRect(px + cellSize * 0.15, py + cellSize * 0.24, cellSize * 0.2, cellSize * 0.1);
    graphics.drawRect(px + cellSize * 0.5, py + cellSize * 0.48, cellSize * 0.25, cellSize * 0.08);
    graphics.endFill();
  }
};

const drawDangerZone = ({
  container,
  cellSize,
  centerX,
  centerY,
  radiusCells,
}: {
  container: PIXI.Container;
  cellSize: number;
  centerX: number;
  centerY: number;
  radiusCells: number;
}) => {
  const ring = new PIXI.Graphics();
  const squareSize = Math.max(4, Math.floor(cellSize * 0.18));
  const halfRange = Math.max(1, radiusCells);

  ring.beginFill(0xf97316, 0.65);
  for (let dx = -halfRange; dx <= halfRange; dx += 1) {
    for (let dy = -halfRange; dy <= halfRange; dy += 1) {
      const isEdge = Math.abs(dx) === halfRange || Math.abs(dy) === halfRange;
      if (!isEdge) continue;

      ring.drawRect(
        centerX + dx * cellSize - squareSize / 2,
        centerY + dy * cellSize - squareSize / 2,
        squareSize,
        squareSize
      );
    }
  }
  ring.endFill();
  container.addChild(ring);
};

const drawTargetFocus = ({
  container,
  centerX,
  centerY,
  cellSize,
}: {
  container: PIXI.Container;
  centerX: number;
  centerY: number;
  cellSize: number;
}) => {
  const reticle = new PIXI.Graphics();
  const offset = cellSize * 0.38;
  const size = Math.max(5, cellSize * 0.16);

  reticle.beginFill(0xfacc15, 1);
  [
    { x: centerX - offset, y: centerY - offset },
    { x: centerX + offset - size, y: centerY - offset },
    { x: centerX - offset, y: centerY + offset - size },
    { x: centerX + offset - size, y: centerY + offset - size },
  ].forEach((corner) => {
    reticle.drawRect(corner.x, corner.y, size, size);
  });
  reticle.endFill();

  container.addChild(reticle);
};

const drawProjectileCue = ({
  container,
  fromX,
  fromY,
  toX,
  toY,
}: {
  container: PIXI.Container;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}) => {
  const projectile = new PIXI.Graphics();
  const steps = 4;

  projectile.beginFill(0x9ee8ff, 0.9);
  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    const x = fromX + (toX - fromX) * progress;
    const y = fromY + (toY - fromY) * progress;
    projectile.drawRect(x - 3, y - 3, 6, 6);
  }
  projectile.endFill();

  container.addChild(projectile);
};

const drawStatusCue = ({
  container,
  centerX,
  centerY,
}: {
  container: PIXI.Container;
  centerX: number;
  centerY: number;
}) => {
  const badge = new PIXI.Graphics();
  badge.beginFill(0x111827, 0.95);
  badge.drawRoundedRect(-12, -8, 24, 16, 4);
  badge.endFill();
  badge.lineStyle(1, 0x93c5fd, 0.8);
  badge.drawRoundedRect(-12, -8, 24, 16, 4);
  badge.x = centerX;
  badge.y = centerY - 54;

  const text = new PIXI.Text("狀", {
    fontFamily: "monospace",
    fontSize: 10,
    fill: 0xe0f2fe,
  });
  text.anchor.set(0.5);
  badge.addChild(text);
  container.addChild(badge);
};

const resolveTokenAccent = (tone: "player" | "enemy" | "elite" | "boss") => {
  if (tone === "player") return 0x4ade80;
  if (tone === "elite") return 0xfacc15;
  if (tone === "boss") return 0xfb7185;
  return 0xf59e0b;
};

const drawEntityToken = ({
  container,
  centerX,
  centerY,
  label,
  tone,
  isTargeted = false,
  cellSize,
}: {
  container: PIXI.Container;
  centerX: number;
  centerY: number;
  label: string;
  tone: "player" | "enemy" | "elite" | "boss";
  isTargeted?: boolean;
  cellSize: number;
}) => {
  const accent = resolveTokenAccent(tone);
  const tokenSize = Math.max(24, Math.floor(cellSize * 0.72));
  const token = new PIXI.Graphics();

  token.beginFill(0x111827, 0.96);
  token.lineStyle(isTargeted ? 3 : 2, accent, 1);
  token.drawRoundedRect(
    -tokenSize / 2,
    -tokenSize / 2,
    tokenSize,
    tokenSize,
    6
  );
  token.endFill();

  const text = new PIXI.Text(label, {
    fontFamily: "PingFang TC, Noto Sans TC, sans-serif",
    fontSize: Math.max(14, Math.floor(cellSize * 0.42)),
    fontWeight: "700",
    fill: 0xf8fafc,
  });
  text.anchor.set(0.5);
  text.x = centerX;
  text.y = centerY + 1;

  token.x = centerX;
  token.y = centerY;
  container.addChild(token, text);
};

export const AdventurePixelStagePrototype: React.FC<AdventurePixelStagePrototypeProps> = ({
  mapData,
  playerPosition,
  activeMonsters,
  portals,
  targetMonsterId,
  combatPresentation = null,
  width,
  height,
  onTileClick,
  onPlayerArrive,
  onPrototypeReady,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const previousPlayerRef = useRef<string | null>(null);
  const isMobile = width < 480;

  const model = useMemo(
    () =>
      buildPixelPrototypeScene({
        mapData,
        playerPosition,
        activeMonsters,
        portals,
        targetMonsterId,
        combatPresentation,
        width,
        height,
        isMobile,
      }),
    [
      activeMonsters,
      combatPresentation,
      height,
      isMobile,
      mapData,
      playerPosition,
      portals,
      targetMonsterId,
      width,
    ]
  );

  useEffect(() => {
    if (!canvasRef.current || !model.supported) {
      return;
    }

    const app = new PIXI.Application(
      createPixelPrototypePixiAppOptions({
        width,
        height,
      })
    );

    canvasRef.current.innerHTML = "";
    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    return () => {
      onPrototypeReady?.(null);
      app.destroy(true, true);
      appRef.current = null;
    };
  }, [height, model.supported, onPrototypeReady, width]);

  useEffect(() => {
    const app = appRef.current;
    if (!app || !model.supported) {
      return;
    }

    const root = new PIXI.Container();
    app.stage.removeChildren();
    app.stage.addChild(root);

    const terrainLayer = new PIXI.Graphics();
    model.terrain.forEach((tile) => {
      drawTerrainTile({
        graphics: terrainLayer,
        x: tile.x - model.viewport.startX,
        y: tile.y - model.viewport.startY,
        cellSize: model.metrics.cellSize,
        kind: tile.kind,
      });
    });
    root.addChild(terrainLayer);

    const interactionLayer = new PIXI.Graphics();
    interactionLayer.beginFill(0xffffff, 0.001);
    interactionLayer.drawRect(0, 0, model.metrics.pixelWidth, model.metrics.pixelHeight);
    interactionLayer.endFill();
    interactionLayer.eventMode = "static";
    interactionLayer.on("pointertap", (event: PIXI.FederatedPointerEvent) => {
      const local = event.getLocalPosition(interactionLayer);
      const gridX = model.viewport.startX + Math.floor(local.x / model.metrics.cellSize);
      const gridY = model.viewport.startY + Math.floor(local.y / model.metrics.cellSize);
      onTileClick(gridX, gridY);
    });
    root.addChild(interactionLayer);

    const portalLayer = new PIXI.Container();
    model.portals.forEach((portal) => {
      const clampedLocalX = Math.min(
        model.viewport.endX,
        Math.max(model.viewport.startX, portal.worldX)
      );
      const clampedLocalY = Math.min(
        model.viewport.endY,
        Math.max(model.viewport.startY, portal.worldY)
      );
      const centerX =
        (clampedLocalX - model.viewport.startX + 0.5) * model.metrics.cellSize;
      const centerY =
        (clampedLocalY - model.viewport.startY + 0.5) * model.metrics.cellSize;
      const marker = new PIXI.Graphics();
      marker.beginFill(0x0b1120, 0.95);
      marker.drawRect(-10, -10, 20, 20);
      marker.endFill();
      marker.lineStyle(2, 0x67e8f9, 0.85);
      marker.drawRect(-10, -10, 20, 20);
      marker.x = centerX;
      marker.y = centerY;
      portalLayer.addChild(marker);
    });
    root.addChild(portalLayer);

    const entityLayer = new PIXI.Container();

    model.monsters.forEach((monster) => {
      const centerX = (monster.x - model.viewport.startX + 0.5) * model.metrics.cellSize;
      const centerY = (monster.y - model.viewport.startY + 0.5) * model.metrics.cellSize;

      drawEntityToken({
        container: entityLayer,
        centerX,
        centerY: centerY + model.metrics.cellSize * 0.12,
        label: monster.tokenLabel,
        tone: monster.tokenTone,
        isTargeted: monster.isTargeted,
        cellSize: model.metrics.cellSize,
      });

      if (monster.isTargeted && model.cues.showTargetFocus) {
        drawTargetFocus({
          container: entityLayer,
          centerX,
          centerY,
          cellSize: model.metrics.cellSize,
        });
      }

      if (monster.isTargeted && model.cues.showStatusCue) {
        drawStatusCue({
          container: entityLayer,
          centerX,
          centerY,
        });
      }

      if (monster.isTargeted && model.cues.showDangerZone) {
        drawDangerZone({
          container: entityLayer,
          cellSize: model.metrics.cellSize,
          centerX,
          centerY,
          radiusCells: model.cues.dangerRadiusCells,
        });
      }
    });

    const playerCenterX =
      (model.player.x - model.viewport.startX + 0.5) * model.metrics.cellSize;
    const playerCenterY =
      (model.player.y - model.viewport.startY + 0.5) * model.metrics.cellSize;
    drawEntityToken({
      container: entityLayer,
      centerX: playerCenterX,
      centerY: playerCenterY + model.metrics.cellSize * 0.12,
      label: model.player.tokenLabel,
      tone: model.player.tokenTone,
      cellSize: model.metrics.cellSize,
    });

    if (model.cues.showProjectileCue) {
      const targetMonster = model.monsters.find((monster) => monster.isTargeted);
      if (targetMonster) {
        const targetX =
          (targetMonster.x - model.viewport.startX + 0.5) * model.metrics.cellSize;
        const targetY =
          (targetMonster.y - model.viewport.startY + 0.5) * model.metrics.cellSize;

        drawProjectileCue({
          container: entityLayer,
          fromX: targetX,
          fromY: targetY - 12,
          toX: playerCenterX,
          toY: playerCenterY - 10,
        });
      }
    }

    root.addChild(entityLayer);
    app.render();
    onPrototypeReady?.({
      renderFrame: () => appRef.current?.render(),
    });
  }, [model, onPrototypeReady, onTileClick]);

  useEffect(() => {
    const currentKey = `${playerPosition.x},${playerPosition.y}`;
    if (previousPlayerRef.current === null) {
      previousPlayerRef.current = currentKey;
      return;
    }

    if (previousPlayerRef.current !== currentKey) {
      previousPlayerRef.current = currentKey;
      onPlayerArrive?.(playerPosition.x, playerPosition.y);
    }
  }, [onPlayerArrive, playerPosition.x, playerPosition.y]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-stone-700 bg-stone-950/95">
      <div className="absolute left-3 top-3 z-10 rounded-lg border border-cyan-900/60 bg-black/70 px-3 py-2 text-xs text-cyan-100 backdrop-blur">
        <div className="font-bold tracking-[0.18em] text-cyan-200">像素地圖 + 文字 token</div>
        <div className="mt-1 text-stone-300">
          {mapData.name} · {isMobile ? "Mobile 2x" : "Desktop 3x"}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 text-[11px] text-stone-200">
        {["近戰命中", "投射物", "危險區", "Target Focus"].map((label) => (
          <span
            key={label}
            className="rounded-full border border-stone-700 bg-black/65 px-2 py-1 backdrop-blur"
          >
            {label}
          </span>
        ))}
      </div>

      {!model.supported && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-6 text-center">
          <div className="max-w-md rounded-xl border border-amber-900/60 bg-stone-950/90 p-4 text-sm text-amber-100 shadow-2xl">
            {model.reason}
          </div>
        </div>
      )}

      <div
        ref={canvasRef}
        className="h-full w-full"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};
