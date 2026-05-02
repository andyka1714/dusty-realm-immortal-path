import { BESTIARY } from "../data/enemies";
import {
  createMonsterSpriteAssetId,
  type MonsterSpriteBodyType,
} from "../data/assets/monsterSpriteAssets";
import { ElementType, EnemyRank, MajorRealm, type Enemy } from "../types";

export type MonsterVisualArchetype =
  | "dog"
  | "wolf"
  | "bear"
  | "boar"
  | "beast"
  | "swordsman"
  | "humanoid_bandit"
  | "humanoid_guard"
  | "sword_spirit"
  | "sword_avatar"
  | "giant_crab"
  | "turtle"
  | "insect"
  | "serpent"
  | "dragon"
  | "spirit"
  | "ghost"
  | "construct"
  | "dao_avatar"
  | "plant"
  | "elemental";

export type MonsterVisualVariant =
  | "mortal"
  | "sword"
  | "beast"
  | "mystic"
  | "fire"
  | "water"
  | "wood"
  | "metal"
  | "earth"
  | "void"
  | "tribulation"
  | "immortal"
  | "emperor";

export interface MonsterRankVisualLanguage {
  rank: EnemyRank;
  aura: "none" | "element_edge" | "domain";
  targetCue: "standard" | "elite" | "boss";
  outline: "clean" | "bright" | "boss";
  healthBar: "standard" | "elite" | "boss";
  telegraph: "none" | "minor" | "major";
  animationIntensity: "low" | "medium" | "high";
}

export interface MonsterVisualProfile {
  enemyId: string;
  visualArchetype: MonsterVisualArchetype;
  visualVariant: MonsterVisualVariant;
  bodyType: MonsterSpriteBodyType;
  footprintTiles: { width: number; height: number };
  collisionFootprintTiles: { width: number; height: number };
  heightTiles: number;
  anchor: "feet";
  playerScaleReference: { width: 1; height: 2 };
  rankVisual: MonsterRankVisualLanguage;
  productionReadySprite: boolean;
  directionalMovement: "four_direction";
  directionalCombat: "four_direction";
  movementAssetId: string;
  combatAssetId: string;
}

const PLAYER_SCALE_REFERENCE = { width: 1, height: 2 } as const;
const PRODUCTION_READY_MONSTER_IDS = new Set<string>([
  "m1_c1",
  "m1_c2",
  "m2_c1",
  "m2_c2",
  "m3_c1",
  "m3_c2",
  "m10_c1",
  "m10_c2",
  "m11_c1",
  "m11_c2",
  "m12_c1",
  "m12_c2",
  "m20_c1",
  "m20_c2",
  "m21_c1",
  "m21_c2",
  "m22_c1",
  "m22_c2",
  "m5_c1",
  "m5_c2",
]);

const includesAny = (name: string, tokens: readonly string[]): boolean =>
  tokens.some((token) => name.includes(token));

