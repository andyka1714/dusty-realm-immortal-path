import { ActiveMonster, Coordinate, MapData, Portal } from "../types";
import type { WorldCombatStagePresentation } from "./worldCombatPresentation";

export const PIXEL_PROTOTYPE_MAP_ID = "20";
export const PIXEL_TILE_SIZE = 16;
export const PIXEL_PROTOTYPE_DESKTOP_CELL_SIZE = 48;
export const PIXEL_PROTOTYPE_MOBILE_CELL_SIZE = 32;
const MIN_VIEWPORT_CELLS = 9;

export type AdventureStageRenderMode = "official" | "pixel_prototype";

export type PixelPrototypeTerrainKind =
  | "grass"
  | "dirt"
  | "field"
  | "water"
  | "path"
  | "portal";

export type PixelPrototypeMonsterArchetype = "melee" | "ranged" | "caster";

export interface PixelPrototypeMetrics {
  cellSize: number;
  tileSize: number;
  scale: number;
  cols: number;
  rows: number;
  pixelWidth: number;
  pixelHeight: number;
  entityDisplaySize: number;
}

export interface PixelPrototypeViewport {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface PixelPrototypeTerrainCell extends Coordinate {
  kind: PixelPrototypeTerrainKind;
}

export interface PixelPrototypeMonsterModel extends Coordinate {
  instanceId: string;
  templateId: string;
  name: string;
  archetype: PixelPrototypeMonsterArchetype;
  isTargeted: boolean;
  worldX: number;
  worldY: number;
}

export interface PixelPrototypePortalModel extends Coordinate {
  key: string;
  label: string;
  worldX: number;
  worldY: number;
}

export interface PixelPrototypePlayerModel extends Coordinate {
  worldX: number;
  worldY: number;
}

export interface PixelPrototypeCueModel {
  showDangerZone: boolean;
  dangerRadiusCells: number;
  showProjectileCue: boolean;
  showTargetFocus: boolean;
  showStatusCue: boolean;
}

export interface PixelPrototypeSceneModel {
  supported: boolean;
  reason?: string;
  mapId: string;
  mapName: string;
  metrics: PixelPrototypeMetrics;
  viewport: PixelPrototypeViewport;
  terrain: PixelPrototypeTerrainCell[];
  player: PixelPrototypePlayerModel;
  monsters: PixelPrototypeMonsterModel[];
  portals: PixelPrototypePortalModel[];
  cues: PixelPrototypeCueModel;
}

export const createPixelPrototypePixiAppOptions = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => ({
  width,
  height,
  antialias: false,
  autoDensity: false,
  resolution: 1,
  backgroundAlpha: 1,
  backgroundColor: 0x110f0d,
  forceCanvas: true,
});

const ensureOdd = (value: number) => {
  let nextValue = Math.max(MIN_VIEWPORT_CELLS, Math.floor(value));
  if (nextValue % 2 === 0) {
    nextValue -= 1;
  }

  if (nextValue < MIN_VIEWPORT_CELLS) {
    return MIN_VIEWPORT_CELLS;
  }

  return nextValue;
};

export const getPixelPrototypeMetrics = ({
  width,
  height,
  isMobile,
}: {
  width: number;
  height: number;
  isMobile: boolean;
}): PixelPrototypeMetrics => {
  const cellSize = isMobile
    ? PIXEL_PROTOTYPE_MOBILE_CELL_SIZE
    : PIXEL_PROTOTYPE_DESKTOP_CELL_SIZE;
  const cols = ensureOdd(width / cellSize);
  const rows = ensureOdd(height / cellSize);

  return {
    cellSize,
    tileSize: PIXEL_TILE_SIZE,
    scale: cellSize / PIXEL_TILE_SIZE,
    cols,
    rows,
    pixelWidth: cols * cellSize,
    pixelHeight: rows * cellSize,
    entityDisplaySize: cellSize * 2,
  };
};

export const resolveAdventureStageRenderMode = ({
  requestedMode,
  mapId,
}: {
  requestedMode: AdventureStageRenderMode;
  mapId?: string | null;
}): AdventureStageRenderMode =>
  requestedMode === "pixel_prototype" && mapId === PIXEL_PROTOTYPE_MAP_ID
    ? "pixel_prototype"
    : "official";

const buildViewport = ({
  playerPosition,
  mapData,
  metrics,
}: {
  playerPosition: Coordinate;
  mapData: MapData;
  metrics: PixelPrototypeMetrics;
}): PixelPrototypeViewport => {
  const halfCols = Math.floor(metrics.cols / 2);
  const halfRows = Math.floor(metrics.rows / 2);
  const maxStartX = Math.max(0, mapData.width - metrics.cols);
  const maxStartY = Math.max(0, mapData.height - metrics.rows);

  const startX = Math.min(Math.max(0, playerPosition.x - halfCols), maxStartX);
  const startY = Math.min(Math.max(0, playerPosition.y - halfRows), maxStartY);

  return {
    startX,
    startY,
    endX: Math.min(mapData.width - 1, startX + metrics.cols - 1),
    endY: Math.min(mapData.height - 1, startY + metrics.rows - 1),
  };
};

const isInsideViewport = (
  point: Coordinate,
  viewport: PixelPrototypeViewport
) =>
  point.x >= viewport.startX &&
  point.x <= viewport.endX &&
  point.y >= viewport.startY &&
  point.y <= viewport.endY;

const resolveTerrainKind = (x: number, y: number): PixelPrototypeTerrainKind => {
  if ((x + y) % 13 === 0) return "water";
  if ((x * 2 + y) % 7 === 0) return "field";
  if ((x + y * 3) % 11 === 0) return "path";
  if ((x * 5 + y * 2) % 17 === 0) return "dirt";
  return "grass";
};

const resolveMonsterArchetype = (
  mapData: MapData,
  monster: ActiveMonster
): PixelPrototypeMonsterArchetype => {
  const template = mapData.enemies.find((enemy) => enemy.id === monster.templateId);

  if (template?.aiStyle === "caster") {
    return "caster";
  }
  if (template?.aiStyle === "ranged") {
    return "ranged";
  }
  return "melee";
};

const buildTerrain = (
  viewport: PixelPrototypeViewport,
  portals: Portal[]
): PixelPrototypeTerrainCell[] => {
  const cells: PixelPrototypeTerrainCell[] = [];

  for (let y = viewport.startY; y <= viewport.endY; y += 1) {
    for (let x = viewport.startX; x <= viewport.endX; x += 1) {
      cells.push({
        x,
        y,
        kind: resolveTerrainKind(x, y),
      });
    }
  }

  portals.forEach((portal) => {
    if (isInsideViewport(portal, viewport)) {
      cells.push({
        x: portal.x,
        y: portal.y,
        kind: "portal",
      });
    }
  });

  return cells;
};

export const buildPixelPrototypeScene = ({
  mapData,
  playerPosition,
  activeMonsters,
  portals,
  targetMonsterId,
  combatPresentation,
  width,
  height,
  isMobile,
}: {
  mapData: MapData;
  playerPosition: Coordinate;
  activeMonsters: ActiveMonster[];
  portals: Portal[];
  targetMonsterId: string | null;
  combatPresentation: WorldCombatStagePresentation | null;
  width: number;
  height: number;
  isMobile: boolean;
}): PixelPrototypeSceneModel => {
  const metrics = getPixelPrototypeMetrics({ width, height, isMobile });
  const viewport = buildViewport({ playerPosition, mapData, metrics });

  if (mapData.id !== PIXEL_PROTOTYPE_MAP_ID) {
    return {
      supported: false,
      reason: "目前像素風 vertical slice 只鎖定在東郊靈田 (map 20)。",
      mapId: mapData.id,
      mapName: mapData.name,
      metrics,
      viewport,
      terrain: [],
      player: {
        ...playerPosition,
        worldX: playerPosition.x,
        worldY: playerPosition.y,
      },
      monsters: [],
      portals: [],
      cues: {
        showDangerZone: false,
        dangerRadiusCells: 0,
        showProjectileCue: false,
        showTargetFocus: false,
        showStatusCue: false,
      },
    };
  }

  const monsters = activeMonsters
    .filter((monster) => isInsideViewport(monster, viewport))
    .map((monster) => ({
      instanceId: monster.instanceId,
      templateId: monster.templateId,
      name: monster.name,
      x: monster.x,
      y: monster.y,
      worldX: monster.x,
      worldY: monster.y,
      archetype: resolveMonsterArchetype(mapData, monster),
      isTargeted: monster.instanceId === targetMonsterId,
    }));

  const targetedMonster = monsters.find((monster) => monster.isTargeted) ?? null;

  return {
    supported: true,
    mapId: mapData.id,
    mapName: mapData.name,
    metrics,
    viewport,
    terrain: buildTerrain(viewport, portals),
    player: {
      ...playerPosition,
      worldX: playerPosition.x,
      worldY: playerPosition.y,
    },
    monsters,
    portals: portals.map((portal) => ({
        key: `${portal.targetMapId}:${portal.x}:${portal.y}`,
        label: portal.label,
        x: portal.x,
        y: portal.y,
        worldX: portal.x,
        worldY: portal.y,
      })),
    cues: {
      showDangerZone: Boolean(combatPresentation?.showEnemyDangerFill && targetedMonster),
      dangerRadiusCells: combatPresentation?.enemyRangeRadius ?? 0,
      showProjectileCue: monsters.some((monster) => monster.archetype !== "melee"),
      showTargetFocus: Boolean(combatPresentation?.showTargetFocusReticle && targetedMonster),
      showStatusCue: targetMonsterId !== null,
    },
  };
};
