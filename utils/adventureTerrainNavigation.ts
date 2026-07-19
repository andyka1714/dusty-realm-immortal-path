import type { Coordinate, MapData } from "../types";
import { buildAdventureTerrainTiles } from "./adventureTerrainPixelization";

const navigationCache = new Map<string, ReadonlySet<string>>();
const coordinateKey = (x: number, y: number) => `${x},${y}`;

const getProtectedCoordinates = (mapData: MapData) => {
  const protectedCoordinates = new Set<string>();
  const protect = (point: Coordinate, radius = 0) => {
    for (let y = point.y - radius; y <= point.y + radius; y += 1) {
      for (let x = point.x - radius; x <= point.x + radius; x += 1) {
        protectedCoordinates.add(coordinateKey(x, y));
      }
    }
  };

  mapData.portals.forEach((portal) => protect(portal, 1));
  mapData.npcs.forEach((npc) => protect(npc, 1));
  if (mapData.bossSpawn) protect(mapData.bossSpawn, 2);
  return protectedCoordinates;
};

export const getAdventureTerrainBlockedCoordinates = (mapData: MapData) => {
  const cacheKey = `${mapData.id}:${mapData.theme}:${mapData.width}x${mapData.height}`;
  const cached = navigationCache.get(cacheKey);
  if (cached) return cached;

  const protectedCoordinates = getProtectedCoordinates(mapData);
  const blocked = new Set<string>();
  const tiles = buildAdventureTerrainTiles({
    mapId: mapData.id,
    theme: mapData.theme,
    width: mapData.width,
    height: mapData.height,
    portals: mapData.portals,
    npcs: mapData.npcs,
    bossSpawn: mapData.bossSpawn,
  });

  tiles.forEach((tile) => {
    const key = coordinateKey(tile.x, tile.y);
    if (protectedCoordinates.has(key)) return;
    if (tile.kind === "water" || tile.semanticRole === "water" || tile.semanticRole === "hazard") {
      blocked.add(key);
    }
  });

  navigationCache.set(cacheKey, blocked);
  return blocked;
};

export const isAdventureTerrainBlocked = (mapData: MapData, x: number, y: number) =>
  x < 0 ||
  x >= mapData.width ||
  y < 0 ||
  y >= mapData.height ||
  getAdventureTerrainBlockedCoordinates(mapData).has(coordinateKey(x, y));

export const findAdventurePath = ({ start, end, mapData }: {
  start: Coordinate;
  end: Coordinate;
  mapData: MapData;
}): Coordinate[] => {
  if (isAdventureTerrainBlocked(mapData, end.x, end.y)) return [];

  const queue: Coordinate[] = [start];
  const visited = new Set<string>([coordinateKey(start.x, start.y)]);
  const previous = new Map<string, Coordinate>();
  const directions = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
    { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 },
  ];

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.x === end.x && current.y === end.y) break;
    const prioritized = [...directions].sort((a, b) =>
      Math.abs(current.x + a.x - end.x) + Math.abs(current.y + a.y - end.y) -
      (Math.abs(current.x + b.x - end.x) + Math.abs(current.y + b.y - end.y))
    );

    for (const direction of prioritized) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = coordinateKey(next.x, next.y);
      if (visited.has(key) || isAdventureTerrainBlocked(mapData, next.x, next.y)) continue;
      if (
        direction.x !== 0 && direction.y !== 0 &&
        (isAdventureTerrainBlocked(mapData, current.x + direction.x, current.y) ||
          isAdventureTerrainBlocked(mapData, current.x, current.y + direction.y))
      ) continue;

      visited.add(key);
      previous.set(key, current);
      queue.push(next);
    }
  }

  if (!visited.has(coordinateKey(end.x, end.y))) return [];
  const path: Coordinate[] = [];
  let cursor = end;
  while (cursor.x !== start.x || cursor.y !== start.y) {
    path.unshift(cursor);
    const parent = previous.get(coordinateKey(cursor.x, cursor.y));
    if (!parent) return [];
    cursor = parent;
  }
  return path;
};
