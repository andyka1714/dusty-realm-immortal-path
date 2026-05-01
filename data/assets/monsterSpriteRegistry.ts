import type { Enemy } from "../../types";
import {
  MONSTER_SPRITE_ASSET_DEFINITIONS,
  type MonsterSpriteAction,
} from "./monsterSpriteAssets";
import type { AssetDefinition } from "./types";
import { resolveMonsterVisualProfile } from "../../utils/monsterVisualProfile";

export interface MonsterSpriteAssets {
  movementAssetId: string;
  combatAssetId: string;
}

export const listMonsterSpriteAssetDefinitions = (): AssetDefinition[] =>
  Object.values(MONSTER_SPRITE_ASSET_DEFINITIONS);

export const getMonsterSpriteAssetDefinitions = (): Record<string, AssetDefinition> =>
  MONSTER_SPRITE_ASSET_DEFINITIONS;

export const resolveMonsterSpriteAssets = (enemy: Enemy): MonsterSpriteAssets => {
  const profile = resolveMonsterVisualProfile(enemy);

  return {
    movementAssetId: profile.movementAssetId,
    combatAssetId: profile.combatAssetId,
  };
};

export const getMonsterSpriteAssetId = (
  enemy: Enemy,
  action: MonsterSpriteAction
): string =>
  action === "movement"
    ? resolveMonsterSpriteAssets(enemy).movementAssetId
    : resolveMonsterSpriteAssets(enemy).combatAssetId;
