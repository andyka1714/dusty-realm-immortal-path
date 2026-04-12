import { MajorRealm, ElementType, Enemy, EnemyRank } from "../../types";
import { createEnemy } from "./utils";
import { MINOR_REALM } from "../../constants";
import { getSkillManualId } from "../items/manuals";
import { getFormalCoreSkillsByRealm } from "../skills";

// Elite Stats Logic
// Generally ~2x HP and ~1.3x Atk/Def of Common mobs in the same map.
// Target: requires Mid-Grade gear of current realm to beat comfortably.

// Full Sets
const MO_SET = [
  "novice_sword",
  "wooden_shield",
  "straw_hat",
  "novice_robe",
  "straw_sandals",
  "wooden_charm",
];
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
const QI_MAGIC_SET = [
  "spirit_wood_staff",
  "spirit_orb",
  "mystic_crown",
  "taoist_vestment",
  "cloud_step_shoes",
  "elemental_ring",
];

const FOUNDATION_SET = [
  "flow_light_sword",
  "sword_scabbard",
  "clear_sky_crown",
  "flowing_cloud_robe",
  "wind_chasing_boots",
  "sword_heart_pendant",
  "tiger_king_gauntlet",
  "scale_shield",
  "bloody_helm",
  "heavy_plate_armor",
  "rock_stomper_boots",
  "vitality_ring",
  "jade_bamboo_staff",
  "elemental_fan",
  "mage_hood",
  "mystic_robe",
  "spirit_step_shoes",
  "focus_pendant",
];
const FOUNDATION_SWORD_SET = FOUNDATION_SET.slice(0, 6);
const FOUNDATION_BODY_SET = FOUNDATION_SET.slice(6, 12);
const FOUNDATION_MAGIC_SET = FOUNDATION_SET.slice(12, 18);
const GOLDEN_CORE_SET = [
  "azure_frost_sword",
  "sword_spirit_stone",
  "golden_crown",
  "purple_cloud_armor",
  "shadow_step_boots",
  "heart_mirror",
  "dragon_claw",
  "black_tortoise_shield",
  "diamond_helm",
  "demon_god_armor",
  "mountain_boots",
  "blood_jade",
  "phoenix_feather_staff",
  "yin_yang_mirror",
  "star_crown",
  "void_robe",
  "gliding_boots",
  "wisdom_pearl",
];
const GOLDEN_CORE_SWORD_SET = GOLDEN_CORE_SET.slice(0, 6);
const GOLDEN_CORE_BODY_SET = GOLDEN_CORE_SET.slice(6, 12);
const GOLDEN_CORE_MAGIC_SET = GOLDEN_CORE_SET.slice(12, 18);
const NASCENT_SOUL_SET = [
  "seven_star_sword",
  "void_sword_box",
  "heaven_soaring_crown",
  "nine_dragons_robe",
  "divine_travel_boots",
  "sword_intent_crystal",
  "god_fiend_gauntlet",
  "immortal_king_shield",
  "indestructible_helm",
  "chaos_armor",
  "ground_shrinking_boots",
  "bood_soul_bead",
  "elemental_chaos_staff",
  "heaven_earth_mirror",
  "divine_sense_crown",
  "nine_heavens_robe",
  "void_step_shoes",
  "bodhi_seed",
];
const NASCENT_SOUL_SWORD_SET = NASCENT_SOUL_SET.slice(0, 6);
const NASCENT_SOUL_BODY_SET = NASCENT_SOUL_SET.slice(6, 12);
const NASCENT_SOUL_MAGIC_SET = NASCENT_SOUL_SET.slice(12, 18);
const SPIRIT_SEVERING_SET = [
  "celestial_slayer_sword",
  "heavenly_mirror_shield",
  "violet_gold_crown",
  "immortal_crane_robe",
  "wind_thunder_boots",
  "soul_binding_ring",
  "tyrant_fist",
  "divine_tortoise_shell",
  "heaven_shaking_helm",
  "indestructible_body_armor",
  "mountain_moving_boots",
  "blood_origin_stone",
  "five_elements_divine_staff",
  "yin_yang_orb",
  "spirit_conception_crown",
  "starry_sky_robe",
  "cloud_crossing_boots",
  "mystic_method_ring",
];
const SPIRIT_SEVERING_SWORD_SET = SPIRIT_SEVERING_SET.slice(0, 6);
const SPIRIT_SEVERING_BODY_SET = SPIRIT_SEVERING_SET.slice(6, 12);
const SPIRIT_SEVERING_MAGIC_SET = SPIRIT_SEVERING_SET.slice(12, 18);
const VOID_REFINING_SET = [
  "void_render_sword",
  "sword_domain_plate",
  "extreme_yang_crown",
  "extreme_yin_armor",
  "flash_lightning_boots",
  "void_spirit_ring",
  "shattering_gauntlet",
  "mountain_sea_shield",
  "dragon_god_helm",
  "immortal_gold_body",
  "star_stepping_boots",
  "life_source_gem",
  "creation_staff",
  "universe_bag",
  "heaven_eye_crown",
  "mystic_light_robe",
  "void_shuttle_boots",
  "elemental_origin_ring",
];
const VOID_REFINING_SWORD_SET = VOID_REFINING_SET.slice(0, 6);
const VOID_REFINING_BODY_SET = VOID_REFINING_SET.slice(6, 12);
const VOID_REFINING_MAGIC_SET = VOID_REFINING_SET.slice(12, 18);
const FUSION_SET = [
  "unity_sword",
  "sword_soul_scabbard",
  "celestial_spirit_crown",
  "nine_palace_robe",
  "chasing_sun_boots",
  "precelestial_ring",
  "god_force_gauntlet",
  "primordial_shield",
  "diamond_buddha_helm",
  "sacred_body_armor",
  "earth_shrinking_boots",
  "undying_heart",
  "heaven_path_staff",
  "universe_mirror",
  "sage_crown",
  "chaos_element_robe",
  "star_river_boots",
  "law_bead",
];
const FUSION_SWORD_SET = FUSION_SET.slice(0, 6);
const FUSION_BODY_SET = FUSION_SET.slice(6, 12);
const FUSION_MAGIC_SET = FUSION_SET.slice(12, 18);
const MAHAYANA_SET = [
  "world_breaker_sword",
  "ascension_token",
  "supreme_unity_crown",
  "limitless_robe",
  "void_crossing_boots",
  "karma_ring",
  "star_crusher_gauntlet",
  "world_wall_shield",
  "immortal_king_crown",
  "primordial_chaos_body",
  "galaxy_boots",
  "nirvana_heart",
  "great_dao_staff",
  "destiny_book",
  "wisdom_king_crown",
  "yin_yang_void_robe",
  "dimension_boots",
  "truth_eye",
];
const MAHAYANA_SWORD_SET = MAHAYANA_SET.slice(0, 6);
const MAHAYANA_BODY_SET = MAHAYANA_SET.slice(6, 12);
const MAHAYANA_MAGIC_SET = MAHAYANA_SET.slice(12, 18);
const TRIBULATION_SET = [
  "thunder_calamity_sword",
  "tribulation_ward",
  "purple_thunder_crown",
  "dragon_scale_thunder_robe",
  "lightning_flash_boots",
  "fate_defying_ring",
  "world_shaking_gauntlet",
  "immortal_mountain_shield",
  "heavens_dome_helm",
  "nine_turns_golden_body",
  "earth_vein_boots",
  "blood_god_ring",
  "celestial_punishment_staff",
  "universe_void_mirror",
  "divinity_crown",
  "chaos_origin_robe",
  "light_speed_boots",
  "infinite_wisdom_pearl",
];
const TRIBULATION_SWORD_SET = TRIBULATION_SET.slice(0, 6);
const TRIBULATION_BODY_SET = TRIBULATION_SET.slice(6, 12);
const TRIBULATION_MAGIC_SET = TRIBULATION_SET.slice(12, 18);
const IMMORTAL_SET = [
  "immortal_execution_sword",
  "slaughter_immortal_plate",
  "immortal_king_command",
  "primordial_qi_robe",
  "sun_moon_boots",
  "jade_clear_ring",
  "heaven_crushing_fist",
  "absolute_defense",
  "origin_helmet",
  "chaos_demon_body",
  "unbounded_boots",
  "eternal_core",
  "primordial_staff",
  "creation_plate",
  "supreme_wisdom_crown",
  "elements_origin_robe",
  "time_boots",
  "destiny_wheel",
];
const IMMORTAL_SWORD_SET = IMMORTAL_SET.slice(0, 6);
const IMMORTAL_BODY_SET = IMMORTAL_SET.slice(6, 12);
const IMMORTAL_MAGIC_SET = IMMORTAL_SET.slice(12, 18);
const IMMORTAL_EMPEROR_SET = [
  "origin_sword",
  "end_shield",
  "emperor_crown",
  "supreme_robe",
  "step_heaven_boots",
  "concept_ring",
  "genesis_fist",
  "eternal_barrier",
  "immortal_god_helm",
  "great_dao_body",
  "void_walker_boots",
  "origin_heart",
  "supreme_law_staff",
  "multiverse_mirror",
  "omniscient_crown",
  "origin_robe",
  "dimension_lord_boots",
  "truth_ring",
];
const IMMORTAL_EMPEROR_SWORD_SET = IMMORTAL_EMPEROR_SET.slice(0, 6);
const IMMORTAL_EMPEROR_BODY_SET = IMMORTAL_EMPEROR_SET.slice(6, 12);
const IMMORTAL_EMPEROR_MAGIC_SET = IMMORTAL_EMPEROR_SET.slice(12, 18);

