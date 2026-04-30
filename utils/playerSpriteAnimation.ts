export type PlayerSpriteDirection = "down" | "left" | "right" | "up";

const DIRECTION_ROWS: Record<PlayerSpriteDirection, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

const WALK_FRAME_COUNT = 4;
const FRAME_DURATION_MS = 160;
const COMBAT_FRAME_COUNT = 6;
const COMBAT_ACTIVE_WINDOW_MIN_MS = 360;
const COMBAT_ACTIVE_WINDOW_MAX_MS = 720;
const PLAYER_SPRITE_FOOTLINE_RATIO = 11 / 12;
const CHARACTER_SPRITE_HEIGHT_CELLS = 2;

export const getPlayerSpriteGrounding = ({
  frameHeight,
  footPixelY,
}: {
  frameHeight: number;
  footPixelY?: number;
}): { anchorX: number; anchorY: number; yOffsetRatio: number } => {
  const resolvedFootPixelY =
    footPixelY ?? Math.round(frameHeight * PLAYER_SPRITE_FOOTLINE_RATIO);

  return {
    anchorX: 0.5,
    anchorY: resolvedFootPixelY / frameHeight,
    yOffsetRatio: 0.5,
  };
};

export const getCharacterTileAnchorPosition = ({
  tileX,
  tileY,
  cellSize,
}: {
  tileX: number;
  tileY: number;
  cellSize: number;
}): { x: number; y: number } => ({
  x: (tileX + 0.5) * cellSize,
  y: (tileY + 0.5) * cellSize,
});

export const getCharacterSpriteLayout = ({
  cellSize,
  frameHeight,
  footPixelY,
}: {
  cellSize: number;
  frameHeight: number;
  footPixelY?: number;
}): {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  const grounding = getPlayerSpriteGrounding({ frameHeight, footPixelY });
  const height = cellSize * CHARACTER_SPRITE_HEIGHT_CELLS;

  return {
    anchorX: grounding.anchorX,
    anchorY: grounding.anchorY,
    x: 0,
    y: 0,
    width: height,
    height,
  };
};

export const shouldUsePlayerCombatSprite = ({
  isMoving,
  hasCombatPresentation,
  canPlayCombatAnimation,
  isAttackReady,
  elapsedSinceActionMs,
  attackIntervalMs,
}: {
  isMoving: boolean;
  hasCombatPresentation: boolean;
  canPlayCombatAnimation: boolean;
  isAttackReady: boolean;
  elapsedSinceActionMs: number;
  attackIntervalMs: number;
}): boolean =>
  hasCombatPresentation &&
  canPlayCombatAnimation &&
  !isMoving &&
  attackIntervalMs > 0 &&
  (isAttackReady ||
    (elapsedSinceActionMs >= 0 &&
      elapsedSinceActionMs < getPlayerCombatActiveWindowMs(attackIntervalMs)));

export const getPlayerCombatActiveWindowMs = (attackIntervalMs: number): number =>
  Math.min(
    attackIntervalMs,
    Math.max(
      COMBAT_ACTIVE_WINDOW_MIN_MS,
      Math.min(COMBAT_ACTIVE_WINDOW_MAX_MS, attackIntervalMs * 0.6)
    )
  );

export const getPlayerSpriteDirectionFromDelta = (
  dx: number,
  dy: number,
  fallback: PlayerSpriteDirection
): PlayerSpriteDirection => {
  if (Math.abs(dx) <= 0.001 && Math.abs(dy) <= 0.001) {
    return fallback;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }

  return dy > 0 ? "down" : "up";
};

export const getPlayerSpriteDirectionTowardTarget = ({
  source,
  target,
  fallback,
}: {
  source: { x: number; y: number };
  target: { x: number; y: number };
  fallback: PlayerSpriteDirection;
}): PlayerSpriteDirection =>
  getPlayerSpriteDirectionFromDelta(
    target.x - source.x,
    target.y - source.y,
    fallback
  );

export const shouldFaceClickedInteractionTarget = ({
  source,
  target,
  hasInteractionTarget,
}: {
  source: { x: number; y: number };
  target: { x: number; y: number };
  hasInteractionTarget: boolean;
}): boolean => {
  if (!hasInteractionTarget) {
    return false;
  }

  return Math.abs(target.x - source.x) + Math.abs(target.y - source.y) <= 1;
};

export const getPlayerSpriteFrame = ({
  direction,
  isMoving,
  elapsedMs,
}: {
  direction: PlayerSpriteDirection;
  isMoving: boolean;
  elapsedMs: number;
}): { row: number; col: number; frameIndex: number } => {
  const row = DIRECTION_ROWS[direction];
  const col = isMoving
    ? Math.floor(elapsedMs / FRAME_DURATION_MS) % WALK_FRAME_COUNT
    : 0;

  return {
    row,
    col,
    frameIndex: row * WALK_FRAME_COUNT + col,
  };
};

export const getPlayerCombatSpriteFrame = ({
  direction,
  elapsedSinceActionMs,
  attackIntervalMs,
}: {
  direction: PlayerSpriteDirection;
  elapsedSinceActionMs: number;
  attackIntervalMs: number;
}): { row: number; col: number; frameIndex: number } => {
  if (attackIntervalMs <= 0 || elapsedSinceActionMs < 0) {
    const row = DIRECTION_ROWS[direction];
    return { row, col: 0, frameIndex: row * COMBAT_FRAME_COUNT };
  }

  const activeWindowMs = getPlayerCombatActiveWindowMs(attackIntervalMs);

  if (elapsedSinceActionMs >= activeWindowMs) {
    const row = DIRECTION_ROWS[direction];
    const col = COMBAT_FRAME_COUNT - 1;
    return { row, col, frameIndex: row * COMBAT_FRAME_COUNT + col };
  }

  const col = Math.min(
    COMBAT_FRAME_COUNT - 1,
    Math.floor((elapsedSinceActionMs / activeWindowMs) * COMBAT_FRAME_COUNT)
  );
  const row = DIRECTION_ROWS[direction];

  return {
    row,
    col,
    frameIndex: row * COMBAT_FRAME_COUNT + col,
  };
};
