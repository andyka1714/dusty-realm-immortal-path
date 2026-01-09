
import { MajorRealm, ElementType, Enemy, EnemyRank } from '../../types';
import { createEnemy } from './utils';
import { MINOR_REALM } from '../../constants';

export const COMMON_ENEMIES: Record<string, Enemy> = {
    // === [0] Mortal (凡人) ===
    'm1_c1': createEnemy('m1_c1', '後山走兔', MajorRealm.Mortal, EnemyRank.Common, 60, 22, 2, ElementType.None, ['straw_sandals', 'wooden_charm'], 8, MINOR_REALM.INITIAL, '兔'),
    'm1_c2': createEnemy('m1_c2', '幼獸灰偶', MajorRealm.Mortal, EnemyRank.Common, 120, 25, 8, ElementType.Earth, ['straw_sandals', 'wooden_charm'], 15, MINOR_REALM.INITIAL, '偶'),
    'm2_c1': createEnemy('m2_c1', '討飯小乞', MajorRealm.Mortal, EnemyRank.Common, 100, 24, 4, ElementType.None, ['wooden_charm', 'straw_sandals'], 12, MINOR_REALM.MID, '乞'),
    'm2_c2': createEnemy('m2_c2', '仙緣地鼠', MajorRealm.Mortal, EnemyRank.Common, 70, 30, 0, ElementType.Earth, ['wooden_charm', 'straw_sandals'], 10, MINOR_REALM.MID, '鼠'),
    'm3_c1': createEnemy('m3_c1', '青竹靈蛛', MajorRealm.Mortal, EnemyRank.Common, 90, 26, 6, ElementType.Wood, ['straw_hat', 'novice_robe'], 14, MINOR_REALM.LATE, '蛛'),
    'm3_c2': createEnemy('m3_c2', '林間幼狐', MajorRealm.Mortal, EnemyRank.Common, 80, 24, 4, ElementType.None, ['straw_hat', 'novice_robe'], 12, MINOR_REALM.LATE, '狐'),
    'm4_c1': createEnemy('m4_c1', '餓狼坡野犬', MajorRealm.Mortal, EnemyRank.Common, 130, 32, 8, ElementType.None, ['novice_sword', 'wooden_shield'], 20, MINOR_REALM.LATE, '犬'),
    'm4_c2': createEnemy('m4_c2', '坡底潛伏者', MajorRealm.Mortal, EnemyRank.Common, 110, 35, 5, ElementType.Earth, ['novice_sword', 'wooden_shield'], 22, MINOR_REALM.PEAK, '潛'),
    'm5_c1': createEnemy('m5_c1', '崖邊鷦鷯', MajorRealm.Mortal, EnemyRank.Common, 70, 40, 0, ElementType.Metal, ['wooden_shield', 'straw_hat'], 20, MINOR_REALM.PEAK, '鷯'),
    'm5_c2': createEnemy('m5_c2', '斷崖峭石精', MajorRealm.Mortal, EnemyRank.Common, 150, 28, 15, ElementType.Earth, ['wooden_shield', 'straw_hat'], 25, MINOR_REALM.PEAK, '石'),
    'm6_c1': createEnemy('m6_c1', '石屋幽影', MajorRealm.Mortal, EnemyRank.Common, 120, 35, 10, ElementType.None, ['novice_robe', 'novice_sword'], 25, MINOR_REALM.PEAK, '影'),
    // Late Mortal mobs drop mixed gear
    'm7_c1': createEnemy('m7_c1', '荒塚行屍', MajorRealm.Mortal, EnemyRank.Common, 180, 30, 15, ElementType.Earth, ['novice_robe', 'novice_sword', 'spirit_stone'], 30, MINOR_REALM.PEAK, '屍'),
    'm7_c2': createEnemy('m7_c2', '墓園殘魂', MajorRealm.Mortal, EnemyRank.Common, 100, 45, 2, ElementType.Water, ['novice_sword', 'novice_robe', 'spirit_stone'], 35, MINOR_REALM.PEAK, '魂'),

    // === [1] Qi Refining (練氣) ===
    // Drops: 2 specific items per common mob to encourage farming different enemies.
    'm8_c1': createEnemy('m8_c1', '萬獸林斑豹', MajorRealm.QiRefining, EnemyRank.Common, 1200, 150, 40, ElementType.Wood, ['spirit_iron_sword', 'light_boots'], 80, MINOR_REALM.INITIAL, '豹'),
    'm8_c2': createEnemy('m8_c2', '林間影殺蜂', MajorRealm.QiRefining, EnemyRank.Common, 900, 180, 20, ElementType.Wood, ['sword_tassel', 'whetstone_ring'], 85, MINOR_REALM.INITIAL, '蜂'),
    
    'm9_c1': createEnemy('m9_c1', '萬獸林狂牛', MajorRealm.QiRefining, EnemyRank.Common, 1800, 140, 80, ElementType.Earth, ['bear_paw_gauntlet', 'heavy_iron_shield'], 90, MINOR_REALM.INITIAL, '牛'),
    'm9_c2': createEnemy('m9_c2', '林中樹妖', MajorRealm.QiRefining, EnemyRank.Common, 1500, 160, 60, ElementType.Wood, ['boar_skin_armor', 'vitality_beads'], 95, MINOR_REALM.INITIAL, '樹'),
    
    'm10_c1': createEnemy('m10_c1', '雪線冰蝶', MajorRealm.QiRefining, EnemyRank.Common, 1000, 200, 30, ElementType.Water, ['spirit_wood_staff', 'cloud_step_shoes'], 100, MINOR_REALM.INITIAL, '蝶'),
    'm10_c2': createEnemy('m10_c2', '古道殘兵', MajorRealm.QiRefining, EnemyRank.Common, 1600, 180, 100, ElementType.Metal, ['taoist_vestment', 'elemental_ring'], 110, MINOR_REALM.INITIAL, '兵'),
    
    'm11_c1': createEnemy('m11_c1', '北關戍衛傀儡', MajorRealm.QiRefining, EnemyRank.Common, 2000, 170, 150, ElementType.Metal, ['wolf_skull_helm', 'battle_boots'], 120, MINOR_REALM.MID, '儡'),
    'm11_c2': createEnemy('m11_c2', '關外暴猿', MajorRealm.QiRefining, EnemyRank.Common, 1800, 190, 80, ElementType.Earth, ['heavy_iron_shield', 'boar_skin_armor'], 115, MINOR_REALM.MID, '猿'),
    
    'm12_c1': createEnemy('m12_c1', '腐澤巨蟒', MajorRealm.QiRefining, EnemyRank.Common, 1600, 180, 70, ElementType.Water, ['spirit_wood_staff', 'azure_robe'], 110, MINOR_REALM.MID, '蟒'),
    'm12_c2': createEnemy('m12_c2', '沼澤泥妖', MajorRealm.QiRefining, EnemyRank.Common, 2200, 150, 120, ElementType.Earth, ['bear_paw_gauntlet', 'wolf_skull_helm'], 105, MINOR_REALM.MID, '泥'),
    
    'm13_c1': createEnemy('m13_c1', '陰風谷小鬼', MajorRealm.QiRefining, EnemyRank.Common, 1100, 220, 30, ElementType.Water, ['spirit_orb', 'mystic_crown'], 120, MINOR_REALM.MID, '鬼'),
    'm13_c2': createEnemy('m13_c2', '谷口怨念', MajorRealm.QiRefining, EnemyRank.Common, 1300, 200, 50, ElementType.None, ['taoist_vestment', 'elemental_ring'], 125, MINOR_REALM.MID, '怨'),
    
    'm14_c1': createEnemy('m14_c1', '寒潭鐵甲龜', MajorRealm.QiRefining, EnemyRank.Common, 3000, 130, 220, ElementType.Water, ['heavy_iron_shield', 'boar_skin_armor'], 130, MINOR_REALM.LATE, '龜'),
    'm14_c2': createEnemy('m14_c2', '潭底水猴', MajorRealm.QiRefining, EnemyRank.Common, 1500, 210, 60, ElementType.Water, ['spirit_iron_sword', 'light_boots'], 135, MINOR_REALM.LATE, '猴'),
    
    'm15_c1': createEnemy('m15_c1', '廢墟渡鴉', MajorRealm.QiRefining, EnemyRank.Common, 1000, 240, 20, ElementType.Metal, ['focus_headband', 'whetstone_ring'], 140, MINOR_REALM.LATE, '鴉'),
    'm15_c2': createEnemy('m15_c2', '殘破甲冑', MajorRealm.QiRefining, EnemyRank.Common, 2000, 180, 160, ElementType.Metal, ['bear_paw_gauntlet', 'battle_boots'], 145, MINOR_REALM.LATE, '甲'),
    
    'm16_c1': createEnemy('m16_c1', '雷暴閃靈', MajorRealm.QiRefining, EnemyRank.Common, 1200, 260, 40, ElementType.Metal, ['cloud_step_shoes', 'sword_tassel'], 150, MINOR_REALM.LATE, '靈'),
    'm16_c2': createEnemy('m16_c2', '荒原烈馬', MajorRealm.QiRefining, EnemyRank.Common, 1800, 220, 90, ElementType.Fire, ['azure_robe', 'focus_headband'], 155, MINOR_REALM.LATE, '馬'),
    
    'm17_c1': createEnemy('m17_c1', '雷澤蟹將', MajorRealm.QiRefining, EnemyRank.Common, 2500, 200, 180, ElementType.Water, ['bear_paw_gauntlet', 'wolf_skull_helm'], 160, MINOR_REALM.PEAK, '蟹'),
    'm17_c2': createEnemy('m17_c2', '電光游魚', MajorRealm.QiRefining, EnemyRank.Common, 1100, 280, 30, ElementType.Metal, ['spirit_wood_staff', 'cloud_step_shoes'], 165, MINOR_REALM.PEAK, '魚'),
    
    'm18_c1': createEnemy('m18_c1', '迷影猴妖', MajorRealm.QiRefining, EnemyRank.Common, 1400, 220, 60, ElementType.Wood, ['spirit_orb', 'mystic_crown'], 170, MINOR_REALM.PEAK, '猴'),
    'm18_c2': createEnemy('m18_c2', '叢林食人花', MajorRealm.QiRefining, EnemyRank.Common, 2000, 200, 100, ElementType.Wood, ['boar_skin_armor', 'vitality_beads'], 175, MINOR_REALM.PEAK, '花'),
    
    'm19_c1': createEnemy('m19_c1', '林外嗜血狼', MajorRealm.QiRefining, EnemyRank.Common, 1600, 240, 80, ElementType.Wood, ['spirit_iron_sword', 'light_boots'], 180, MINOR_REALM.PEAK, '狼'),
    'm19_c2': createEnemy('m19_c2', '巡山鬣狗', MajorRealm.QiRefining, EnemyRank.Common, 1500, 230, 90, ElementType.Earth, ['wolf_skull_helm', 'battle_boots'], 185, MINOR_REALM.PEAK, '狗'),

    // === [2] Foundation (築基) ===
    'm20_c1': createEnemy('m20_c1', '古道霜狼', MajorRealm.Foundation, EnemyRank.Common, 6000, 800, 400, ElementType.Water, [], 400, MINOR_REALM.INITIAL, '狼'),
    'm20_c2': createEnemy('m20_c2', '雪原凍兔', MajorRealm.Foundation, EnemyRank.Common, 4500, 900, 200, ElementType.Water, [], 380, MINOR_REALM.INITIAL, '兔'),
    'm21_c1': createEnemy('m21_c1', '峽谷冰蠶', MajorRealm.Foundation, EnemyRank.Common, 5500, 850, 450, ElementType.Water, [], 420, MINOR_REALM.INITIAL, '蠶'),
    'm21_c2': createEnemy('m21_c2', '玄冰翼鳥', MajorRealm.Foundation, EnemyRank.Common, 5000, 950, 300, ElementType.Water, [], 450, MINOR_REALM.INITIAL, '鳥'),
    'm22_c1': createEnemy('m22_c1', '懸崖雷鵬', MajorRealm.Foundation, EnemyRank.Common, 7000, 1000, 500, ElementType.Metal, [], 500, MINOR_REALM.INITIAL, '鵬'),
    'm22_c2': createEnemy('m22_c2', '落雷岩精', MajorRealm.Foundation, EnemyRank.Common, 9000, 800, 800, ElementType.Earth, [], 550, MINOR_REALM.INITIAL, '岩'),
    'm23_c1': createEnemy('m23_c1', '荒原烈蟻', MajorRealm.Foundation, EnemyRank.Common, 6500, 900, 500, ElementType.Fire, [], 480, MINOR_REALM.MID, '蟻'),
    'm23_c2': createEnemy('m23_c2', '地火蠍', MajorRealm.Foundation, EnemyRank.Common, 7000, 950, 600, ElementType.Fire, [], 520, MINOR_REALM.MID, '蠍'),
    'm24_c1': createEnemy('m24_c1', '流道炎魔', MajorRealm.Foundation, EnemyRank.Common, 8000, 1000, 700, ElementType.Fire, [], 600, MINOR_REALM.MID, '魔'),
    'm24_c2': createEnemy('m24_c2', '熔岩爬行者', MajorRealm.Foundation, EnemyRank.Common, 7500, 1100, 500, ElementType.Fire, [], 620, MINOR_REALM.MID, '爬'),
    'm25_c1': createEnemy('m25_c1', '暗河影魚', MajorRealm.Foundation, EnemyRank.Common, 6000, 1000, 400, ElementType.Water, [], 580, MINOR_REALM.MID, '魚'),
    'm25_c2': createEnemy('m25_c2', '地心水妖', MajorRealm.Foundation, EnemyRank.Common, 8500, 900, 650, ElementType.Water, [], 600, MINOR_REALM.MID, '妖'),
    'm26_c1': createEnemy('m26_c1', '裂谷獄龍', MajorRealm.Foundation, EnemyRank.Common, 12000, 1200, 1000, ElementType.Fire, [], 800, MINOR_REALM.MID, '龍'),
    'm26_c2': createEnemy('m26_c2', '焦炎巨人', MajorRealm.Foundation, EnemyRank.Common, 15000, 1000, 1200, ElementType.Fire, [], 850, MINOR_REALM.MID, '人'),
    'm27_c1': createEnemy('m27_c1', '焦土遺民', MajorRealm.Foundation, EnemyRank.Common, 5000, 1000, 400, ElementType.Earth, [], 500, MINOR_REALM.MID, '民'),
    'm27_c2': createEnemy('m27_c2', '焚天烏鴉', MajorRealm.Foundation, EnemyRank.Common, 4500, 1100, 300, ElementType.Fire, [], 520, MINOR_REALM.MID, '鴉'),
    'm28_c1': createEnemy('m28_c1', '遺跡亡兵', MajorRealm.Foundation, EnemyRank.Common, 8000, 900, 700, ElementType.Metal, [], 550, MINOR_REALM.LATE, '兵'),
    'm28_c2': createEnemy('m28_c2', '古戰場殘魂', MajorRealm.Foundation, EnemyRank.Common, 6000, 1100, 300, ElementType.None, [], 580, MINOR_REALM.LATE, '魂'),
    'm29_c1': createEnemy('m29_c1', '石塔陣靈', MajorRealm.Foundation, EnemyRank.Common, 10000, 1100, 800, ElementType.Metal, [], 650, MINOR_REALM.LATE, '靈'),
    'm29_c2': createEnemy('m29_c2', '守塔飛蟻', MajorRealm.Foundation, EnemyRank.Common, 7000, 1200, 500, ElementType.Wood, [], 680, MINOR_REALM.LATE, '蟻'),
    'm30_c1': createEnemy('m30_c1', '陰風蝙蝠', MajorRealm.Foundation, EnemyRank.Common, 6500, 1100, 400, ElementType.Wood, [], 620, MINOR_REALM.LATE, '蝠'),
    'm30_c2': createEnemy('m30_c2', '窟中影魅', MajorRealm.Foundation, EnemyRank.Common, 7500, 1200, 300, ElementType.None, [], 650, MINOR_REALM.LATE, '魅'),
    'm31_c1': createEnemy('m31_c1', '密林蜘蛛', MajorRealm.Foundation, EnemyRank.Common, 8000, 1000, 600, ElementType.Wood, [], 600, MINOR_REALM.LATE, '蛛'),
    'm31_c2': createEnemy('m31_c2', '幽暗豹妖', MajorRealm.Foundation, EnemyRank.Common, 9000, 1100, 500, ElementType.Wood, [], 650, MINOR_REALM.LATE, '豹'),
    'm32_c1': createEnemy('m32_c1', '岩窟巨蠍', MajorRealm.Foundation, EnemyRank.Common, 11000, 1000, 900, ElementType.Earth, [], 700, MINOR_REALM.PEAK, '蠍'),
    'm32_c2': createEnemy('m32_c2', '盤龍石蜥', MajorRealm.Foundation, EnemyRank.Common, 10000, 1100, 800, ElementType.Earth, [], 720, MINOR_REALM.PEAK, '蜥'),
    'm33_c1': createEnemy('m33_c1', '深林斑彪', MajorRealm.Foundation, EnemyRank.Common, 9500, 1200, 600, ElementType.Wood, [], 750, MINOR_REALM.PEAK, '彪'),
    'm33_c2': createEnemy('m33_c2', '哮林狂豬', MajorRealm.Foundation, EnemyRank.Common, 12000, 1000, 800, ElementType.Earth, [], 780, MINOR_REALM.PEAK, '豬'),
    'm34_c1': createEnemy('m34_c1', '巢穴雛獸', MajorRealm.Foundation, EnemyRank.Common, 8000, 1300, 500, ElementType.Wood, [], 800, MINOR_REALM.PEAK, '雛'),
    'm34_c2': createEnemy('m34_c2', '守巢魔犬', MajorRealm.Foundation, EnemyRank.Common, 11000, 1200, 700, ElementType.Earth, [], 850, MINOR_REALM.PEAK, '犬'),

    // === [3] Golden Core (金丹) ===
    'm35_c1': createEnemy('m35_c1', '幻海妖靈', MajorRealm.GoldenCore, EnemyRank.Common, 25000, 2500, 1200, ElementType.Water, [], 1500, MINOR_REALM.INITIAL, '靈'),
    'm35_c2': createEnemy('m35_c2', '迷霧幻鴿', MajorRealm.GoldenCore, EnemyRank.Common, 20000, 2800, 800, ElementType.Wood, [], 1600, MINOR_REALM.INITIAL, '鴿'),
    'm36_c1': createEnemy('m36_c1', '石林傀儡', MajorRealm.GoldenCore, EnemyRank.Common, 35000, 2200, 2000, ElementType.Earth, [], 1800, MINOR_REALM.INITIAL, '儡'),
    'm36_c2': createEnemy('m36_c2', '陣紋幻影', MajorRealm.GoldenCore, EnemyRank.Common, 28000, 2600, 1500, ElementType.None, [], 1700, MINOR_REALM.INITIAL, '影'),
    'm37_c1': createEnemy('m37_c1', '神海護衛', MajorRealm.GoldenCore, EnemyRank.Common, 30000, 3000, 1800, ElementType.Water, [], 2000, MINOR_REALM.MID, '衛'),
    'm37_c2': createEnemy('m37_c2', '問心幻象', MajorRealm.GoldenCore, EnemyRank.Common, 25000, 3500, 1200, ElementType.None, [], 2200, MINOR_REALM.MID, '幻'),
    'm38_c1': createEnemy('m38_c1', '灘塗毒蟒', MajorRealm.GoldenCore, EnemyRank.Common, 22000, 3200, 1000, ElementType.Water, [], 1900, MINOR_REALM.MID, '蟒'),
    'm38_c2': createEnemy('m38_c2', '腐蝕蟹妖', MajorRealm.GoldenCore, EnemyRank.Common, 32000, 2800, 2200, ElementType.Water, [], 2000, MINOR_REALM.MID, '蟹'),
    'm39_c1': createEnemy('m39_c1', '古城遺魂', MajorRealm.GoldenCore, EnemyRank.Common, 28000, 3000, 1500, ElementType.None, [], 2100, MINOR_REALM.LATE, '魂'),
    'm39_c2': createEnemy('m39_c2', '深海守衛者', MajorRealm.GoldenCore, EnemyRank.Common, 35000, 2800, 2000, ElementType.Water, [], 2200, MINOR_REALM.LATE, '衛'),
    'm40_c1': createEnemy('m40_c1', '地宮甲士', MajorRealm.GoldenCore, EnemyRank.Common, 40000, 2500, 2500, ElementType.Earth, [], 2300, MINOR_REALM.LATE, '士'),
    'm40_c2': createEnemy('m40_c2', '幽冥殺手', MajorRealm.GoldenCore, EnemyRank.Common, 26000, 3800, 1000, ElementType.None, [], 2400, MINOR_REALM.LATE, '殺'),
    'm41_c1': createEnemy('m41_c1', '禁制殘影', MajorRealm.GoldenCore, EnemyRank.Common, 24000, 4000, 800, ElementType.Metal, [], 2500, MINOR_REALM.PEAK, '影'),
    'm41_c2': createEnemy('m41_c2', '崩壞精靈', MajorRealm.GoldenCore, EnemyRank.Common, 30000, 3500, 1200, ElementType.None, [], 2600, MINOR_REALM.PEAK, '精'),
    'm42_c1': createEnemy('m42_c1', '石窟魔蛛', MajorRealm.GoldenCore, EnemyRank.Common, 32000, 3200, 1800, ElementType.Wood, [], 2400, MINOR_REALM.PEAK, '蛛'),
    'm42_c2': createEnemy('m42_c2', '窟中翼魔', MajorRealm.GoldenCore, EnemyRank.Common, 28000, 3600, 1200, ElementType.None, [], 2500, MINOR_REALM.PEAK, '魔'),

    // === [4] Nascent Soul (元嬰) ===
    'm43_c1': createEnemy('m43_c1', '荒古幽靈', MajorRealm.NascentSoul, EnemyRank.Common, 100000, 8000, 4000, ElementType.None, [], 8000, MINOR_REALM.INITIAL, '靈'),
    'm43_c2': createEnemy('m43_c2', '虛空碎塊靈', MajorRealm.NascentSoul, EnemyRank.Common, 80000, 10000, 2000, ElementType.None, [], 8500, MINOR_REALM.INITIAL, '塊'),
    'm44_c1': createEnemy('m44_c1', '守劍殘魂', MajorRealm.NascentSoul, EnemyRank.Common, 110000, 9000, 5000, ElementType.Metal, [], 9000, MINOR_REALM.MID, '魂'),
    'm44_c2': createEnemy('m44_c2', '塚中劍意', MajorRealm.NascentSoul, EnemyRank.Common, 70000, 12000, 1000, ElementType.Metal, [], 9500, MINOR_REALM.MID, '意'),
    'm45_c1': createEnemy('m45_c1', '荒漠乾屍', MajorRealm.NascentSoul, EnemyRank.Common, 150000, 7000, 8000, ElementType.Earth, [], 10000, MINOR_REALM.MID, '屍'),
    'm45_c2': createEnemy('m45_c2', '枯萎靈魂', MajorRealm.NascentSoul, EnemyRank.Common, 90000, 11000, 3000, ElementType.None, [], 10500, MINOR_REALM.MID, '魂'),
    'm46_c1': createEnemy('m46_c1', '星原行者', MajorRealm.NascentSoul, EnemyRank.Common, 120000, 9000, 6000, ElementType.Earth, [], 11000, MINOR_REALM.LATE, '行'),
    'm46_c2': createEnemy('m46_c2', '流湮狂徒', MajorRealm.NascentSoul, EnemyRank.Common, 100000, 10000, 4000, ElementType.Earth, [], 11500, MINOR_REALM.LATE, '徒'),
    'm47_c1': createEnemy('m47_c1', '塔中守衛像', MajorRealm.NascentSoul, EnemyRank.Common, 180000, 8000, 10000, ElementType.Earth, [], 12000, MINOR_REALM.LATE, '像'),
    'm47_c2': createEnemy('m47_c2', '擎天靈光', MajorRealm.NascentSoul, EnemyRank.Common, 110000, 12000, 4000, ElementType.Metal, [], 12500, MINOR_REALM.LATE, '光'),
    'm48_c1': createEnemy('m48_c1', '陵寢血侍', MajorRealm.NascentSoul, EnemyRank.Common, 200000, 10000, 10000, ElementType.Metal, [], 15000, MINOR_REALM.PEAK, '侍'),
    'm48_c2': createEnemy('m48_c2', '不朽殘念', MajorRealm.NascentSoul, EnemyRank.Common, 150000, 15000, 5000, ElementType.None, [], 16000, MINOR_REALM.PEAK, '念'),

    // === [5] Spirit Severing (化神) ===
    'm49_c1': createEnemy('m49_c1', '浮空島羽民', MajorRealm.SpiritSevering, EnemyRank.Common, 300000, 25000, 15000, ElementType.Metal, [], 50000, MINOR_REALM.INITIAL, '羽'),
    'm49_c2': createEnemy('m49_c2', '摘星靈貓', MajorRealm.SpiritSevering, EnemyRank.Common, 250000, 30000, 10000, ElementType.Wood, [], 52000, MINOR_REALM.INITIAL, '貓'),
    'm50_c1': createEnemy('m50_c1', '倒置界影龍', MajorRealm.SpiritSevering, EnemyRank.Common, 450000, 35000, 25000, ElementType.None, [], 60000, MINOR_REALM.MID, '龍'),
    'm50_c2': createEnemy('m50_c2', '逆亂陰陽手', MajorRealm.SpiritSevering, EnemyRank.Common, 350000, 40000, 15000, ElementType.None, [], 65000, MINOR_REALM.MID, '手'),
    'm51_c1': createEnemy('m51_c1', '劫海雷蛟', MajorRealm.SpiritSevering, EnemyRank.Common, 500000, 40000, 30000, ElementType.Metal, [], 75000, MINOR_REALM.LATE, '蛟'),
    'm51_c2': createEnemy('m51_c2', '漿怒濤靈', MajorRealm.SpiritSevering, EnemyRank.Common, 400000, 50000, 20000, ElementType.Metal, [], 80000, MINOR_REALM.LATE, '靈'),

    // === [6] Void Refining (煉虛) ===
    'm52_c1': createEnemy('m52_c1', '虛無吞噬者', MajorRealm.VoidRefining, EnemyRank.Common, 800000, 60000, 40000, ElementType.None, [], 150000, MINOR_REALM.INITIAL, '噬'),
    'm52_c2': createEnemy('m52_c2', '寂滅靈火', MajorRealm.VoidRefining, EnemyRank.Common, 600000, 80000, 20000, ElementType.None, [], 160000, MINOR_REALM.INITIAL, '火'),
    'm53_c1': createEnemy('m53_c1', '試煉身', MajorRealm.VoidRefining, EnemyRank.Common, 1000000, 70000, 50000, ElementType.None, [], 180000, MINOR_REALM.MID, '身'),
    'm53_c2': createEnemy('m53_c2', '心魔之翼', MajorRealm.VoidRefining, EnemyRank.Common, 700000, 90000, 30000, ElementType.None, [], 190000, MINOR_REALM.MID, '翼'),
    'm54_c1': createEnemy('m54_c1', '幻境守門人', MajorRealm.VoidRefining, EnemyRank.Common, 1200000, 80000, 60000, ElementType.None, [], 220000, MINOR_REALM.LATE, '門'),
    'm54_c2': createEnemy('m54_c2', '太虛迷夢', MajorRealm.VoidRefining, EnemyRank.Common, 900000, 100000, 40000, ElementType.None, [], 250000, MINOR_REALM.LATE, '夢'),

    // === [7] Fusion (合體) ===
    'm55_c1': createEnemy('m55_c1', '崩壞碎片靈', MajorRealm.Fusion, EnemyRank.Common, 2000000, 150000, 100000, ElementType.None, [], 500000, MINOR_REALM.INITIAL, '碎'),
    'm55_c2': createEnemy('m55_c2', '時空撕裂爪', MajorRealm.Fusion, EnemyRank.Common, 1500000, 200000, 60000, ElementType.None, [], 550000, MINOR_REALM.INITIAL, '爪'),
    'm56_c1': createEnemy('m56_c1', '天罰雷兵', MajorRealm.Fusion, EnemyRank.Common, 2500000, 180000, 120000, ElementType.Metal, [], 650000, MINOR_REALM.MID, '兵'),
    'm56_c2': createEnemy('m56_c2', '滅世霆怒', MajorRealm.Fusion, EnemyRank.Common, 1800000, 250000, 80000, ElementType.Metal, [], 700000, MINOR_REALM.MID, '怒'),
    'm57_c1': createEnemy('m57_c1', '樞紐觀察者', MajorRealm.Fusion, EnemyRank.Common, 3000000, 200000, 150000, ElementType.None, [], 850000, MINOR_REALM.LATE, '觀'),
    'm57_c2': createEnemy('m57_c2', '異次元來客', MajorRealm.Fusion, EnemyRank.Common, 2200000, 280000, 100000, ElementType.None, [], 900000, MINOR_REALM.LATE, '客'),

    // === [8] Mahayana (大乘) ===
    'm58_c1': createEnemy('m58_c1', '衝擊失敗者的執念', MajorRealm.Mahayana, EnemyRank.Common, 8000000, 600000, 300000, ElementType.None, [], 2000000, MINOR_REALM.INITIAL, '念'),
    'm58_c2': createEnemy('m58_c2', '墜星火魅', MajorRealm.Mahayana, EnemyRank.Common, 6000000, 800000, 200000, ElementType.Fire, [], 2200000, MINOR_REALM.INITIAL, '魅'),
    'm59_c1': createEnemy('m59_c1', '銀河守衛者', MajorRealm.Mahayana, EnemyRank.Common, 12000000, 700000, 500000, ElementType.Metal, [], 3500000, MINOR_REALM.PEAK, '衛'),
    'm59_c2': createEnemy('m59_c2', '盡頭吞噬者', MajorRealm.Mahayana, EnemyRank.Common, 9000000, 900000, 300000, ElementType.None, [], 3800000, MINOR_REALM.PEAK, '吞'),

    // === [9] Tribulation (渡劫) ===
    'm60_c1': createEnemy('m60_c1', '劫雲雷龍', MajorRealm.Tribulation, EnemyRank.Common, 25000000, 1500000, 800000, ElementType.Fire, [], 8000000, MINOR_REALM.INITIAL, '龍'),
    'm60_c2': createEnemy('m60_c2', '毀滅意志', MajorRealm.Tribulation, EnemyRank.Common, 20000000, 2000000, 500000, ElementType.None, [], 8500000, MINOR_REALM.INITIAL, '志'),
    'm61_c1': createEnemy('m61_c1', '天道拷問者', MajorRealm.Tribulation, EnemyRank.Common, 35000000, 1800000, 1200000, ElementType.None, [], 12000000, MINOR_REALM.PEAK, '拷'),
    'm61_c2': createEnemy('m61_c2', '因果鎖鏈', MajorRealm.Tribulation, EnemyRank.Common, 28000000, 2500000, 800000, ElementType.Metal, [], 13000000, MINOR_REALM.PEAK, '鏈'),

    // === [10] Immortal (仙人) ===
    'm62_c1': createEnemy('m62_c1', '接引仙童', MajorRealm.Immortal, EnemyRank.Common, 150000000, 5000000, 3000000, ElementType.Metal, [], 50000000, MINOR_REALM.INITIAL, '童'),
    'm62_c2': createEnemy('m62_c2', '飛昇遺留者', MajorRealm.Immortal, EnemyRank.Common, 120000000, 6000000, 2000000, ElementType.None, [], 55000000, MINOR_REALM.INITIAL, '者'),
    'm63_c1': createEnemy('m63_c1', '仙域神駒', MajorRealm.Immortal, EnemyRank.Common, 200000000, 6000000, 4000000, ElementType.Wood, [], 65000000, MINOR_REALM.MID, '駒'),
    'm63_c2': createEnemy('m63_c2', '長生樹精', MajorRealm.Immortal, EnemyRank.Common, 180000000, 8000000, 3000000, ElementType.Wood, [], 70000000, MINOR_REALM.MID, '精'),
    'm64_c1': createEnemy('m64_c1', '天闕禁衛', MajorRealm.Immortal, EnemyRank.Common, 300000000, 8000000, 6000000, ElementType.Metal, [], 100000000, MINOR_REALM.LATE, '衛'),
    'm64_c2': createEnemy('m64_c2', '金光幻影', MajorRealm.Immortal, EnemyRank.Common, 250000000, 10000000, 4000000, ElementType.Metal, [], 110000000, MINOR_REALM.LATE, '影'),
    'm65_c1': createEnemy('m65_c1', '法則之靈', MajorRealm.Immortal, EnemyRank.Common, 400000000, 10000000, 8000000, ElementType.Water, [], 150000000, MINOR_REALM.PEAK, '靈'),
    'm65_c2': createEnemy('m65_c2', '大道殘影', MajorRealm.Immortal, EnemyRank.Common, 350000000, 12000000, 6000000, ElementType.None, [], 160000000, MINOR_REALM.PEAK, '影'),
    'm66_c1': createEnemy('m66_c1', '混沌妖僕', MajorRealm.Immortal, EnemyRank.Common, 500000000, 12000000, 10000000, ElementType.None, [], 200000000, MINOR_REALM.PEAK, '僕'),
    'm66_c2': createEnemy('m66_c2', '起源之爪', MajorRealm.Immortal, EnemyRank.Common, 450000000, 15000000, 7000000, ElementType.None, [], 220000000, MINOR_REALM.PEAK, '爪'),

    // === [11] Immortal Emperor (仙帝) ===
    'm67_c1': createEnemy('m67_c1', '因果審判者', MajorRealm.ImmortalEmperor, EnemyRank.Common, 1000000000, 50000000, 25000000, ElementType.None, [], 500000000, MINOR_REALM.INITIAL, '判'),
    'm67_c2': createEnemy('m67_c2', '萬古寂滅者', MajorRealm.ImmortalEmperor, EnemyRank.Common, 1300000000, 60000000, 24000000, ElementType.None, [], 600000000, MINOR_REALM.LATE, '滅'),
}
