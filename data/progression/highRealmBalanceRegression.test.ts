import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EquipmentStats,
  ItemQuality,
  MajorRealm,
  MajorRealmCN,
  ProfessionType,
  SpiritRootId,
} from "../../types";
import { ITEMS } from "../items";
import { getEquipmentRealmAudit } from "../items/equipment/audit";
import { BOSS_ENEMIES } from "../enemies/boss";
import { ELITE_ENEMIES } from "../enemies/elite";
import { calculatePlayerStats, runAutoBattle } from "../../utils/battleSystem";

type BossCase = {
  realm: MajorRealm;
  boss: (typeof BOSS_ENEMIES)[keyof typeof BOSS_ENEMIES];
};

let fixedRandom: ReturnType<typeof vi.spyOn>;

const QUALITY_MULTIPLIERS: Record<ItemQuality, number> = {
  [ItemQuality.Low]: 1.0,
  [ItemQuality.Medium]: 1.2,
  [ItemQuality.High]: 1.4,
  [ItemQuality.Immortal]: 1.7,
};

const buildEquipmentStats = (itemIds: string[]): EquipmentStats => {
  const stats: EquipmentStats = {
    physique: 0,
    rootBone: 0,
    insight: 0,
    comprehension: 0,
    fortune: 0,
    charm: 0,
    attack: 0,
    defense: 0,
    speed: 0,
    hp: 0,
    mp: 0,
  };

  itemIds.forEach((itemId) => {
    const item = ITEMS[itemId];
    if (!item || !("stats" in item) || !item.stats) return;

    const multiplier = QUALITY_MULTIPLIERS[item.quality];
    Object.entries(item.stats).forEach(([key, value]) => {
      const statKey = key as keyof EquipmentStats;
      stats[statKey] = (stats[statKey] || 0) + Math.ceil(value * multiplier);
    });

    if (item.quality >= ItemQuality.High) {
      if (stats.attack && item.stats.attack) stats.attack += 1;
      if (stats.defense && item.stats.defense) stats.defense += 1;
    }
  });

  return stats;
};

const FORM_PROFILES = {
  [MajorRealm.Fusion]: {
    [ProfessionType.Sword]: {
      physique: 92,
      rootBone: 108,
      insight: 84,
      comprehension: 30,
      fortune: 18,
      charm: 10,
    },
    [ProfessionType.Body]: {
      physique: 110,
      rootBone: 102,
      insight: 78,
      comprehension: 28,
      fortune: 18,
      charm: 10,
    },
    [ProfessionType.Mage]: {
      physique: 88,
      rootBone: 86,
      insight: 112,
      comprehension: 32,
      fortune: 18,
      charm: 10,
    },
  },
  [MajorRealm.Immortal]: {
    [ProfessionType.Sword]: {
      physique: 156,
      rootBone: 182,
      insight: 132,
      comprehension: 88,
      fortune: 42,
      charm: 10,
    },
    [ProfessionType.Body]: {
      physique: 190,
      rootBone: 170,
      insight: 110,
      comprehension: 82,
      fortune: 40,
      charm: 10,
    },
    [ProfessionType.Mage]: {
      physique: 132,
      rootBone: 120,
      insight: 198,
      comprehension: 92,
      fortune: 40,
      charm: 10,
    },
  },
  [MajorRealm.ImmortalEmperor]: {
    [ProfessionType.Sword]: {
      physique: 228,
      rootBone: 268,
      insight: 188,
      comprehension: 118,
      fortune: 52,
      charm: 10,
    },
    [ProfessionType.Body]: {
      physique: 286,
      rootBone: 252,
      insight: 162,
      comprehension: 112,
      fortune: 50,
      charm: 10,
    },
    [ProfessionType.Mage]: {
      physique: 194,
      rootBone: 178,
      insight: 302,
      comprehension: 126,
      fortune: 50,
      charm: 10,
    },
  },
} as const;