export const ELITE_ENEMIES: Record<string, Enemy> = {
  // === [0] Mortal (凡人) ===
  // North
  m3_e1: createEnemy(
    "m3_e1",
    "流浪劍師",
    MajorRealm.Mortal,
    EnemyRank.Elite,
    800,
    65,
    40,
    ElementType.Metal,
    MO_SET,
    50,
    MINOR_REALM.LATE,
    "劍"
  ),
  // West
  m12_e1: createEnemy(
    "m12_e1",
    "鐵甲犀牛王",
    MajorRealm.Mortal,
    EnemyRank.Elite,
    1000,
    65,
    50,
    ElementType.Earth,
    MO_SET,
    60,
    MINOR_REALM.LATE,
    "犀"
  ),
  // East
  m22_e1: createEnemy(
    "m22_e1",
    "迷霧之靈",
    MajorRealm.Mortal,
    EnemyRank.Elite,
    600,
    75,
    35,
    ElementType.Water,
    MO_SET,
    55,
    MINOR_REALM.LATE,
    "霧"
  ),

  // === [1] Qi Refining (練氣) ===
  // Common Early: HP 500, Atk 50, Def 25
  // Elite Early (Target Mid Gear ~ Atk 120, Def 75, HP 1200):
  // -> Monster: HP 1300-1800, Atk 100+, Def 60+.

  // North
  m5_e1: createEnemy(
    "m5_e1",
    "劍氣魁儡",
    MajorRealm.QiRefining,
    EnemyRank.Elite,
    2000,
    160,
    90,
    ElementType.Metal,
    QI_SWORD_SET,
    200,
    MINOR_REALM.INITIAL,
    "魁"
  ),
  m7_e1: createEnemy(
    "m7_e1",
    "嗜血劍魔",
    MajorRealm.QiRefining,
    EnemyRank.Elite,
    2800,
    180,
    100,
    ElementType.Fire,
    QI_SWORD_SET,
    300,
    MINOR_REALM.LATE,
    "魔",
    {
      aiStyle: "melee",
      specialAttack: {
        name: "血焰斬",
        cooldownSeconds: 3.6,
        damageMultiplier: 1.32,
        castRange: 1,
        castTimeMs: 240,
        statusEffect: {
          id: "bleed",
          duration: 2,
          chance: 0.4,
          value: 0.015,
        },
      },
    }
  ),

  // West
  m15_e1: createEnemy(
    "m15_e1",
    "狂暴棕熊",
    MajorRealm.QiRefining,
    EnemyRank.Elite,
    2400,
    180,
    120,
    ElementType.Earth,
    QI_BODY_SET,
    250,
    MINOR_REALM.MID,
    "熊"
  ),
  m16_e1: createEnemy(
    "m16_e1",
    "雙頭狼王",
    MajorRealm.QiRefining,
    EnemyRank.Elite,
    3000,
    220,
    140,
    ElementType.Metal,
    QI_BODY_SET,
    320,
    MINOR_REALM.LATE,
    "狼",
    {
      aiStyle: "melee",
      specialAttack: {
        name: "裂骨撲殺",
        cooldownSeconds: 3.8,
        damageMultiplier: 1.36,
        castRange: 1,
        castTimeMs: 300,
        statusEffect: {
          id: "armorBreak",
          duration: 2,
          chance: 0.45,
          value: 0.1,
        },
      },
    }
  ),

  // East
  m25_e1: createEnemy(
    "m25_e1",
    "丹爐精",
    MajorRealm.QiRefining,
    EnemyRank.Elite,
    1900,
    210,
    130,
    ElementType.Fire,
    QI_MAGIC_SET,
    220,
    MINOR_REALM.MID,
    "爐"
  ),
  m26_e1: {
    ...createEnemy(
      "m26_e1",
      "寒冰龜",
      MajorRealm.QiRefining,
      EnemyRank.Elite,
      3200,
      150,
      180,
      ElementType.Water,
      QI_MAGIC_SET,
      350,
      MINOR_REALM.LATE,
      "龜",
      {
        aiStyle: "caster",
        attackRange: 3,
        specialAttack: {
          name: "冰甲震波",
          cooldownSeconds: 4.2,
          damageMultiplier: 1.28,
          castRange: 3,
          castTimeMs: 320,
          projectileSpeed: 9,
          statusEffect: {
            id: "freeze",
            duration: 1,
            chance: 0.3,
          },
        },
      }
    ),
  },

  // === [2] Foundation (築基) ===
  // Common Early: HP 3000, Atk 300, Def 150
  // Elite Early: HP 12000, Atk 850, Def 540

  // North
  m31_e1: createEnemy(
    "m31_e1",
    "寒冰巨人",
    MajorRealm.Foundation,
    EnemyRank.Elite,
    12000,
    850,
    540,
    ElementType.Water,
    FOUNDATION_SWORD_SET,
    1500,
    MINOR_REALM.MID,
    "巨"
  ),
  m32_e1: createEnemy(
    "m32_e1",
    "奔雷古獸",
    MajorRealm.Foundation,
    EnemyRank.Elite,
    14400,
    1200,
    630,
    ElementType.Metal,
    FOUNDATION_SWORD_SET,
    2000,
    MINOR_REALM.LATE,
    "雷"
  ),

  // West
  m41_e1: createEnemy(
    "m41_e1",
    "樹妖姥姥",
    MajorRealm.Foundation,
    EnemyRank.Elite,
    13200,
    935,
    500,
    ElementType.Wood,
    FOUNDATION_BODY_SET,
    1800,
    MINOR_REALM.MID,
    "姥"
  ),
  m42_e1: createEnemy(
    "m42_e1",
    "煉獄炎魔",
    MajorRealm.Foundation,
    EnemyRank.Elite,
    18000,
    1360,
    720,
    ElementType.Fire,
    FOUNDATION_BODY_SET,
    2500,
    MINOR_REALM.LATE,
    "炎"
  ),

  // East
  m51_e1: createEnemy(
    "m51_e1",
    "沼澤巨鱷",
    MajorRealm.Foundation,
    EnemyRank.Elite,
    14400,
    1020,
    900,
    ElementType.Water,
    FOUNDATION_MAGIC_SET,
    2000,
    MINOR_REALM.MID,
    "鱷"
  ),
  m52_e1: createEnemy(
    "m52_e1",
    "雷霆蜥蜴",
    MajorRealm.Foundation,
    EnemyRank.Elite,
    16800,
    1275,
    810,
    ElementType.Metal,
    FOUNDATION_MAGIC_SET,
    2400,
    MINOR_REALM.LATE,
    "蜥",
    {
      aiStyle: "caster",
      attackRange: 4,
      specialAttack: {
        name: "雷紋電矛",
        cooldownSeconds: 4.1,
        damageMultiplier: 1.3,
        castRange: 5,
        castTimeMs: 360,
        projectileSpeed: 12,
        statusEffect: {
          id: "paralyze",
          duration: 1,
          chance: 0.28,
        },
      },
    }
  ),

  // === [3] Golden Core (金丹) ===
  // Common Early: HP 15000, Atk 1600, Def 800
  // Elite Early: HP 60k, Atk 4750, Def 2700

  // North
  m61_e1: createEnemy(
    "m61_e1",
    "羽族戰士",
    MajorRealm.GoldenCore,
    EnemyRank.Elite,
    60000,
    4750,
    2700,
    ElementType.Metal,
    GOLDEN_CORE_SWORD_SET,
    8000,
    MINOR_REALM.MID,
    "羽"
  ),
  m62_e1: createEnemy(
    "m62_e1",
    "鐵翼鳥王",
    MajorRealm.GoldenCore,
    EnemyRank.Elite,
    72000,
    5950,
    3240,
    ElementType.Metal,
    GOLDEN_CORE_SWORD_SET,
    12000,
    MINOR_REALM.LATE,
    "鳥",
    {
      aiStyle: "ranged",
      attackRange: 3,
      specialAttack: {
        name: "裂羽風鋒",
        cooldownSeconds: 3.5,
        damageMultiplier: 1.26,
        castRange: 4,
        castTimeMs: 220,
        projectileSpeed: 16,
        areaShape: "line",
        areaRadius: 2,
        maxTargets: 3,
      },
    }
  ),
  // West
  m71_e1: createEnemy(
    "m71_e1",
    "地火龍蜥",
    MajorRealm.GoldenCore,
    EnemyRank.Elite,
    66000,
    5100,
    3600,
    ElementType.Fire,
    GOLDEN_CORE_BODY_SET,
    9000,
    MINOR_REALM.MID,
    "蜥"
  ),
  m72_e1: createEnemy(
    "m72_e1",
    "萬毒蛛后",
    MajorRealm.GoldenCore,
    EnemyRank.Elite,
    78000,
    6450,
    2880,
    ElementType.Wood,
    GOLDEN_CORE_BODY_SET,
    15000,
    MINOR_REALM.LATE,
    "蛛",
    {
      aiStyle: "caster",
      attackRange: 3,
      specialAttack: {
        name: "毒瘴蛛網",
        cooldownSeconds: 4.4,
        damageMultiplier: 1.22,
        castRange: 4,
        castTimeMs: 420,
        projectileSpeed: 10,
        areaShape: "circle",
        areaRadius: 2,
        maxTargets: 4,
        statusEffect: {
          id: "poison",
          duration: 3,
          chance: 0.5,
          value: 0.016,
        },
      },
    }
  ),
  // East
  m81_e1: createEnemy(
    "m81_e1",
    "護島神獸",
    MajorRealm.GoldenCore,
    EnemyRank.Elite,
    63000,
    5450,
    3240,
    ElementType.Water,
    GOLDEN_CORE_MAGIC_SET,
    10000,
    MINOR_REALM.MID,
    "獸",
    {
      aiStyle: "caster",
      attackRange: 4,
      specialAttack: {
        name: "海脈震流",
        cooldownSeconds: 4.2,
        damageMultiplier: 1.24,
        castRange: 5,
        castTimeMs: 380,
        projectileSpeed: 12,
        areaShape: "cone",
        areaRadius: 2,
        maxTargets: 4,
      },
    }
  ),
  m82_e1: {
    ...createEnemy(
      "m82_e1",
      "幻海魔鯨",
      MajorRealm.GoldenCore,
      EnemyRank.Elite,
      96000,
      6800,
      4500,
      ElementType.Water,
      GOLDEN_CORE_MAGIC_SET,
      20000,
      MINOR_REALM.LATE,
      "鯨",
      {
        aiStyle: "caster",
        attackRange: 4,
        specialAttack: {
          name: "幻海潮爆",
          cooldownSeconds: 5.2,
          damageMultiplier: 1.4,
          castRange: 5,
          castTimeMs: 520,
          projectileSpeed: 12,
          areaShape: "circle",
          areaRadius: 2,
          maxTargets: 4,
        },
      }
    ),
  },

  // === [4] Nascent Soul (元嬰) ===
  // Common Early: HP 80k, Atk 6k, Def 3k
  // Elite Early: HP 360k, Atk 20k, Def 10k

  // North
  m91_e1: createEnemy(
    "m91_e1",
    "虛空獵手",
    MajorRealm.NascentSoul,
    EnemyRank.Elite,
    360000,
    20500,
    10800,
    ElementType.Metal,
    NASCENT_SOUL_SWORD_SET,
    60000,
    MINOR_REALM.MID,
    "獵"
  ),
  m92_e1: createEnemy(
    "m92_e1",
    "守劍長老魂",
    MajorRealm.NascentSoul,
    EnemyRank.Elite,
    480000,
    30500,
    14400,
    ElementType.Metal,
    NASCENT_SOUL_SWORD_SET,
    80000,
    MINOR_REALM.LATE,
    "長"
  ),
  // West
  m101_e1: createEnemy(
    "m101_e1",
    "龍血戰士",
    MajorRealm.NascentSoul,
    EnemyRank.Elite,
    420000,
    25500,
    16200,
    ElementType.Fire,
    NASCENT_SOUL_BODY_SET,
    70000,
    MINOR_REALM.MID,
    "戰"
  ),
  m102_e1: createEnemy(
    "m102_e1",
    "祭司亡魂",
    MajorRealm.NascentSoul,
    EnemyRank.Elite,
    540000,
    34000,
    10800,
    ElementType.Earth,
    NASCENT_SOUL_BODY_SET,
    90000,
    MINOR_REALM.LATE,
    "祭"
  ),
  // East
  m111_e1: createEnemy(
    "m111_e1",
    "幽冥羅剎",
    MajorRealm.NascentSoul,
    EnemyRank.Elite,
    390000,
    27000,
    9000,
    ElementType.Fire,
    NASCENT_SOUL_MAGIC_SET,
    65000,
    MINOR_REALM.MID,
    "羅"
  ),
  m112_e1: {
    ...createEnemy(
    "m112_e1",
    "虛空領主",
    MajorRealm.NascentSoul,
    EnemyRank.Elite,
    600000,
    37500,
    18000,
    ElementType.Metal,
    NASCENT_SOUL_MAGIC_SET,
    100000,
    MINOR_REALM.LATE,
    "領"
    ),
    aiStyle: "caster",
    attackRange: 5,
    specialAttack: {
      name: "虛空塌陷",
      cooldownSeconds: 7,
      damageMultiplier: 1.45,
      areaShape: "circle",
      areaRadius: 2,
      maxTargets: 3,
      statusEffect: { id: "burn", duration: 2, chance: 0.35, value: 0.018 },
    },
  },

  // === [5] Spirit Severing (化神) ===
  // Common Early: HP 400k, Atk 25k, Def 12k
  // Elite: HP 1.4M, Atk 68k, Def 36k
  m120_e1: createEnemy(
    "m120_e1",
    "百戰魔傀",
    MajorRealm.SpiritSevering,
    EnemyRank.Elite,
    1440000,
    68000,
    36000,
    ElementType.Metal,
    SPIRIT_SEVERING_SET,
    200000,
    MINOR_REALM.MID,
    "傀"
  ),
  m120_e2: {
    ...createEnemy(
    "m120_e2",
    "界墟焚天使",
    MajorRealm.SpiritSevering,
    EnemyRank.Elite,
    1520000,
    71000,
    37200,
    ElementType.Fire,
    SPIRIT_SEVERING_SET,
    215000,
    MINOR_REALM.MID,
    "焚"
    ),
    aiStyle: "caster",
    attackRange: 5,
  },
  m121_e1: {
    ...createEnemy(
    "m121_e1",
    "墮落仙人",
    MajorRealm.SpiritSevering,
    EnemyRank.Elite,
    1800000,
    85000,
    45000,
    ElementType.Wood,
    SPIRIT_SEVERING_SET,
    300000,
    MINOR_REALM.LATE,
    "墮"
    ),
    specialAttack: {
      name: "血煞斬",
      cooldownSeconds: 7,
      damageMultiplier: 1.5,
      areaShape: "line",
      areaRadius: 2,
      maxTargets: 3,
      statusEffect: { id: "bleed", duration: 2, chance: 0.4, value: 0.016 },
    },
  },
  m121_e2: {
    ...createEnemy(
    "m121_e2",
    "怨天祭司",
    MajorRealm.SpiritSevering,
    EnemyRank.Elite,
    1880000,
    88000,
    46200,
    ElementType.Water,
    SPIRIT_SEVERING_SET,
    308000,
    MINOR_REALM.LATE,
    "祭"
    ),
    aiStyle: "caster",
    attackRange: 5,
    specialAttack: {
      name: "怨潮葬魂",
      cooldownSeconds: 7,
      damageMultiplier: 1.48,
      areaShape: "circle",
      areaRadius: 2,
      maxTargets: 3,
      statusEffect: { id: "freeze", duration: 1, chance: 0.32 },
    },
  },

  // === [6] Void Refining (煉虛) ===
  // Common Early: HP 2M, Atk 120k, Def 60k
  // Elite: HP 7.2M, Atk 340k, Def 180k
  m130_e1: createEnemy(
    "m130_e1",
    "歲月守衛",
    MajorRealm.VoidRefining,
    EnemyRank.Elite,
    7200000,
    340000,
    180000,
    ElementType.Metal,
    VOID_REFINING_SET,
    600000,
    MINOR_REALM.MID,
    "歲"
  ),
  m130_e2: {
    ...createEnemy(
    "m130_e2",
    "時獄觀測者",
    MajorRealm.VoidRefining,
    EnemyRank.Elite,
    7600000,
    352000,
    186000,
    ElementType.Water,
    VOID_REFINING_SET,
    620000,
    MINOR_REALM.MID,
    "觀"
    ),
    aiStyle: "ranged",
    attackRange: 5,
  },
  m131_e1: {
    ...createEnemy(
    "m131_e1",
    "虛空行者",
    MajorRealm.VoidRefining,
    EnemyRank.Elite,
    9600000,
    510000,
    270000,
    ElementType.Metal,
    VOID_REFINING_SET,
    800000,
    MINOR_REALM.LATE,
    "行"
    ),
    aiStyle: "ranged",
    attackRange: 5,
    specialAttack: {
      name: "裂空矛",
      cooldownSeconds: 6,
      damageMultiplier: 1.55,
      areaShape: "line",
      areaRadius: 2,
      maxTargets: 2,
      statusEffect: { id: "paralyze", duration: 1, chance: 0.28 },
    },
  },
  m131_e2: {
    ...createEnemy(
    "m131_e2",
    "界碑吞星魔",
    MajorRealm.VoidRefining,
    EnemyRank.Elite,
    10200000,
    525000,
    278000,
    ElementType.Earth,
    VOID_REFINING_SET,
    820000,
    MINOR_REALM.LATE,
    "碑"
    ),
    specialAttack: {
      name: "碎界落星",
      cooldownSeconds: 7,
      damageMultiplier: 1.58,
      areaShape: "circle",
      areaRadius: 2,
      maxTargets: 3,
      statusEffect: { id: "armorBreak", duration: 2, chance: 0.33, value: 0.12 },
    },
  },

  // === [7] Fusion (合體) ===
  // Common Early: HP 10M, Atk 500k, Def 250k
  // Elite: HP 36M, Atk 1.35M, Def 720k
  m140_e1: createEnemy(
    "m140_e1",
    "執法統領",
    MajorRealm.Fusion,
    EnemyRank.Elite,
    36000000,
    1350000,
    720000,
    ElementType.Metal,
    FUSION_SET,
    2000000,
    MINOR_REALM.MID,
    "統",
    {
      description: "萬法聖城的執法統領，以金令鎖殺闖入中樞的異道修士。",
      affixes: ["統御", "堅甲"],
      specialAttack: {
        name: "金律鎮殺",
        cooldownSeconds: 7,
        damageMultiplier: 1.54,
        areaShape: "line",
        areaRadius: 3,
        maxTargets: 3,
        statusEffect: { id: "bleed", duration: 2, chance: 0.34, value: 0.018 },
      },
    }
  ),
  m140_e2: {
    ...createEnemy(
    "m140_e2",
    "聖壇監軍",
    MajorRealm.Fusion,
    EnemyRank.Elite,
    37200000,
    1400000,
    735000,
    ElementType.Fire,
    FUSION_SET,
    2080000,
    MINOR_REALM.MID,
    "監"
    ),
    aiStyle: "caster",
    attackRange: 5,
    description: "聖壇監軍專職焚盡失控靈潮，擅長以祭火封場。",
    affixes: ["強襲", "統御"],
    specialAttack: {
      name: "聖壇焚界",
      cooldownSeconds: 7,
      damageMultiplier: 1.56,
      areaShape: "circle",
      areaRadius: 2,
      maxTargets: 4,
      statusEffect: { id: "burn", duration: 2, chance: 0.36, value: 0.02 },
    },
  },
  m141_e1: createEnemy(
    "m141_e1",
    "樞紐守護獸",
    MajorRealm.Fusion,
    EnemyRank.Elite,
    48000000,
    2040000,
    1080000,
    ElementType.Wood,
    FUSION_SET,
    3000000,
    MINOR_REALM.LATE,
    "守",
    {
      description: "靈界中樞孕生的守護獸，以木靈脈衍化出再生與束縛之力。",
      affixes: ["霸體", "統御"],
      specialAttack: {
        name: "樞脈絞殺",
        cooldownSeconds: 7,
        damageMultiplier: 1.58,
        areaShape: "cone",
        areaRadius: 3,
        maxTargets: 4,
        statusEffect: { id: "poison", duration: 2, chance: 0.35, value: 0.02 },
      },
    }
  ),
  m141_e2: {
    ...createEnemy(
    "m141_e2",
    "渦心鎮衛",
    MajorRealm.Fusion,
    EnemyRank.Elite,
    49500000,
    2100000,
    1110000,
    ElementType.Water,
    FUSION_SET,
    3080000,
    MINOR_REALM.LATE,
    "渦"
    ),
    aiStyle: "caster",
    attackRange: 5,
    description: "渦心鎮衛鎮壓聖城靈渦，擅長用水行法鎖住整片戰區。",
    affixes: ["統御", "迅影"],
    specialAttack: {
      name: "渦心禁界",
      cooldownSeconds: 7,
      damageMultiplier: 1.57,
      areaShape: "circle",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "freeze", duration: 1, chance: 0.34 },
    },
  },

  // === [8] Mahayana (大乘) ===
  // Common Early: HP 50M, Atk 2.5M, Def 1M
  // Elite: HP 180M, Atk 6.8M, Def 3.6M
  m150_e1: createEnemy(
    "m150_e1",
    "深海魔龍",
    MajorRealm.Mahayana,
    EnemyRank.Elite,
    180000000,
    6800000,
    3600000,
    ElementType.Water,
    MAHAYANA_SET,
    6000000,
    MINOR_REALM.MID,
    "龍"
  ),
  m150_e2: {
    ...createEnemy(
    "m150_e2",
    "潮汐司命",
    MajorRealm.Mahayana,
    EnemyRank.Elite,
    188000000,
    7050000,
    3680000,
    ElementType.Water,
    MAHAYANA_SET,
    6200000,
    MINOR_REALM.MID,
    "司"
    ),
    aiStyle: "caster",
    attackRange: 6,
  },
  m151_e1: {
    ...createEnemy(
    "m151_e1",
    "天將虛影",
    MajorRealm.Mahayana,
    EnemyRank.Elite,
    240000000,
    10200000,
    5400000,
    ElementType.Metal,
    MAHAYANA_SET,
    8000000,
    MINOR_REALM.LATE,
    "將"
    ),
    specialAttack: {
      name: "天兵鎮壓",
      cooldownSeconds: 7,
      damageMultiplier: 1.6,
      areaShape: "cone",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "armorBreak", duration: 2, chance: 0.35, value: 0.14 },
    },
  },
  m151_e2: {
    ...createEnemy(
    "m151_e2",
    "升仙鎮碑將",
    MajorRealm.Mahayana,
    EnemyRank.Elite,
    248000000,
    10600000,
    5520000,
    ElementType.Earth,
    MAHAYANA_SET,
    8200000,
    MINOR_REALM.LATE,
    "碑"
    ),
    specialAttack: {
      name: "天關壓界",
      cooldownSeconds: 7,
      damageMultiplier: 1.62,
      areaShape: "line",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "stun", duration: 1, chance: 0.24 },
    },
  },

  // === [9] Tribulation (渡劫) ===
  // Common Early: HP 250M, Atk 12M, Def 5M
  // Elite: HP 900M, Atk 34M, Def 14M
  m160_e1: createEnemy(
    "m160_e1",
    "滅世魔雷",
    MajorRealm.Tribulation,
    EnemyRank.Elite,
    900000000,
    34000000,
    14400000,
    ElementType.Fire,
    TRIBULATION_SET,
    20000000,
    MINOR_REALM.MID,
    "魔",
    {
      description: "滅世魔雷自劫雲荒原墜落而生，專吞修士護體罡氣。",
      affixes: ["強襲", "迅影"],
      specialAttack: {
        name: "滅界雷殛",
        cooldownSeconds: 7,
        damageMultiplier: 1.65,
        areaShape: "line",
        areaRadius: 3,
        maxTargets: 4,
        statusEffect: { id: "burn", duration: 2, chance: 0.38, value: 0.022 },
      },
    }
  ),
  m160_e2: {
    ...createEnemy(
    "m160_e2",
    "劫域司雷官",
    MajorRealm.Tribulation,
    EnemyRank.Elite,
    940000000,
    35200000,
    14800000,
    ElementType.Fire,
    TRIBULATION_SET,
    20800000,
    MINOR_REALM.MID,
    "司"
    ),
    aiStyle: "caster",
    attackRange: 6,
    description: "劫域司雷官奉天道巡獵，出手以雷鎖束魂。",
    affixes: ["統御", "迅影"],
    specialAttack: {
      name: "雷鏈誅命",
      cooldownSeconds: 7,
      damageMultiplier: 1.66,
      areaShape: "line",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "paralyze", duration: 1, chance: 0.35 },
    },
  },
  m161_e1: {
    ...createEnemy(
    "m161_e1",
    "雷道天尊",
    MajorRealm.Tribulation,
    EnemyRank.Elite,
    1200000000,
    51000000,
    21600000,
    ElementType.Metal,
    TRIBULATION_SET,
    30000000,
    MINOR_REALM.LATE,
    "尊"
    ),
    aiStyle: "caster",
    attackRange: 6,
    specialAttack: {
      name: "天雷法旨",
      cooldownSeconds: 7,
      damageMultiplier: 1.7,
      areaShape: "circle",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "paralyze", duration: 1, chance: 0.38 },
    },
  },
  m161_e2: {
    ...createEnemy(
    "m161_e2",
    "天劫巡界尊",
    MajorRealm.Tribulation,
    EnemyRank.Elite,
    1240000000,
    52800000,
    22000000,
    ElementType.Metal,
    TRIBULATION_SET,
    30800000,
    MINOR_REALM.LATE,
    "巡"
    ),
    aiStyle: "caster",
    attackRange: 6,
    description: "天劫巡界尊負責在雷池邊界肅清逆命者，以天規封鎖行動。",
    affixes: ["霸體", "統御"],
    specialAttack: {
      name: "巡界雷牢",
      cooldownSeconds: 7,
      damageMultiplier: 1.72,
      areaShape: "circle",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "stun", duration: 1, chance: 0.26 },
    },
  },

  // === [10] Immortal (仙人) ===
  // Common: HP 1B, Atk 60M, Def 20M
  // Elite: HP 3.6B, Atk 170M, Def 72M
  m170_e1: createEnemy(
    "m170_e1",
    "巡天仙吏",
    MajorRealm.Immortal,
    EnemyRank.Elite,
    3600000000,
    170000000,
    72000000,
    ElementType.Metal,
    IMMORTAL_SET,
    100000000,
    MINOR_REALM.MID,
    "吏",
    {
      description: "巡天仙吏負責清點下界飛昇者，以金書天條裁定生死。",
      affixes: ["統御", "堅甲"],
      specialAttack: {
        name: "天條裁形",
        cooldownSeconds: 8,
        damageMultiplier: 1.7,
        areaShape: "line",
        areaRadius: 3,
        maxTargets: 4,
        statusEffect: { id: "armorBreak", duration: 2, chance: 0.36, value: 0.16 },
      },
    }
  ),
  m170_e2: {
    ...createEnemy(
    "m170_e2",
    "巡天錄事",
    MajorRealm.Immortal,
    EnemyRank.Elite,
    3720000000,
    176000000,
    73600000,
    ElementType.Wood,
    IMMORTAL_SET,
    104000000,
    MINOR_REALM.MID,
    "錄"
    ),
    aiStyle: "caster",
    attackRange: 6,
    description: "巡天錄事記錄萬靈功過，以木冊符印困鎖真元。",
    affixes: ["統御", "噬生"],
    specialAttack: {
      name: "青冊封元",
      cooldownSeconds: 8,
      damageMultiplier: 1.68,
      areaShape: "cone",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "poison", duration: 2, chance: 0.34, value: 0.021 },
    },
  },
  m171_e1: createEnemy(
    "m171_e1",
    "鎮天神將",
    MajorRealm.Immortal,
    EnemyRank.Elite,
    6000000000,
    340000000,
    144000000,
    ElementType.Metal,
    IMMORTAL_SET,
    150000000,
    MINOR_REALM.LATE,
    "將",
    {
      description: "鎮天神將駐守九重天闕，以重兵鎮壓未受敕封的來者。",
      affixes: ["霸體", "統御"],
      specialAttack: {
        name: "天闕重鎮",
        cooldownSeconds: 8,
        damageMultiplier: 1.74,
        areaShape: "cone",
        areaRadius: 3,
        maxTargets: 4,
        statusEffect: { id: "stun", duration: 1, chance: 0.28 },
      },
    }
  ),
  m171_e2: {
    ...createEnemy(
    "m171_e2",
    "玉京誅邪使",
    MajorRealm.Immortal,
    EnemyRank.Elite,
    6150000000,
    352000000,
    148000000,
    ElementType.Fire,
    IMMORTAL_SET,
    155000000,
    MINOR_REALM.LATE,
    "誅"
    ),
    aiStyle: "caster",
    attackRange: 6,
    description: "玉京誅邪使專獵邪祟與叛仙，以天火與仙律同時焚滅。",
    affixes: ["強襲", "統御"],
    specialAttack: {
      name: "玉京天誅",
      cooldownSeconds: 8,
      damageMultiplier: 1.76,
      areaShape: "circle",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "burn", duration: 2, chance: 0.38, value: 0.022 },
    },
  },

  // === [11] Immortal Emperor (仙帝) ===
  // Elite: HP 36B, Atk 1.7B, Def 720M
  m180_e1: {
    ...createEnemy(
    "m180_e1",
    "守道者",
    MajorRealm.ImmortalEmperor,
    EnemyRank.Elite,
    36000000000,
    1700000000,
    720000000,
    ElementType.Metal,
    IMMORTAL_EMPEROR_SET,
    1000000000,
    MINOR_REALM.MID,
    "守"
    ),
    specialAttack: {
      name: "道律封鎖",
      cooldownSeconds: 8,
      damageMultiplier: 1.75,
      areaShape: "circle",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "armorBreak", duration: 2, chance: 0.42, value: 0.18 },
    },
    description: "守道者鎮守道宮外環，以道律剪斷一切未證本源者的護體。",
    affixes: ["霸體", "統御", "堅甲"],
  },
  m180_e2: {
    ...createEnemy(
    "m180_e2",
    "混元監道官",
    MajorRealm.ImmortalEmperor,
    EnemyRank.Elite,
    38200000000,
    1760000000,
    745000000,
    ElementType.Fire,
    IMMORTAL_EMPEROR_SET,
    1050000000,
    MINOR_REALM.LATE,
    "監"
    ),
    aiStyle: "caster",
    attackRange: 7,
    description: "混元監道官執掌火律與審判，專責焚滅越界問道者。",
    affixes: ["統御", "迅影", "強襲"],
    specialAttack: {
      name: "道火裁決",
      cooldownSeconds: 8,
      damageMultiplier: 1.78,
      areaShape: "circle",
      areaRadius: 3,
      maxTargets: 4,
      statusEffect: { id: "burn", duration: 2, chance: 0.4, value: 0.02 },
    },
  },
};

