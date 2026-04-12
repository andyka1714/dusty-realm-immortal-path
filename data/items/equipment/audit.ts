import {
  EnemyRank,
  EquipmentItem,
  EquipmentStats,
  EquipmentType,
  Item,
  ItemQuality,
  MajorRealm,
  MajorRealmCN,
  ProfessionType,
} from "../../../types";
import { EQUIPMENT_ITEMS } from "./index";

export type EquipmentPathId = "general" | "sword" | "body" | "mage";
export type RouteId = "north" | "west" | "east";

type StatWeightMap = Partial<Record<keyof EquipmentStats, number>>;

export interface EquipmentQualityBand {
  quality: ItemQuality;
  totals: EquipmentStats;
}

export interface EquipmentPathAudit {
  path: EquipmentPathId;
  profession: ProfessionType;
  itemIds: string[];
  dominantStats: (keyof EquipmentStats)[];
  baselineQuality: ItemQuality;
  baselineTotals: EquipmentStats;
  qualityBands: Record<ItemQuality, EquipmentQualityBand>;
}

export interface EquipmentRealmAudit {
  realm: MajorRealm;
  realmName: string;
  itemCount: number;
  baselineQuality: ItemQuality;
  paths: Record<EquipmentPathId, EquipmentPathAudit | undefined>;
}

const isEquipmentItem = (item: Item): item is EquipmentItem =>
  item.category === "Equipment";

const ALL_REALMS = Object.values(MajorRealm).filter(
  (value): value is MajorRealm => typeof value === "number"
);

const QUALITY_ORDER = [
  ItemQuality.Low,
  ItemQuality.Medium,
  ItemQuality.High,
  ItemQuality.Immortal,
] as const;

export const EQUIPMENT_QUALITY_MULTIPLIERS: Record<ItemQuality, number> = {
  [ItemQuality.Low]: 1.0,
  [ItemQuality.Medium]: 1.2,
  [ItemQuality.High]: 1.4,
  [ItemQuality.Immortal]: 1.7,
};

export const DROP_QUALITY_WEIGHTS: Record<
  EnemyRank,
  Record<ItemQuality, number>
> = {
  [EnemyRank.Common]: {
    [ItemQuality.Low]: 85,
    [ItemQuality.Medium]: 14,
    [ItemQuality.High]: 1,
    [ItemQuality.Immortal]: 0,
  },
  [EnemyRank.Elite]: {
    [ItemQuality.Low]: 50,
    [ItemQuality.Medium]: 40,
    [ItemQuality.High]: 9,
    [ItemQuality.Immortal]: 1,
  },
  [EnemyRank.Boss]: {
    [ItemQuality.Low]: 0,
    [ItemQuality.Medium]: 30,
    [ItemQuality.High]: 60,
    [ItemQuality.Immortal]: 10,
  },
};

export const BOSS_DROP_QUALITY_TABLE = DROP_QUALITY_WEIGHTS[EnemyRank.Boss];

export const EQUIPMENT_PROFESSION_STAT_WEIGHTS: Record<
  ProfessionType,
  StatWeightMap
> = {
  [ProfessionType.None]: {
    attack: 0.5,
    defense: 0.5,
    hp: 0.5,
  },
  [ProfessionType.Sword]: {
    attack: 1,
    crit: 0.9,
    critDamage: 0.85,
    speed: 0.65,
    defense: 0.35,
    hp: 0.2,
  },
  [ProfessionType.Body]: {
    defense: 1,
    hp: 0.95,
    damageReduction: 0.9,
    regenHp: 0.75,
    blockRate: 0.7,
    physique: 0.65,
    attack: 0.45,
  },
  [ProfessionType.Mage]: {
    magic: 1,
    insight: 0.85,
    mp: 0.8,
    res: 0.65,
    speed: 0.4,
    crit: 0.35,
    defense: 0.2,
  },
};

export const ROUTE_DROP_PREFERENCES: Record<
  RouteId,
  {
    profession: ProfessionType;
    favoredTypes: EquipmentType[];
    favoredStats: (keyof EquipmentStats)[];
    theme: string;
  }
> = {
  north: {
    profession: ProfessionType.Sword,
    favoredTypes: [
      EquipmentType.Sword,
      EquipmentType.Shield,
      EquipmentType.Helmet,
      EquipmentType.Armor,
      EquipmentType.Boots,
      EquipmentType.Ring,
    ],
    favoredStats: ["attack", "crit", "critDamage", "speed"],
    theme: "劍意、寒鋒、單體爆發、破防",
  },
  west: {
    profession: ProfessionType.Body,
    favoredTypes: [
      EquipmentType.Gauntlet,
      EquipmentType.Shield,
      EquipmentType.Helmet,
      EquipmentType.Armor,
      EquipmentType.Boots,
      EquipmentType.Ring,
    ],
    favoredStats: [
      "physique",
      "hp",
      "defense",
      "damageReduction",
      "regenHp",
      "blockRate",
    ],
    theme: "淬體、獸血、站樁、續戰",
  },
  east: {
    profession: ProfessionType.Mage,
    favoredTypes: [
      EquipmentType.Staff,
      EquipmentType.Shield,
      EquipmentType.Helmet,
      EquipmentType.Armor,
      EquipmentType.Boots,
      EquipmentType.Ring,
    ],
    favoredStats: ["magic", "insight", "mp", "res", "speed"],
    theme: "靈潮、幻術、湖澤、法力循環",
  },
};