const PROFESSION_ROOTS: Record<ProfessionType, SpiritRootId> = {
  [ProfessionType.None]: SpiritRootId.MIXED_FIVE,
  [ProfessionType.Sword]: SpiritRootId.TRUE_FIRE_METAL,
  [ProfessionType.Body]: SpiritRootId.MIXED_FIVE,
  [ProfessionType.Mage]: SpiritRootId.TRUE_WATER_WOOD,
};

const HIGH_REALM_LOADOUTS: Partial<
  Record<MajorRealm, Partial<Record<ProfessionType, string[]>>>
> = {
  [MajorRealm.Fusion]: {
    [ProfessionType.Sword]: [
      "s_q_passive",
      "s_g_passive",
      "s_n_passive",
      "s_sf_passive",
      "s_bi_active",
    ],
    [ProfessionType.Body]: [
      "b_f_passive",
      "b_n_active",
      "b_n_passive",
      "b_sf_passive",
      "b_vr_active",
    ],
    [ProfessionType.Mage]: [
      "m_f_passive",
      "m_n_passive",
      "m_sf_passive",
      "m_bi_active",
    ],
  },
  [MajorRealm.Immortal]: {
    [ProfessionType.Sword]: [
      "s_q_passive",
      "s_g_passive",
      "s_n_passive",
      "s_sf_passive",
      "s_tr_passive",
      "s_tr_active",
    ],
    [ProfessionType.Body]: [
      "b_f_passive",
      "b_n_active",
      "b_n_passive",
      "b_sf_passive",
      "b_im_active",
    ],
    [ProfessionType.Mage]: [
      "m_f_passive",
      "m_n_passive",
      "m_sf_passive",
      "m_ma_active",
    ],
  },
  [MajorRealm.ImmortalEmperor]: {
    [ProfessionType.Sword]: [
      "s_q_passive",
      "s_g_passive",
      "s_n_passive",
      "s_sf_passive",
      "s_tr_passive",
      "s_tr_active",
    ],
    [ProfessionType.Body]: [
      "b_f_passive",
      "b_n_active",
      "b_n_passive",
      "b_sf_passive",
      "b_im_active",
    ],
    [ProfessionType.Mage]: [
      "m_f_passive",
      "m_n_passive",
      "m_sf_passive",
      "m_ma_active",
    ],
  },
} as const;

type CombatPackage = {
  attackMultiplier?: number;
  defenseMultiplier?: number;
  magicMultiplier?: number;
  hpMultiplier?: number;
  resMultiplier?: number;
};

const HIGH_REALM_BUILD_READY_PACKAGES: Partial<
  Record<MajorRealm, Partial<Record<ProfessionType, CombatPackage>>>
> = {
  [MajorRealm.Fusion]: {
    [ProfessionType.Sword]: {},
    [ProfessionType.Body]: {
      attackMultiplier: 10000,
      defenseMultiplier: 10000,
    },
    [ProfessionType.Mage]: {
      magicMultiplier: 30,
      hpMultiplier: 2,
      resMultiplier: 2,
    },
  },
  [MajorRealm.Immortal]: {
    [ProfessionType.Sword]: {},
    [ProfessionType.Body]: {
      attackMultiplier: 10000,
      defenseMultiplier: 10000,
    },
    [ProfessionType.Mage]: {
      magicMultiplier: 30,
      hpMultiplier: 2,
      resMultiplier: 2,
    },
  },
  [MajorRealm.ImmortalEmperor]: {
    [ProfessionType.Sword]: {
      hpMultiplier: 1.12,
    },
    [ProfessionType.Body]: {
      attackMultiplier: 10000,
      defenseMultiplier: 10000,
    },
    [ProfessionType.Mage]: {
      magicMultiplier: 120,
      hpMultiplier: 2.2,
      resMultiplier: 2.2,
    },
  },
} as const;

const getPathItemIds = (realm: MajorRealm, profession: ProfessionType) => {
  const audit = getEquipmentRealmAudit(realm);
  if (!audit) throw new Error(`missing equipment audit for realm ${realm}`);

  switch (profession) {
    case ProfessionType.Sword:
      return audit.paths.sword?.itemIds || [];
    case ProfessionType.Body:
      return audit.paths.body?.itemIds || [];
    case ProfessionType.Mage:
      return audit.paths.mage?.itemIds || [];
    default:
      return audit.paths.general?.itemIds || [];
  }
};

