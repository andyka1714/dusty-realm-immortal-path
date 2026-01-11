
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';
import { MINOR_REALM } from '../../constants';

// Scaling Factor Base
// Mortal: 1x
// Qi: 2x
// Foundation: 10x
// GC: 50x
// NS: 200x
// SS: 1000x
// VR: 5000x
// Fusion: 25000x
// Mahayana: 100000x
// Tribulation: 500000x
// Immortal: 1000000x
// Emperor: 10000000x

export const COMMON_ENEMIES: Record<string, Enemy> = {
    // === [0] Mortal (凡人) ===
    // Target: Beatable by Mortal Gear (Atk 12, Def 6, HP 130)
    // Stats: Min 250 HP, 30 Atk, 10 Def
    'm1_c1': createEnemy('m1_c1', '荒徑野狗', MajorRealm.Mortal, EnemyRank.Common, 250, 30, 10, ElementType.None, ['straw_sandals', 'wooden_charm'], 10, MINOR_REALM.INITIAL, '狗'),
    'm1_c2': createEnemy('m1_c2', '攔路劫匪', MajorRealm.Mortal, EnemyRank.Common, 280, 32, 12, ElementType.None, ['novice_sword', 'straw_hat'], 15, MINOR_REALM.INITIAL, '匪'),
    'm2_c1': createEnemy('m2_c1', '古道劍客', MajorRealm.Mortal, EnemyRank.Common, 300, 35, 15, ElementType.Metal, ['novice_robe', 'wooden_shield'], 20, MINOR_REALM.MID, '劍'),
    'm2_c2': createEnemy('m2_c2', '石壁壁虎', MajorRealm.Mortal, EnemyRank.Common, 320, 38, 18, ElementType.Earth, ['straw_hat', 'wooden_charm'], 18, MINOR_REALM.MID, '虎'),
    'm3_c1': createEnemy('m3_c1', '巡山道童', MajorRealm.Mortal, EnemyRank.Common, 350, 40, 20, ElementType.Wood, ['novice_sword', 'straw_sandals'], 25, MINOR_REALM.LATE, '童'),
    'm3_c2': createEnemy('m3_c2', '山腳巨熊', MajorRealm.Mortal, EnemyRank.Common, 380, 42, 22, ElementType.Earth, ['wooden_shield', 'novice_robe'], 30, MINOR_REALM.LATE, '熊'),
    
    // West
    'm10_c1': createEnemy('m10_c1', '密林野豬', MajorRealm.Mortal, EnemyRank.Common, 260, 30, 12, ElementType.Earth, ['straw_sandals', 'wooden_shield'], 15, MINOR_REALM.INITIAL, '豬'),
    'm10_c2': createEnemy('m10_c2', '樹梢毒蛇', MajorRealm.Mortal, EnemyRank.Common, 240, 35, 8, ElementType.Wood, ['wooden_charm', 'straw_hat'], 18, MINOR_REALM.INITIAL, '蛇'),
    'm11_c1': createEnemy('m11_c1', '蠻荒獵手', MajorRealm.Mortal, EnemyRank.Common, 310, 35, 15, ElementType.None, ['novice_sword', 'novice_robe'], 20, MINOR_REALM.MID, '獵'),
    'm11_c2': createEnemy('m11_c2', '硬皮犀牛', MajorRealm.Mortal, EnemyRank.Common, 330, 32, 25, ElementType.Earth, ['wooden_shield', 'straw_sandals'], 22, MINOR_REALM.MID, '犀'),
    'm12_c1': createEnemy('m12_c1', '谷口守衛', MajorRealm.Mortal, EnemyRank.Common, 360, 38, 20, ElementType.None, ['wooden_charm', 'novice_sword'], 28, MINOR_REALM.LATE, '衛'),
    'm12_c2': createEnemy('m12_c2', '嗜血蝙蝠', MajorRealm.Mortal, EnemyRank.Common, 300, 45, 10, ElementType.Fire, ['straw_hat', 'novice_robe'], 25, MINOR_REALM.LATE, '蝠'),
    
    // East
    'm20_c1': createEnemy('m20_c1', '田間稻草人', MajorRealm.Mortal, EnemyRank.Common, 250, 28, 10, ElementType.Wood, ['straw_hat', 'wooden_charm'], 12, MINOR_REALM.INITIAL, '草'),
    'm20_c2': createEnemy('m20_c2', '偷糧碩鼠', MajorRealm.Mortal, EnemyRank.Common, 220, 32, 8, ElementType.Earth, ['straw_sandals', 'wooden_shield'], 15, MINOR_REALM.INITIAL, '鼠'),
    'm21_c1': createEnemy('m21_c1', '迷霧幻影', MajorRealm.Mortal, EnemyRank.Common, 280, 38, 5, ElementType.Water, ['novice_robe', 'novice_sword'], 20, MINOR_REALM.MID, '影'),
    'm21_c2': createEnemy('m21_c2', '沼澤水蛭', MajorRealm.Mortal, EnemyRank.Common, 300, 35, 12, ElementType.Water, ['wooden_shield', 'straw_hat'], 18, MINOR_REALM.MID, '蛭'),
    'm22_c1': createEnemy('m22_c1', '湖畔水怪', MajorRealm.Mortal, EnemyRank.Common, 360, 35, 20, ElementType.Water, ['novice_sword', 'straw_sandals'], 25, MINOR_REALM.LATE, '怪'),
    'm22_c2': createEnemy('m22_c2', '草甸餓狼', MajorRealm.Mortal, EnemyRank.Common, 340, 40, 15, ElementType.Wood, ['wooden_charm', 'novice_robe'], 28, MINOR_REALM.LATE, '狼'),

    // === [1] Qi Refining (練氣) ===
    // Early (Map 5, 14, 24): Target Mortal Gear (Atk 20, Def 17, HP 130) -> Monster: HP 500, Atk 50, Def 25
    // Mid (Map 6, 15, 25): Target Qi Low Gear (Atk 80, Def 50, HP 800) -> Monster: HP 800, Atk 75, Def 40
    // Late (Map 7, 16, 26): Target Qi Mid Gear -> Monster: HP 1200, Atk 120, Def 60

    // North
    'm5_c1': createEnemy('m5_c1', '劍木樁妖', MajorRealm.QiRefining, EnemyRank.Common, 500, 50, 25, ElementType.Wood, ['spirit_iron_sword', 'sword_tassel'], 50, MINOR_REALM.INITIAL, '樁'),
    'm5_c2': createEnemy('m5_c2', '遊蕩劍魂', MajorRealm.QiRefining, EnemyRank.Common, 480, 60, 20, ElementType.Metal, ['focus_headband', 'azure_robe'], 55, MINOR_REALM.INITIAL, '魂'),
    'm6_c1': createEnemy('m6_c1', '鏽劍甲蟲', MajorRealm.QiRefining, EnemyRank.Common, 800, 75, 45, ElementType.Earth, ['light_boots', 'whetstone_ring'], 80, MINOR_REALM.MID, '蟲'),
    'm6_c2': createEnemy('m6_c2', '斷刃狼', MajorRealm.QiRefining, EnemyRank.Common, 750, 90, 35, ElementType.Metal, ['spirit_iron_sword', 'focus_headband'], 85, MINOR_REALM.MID, '狼'),
    'm7_c1': createEnemy('m7_c1', '劍煞邪靈', MajorRealm.QiRefining, EnemyRank.Common, 1200, 120, 60, ElementType.Metal, ['azure_robe', 'light_boots'], 120, MINOR_REALM.LATE, '靈'),
    // West
    'm14_c1': createEnemy('m14_c1', '赤血水怪', MajorRealm.QiRefining, EnemyRank.Common, 550, 45, 30, ElementType.Water, ['bear_paw_gauntlet', 'heavy_iron_shield'], 50, MINOR_REALM.INITIAL, '怪'),
    'm14_c2': createEnemy('m14_c2', '蠻力巨猿', MajorRealm.QiRefining, EnemyRank.Common, 600, 40, 40, ElementType.Earth, ['wolf_skull_helm', 'boar_skin_armor'], 55, MINOR_REALM.INITIAL, '猿'),
    'm15_c1': createEnemy('m15_c1', '鐵皮野豬', MajorRealm.QiRefining, EnemyRank.Common, 900, 65, 60, ElementType.Earth, ['battle_boots', 'vitality_beads'], 80, MINOR_REALM.MID, '豬'),
    'm15_c2': createEnemy('m15_c2', '疾風豹', MajorRealm.QiRefining, EnemyRank.Common, 700, 95, 35, ElementType.Wood, ['bear_paw_gauntlet', 'boar_skin_armor'], 85, MINOR_REALM.MID, '豹'),
    'm16_c1': createEnemy('m16_c1', '獅蠍獸', MajorRealm.QiRefining, EnemyRank.Common, 1300, 130, 70, ElementType.Fire, ['heavy_iron_shield', 'wolf_skull_helm'], 120, MINOR_REALM.LATE, '蠍'),
    // East
    'm24_c1': createEnemy('m24_c1', '幻影靈貓', MajorRealm.QiRefining, EnemyRank.Common, 450, 55, 20, ElementType.Wood, ['spirit_wood_staff', 'spirit_orb'], 50, MINOR_REALM.INITIAL, '貓'),
    'm24_c2': createEnemy('m24_c2', '符紙人', MajorRealm.QiRefining, EnemyRank.Common, 400, 65, 15, ElementType.Fire, ['mystic_crown', 'taoist_vestment'], 55, MINOR_REALM.INITIAL, '紙'),
    'm25_c1': createEnemy('m25_c1', '食藥鼠', MajorRealm.QiRefining, EnemyRank.Common, 750, 75, 40, ElementType.Earth, ['cloud_step_shoes', 'elemental_ring'], 80, MINOR_REALM.MID, '鼠'),
    'm25_c2': createEnemy('m25_c2', '毒荊棘妖', MajorRealm.QiRefining, EnemyRank.Common, 850, 80, 50, ElementType.Wood, ['spirit_wood_staff', 'mystic_crown'], 85, MINOR_REALM.MID, '棘'),
    'm26_c1': createEnemy('m26_c1', '靈水蟒', MajorRealm.QiRefining, EnemyRank.Common, 1400, 115, 65, ElementType.Water, ['spirit_orb', 'taoist_vestment'], 120, MINOR_REALM.LATE, '蟒'),

    // === [2] Foundation (築基) ===
    // Stats Ref: Base HP 1300. Gear + Breakthrought ~ 4000-5000 HP. Atk ~400-500.
    // Early Monster: HP 3000, Atk 300->450, Def 150
    // Mid Monster: HP 5000, Atk 450->675, Def 250
    // Late Monster: HP 8000, Atk 600->900, Def 400

    // North
    'm30_c1': createEnemy('m30_c1', '雪原白狼', MajorRealm.Foundation, EnemyRank.Common, 4500, 450, 220, ElementType.Water, [], 500, MINOR_REALM.INITIAL, '狼'),
    'm30_c2': createEnemy('m30_c2', '冰晶蟲', MajorRealm.Foundation, EnemyRank.Common, 3800, 480, 280, ElementType.Water, [], 520, MINOR_REALM.INITIAL, '蟲'),
    'm31_c1': createEnemy('m31_c1', '冰封屍傀', MajorRealm.Foundation, EnemyRank.Common, 7500, 675, 380, ElementType.Water, [], 800, MINOR_REALM.MID, '屍'),
    'm32_c1': createEnemy('m32_c1', '雷鳥', MajorRealm.Foundation, EnemyRank.Common, 10500, 975, 450, ElementType.Metal, [], 1200, MINOR_REALM.LATE, '鳥'),
    'm32_c2': createEnemy('m32_c2', '引雷石像', MajorRealm.Foundation, EnemyRank.Common, 13500, 750, 750, ElementType.Earth, [], 1250, MINOR_REALM.LATE, '像'),
    
    // West
    'm40_c1': createEnemy('m40_c1', '腐化鬣狗', MajorRealm.Foundation, EnemyRank.Common, 4800, 465, 210, ElementType.Earth, [], 500, MINOR_REALM.INITIAL, '狗'),
    'm40_c2': createEnemy('m40_c2', '嗜血蝠群', MajorRealm.Foundation, EnemyRank.Common, 4200, 495, 180, ElementType.Fire, [], 520, MINOR_REALM.INITIAL, '蝠'),
    'm41_c1': createEnemy('m41_c1', '鬼面蜘蛛', MajorRealm.Foundation, EnemyRank.Common, 8000, 660, 400, ElementType.Wood, [], 800, MINOR_REALM.MID, '蛛'),
    'm42_c1': createEnemy('m42_c1', '火蜥蜴', MajorRealm.Foundation, EnemyRank.Common, 12000, 930, 500, ElementType.Fire, [], 1200, MINOR_REALM.LATE, '蜥'),
    'm42_c2': createEnemy('m42_c2', '熔岩石頭人', MajorRealm.Foundation, EnemyRank.Common, 15000, 825, 900, ElementType.Earth, [], 1250, MINOR_REALM.LATE, '石'),

    // East
    'm50_c1': createEnemy('m50_c1', '影豹', MajorRealm.Foundation, EnemyRank.Common, 4400, 525, 200, ElementType.Wood, [], 500, MINOR_REALM.INITIAL, '豹'),
    'm50_c2': createEnemy('m50_c2', '吸血蚊', MajorRealm.Foundation, EnemyRank.Common, 3000, 600, 150, ElementType.Wood, [], 520, MINOR_REALM.INITIAL, '蚊'),
    'm51_c1': createEnemy('m51_c1', '劇毒蟾蜍', MajorRealm.Foundation, EnemyRank.Common, 8500, 630, 420, ElementType.Water, [], 800, MINOR_REALM.MID, '蟾'),
    'm52_c1': createEnemy('m52_c1', '雷澤水妖', MajorRealm.Foundation, EnemyRank.Common, 11000, 945, 550, ElementType.Water, [], 1200, MINOR_REALM.LATE, '妖'),
    'm52_c2': createEnemy('m52_c2', '電鰻妖', MajorRealm.Foundation, EnemyRank.Common, 9800, 1050, 450, ElementType.Metal, [], 1250, MINOR_REALM.LATE, '鰻'),

    // === [3] Golden Core (金丹) ===
    // Player Stats: HP ~20k, Atk ~2000
    // Early: HP 15k, Atk 1500->2250, Def 800
    // Late: HP 40k, Atk 3000->4500, Def 1500

    // North
    'm60_c1': createEnemy('m60_c1', '罡風鷹', MajorRealm.GoldenCore, EnemyRank.Common, 22500, 2400, 1200, ElementType.Metal, [], 3000, MINOR_REALM.INITIAL, '鷹'),
    'm60_c2': createEnemy('m60_c2', '風元素', MajorRealm.GoldenCore, EnemyRank.Common, 27000, 2250, 1500, ElementType.Wood, [], 3200, MINOR_REALM.INITIAL, '風'),
    'm61_c1': createEnemy('m61_c1', '羽族斥候', MajorRealm.GoldenCore, EnemyRank.Common, 37500, 3300, 1800, ElementType.Metal, [], 5000, MINOR_REALM.MID, '候'),
    'm62_c1': createEnemy('m62_c1', '鎖鏈怨靈', MajorRealm.GoldenCore, EnemyRank.Common, 60000, 4500, 2250, ElementType.Metal, [], 8000, MINOR_REALM.LATE, '靈'),
    // West
    'm70_c1': createEnemy('m70_c1', '岩石傀儡', MajorRealm.GoldenCore, EnemyRank.Common, 30000, 2100, 1800, ElementType.Earth, [], 3000, MINOR_REALM.INITIAL, '傀'),
    'm70_c2': createEnemy('m70_c2', '黑山甲獸', MajorRealm.GoldenCore, EnemyRank.Common, 27000, 2250, 2250, ElementType.Earth, [], 3200, MINOR_REALM.INITIAL, '甲'),
    'm71_c1': createEnemy('m71_c1', '熔岩魔人', MajorRealm.GoldenCore, EnemyRank.Common, 42000, 3150, 1950, ElementType.Fire, [], 5000, MINOR_REALM.MID, '魔'),
    'm72_c1': createEnemy('m72_c1', '五毒獸', MajorRealm.GoldenCore, EnemyRank.Common, 67500, 4200, 2400, ElementType.Wood, [], 8000, MINOR_REALM.LATE, '毒'),
    // East
    'm80_c1': createEnemy('m80_c1', '巡海夜叉', MajorRealm.GoldenCore, EnemyRank.Common, 24000, 2325, 1350, ElementType.Water, [], 3000, MINOR_REALM.INITIAL, '叉'),
    'm80_c2': createEnemy('m80_c2', '風暴水母', MajorRealm.GoldenCore, EnemyRank.Common, 21000, 2550, 1050, ElementType.Water, [], 3200, MINOR_REALM.INITIAL, '母'),
    'm81_c1': createEnemy('m81_c1', '仙島靈猴', MajorRealm.GoldenCore, EnemyRank.Common, 36000, 3450, 1650, ElementType.Wood, [], 5000, MINOR_REALM.MID, '猴'),
    'm82_c1': createEnemy('m82_c1', '蜃氣妖', MajorRealm.GoldenCore, EnemyRank.Common, 57000, 4800, 2100, ElementType.Water, [], 8000, MINOR_REALM.LATE, '蜃'),

    // === [4] Nascent Soul (元嬰) ===
    // Player: HP ~100k, Atk ~8k
    // Early: HP 120k, Atk 9k, Def 4.5k
    // Late: HP 300k, Atk 18k, Def 9k
    
    // North
    'm90_c1': createEnemy('m90_c1', '冰魄幽靈', MajorRealm.NascentSoul, EnemyRank.Common, 120000, 9000, 4500, ElementType.Water, [], 20000, MINOR_REALM.INITIAL, '幽'),
    'm91_c1': createEnemy('m91_c1', '極光飛魚', MajorRealm.NascentSoul, EnemyRank.Common, 180000, 13500, 6750, ElementType.Metal, [], 35000, MINOR_REALM.MID, '魚'),
    'm92_c1': createEnemy('m92_c1', '劍意殘魂', MajorRealm.NascentSoul, EnemyRank.Common, 300000, 18000, 9000, ElementType.Metal, [], 50000, MINOR_REALM.LATE, '魂'),
    // West
    'm100_c1': createEnemy('m100_c1', '荒原巨人', MajorRealm.NascentSoul, EnemyRank.Common, 150000, 7500, 7500, ElementType.Earth, [], 20000, MINOR_REALM.INITIAL, '巨'),
    'm101_c1': createEnemy('m101_c1', '血獸', MajorRealm.NascentSoul, EnemyRank.Common, 225000, 12000, 6000, ElementType.Fire, [], 35000, MINOR_REALM.MID, '血'),
    'm102_c1': createEnemy('m102_c1', '巫族守衛', MajorRealm.NascentSoul, EnemyRank.Common, 360000, 16500, 10500, ElementType.Earth, [], 50000, MINOR_REALM.LATE, '巫'),
    // East
    'm110_c1': createEnemy('m110_c1', '噬魂怪', MajorRealm.NascentSoul, EnemyRank.Common, 112500, 10500, 3750, ElementType.Water, [], 20000, MINOR_REALM.INITIAL, '噬'),
    'm111_c1': createEnemy('m111_c1', '鬼王', MajorRealm.NascentSoul, EnemyRank.Common, 195000, 14250, 6000, ElementType.Fire, [], 35000, MINOR_REALM.MID, '鬼'),
    'm112_c1': createEnemy('m112_c1', '虛空蟲族', MajorRealm.NascentSoul, EnemyRank.Common, 270000, 17250, 8250, ElementType.Wood, [], 50000, MINOR_REALM.LATE, '蟲'),

    // === [5] Spirit Severing (化神) ===
    // 2 Maps: 120 (Early/Mid), 121 (Late/Peak)
    // Player: HP ~500k, Atk ~30k
    // Early: HP 600k, Atk 37.5k, Def 18k
    // Late: HP 1.2M, Atk 75k, Def 37.5k
    'm120_c1': createEnemy('m120_c1', '異界魔兵', MajorRealm.SpiritSevering, EnemyRank.Common, 600000, 37500, 18000, ElementType.Fire, [], 100000, MINOR_REALM.INITIAL, '魔'),
    'm120_c2': createEnemy('m120_c2', '天界巡邏者', MajorRealm.SpiritSevering, EnemyRank.Common, 675000, 42000, 21000, ElementType.Metal, [], 110000, MINOR_REALM.MID, '巡'),
    'm121_c1': createEnemy('m121_c1', '怨念集合體', MajorRealm.SpiritSevering, EnemyRank.Common, 1200000, 75000, 37500, ElementType.Water, [], 150000, MINOR_REALM.PEAK, '怨'),

    // === [6] Void Refining (煉虛) ===
    // Player: HP ~2.5M, Atk ~150k
    // Early: HP 3M, Atk 180k, Def 90k
    // Late: HP 6M, Atk 375k, Def 180k
    'm130_c1': createEnemy('m130_c1', '時間蜉蝣', MajorRealm.VoidRefining, EnemyRank.Common, 3000000, 180000, 90000, ElementType.Water, [], 300000, MINOR_REALM.INITIAL, '蜉'),
    'm131_c1': createEnemy('m131_c1', '空間吞噬者', MajorRealm.VoidRefining, EnemyRank.Common, 6000000, 375000, 180000, ElementType.Earth, [], 450000, MINOR_REALM.PEAK, '吞'),

    // === [7] Fusion (合體) ===
    // Player: HP ~12M, Atk ~600k
    // Early: HP 15M, Atk 750k, Def 375k
    // Late: HP 30M, Atk 1.5M, Def 750k
    'm140_c1': createEnemy('m140_c1', '聖城執法隊', MajorRealm.Fusion, EnemyRank.Common, 15000000, 750000, 375000, ElementType.Metal, [], 1000000, MINOR_REALM.INITIAL, '執'),
    'm141_c1': createEnemy('m141_c1', '靈能構造體', MajorRealm.Fusion, EnemyRank.Common, 30000000, 1500000, 750000, ElementType.Wood, [], 1500000, MINOR_REALM.PEAK, '構'),

    // === [8] Mahayana (大乘) ===
    // Player: HP ~60M, Atk ~3M
    // Early: HP 75M, Atk 3.75M, Def 1.5M
    // Late: HP 150M, Atk 7.5M, Def 3.75M
    'm150_c1': createEnemy('m150_c1', '鯤鵬幼體', MajorRealm.Mahayana, EnemyRank.Common, 75000000, 3750000, 1500000, ElementType.Water, [], 3000000, MINOR_REALM.INITIAL, '鯤'),
    'm151_c1': createEnemy('m151_c1', '天梯守門人', MajorRealm.Mahayana, EnemyRank.Common, 150000000, 7500000, 3750000, ElementType.Earth, [], 5000000, MINOR_REALM.PEAK, '門'),

    // === [9] Tribulation (渡劫) ===
    // Player: HP ~300M, Atk ~15M
    // Early: HP 375M, Atk 18M, Def 7.5M
    // Late: HP 750M, Atk 37.5M, Def 15M
    'm160_c1': createEnemy('m160_c1', '劫雷獸', MajorRealm.Tribulation, EnemyRank.Common, 375000000, 18000000, 7500000, ElementType.Fire, [], 10000000, MINOR_REALM.INITIAL, '雷'),
    'm161_c1': createEnemy('m161_c1', '雷池金龍', MajorRealm.Tribulation, EnemyRank.Common, 750000000, 37500000, 15000000, ElementType.Metal, [], 15000000, MINOR_REALM.PEAK, '龍'),

    // === [10] Immortal (仙人) ===
    // Player: HP ~1.5B, Atk ~80M
    // Early: HP 1.5B, Atk 90M, Def 30M
    // Late: HP 4.5B, Atk 225M, Def 75M
    'm170_c1': createEnemy('m170_c1', '仙界仙鶴', MajorRealm.Immortal, EnemyRank.Common, 1500000000, 90000000, 30000000, ElementType.Wood, [], 50000000, MINOR_REALM.INITIAL, '鶴'),
    'm171_c1': createEnemy('m171_c1', '天兵', MajorRealm.Immortal, EnemyRank.Common, 4500000000, 225000000, 75000000, ElementType.Metal, [], 80000000, MINOR_REALM.LATE, '兵'),

    // === [11] Immortal Emperor (仙帝) ===
    // Early: HP 15B, Atk 750M, Def 300M
    'm180_c1': createEnemy('m180_c1', '大道顯化', MajorRealm.ImmortalEmperor, EnemyRank.Common, 15000000000, 750000000, 300000000, ElementType.Metal, [], 500000000, MINOR_REALM.INITIAL, '道'),
    'm180_c2': createEnemy('m180_c2', '混沌獸', MajorRealm.ImmortalEmperor, EnemyRank.Common, 22500000000, 900000000, 450000000, ElementType.Earth, [], 600000000, MINOR_REALM.LATE, '沌'),
};
