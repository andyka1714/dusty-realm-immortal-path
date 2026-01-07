
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';

export const BOSS_ENEMIES: Record<string, Enemy> = {
    // mortal
    'm7_boss': createEnemy('m7_boss', '守塚老屍', MajorRealm.Mortal, EnemyRank.Boss, 2000, 80, 42, ElementType.Earth, ['spirit_stone', 'bt_mortal_qi'], 400),
    // qi
    'm8_boss': createEnemy('m8_boss', '裂風狼王', MajorRealm.QiRefining, EnemyRank.Boss, 25000, 550, 200, ElementType.Wood, ['bt_qi_foundation'], 2000),
    'm11_boss': createEnemy('m11_boss', '寒霜白猿', MajorRealm.QiRefining, EnemyRank.Boss, 30000, 600, 350, ElementType.Water, [], 3000),
    'm14_boss': createEnemy('m14_boss', '墨色水怪', MajorRealm.QiRefining, EnemyRank.Boss, 35000, 650, 300, ElementType.Water, [], 3500),
    'm17_boss': createEnemy('m17_boss', '雷翼大隼', MajorRealm.QiRefining, EnemyRank.Boss, 35000, 750, 250, ElementType.Metal, [], 4000),
    'm19_boss': createEnemy('m19_boss', '金睛虎王', MajorRealm.QiRefining, EnemyRank.Boss, 42000, 700, 450, ElementType.Wood, [], 4500),
    // foundation
    'm22_boss': createEnemy('m22_boss', '極地劍靈', MajorRealm.Foundation, EnemyRank.Boss, 150000, 3500, 1500, ElementType.Water, [], 12000),
    'm26_boss': createEnemy('m26_boss', '烈焰妖王', MajorRealm.Foundation, EnemyRank.Boss, 250000, 4500, 2500, ElementType.Fire, ['bt_foundation_gold'], 18000),
    'm29_boss': createEnemy('m29_boss', '雷澤領主', MajorRealm.Foundation, EnemyRank.Boss, 200000, 5000, 2000, ElementType.Metal, [], 15000),
    'm34_boss': createEnemy('m34_boss', '萬獸獸王', MajorRealm.Foundation, EnemyRank.Boss, 300000, 3500, 3500, ElementType.Wood, [], 22000),
    // gold
    'm37_boss': createEnemy('m37_boss', '蜃樓主', MajorRealm.GoldenCore, EnemyRank.Boss, 800000, 12000, 6000, ElementType.Water, ['bt_gold_nascent'], 60000),
    'm42_boss': createEnemy('m42_boss', '百眼蛛母', MajorRealm.GoldenCore, EnemyRank.Boss, 900000, 11000, 7000, ElementType.Wood, [], 65000),
    // nascent
    'm44_boss': createEnemy('m44_boss', '無名劍修', MajorRealm.NascentSoul, EnemyRank.Boss, 3000000, 50000, 20000, ElementType.Metal, [], 200000),
    'm46_boss': createEnemy('m46_boss', '星塵巨人', MajorRealm.NascentSoul, EnemyRank.Boss, 3500000, 45000, 45000, ElementType.Earth, [], 250000),
    'm48_boss': createEnemy('m48_boss', '屍皇', MajorRealm.NascentSoul, EnemyRank.Boss, 4500000, 65000, 35000, ElementType.None, ['bt_nascent_spirit'], 350000),
    // spirit
    'm51_boss': createEnemy('m51_boss', '霆祖', MajorRealm.SpiritSevering, EnemyRank.Boss, 10000000, 180000, 100000, ElementType.Metal, ['bt_spirit_void'], 1500000),
    // void
    'm54_boss': createEnemy('m54_boss', '太虛夢魘', MajorRealm.VoidRefining, EnemyRank.Boss, 30000000, 400000, 200000, ElementType.None, ['bt_void_fusion'], 4000000),
    // fusion
    'm57_boss': createEnemy('m57_boss', '虛空守衛', MajorRealm.Fusion, EnemyRank.Boss, 80000000, 800000, 400000, ElementType.None, ['bt_fusion_maha'], 10000000),
    // mahayana
    'm59_boss': createEnemy('m59_boss', '古神 · 星緯', MajorRealm.Mahayana, EnemyRank.Boss, 300000000, 2500000, 1500000, ElementType.Earth, ['bt_maha_trib'], 50000000),
    // tribulation
    'm61_boss': createEnemy('m61_boss', '劫灰守衛', MajorRealm.Tribulation, EnemyRank.Boss, 800000000, 6000000, 3000000, ElementType.Fire, ['bt_trib_immortal'], 200000000),
    // immortal
    'm64_boss': createEnemy('m64_boss', '巡天神將', MajorRealm.Immortal, EnemyRank.Boss, 2500000000, 15000000, 8000000, ElementType.Metal, [], 1000000000),
    'm66_boss': createEnemy('m66_boss', '鴻蒙之影', MajorRealm.Immortal, EnemyRank.Boss, 4000000000, 20000000, 10000000, ElementType.None, ['bt_immortal_emperor'], 2000000000),
    // immortal emperor
    'm67_boss': createEnemy('m67_boss', '天道意志 · 因果法身', MajorRealm.ImmortalEmperor, EnemyRank.Boss, 15000000000, 100000000, 50000000, ElementType.None, [], 0),
};

export const BOSS_MAPPING: Record<string, string> = {
    "守塚老屍": 'm7_boss',
    "裂風狼王": 'm8_boss',
    "寒霜白猿": 'm11_boss',
    "墨色水怪": 'm14_boss',
    "雷翼大隼": 'm17_boss',
    "金睛虎王": 'm19_boss',
    "極地劍靈": 'm22_boss',
    "烈焰妖王": 'm26_boss',
    "雷澤領主": 'm29_boss',
    "萬獸獸王": 'm34_boss',
    "蜃樓主": 'm37_boss',
    "百眼蛛母": 'm42_boss',
    "無名劍修": 'm44_boss',
    "星塵巨人": 'm46_boss',
    "屍皇": 'm48_boss',
    "霆祖": 'm51_boss',
    "太虛夢魘": 'm54_boss',
    "虛空守衛": 'm57_boss',
    "古神 · 星緯": 'm59_boss',
    "劫灰守衛": 'm61_boss',
    "巡天神將": 'm64_boss',
    "鴻蒙之影": 'm66_boss',
    "天道意志 · 因果法身": 'm67_boss',
};