export const SPLIT_REALM_BOSS_ROUTE_REGISTRY = [
  { enemyId: "m7_b1", realm: MajorRealm.QiRefining, route: "north" as const },
  { enemyId: "m16_b1", realm: MajorRealm.QiRefining, route: "west" as const },
  { enemyId: "m26_b1", realm: MajorRealm.QiRefining, route: "east" as const },
  { enemyId: "m32_b1", realm: MajorRealm.Foundation, route: "north" as const },
  { enemyId: "m42_b1", realm: MajorRealm.Foundation, route: "west" as const },
  { enemyId: "m52_b1", realm: MajorRealm.Foundation, route: "east" as const },
  { enemyId: "m62_b1", realm: MajorRealm.GoldenCore, route: "north" as const },
  { enemyId: "m72_b1", realm: MajorRealm.GoldenCore, route: "west" as const },
  { enemyId: "m82_b1", realm: MajorRealm.GoldenCore, route: "east" as const },
  { enemyId: "m92_b1", realm: MajorRealm.NascentSoul, route: "north" as const },
  { enemyId: "m102_b1", realm: MajorRealm.NascentSoul, route: "west" as const },
  { enemyId: "m112_b1", realm: MajorRealm.NascentSoul, route: "east" as const },
];

const createEmptyStats = (): EquipmentStats => ({
  physique: 0,
  rootBone: 0,
  insight: 0,
  comprehension: 0,
  fortune: 0,
  charm: 0,
  hp: 0,
  mp: 0,
  attack: 0,
  defense: 0,
  magic: 0,
  res: 0,
  speed: 0,
  crit: 0,
  critDamage: 0,
  dodge: 0,
  blockRate: 0,
  regenHp: 0,
  damageReduction: 0,
});

const sumItemStats = (items: EquipmentItem[], quality: ItemQuality) => {
  const totals = createEmptyStats();
  const multiplier = EQUIPMENT_QUALITY_MULTIPLIERS[quality];

  items.forEach((item) => {
    Object.entries(item.stats).forEach(([key, value]) => {
      const statKey = key as keyof EquipmentStats;
      totals[statKey] = (totals[statKey] || 0) + Math.ceil(value * multiplier);
    });

    if (quality >= ItemQuality.High) {
      if (item.stats.attack) totals.attack = (totals.attack || 0) + 1;
      if (item.stats.defense) totals.defense = (totals.defense || 0) + 1;
    }
  });

  return totals;
};

const getDominantStats = (
  profession: ProfessionType
): (keyof EquipmentStats)[] => {
  const weights = EQUIPMENT_PROFESSION_STAT_WEIGHTS[profession];
  return Object.entries(weights)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 5)
    .map(([stat]) => stat as keyof EquipmentStats);
};

const getRealmEquipmentItems = (realm: MajorRealm) =>
  Object.values(EQUIPMENT_ITEMS).filter(
    (item): item is EquipmentItem => isEquipmentItem(item) && item.minRealm === realm
  );

const inferBaselineQuality = (items: EquipmentItem[]) => items[0]?.quality ?? ItemQuality.Low;

const buildPathAudit = (
  path: EquipmentPathId,
  profession: ProfessionType,
  items: EquipmentItem[],
  baselineQuality: ItemQuality
): EquipmentPathAudit => ({
  path,
  profession,
  itemIds: items.map((item) => item.id),
  dominantStats: getDominantStats(profession),
  baselineQuality,
  baselineTotals: sumItemStats(items, baselineQuality),
  qualityBands: {
    [ItemQuality.Low]: {
      quality: ItemQuality.Low,
      totals: sumItemStats(items, ItemQuality.Low),
    },
    [ItemQuality.Medium]: {
      quality: ItemQuality.Medium,
      totals: sumItemStats(items, ItemQuality.Medium),
    },
    [ItemQuality.High]: {
      quality: ItemQuality.High,
      totals: sumItemStats(items, ItemQuality.High),
    },
    [ItemQuality.Immortal]: {
      quality: ItemQuality.Immortal,
      totals: sumItemStats(items, ItemQuality.Immortal),
    },
  },
});

const buildRealmPaths = (
  realm: MajorRealm,
  items: EquipmentItem[]
): Record<EquipmentPathId, EquipmentPathAudit | undefined> => {
  const baselineQuality = inferBaselineQuality(items);

  if (realm === MajorRealm.Mortal) {
    return {
      general: buildPathAudit(
        "general",
        ProfessionType.None,
        items,
        baselineQuality
      ),
      sword: undefined,
      body: undefined,
      mage: undefined,
    };
  }

  return {
    general: undefined,
    sword: buildPathAudit(
      "sword",
      ProfessionType.Sword,
      items.slice(0, 6),
      baselineQuality
    ),
    body: buildPathAudit(
      "body",
      ProfessionType.Body,
      items.slice(6, 12),
      baselineQuality
    ),
    mage: buildPathAudit(
      "mage",
      ProfessionType.Mage,
      items.slice(12, 18),
      baselineQuality
    ),
  };
};

export const EQUIPMENT_REALM_AUDIT: EquipmentRealmAudit[] = ALL_REALMS.map(
  (realm) => {
    const items = getRealmEquipmentItems(realm);
    return {
      realm,
      realmName: MajorRealmCN[realm],
      itemCount: items.length,
      baselineQuality: inferBaselineQuality(items),
      paths: buildRealmPaths(realm, items),
    };
  }
);

export const getEquipmentRealmAudit = (realm: MajorRealm) =>
  EQUIPMENT_REALM_AUDIT.find((entry) => entry.realm === realm);
