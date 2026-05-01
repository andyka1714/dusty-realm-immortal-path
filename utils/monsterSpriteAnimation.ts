import type { PlayerSpriteDirection } from "./playerSpriteAnimation";
import type { MonsterVisualProfile } from "./monsterVisualProfile";

const DIRECTION_ROWS: Record<PlayerSpriteDirection, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

const MOVEMENT_FRAME_COUNT = 4;
const COMBAT_FRAME_COUNT = 6;
const MOVEMENT_FRAME_DURATION_MS = 160;
const COMBAT_FRAME_DURATION_MS = 110;
const MONSTER_FOOTLINE_RATIO = 11 / 12;

export const getMonsterSpriteLayout = ({
  cellSize,
  profile,
  frameHeight,
}: {
  cellSize: number;
  profile: MonsterVisualProfile;
  frameHeight: number;
}): {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  const visualWidth = profile.footprintTiles.width * cellSize;
  const visualHeight = profile.heightTiles * cellSize;

  return {
    anchorX: 0.5,
    anchorY: Math.round(frameHeight * MONSTER_FOOTLINE_RATIO) / frameHeight,
    x: 0,
    y: 0,
    width: visualWidth,
    height: visualHeight,
  };
};

export const getMonsterSpriteFrame = ({
  direction,
  action,
  elapsedMs,
}: {
  direction: PlayerSpriteDirection;
  action: "movement" | "combat";
  elapsedMs: number;
}): { row: number; col: number; frameIndex: number } => {
  const row = DIRECTION_ROWS[direction];
  const frameCount = action === "movement" ? MOVEMENT_FRAME_COUNT : COMBAT_FRAME_COUNT;
  const duration = action === "movement" ? MOVEMENT_FRAME_DURATION_MS : COMBAT_FRAME_DURATION_MS;
  const col = Math.floor(Math.max(0, elapsedMs) / duration) % frameCount;

  return {
    row,
    col,
    frameIndex: row * frameCount + col,
  };
};
