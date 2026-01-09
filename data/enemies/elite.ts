
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';
import { MINOR_REALM } from '../../constants';

export const ELITE_ENEMIES: Record<string, Enemy> = {
    // mortal
    'm6_e1': createEnemy('m6_e1', '石屋守衛屍', MajorRealm.Mortal, EnemyRank.Elite, 1000, 45, 40, ElementType.Earth, ['novice_sword', 'wooden_shield', 'straw_hat', 'novice_robe', 'straw_sandals', 'wooden_charm', 'spirit_stone'], 150, MINOR_REALM.PEAK),
    'm7_e1': createEnemy('m7_e1', '腐爛力士', MajorRealm.Mortal, EnemyRank.Elite, 800, 55, 30, ElementType.Earth, ['novice_sword', 'wooden_shield', 'straw_hat', 'novice_robe', 'straw_sandals', 'wooden_charm', 'spirit_stone'], 150, MINOR_REALM.PEAK),
    
    // qi
    'm8_e1': createEnemy('m8_e1', '碧眼魔虎', MajorRealm.QiRefining, EnemyRank.Elite, 6000, 320, 150, ElementType.Wood, [], 500, MINOR_REALM.LATE),
    'm9_e1': createEnemy('m9_e1', '狂牛首領', MajorRealm.QiRefining, EnemyRank.Elite, 8000, 300, 200, ElementType.Earth, [], 600, MINOR_REALM.LATE),
    'm10_e1': createEnemy('m10_e1', '古道殘將', MajorRealm.QiRefining, EnemyRank.Elite, 7500, 350, 250, ElementType.Metal, [], 650, MINOR_REALM.LATE),
    'm11_e1': createEnemy('m11_e1', '雪山巨猿', MajorRealm.QiRefining, EnemyRank.Elite, 12000, 320, 250, ElementType.Water, [], 700, MINOR_REALM.LATE),
    'm12_e1': createEnemy('m12_e1', '腐澤巨蟒首領', MajorRealm.QiRefining, EnemyRank.Elite, 9000, 320, 180, ElementType.Water, [], 700, MINOR_REALM.LATE),
    'm13_e1': createEnemy('m13_e1', '陰風谷大鬼', MajorRealm.QiRefining, EnemyRank.Elite, 8500, 380, 120, ElementType.Water, [], 750, MINOR_REALM.LATE),
    'm14_e1': createEnemy('m14_e1', '寒潭水怪衛士', MajorRealm.QiRefining, EnemyRank.Elite, 11000, 350, 220, ElementType.Water, [], 800, MINOR_REALM.PEAK),
    'm15_e1': createEnemy('m15_e1', '廢墟將軍', MajorRealm.QiRefining, EnemyRank.Elite, 10000, 340, 300, ElementType.Metal, [], 800, MINOR_REALM.PEAK),
    'm16_e1': createEnemy('m16_e1', '雷暴閃靈王', MajorRealm.QiRefining, EnemyRank.Elite, 9500, 420, 150, ElementType.Metal, [], 850, MINOR_REALM.PEAK),
    'm17_e1': createEnemy('m17_e1', '雷澤隼王', MajorRealm.QiRefining, EnemyRank.Elite, 13000, 400, 180, ElementType.Metal, [], 900, MINOR_REALM.PEAK),
    'm18_e1': createEnemy('m18_e1', '迷影猴王', MajorRealm.QiRefining, EnemyRank.Elite, 9000, 360, 200, ElementType.Wood, [], 900, MINOR_REALM.PEAK),
    'm19_e1': createEnemy('m19_e1', '虎嘯守衛虎', MajorRealm.QiRefining, EnemyRank.Elite, 15000, 450, 280, ElementType.Wood, [], 1000, MINOR_REALM.PEAK),

    // foundation
    'm20_e1': createEnemy('m20_e1', '古道狼王', MajorRealm.Foundation, EnemyRank.Elite, 30000, 1500, 800, ElementType.Water, [], 2000, MINOR_REALM.LATE),
    'm21_e1': createEnemy('m21_e1', '峽谷冰龍', MajorRealm.Foundation, EnemyRank.Elite, 45000, 1600, 1200, ElementType.Water, [], 2500, MINOR_REALM.LATE),
    'm22_e1': createEnemy('m22_e1', '落雷劍魂', MajorRealm.Foundation, EnemyRank.Elite, 50000, 1800, 1000, ElementType.Metal, [], 2800, MINOR_REALM.LATE),
    'm23_e1': createEnemy('m23_e1', '烈蟻后', MajorRealm.Foundation, EnemyRank.Elite, 40000, 1800, 1000, ElementType.Fire, [], 2800, MINOR_REALM.LATE),
    'm24_e1': createEnemy('m24_e1', '流道魔君', MajorRealm.Foundation, EnemyRank.Elite, 55000, 2000, 1500, ElementType.Fire, [], 3500, MINOR_REALM.LATE),
    'm25_e1': createEnemy('m25_e1', '暗河守衛龍', MajorRealm.Foundation, EnemyRank.Elite, 50000, 1800, 1800, ElementType.Water, [], 3200, MINOR_REALM.LATE),
    'm26_e1': createEnemy('m26_e1', '烈焰守衛', MajorRealm.Foundation, EnemyRank.Elite, 60000, 2200, 1600, ElementType.Fire, [], 3500, MINOR_REALM.LATE),
    'm27_e1': createEnemy('m27_e1', '焦土領主', MajorRealm.Foundation, EnemyRank.Elite, 40000, 2200, 800, ElementType.Earth, [], 3000, MINOR_REALM.LATE),
    'm28_e1': createEnemy('m28_e1', '遺跡戰魂王', MajorRealm.Foundation, EnemyRank.Elite, 48000, 2000, 1200, ElementType.Metal, [], 3300, MINOR_REALM.PEAK),
    'm29_e1': createEnemy('m29_e1', '石塔護法', MajorRealm.Foundation, EnemyRank.Elite, 52000, 2500, 1500, ElementType.Metal, [], 3500, MINOR_REALM.PEAK),
    'm30_e1': createEnemy('m30_e1', '陰風大魅', MajorRealm.Foundation, EnemyRank.Elite, 42000, 2500, 600, ElementType.None, [], 3500, MINOR_REALM.PEAK),
    'm31_e1': createEnemy('m31_e1', '幽暗豹王', MajorRealm.Foundation, EnemyRank.Elite, 50000, 2200, 1000, ElementType.Wood, [], 3800, MINOR_REALM.PEAK),
    'm32_e1': createEnemy('m32_e1', '岩窟地龍', MajorRealm.Foundation, EnemyRank.Elite, 60000, 2000, 2000, ElementType.Earth, [], 4000, MINOR_REALM.PEAK),
    'm33_e1': createEnemy('m33_e1', '深林狂獅', MajorRealm.Foundation, EnemyRank.Elite, 55000, 2400, 1500, ElementType.Wood, [], 4200, MINOR_REALM.PEAK),
    'm34_e1': createEnemy('m34_e1', '巢穴獸尊', MajorRealm.Foundation, EnemyRank.Elite, 65000, 2800, 2500, ElementType.Earth, [], 4500, MINOR_REALM.PEAK),

    // gold
    'm35_e1': createEnemy('m35_e1', '幻海領主', MajorRealm.GoldenCore, EnemyRank.Elite, 150000, 4500, 2500, ElementType.Water, [], 12000, MINOR_REALM.LATE),
    'm36_e1': createEnemy('m36_e1', '石林真君', MajorRealm.GoldenCore, EnemyRank.Elite, 180000, 4200, 3500, ElementType.Earth, [], 15000, MINOR_REALM.LATE),
    'm37_e1': createEnemy('m37_e1', '神海幻靈', MajorRealm.GoldenCore, EnemyRank.Elite, 160000, 5500, 2500, ElementType.Water, [], 16000, MINOR_REALM.LATE),
    'm38_e1': createEnemy('m38_e1', '灘塗蛇王', MajorRealm.GoldenCore, EnemyRank.Elite, 140000, 5500, 2000, ElementType.Water, [], 14000, MINOR_REALM.LATE),
    'm39_e1': createEnemy('m39_e1', '古城祭司', MajorRealm.GoldenCore, EnemyRank.Elite, 160000, 5000, 2800, ElementType.None, [], 16000, MINOR_REALM.PEAK),
    'm40_e1': createEnemy('m40_e1', '幽冥將軍', MajorRealm.GoldenCore, EnemyRank.Elite, 200000, 4500, 4000, ElementType.Earth, [], 18000, MINOR_REALM.PEAK),
    'm41_e1': createEnemy('m41_e1', '禁制裁判官', MajorRealm.GoldenCore, EnemyRank.Elite, 150000, 6500, 1500, ElementType.Metal, [], 20000, MINOR_REALM.PEAK),
    'm42_e1': createEnemy('m42_e1', '萬妖首領', MajorRealm.GoldenCore, EnemyRank.Elite, 220000, 5500, 3500, ElementType.Wood, [], 22000, MINOR_REALM.PEAK),

    // nascent
    'm43_e1': createEnemy('m43_e1', '荒古巨靈', MajorRealm.NascentSoul, EnemyRank.Elite, 550000, 18000, 12000, ElementType.None, [], 60000, MINOR_REALM.LATE),
    'm44_e1': createEnemy('m44_e1', '葬劍守護者', MajorRealm.NascentSoul, EnemyRank.Elite, 650000, 25000, 15000, ElementType.Metal, [], 70000, MINOR_REALM.LATE),
    'm45_e1': createEnemy('m45_e1', '荒漠之鐮', MajorRealm.NascentSoul, EnemyRank.Elite, 600000, 22000, 8000, ElementType.Earth, [], 75000, MINOR_REALM.LATE),
    'm46_e1': createEnemy('m46_e1', '星原暴君', MajorRealm.NascentSoul, EnemyRank.Elite, 700000, 20000, 20000, ElementType.Earth, [], 80000, MINOR_REALM.PEAK),
    'm47_e1': createEnemy('m47_e1', '擎天戰將', MajorRealm.NascentSoul, EnemyRank.Elite, 800000, 18000, 20000, ElementType.Earth, [], 90000, MINOR_REALM.PEAK),
    'm48_e1': createEnemy('m48_e1', '帝陵守墓長', MajorRealm.NascentSoul, EnemyRank.Elite, 900000, 30000, 25000, ElementType.None, [], 100000, MINOR_REALM.PEAK),

    // spirit
    'm49_e1': createEnemy('m49_e1', '摘星神使', MajorRealm.SpiritSevering, EnemyRank.Elite, 1800000, 60000, 35000, ElementType.Metal, [], 250000, MINOR_REALM.LATE),
    'm50_e1': createEnemy('m50_e1', '倒置界審判官', MajorRealm.SpiritSevering, EnemyRank.Elite, 2200000, 55000, 45000, ElementType.None, [], 300000, MINOR_REALM.PEAK),
    'm51_e1': createEnemy('m51_e1', '劫海領主', MajorRealm.SpiritSevering, EnemyRank.Elite, 3000000, 80000, 50000, ElementType.Metal, [], 400000, MINOR_REALM.PEAK),

    // void
    'm52_e1': createEnemy('m52_e1', '虛無支配者', MajorRealm.VoidRefining, EnemyRank.Elite, 5500000, 150000, 80000, ElementType.None, [], 800000, MINOR_REALM.LATE),
    'm53_e1': createEnemy('m53_e1', '元神收割者', MajorRealm.VoidRefining, EnemyRank.Elite, 6500000, 120000, 100000, ElementType.None, [], 900000, MINOR_REALM.PEAK),
    'm54_e1': createEnemy('m54_e1', '太虛執行者', MajorRealm.VoidRefining, EnemyRank.Elite, 8000000, 180000, 120000, ElementType.None, [], 1100000, MINOR_REALM.PEAK),

    // fusion
    'm55_e1': createEnemy('m55_e1', '崩壞主宰', MajorRealm.Fusion, EnemyRank.Elite, 12000000, 350000, 200000, ElementType.None, [], 2500000, MINOR_REALM.LATE),
    'm56_e1': createEnemy('m56_e1', '天罰大將軍', MajorRealm.Fusion, EnemyRank.Elite, 15000000, 300000, 250000, ElementType.Metal, [], 3000000, MINOR_REALM.PEAK),
    'm57_e1': createEnemy('m57_e1', '虛空巡者', MajorRealm.Fusion, EnemyRank.Elite, 20000000, 400000, 300000, ElementType.None, [], 4000000, MINOR_REALM.PEAK),

    // mahayana
    'm58_e1': createEnemy('m58_e1', '古戰神意志', MajorRealm.Mahayana, EnemyRank.Elite, 45000000, 1200000, 600000, ElementType.None, [], 10000000, MINOR_REALM.LATE),
    'm59_e1': createEnemy('m59_e1', '星辰守衛', MajorRealm.Mahayana, EnemyRank.Elite, 60000000, 1500000, 800000, ElementType.Earth, [], 15000000, MINOR_REALM.PEAK),

    // tribulation
    'm60_e1': createEnemy('m60_e1', '劫火領主', MajorRealm.Tribulation, EnemyRank.Elite, 120000000, 3500000, 1500000, ElementType.Fire, [], 35000000, MINOR_REALM.LATE),
    'm61_e1': createEnemy('m61_e1', '祭壇守護獸', MajorRealm.Tribulation, EnemyRank.Elite, 150000000, 4000000, 2000000, ElementType.Fire, [], 45000000, MINOR_REALM.PEAK),

    // immortal
    'm62_e1': createEnemy('m62_e1', '接引大仙', MajorRealm.Immortal, EnemyRank.Elite, 600000000, 12000000, 6000000, ElementType.Metal, [], 250000000, MINOR_REALM.LATE),
    'm63_e1': createEnemy('m63_e1', '長生木老', MajorRealm.Immortal, EnemyRank.Elite, 800000000, 10000000, 8000000, ElementType.Wood, [], 300000000, MINOR_REALM.LATE),
    'm64_e1': createEnemy('m64_e1', '天闕戰神', MajorRealm.Immortal, EnemyRank.Elite, 1200000000, 18000000, 8000000, ElementType.Metal, [], 450000000, MINOR_REALM.PEAK),
    'm65_e1': createEnemy('m65_e1', '法則之主', MajorRealm.Immortal, EnemyRank.Elite, 1500000000, 22000000, 10000000, ElementType.Water, [], 500000000, MINOR_REALM.PEAK),
    'm66_e1': createEnemy('m66_e1', '混沌之母', MajorRealm.Immortal, EnemyRank.Elite, 2000000000, 25000000, 15000000, ElementType.None, [], 650000000, MINOR_REALM.PEAK),
    'm67_e1': createEnemy('m67_e1', '終焉審判使', MajorRealm.ImmortalEmperor, EnemyRank.Elite, 5000000000, 80000000, 40000000, ElementType.None, [], 1000000000, MINOR_REALM.PEAK),
};
