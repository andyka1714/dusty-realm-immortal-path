export type GeneratedAssetKind =
  | "character"
  | "npc"
  | "enemy"
  | "item"
  | "effect"
  | "map"
  | "ui";

export type GeneratedAssetStyle =
  | "pixel_art"
  | "clean_hd"
  | "pixel_inspired"
  | "map_style"
  | "project_native";

export type GeneratedAssetSource =
  | "generated"
  | "manual"
  | "placeholder"
  | "pending_generate2dsprite";

export type GeneratedAssetUsage =
  | "player_walk"
  | "player_combat_idle"
  | "player_combat_attack"
  | "npc_idle"
  | "map_token"
  | "enemy_movement"
  | "enemy_combat"
  | "npc_portrait"
  | "enemy_idle"
  | "item_icon"
  | "skill_icon"
  | "cast_fx"
  | "projectile_fx"
  | "impact_fx"
  | "map_background"
  | "fallback";

export type SpriteAnchor = "center" | "bottom" | "feet";
export type SpriteView = "topdown" | "side" | "3/4";

export interface GeneratedAssetFiles {
  raw?: string;
  sheet?: string;
  transparent?: string;
  preview?: string;
  framesDir?: string;
  framePrefix?: string;
  prompt?: string;
  meta?: string;
}

export interface GeneratedSpriteMetadata {
  profile?: "humanoid" | "enemy";
  rows: number;
  cols: number;
  frameCount: number;
  framesPerDirection?: number;
  anchor: SpriteAnchor;
  view: SpriteView;
  frameWidth?: number;
  frameHeight?: number;
  rowOrder?: readonly string[];
  targetHeight?: number;
  maxWidth?: number;
  heightTolerance?: number;
  footlineY?: number;
  centerX?: number;
  centerTolerance?: number;
  idleCadenceMs?: number;
  qcStatus?: "passed" | "failed" | "pending";
}

export interface AssetDefinition {
  assetId: string;
  kind: GeneratedAssetKind;
  name: string;
  description: string;
  style: GeneratedAssetStyle;
  source: GeneratedAssetSource;
  version: number;
  usage: GeneratedAssetUsage[];
  basePath: string;
  files: GeneratedAssetFiles;
  sprite?: GeneratedSpriteMetadata;
  tags: string[];
}
