import { Coordinate, VisualEffect } from "../types";

export interface VisualEffectPresentation {
  effectType: NonNullable<VisualEffect["type"]>;
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  radiusPx?: number;
  lifeTime: number;
}

export const getVisualEffectLifeTime = (
  effectType: NonNullable<VisualEffect["type"]>,
  durationMs?: number
) => {
  if (durationMs !== undefined) return durationMs;

  switch (effectType) {
    case "projectile":
      return 420;
    case "impact":
      return 260;
    case "cast":
      return 320;
    case "area":
      return 650;
    case "text":
    default:
      return 1500;
  }
};

export const getVisualEffectPresentation = ({
  effect,
  playerPosition,
  cellSize,
}: {
  effect: VisualEffect;
  playerPosition: Coordinate;
  cellSize: number;
}): VisualEffectPresentation => {
  const effectType = effect.type ?? "text";
  const startX =
    (effect.x !== undefined ? effect.x : playerPosition.x + 0.5) * cellSize;
  const startY =
    (effect.y !== undefined ? effect.y : playerPosition.y) * cellSize - 40;

  const targetX =
    effect.targetX !== undefined
      ? effect.targetX * cellSize + cellSize * 0.5
      : effect.x !== undefined
        ? effect.x * cellSize + cellSize * 0.5
        : undefined;
  const targetY =
    effect.targetY !== undefined
      ? effect.targetY * cellSize + cellSize * 0.5
      : effect.y !== undefined
        ? effect.y * cellSize + cellSize * 0.5
        : undefined;

  let radiusPx: number | undefined;
  if (effectType === "area") {
    radiusPx = Math.max(cellSize * 0.6, (effect.radius ?? 1) * cellSize);
  } else if (effectType === "impact") {
    radiusPx = Math.max(cellSize * 0.2, (effect.radius ?? 0.5) * cellSize);
  } else if (effectType === "cast") {
    radiusPx = Math.max(cellSize * 0.3, (effect.radius ?? 0.55) * cellSize);
  }

  return {
    effectType,
    startX,
    startY,
    targetX,
    targetY,
    radiusPx,
    lifeTime: getVisualEffectLifeTime(effectType, effect.durationMs),
  };
};