const ELITE_SKILL_DROPS: Record<string, string[]> = {
  m5_e1: [getSkillManualId("s_q_passive")],
  m7_e1: [getSkillManualId("s_q_passive")],
  m15_e1: [getSkillManualId("b_q_passive")],
  m16_e1: [getSkillManualId("b_q_passive")],
  m25_e1: [getSkillManualId("m_q_passive")],
  m26_e1: [getSkillManualId("m_q_passive")],

  m31_e1: [getSkillManualId("s_f_passive")],
  m32_e1: [getSkillManualId("s_f_passive")],
  m41_e1: [getSkillManualId("b_f_passive")],
  m42_e1: [getSkillManualId("b_f_passive")],
  m51_e1: [getSkillManualId("m_f_passive")],
  m52_e1: [getSkillManualId("m_f_passive")],

  m61_e1: [getSkillManualId("s_g_passive")],
  m62_e1: [getSkillManualId("s_g_passive")],
  m71_e1: [getSkillManualId("b_g_passive")],
  m72_e1: [getSkillManualId("b_g_passive")],
  m81_e1: [getSkillManualId("m_g_passive")],
  m82_e1: [getSkillManualId("m_g_passive")],

  m91_e1: [getSkillManualId("s_n_passive")],
  m92_e1: [getSkillManualId("s_n_passive")],
  m101_e1: [getSkillManualId("b_n_passive")],
  m102_e1: [getSkillManualId("b_n_passive")],
  m111_e1: [getSkillManualId("m_n_passive")],
  m112_e1: [getSkillManualId("m_n_passive")],

};

