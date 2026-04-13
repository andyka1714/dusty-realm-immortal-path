import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Gender,
  EquipmentStats,
  ItemQuality,
  MajorRealm,
  ProfessionType,
  SpiritRootId,
  ElementType,
} from "../types";
import {
  calculatePlayerStats,
  getResolvedEnemySpecialCooldownSeconds,
  getResolvedSkillCooldownSeconds,
  getEnemySpecialTimelineProfile,
  getSkillTimelineProfile,
  resolveEnemyWorldStrike,
  resolvePlayerWorldStrike,
  runAutoBattle,
} from "./battleSystem";
import { COMMON_ENEMIES } from "../data/enemies/common";
import { BOSS_ENEMIES } from "../data/enemies/boss";
import { ITEMS } from "../data/items";
import { getSkill } from "../data/skills";

let fixedRandom: ReturnType<typeof vi.spyOn>;

const QUALITY_MULTIPLIERS: Record<ItemQuality, number> = {
  [ItemQuality.Low]: 1.0,
  [ItemQuality.Medium]: 1.2,
  [ItemQuality.High]: 1.4,
  [ItemQuality.Immortal]: 1.7,
};

const buildEquipmentStats = (
  itemIds: string[],
  qualityByItem: Partial<Record<string, ItemQuality>> = {}
): EquipmentStats => {
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

    const quality = qualityByItem[itemId] ?? item.quality;
    const multiplier = QUALITY_MULTIPLIERS[quality];

    Object.entries(item.stats).forEach(([key, value]) => {
      const statKey = key as keyof EquipmentStats;
      stats[statKey] = (stats[statKey] || 0) + Math.ceil(value * multiplier);
    });

    if (quality >= ItemQuality.High) {
      if (stats.attack && item.stats.attack) stats.attack += 1;
      if (stats.defense && item.stats.defense) stats.defense += 1;
    }
  });

  return stats;
};

const QI_SWORD_SET = [
  "spirit_iron_sword",
  "sword_tassel",
  "focus_headband",
  "azure_robe",
  "light_boots",
  "whetstone_ring",
];

const QI_BODY_SET = [
  "bear_paw_gauntlet",
  "heavy_iron_shield",
  "wolf_skull_helm",
  "boar_skin_armor",
  "battle_boots",
  "vitality_beads",
];

const QI_MAGE_SET = [
  "spirit_wood_staff",
  "spirit_orb",
  "mystic_crown",
  "taoist_vestment",
  "cloud_step_shoes",
  "elemental_ring",
];

const FOUNDATION_SWORD_SET = [
  "flow_light_sword",
  "sword_scabbard",
  "clear_sky_crown",
  "flowing_cloud_robe",
  "wind_chasing_boots",
  "sword_heart_pendant",
];

const FOUNDATION_BODY_SET = [
  "tiger_king_gauntlet",
  "scale_shield",
  "bloody_helm",
  "heavy_plate_armor",
  "rock_stomper_boots",
  "vitality_ring",
];

const FOUNDATION_MAGE_SET = [
  "jade_bamboo_staff",
  "elemental_fan",
  "mage_hood",
  "mystic_robe",
  "spirit_step_shoes",
  "focus_pendant",
];

const SPIRIT_SEVERING_SWORD_SET = [
  "celestial_slayer_sword",
  "heavenly_mirror_shield",
  "violet_gold_crown",
  "immortal_crane_robe",
  "wind_thunder_boots",
  "soul_binding_ring",
];

const SPIRIT_SEVERING_BODY_SET = [
  "tyrant_fist",
  "divine_tortoise_shell",
  "heaven_shaking_helm",
  "indestructible_body_armor",
  "mountain_moving_boots",
  "blood_origin_stone",
];

const SPIRIT_SEVERING_MAGE_SET = [
  "five_elements_divine_staff",
  "yin_yang_orb",
  "spirit_conception_crown",
  "starry_sky_robe",
  "cloud_crossing_boots",
  "mystic_method_ring",
];

const withBossReadyQuality = (
  itemIds: string[],
  upgradedIds: string[]
): Partial<Record<string, ItemQuality>> =>
  Object.fromEntries(
    itemIds.map((itemId) => [
      itemId,
      upgradedIds.includes(itemId) ? ItemQuality.High : ItemQuality.Medium,
    ])
  );

beforeEach(() => {
  fixedRandom = vi.spyOn(Math, "random");
});

afterEach(() => {
  fixedRandom.mockRestore();
});

