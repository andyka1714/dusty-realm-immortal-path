
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';
import { MINOR_REALM } from '../../constants';

// Elite Stats Logic
// Generally ~2x HP and ~1.3x Atk/Def of Common mobs in the same map.
// Target: requires Mid-Grade gear of current realm to beat comfortably.

// Full Sets
const MO_SET = ['novice_sword', 'wooden_shield', 'straw_hat', 'novice_robe', 'straw_sandals', 'wooden_charm'];
const QI_SWORD_SET = ['spirit_iron_sword', 'sword_tassel', 'focus_headband', 'azure_robe', 'light_boots', 'whetstone_ring'];
const QI_BODY_SET = ['bear_paw_gauntlet', 'heavy_iron_shield', 'wolf_skull_helm', 'boar_skin_armor', 'battle_boots', 'vitality_beads'];
const QI_MAGIC_SET = ['spirit_wood_staff', 'spirit_orb', 'mystic_crown', 'taoist_vestment', 'cloud_step_shoes', 'elemental_ring'];

export const ELITE_ENEMIES: Record<string, Enemy> = {
    // === [0] Mortal (凡人) ===
    // North
    'm3_e1': createEnemy('m3_e1', '流浪劍師', MajorRealm.Mortal, EnemyRank.Elite, 800, 65, 40, ElementType.Metal, MO_SET, 50, MINOR_REALM.LATE, '劍'),
    // West
    'm12_e1': createEnemy('m12_e1', '鐵甲犀牛王', MajorRealm.Mortal, EnemyRank.Elite, 1000, 65, 50, ElementType.Earth, MO_SET, 60, MINOR_REALM.LATE, '犀'),
    // East
    'm22_e1': createEnemy('m22_e1', '迷霧之靈', MajorRealm.Mortal, EnemyRank.Elite, 600, 75, 35, ElementType.Water, MO_SET, 55, MINOR_REALM.LATE, '霧'),

    // === [1] Qi Refining (練氣) ===
    // Common Early: HP 500, Atk 50, Def 25
    // Elite Early (Target Mid Gear ~ Atk 120, Def 75, HP 1200): 
    // -> Monster: HP 1300-1800, Atk 100+, Def 60+.
    
    // North
    'm5_e1': createEnemy('m5_e1', '劍氣魁儡', MajorRealm.QiRefining, EnemyRank.Elite, 1320, 100, 60, ElementType.Metal, QI_SWORD_SET, 200, MINOR_REALM.INITIAL, '魁'),
    'm7_e1': createEnemy('m7_e1', '嗜血劍魔', MajorRealm.QiRefining, EnemyRank.Elite, 2100, 180, 100, ElementType.Fire, QI_SWORD_SET, 300, MINOR_REALM.LATE, '魔'),
    
    // West
    'm15_e1': createEnemy('m15_e1', '狂暴棕熊', MajorRealm.QiRefining, EnemyRank.Elite, 1800, 145, 90, ElementType.Earth, QI_BODY_SET, 250, MINOR_REALM.MID, '熊'),
    'm16_e1': createEnemy('m16_e1', '雙頭狼王', MajorRealm.QiRefining, EnemyRank.Elite, 2160, 200, 100, ElementType.Metal, QI_BODY_SET, 320, MINOR_REALM.LATE, '狼'),

    // East
    'm25_e1': createEnemy('m25_e1', '丹爐精', MajorRealm.QiRefining, EnemyRank.Elite, 1500, 160, 110, ElementType.Fire, QI_MAGIC_SET, 220, MINOR_REALM.MID, '爐'),
    'm26_e1': createEnemy('m26_e1', '寒冰龜', MajorRealm.QiRefining, EnemyRank.Elite, 2500, 120, 140, ElementType.Water, QI_MAGIC_SET, 350, MINOR_REALM.LATE, '龜'),

    // === [2] Foundation (築基) ===
    // Common Early: HP 3000, Atk 300, Def 150
    // Elite Early: HP 12000, Atk 850, Def 540
    
    // North
    'm31_e1': createEnemy('m31_e1', '寒冰巨人', MajorRealm.Foundation, EnemyRank.Elite, 12000, 850, 540, ElementType.Water, [], 1500, MINOR_REALM.MID, '巨'),
    'm32_e1': createEnemy('m32_e1', '奔雷古獸', MajorRealm.Foundation, EnemyRank.Elite, 14400, 1200, 630, ElementType.Metal, [], 2000, MINOR_REALM.LATE, '雷'),
    
    // West
    'm41_e1': createEnemy('m41_e1', '樹妖姥姥', MajorRealm.Foundation, EnemyRank.Elite, 13200, 935, 500, ElementType.Wood, [], 1800, MINOR_REALM.MID, '姥'),
    'm42_e1': createEnemy('m42_e1', '煉獄炎魔', MajorRealm.Foundation, EnemyRank.Elite, 18000, 1360, 720, ElementType.Fire, [], 2500, MINOR_REALM.LATE, '炎'),

    // East
    'm51_e1': createEnemy('m51_e1', '沼澤巨鱷', MajorRealm.Foundation, EnemyRank.Elite, 14400, 1020, 900, ElementType.Water, [], 2000, MINOR_REALM.MID, '鱷'),
    'm52_e1': createEnemy('m52_e1', '雷霆蜥蜴', MajorRealm.Foundation, EnemyRank.Elite, 16800, 1275, 810, ElementType.Metal, [], 2400, MINOR_REALM.LATE, '蜥'),

    // === [3] Golden Core (金丹) ===
    // Common Early: HP 15000, Atk 1600, Def 800
    // Elite Early: HP 60k, Atk 4750, Def 2700

    // North
    'm61_e1': createEnemy('m61_e1', '羽族戰士', MajorRealm.GoldenCore, EnemyRank.Elite, 60000, 4750, 2700, ElementType.Metal, [], 8000, MINOR_REALM.MID, '羽'),
    'm62_e1': createEnemy('m62_e1', '鐵翼鳥王', MajorRealm.GoldenCore, EnemyRank.Elite, 72000, 5950, 3240, ElementType.Metal, [], 12000, MINOR_REALM.LATE, '鳥'),
    // West
    'm71_e1': createEnemy('m71_e1', '地火龍蜥', MajorRealm.GoldenCore, EnemyRank.Elite, 66000, 5100, 3600, ElementType.Fire, [], 9000, MINOR_REALM.MID, '蜥'),
    'm72_e1': createEnemy('m72_e1', '萬毒蛛后', MajorRealm.GoldenCore, EnemyRank.Elite, 78000, 6450, 2880, ElementType.Wood, [], 15000, MINOR_REALM.LATE, '蛛'),
    // East
    'm81_e1': createEnemy('m81_e1', '護島神獸', MajorRealm.GoldenCore, EnemyRank.Elite, 63000, 5450, 3240, ElementType.Water, [], 10000, MINOR_REALM.MID, '獸'),
    'm82_e1': createEnemy('m82_e1', '幻海魔鯨', MajorRealm.GoldenCore, EnemyRank.Elite, 96000, 6800, 4500, ElementType.Water, [], 20000, MINOR_REALM.LATE, '鯨'),

    // === [4] Nascent Soul (元嬰) ===
    // Common Early: HP 80k, Atk 6k, Def 3k
    // Elite Early: HP 360k, Atk 20k, Def 10k
    
    // North
    'm91_e1': createEnemy('m91_e1', '虛空獵手', MajorRealm.NascentSoul, EnemyRank.Elite, 360000, 20500, 10800, ElementType.Metal, [], 60000, MINOR_REALM.MID, '獵'),
    'm92_e1': createEnemy('m92_e1', '守劍長老魂', MajorRealm.NascentSoul, EnemyRank.Elite, 480000, 30500, 14400, ElementType.Metal, [], 80000, MINOR_REALM.LATE, '長'),
    // West
    'm101_e1': createEnemy('m101_e1', '龍血戰士', MajorRealm.NascentSoul, EnemyRank.Elite, 420000, 25500, 16200, ElementType.Fire, [], 70000, MINOR_REALM.MID, '戰'),
    'm102_e1': createEnemy('m102_e1', '祭司亡魂', MajorRealm.NascentSoul, EnemyRank.Elite, 540000, 34000, 10800, ElementType.Earth, [], 90000, MINOR_REALM.LATE, '祭'),
    // East
    'm111_e1': createEnemy('m111_e1', '幽冥羅剎', MajorRealm.NascentSoul, EnemyRank.Elite, 390000, 27000, 9000, ElementType.Fire, [], 65000, MINOR_REALM.MID, '羅'),
    'm112_e1': createEnemy('m112_e1', '虛空領主', MajorRealm.NascentSoul, EnemyRank.Elite, 600000, 37500, 18000, ElementType.Metal, [], 100000, MINOR_REALM.LATE, '領'),

    // === [5] Spirit Severing (化神) ===
    // Common Early: HP 400k, Atk 25k, Def 12k
    // Elite: HP 1.4M, Atk 68k, Def 36k
    'm120_e1': createEnemy('m120_e1', '百戰魔傀', MajorRealm.SpiritSevering, EnemyRank.Elite, 1440000, 68000, 36000, ElementType.Metal, [], 200000, MINOR_REALM.MID, '傀'),
    'm121_e1': createEnemy('m121_e1', '墮落仙人', MajorRealm.SpiritSevering, EnemyRank.Elite, 1800000, 85000, 45000, ElementType.Wood, [], 300000, MINOR_REALM.LATE, '墮'),

    // === [6] Void Refining (煉虛) ===
    // Common Early: HP 2M, Atk 120k, Def 60k
    // Elite: HP 7.2M, Atk 340k, Def 180k
    'm130_e1': createEnemy('m130_e1', '歲月守衛', MajorRealm.VoidRefining, EnemyRank.Elite, 7200000, 340000, 180000, ElementType.Metal, [], 600000, MINOR_REALM.MID, '歲'),
    'm131_e1': createEnemy('m131_e1', '虛空行者', MajorRealm.VoidRefining, EnemyRank.Elite, 9600000, 510000, 270000, ElementType.Metal, [], 800000, MINOR_REALM.LATE, '行'),

    // === [7] Fusion (合體) ===
    // Common Early: HP 10M, Atk 500k, Def 250k
    // Elite: HP 36M, Atk 1.35M, Def 720k
    'm140_e1': createEnemy('m140_e1', '執法統領', MajorRealm.Fusion, EnemyRank.Elite, 36000000, 1350000, 720000, ElementType.Metal, [], 2000000, MINOR_REALM.MID, '統'),
    'm141_e1': createEnemy('m141_e1', '樞紐守護獸', MajorRealm.Fusion, EnemyRank.Elite, 48000000, 2040000, 1080000, ElementType.Wood, [], 3000000, MINOR_REALM.LATE, '守'),

    // === [8] Mahayana (大乘) ===
    // Common Early: HP 50M, Atk 2.5M, Def 1M
    // Elite: HP 180M, Atk 6.8M, Def 3.6M
    'm150_e1': createEnemy('m150_e1', '深海魔龍', MajorRealm.Mahayana, EnemyRank.Elite, 180000000, 6800000, 3600000, ElementType.Water, [], 6000000, MINOR_REALM.MID, '龍'),
    'm151_e1': createEnemy('m151_e1', '天將虛影', MajorRealm.Mahayana, EnemyRank.Elite, 240000000, 10200000, 5400000, ElementType.Metal, [], 8000000, MINOR_REALM.LATE, '將'),

    // === [9] Tribulation (渡劫) ===
    // Common Early: HP 250M, Atk 12M, Def 5M
    // Elite: HP 900M, Atk 34M, Def 14M
    'm160_e1': createEnemy('m160_e1', '滅世魔雷', MajorRealm.Tribulation, EnemyRank.Elite, 900000000, 34000000, 14400000, ElementType.Fire, [], 20000000, MINOR_REALM.MID, '魔'),
    'm161_e1': createEnemy('m161_e1', '雷道天尊', MajorRealm.Tribulation, EnemyRank.Elite, 1200000000, 51000000, 21600000, ElementType.Metal, [], 30000000, MINOR_REALM.LATE, '尊'),

    // === [10] Immortal (仙人) ===
    // Common: HP 1B, Atk 60M, Def 20M
    // Elite: HP 3.6B, Atk 170M, Def 72M
    'm170_e1': createEnemy('m170_e1', '巡天仙吏', MajorRealm.Immortal, EnemyRank.Elite, 3600000000, 170000000, 72000000, ElementType.Metal, [], 100000000, MINOR_REALM.MID, '吏'),
    'm171_e1': createEnemy('m171_e1', '鎮天神將', MajorRealm.Immortal, EnemyRank.Elite, 6000000000, 340000000, 144000000, ElementType.Metal, [], 150000000, MINOR_REALM.LATE, '將'),

    // === [11] Immortal Emperor (仙帝) ===
    // Elite: HP 36B, Atk 1.7B, Def 720M
    'm180_e1': createEnemy('m180_e1', '守道者', MajorRealm.ImmortalEmperor, EnemyRank.Elite, 36000000000, 1700000000, 720000000, ElementType.Metal, [], 1000000000, MINOR_REALM.MID, '守'),
};