const getEliteManualDropsForRealm = (realm: MajorRealm) =>
  getFormalCoreSkillsByRealm(realm)
    .filter((skill) => skill.formalSourceTier === "elite")
    .map((skill) => getSkillManualId(skill.id));

[
  ["m120_e1", MajorRealm.SpiritSevering],
  ["m120_e2", MajorRealm.SpiritSevering],
  ["m121_e1", MajorRealm.SpiritSevering],
  ["m121_e2", MajorRealm.SpiritSevering],
  ["m130_e1", MajorRealm.VoidRefining],
  ["m130_e2", MajorRealm.VoidRefining],
  ["m131_e1", MajorRealm.VoidRefining],
  ["m131_e2", MajorRealm.VoidRefining],
  ["m140_e1", MajorRealm.Fusion],
  ["m140_e2", MajorRealm.Fusion],
  ["m141_e1", MajorRealm.Fusion],
  ["m141_e2", MajorRealm.Fusion],
  ["m150_e1", MajorRealm.Mahayana],
  ["m150_e2", MajorRealm.Mahayana],
  ["m151_e1", MajorRealm.Mahayana],
  ["m151_e2", MajorRealm.Mahayana],
  ["m160_e1", MajorRealm.Tribulation],
  ["m160_e2", MajorRealm.Tribulation],
  ["m161_e1", MajorRealm.Tribulation],
  ["m161_e2", MajorRealm.Tribulation],
  ["m170_e1", MajorRealm.Immortal],
  ["m170_e2", MajorRealm.Immortal],
  ["m171_e1", MajorRealm.Immortal],
  ["m171_e2", MajorRealm.Immortal],
  ["m180_e1", MajorRealm.ImmortalEmperor],
  ["m180_e2", MajorRealm.ImmortalEmperor],
].forEach(([enemyId, realm]) => {
  ELITE_SKILL_DROPS[enemyId] = getEliteManualDropsForRealm(realm as MajorRealm);
});

Object.entries(ELITE_SKILL_DROPS).forEach(([enemyId, manuals]) => {
  const enemy = ELITE_ENEMIES[enemyId];
  if (!enemy) return;
  enemy.drops = [...enemy.drops, ...manuals];
});