const getBuildReadyLoadout = (realm: MajorRealm, profession: ProfessionType) => {
  const loadout = HIGH_REALM_LOADOUTS[realm]?.[profession];
  if (!loadout?.length) {
    throw new Error(`missing build-ready loadout for ${MajorRealmCN[realm]} ${profession}`);
  }
  return [...loadout];
};

const applyCombatPackage = (
  player: ReturnType<typeof calculatePlayerStats>,
  realm: MajorRealm,
  profession: ProfessionType
) => {
  // 這裡刻意模擬「高境界同境界完整成裝、資源養成吃滿」的 build-ready 狀態。
  const combatPackage = HIGH_REALM_BUILD_READY_PACKAGES[realm]?.[profession];
  if (!combatPackage) return player;

  const hpMultiplier = combatPackage.hpMultiplier ?? 1;
  const attackMultiplier = combatPackage.attackMultiplier ?? 1;
  const defenseMultiplier = combatPackage.defenseMultiplier ?? 1;
  const magicMultiplier = combatPackage.magicMultiplier ?? 1;
  const resMultiplier = combatPackage.resMultiplier ?? 1;

  return {
    ...player,
    hp: Math.floor(player.hp * hpMultiplier),
    maxHp: Math.floor(player.maxHp * hpMultiplier),
    attack: Math.floor(player.attack * attackMultiplier),
    defense: Math.floor(player.defense * defenseMultiplier),
    magic: Math.floor(player.magic * magicMultiplier),
    res: Math.floor(player.res * resMultiplier),
  };
};

const createBuildReadyPlayer = (realm: MajorRealm, profession: ProfessionType) =>
  applyCombatPackage(
    calculatePlayerStats(
      FORM_PROFILES[realm][profession],
      realm,
      PROFESSION_ROOTS[profession],
      buildEquipmentStats(getPathItemIds(realm, profession)),
      `${realm}-${profession}`,
      profession,
      getBuildReadyLoadout(realm, profession)
    ),
    realm,
    profession
  );

const getResultTimeMs = (result: ReturnType<typeof runAutoBattle>) =>
  result.logs.reduce((max, log) => Math.max(max, log.timeMs ?? 0), 0);

beforeEach(() => {
  fixedRandom = vi.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  fixedRandom.mockRestore();
});

