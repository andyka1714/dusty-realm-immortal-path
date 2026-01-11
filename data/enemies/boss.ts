
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';
import { MINOR_REALM } from '../../constants';

// Boss Stats Logic
// Target: requires High-Grade gear of current realm (Full Set upgraded ideally).
// Stats: ~5-10x Common HP, ~1.5x Elite Atk.

// Full Sets
const MO_SET = ['novice_sword', 'wooden_shield', 'straw_hat', 'novice_robe', 'straw_sandals', 'wooden_charm'];
const QI_SWORD_SET = ['spirit_iron_sword', 'sword_tassel', 'focus_headband', 'azure_robe', 'light_boots', 'whetstone_ring'];
const QI_BODY_SET = ['bear_paw_gauntlet', 'heavy_iron_shield', 'wolf_skull_helm', 'boar_skin_armor', 'battle_boots', 'vitality_beads'];
const QI_MAGIC_SET = ['spirit_wood_staff', 'spirit_orb', 'mystic_crown', 'taoist_vestment', 'cloud_step_shoes', 'elemental_ring'];

export const BOSS_ENEMIES: Record<string, Enemy> = {
    // === [0] Mortal (凡人) ===
    // North
    'm3_b1': createEnemy('m3_b1', '守山靈虎', MajorRealm.Mortal, EnemyRank.Boss, 1800, 85, 50, ElementType.Metal, MO_SET, 150, MINOR_REALM.PEAK, '虎'),
    // West
    'm12_b1': createEnemy('m12_b1', '赤火猿', MajorRealm.Mortal, EnemyRank.Boss, 1500, 90, 45, ElementType.Fire, MO_SET, 180, MINOR_REALM.PEAK, '猿'),
    // East
    'm22_b1': createEnemy('m22_b1', '靈湖巨蟹', MajorRealm.Mortal, EnemyRank.Boss, 2200, 75, 55, ElementType.Water, MO_SET, 200, MINOR_REALM.PEAK, '蟹'),

    // === [1] Qi Refining (練氣) ===
    // Common Early: HP 500, Atk 50
    // Elite Early: HP 1600, Atk 90
    // Boss Target: Peak Qi Stats (Atk 250, HP 2000+)
    // Boss Stats: HP 4800+, Atk 300+, Def 120+
    
    // North
    'm7_b1': createEnemy('m7_b1', '萬劍劍意', MajorRealm.QiRefining, EnemyRank.Boss, 4800, 340, 120, ElementType.Metal, QI_SWORD_SET, 1000, MINOR_REALM.PEAK, '劍'),
    // West
    'm16_b1': createEnemy('m16_b1', '萬獸獸王', MajorRealm.QiRefining, EnemyRank.Boss, 6000, 300, 150, ElementType.Earth, QI_BODY_SET, 1000, MINOR_REALM.PEAK, '王'),
    // East
    'm26_b1': createEnemy('m26_b1', '靈湖水蛟', MajorRealm.QiRefining, EnemyRank.Boss, 5400, 320, 130, ElementType.Water, QI_MAGIC_SET, 1000, MINOR_REALM.PEAK, '蛟'),

    // === [2] Foundation (築基) ===
    // Elite: HP 12k, Atk 850
    // Boss: HP 72k, Atk 1800, Def 900
    'm32_b1': createEnemy('m32_b1', '極地劍靈', MajorRealm.Foundation, EnemyRank.Boss, 72000, 1870, 900, ElementType.Metal, [], 5000, MINOR_REALM.PEAK, '靈'),
    'm42_b1': createEnemy('m42_b1', '烈焰妖王', MajorRealm.Foundation, EnemyRank.Boss, 84000, 2125, 1080, ElementType.Fire, [], 5000, MINOR_REALM.PEAK, '妖'),
    'm52_b1': createEnemy('m52_b1', '雷澤領主', MajorRealm.Foundation, EnemyRank.Boss, 78000, 2000, 990, ElementType.Metal, [], 5000, MINOR_REALM.PEAK, '雷'),

    // === [3] Golden Core (金丹) ===
    // Elite: HP 60k, Atk 4750
    // Boss: HP 300k, Atk 8000, Def 4000
    'm62_b1': createEnemy('m62_b1', '金翅大鵬', MajorRealm.GoldenCore, EnemyRank.Boss, 300000, 8075, 4050, ElementType.Metal, [], 20000, MINOR_REALM.PEAK, '鵬'),
    'm72_b1': createEnemy('m72_b1', '厄難毒體', MajorRealm.GoldenCore, EnemyRank.Boss, 360000, 7480, 4500, ElementType.Wood, [], 20000, MINOR_REALM.PEAK, '厄'),
    'm82_b1': createEnemy('m82_b1', '覆海蛟龍', MajorRealm.GoldenCore, EnemyRank.Boss, 420000, 8925, 4500, ElementType.Water, [], 20000, MINOR_REALM.PEAK, '蛟'),

    // === [4] Nascent Soul (元嬰) ===
    // Elite: HP 360k, Atk 20k
    // Boss: HP 1.5M, Atk 38k, Def 18k
    'm92_b1': createEnemy('m92_b1', '北寒劍尊', MajorRealm.NascentSoul, EnemyRank.Boss, 1500000, 38250, 18000, ElementType.Metal, [], 100000, MINOR_REALM.PEAK, '寒'),
    'm102_b1': createEnemy('m102_b1', '刑天殘軀', MajorRealm.NascentSoul, EnemyRank.Boss, 1800000, 34000, 22500, ElementType.Earth, [], 100000, MINOR_REALM.PEAK, '刑'),
    'm112_b1': createEnemy('m112_b1', '九幽鬼帝', MajorRealm.NascentSoul, EnemyRank.Boss, 1680000, 42500, 16200, ElementType.Fire, [], 100000, MINOR_REALM.PEAK, '帝'),

    // === [5] Spirit Severing (化神) ===
    // Elite: HP 1.4M, Atk 68k
    // Boss: HP 5.4M, Atk 127k, Def 72k
    'm121_b1': createEnemy('m121_b1', '修羅魔尊', MajorRealm.SpiritSevering, EnemyRank.Boss, 5400000, 127500, 72000, ElementType.Fire, [], 500000, MINOR_REALM.PEAK, '尊'),

    // === [6] Void Refining (煉虛) ===
    // Elite: HP 7.2M, Atk 340k
    // Boss: HP 21.6M, Atk 637k, Def 360k
    'm131_b1': createEnemy('m131_b1', '時空之主', MajorRealm.VoidRefining, EnemyRank.Boss, 21600000, 637500, 360000, ElementType.Metal, [], 1500000, MINOR_REALM.PEAK, '主'),

    // === [7] Fusion (合體) ===
    // Elite: HP 36M, Atk 1.35M
    // Boss: HP 120M, Atk 2.55M, Def 1.44M
    'm141_b1': createEnemy('m141_b1', '靈皇', MajorRealm.Fusion, EnemyRank.Boss, 120000000, 2550000, 1440000, ElementType.Wood, [], 5000000, MINOR_REALM.PEAK, '皇'),

    // === [8] Mahayana (大乘) ===
    // Elite: HP 180M, Atk 6.8M
    // Boss: HP 600M, Atk 12.75M, Def 7.2M
    'm151_b1': createEnemy('m151_b1', '守界者', MajorRealm.Mahayana, EnemyRank.Boss, 600000000, 12750000, 7200000, ElementType.Metal, [], 15000000, MINOR_REALM.PEAK, '守'),

    // === [9] Tribulation (渡劫) ===
    // Elite: HP 900M, Atk 34M
    // Boss: HP 3B, Atk 63.75M, Def 28.8M
    'm161_b1': createEnemy('m161_b1', '天道化身', MajorRealm.Tribulation, EnemyRank.Boss, 3000000000, 63750000, 28800000, ElementType.Metal, [], 50000000, MINOR_REALM.PEAK, '天'),

    // === [10] Immortal (仙人) ===
    // Elite: HP 3.6B, Atk 170M
    // Boss: HP 12B, Atk 425M, Def 180M
    'm171_b1': createEnemy('m171_b1', '九天仙尊', MajorRealm.Immortal, EnemyRank.Boss, 12000000000, 425000000, 180000000, ElementType.Metal, [], 200000000, MINOR_REALM.PEAK, '尊'),

    // === [11] Immortal Emperor (仙帝) ===
    // Elite: HP 36B, Atk 1.7B
    // Boss: HP 120B, Atk 8.5B, Def 1.8B
    'm180_b1': createEnemy('m180_b1', '鴻蒙道祖', MajorRealm.ImmortalEmperor, EnemyRank.Boss, 120000000000, 8500000000, 1800000000, ElementType.Metal, [], 2000000000, MINOR_REALM.PEAK, '祖'),
};
