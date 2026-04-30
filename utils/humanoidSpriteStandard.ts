export const HUMANOID_WALK_SPRITE_STANDARD = {
  profile: "humanoid",
  frameWidth: 96,
  frameHeight: 96,
  rows: 4,
  cols: 4,
  frameCount: 16,
  rowOrder: ["down", "left", "right", "up"],
  targetHeight: 80,
  heightTolerance: 1,
  footlineY: 88,
  centerX: 48,
  centerTolerance: 1,
} as const;

export type HumanoidWalkSpriteStandard =
  typeof HUMANOID_WALK_SPRITE_STANDARD;

export const HUMANOID_COMBAT_SPRITE_STANDARD = {
  profile: "humanoid",
  frameWidth: 96,
  frameHeight: 96,
  rows: 4,
  cols: 6,
  frameCount: 24,
  framesPerDirection: 6,
  rowOrder: ["down", "left", "right", "up"],
  targetHeight: 80,
  maxWidth: 90,
  footlineY: 88,
  centerX: 48,
  centerTolerance: 2,
} as const;

export type HumanoidCombatSpriteStandard =
  typeof HUMANOID_COMBAT_SPRITE_STANDARD;

export const HUMANOID_IDLE_SPRITE_STANDARD = {
  profile: "humanoid",
  frameWidth: 96,
  frameHeight: 96,
  rows: 1,
  cols: 2,
  frameCount: 2,
  targetHeight: 80,
  heightTolerance: 1,
  footlineY: 88,
  centerX: 48,
  centerTolerance: 1,
  idleCadenceMs: 800,
} as const;

export type HumanoidIdleSpriteStandard =
  typeof HUMANOID_IDLE_SPRITE_STANDARD;