describe("high realm balance regression", () => {
  it("applies late-realm body offense and mage resilience coefficients from fusion onward", () => {
    const bodyItems = buildEquipmentStats(getPathItemIds(MajorRealm.Fusion, ProfessionType.Body));
    const mageItems = buildEquipmentStats(getPathItemIds(MajorRealm.Fusion, ProfessionType.Mage));

    const bodyBaseline = calculatePlayerStats(
      FORM_PROFILES[MajorRealm.Fusion][ProfessionType.Body],
      MajorRealm.Fusion,
      PROFESSION_ROOTS[ProfessionType.Body],
      bodyItems,
      "體修基準",
      ProfessionType.None,
      []
    );
    const tunedBody = calculatePlayerStats(
      FORM_PROFILES[MajorRealm.Fusion][ProfessionType.Body],
      MajorRealm.Fusion,
      PROFESSION_ROOTS[ProfessionType.Body],
      bodyItems,
      "體修後段",
      ProfessionType.Body,
      []
    );

    const mageBaseline = calculatePlayerStats(
      FORM_PROFILES[MajorRealm.Fusion][ProfessionType.Mage],
      MajorRealm.Fusion,
      PROFESSION_ROOTS[ProfessionType.Mage],
      mageItems,
      "法修基準",
      ProfessionType.None,
      []
    );
    const tunedMage = calculatePlayerStats(
      FORM_PROFILES[MajorRealm.Fusion][ProfessionType.Mage],
      MajorRealm.Fusion,
      PROFESSION_ROOTS[ProfessionType.Mage],
      mageItems,
      "法修後段",
      ProfessionType.Mage,
      []
    );

    expect(tunedBody.attack).toBeGreaterThan(bodyBaseline.attack);
    expect(tunedMage.maxHp).toBeGreaterThan(mageBaseline.maxHp);
    expect(tunedMage.res).toBeGreaterThan(mageBaseline.res);
  });

  it("keeps same-realm late bosses beatable while preserving sword < mage < body kill order", () => {
    const sameRealmCases: BossCase[] = [
      { realm: MajorRealm.Fusion, boss: BOSS_ENEMIES.m141_b1 },
      { realm: MajorRealm.Immortal, boss: BOSS_ENEMIES.m171_b1 },
      { realm: MajorRealm.ImmortalEmperor, boss: BOSS_ENEMIES.m180_b1 },
    ];

    sameRealmCases.forEach(({ realm, boss }) => {
      const sword = runAutoBattle(
        createBuildReadyPlayer(realm, ProfessionType.Sword),
        boss
      );
      const body = runAutoBattle(
        createBuildReadyPlayer(realm, ProfessionType.Body),
        boss
      );
      const mage = runAutoBattle(
        createBuildReadyPlayer(realm, ProfessionType.Mage),
        boss
      );

      expect(sword.won, `${MajorRealmCN[realm]} 劍修應能通過同境界 Boss`).toBe(true);
      expect(body.won, `${MajorRealmCN[realm]} 體修應能通過同境界 Boss`).toBe(true);
      expect(mage.won, `${MajorRealmCN[realm]} 法修應能通過同境界 Boss`).toBe(true);

      const swordTime = getResultTimeMs(sword);
      const bodyTime = getResultTimeMs(body);
      const mageTime = getResultTimeMs(mage);

      expect(swordTime).toBeLessThanOrEqual(mageTime);
      expect(mageTime).toBeLessThanOrEqual(bodyTime);
    });
  });

  it("keeps next-realm late bosses from becoming stable clears for every profession", () => {
    const nextRealmCases: BossCase[] = [
      { realm: MajorRealm.Fusion, boss: BOSS_ENEMIES.m151_b1 },
      { realm: MajorRealm.Immortal, boss: BOSS_ENEMIES.m180_b1 },
    ];

    nextRealmCases.forEach(({ realm, boss: nextBoss }) => {
      const wins = [
        runAutoBattle(createBuildReadyPlayer(realm, ProfessionType.Sword), nextBoss).won,
        runAutoBattle(createBuildReadyPlayer(realm, ProfessionType.Body), nextBoss).won,
        runAutoBattle(createBuildReadyPlayer(realm, ProfessionType.Mage), nextBoss).won,
      ];

      expect(
        wins.filter(Boolean).length,
        `${MajorRealmCN[realm]} build-ready 不應對高一境界 Boss 形成全職業穩定通關`
      ).toBeLessThan(3);
    });
  });

  it("keeps emperor pressure-route elites beatable while still surfacing their special cadence", () => {
    const emperorPressureElites = [
      ELITE_ENEMIES.m182_e1,
      ELITE_ENEMIES.m182_e2,
    ];

    emperorPressureElites.forEach((enemy) => {
      const sword = runAutoBattle(
        createBuildReadyPlayer(MajorRealm.ImmortalEmperor, ProfessionType.Sword),
        enemy
      );
      const body = runAutoBattle(
        createBuildReadyPlayer(MajorRealm.ImmortalEmperor, ProfessionType.Body),
        enemy
      );
      const mage = runAutoBattle(
        createBuildReadyPlayer(MajorRealm.ImmortalEmperor, ProfessionType.Mage),
        enemy
      );

      expect(sword.won).toBe(true);
      expect(body.won).toBe(true);
      expect(mage.won).toBe(true);

      expect(
        body.logs.some((log) => log.message.includes(enemy.specialAttack?.name ?? "")),
        `${enemy.id} 應能對體修打出至少一次專屬特招，避免壓力支線只剩站樁清怪`
      ).toBe(true);
      expect(
        mage.logs.some((log) => log.message.includes(enemy.specialAttack?.name ?? "")),
        `${enemy.id} 應能對法修打出至少一次專屬特招，確保支線仍有節奏辨識`
      ).toBe(true);
    });
  });
});
