import { MajorRealm, ElementType, Enemy, EnemyRank } from "../../types";
import { createEnemy } from "./utils";
import { MINOR_REALM } from "../../constants";

// Boss Stats Logic
// Target: requires High-Grade gear of current realm (Full Set upgraded ideally).
// Stats: ~5-10x Common HP, ~1.5x Elite Atk.

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

export const BOSS_ENEMIES: Record<string, Enemy> = {
  // === [0] Mortal (凡人) ===
  // North
  // North
  m3_b1: createEnemy(
    "m3_b1",
    "守山靈虎",
    MajorRealm.Mortal,
    EnemyRank.Boss,
    1800,
    85,
    50,
    ElementType.Metal,
    [...MO_SET, "bt_mortal_qi"],
    150,
    MINOR_REALM.PEAK,
    "虎"
  ),
  // West
  m12_b1: createEnemy(
    "m12_b1",
    "赤火猿",
    MajorRealm.Mortal,
    EnemyRank.Boss,
    1500,
    90,
    45,
    ElementType.Fire,
    [...MO_SET, "bt_mortal_qi"],
    180,
    MINOR_REALM.PEAK,
    "猿"
  ),
  // East
  m22_b1: createEnemy(
    "m22_b1",
    "靈湖巨蟹",
    MajorRealm.Mortal,
    EnemyRank.Boss,
    2200,
    75,
    55,
    ElementType.Water,
    [...MO_SET, "bt_mortal_qi"],
    200,
    MINOR_REALM.PEAK,
    "蟹"
  ),

  // === [1] Qi Refining (練氣) ===
  // Common Early: HP 500, Atk 50
  // Elite Early: HP 1600, Atk 90
  // Boss Target: Peak Qi Stats (Atk 250, HP 2000+)
  // Boss Stats: HP 4800+, Atk 300+, Def 120+

  // North
  // North
  m7_b1: createEnemy(
    "m7_b1",
    "萬劍劍意",
    MajorRealm.QiRefining,
    EnemyRank.Boss,
    5800,
    300,
    130,
    ElementType.Metal,
    [...QI_SWORD_SET, "bt_qi_foundation"],
    1000,
    MINOR_REALM.PEAK,
    "劍"
  ),
  // West
  m16_b1: createEnemy(
    "m16_b1",
    "萬獸獸王",
    MajorRealm.QiRefining,
    EnemyRank.Boss,
    6200,
    290,
    140,
    ElementType.Earth,
    [...QI_BODY_SET, "bt_qi_foundation"],
    1000,
    MINOR_REALM.PEAK,
    "王"
  ),
  // East
  m26_b1: createEnemy(
    "m26_b1",
    "靈湖水蛟",
    MajorRealm.QiRefining,
    EnemyRank.Boss,
    4200,
    350,
    130,
    ElementType.Water,
    [...QI_MAGIC_SET, "bt_qi_foundation"],
    1000,
    MINOR_REALM.PEAK,
    "蛟"
  ),

  // === [2] Foundation (築基) ===
  // Elite: HP 12k, Atk 850
  // Boss: HP 72k, Atk 1800, Def 900
  // Boss: HP 72k, Atk 1800, Def 900
  m32_b1: createEnemy(
    "m32_b1",
    "極地劍靈",
    MajorRealm.Foundation,
    EnemyRank.Boss,
    72000,
    1870,
    900,
    ElementType.Metal,
    [...FOUNDATION_SET, "bt_foundation_gold"],
    5000,
    MINOR_REALM.PEAK,
    "靈"
  ),
  m42_b1: createEnemy(
    "m42_b1",
    "烈焰妖王",
    MajorRealm.Foundation,
    EnemyRank.Boss,
    84000,
    2125,
    1080,
    ElementType.Fire,
    [...FOUNDATION_SET, "bt_foundation_gold"],
    5000,
    MINOR_REALM.PEAK,
    "妖"
  ),
  m52_b1: createEnemy(
    "m52_b1",
    "雷澤領主",
    MajorRealm.Foundation,
    EnemyRank.Boss,
    78000,
    2000,
    990,
    ElementType.Metal,
    [...FOUNDATION_SET, "bt_foundation_gold"],
    5000,
    MINOR_REALM.PEAK,
    "雷"
  ),

  // === [3] Golden Core (金丹) ===
  // Elite: HP 60k, Atk 4750
  // Boss: HP 300k, Atk 8000, Def 4000
  // Boss: HP 300k, Atk 8000, Def 4000
  m62_b1: createEnemy(
    "m62_b1",
    "金翅大鵬",
    MajorRealm.GoldenCore,
    EnemyRank.Boss,
    300000,
    8075,
    4050,
    ElementType.Metal,
    [...GOLDEN_CORE_SET, "bt_gold_nascent"],
    20000,
    MINOR_REALM.PEAK,
    "鵬"
  ),
  m72_b1: createEnemy(
    "m72_b1",
    "厄難毒體",
    MajorRealm.GoldenCore,
    EnemyRank.Boss,
    360000,
    7480,
    4500,
    ElementType.Wood,
    [...GOLDEN_CORE_SET, "bt_gold_nascent"],
    20000,
    MINOR_REALM.PEAK,
    "厄"
  ),
  m82_b1: createEnemy(
    "m82_b1",
    "覆海蛟龍",
    MajorRealm.GoldenCore,
    EnemyRank.Boss,
    420000,
    8925,
    4500,
    ElementType.Water,
    [...GOLDEN_CORE_SET, "bt_gold_nascent"],
    20000,
    MINOR_REALM.PEAK,
    "蛟"
  ),

  // === [4] Nascent Soul (元嬰) ===
  // Elite: HP 360k, Atk 20k
  // Boss: HP 1.5M, Atk 38k, Def 18k
  // Boss: HP 1.5M, Atk 38k, Def 18k
  m92_b1: createEnemy(
    "m92_b1",
    "北寒劍尊",
    MajorRealm.NascentSoul,
    EnemyRank.Boss,
    1500000,
    38250,
    18000,
    ElementType.Metal,
    [...NASCENT_SOUL_SET, "bt_nascent_spirit"],
    100000,
    MINOR_REALM.PEAK,
    "寒"
  ),
  m102_b1: createEnemy(
    "m102_b1",
    "刑天殘軀",
    MajorRealm.NascentSoul,
    EnemyRank.Boss,
    1800000,
    34000,
    22500,
    ElementType.Earth,
    [...NASCENT_SOUL_SET, "bt_nascent_spirit"],
    100000,
    MINOR_REALM.PEAK,
    "刑"
  ),
  m112_b1: createEnemy(
    "m112_b1",
    "九幽鬼帝",
    MajorRealm.NascentSoul,
    EnemyRank.Boss,
    1680000,
    42500,
    16200,
    ElementType.Fire,
    [...NASCENT_SOUL_SET, "bt_nascent_spirit"],
    100000,
    MINOR_REALM.PEAK,
    "帝"
  ),

  // === [5] Spirit Severing (化神) ===
  // Elite: HP 1.4M, Atk 68k
  // Boss: HP 5.4M, Atk 127k, Def 72k
  // Boss: HP 5.4M, Atk 127k, Def 72k
  m121_b1: createEnemy(
    "m121_b1",
    "修羅魔尊",
    MajorRealm.SpiritSevering,
    EnemyRank.Boss,
    5400000,
    127500,
    72000,
    ElementType.Fire,
    [...SPIRIT_SEVERING_SET, "bt_spirit_void"],
    500000,
    MINOR_REALM.PEAK,
    "尊"
  ),

  // === [6] Void Refining (煉虛) ===
  // Elite: HP 7.2M, Atk 340k
  // Boss: HP 21.6M, Atk 637k, Def 360k
  // Boss: HP 21.6M, Atk 637k, Def 360k
  m131_b1: createEnemy(
    "m131_b1",
    "時空之主",
    MajorRealm.VoidRefining,
    EnemyRank.Boss,
    21600000,
    637500,
    360000,
    ElementType.Metal,
    [...VOID_REFINING_SET, "bt_void_fusion"],
    1500000,
    MINOR_REALM.PEAK,
    "主"
  ),

  // === [7] Fusion (合體) ===
  // Elite: HP 36M, Atk 1.35M
  // Boss: HP 120M, Atk 2.55M, Def 1.44M
  // Boss: HP 120M, Atk 2.55M, Def 1.44M
  m141_b1: createEnemy(
    "m141_b1",
    "靈皇",
    MajorRealm.Fusion,
    EnemyRank.Boss,
    120000000,
    2550000,
    1440000,
    ElementType.Wood,
    [...FUSION_SET, "bt_fusion_maha"],
    5000000,
    MINOR_REALM.PEAK,
    "皇"
  ),

  // === [8] Mahayana (大乘) ===
  // Elite: HP 180M, Atk 6.8M
  // Boss: HP 600M, Atk 12.75M, Def 7.2M
  // Boss: HP 600M, Atk 12.75M, Def 7.2M
  m151_b1: createEnemy(
    "m151_b1",
    "守界者",
    MajorRealm.Mahayana,
    EnemyRank.Boss,
    600000000,
    12750000,
    7200000,
    ElementType.Metal,
    [...MAHAYANA_SET, "bt_maha_trib"],
    15000000,
    MINOR_REALM.PEAK,
    "守"
  ),

  // === [9] Tribulation (渡劫) ===
  // Elite: HP 900M, Atk 34M
  // Boss: HP 3B, Atk 63.75M, Def 28.8M
  // Boss: HP 3B, Atk 63.75M, Def 28.8M
  m161_b1: createEnemy(
    "m161_b1",
    "天道化身",
    MajorRealm.Tribulation,
    EnemyRank.Boss,
    3000000000,
    63750000,
    28800000,
    ElementType.Metal,
    [...TRIBULATION_SET, "bt_trib_immortal"],
    50000000,
    MINOR_REALM.PEAK,
    "天"
  ),

  // === [10] Immortal (仙人) ===
  // Elite: HP 3.6B, Atk 170M
  // Boss: HP 12B, Atk 425M, Def 180M
  // Boss: HP 12B, Atk 425M, Def 180M
  m171_b1: createEnemy(
    "m171_b1",
    "九天仙尊",
    MajorRealm.Immortal,
    EnemyRank.Boss,
    12000000000,
    425000000,
    180000000,
    ElementType.Metal,
    [...IMMORTAL_SET, "bt_immortal_emperor"],
    200000000,
    MINOR_REALM.PEAK,
    "尊"
  ),

  // === [11] Immortal Emperor (仙帝) ===
  // Elite: HP 36B, Atk 1.7B
  // Boss: HP 120B, Atk 8.5B, Def 1.8B
  m180_b1: createEnemy(
    "m180_b1",
    "鴻蒙道祖",
    MajorRealm.ImmortalEmperor,
    EnemyRank.Boss,
    120000000000,
    8500000000,
    1800000000,
    ElementType.Metal,
    IMMORTAL_EMPEROR_SET,
    2000000000,
    MINOR_REALM.PEAK,
    "祖"
  ),
};
