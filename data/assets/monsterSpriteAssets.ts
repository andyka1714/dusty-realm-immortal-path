import { BESTIARY } from "../enemies";
import { EnemyRank, type Enemy } from "../../types";
import type { AssetDefinition } from "./types";

export const MONSTER_SPRITE_BODY_TYPES = [
  "humanoid",
  "quadruped",
  "low_crawler",
  "serpentine",
  "winged",
  "spirit",
  "construct",
  "colossus",
  "plant",
] as const;

export type MonsterSpriteBodyType = (typeof MONSTER_SPRITE_BODY_TYPES)[number];
export type MonsterSpriteAction = "movement" | "combat";

const RANK_SEGMENT: Record<EnemyRank, string> = {
  [EnemyRank.Common]: "common",
  [EnemyRank.Elite]: "elite",
  [EnemyRank.Boss]: "boss",
};

const BODY_LABELS: Record<MonsterSpriteBodyType, string> = {
  humanoid: "人形",
  quadruped: "走獸",
  low_crawler: "伏地甲殼",
  serpentine: "蛇蛟龍",
  winged: "飛行",
  spirit: "靈體",
  construct: "構裝",
  colossus: "法相巨像",
  plant: "靈植毒物",
};

const GENERATED_MONSTER_SPRITE_ASSETS = new Set<string>([
  "enemy.m1_c1.movement_v1",
  "enemy.m1_c1.combat_v1",
  "enemy.m1_c2.movement_v1",
  "enemy.m1_c2.combat_v1",
  "enemy.m2_c1.movement_v1",
  "enemy.m2_c1.combat_v1",
  "enemy.m2_c2.movement_v1",
  "enemy.m2_c2.combat_v1",
  "enemy.m3_c1.movement_v1",
  "enemy.m3_c1.combat_v1",
  "enemy.m3_c2.movement_v1",
  "enemy.m3_c2.combat_v1",
  "enemy.m10_c1.movement_v1",
  "enemy.m10_c1.combat_v1",
  "enemy.m10_c2.movement_v1",
  "enemy.m10_c2.combat_v1",
  "enemy.m11_c1.movement_v1",
  "enemy.m11_c1.combat_v1",
  "enemy.m11_c2.movement_v1",
  "enemy.m11_c2.combat_v1",
  "enemy.m12_c1.movement_v1",
  "enemy.m12_c1.combat_v1",
  "enemy.m12_c2.movement_v1",
  "enemy.m12_c2.combat_v1",
  "enemy.m20_c1.movement_v1",
  "enemy.m20_c1.combat_v1",
  "enemy.m20_c2.movement_v1",
  "enemy.m20_c2.combat_v1",
  "enemy.m21_c1.movement_v1",
  "enemy.m21_c1.combat_v1",
  "enemy.m21_c2.movement_v1",
  "enemy.m21_c2.combat_v1",
  "enemy.m22_c1.movement_v1",
  "enemy.m22_c1.combat_v1",
  "enemy.m22_c2.movement_v1",
  "enemy.m22_c2.combat_v1",
  "enemy.m5_c1.movement_v1",
  "enemy.m5_c1.combat_v1",
  "enemy.m5_c2.movement_v1",
  "enemy.m5_c2.combat_v1",
  "enemy.m6_c1.movement_v1",
  "enemy.m6_c1.combat_v1",
  "enemy.m6_c2.movement_v1",
  "enemy.m6_c2.combat_v1",
  "enemy.m7_c1.movement_v1",
  "enemy.m7_c1.combat_v1",
  "enemy.m7_c2.movement_v1",
  "enemy.m7_c2.combat_v1",
  "enemy.m14_c1.movement_v1",
  "enemy.m14_c1.combat_v1",
  "enemy.m14_c2.movement_v1",
  "enemy.m14_c2.combat_v1",
]);

export const createMonsterSpriteAssetId = ({
  enemyId,
  action,
}: {
  enemyId: string;
  action: MonsterSpriteAction;
}): string => `enemy.${enemyId}.${action}_v1`;

export const createMonsterSpriteBasePath = ({
  enemyId,
  action,
}: {
  enemyId: string;
  action: MonsterSpriteAction;
}): string =>
  `/assets/generated/characters/monsters/${enemyId.replaceAll("_", "-")}-${action}-v1`;

const createMonsterSpriteAssetDefinition = ({
  enemy,
  action,
}: {
  enemy: Enemy;
  action: MonsterSpriteAction;
}): AssetDefinition => {
  const rankSegment = RANK_SEGMENT[enemy.rank];
  const actionLabel = action === "movement" ? "四方向移動" : "四方向戰鬥";
  const assetId = createMonsterSpriteAssetId({ enemyId: enemy.id, action });
  const isGenerated = GENERATED_MONSTER_SPRITE_ASSETS.has(assetId);

  return {
    assetId,
    kind: "enemy",
    name: `${enemy.name} ${actionLabel}圖樣`,
    description:
      `${enemy.name} 的獨立 ${actionLabel} sheet，以玩家 1x2 比例與腳底錨點為基準。`,
    style: "project_native",
    source: isGenerated ? "generated" : "pending_generate2dsprite",
    version: 1,
    usage: [action === "movement" ? "enemy_movement" : "enemy_combat", "map_token"],
    basePath: createMonsterSpriteBasePath({ enemyId: enemy.id, action }),
    files: {
      raw: "raw-sheet.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      framePrefix: action === "movement" ? "enemy_movement" : "enemy_combat",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      profile: "enemy",
      rows: 4,
      cols: action === "movement" ? 4 : 6,
      frameCount: action === "movement" ? 16 : 24,
      framesPerDirection: action === "movement" ? 4 : 6,
      rowOrder: ["down", "left", "right", "up"],
      anchor: "feet",
      view: "topdown",
      qcStatus: isGenerated ? "passed" : "pending",
    },
    tags: [
      "enemy",
      enemy.id,
      rankSegment,
      action,
      "four-direction",
      "requires-generate2dsprite",
    ],
  };
};

export const MONSTER_SPRITE_ASSET_DEFINITIONS: Record<string, AssetDefinition> =
  Object.fromEntries(
    Object.values(BESTIARY).flatMap((enemy) =>
      (["movement", "combat"] as const).map((action) => {
        const asset = createMonsterSpriteAssetDefinition({ enemy, action });

        return [asset.assetId, asset];
      })
    )
  );
