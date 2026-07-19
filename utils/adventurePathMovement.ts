import type { Coordinate } from "../types";

const getGridDistance = (from: Coordinate, to: Coordinate) =>
  Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

const getPathToNearestReachableEngagementCell = ({
  playerPosition,
  targetPosition,
  engagementRange,
  width,
  height,
  isBlocked = () => false,
}: {
  playerPosition: Coordinate;
  targetPosition: Coordinate;
  engagementRange: number;
  width: number;
  height: number;
  isBlocked?: (x: number, y: number) => boolean;
}): Coordinate[] => {
  const queue: { pos: Coordinate; path: Coordinate[] }[] = [
    { pos: playerPosition, path: [] },
  ];
  const visited = new Set<string>([`${playerPosition.x},${playerPosition.y}`]);
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
  ];

  let iterations = 0;
  while (queue.length > 0 && iterations < width * height) {
    iterations++;
    const { pos, path } = queue.shift()!;
    if (
      path.length > 0 &&
      getGridDistance(pos, targetPosition) <= engagementRange &&
      (pos.x !== targetPosition.x || pos.y !== targetPosition.y)
    ) {
      return path;
    }

    const sortedDirs = [...dirs].sort((a, b) => {
      const distA = getGridDistance(
        { x: pos.x + a.x, y: pos.y + a.y },
        targetPosition
      );
      const distB = getGridDistance(
        { x: pos.x + b.x, y: pos.y + b.y },
        targetPosition
      );
      return distA - distB;
    });

    for (const dir of sortedDirs) {
      const nextX = pos.x + dir.x;
      const nextY = pos.y + dir.y;
      if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) {
        continue;
      }
      if (nextX === targetPosition.x && nextY === targetPosition.y) {
        continue;
      }
      if (isBlocked(nextX, nextY)) continue;
      if (
        dir.x !== 0 &&
        dir.y !== 0 &&
        (isBlocked(pos.x + dir.x, pos.y) || isBlocked(pos.x, pos.y + dir.y))
      ) continue;

      const key = `${nextX},${nextY}`;
      if (visited.has(key)) {
        continue;
      }

      visited.add(key);
      queue.push({
        pos: { x: nextX, y: nextY },
        path: [...path, { x: nextX, y: nextY }],
      });
    }
  }

  return [];
};

export const resolveEngagementPath = ({
  playerPosition,
  targetPosition,
  engagementRange,
  width,
  height,
  isBlocked,
}: {
  playerPosition: Coordinate;
  targetPosition: Coordinate;
  engagementRange: number;
  width: number;
  height: number;
  isBlocked?: (x: number, y: number) => boolean;
}): Coordinate[] => {
  if (getGridDistance(playerPosition, targetPosition) <= engagementRange) {
    return [];
  }

  return getPathToNearestReachableEngagementCell({
    playerPosition,
    targetPosition,
    engagementRange,
    width,
    height,
    isBlocked,
  });
};

export const resolveImmediatePathStep = ({
  playerPosition,
  path,
}: {
  playerPosition: Coordinate;
  path: Coordinate[];
}):
  | {
      dx: number;
      dy: number;
      nextPosition: Coordinate;
      remainingPath: Coordinate[];
    }
  | null => {
  const [nextPosition, ...remainingPath] = path;
  if (!nextPosition) {
    return null;
  }

  const dx = nextPosition.x - playerPosition.x;
  const dy = nextPosition.y - playerPosition.y;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) {
    return null;
  }

  return {
    dx,
    dy,
    nextPosition,
    remainingPath,
  };
};
