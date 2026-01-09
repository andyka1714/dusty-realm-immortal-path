
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';
import { MINOR_REALM } from '../../constants';

export const BOSS_ENEMIES: Record<string, Enemy> = {
    // mortal
    'm7_boss': createEnemy('m7_boss', '守塚老屍', MajorRealm.Mortal, EnemyRank.Boss, 2000, 80, 42, ElementType.Earth, ['spirit_stone', 'bt_mortal_qi', 'novice_sword', 'wooden_shield', 'straw_hat', 'novice_robe', 'straw_sandals', 'wooden_charm'], 400, MINOR_REALM.PEAK, '屍'),
    // qi
    'm8_boss': createEnemy('m8_boss', '裂風狼王', MajorRealm.QiRefining, EnemyRank.Boss, 25000, 550, 200, ElementType.Wood, ['bt_qi_foundation'], 2000, MINOR_REALM.PEAK, '狼'),
    'm11_boss': createEnemy('m11_boss', '寒霜白猿', MajorRealm.QiRefining, EnemyRank.Boss, 30000, 600, 350, ElementType.Water, ['bt_qi_foundation'], 3000, MINOR_REALM.PEAK, '猿'),
    'm14_boss': createEnemy('m14_boss', '墨色水怪', MajorRealm.QiRefining, EnemyRank.Boss, 35000, 650, 300, ElementType.Water, ['bt_qi_foundation'], 3500, MINOR_REALM.PEAK, '怪'),
    'm17_boss': createEnemy('m17_boss', '雷翼大隼', MajorRealm.QiRefining, EnemyRank.Boss, 35000, 750, 250, ElementType.Metal, ['bt_qi_foundation'], 4000, MINOR_REALM.PEAK, '隼'),
    'm19_boss': createEnemy('m19_boss', '金睛虎王', MajorRealm.QiRefining, EnemyRank.Boss, 42000, 700, 450, ElementType.Wood, ['bt_qi_foundation'], 4500, MINOR_REALM.PEAK, '虎'),
    // foundation
    'm22_boss': createEnemy('m22_boss', '極地劍靈', MajorRealm.Foundation, EnemyRank.Boss, 150000, 3500, 1500, ElementType.Water, ['bt_foundation_gold'], 12000, MINOR_REALM.PEAK, '劍'),
    'm26_boss': createEnemy('m26_boss', '烈焰妖王', MajorRealm.Foundation, EnemyRank.Boss, 250000, 4500, 2500, ElementType.Fire, ['bt_foundation_gold'], 18000, MINOR_REALM.PEAK, '妖'),
    'm29_boss': createEnemy('m29_boss', '雷澤領主', MajorRealm.Foundation, EnemyRank.Boss, 200000, 5000, 2000, ElementType.Metal, ['bt_foundation_gold'], 15000, MINOR_REALM.PEAK, '主'),
    'm34_boss': createEnemy('m34_boss', '萬獸獸王', MajorRealm.Foundation, EnemyRank.Boss, 300000, 3500, 3500, ElementType.Wood, ['bt_foundation_gold'], 22000, MINOR_REALM.PEAK, '獸'),
    // gold
    'm37_boss': createEnemy('m37_boss', '蜃樓主', MajorRealm.GoldenCore, EnemyRank.Boss, 800000, 12000, 6000, ElementType.Water, ['bt_gold_nascent'], 60000, MINOR_REALM.PEAK, '蜃'),
    'm42_boss': createEnemy('m42_boss', '百眼蛛母', MajorRealm.GoldenCore, EnemyRank.Boss, 900000, 11000, 7000, ElementType.Wood, ['bt_gold_nascent'], 65000, MINOR_REALM.PEAK, '蛛'),
    // nascent
    'm44_boss': createEnemy('m44_boss', '無名劍修', MajorRealm.NascentSoul, EnemyRank.Boss, 3000000, 50000, 20000, ElementType.Metal, ['bt_nascent_spirit'], 200000, MINOR_REALM.PEAK, '劍'),
    'm46_boss': createEnemy('m46_boss', '星塵巨人', MajorRealm.NascentSoul, EnemyRank.Boss, 3500000, 45000, 45000, ElementType.Earth, ['bt_nascent_spirit'], 250000, MINOR_REALM.PEAK, '人'),
    'm48_boss': createEnemy('m48_boss', '屍皇', MajorRealm.NascentSoul, EnemyRank.Boss, 4500000, 65000, 35000, ElementType.None, ['bt_nascent_spirit'], 350000, MINOR_REALM.PEAK, '皇'),
    // spirit
    'm51_boss': createEnemy('m51_boss', '霆祖', MajorRealm.SpiritSevering, EnemyRank.Boss, 10000000, 180000, 100000, ElementType.Metal, ['bt_spirit_void'], 1500000, MINOR_REALM.PEAK, '祖'),
    // void
    'm54_boss': createEnemy('m54_boss', '太虛夢魘', MajorRealm.VoidRefining, EnemyRank.Boss, 30000000, 400000, 200000, ElementType.None, ['bt_void_fusion'], 4000000, MINOR_REALM.PEAK, '魘'),
    // fusion
    'm57_boss': createEnemy('m57_boss', '虛空守衛', MajorRealm.Fusion, EnemyRank.Boss, 80000000, 800000, 400000, ElementType.None, ['bt_fusion_maha'], 10000000, MINOR_REALM.PEAK, '衛'),
    // mahayana
    'm59_boss': createEnemy('m59_boss', '古神 · 星緯', MajorRealm.Mahayana, EnemyRank.Boss, 300000000, 2500000, 1500000, ElementType.Earth, ['bt_maha_trib'], 50000000, MINOR_REALM.PEAK, '神'),
    // tribulation
    'm61_boss': createEnemy('m61_boss', '劫灰守衛', MajorRealm.Tribulation, EnemyRank.Boss, 800000000, 6000000, 3000000, ElementType.Fire, ['bt_trib_immortal'], 200000000, MINOR_REALM.PEAK, '衛'),
    // immortal
    'm64_boss': createEnemy('m64_boss', '巡天神將', MajorRealm.Immortal, EnemyRank.Boss, 2500000000, 15000000, 8000000, ElementType.Metal, ['bt_immortal_emperor'], 1000000000, MINOR_REALM.PEAK, '將'),
    'm66_boss': createEnemy('m66_boss', '鴻蒙之影', MajorRealm.Immortal, EnemyRank.Boss, 4000000000, 20000000, 10000000, ElementType.None, ['bt_immortal_emperor'], 2000000000, MINOR_REALM.PEAK, '影'),
    // immortal emperor
    'm67_boss': createEnemy('m67_boss', '天道意志 · 因果法身', MajorRealm.ImmortalEmperor, EnemyRank.Boss, 15000000000, 100000000, 50000000, ElementType.None, [], 0, MINOR_REALM.PEAK, '天'),
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