describe("battle system balance", () => {
  it("shares the same timeline profile metadata for formal skills used by world and auto battle", () => {
    const profile = getSkillTimelineProfile(getSkill("m_tr_active"));

    expect(profile.cooldownSeconds).toBeGreaterThan(0);
    expect(profile.cooldownMs).toBe(profile.cooldownSeconds * 1000);
    expect(profile.executionTimeMs).toBeGreaterThan(0);
    expect(profile.areaShape).toBe("circle");
    expect(profile.maxTargets).toBeGreaterThan(1);
    expect(profile.areaDamageModifier).toBeGreaterThan(0);
  });

  it("shares enemy special timeline metadata between world strikes and timeline combat", () => {
    const profile = getEnemySpecialTimelineProfile(BOSS_ENEMIES.m180_b1);

    expect(profile.cooldownSeconds).toBeGreaterThan(0);
    expect(profile.cooldownMs).toBe(profile.cooldownSeconds * 1000);
    expect(profile.executionTimeMs).toBeGreaterThan(0);
    expect(profile.areaShape).toBeDefined();
    expect(profile.areaDamageModifier).toBeGreaterThan(0);
  });

  it("resolves mage cooldown reduction through the shared skill cooldown helper", () => {
    const skill = getSkill("m_sf_active");

    expect(getResolvedSkillCooldownSeconds(skill, [])).toBe(
      skill?.cooldownSeconds ?? skill?.cooldown ?? 0
    );
    expect(getResolvedSkillCooldownSeconds(skill, ["m_sf_passive"])).toBe(
      Math.max(1, (skill?.cooldownSeconds ?? skill?.cooldown ?? 0) - 1)
    );
  });

  it("resolves enemy special cooldown through the shared special cooldown helper", () => {
    const enemy = BOSS_ENEMIES.m180_b1;
    const profile = getEnemySpecialTimelineProfile(enemy);

    expect(getResolvedEnemySpecialCooldownSeconds(enemy)).toBe(
      profile.cooldownSeconds
    );
  });

  it("uses explicit sword passive stat bonuses instead of profession-tier fallback", () => {
    const baseline = calculatePlayerStats(
      {
        physique: 20,
        rootBone: 30,
        insight: 24,
        comprehension: 18,
        fortune: 12,
        charm: 8,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_METAL_EARTH,
      {},
      "劍修",
      ProfessionType.Sword,
      []
    );

    const withSwordPassive = calculatePlayerStats(
      {
        physique: 20,
        rootBone: 30,
        insight: 24,
        comprehension: 18,
        fortune: 12,
        charm: 8,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_METAL_EARTH,
      {},
      "劍修",
      ProfessionType.Sword,
      ["s_g_passive"]
    );

    expect(withSwordPassive.attack).toBeGreaterThan(baseline.attack);
    expect(withSwordPassive.crit).toBeGreaterThan(baseline.crit);
    expect(withSwordPassive.critDamage).toBeGreaterThan(baseline.critDamage);
  });

  it("applies explicit body passive stat bonuses through absorbed retired aliases", () => {
    const corePassive = calculatePlayerStats(
      {
        physique: 36,
        rootBone: 24,
        insight: 16,
        comprehension: 12,
        fortune: 10,
        charm: 8,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {},
      "體修",
      ProfessionType.Body,
      ["b_sf_passive"]
    );

    const retiredAliasPassive = calculatePlayerStats(
      {
        physique: 36,
        rootBone: 24,
        insight: 16,
        comprehension: 12,
        fortune: 10,
        charm: 8,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {},
      "體修",
      ProfessionType.Body,
      ["b_ie_passive"]
    );

    expect(retiredAliasPassive.maxHp).toBe(corePassive.maxHp);
    expect(retiredAliasPassive.defense).toBe(corePassive.defense);
    expect(retiredAliasPassive.damageReduction).toBe(corePassive.damageReduction);
    expect(retiredAliasPassive.regenHp).toBe(corePassive.regenHp);
  });

  it("applies explicit mage passive stat bonuses through formal-core inheritance", () => {
    const baseline = calculatePlayerStats(
      {
        physique: 18,
        rootBone: 18,
        insight: 34,
        comprehension: 22,
        fortune: 14,
        charm: 8,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_WATER_WOOD,
      {},
      "法修",
      ProfessionType.Mage,
      []
    );

    const withMagePassive = calculatePlayerStats(
      {
        physique: 18,
        rootBone: 18,
        insight: 34,
        comprehension: 22,
        fortune: 14,
        charm: 8,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_WATER_WOOD,
      {},
      "法修",
      ProfessionType.Mage,
      ["m_ie_passive"]
    );

    expect(withMagePassive.magic).toBeGreaterThan(baseline.magic);
    expect(withMagePassive.maxMp).toBeGreaterThan(baseline.maxMp);
    expect(withMagePassive.res).toBeGreaterThan(baseline.res);
    expect(withMagePassive.critDamage).toBeGreaterThan(baseline.critDamage);
  });

  it("keeps formal skill world-strike statuses on the same shared split logic as timeline combat", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 120,
        rootBone: 140,
        insight: 120,
        comprehension: 80,
        fortune: 40,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_METAL_EARTH,
      buildEquipmentStats(SPIRIT_SEVERING_SWORD_SET),
      "劍修",
      ProfessionType.Sword,
      ["s_tr_active"]
    );

    const strike = resolvePlayerWorldStrike(
      sword,
      BOSS_ENEMIES.m180_b1,
      getSkill("s_tr_active")
    );

    expect(strike.enemyStatusNames).toContain("誅仙劍陣");
    expect(strike.enemyStatusNames).toContain("燃燒");
    expect(strike.playerStatusNames).not.toContain("誅仙劍陣");
  });

  it("keeps enemy world-strike statuses and cooldown on the same shared special resolver", () => {
    fixedRandom.mockReturnValue(0.1);

    const player = calculatePlayerStats(
      {
        physique: 120,
        rootBone: 120,
        insight: 120,
        comprehension: 70,
        fortune: 40,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.HEAVENLY_WATER,
      buildEquipmentStats(SPIRIT_SEVERING_BODY_SET),
      "體修",
      ProfessionType.Body,
      ["b_sf_passive"]
    );

    const strike = resolveEnemyWorldStrike(BOSS_ENEMIES.m180_b1, player, true);
    const profile = getEnemySpecialTimelineProfile(BOSS_ENEMIES.m180_b1);

    expect(strike.specialCooldownMs).toBe(profile.cooldownMs);
    expect(strike.executionTimeMs).toBe(profile.executionTimeMs);
    expect(strike.statusNames.length).toBeGreaterThan(0);
  });

  it("lets a geared mortal player defeat entry common mobs", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 28,
        rootBone: 28,
        insight: 28,
        comprehension: 10,
        fortune: 10,
        charm: 10,
      },
      MajorRealm.Mortal,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 8,
        defense: 19,
        hp: 30,
        physique: 1,
        speed: 2,
      },
      "凡人道友",
      ProfessionType.None,
      []
    );

    const result = runAutoBattle(player, COMMON_ENEMIES.m1_c1);
    expect(result.won).toBe(true);
  });

  it("keeps mortal boss as a progression gate for novice gear", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 28,
        rootBone: 28,
        insight: 28,
        comprehension: 10,
        fortune: 10,
        charm: 10,
      },
      MajorRealm.Mortal,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 8,
        defense: 19,
        hp: 30,
        physique: 1,
      },
      "凡人道友",
      ProfessionType.None,
      []
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m3_b1);
    expect(result.won).toBe(false);
  });

  it("allows mage skills to participate in combat instead of only using physical attack", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 460,
        insight: 50,
        mp: 1800,
        defense: 90,
        res: 50,
        speed: 8,
        crit: 5,
      },
      "法修道友",
      ProfessionType.Mage,
      ["m_f_active", "m_f_passive"]
    );

    const result = runAutoBattle(player, COMMON_ENEMIES.m30_c1);
    expect(result.won).toBe(true);
    expect(result.logs.some((log) => log.message.includes("五行連彈"))).toBe(
      true
    );
  });

  it("lets each qi profession clear same-route common mobs with full low gear", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(QI_SWORD_SET),
      "劍修道友",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(QI_BODY_SET),
      "體修道友",
      ProfessionType.Body,
      ["b_q_active", "b_q_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      buildEquipmentStats(QI_MAGE_SET),
      "法修道友",
      ProfessionType.Mage,
      ["m_q_active", "m_q_passive"]
    );

    expect(runAutoBattle(sword, COMMON_ENEMIES.m7_c2).won).toBe(true);
    expect(runAutoBattle(body, COMMON_ENEMIES.m16_c2).won).toBe(true);
    expect(runAutoBattle(mage, COMMON_ENEMIES.m26_c2).won).toBe(true);
  });

  it("applies damage-over-time statuses on the battle timeline", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 64,
        rootBone: 64,
        insight: 72,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 620,
        insight: 50,
        mp: 2600,
        defense: 120,
        res: 80,
        speed: 10,
      },
      "炎法真人",
      ProfessionType.Mage,
      ["m_sf_active", "m_sf_passive"]
    );

    const result = runAutoBattle(player, COMMON_ENEMIES.m30_c1);
    expect(result.logs.some((log) => log.message.includes("燃燒"))).toBe(true);
  });

  it("supports bleed and poison status applications on later-realm skills", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 72,
        rootBone: 72,
        insight: 68,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.NascentSoul,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 780,
        defense: 220,
        speed: 12,
        hp: 3200,
      },
      "劍尊",
      ProfessionType.Sword,
      ["s_n_active", "s_n_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 82,
        rootBone: 76,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.VoidRefining,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 820,
        defense: 260,
        speed: 10,
        hp: 4200,
      },
      "戰狂",
      ProfessionType.Body,
      ["b_vr_active", "b_vr_passive"]
    );

    const swordResult = runAutoBattle(sword, COMMON_ENEMIES.m30_c1);
    const bodyResult = runAutoBattle(body, COMMON_ENEMIES.m30_c1);

    expect(swordResult.logs.some((log) => log.message.includes("流血"))).toBe(true);
    expect(bodyResult.logs.some((log) => log.message.includes("中毒"))).toBe(true);
    expect(
      swordResult.logs.some((log) => (log.enemyStatuses || []).includes("流血"))
    ).toBe(true);
    expect(
      bodyResult.logs.some((log) => (log.enemyStatuses || []).includes("中毒"))
    ).toBe(true);
  });

  it("shares enemy tyrant-control resistance between world strikes and timeline combat", () => {
    fixedRandom.mockReturnValue(0.1);

    const mage = calculatePlayerStats(
      {
        physique: 28,
        rootBone: 26,
        insight: 38,
        comprehension: 22,
        fortune: 14,
        charm: 8,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_WATER_WOOD,
      {},
      "寒域法修",
      ProfessionType.Mage,
      ["m_g_active"]
    );

    const tyrantEnemy = {
      ...COMMON_ENEMIES.m52_c1,
      hp: 2200,
      maxHp: 2200,
      affixes: ["霸體"],
    };

    const strike = resolvePlayerWorldStrike(mage, tyrantEnemy, getSkill("m_g_active"));
    const timeline = runAutoBattle(mage, tyrantEnemy);

    expect(strike.enemyStatusNames).not.toContain("凍結");
    expect(
      timeline.logs.some((log) => (log.enemyStatuses || []).includes("凍結"))
    ).toBe(false);
  });

  it("lets non-damaging active skills grant protection instead of sneaking in a normal hit", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 58,
        rootBone: 58,
        insight: 50,
        comprehension: 18,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.MIXED_FIVE,
      {
        defense: 220,
        hp: 1800,
        speed: 8,
        attack: 260,
      },
      "鐵骨真人",
      ProfessionType.Body,
      ["b_g_active", "b_g_passive"]
    );

    const result = runAutoBattle(player, COMMON_ENEMIES.m16_c2);
    expect(result.logs.some((log) => log.message.includes("獲得了【護盾】"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("靈力在戰場上激盪開來"))).toBe(true);
  });

  it("applies specialized passive effects beyond generic stat bonuses", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 58,
        rootBone: 58,
        insight: 70,
        comprehension: 22,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 520,
        mp: 2200,
        hp: 1800,
        defense: 120,
        speed: 8,
      },
      "玄水真人",
      ProfessionType.Mage,
      ["m_g_passive", "m_sf_passive", "m_f_active"]
    );

    const result = runAutoBattle(mage, COMMON_ENEMIES.m30_c1);
    expect(result.logs.some((log) => log.message.includes("元素護盾"))).toBe(true);
    expect(
      result.logs.some((log) => (log.playerStatuses || []).includes("元素護盾"))
    ).toBe(true);
  });

  it("lets golden-core body passive only reflect melee hits", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 58,
        rootBone: 58,
        insight: 52,
        comprehension: 18,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.HEAVENLY_EARTH,
      {
        attack: 320,
        defense: 260,
        hp: 2600,
        speed: 7,
      },
      "戰體真人",
      ProfessionType.Body,
      ["b_g_passive"]
    );

    const meleeResult = runAutoBattle(body, COMMON_ENEMIES.m16_c2);
    const rangedResult = runAutoBattle(body, BOSS_ENEMIES.m180_b1);

    expect(
      meleeResult.logs.some((log) => log.message.includes("荊棘皮層"))
    ).toBe(true);
    expect(
      meleeResult.logs.some((log) => log.message.includes("覆上體表"))
    ).toBe(true);
    expect(
      rangedResult.logs.some((log) => log.message.includes("反震回敬"))
    ).toBe(false);
  });

  it("lets golden-core mage passive block one incoming special attack completely", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 58,
        rootBone: 58,
        insight: 70,
        comprehension: 22,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 520,
        mp: 2200,
        hp: 1800,
        defense: 120,
        speed: 8,
      },
      "玄水真人",
      ProfessionType.Mage,
      ["m_g_passive"]
    );

    const result = runAutoBattle(mage, BOSS_ENEMIES.m180_b1);

    expect(
      result.logs.some((log) => log.message.includes("完整化去了一次術式傷害"))
    ).toBe(true);
  });

  it("lets spirit-severing mage passive emit an explicit cooldown-reduction battle log", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 70,
        rootBone: 70,
        insight: 82,
        comprehension: 24,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 900,
        mp: 2600,
        hp: 2400,
        defense: 140,
        speed: 8,
      },
      "道法法修",
      ProfessionType.Mage,
      ["m_sf_active", "m_sf_passive"]
    );

    const result = runAutoBattle(mage, COMMON_ENEMIES.m30_c1);

    expect(
      result.logs.some((log) => log.message.includes("【道法自然】"))
    ).toBe(true);
  });

  it("keeps foundation mage passive out of the shared cooldown reduction helper", () => {
    const skill = getSkill("m_f_active");

    expect(getResolvedSkillCooldownSeconds(skill, ["m_f_passive"])).toBe(
      skill?.cooldownSeconds ?? skill?.cooldown ?? 0
    );
    expect(getResolvedSkillCooldownSeconds(skill, ["m_sf_passive"])).toBe(
      Math.max(1, (skill?.cooldownSeconds ?? skill?.cooldown ?? 0) - 1)
    );
  });

  it("lets qi sword passive apply an explicit armor-break follow-up on critical strikes", () => {
    fixedRandom.mockReturnValue(0);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 48,
        insight: 45,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 150,
        crit: 45,
      },
      "劍脈弟子",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const strike = resolvePlayerWorldStrike(
      sword,
      COMMON_ENEMIES.m7_c2,
      getSkill("s_q_active")
    );

    expect(strike.isCrit).toBe(true);
    expect(strike.enemyStatusNames).toContain("劍脈破甲");
  });

  it("shares qi sword armor-break follow-up between world strikes and timeline combat", () => {
    fixedRandom.mockReturnValue(0);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 48,
        insight: 45,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 150,
        crit: 45,
      },
      "劍脈弟子",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const timeline = runAutoBattle(sword, COMMON_ENEMIES.m7_c2);

    expect(
      timeline.logs.some((log) => (log.enemyStatuses || []).includes("劍脈破甲"))
    ).toBe(true);
  });

  it("lets qi body passive explicitly reduce incoming strike damage", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseBody = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.MIXED_FIVE,
      {
        defense: 140,
        hp: 1200,
      },
      "鐵骨基準",
      ProfessionType.Body,
      []
    );

    const copperBody = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.MIXED_FIVE,
      {
        defense: 140,
        hp: 1200,
      },
      "銅皮修士",
      ProfessionType.Body,
      ["b_q_passive"]
    );

    const baseStrike = resolveEnemyWorldStrike(COMMON_ENEMIES.m16_c2, baseBody);
    const copperStrike = resolveEnemyWorldStrike(
      COMMON_ENEMIES.m16_c2,
      copperBody
    );

    expect(copperStrike.damage).toBeLessThan(baseStrike.damage);
  });

  it("lets qi mage passive restore mana through explicit battle events", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 52,
        comprehension: 18,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 220,
        mp: 1200,
        defense: 90,
      },
      "靈潮術士",
      ProfessionType.Mage,
      ["m_q_active", "m_q_passive"]
    );

    const result = runAutoBattle(mage, COMMON_ENEMIES.m26_c2);

    expect(
      result.logs.some((log) => log.message.includes("【靈潮循環】"))
    ).toBe(true);
  });

  it("surfaces qi mage passive on basic world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 52,
        comprehension: 18,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 220,
        mp: 1200,
        defense: 90,
      },
      "靈潮術士",
      ProfessionType.Mage,
      ["m_q_passive"]
    );

    const strike = resolvePlayerWorldStrike(mage, COMMON_ENEMIES.m26_c2);

    expect(strike.playerStatusNames).toContain("靈潮循環");
  });

  it("surfaces nascent mage passive on high-mana world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 72,
        rootBone: 68,
        insight: 84,
        comprehension: 26,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.NascentSoul,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1200,
        mp: 2800,
        defense: 180,
      },
      "法力源泉",
      ProfessionType.Mage,
      ["m_n_passive"]
    );

    const strike = resolvePlayerWorldStrike(mage, COMMON_ENEMIES.m90_c1);

    expect(strike.playerStatusNames).toContain("法力源泉");
  });

  it("lets foundation body passive scale offense with missing hp in world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const healthyBody = calculatePlayerStats(
      {
        physique: 58,
        rootBone: 58,
        insight: 48,
        comprehension: 18,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.HEAVENLY_EARTH,
      {
        attack: 180,
        defense: 180,
        hp: 2200,
        speed: 6,
      },
      "蠻體修士",
      ProfessionType.Body,
      ["b_f_active", "b_f_passive"]
    );

    const woundedBody = {
      ...healthyBody,
      hp: Math.floor(healthyBody.maxHp * 0.35),
    };

    const healthyStrike = resolvePlayerWorldStrike(
      healthyBody,
      COMMON_ENEMIES.m21_c1,
      getSkill("b_f_active")
    );
    const woundedStrike = resolvePlayerWorldStrike(
      woundedBody,
      COMMON_ENEMIES.m21_c1,
      getSkill("b_f_active")
    );

    expect(woundedStrike.damage).toBeGreaterThan(healthyStrike.damage);
    expect(woundedStrike.playerStatusNames).toContain("蠻荒血脈");
  });

  it("surfaces sword passive procs on world strikes", () => {
    fixedRandom.mockReset();
    fixedRandom.mockReturnValueOnce(0.05).mockReturnValueOnce(0);

    const sword = calculatePlayerStats(
      {
        physique: 150,
        rootBone: 170,
        insight: 120,
        comprehension: 80,
        fortune: 40,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(SPIRIT_SEVERING_SWORD_SET),
      "劍勢共鳴",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive", "s_vr_passive"]
    );

    const strike = resolvePlayerWorldStrike(
      sword,
      BOSS_ENEMIES.m180_b1,
      getSkill("s_q_active")
    );

    expect(strike.playerStatusNames).toContain("法則之劍");
    expect(strike.playerStatusNames).toContain("劍脈初成");
  });

  it("lets nascent soul sword passive prevent a fatal hit once and reflect it", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 72,
        rootBone: 72,
        insight: 68,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.NascentSoul,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 720,
        defense: 180,
        speed: 12,
        hp: 820,
        mp: 1200,
      },
      "劍尊",
      ProfessionType.Sword,
      ["s_n_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m151_b1);
    expect(result.logs.some((log) => log.message.includes("護體劍罡"))).toBe(true);
  });

  it("lets spirit severing sword passive trigger a second basic strike", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 70,
        rootBone: 70,
        insight: 64,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 760,
        defense: 210,
        speed: 12,
        hp: 2800,
      },
      "劍君",
      ProfessionType.Sword,
      ["s_sf_passive"]
    );

    const result = runAutoBattle(player, COMMON_ENEMIES.m30_c1);
    expect(result.logs.some((log) => log.message.includes("劍意化形"))).toBe(true);
  });

  it("surfaces spirit severing sword passive on basic world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 70,
        rootBone: 70,
        insight: 64,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 760,
        defense: 210,
        speed: 12,
        hp: 2800,
      },
      "劍君",
      ProfessionType.Sword,
      ["s_sf_passive"]
    );

    const strike = resolvePlayerWorldStrike(sword, COMMON_ENEMIES.m30_c1);

    expect(strike.playerStatusNames).toContain("劍意化形");
  });

  it("lets nascent soul body passive heal based on missing hp each tick", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 82,
        rootBone: 76,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.NascentSoul,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 680,
        defense: 240,
        speed: 9,
        hp: 4200,
      },
      "戰狂",
      ProfessionType.Body,
      ["b_n_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m7_b1);
    expect(result.logs.some((log) => log.message.includes("【滴血重生】"))).toBe(true);
  });

  it("lets spirit severing body passive halve oversized hits", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 82,
        rootBone: 76,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 720,
        defense: 240,
        speed: 9,
        hp: 1200,
      },
      "武聖",
      ProfessionType.Body,
      ["b_sf_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m151_b1);
    expect(result.logs.some((log) => log.message.includes("肉身成聖"))).toBe(true);
  });

  it("lets nascent soul mage passive regenerate mana and boost high-mp damage", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 72,
        rootBone: 68,
        insight: 84,
        comprehension: 26,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.NascentSoul,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 820,
        mp: 3200,
        hp: 2400,
        defense: 150,
        speed: 11,
      },
      "法君",
      ProfessionType.Mage,
      ["m_n_active", "m_n_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m26_b1);
    expect(result.logs.some((log) => log.message.includes("【法力源泉】"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("九天雷劫"))).toBe(true);
  });

  it("lets void-refining mage passive redirect some hits into the void", () => {
    fixedRandom.mockReturnValue(0.2);

    const player = calculatePlayerStats(
      {
        physique: 76,
        rootBone: 70,
        insight: 84,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.VoidRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 860,
        mp: 2800,
        hp: 2600,
        defense: 160,
        speed: 12,
      },
      "虛空法君",
      ProfessionType.Mage,
      ["m_vr_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m102_b1);
    expect(result.logs.some((log) => log.message.includes("空間法則"))).toBe(true);
  });

  it("lets spirit severing body passive reduce enemy world strikes and surface status name", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 82,
        rootBone: 76,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 720,
        defense: 240,
        speed: 9,
        hp: 1200,
      },
      "武聖",
      ProfessionType.Body,
      ["b_sf_passive"]
    );

    const baseBody = calculatePlayerStats(
      {
        physique: 82,
        rootBone: 76,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 720,
        defense: 240,
        speed: 9,
        hp: 3600,
      },
      "基準武聖",
      ProfessionType.Body,
      []
    );

    const enemy = {
      ...BOSS_ENEMIES.m151_b1,
      attack: 50000,
    };

    const baseStrike = resolveEnemyWorldStrike(enemy, baseBody);
    const passiveStrike = resolveEnemyWorldStrike(enemy, body);

    expect(passiveStrike.damage).toBeLessThan(baseStrike.damage);
    expect(passiveStrike.statusNames).toContain("肉身成聖");
  });

  it("lets void-refining mage passive affect enemy world strikes and surface status name", () => {
    fixedRandom.mockReturnValue(0.2);

    const mage = calculatePlayerStats(
      {
        physique: 76,
        rootBone: 70,
        insight: 84,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.VoidRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 860,
        mp: 2800,
        hp: 2600,
        defense: 160,
        speed: 12,
      },
      "虛空法君",
      ProfessionType.Mage,
      ["m_vr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m102_b1,
      attack: 900,
    };

    const strike = resolveEnemyWorldStrike(enemy, mage);

    expect(strike.damage).toBe(0);
    expect(strike.statusNames).toContain("空間法則");
  });

  it("lets fusion sword passive shorten incoming control effects", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 84,
        rootBone: 92,
        insight: 70,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1400,
        defense: 320,
        hp: 7200,
      },
      "人劍合神",
      ProfessionType.Sword,
      ["s_bi_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m161_b1,
      specialAttack: {
        name: "雷縛天刑",
        cooldownSeconds: 1,
        damageMultiplier: 1.1,
        statusEffect: { id: "paralyze", duration: 2, chance: 1 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const result = runAutoBattle(sword, enemy);
    expect(result.logs.some((log) => log.message.includes("人劍合神"))).toBe(true);
  });

  it("lets fusion body passive reduce all final damage", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseBody = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 80,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1200,
        defense: 340,
        hp: 11000,
      },
      "法相基準",
      ProfessionType.Body,
      []
    );

    const fusionBody = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 80,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1200,
        defense: 340,
        hp: 11000,
      },
      "金剛法相",
      ProfessionType.Body,
      ["b_bi_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m170_b1,
      attack: 760,
      defense: 240,
      hp: 26000,
      maxHp: 26000,
    };

    const baseResult = runAutoBattle(baseBody, enemy);
    const passiveResult = runAutoBattle(fusionBody, enemy);

    const baseFinalHp =
      baseResult.logs[baseResult.logs.length - 1]?.playerHp ?? baseBody.maxHp;
    const passiveFinalHp =
      passiveResult.logs[passiveResult.logs.length - 1]?.playerHp ??
      fusionBody.maxHp;
    expect(passiveFinalHp).toBeGreaterThan(baseFinalHp);
  });

  it("surfaces incoming body defensive passives on enemy world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 82,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1200,
        defense: 340,
        hp: 11000,
      },
      "法相戰軀",
      ProfessionType.Body,
      ["b_f_passive", "b_q_passive", "b_bi_passive"]
    );

    const woundedBody = { ...body, hp: Math.floor(body.maxHp * 0.52) };
    const enemy = {
      ...BOSS_ENEMIES.m170_b1,
      attack: 760,
      specialAttack: undefined,
    };

    const strike = resolveEnemyWorldStrike(enemy, woundedBody);

    expect(strike.statusNames).toContain("蠻荒血脈");
    expect(strike.statusNames).toContain("銅皮鐵骨");
    expect(strike.statusNames).toContain("金剛法相");
  });

  it("surfaces elemental barrier on enemy special world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 72,
        rootBone: 62,
        insight: 88,
        comprehension: 24,
        fortune: 15,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 860,
        mp: 2600,
        hp: 2600,
        defense: 150,
        speed: 12,
      },
      "青木真修",
      ProfessionType.Mage,
      ["m_g_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m102_b1,
      attack: 900,
      specialAttack: {
        name: "玄雷貫體",
        cooldownSeconds: 4,
        damageMultiplier: 1.2,
        statusEffect: { id: "paralyze", duration: 2, chance: 1 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const strike = resolveEnemyWorldStrike(enemy, mage, true);

    expect(strike.damage).toBe(0);
    expect(strike.statusNames).toContain("元素護盾");
  });

  it("surfaces body-immortal dot immunity on enemy special world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const enemy = BOSS_ENEMIES.m112_b1;
    const body = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 78,
        insight: 62,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.MIXED_FIVE,
      {
        hp: 4200,
        defense: 320,
        regenHp: 6,
        attack: 480,
      },
      "仙體無垢",
      ProfessionType.Body,
      ["b_im_passive"]
    );

    const strike = resolveEnemyWorldStrike(enemy, body, true);
    expect(strike.statusNames).toContain("仙體無垢");
    expect(strike.statusNames).not.toContain("燃燒");
  });

  it("surfaces reflect stance on enemy melee world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 82,
        rootBone: 74,
        insight: 58,
        comprehension: 20,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.MIXED_FIVE,
      {
        defense: 280,
        hp: 7600,
      },
      "荊棘戰軀",
      ProfessionType.Body,
      ["b_g_passive"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m120_c1,
      attackRange: 1,
      attack: 540,
    };

    const strike = resolveEnemyWorldStrike(enemy, body);

    expect(strike.statusNames).toContain("反震");
  });

  it("surfaces tribulation body passive on enemy world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 100,
        rootBone: 88,
        insight: 66,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.MIXED_FIVE,
      {
        defense: 420,
        hp: 14000,
      },
      "萬劫戰軀",
      ProfessionType.Body,
      ["b_tr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m181_b1,
      attack: 920,
    };

    const strike = resolveEnemyWorldStrike(enemy, body);

    expect(strike.statusNames).toContain("萬劫不滅");
  });

  it("surfaces tribulation mage passive on metal enemy world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 94,
        rootBone: 82,
        insight: 102,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        hp: 7600,
        mp: 4200,
        defense: 260,
      },
      "劫雷法尊",
      ProfessionType.Mage,
      ["m_tr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      element: ElementType.Metal,
      attack: 860,
    };

    const strike = resolveEnemyWorldStrike(enemy, mage);

    expect(strike.statusNames).toContain("雷劫煉心");
  });

  it("surfaces tribulation mage control immunity on enemy special world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 94,
        rootBone: 82,
        insight: 102,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        hp: 7600,
        mp: 4200,
        defense: 260,
      },
      "劫雷法尊",
      ProfessionType.Mage,
      ["m_tr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      specialAttack: {
        name: "震魂雷獄",
        cooldownSeconds: 2,
        damageMultiplier: 1.1,
        statusEffect: { id: "paralyze", duration: 2, chance: 1 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const strike = resolveEnemyWorldStrike(enemy, mage, true);

    expect(strike.statusNames).toContain("雷劫煉心");
    expect(strike.statusNames).not.toContain("麻痺");
  });

  it("does not collapse retired fusion sword passive into emperor immunity flags", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 84,
        rootBone: 92,
        insight: 70,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1400,
        defense: 320,
        hp: 7200,
      },
      "人劍合神",
      ProfessionType.Sword,
      ["s_bi_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m161_b1,
      specialAttack: {
        name: "雷縛天刑",
        cooldownSeconds: 1,
        damageMultiplier: 1.1,
        statusEffect: { id: "paralyze", duration: 2, chance: 1 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const strike = resolveEnemyWorldStrike(enemy, sword, true);

    expect(strike.statusNames).toContain("人劍合神");
    expect(strike.statusNames).not.toContain("萬法皆空");
  });

  it("logs reflect stance gain when body tribulation active applies battle reflect", () => {
    const body = calculatePlayerStats(
      {
        physique: 88,
        rootBone: 80,
        insight: 62,
        comprehension: 24,
        fortune: 12,
        charm: 8,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1480,
        defense: 420,
        hp: 8800,
      },
      "硬抗天劫",
      ProfessionType.Body,
      ["b_tr_active"]
    );

    const result = runAutoBattle(body, COMMON_ENEMIES.m16_c2);

    expect(result.logs.some((log) => log.message.includes("你獲得了【反震】"))).toBe(true);
  });

  it("surfaces sword death-ward passive on lethal enemy world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 78,
        rootBone: 80,
        insight: 74,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.NascentSoul,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 760,
        defense: 200,
        hp: 2600,
        mp: 1200,
      },
      "劍罡真君",
      ProfessionType.Sword,
      ["s_n_passive"]
    );

    const woundedSword = { ...sword, hp: 300 };
    const enemy = {
      ...BOSS_ENEMIES.m151_b1,
      attack: 50000,
    };

    const strike = resolveEnemyWorldStrike(enemy, woundedSword);

    expect(strike.statusNames).toContain("護體劍罡");
  });

  it("surfaces true rebirth passive on lethal enemy world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 80,
        insight: 66,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 880,
        defense: 280,
        hp: 1500,
      },
      "真武聖者",
      ProfessionType.Body,
      ["b_ma_passive"]
    );

    const woundedBody = { ...body, hp: 200 };
    const enemy = {
      ...BOSS_ENEMIES.m161_b1,
      attack: 50000,
    };

    const strike = resolveEnemyWorldStrike(enemy, woundedBody);

    expect(strike.statusNames).toContain("滴血重生");
  });

  it("surfaces emperor body passive on lethal enemy world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 82,
        insight: 68,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 940,
        defense: 320,
        hp: 1800,
      },
      "不滅武祖",
      ProfessionType.Body,
      ["b_ie_passive"]
    );

    const woundedBody = { ...body, hp: 180 };
    const enemy = {
      ...BOSS_ENEMIES.m181_b1,
      attack: 50000,
    };

    const strike = resolveEnemyWorldStrike(enemy, woundedBody);

    expect(strike.statusNames).toContain("不死不滅");
  });

  it("surfaces sword-emperor negative-status immunity on enemy special world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const enemy = BOSS_ENEMIES.m180_b1;
    const sword = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 108,
        insight: 84,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 380,
        hp: 9200,
        crit: 15,
      },
      "萬法皆空",
      ProfessionType.Sword,
      ["s_ie_passive"]
    );

    const strike = resolveEnemyWorldStrike(enemy, sword, true);
    expect(strike.statusNames).toContain("萬法皆空");
    expect(strike.statusNames).not.toContain("破甲");
  });

  it("lets fusion mage passive cast without mana cost and regenerate hp/mp", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 86,
        rootBone: 78,
        insight: 92,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1400,
        mp: 0,
        hp: 7000,
        defense: 220,
        res: 200,
      },
      "五氣朝元",
      ProfessionType.Mage,
      ["m_bi_active", "m_bi_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m171_b1,
      attack: 480,
      hp: 18000,
      maxHp: 18000,
    };

    const result = runAutoBattle(mage, enemy);
    expect(result.logs.some((log) => log.message.includes("元神出竅"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("五氣朝元"))).toBe(true);
    expect(
      result.logs.some((log) =>
        log.message.includes("【五氣朝元】五氣回流護住周身")
      )
    ).toBe(true);
  });

  it("lets fusion body active provide a giant-form sustain swing", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 80,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1200,
        defense: 340,
        hp: 9000,
      },
      "法天象地",
      ProfessionType.Body,
      ["b_bi_active"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m171_b1,
      hp: 32000,
      maxHp: 32000,
    };

    const result = runAutoBattle(body, enemy);
    expect(result.logs.some((log) => log.message.includes("法天象地"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("巨靈護體"))).toBe(true);
  });

  it("lets true rebirth restore body cultivators once per battle", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 80,
        insight: 66,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 880,
        defense: 280,
        speed: 10,
        hp: 1500,
      },
      "真武聖者",
      ProfessionType.Body,
      ["b_ma_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m161_b1);
    expect(result.logs.some((log) => log.message.includes("滴血重生（真）"))).toBe(true);
  });

  it("lets body emperor passive keep the player at one hp in timeline combat", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 82,
        insight: 68,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 920,
        defense: 260,
        speed: 10,
        hp: 1400,
      },
      "不滅武皇",
      ProfessionType.Body,
      ["b_ie_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m180_b1);
    expect(result.logs.some((log) => log.message.includes("不死不滅"))).toBe(true);
    const emperorLog = result.logs.find((log) => log.message.includes("不死不滅"));
    expect(emperorLog?.playerHp).toBe(1);
  });

  it("lets immortal mage passive occasionally echo a second cast", () => {
    fixedRandom.mockReturnValue(0.2);

    const player = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 80,
        insight: 96,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1180,
        mp: 4200,
        hp: 3200,
        defense: 220,
        speed: 12,
      },
      "仙法真君",
      ProfessionType.Mage,
      ["m_tr_active", "m_im_passive"]
    );

    const result = runAutoBattle(player, BOSS_ENEMIES.m180_b1);
    expect(result.logs.some((log) => log.message.includes("仙法通神"))).toBe(true);
  });

  it("lets immortal sword passive periodically form a one-hit guard", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 94,
        rootBone: 108,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 900,
        defense: 260,
        hp: 6200,
      },
      "仙元護體",
      ProfessionType.Sword,
      ["s_im_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      attack: 820,
      hp: 42000,
      maxHp: 42000,
    };

    const result = runAutoBattle(sword, enemy);
    expect(result.logs.some((log) => log.message.includes("仙元護體"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("護盾替你抵擋了"))).toBe(true);
  });

  it("lets tribulation mage passive heal from thunder-aligned retaliation", () => {
    fixedRandom.mockReturnValue(0.5);

    const thunderMage = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 84,
        insight: 96,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1900,
        mp: 4200,
        hp: 8600,
        defense: 280,
      },
      "雷劫煉心",
      ProfessionType.Mage,
      ["m_tr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m161_b1,
      element: ElementType.Metal,
      attack: 900,
      hp: 26000,
      maxHp: 26000,
    };

    const result = runAutoBattle(thunderMage, enemy);
    expect(result.logs.some((log) => log.message.includes("雷劫煉心"))).toBe(true);
  });

  it("lets tribulation mage passive ignore incoming control in timeline combat", () => {
    fixedRandom.mockReturnValue(0.5);

    const thunderMage = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 84,
        insight: 96,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1900,
        mp: 4200,
        hp: 8600,
        defense: 280,
      },
      "雷劫煉心",
      ProfessionType.Mage,
      ["m_tr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m161_b1,
      specialAttack: {
        name: "震魂雷獄",
        cooldownSeconds: 1,
        damageMultiplier: 1.1,
        statusEffect: { id: "paralyze", duration: 2, chance: 1 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const result = runAutoBattle(thunderMage, enemy);

    expect(result.logs.some((log) => log.message.includes("【雷劫煉心】"))).toBe(true);
    expect(
      result.logs.some((log) => (log.playerStatuses || []).includes("麻痺"))
    ).toBe(false);
  });

  it("keeps same-realm qi bosses as progression gates for full low gear", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(QI_SWORD_SET),
      "劍修道友",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(QI_BODY_SET),
      "體修道友",
      ProfessionType.Body,
      ["b_q_active", "b_q_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      buildEquipmentStats(QI_MAGE_SET),
      "法修道友",
      ProfessionType.Mage,
      ["m_q_active", "m_q_passive"]
    );

    const swordResult = runAutoBattle(sword, BOSS_ENEMIES.m7_b1);
    const bodyResult = runAutoBattle(body, BOSS_ENEMIES.m16_b1);
    const mageResult = runAutoBattle(mage, BOSS_ENEMIES.m26_b1);

    expect(swordResult.won).toBe(false);
    expect(bodyResult.won).toBe(false);
    expect(mageResult.won).toBe(false);
  });

  it("lets medium gear plus a few high pieces challenge same-realm qi bosses", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(
        QI_SWORD_SET,
        withBossReadyQuality(QI_SWORD_SET, [
          "spirit_iron_sword",
          "sword_tassel",
          "focus_headband",
          "azure_robe",
          "whetstone_ring",
        ])
      ),
      "劍修道友",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(
        QI_BODY_SET,
        withBossReadyQuality(QI_BODY_SET, [
          "bear_paw_gauntlet",
          "heavy_iron_shield",
          "boar_skin_armor",
          "battle_boots",
          "vitality_beads",
        ])
      ),
      "體修道友",
      ProfessionType.Body,
      ["b_q_active", "b_q_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_WATER_WOOD,
      buildEquipmentStats(
        QI_MAGE_SET,
        withBossReadyQuality(QI_MAGE_SET, [
          "spirit_wood_staff",
          "spirit_orb",
          "mystic_crown",
          "taoist_vestment",
          "elemental_ring",
        ])
      ),
      "法修道友",
      ProfessionType.Mage,
      ["m_q_active", "m_q_passive"]
    );

    const swordResult = runAutoBattle(sword, BOSS_ENEMIES.m7_b1);
    const bodyResult = runAutoBattle(body, BOSS_ENEMIES.m16_b1);
    const mageResult = runAutoBattle(mage, BOSS_ENEMIES.m26_b1);

    expect(swordResult.won).toBe(true);
    expect(bodyResult.won).toBe(true);
    expect(mageResult.won).toBe(true);
  });

  it("produces a monotonic time axis in battle logs", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(QI_SWORD_SET),
      "劍修道友",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const result = runAutoBattle(player, COMMON_ENEMIES.m7_c2);
    const timestamps = result.logs
      .map((log) => log.timeMs ?? 0)
      .filter((time, index, arr) => index === 0 || arr[index - 1] <= time);

    expect(timestamps.length).toBe(result.logs.length);
  });

  it("lets sword cultivators act faster than body cultivators on the battle timeline", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(QI_SWORD_SET),
      "劍修道友",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(QI_BODY_SET),
      "體修道友",
      ProfessionType.Body,
      ["b_q_active", "b_q_passive"]
    );

    const swordLogs = runAutoBattle(sword, COMMON_ENEMIES.m7_c2).logs.filter(
      (log) => log.isPlayer && log.damage && log.damage > 0
    );
    const bodyLogs = runAutoBattle(body, COMMON_ENEMIES.m16_c2).logs.filter(
      (log) => log.isPlayer && log.damage && log.damage > 0
    );

    expect((swordLogs[1]?.timeMs ?? Infinity)).toBeLessThan(bodyLogs[1]?.timeMs ?? 0);
  });

  it("lets area-shape metadata formally affect combat events", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(FOUNDATION_BODY_SET),
      "體修道友",
      ProfessionType.Body,
      ["b_f_active", "b_f_passive"]
    );

    const result = runAutoBattle(body, COMMON_ENEMIES.m30_c1);

    expect(
      result.logs.some((log) => log.message.includes("範圍術式震盪四散"))
    ).toBe(true);
  });

  it("lets caster-type enemies use special attacks instead of only basic hits", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.QiRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(QI_SWORD_SET),
      "劍修道友",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive"]
    );

    const result = runAutoBattle(sword, BOSS_ENEMIES.m26_b1);

    expect(
      result.logs.some((log) => log.message.includes("靈潮龍息"))
    ).toBe(true);
  });

  it("lets later-realm bosses apply their own status-based special attacks", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 58,
        rootBone: 58,
        insight: 52,
        comprehension: 18,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.MIXED_FIVE,
      {
        hp: 2400,
        defense: 280,
        attack: 360,
        speed: 8,
      },
      "霸體真人",
      ProfessionType.Body,
      ["b_g_active", "b_g_passive"]
    );

    const result = runAutoBattle(body, BOSS_ENEMIES.m72_b1);

    expect(result.logs.some((log) => log.message.includes("萬厄毒域"))).toBe(true);
    expect(
      result.logs.some((log) => (log.playerStatuses || []).includes("中毒"))
    ).toBe(true);
  });

  it("keeps foundation bosses as progression gates for full low gear", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(FOUNDATION_SWORD_SET),
      "築基劍修",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive", "s_f_active", "s_f_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(FOUNDATION_BODY_SET),
      "築基體修",
      ProfessionType.Body,
      ["b_q_active", "b_q_passive", "b_f_active", "b_f_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_WATER_WOOD,
      buildEquipmentStats(FOUNDATION_MAGE_SET),
      "築基法修",
      ProfessionType.Mage,
      ["m_q_active", "m_q_passive", "m_f_active", "m_f_passive"]
    );

    expect(runAutoBattle(sword, BOSS_ENEMIES.m32_b1).won).toBe(false);
    expect(runAutoBattle(body, BOSS_ENEMIES.m42_b1).won).toBe(false);
    expect(runAutoBattle(mage, BOSS_ENEMIES.m52_b1).won).toBe(false);
  });

  it("lets upgraded foundation gear challenge same-realm foundation bosses", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(
        FOUNDATION_SWORD_SET,
        withBossReadyQuality(FOUNDATION_SWORD_SET, [
          "flow_light_sword",
          "sword_scabbard",
          "clear_sky_crown",
          "flowing_cloud_robe",
          "sword_heart_pendant",
        ])
      ),
      "築基劍修",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive", "s_f_active", "s_f_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(
        FOUNDATION_BODY_SET,
        withBossReadyQuality(FOUNDATION_BODY_SET, [
          "tiger_king_gauntlet",
          "scale_shield",
          "bloody_helm",
          "heavy_plate_armor",
          "vitality_ring",
        ])
      ),
      "築基體修",
      ProfessionType.Body,
      ["b_q_active", "b_q_passive", "b_f_active", "b_f_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_WATER_WOOD,
      buildEquipmentStats(
        FOUNDATION_MAGE_SET,
        withBossReadyQuality(FOUNDATION_MAGE_SET, [
          "jade_bamboo_staff",
          "elemental_fan",
          "mage_hood",
          "mystic_robe",
          "focus_pendant",
        ])
      ),
      "築基法修",
      ProfessionType.Mage,
      ["m_q_active", "m_q_passive", "m_f_active", "m_f_passive"]
    );

    expect(runAutoBattle(sword, BOSS_ENEMIES.m32_b1).won).toBe(true);
    expect(runAutoBattle(body, BOSS_ENEMIES.m42_b1).won).toBe(true);
    expect(runAutoBattle(mage, BOSS_ENEMIES.m52_b1).won).toBe(true);
  });

  it("lets formal core sword passive inherit the nurturing sword-stack effect", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseSword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        ...buildEquipmentStats(FOUNDATION_SWORD_SET),
        dodge: 100,
      },
      "築基劍修",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive", "s_f_active"]
    );

    const nurturedSword = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        ...buildEquipmentStats(FOUNDATION_SWORD_SET),
        dodge: 100,
      },
      "築基劍修",
      ProfessionType.Sword,
      ["s_q_active", "s_q_passive", "s_f_active", "s_g_passive"]
    );

    const trainingDummy = {
      ...COMMON_ENEMIES.m1_c1,
      hp: 40000,
      attack: 1,
      defense: 260,
    };

    const baseResult = runAutoBattle(baseSword, trainingDummy);
    const nurturedResult = runAutoBattle(nurturedSword, trainingDummy);

    expect(nurturedResult.logs.some((log) => log.message.includes("養劍術"))).toBe(true);
    expect(baseResult.logs.some((log) => log.message.includes("養劍術"))).toBe(false);
  });

  it("lets golden-core sword passive reset flowing-sword cooldown on crit", () => {
    fixedRandom.mockReturnValue(0);

    const sword = calculatePlayerStats(
      {
        physique: 48,
        rootBone: 52,
        insight: 52,
        comprehension: 20,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.GoldenCore,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        ...buildEquipmentStats(FOUNDATION_SWORD_SET),
        crit: 100,
      },
      "金丹劍修",
      ProfessionType.Sword,
      ["s_f_active", "s_g_passive"]
    );

    const result = runAutoBattle(sword, {
      ...COMMON_ENEMIES.m1_c1,
      hp: 8000,
      defense: 120,
    });

    expect(
      result.logs.some((log) => log.message.includes("劍心通明"))
    ).toBe(true);
  });

  it("applies enemy elemental weaknesses and resistances to player strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 220,
        magic: 220,
        defense: 90,
        hp: 600,
      },
      "測試道友",
      ProfessionType.Sword,
      ["s_q_active"]
    );

    const baseEnemy = {
      ...COMMON_ENEMIES.m30_c1,
      resistances: [],
      weaknesses: [],
    };
    const weakEnemy = {
      ...COMMON_ENEMIES.m30_c1,
      resistances: [],
      weaknesses: [ElementType.Fire],
    };
    const resistEnemy = {
      ...COMMON_ENEMIES.m30_c1,
      resistances: [ElementType.Fire],
      weaknesses: [],
    };

    const baseStrike = resolvePlayerWorldStrike(player, baseEnemy);
    const weakStrike = resolvePlayerWorldStrike(player, weakEnemy);
    const resistStrike = resolvePlayerWorldStrike(player, resistEnemy);

    expect(weakStrike.damage).toBeGreaterThan(baseStrike.damage);
    expect(resistStrike.damage).toBeLessThan(baseStrike.damage);
  });

  it("enemy affixes modify outgoing and incoming combat values", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 43,
        rootBone: 43,
        insight: 43,
        comprehension: 16,
        fortune: 12,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 260,
        defense: 120,
        hp: 900,
      },
      "詞綴測試者",
      ProfessionType.Body,
      ["b_q_active"]
    );

    const baseEnemy = {
      ...COMMON_ENEMIES.m30_c1,
      affixes: [],
      resistances: [],
      weaknesses: [],
    };
    const reinforcedEnemy = {
      ...COMMON_ENEMIES.m30_c1,
      affixes: ["強襲", "堅甲", "統御"],
      resistances: [],
      weaknesses: [],
    };

    const playerToBase = resolvePlayerWorldStrike(player, baseEnemy);
    const playerToReinforced = resolvePlayerWorldStrike(player, reinforcedEnemy);

    expect(playerToReinforced.damage).toBeLessThan(playerToBase.damage);

    const baseResult = runAutoBattle(player, baseEnemy);
    const reinforcedResult = runAutoBattle(player, reinforcedEnemy);

    const basePlayerHp =
      baseResult.logs[baseResult.logs.length - 1]?.playerHp ?? player.maxHp;
    const reinforcedPlayerHp =
      reinforcedResult.logs[reinforcedResult.logs.length - 1]?.playerHp ??
      player.maxHp;

    expect(reinforcedPlayerHp).toBeLessThanOrEqual(basePlayerHp);
  });

  it("applies inheritance and summon-style high realm actives in battle logs", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 86,
        rootBone: 92,
        insight: 78,
        comprehension: 28,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.VoidRefining,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1250,
        defense: 320,
        hp: 5600,
      },
      "虛空劍尊",
      ProfessionType.Sword,
      ["s_vr_active", "s_vr_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 86,
        insight: 102,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1850,
        defense: 380,
        hp: 6200,
        mp: 9000,
      },
      "仙宮真君",
      ProfessionType.Mage,
      ["m_im_active", "m_im_passive"]
    );

    const swordResult = runAutoBattle(sword, COMMON_ENEMIES.m130_c1);
    const mageResult = runAutoBattle(mage, COMMON_ENEMIES.m170_c1);

    expect(swordResult.logs.some((log) => log.message.includes("虛空劍陣"))).toBe(true);
    expect(mageResult.logs.some((log) => log.message.includes("金甲天兵"))).toBe(true);
  });

  it("lets formal core sword active inherit the void-refining sword-array follow-up strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      ["s_ma_active"]
    );

    const result = runAutoBattle(sword, COMMON_ENEMIES.m150_c1);
    expect(result.logs.some((log) => log.message.includes("虛空劍陣"))).toBe(true);
  });

  it("lets formal core sword active inherit the stronger void-refining attack profile", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseSword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      []
    );

    const coreSword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      ["s_ma_active"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m150_c1,
      defense: 2200,
      hp: 28000,
      maxHp: 28000,
    };

    const baseResult = resolvePlayerWorldStrike(baseSword, enemy);
    const coreResult = resolvePlayerWorldStrike(
      coreSword,
      enemy,
      getSkill("s_ma_active")
    );

    expect(coreResult.damage).toBeGreaterThan(baseResult.damage);
  });

  it("lets formal core mage active inherit the summon follow-up strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 84,
        insight: 116,
        comprehension: 32,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1850,
        defense: 380,
        hp: 6200,
        mp: 9000,
      },
      "雷法真君",
      ProfessionType.Mage,
      ["m_tr_active"]
    );

    const result = runAutoBattle(mage, COMMON_ENEMIES.m170_c1);
    expect(result.logs.some((log) => log.message.includes("金甲天兵"))).toBe(true);
  });

  it("lets formal core mage active inherit the emperor-grade penetration profile", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseMage = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 84,
        insight: 116,
        comprehension: 32,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2200,
        defense: 380,
        hp: 6200,
        mp: 9000,
      },
      "雷法真君",
      ProfessionType.Mage,
      []
    );

    const coreMage = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 84,
        insight: 116,
        comprehension: 32,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2200,
        defense: 380,
        hp: 6200,
        mp: 9000,
      },
      "雷法真君",
      ProfessionType.Mage,
      ["m_tr_active"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      defense: 2600,
      hp: 52000,
      maxHp: 52000,
      affixes: ["霸體", "統御", "堅甲"],
    };

    const baseResult = resolvePlayerWorldStrike(baseMage, enemy);
    const coreResult = resolvePlayerWorldStrike(
      coreMage,
      enemy,
      getSkill("m_tr_active")
    );

    expect(coreResult.damage).toBeGreaterThan(baseResult.damage);
  });

  it("lets immortal body actives convert damage into healing", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 102,
        rootBone: 92,
        insight: 70,
        comprehension: 24,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1680,
        defense: 420,
        hp: 7600,
      },
      "祖巫戰仙",
      ProfessionType.Body,
      ["b_im_active", "b_im_passive"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m170_c1,
      hp: 50000,
      maxHp: 50000,
      defense: 600,
    };

    const result = runAutoBattle(player, enemy);
    expect(result.logs.some((log) => log.message.includes("祖巫降臨"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("回復了"))).toBe(true);
  });

  it("lets formal core body active inherit the immortal lifesteal conversion", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 102,
        rootBone: 92,
        insight: 70,
        comprehension: 24,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1680,
        defense: 420,
        hp: 7600,
      },
      "祖巫戰仙",
      ProfessionType.Body,
      ["b_ma_active"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m170_c1,
      hp: 50000,
      maxHp: 50000,
      defense: 600,
    };

    const result = runAutoBattle(player, enemy);
    expect(result.logs.some((log) => log.message.includes("祖巫降臨"))).toBe(true);
    expect(result.logs.some((log) => log.message.includes("回復了"))).toBe(true);
  });

  it("lets formal core body active inherit the giant-form shield in world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 102,
        rootBone: 92,
        insight: 70,
        comprehension: 24,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1680,
        defense: 420,
        hp: 7600,
      },
      "祖巫戰仙",
      ProfessionType.Body,
      ["b_ma_active"]
    );

    const strike = resolvePlayerWorldStrike(
      player,
      COMMON_ENEMIES.m170_c1,
      getSkill("b_ma_active")
    );

    expect(strike.playerStatusNames).toContain("法天象地");
    expect(strike.playerShieldGain).toBeGreaterThan(0);
  });

  it("lets formal core sword active inherit the zhuxian domain pressure in world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      ["s_tr_active"]
    );

    const strike = resolvePlayerWorldStrike(
      player,
      COMMON_ENEMIES.m150_c1,
      getSkill("s_tr_active")
    );

    expect(strike.enemyStatusNames).toContain("誅仙劍陣");
    expect(strike.enemyStatusNames).toContain("燃燒");
  });

  it("lets formal core sword active inherit the sword-qi resonance burst in world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseSword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      ["s_tr_active"]
    );

    const resonantSword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      ["s_f_active", "s_tr_active"]
    );

    const enemy = COMMON_ENEMIES.m150_c1;
    const baseStrike = resolvePlayerWorldStrike(baseSword, enemy, getSkill("s_tr_active"));
    const resonantStrike = resolvePlayerWorldStrike(
      resonantSword,
      enemy,
      getSkill("s_tr_active")
    );

    expect(resonantStrike.damage).toBeGreaterThan(baseStrike.damage);
    expect(resonantStrike.playerStatusNames).toContain("萬劍歸一");
  });

  it("lets formal core sword active inherit the sword-qi resonance burst", () => {
    fixedRandom.mockReturnValue(0.5);

    const resonantSword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 118,
        insight: 80,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1700,
        defense: 360,
        hp: 5600,
      },
      "大道劍君",
      ProfessionType.Sword,
      ["s_f_active", "s_tr_active"]
    );

    const result = runAutoBattle(resonantSword, COMMON_ENEMIES.m150_c1);

    expect(
      result.logs.some((log) => log.message.includes("萬劍歸一"))
    ).toBe(true);
  });

  it("lets formal core mage active inherit the palm-thunder paralyze in world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const player = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 84,
        insight: 116,
        comprehension: 32,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1850,
        defense: 380,
        hp: 6200,
        mp: 9000,
      },
      "雷法真君",
      ProfessionType.Mage,
      ["m_tr_active"]
    );

    const strike = resolvePlayerWorldStrike(
      player,
      COMMON_ENEMIES.m170_c1,
      getSkill("m_tr_active")
    );

    expect(strike.enemyStatusNames).toContain("麻痺");
  });

  it("lets immortal body passive negate dot statuses and amplify sustain", () => {
    fixedRandom.mockReturnValue(0.5);

    const enemy = {
      ...BOSS_ENEMIES.m26_b1,
      hp: 6200,
      maxHp: 6200,
      attack: 260,
      defense: 120,
      specialAttack: {
        name: "毒火纏身",
        cooldownSeconds: 1,
        damageMultiplier: 1.1,
        statusEffect: { id: "burn", duration: 2, chance: 1, value: 0.03 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const baseBody = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 80,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.MIXED_FIVE,
      {
        hp: 4200,
        defense: 320,
        regenHp: 6,
        attack: 480,
      },
      "仙體基準",
      ProfessionType.Body,
      []
    );

    const immortalBody = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 80,
        insight: 60,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.MIXED_FIVE,
      {
        hp: 4200,
        defense: 320,
        regenHp: 6,
        attack: 480,
      },
      "仙體無垢",
      ProfessionType.Body,
      ["b_im_passive"]
    );

    const baseResult = runAutoBattle(baseBody, enemy);
    const passiveResult = runAutoBattle(immortalBody, enemy);

    expect(
      baseResult.logs.some(
        (log) =>
          (log.playerStatuses || []).includes("燃燒") ||
          log.message.includes("身陷【燃燒】")
      )
    ).toBe(true);
    expect(passiveResult.logs.some((log) => log.message.includes("仙體無垢"))).toBe(
      true
    );
    expect(
      passiveResult.logs.some((log) => (log.playerStatuses || []).includes("燃燒"))
    ).toBe(false);

    const baseFinalHp =
      baseResult.logs[baseResult.logs.length - 1]?.playerHp ?? baseBody.maxHp;
    const passiveFinalHp =
      passiveResult.logs[passiveResult.logs.length - 1]?.playerHp ??
      immortalBody.maxHp;
    expect(passiveFinalHp).toBeGreaterThan(baseFinalHp);
  });

  it("applies later-realm armor break and cooldown reset effects", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 95,
        rootBone: 106,
        insight: 78,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2100,
        defense: 420,
        hp: 7800,
      },
      "劫劍真君",
      ProfessionType.Sword,
      ["s_tr_active", "s_tr_passive"]
    );

    const realmBreaker = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 98,
        insight: 80,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 1750,
        defense: 360,
        hp: 6800,
      },
      "誅仙劍主",
      ProfessionType.Sword,
      ["s_im_active", "s_im_passive"]
    );

    const trResult = runAutoBattle(sword, COMMON_ENEMIES.m1_c1);
    const imResult = runAutoBattle(realmBreaker, COMMON_ENEMIES.m150_c1);

    expect(trResult.logs.some((log) => log.message.includes("冷卻即刻重置"))).toBe(true);
    expect(
      imResult.logs.some(
        (log) =>
          (log.enemyStatuses || []).includes("誅仙劍陣") ||
          log.message.includes("誅仙劍陣")
      )
    ).toBe(true);
  });

  it("keeps spirit severing boss from becoming a free win for every profession on full low gear", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 70,
        rootBone: 78,
        insight: 68,
        comprehension: 22,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(SPIRIT_SEVERING_SWORD_SET),
      "化神劍修",
      ProfessionType.Sword,
      ["s_n_active", "s_n_passive", "s_sf_active", "s_sf_passive"]
    );

    const body = calculatePlayerStats(
      {
        physique: 78,
        rootBone: 74,
        insight: 60,
        comprehension: 20,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.MIXED_FIVE,
      buildEquipmentStats(SPIRIT_SEVERING_BODY_SET),
      "化神體修",
      ProfessionType.Body,
      ["b_n_active", "b_n_passive", "b_sf_active", "b_sf_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 68,
        rootBone: 66,
        insight: 82,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.SpiritSevering,
      SpiritRootId.TRUE_WATER_WOOD,
      buildEquipmentStats(SPIRIT_SEVERING_MAGE_SET),
      "化神法修",
      ProfessionType.Mage,
      ["m_n_active", "m_n_passive", "m_sf_active", "m_sf_passive"]
    );

    const lowResults = [
      runAutoBattle(sword, BOSS_ENEMIES.m121_b1).won,
      runAutoBattle(body, BOSS_ENEMIES.m121_b1).won,
      runAutoBattle(mage, BOSS_ENEMIES.m121_b1).won,
    ];

    expect(lowResults.filter(Boolean).length).toBeLessThan(3);
  });

  it("lets sword emperor passive turn basic attacks into true-damage style strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseSword = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 108,
        insight: 84,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 380,
        hp: 9200,
        crit: 15,
      },
      "帝劍基準",
      ProfessionType.Sword,
      []
    );

    const emperorSword = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 108,
        insight: 84,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 380,
        hp: 9200,
        crit: 15,
      },
      "萬法皆空",
      ProfessionType.Sword,
      ["s_ie_passive"]
    );

    const wallEnemy = {
      ...COMMON_ENEMIES.m180_c1,
      defense: 20000,
      affixes: ["堅甲", "統御"],
      resistances: [],
      weaknesses: [],
    };

    const baseStrike = resolvePlayerWorldStrike(baseSword, wallEnemy);
    const emperorStrike = resolvePlayerWorldStrike(emperorSword, wallEnemy);

    expect(emperorStrike.damage).toBeGreaterThan(baseStrike.damage);
  });

  it("lets formal core sword passive inherit the emperor passive armor bypass", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseSword = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 108,
        insight: 84,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 380,
        hp: 9200,
        crit: 15,
      },
      "帝劍基準",
      ProfessionType.Sword,
      []
    );

    const formalSword = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 108,
        insight: 84,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 380,
        hp: 9200,
        crit: 15,
      },
      "萬法皆空",
      ProfessionType.Sword,
      ["s_tr_passive"]
    );

    const wallEnemy = {
      ...COMMON_ENEMIES.m180_c1,
      defense: 20000,
      affixes: ["堅甲", "統御"],
      resistances: [],
      weaknesses: [],
    };

    const baseStrike = resolvePlayerWorldStrike(baseSword, wallEnemy);
    const formalStrike = resolvePlayerWorldStrike(formalSword, wallEnemy);

    expect(formalStrike.damage).toBeGreaterThan(baseStrike.damage);
  });

  it("lets formal core sword passive inherit the void-refining armor-pierce proc", () => {
    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      defense: 900,
    };

    const baseSword = calculatePlayerStats(
      {
        physique: 150,
        rootBone: 170,
        insight: 120,
        comprehension: 80,
        fortune: 40,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(SPIRIT_SEVERING_SWORD_SET),
      "基礎劍修",
      ProfessionType.Sword,
      []
    );

    const formalSword = calculatePlayerStats(
      {
        physique: 150,
        rootBone: 170,
        insight: 120,
        comprehension: 80,
        fortune: 40,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(SPIRIT_SEVERING_SWORD_SET),
      "正式劍修",
      ProfessionType.Sword,
      ["s_tr_passive"]
    );

    fixedRandom.mockReset();
    fixedRandom.mockReturnValueOnce(0.99);
    const baseStrike = resolvePlayerWorldStrike(baseSword, enemy);

    fixedRandom.mockReset();
    fixedRandom.mockReturnValueOnce(0.05).mockReturnValueOnce(0.99);
    const formalStrike = resolvePlayerWorldStrike(formalSword, enemy);

    expect(formalStrike.damage).toBeGreaterThan(baseStrike.damage);
  });

  it("lets sword tribulation passive force crits in world strikes at low hp", () => {
    fixedRandom.mockReturnValue(0.99);

    const enemy = {
      ...COMMON_ENEMIES.m130_c1,
      defense: 880,
    };

    const sword = calculatePlayerStats(
      {
        physique: 150,
        rootBone: 168,
        insight: 122,
        comprehension: 76,
        fortune: 34,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_FIRE_METAL,
      buildEquipmentStats(SPIRIT_SEVERING_SWORD_SET),
      "向死而生",
      ProfessionType.Sword,
      ["s_tr_passive"]
    );

    const healthyStrike = resolvePlayerWorldStrike(
      sword,
      enemy
    );
    const lowHpStrike = resolvePlayerWorldStrike(
      { ...sword, hp: Math.floor(sword.maxHp * 0.18) },
      enemy
    );

    expect(healthyStrike.isCrit).toBe(false);
    expect(lowHpStrike.isCrit).toBe(true);
    expect(lowHpStrike.playerStatusNames).toContain("向死而生");
    expect(lowHpStrike.damage).toBeGreaterThan(healthyStrike.damage);
  });

  it("lets body emperor active deal direct siphon damage and apply god kingdom", () => {
    fixedRandom.mockReturnValue(0.5);

    const emperorBody = calculatePlayerStats(
      {
        physique: 100,
        rootBone: 96,
        insight: 72,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 2600,
        defense: 600,
        hp: 16000,
      },
      "神國之主",
      ProfessionType.Body,
      ["b_ie_active"]
    );

    const result = runAutoBattle(emperorBody, COMMON_ENEMIES.m180_c1);

    expect(result.logs.some((log) => log.message.includes("掌中神國"))).toBe(true);
    expect(
      result.logs.some(
        (log) =>
          (log.enemyStatuses || []).includes("神國侵蝕") ||
          log.message.includes("神國侵蝕")
      )
    ).toBe(true);
    expect(
      result.logs.some((log) => log.message.includes("神國抽離敵方本源"))
    ).toBe(true);
  });

  it("lets formal core body active inherit the siphon effect after retirement mapping", () => {
    fixedRandom.mockReturnValue(0.5);

    const bodyCore = calculatePlayerStats(
      {
        physique: 100,
        rootBone: 96,
        insight: 72,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 2600,
        defense: 600,
        hp: 16000,
      },
      "神國之主",
      ProfessionType.Body,
      ["b_ma_active"]
    );

    const result = runAutoBattle(bodyCore, COMMON_ENEMIES.m180_c1);

    expect(
      result.logs.some((log) => log.message.includes("神國抽離敵方本源"))
    ).toBe(true);
  });

  it("lets emperor mage active invert enemy momentum into layered debuffs", () => {
    fixedRandom.mockReturnValue(0.5);

    const emperorMage = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 88,
        insight: 104,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2600,
        mp: 6200,
        hp: 9800,
        defense: 320,
      },
      "一念花開",
      ProfessionType.Mage,
      ["m_ie_active"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      hp: 48000,
      maxHp: 48000,
      defense: 2200,
      affixes: ["霸體", "統御", "堅甲"],
    };

    const result = runAutoBattle(emperorMage, enemy);
    expect(result.logs.some((log) => log.message.includes("一念花開"))).toBe(true);
    expect(
      result.logs.some(
        (log) =>
          (log.enemyStatuses || []).includes("萬象反噬") ||
          (log.enemyStatuses || []).includes("道火反噬") ||
          (log.enemyStatuses || []).includes("萬象寂滅")
      )
    ).toBe(true);
  });

  it("lets formal core mage passive inherit the emperor special-delay effect", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseMage = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 84,
        insight: 100,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2100,
        mp: 5200,
        hp: 8600,
        defense: 320,
        res: 260,
      },
      "法則基準",
      ProfessionType.Mage,
      []
    );

    const mageCore = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 84,
        insight: 100,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2100,
        mp: 5200,
        hp: 8600,
        defense: 320,
        res: 260,
      },
      "萬法歸宗",
      ProfessionType.Mage,
      ["m_sf_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      specialAttack: {
        name: "焚界妖雷",
        cooldownSeconds: 1,
        damageMultiplier: 1.3,
        statusEffect: { id: "burn", duration: 2, chance: 1, value: 0.02 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const baseResult = runAutoBattle(baseMage, enemy);
    const coreResult = runAutoBattle(mageCore, enemy);
    const baseFirstSpecialTime =
      baseResult.logs.find((log) => log.message.includes("焚界妖雷"))?.timeMs ?? 0;
    const coreFirstSpecialTime =
      coreResult.logs.find((log) => log.message.includes("焚界妖雷"))?.timeMs ?? 0;

    expect(coreResult.logs.some((log) => log.message.includes("萬法歸宗"))).toBe(true);
    expect(coreFirstSpecialTime).toBeGreaterThan(baseFirstSpecialTime);
  });

  it("lets formal core mage active inherit the inversion debuffs after retirement mapping", () => {
    fixedRandom.mockReturnValue(0.5);

    const mageCore = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 88,
        insight: 104,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2600,
        mp: 6200,
        hp: 9800,
        defense: 320,
      },
      "天劫主宰",
      ProfessionType.Mage,
      ["m_tr_active"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      hp: 48000,
      maxHp: 48000,
      defense: 2200,
      affixes: ["霸體", "統御", "堅甲"],
    };

    const result = runAutoBattle(mageCore, enemy);
    expect(
      result.logs.some(
        (log) =>
          (log.enemyStatuses || []).includes("萬象反噬") ||
          (log.enemyStatuses || []).includes("道火反噬") ||
          (log.enemyStatuses || []).includes("萬象寂滅")
      )
    ).toBe(true);
  });

  it("lets formal core mage active inherit the spirit-form defense penetration", () => {
    fixedRandom.mockReturnValue(0.5);

    const enemy = {
      ...COMMON_ENEMIES.m170_c1,
      hp: 36000,
      maxHp: 36000,
      defense: 2600,
    };

    const baseMage = calculatePlayerStats(
      {
        physique: 94,
        rootBone: 86,
        insight: 104,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2100,
        mp: 5600,
        hp: 8200,
        defense: 280,
      },
      "雷劫基準",
      ProfessionType.Mage,
      []
    );

    const coreMage = calculatePlayerStats(
      {
        physique: 94,
        rootBone: 86,
        insight: 104,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2100,
        mp: 5600,
        hp: 8200,
        defense: 280,
      },
      "九霄雷主",
      ProfessionType.Mage,
      ["m_tr_active"]
    );

    const baseStrike = resolvePlayerWorldStrike(baseMage, enemy);
    const coreStrike = resolvePlayerWorldStrike(coreMage, enemy, coreMage.learnedSkills[0]);

    expect(coreStrike.damage).toBeGreaterThan(baseStrike.damage);
  });

  it("lets formal core body active inherit the tribulation reflect stance", () => {
    fixedRandom.mockReturnValue(0.5);

    const body = calculatePlayerStats(
      {
        physique: 108,
        rootBone: 92,
        insight: 72,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.VoidRefining,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 2100,
        defense: 520,
        hp: 14200,
      },
      "吞天戰體",
      ProfessionType.Body,
      ["b_vr_active"]
    );

    const strike = resolvePlayerWorldStrike(
      body,
      COMMON_ENEMIES.m150_c1,
      getSkill("b_vr_active")
    );

    expect(strike.playerStatusNames).toContain("反震");
  });

  it("lets mahayana mage passive amplify active spell damage", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseMage = calculatePlayerStats(
      {
        physique: 88,
        rootBone: 80,
        insight: 94,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        mp: 4200,
        hp: 7600,
        defense: 260,
      },
      "言靈基準",
      ProfessionType.Mage,
      ["m_ma_active"]
    );

    const empoweredMage = calculatePlayerStats(
      {
        physique: 88,
        rootBone: 80,
        insight: 94,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        mp: 4200,
        hp: 7600,
        defense: 260,
      },
      "言出法隨",
      ProfessionType.Mage,
      ["m_ma_active", "m_ma_passive"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m170_c1,
      hp: 30000,
      maxHp: 30000,
      defense: 260,
    };

    const baseResult = runAutoBattle(baseMage, enemy);
    const empoweredResult = runAutoBattle(empoweredMage, enemy);

    const basePalmThunder =
      baseResult.logs.find((log) => log.message.includes("掌心雷"))?.damage ?? 0;
    const empoweredPalmThunder =
      empoweredResult.logs.find((log) => log.message.includes("掌心雷"))?.damage ?? 0;

    expect(empoweredPalmThunder).toBeGreaterThan(basePalmThunder);
  });

  it("lets mahayana sword passive add measurable crit payoff in single-target fights", () => {
    fixedRandom.mockReturnValue(0);

    const baseSword = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 104,
        insight: 78,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 340,
        hp: 8800,
        crit: 0,
      },
      "劍尊基準",
      ProfessionType.Sword,
      []
    );

    const empoweredSword = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 104,
        insight: 78,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 340,
        hp: 8800,
        crit: 0,
      },
      "劍道獨尊",
      ProfessionType.Sword,
      ["s_ma_passive"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m170_c1,
      defense: 200,
    };

    const baseStrike = resolvePlayerWorldStrike(baseSword, enemy);
    const empoweredStrike = resolvePlayerWorldStrike(empoweredSword, enemy);

    expect(empoweredStrike.isCrit).toBe(true);
    expect(empoweredStrike.damage).toBeGreaterThan(baseStrike.damage);
    expect(empoweredStrike.playerStatusNames).toContain("劍道獨尊");
  });

  it("lets mahayana mage passive affect world strikes and surface explicit status names", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseMage = calculatePlayerStats(
      {
        physique: 88,
        rootBone: 80,
        insight: 94,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        mp: 4200,
        hp: 7600,
        defense: 260,
      },
      "法修基準",
      ProfessionType.Mage,
      ["m_ma_active"]
    );

    const empoweredMage = calculatePlayerStats(
      {
        physique: 88,
        rootBone: 80,
        insight: 94,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        mp: 4200,
        hp: 7600,
        defense: 260,
      },
      "言出法隨",
      ProfessionType.Mage,
      ["m_ma_active", "m_ma_passive"]
    );

    const enemy = {
      ...COMMON_ENEMIES.m170_c1,
      defense: 260,
    };

    const baseStrike = resolvePlayerWorldStrike(
      baseMage,
      enemy,
      getSkill("m_ma_active")
    );
    const empoweredStrike = resolvePlayerWorldStrike(
      empoweredMage,
      enemy,
      getSkill("m_ma_active")
    );

    expect(empoweredStrike.damage).toBeGreaterThan(baseStrike.damage);
    expect(empoweredStrike.playerStatusNames).toContain("言出法隨");
  });

  it("surfaces mage foundation passive on world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 66,
        rootBone: 62,
        insight: 78,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Foundation,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 780,
        mp: 2200,
        defense: 160,
      },
      "靈力湧動",
      ProfessionType.Mage,
      ["m_f_active", "m_f_passive"]
    );

    const strike = resolvePlayerWorldStrike(
      mage,
      COMMON_ENEMIES.m50_c1,
      getSkill("m_f_active")
    );

    expect(strike.playerStatusNames).toContain("靈力湧動");
  });

  it("surfaces fusion mage passive on world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 86,
        rootBone: 78,
        insight: 92,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Fusion,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1400,
        mp: 3200,
        defense: 220,
        res: 200,
      },
      "五氣朝元",
      ProfessionType.Mage,
      ["m_bi_active", "m_bi_passive"]
    );

    const strike = resolvePlayerWorldStrike(
      mage,
      COMMON_ENEMIES.m170_c1,
      getSkill("m_bi_active")
    );

    expect(strike.playerStatusNames).toContain("五氣朝元");
  });

  it("surfaces immortal mage passive on world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 80,
        insight: 104,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.Immortal,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1900,
        mp: 4800,
        defense: 260,
        res: 220,
      },
      "仙法通神",
      ProfessionType.Mage,
      ["m_im_active", "m_im_passive"]
    );

    const strike = resolvePlayerWorldStrike(
      mage,
      COMMON_ENEMIES.m170_c1,
      getSkill("m_im_active")
    );

    expect(strike.playerStatusNames).toContain("仙法通神");
  });

  it("surfaces emperor mage passive on world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const mage = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 84,
        insight: 110,
        comprehension: 32,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2200,
        mp: 5200,
        defense: 280,
        res: 240,
      },
      "萬法歸宗",
      ProfessionType.Mage,
      ["m_ie_active", "m_ie_passive"]
    );

    const strike = resolvePlayerWorldStrike(
      mage,
      COMMON_ENEMIES.m170_c1,
      getSkill("m_ie_active")
    );

    expect(strike.playerStatusNames).toContain("萬法歸宗");
  });

  it("surfaces sword emperor passive on basic world strikes", () => {
    fixedRandom.mockReturnValue(0.5);

    const sword = calculatePlayerStats(
      {
        physique: 98,
        rootBone: 112,
        insight: 86,
        comprehension: 32,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2400,
        defense: 320,
        hp: 9200,
        crit: 18,
      },
      "萬法皆空",
      ProfessionType.Sword,
      ["s_ie_passive"]
    );

    const strike = resolvePlayerWorldStrike(sword, COMMON_ENEMIES.m170_c1);

    expect(strike.playerStatusNames).toContain("萬法皆空");
    expect(strike.damage).toBeGreaterThan(0);
  });

  it("writes explicit mahayana passive logs in timeline combat", () => {
    fixedRandom.mockReturnValue(0);

    const sword = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 104,
        insight: 78,
        comprehension: 26,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 340,
        hp: 8800,
        crit: 0,
      },
      "劍道獨尊",
      ProfessionType.Sword,
      ["s_ma_passive"]
    );

    const mage = calculatePlayerStats(
      {
        physique: 88,
        rootBone: 80,
        insight: 94,
        comprehension: 28,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.Mahayana,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 1800,
        mp: 4200,
        hp: 7600,
        defense: 260,
      },
      "言出法隨",
      ProfessionType.Mage,
      ["m_ma_active", "m_ma_passive"]
    );

    const swordResult = runAutoBattle(sword, COMMON_ENEMIES.m170_c1);
    const mageResult = runAutoBattle(mage, COMMON_ENEMIES.m170_c1);

    expect(swordResult.logs.some((log) => log.message.includes("劍道獨尊"))).toBe(true);
    expect(mageResult.logs.some((log) => log.message.includes("言出法隨"))).toBe(true);
  });

  it("lets body tribulation passive stack defensive layers after taking hits", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseBody = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 86,
        insight: 64,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1500,
        defense: 520,
        hp: 12000,
      },
      "渡劫體修",
      ProfessionType.Body,
      []
    );

    const tribulationBody = calculatePlayerStats(
      {
        physique: 96,
        rootBone: 86,
        insight: 64,
        comprehension: 24,
        fortune: 14,
        charm: 10,
      },
      MajorRealm.Tribulation,
      SpiritRootId.MIXED_FIVE,
      {
        attack: 1500,
        defense: 520,
        hp: 12000,
      },
      "萬劫不滅",
      ProfessionType.Body,
      ["b_tr_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m161_b1,
      attack: 680,
      defense: 260,
      hp: 16000,
      maxHp: 16000,
    };

    const baseResult = runAutoBattle(baseBody, enemy);
    const passiveResult = runAutoBattle(tribulationBody, enemy);

    expect(passiveResult.logs.some((log) => log.message.includes("萬劫不滅"))).toBe(true);

    const baseFinalHp =
      baseResult.logs[baseResult.logs.length - 1]?.playerHp ?? baseBody.maxHp;
    const passiveFinalHp =
      passiveResult.logs[passiveResult.logs.length - 1]?.playerHp ??
      tribulationBody.maxHp;
    expect(passiveFinalHp).toBeGreaterThan(baseFinalHp);
  });

  it("lets sword emperor passive ignore incoming negative statuses", () => {
    fixedRandom.mockReturnValue(0.5);

    const enemy = {
      ...BOSS_ENEMIES.m26_b1,
      specialAttack: {
        name: "災火纏身",
        cooldownSeconds: 1,
        damageMultiplier: 1.1,
        statusEffect: { id: "burn", duration: 2, chance: 1, value: 0.03 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const emperorSword = calculatePlayerStats(
      {
        physique: 90,
        rootBone: 108,
        insight: 84,
        comprehension: 30,
        fortune: 18,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_FIRE_METAL,
      {
        attack: 2200,
        defense: 380,
        hp: 9200,
      },
      "萬法皆空",
      ProfessionType.Sword,
      ["s_ie_passive"]
    );

    const result = runAutoBattle(emperorSword, enemy);

    expect(result.logs.some((log) => log.message.includes("萬法皆空"))).toBe(true);
    expect(
      result.logs.some((log) => (log.playerStatuses || []).includes("燃燒"))
    ).toBe(false);
  });

  it("lets mage emperor passive delay enemy arts and soften elemental retaliation", () => {
    fixedRandom.mockReturnValue(0.5);

    const baseMage = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 84,
        insight: 100,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2100,
        mp: 5200,
        hp: 8600,
        defense: 320,
        res: 260,
      },
      "帝法基準",
      ProfessionType.Mage,
      []
    );

    const emperorMage = calculatePlayerStats(
      {
        physique: 92,
        rootBone: 84,
        insight: 100,
        comprehension: 30,
        fortune: 16,
        charm: 10,
      },
      MajorRealm.ImmortalEmperor,
      SpiritRootId.TRUE_WATER_WOOD,
      {
        magic: 2100,
        mp: 5200,
        hp: 8600,
        defense: 320,
        res: 260,
      },
      "萬法歸宗",
      ProfessionType.Mage,
      ["m_ie_passive"]
    );

    const enemy = {
      ...BOSS_ENEMIES.m180_b1,
      specialAttack: {
        name: "焚界妖雷",
        cooldownSeconds: 1,
        damageMultiplier: 1.3,
        statusEffect: { id: "burn", duration: 2, chance: 1, value: 0.02 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const baseResult = runAutoBattle(baseMage, enemy);
    const passiveResult = runAutoBattle(emperorMage, enemy);

    expect(passiveResult.logs.some((log) => log.message.includes("萬法歸宗"))).toBe(true);
    const baseFirstSpecialTime =
      baseResult.logs.find((log) => log.message.includes("焚界妖雷"))?.timeMs ?? 0;
    const passiveFirstSpecialTime =
      passiveResult.logs.find((log) => log.message.includes("焚界妖雷"))?.timeMs ?? 0;
    expect(passiveFirstSpecialTime).toBeGreaterThan(baseFirstSpecialTime);
  });

});