const resolveBodyTypeAndArchetype = (
  enemy: Enemy
): Pick<MonsterVisualProfile, "visualArchetype" | "bodyType"> => {
  const name = enemy.name;

  if (includesAny(name, ["鴻蒙", "道祖", "天道", "時空", "歸墟"])) {
    return { visualArchetype: "dao_avatar", bodyType: "colossus" };
  }
  if (includesAny(name, ["劍尊", "仙尊"])) {
    return { visualArchetype: "sword_avatar", bodyType: "humanoid" };
  }
  if (includesAny(name, ["巨蟹", "蟹"])) {
    return { visualArchetype: "giant_crab", bodyType: "low_crawler" };
  }
  if (includesAny(name, ["龜"])) {
    return { visualArchetype: "turtle", bodyType: "low_crawler" };
  }
  if (includesAny(name, ["蝠"])) {
    return { visualArchetype: "beast", bodyType: "winged" };
  }
  if (includesAny(name, ["蜈蚣", "蜘蛛", "蠍", "蚊", "蟲", "蛭"])) {
    return { visualArchetype: "insect", bodyType: "low_crawler" };
  }
  if (includesAny(name, ["蛟", "龍", "蟒", "蛇"])) {
    return { visualArchetype: name.includes("龍") ? "dragon" : "serpent", bodyType: "serpentine" };
  }
  if (includesAny(name, ["熊"])) {
    return { visualArchetype: "bear", bodyType: "quadruped" };
  }
  if (includesAny(name, ["狼"])) {
    return { visualArchetype: "wolf", bodyType: "quadruped" };
  }
  if (includesAny(name, ["狗"])) {
    return { visualArchetype: "dog", bodyType: "quadruped" };
  }
  if (includesAny(name, ["豬", "虎", "豹", "猿", "獸", "鹿"])) {
    return { visualArchetype: name.includes("豬") ? "boar" : "beast", bodyType: "quadruped" };
  }
  if (includesAny(name, ["魂", "靈", "幽", "鬼", "劍意", "幻影", "怨"])) {
    return {
      visualArchetype: name.includes("劍") ? "sword_spirit" : name.includes("鬼") ? "ghost" : "spirit",
      bodyType: "spirit",
    };
  }
  if (includesAny(name, ["稻草人"])) {
    return { visualArchetype: "plant", bodyType: "plant" };
  }
  if (includesAny(name, ["石像", "傀儡", "石靈", "巨人", "構裝"])) {
    return { visualArchetype: "construct", bodyType: "construct" };
  }
  if (includesAny(name, ["花", "藤", "樹", "樁", "荊棘", "毒草", "靈植"])) {
    return { visualArchetype: "plant", bodyType: "plant" };
  }
  if (includesAny(name, ["劍客", "劍修", "劍士"])) {
    return { visualArchetype: "swordsman", bodyType: "humanoid" };
  }
  if (includesAny(name, ["匪", "守衛", "獵手", "道童", "戰士", "修士", "使"])) {
    return {
      visualArchetype: name.includes("匪") ? "humanoid_bandit" : "humanoid_guard",
      bodyType: "humanoid",
    };
  }
  if (enemy.aiStyle === "caster" || enemy.aiStyle === "ranged") {
    return { visualArchetype: "elemental", bodyType: "spirit" };
  }

  return { visualArchetype: "beast", bodyType: "quadruped" };
};

const resolveVisualVariant = (enemy: Enemy): MonsterVisualVariant => {
  if (enemy.realm >= MajorRealm.ImmortalEmperor) return "emperor";
  if (enemy.realm >= MajorRealm.Immortal) return "immortal";
  if (enemy.realm >= MajorRealm.Tribulation) return "tribulation";
  if (enemy.name.includes("虛") || enemy.name.includes("空")) return "void";

  switch (enemy.element) {
    case ElementType.Fire:
      return "fire";
    case ElementType.Water:
      return "water";
    case ElementType.Wood:
      return "wood";
    case ElementType.Metal:
      return enemy.name.includes("劍") ? "sword" : "metal";
    case ElementType.Earth:
      return enemy.name.includes("獸") || enemy.name.includes("熊") ? "beast" : "earth";
    default:
      return enemy.realm === MajorRealm.Mortal ? "mortal" : "mystic";
  }
};

const isHeavyQuadruped = (enemy: Enemy, archetype: MonsterVisualArchetype): boolean =>
  archetype === "bear" ||
  includesAny(enemy.name, ["巨熊", "熊", "巨猿", "猿", "犀", "巨獸", "甲獸"]);

const isSmallQuadruped = (enemy: Enemy): boolean =>
  includesAny(enemy.name, ["鼠", "靈貓"]);

const resolveFootprintAndHeight = (
  enemy: Enemy,
  bodyType: MonsterSpriteBodyType,
  archetype: MonsterVisualArchetype
): Pick<MonsterVisualProfile, "footprintTiles" | "heightTiles"> => {
  if (bodyType === "colossus") {
    return { footprintTiles: { width: 2, height: 2 }, heightTiles: 6 };
  }
  if (enemy.rank === EnemyRank.Boss && bodyType === "humanoid") {
    return { footprintTiles: { width: 2, height: 2 }, heightTiles: 4 };
  }
  if (enemy.rank === EnemyRank.Boss && bodyType === "low_crawler") {
    return { footprintTiles: { width: 4, height: 2 }, heightTiles: 2 };
  }
  if (enemy.rank === EnemyRank.Boss && bodyType === "serpentine") {
    return { footprintTiles: { width: 4, height: 2 }, heightTiles: 3 };
  }
  if (bodyType === "low_crawler") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 3, height: 2 } : { width: 2, height: 1 },
      heightTiles: enemy.rank === EnemyRank.Elite ? 2 : 1,
    };
  }
  if (bodyType === "serpentine") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 3, height: 2 } : { width: 2, height: 1 },
      heightTiles: enemy.rank === EnemyRank.Elite ? 2 : 1,
    };
  }
  if (bodyType === "construct") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Common ? { width: 1, height: 1 } : { width: 2, height: 2 },
      heightTiles: enemy.rank === EnemyRank.Common ? 3 : 4,
    };
  }
  if (bodyType === "spirit") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Common ? { width: 1, height: 1 } : { width: 2, height: 2 },
      heightTiles: enemy.rank === EnemyRank.Common ? 2 : enemy.rank === EnemyRank.Elite ? 3 : 4,
    };
  }
  if (bodyType === "plant") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Common ? { width: 1, height: 1 } : { width: 2, height: 2 },
      heightTiles: enemy.rank === EnemyRank.Common ? 2 : 3,
    };
  }
  if (bodyType === "winged") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 2, height: 2 } : { width: 2, height: 1 },
      heightTiles: enemy.rank === EnemyRank.Elite ? 2 : 1,
    };
  }
  if (bodyType === "humanoid") {
    return {
      footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 1, height: 1 } : { width: 1, height: 1 },
      heightTiles: enemy.rank === EnemyRank.Elite ? 3 : 2,
    };
  }
  if (bodyType === "quadruped" && isHeavyQuadruped(enemy, archetype)) {
    if (enemy.rank === EnemyRank.Boss) {
      return { footprintTiles: { width: 3, height: 2 }, heightTiles: 3 };
    }

    return {
      footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 2, height: 2 } : { width: 2, height: 2 },
      heightTiles: enemy.rank === EnemyRank.Elite ? 3 : 2,
    };
  }
  if (bodyType === "quadruped" && isSmallQuadruped(enemy)) {
    return {
      footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 1, height: 1 } : { width: 1, height: 1 },
      heightTiles: enemy.rank === EnemyRank.Elite ? 2 : 1,
    };
  }

  return {
    footprintTiles: enemy.rank === EnemyRank.Elite ? { width: 2, height: 2 } : { width: 2, height: 1 },
    heightTiles: enemy.rank === EnemyRank.Elite ? 2 : 1,
  };
};

const resolveRankVisualLanguage = (rank: EnemyRank): MonsterRankVisualLanguage => {
  switch (rank) {
    case EnemyRank.Boss:
      return {
        rank,
        aura: "domain",
        targetCue: "boss",
        outline: "boss",
        healthBar: "boss",
        telegraph: "major",
        animationIntensity: "high",
      };
    case EnemyRank.Elite:
      return {
        rank,
        aura: "element_edge",
        targetCue: "elite",
        outline: "bright",
        healthBar: "elite",
        telegraph: "minor",
        animationIntensity: "medium",
      };
    default:
      return {
        rank,
        aura: "none",
        targetCue: "standard",
        outline: "clean",
        healthBar: "standard",
        telegraph: "none",
        animationIntensity: "low",
      };
  }
};

export const resolveMonsterVisualProfile = (enemy: Enemy): MonsterVisualProfile => {
  const semantic = resolveBodyTypeAndArchetype(enemy);
  const size = resolveFootprintAndHeight(enemy, semantic.bodyType, semantic.visualArchetype);

  return {
    enemyId: enemy.id,
    ...semantic,
    visualVariant: resolveVisualVariant(enemy),
    ...size,
    collisionFootprintTiles: { width: 1, height: 1 },
    anchor: "feet",
    playerScaleReference: PLAYER_SCALE_REFERENCE,
    rankVisual: resolveRankVisualLanguage(enemy.rank),
    productionReadySprite: PRODUCTION_READY_MONSTER_IDS.has(enemy.id),
    directionalMovement: "four_direction",
    directionalCombat: "four_direction",
    movementAssetId: createMonsterSpriteAssetId({
      enemyId: enemy.id,
      action: "movement",
    }),
    combatAssetId: createMonsterSpriteAssetId({
      enemyId: enemy.id,
      action: "combat",
    }),
  };
};

export const listMissingMonsterVisualProfiles = (
  bestiary: Record<string, Enemy> = BESTIARY
): string[] =>
  Object.values(bestiary)
    .filter((enemy) => {
      const profile = resolveMonsterVisualProfile(enemy);

      return (
        !profile.visualArchetype ||
        !profile.bodyType ||
        !profile.movementAssetId ||
        !profile.combatAssetId
      );
    })
    .map((enemy) => enemy.id);
