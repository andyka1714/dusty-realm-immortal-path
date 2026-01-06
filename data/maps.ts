
import { MapData, MajorRealm, ElementType, Enemy, EnemyRank } from '../types';

// Helper to generate enemies
const createEnemy = (
    id: string, name: string, realm: MajorRealm, rank: EnemyRank, 
    hp: number, atk: number, def: number, ele: ElementType, 
    drops: string[], exp: number
): Enemy => ({
    id, name, realm, rank, hp, maxHp: hp, attack: atk, defense: def, element: ele, drops, exp
});

// --- BESTIARY DEFINITION ---
const BESTIARY: Record<string, Enemy> = {
    // --- Mortal & Qi ---
    'flower_spirit': createEnemy('flower_spirit', '採花小妖', MajorRealm.Mortal, EnemyRank.Common, 40, 8, 1, ElementType.Wood, ['spirit_herb'], 5),
    'grey_fox': createEnemy('grey_fox', '山野灰狐', MajorRealm.Mortal, EnemyRank.Common, 45, 10, 2, ElementType.Earth, [], 6),
    'stone_spirit': createEnemy('stone_spirit', '巡山石精', MajorRealm.Mortal, EnemyRank.Elite, 200, 20, 10, ElementType.Earth, ['iron_ore'], 30),
    'wind_wolf': createEnemy('wind_wolf', '疾風野狼', MajorRealm.Mortal, EnemyRank.Common, 60, 15, 3, ElementType.Wood, ['wolf_fang'], 8),
    'poison_bee': createEnemy('poison_bee', '吸血毒蜂', MajorRealm.Mortal, EnemyRank.Common, 30, 20, 0, ElementType.Wood, [], 8),
    'wolf_king': createEnemy('wolf_king', '嘯月狼將', MajorRealm.Mortal, EnemyRank.Elite, 300, 30, 15, ElementType.Metal, ['wolf_fang'], 40),
    'corpse': createEnemy('corpse', '掘地腐屍', MajorRealm.Mortal, EnemyRank.Common, 80, 12, 5, ElementType.Earth, [], 10),
    'ghost': createEnemy('ghost', '荒塚冤魂', MajorRealm.Mortal, EnemyRank.Common, 50, 18, 2, ElementType.Water, [], 10),
    'zombie_guard': createEnemy('zombie_guard', '守墓殭屍', MajorRealm.Mortal, EnemyRank.Elite, 400, 35, 20, ElementType.Earth, [], 50),
    
    // Bosses
    'boss_old_corpse': createEnemy('boss_old_corpse', '守塚老屍', MajorRealm.Mortal, EnemyRank.Boss, 800, 45, 25, ElementType.Earth, ['spirit_stone'], 100),
    'boss_wolf_king_real': createEnemy('boss_wolf_king_real', '裂風狼王', MajorRealm.QiRefining, EnemyRank.Boss, 1800, 80, 30, ElementType.Wood, ['wolf_fang', 'bt_mortal_qi'], 200),
    'boss_frost_ape': createEnemy('boss_frost_ape', '寒霜白猿', MajorRealm.QiRefining, EnemyRank.Boss, 2500, 100, 60, ElementType.Water, [], 300),
    'boss_ink_monster': createEnemy('boss_ink_monster', '墨色水怪', MajorRealm.QiRefining, EnemyRank.Boss, 3000, 90, 50, ElementType.Water, ['bt_qi_foundation'], 400),
    'boss_thunder_falcon': createEnemy('boss_thunder_falcon', '雷翼大隼', MajorRealm.QiRefining, EnemyRank.Boss, 2200, 130, 40, ElementType.Metal, [], 350),
    'boss_tiger_king': createEnemy('boss_tiger_king', '金睛虎王', MajorRealm.QiRefining, EnemyRank.Boss, 3200, 120, 70, ElementType.Wood, ['wolf_fang'], 450),

    // --- Foundation & Golden Core ---
    'fire_ant': createEnemy('fire_ant', '地火工蟻', MajorRealm.Foundation, EnemyRank.Common, 600, 100, 50, ElementType.Fire, [], 100),
    'scorpion': createEnemy('scorpion', '赤岩毒蝎', MajorRealm.Foundation, EnemyRank.Common, 700, 120, 60, ElementType.Earth, [], 110),
    'lava_demon': createEnemy('lava_demon', '熔岩火魃', MajorRealm.Foundation, EnemyRank.Elite, 3000, 250, 150, ElementType.Fire, ['iron_ore'], 500),
    'sand_snake': createEnemy('sand_snake', '負沙毒蛇', MajorRealm.Foundation, EnemyRank.Common, 650, 130, 40, ElementType.Earth, [], 120),
    'dry_corpse': createEnemy('dry_corpse', '風乾行屍', MajorRealm.Foundation, EnemyRank.Common, 800, 110, 70, ElementType.Earth, [], 120),
    'fire_charm': createEnemy('fire_charm', '煉獄火魅', MajorRealm.Foundation, EnemyRank.Common, 700, 150, 30, ElementType.Fire, [], 140),
    'spider_queen': createEnemy('spider_queen', '人面魔蛛', MajorRealm.Foundation, EnemyRank.Elite, 4500, 320, 220, ElementType.Wood, [], 650),
    
    'boss_polar_sword': createEnemy('boss_polar_sword', '極地劍靈', MajorRealm.Foundation, EnemyRank.Boss, 8000, 350, 150, ElementType.Water, [], 1500),
    'boss_demon': createEnemy('boss_demon', '烈焰妖王', MajorRealm.Foundation, EnemyRank.Boss, 10000, 450, 300, ElementType.Fire, ['bt_foundation_gold'], 2000),
    'boss_thunder_lord': createEnemy('boss_thunder_lord', '雷澤領主', MajorRealm.Foundation, EnemyRank.Boss, 9000, 500, 200, ElementType.Metal, [], 1800),
    'boss_beast_king': createEnemy('boss_beast_king', '萬獸獸王', MajorRealm.Foundation, EnemyRank.Boss, 12000, 400, 250, ElementType.Wood, [], 2200),

    'mist_butterfly': createEnemy('mist_butterfly', '迷霧蝶妖', MajorRealm.GoldenCore, EnemyRank.Common, 2500, 350, 100, ElementType.Wood, [], 500),
    'swamp_vine': createEnemy('swamp_vine', '腐水蔓藤', MajorRealm.GoldenCore, EnemyRank.Common, 3000, 300, 150, ElementType.Wood, [], 500),
    'stone_guardian': createEnemy('stone_guardian', '破障石像生', MajorRealm.GoldenCore, EnemyRank.Elite, 15000, 750, 500, ElementType.Earth, [], 2200),
    'mermaid': createEnemy('mermaid', '深海鮫人', MajorRealm.GoldenCore, EnemyRank.Common, 4000, 330, 160, ElementType.Water, [], 600),
    
    'boss_illusion': createEnemy('boss_illusion', '蜃樓主', MajorRealm.GoldenCore, EnemyRank.Boss, 40000, 1200, 800, ElementType.Water, ['bt_gold_nascent'], 8000),
    'boss_spider_mother': createEnemy('boss_spider_mother', '百眼蛛母', MajorRealm.GoldenCore, EnemyRank.Boss, 45000, 1100, 900, ElementType.Wood, [], 8500),

    // --- Nascent Soul & Above ---
    'ruin_armor': createEnemy('ruin_armor', '殘破甲冑', MajorRealm.NascentSoul, EnemyRank.Common, 10000, 1000, 800, ElementType.Metal, [], 2000),
    'blood_sword': createEnemy('blood_sword', '嗜血殘劍', MajorRealm.NascentSoul, EnemyRank.Common, 9500, 1300, 500, ElementType.Metal, [], 2200),
    'sword_slave': createEnemy('sword_slave', '守劍劍奴', MajorRealm.NascentSoul, EnemyRank.Elite, 45000, 2500, 1500, ElementType.Metal, [], 9000),
    
    'boss_nameless_sword': createEnemy('boss_nameless_sword', '無名劍修', MajorRealm.NascentSoul, EnemyRank.Boss, 120000, 3500, 1500, ElementType.Metal, [], 25000),
    'boss_stardust_giant': createEnemy('boss_stardust_giant', '星塵巨人', MajorRealm.NascentSoul, EnemyRank.Boss, 180000, 3000, 3000, ElementType.Earth, [], 28000),
    'boss_corpse': createEnemy('boss_corpse', '屍皇', MajorRealm.NascentSoul, EnemyRank.Boss, 150000, 4000, 2500, ElementType.Earth, ['bt_nascent_spirit'], 30000),

    'star_fragment': createEnemy('star_fragment', '碎星靈', MajorRealm.SpiritSevering, EnemyRank.Common, 40000, 3000, 1500, ElementType.Metal, [], 8000),
    'tower_guard': createEnemy('tower_guard', '塔靈守衛', MajorRealm.SpiritSevering, EnemyRank.Elite, 850000, 22000, 11000, ElementType.Metal, [], 130000),
    
    'thunder_beast': createEnemy('thunder_beast', '霆祖', MajorRealm.SpiritSevering, EnemyRank.Boss, 600000, 10000, 5000, ElementType.Metal, ['bt_spirit_fusion'], 100000),
    'void_guard': createEnemy('void_guard', '虛空守衛', MajorRealm.Fusion, EnemyRank.Boss, 3000000, 30000, 15000, ElementType.None, ['bt_fusion_maha'], 500000),
    'star_god': createEnemy('star_god', '古神 · 星緯', MajorRealm.Mahayana, EnemyRank.Boss, 15000000, 80000, 40000, ElementType.Earth, ['bt_maha_golden'], 2000000),
    'chaos_shadow': createEnemy('chaos_shadow', '鴻蒙之影', MajorRealm.GoldenImmortal, EnemyRank.Boss, 100000000, 200000, 100000, ElementType.Metal, ['bt_golden_emperor'], 10000000),
    'boss_final': createEnemy('boss_final', '天道意志 · 因果法身', MajorRealm.ImmortalEmperor, EnemyRank.Boss, 999999999, 500000, 500000, ElementType.None, [], 0),
    
    // Fillers for generic maps
    'water_ghost': createEnemy('water_ghost', '湖底水鬼', MajorRealm.QiRefining, EnemyRank.Common, 150, 30, 10, ElementType.Water, [], 20),
    'void_ripper': createEnemy('void_ripper', '撕裂者', MajorRealm.Fusion, EnemyRank.Common, 900000, 24000, 12000, ElementType.None, [], 140000),
    'koi': createEnemy('koi', '點靈錦鯉', MajorRealm.QiRefining, EnemyRank.Common, 120, 25, 15, ElementType.Water, ['spirit_stone'], 25),
};

const BOSS_MAPPING: Record<string, string> = {
    "守塚老屍": 'boss_old_corpse',
    "裂風狼王": 'boss_wolf_king_real',
    "寒霜白猿": 'boss_frost_ape',
    "墨色水怪": 'boss_ink_monster',
    "雷翼大隼": 'boss_thunder_falcon',
    "金睛虎王": 'boss_tiger_king',
    "極地劍靈": 'boss_polar_sword',
    "烈焰妖王": 'boss_demon',
    "雷澤領主": 'boss_thunder_lord',
    "萬獸獸王": 'boss_beast_king',
    "蜃樓主": 'boss_illusion',
    "百眼蛛母": 'boss_spider_mother',
    "無名劍修": 'boss_nameless_sword',
    "星塵巨人": 'boss_stardust_giant',
    "屍皇": 'boss_corpse',
    "霆祖": 'thunder_beast',
    "虛空守衛": 'void_guard',
    "古神 · 星緯": 'star_god',
    "鴻蒙之影": 'chaos_shadow',
    "天道意志": 'boss_final',
    "天道意志 · 因果法身": 'boss_final',
};

// Merged Data from V60 Specification
const RAW_MAPS_V60 = [
  // --- Block 1: 0-19 ---
  {
    "id": 0, "name": "青雲仙宗", "realm": "凡人", "size": [40, 40], "pos": [0, 0], "theme": "Center",
    "description": "仙門聖地，受上古護宗大陣庇護，空氣中瀰漫著淡淡的檀香。",
    "portals": [
      { "target_id": 1, "dir": "North", "pos": [20, 0] },
      { "target_id": 2, "dir": "South", "pos": [20, 40] },
      { "target_id": 3, "dir": "East", "pos": [40, 20] },
      { "target_id": 4, "dir": "West", "pos": [0, 20] }
    ],
    "boss": null
  },
  {
    "id": 1, "name": "宗門後山", "realm": "凡人", "size": [60, 60], "pos": [0, 1], "theme": "North",
    "description": "靈藥採集地，是新手弟子練習引氣入體的好去處。",
    "portals": [
      { "target_id": 0, "dir": "South", "pos": [30, 60] },
      { "target_id": 5, "dir": "North", "pos": [30, 0] },
      { "target_id": 3, "dir": "SouthEast", "pos": [60, 60] }
    ],
    "boss": null
  },
  {
    "id": 2, "name": "仙緣鎮", "realm": "凡人", "size": [60, 60], "pos": [0, -1], "theme": "South",
    "description": "宗門下的繁華市集，聚集成千上萬尋求仙緣的凡人。",
    "portals": [
      { "target_id": 0, "dir": "North", "pos": [30, 0] },
      { "target_id": 6, "dir": "South", "pos": [30, 60] },
      { "target_id": 4, "dir": "NorthWest", "pos": [0, 0] }
    ],
    "boss": null
  },
  {
    "id": 3, "name": "靈湖草甸", "realm": "凡人", "size": [60, 60], "pos": [1, 0], "theme": "East",
    "description": "湖水如鏡，草長鶯飛。",
    "portals": [
      { "target_id": 0, "dir": "West", "pos": [0, 30] },
      { "target_id": 1, "dir": "NorthWest", "pos": [0, 0] },
      { "target_id": 2, "dir": "SouthWest", "pos": [0, 60] },
      { "target_id": 7, "dir": "South", "pos": [30, 60] }
    ],
    "boss": null
  },
  {
    "id": 4, "name": "外門試煉場", "realm": "凡人", "size": [60, 60], "pos": [-1, 0], "theme": "West",
    "description": "塵土飛揚的演武場，矗立著無數試煉石柱。",
    "portals": [
      { "target_id": 0, "dir": "East", "pos": [60, 30] },
      { "target_id": 2, "dir": "SouthEast", "pos": [60, 60] },
      { "target_id": 8, "dir": "West", "pos": [0, 30] }
    ],
    "boss": null
  },
  { "id": 5, "name": "北郊碎石坡", "realm": "凡人", "size": [60, 60], "pos": [1, 1], "theme": "North", "portals": [{ "target_id": 1, "dir": "West", "pos": [0, 30] }, { "target_id": 9, "dir": "North", "pos": [30, 0] }] },
  { "id": 6, "name": "南郊蘆葦蕩", "realm": "凡人", "size": [60, 60], "pos": [-1, -1], "theme": "South", "portals": [{ "target_id": 2, "dir": "East", "pos": [60, 30] }, { "target_id": 12, "dir": "South", "pos": [30, 60] }] },
  {
    "id": 7, "name": "東郊荒塚", "realm": "凡人", "size": [60, 60], "pos": [1, -1], "theme": "East", "description": "戰場遺址，孤魂低語。",
    "portals": [{ "target_id": 3, "dir": "North", "pos": [30, 0] }, { "target_id": 15, "dir": "East", "pos": [60, 30] }],
    "boss": { "name": "守塚老屍", "realm": "凡人巔峰", "element": "陰", "pos": [30, 30] }
  },
  {
    "id": 8, "name": "萬獸林入口", "realm": "練氣", "size": [100, 100], "pos": [-2, 0], "theme": "West",
    "portals": [{ "target_id": 4, "dir": "East", "pos": [100, 50] }, { "target_id": 18, "dir": "South", "pos": [50, 100] }],
    "boss": { "name": "裂風狼王", "realm": "練氣初期", "element": "風", "pos": [20, 50] }
  },
  { "id": 9, "name": "猿鳴雪峰底", "realm": "練氣", "size": [100, 100], "pos": [0, 2], "theme": "North", "portals": [{ "target_id": 5, "dir": "South", "pos": [50, 100] }, { "target_id": 10, "dir": "West", "pos": [0, 50] }] },
  { "id": 10, "name": "雲海棧道", "realm": "練氣", "size": [100, 100], "pos": [-1, 2], "theme": "North", "portals": [{ "target_id": 9, "dir": "East", "pos": [100, 50] }, { "target_id": 11, "dir": "North", "pos": [50, 0] }] },
  { "id": 11, "name": "北天門關", "realm": "練氣", "size": [100, 100], "pos": [-1, 3], "theme": "North", "portals": [{ "target_id": 10, "dir": "South", "pos": [50, 100] }, { "target_id": 20, "dir": "North", "pos": [50, 0] }], "boss": { "name": "寒霜白猿", "realm": "練氣圓滿", "element": "冰", "pos": [50, 20] } },
  { "id": 12, "name": "蘆葦腐澤區", "realm": "練氣", "size": [100, 100], "pos": [0, -2], "theme": "South", "portals": [{ "target_id": 6, "dir": "North", "pos": [50, 0] }, { "target_id": 13, "dir": "East", "pos": [100, 50] }] },
  { "id": 13, "name": "陰風谷口", "realm": "練氣", "size": [100, 100], "pos": [1, -2], "theme": "South", "portals": [{ "target_id": 12, "dir": "West", "pos": [0, 50] }, { "target_id": 14, "dir": "South", "pos": [50, 100] }] },
  { "id": 14, "name": "寒潭入口", "realm": "練氣", "size": [100, 100], "pos": [0, -3], "theme": "South", "portals": [{ "target_id": 13, "dir": "North", "pos": [50, 0] }, { "target_id": 27, "dir": "West", "pos": [0, 50] }], "boss": { "name": "墨色水怪", "realm": "練氣圓滿", "element": "水/毒", "pos": [50, 80] } },
  { "id": 15, "name": "東郊廢墟", "realm": "練氣", "size": [100, 100], "pos": [2, 0], "theme": "East", "portals": [{ "target_id": 7, "dir": "West", "pos": [0, 50] }, { "target_id": 16, "dir": "North", "pos": [50, 0] }] },
  { "id": 16, "name": "雷暴荒原", "realm": "練氣", "size": [100, 100], "pos": [2, 1], "theme": "East", "portals": [{ "target_id": 15, "dir": "South", "pos": [50, 100] }, { "target_id": 17, "dir": "East", "pos": [100, 50] }] },
  { "id": 17, "name": "寂滅雷澤口", "realm": "練氣", "size": [100, 100], "pos": [3, 1], "theme": "East", "portals": [{ "target_id": 16, "dir": "West", "pos": [0, 50] }, { "target_id": 30, "dir": "North", "pos": [50, 0] }], "boss": { "name": "雷翼大隼", "realm": "練氣圓滿", "element": "雷", "pos": [80, 50] } },
  { "id": 18, "name": "迷影叢林", "realm": "練氣", "size": [100, 100], "pos": [-2, -1], "theme": "West", "portals": [{ "target_id": 8, "dir": "North", "pos": [50, 0] }, { "target_id": 19, "dir": "West", "pos": [0, 50] }] },
  { "id": 19, "name": "萬獸林外圍", "realm": "練氣", "size": [100, 100], "pos": [-3, -1], "theme": "West", "portals": [{ "target_id": 18, "dir": "East", "pos": [100, 50] }, { "target_id": 33, "dir": "South", "pos": [50, 100] }], "boss": { "name": "金睛虎王", "realm": "練氣圓滿", "element": "物理", "pos": [20, 50] } },

  // --- Block 2: 20-34 ---
  { "id": 20, "name": "雪線古道", "realm": "築基", "size": [180, 180], "pos": [0, 4], "theme": "North", "portals": [{ "target_id": 11, "dir": "South", "pos": [90, 180] }, { "target_id": 21, "dir": "East", "pos": [180, 90] }] },
  { "id": 21, "name": "冰封峽谷", "realm": "築基", "size": [180, 180], "pos": [1, 4], "theme": "North", "portals": [{ "target_id": 20, "dir": "West", "pos": [0, 90] }, { "target_id": 22, "dir": "North", "pos": [90, 0] }] },
  { "id": 22, "name": "落雷懸崖", "realm": "築基", "size": [180, 180], "pos": [1, 5], "theme": "North", "portals": [{ "target_id": 21, "dir": "South", "pos": [90, 180] }, { "target_id": 35, "dir": "North", "pos": [90, 0] }], "boss": { "name": "極地劍靈", "realm": "築基圓滿", "element": "冰", "pos": [90, 40] } },
  { "id": 23, "name": "烈焰荒原", "realm": "築基", "size": [180, 180], "pos": [0, -4], "theme": "South", "portals": [{ "target_id": 14, "dir": "North", "pos": [90, 0] }, { "target_id": 24, "dir": "East", "pos": [180, 90] }, { "target_id": 27, "dir": "West", "pos": [0, 90] }] },
  { "id": 24, "name": "熔岩流道", "realm": "築基", "size": [180, 180], "pos": [1, -4], "theme": "South", "portals": [{ "target_id": 23, "dir": "West", "pos": [0, 90] }, { "target_id": 25, "dir": "South", "pos": [90, 180] }] },
  { "id": 25, "name": "地底暗河", "realm": "築基", "size": [180, 180], "pos": [1, -5], "theme": "South", "portals": [{ "target_id": 24, "dir": "North", "pos": [90, 0] }, { "target_id": 26, "dir": "West", "pos": [0, 90] }] },
  { "id": 26, "name": "赤紅裂谷", "realm": "築基", "size": [180, 180], "pos": [0, -5], "theme": "South", "portals": [{ "target_id": 25, "dir": "East", "pos": [180, 90] }, { "target_id": 38, "dir": "South", "pos": [90, 180] }], "boss": { "name": "烈焰妖王", "realm": "築基圓滿", "element": "火", "pos": [90, 140] } },
  { "id": 27, "name": "焦土小徑", "realm": "築基", "size": [180, 180], "pos": [-1, -4], "theme": "South", "portals": [{ "target_id": 14, "dir": "East", "pos": [180, 90] }, { "target_id": 23, "dir": "South", "pos": [90, 180] }] },
  { "id": 28, "name": "古戰場遺跡", "realm": "築基", "size": [180, 180], "pos": [4, 1], "theme": "East", "portals": [{ "target_id": 17, "dir": "West", "pos": [0, 90] }, { "target_id": 29, "dir": "North", "pos": [90, 0] }] },
  { "id": 29, "name": "沉沒石塔", "realm": "築基", "size": [180, 180], "pos": [4, 2], "theme": "East", "portals": [{ "target_id": 28, "dir": "South", "pos": [90, 180] }, { "target_id": 41, "dir": "North", "pos": [90, 0] }, { "target_id": 30, "dir": "West", "pos": [0, 90] }], "boss": { "name": "雷澤領主", "realm": "築基圓滿", "element": "雷", "pos": [140, 90] } },
  { "id": 30, "name": "陰風窟深處", "realm": "築基", "size": [180, 180], "pos": [3, 2], "theme": "East", "portals": [{ "target_id": 17, "dir": "South", "pos": [90, 180] }, { "target_id": 29, "dir": "East", "pos": [180, 90] }] },
  { "id": 31, "name": "幽暗密林", "realm": "築基", "size": [180, 180], "pos": [-4, -1], "theme": "West", "portals": [{ "target_id": 19, "dir": "East", "pos": [180, 90] }, { "target_id": 32, "dir": "South", "pos": [90, 180] }] },
  { "id": 32, "name": "盤龍岩窟", "realm": "築基", "size": [180, 180], "pos": [-4, -2], "theme": "West", "portals": [{ "target_id": 31, "dir": "North", "pos": [90, 0] }, { "target_id": 34, "dir": "West", "pos": [0, 90] }, { "target_id": 33, "dir": "East", "pos": [180, 90] }] },
  { "id": 33, "name": "虎嘯深林", "realm": "築基", "size": [180, 180], "pos": [-3, -2], "theme": "West", "portals": [{ "target_id": 19, "dir": "North", "pos": [90, 0] }, { "target_id": 32, "dir": "West", "pos": [0, 90] }] },
  { "id": 34, "name": "狂獸巢穴", "realm": "築基", "size": [180, 180], "pos": [-5, -2], "theme": "West", "portals": [{ "target_id": 32, "dir": "East", "pos": [180, 90] }, { "target_id": 42, "dir": "West", "pos": [0, 90] }], "boss": { "name": "萬獸獸王", "realm": "築基圓滿", "element": "物理", "pos": [40, 90] } },

  // --- Block 3: 35-42 ---
  {
    "id": 35, "name": "迷霧幻海", "realm": "金丹", "size": [150, 150], "pos": [0, 6], "theme": "North",
    "description": "波光粼粼卻迷霧重重，分不清天與海的界線。",
    "portals": [
      { "target_id": 22, "dir": "North", "pos": [75, 0] },
      { "target_id": 36, "dir": "West", "pos": [0, 75] }
    ],
    "boss": null
  },
  {
    "id": 36, "name": "千幻石林", "realm": "金丹", "size": [150, 150], "pos": [-1, 6], "theme": "North",
    "description": "每一根石柱都對應著一個幻陣，意志不堅者將永遠受困。",
    "portals": [
      { "target_id": 35, "dir": "East", "pos": [150, 75] },
      { "target_id": 43, "dir": "South", "pos": [75, 150] },
      { "target_id": 37, "dir": "South", "pos": [30, 150] }
    ],
    "boss": null
  },
  {
    "id": 37, "name": "幻夢神海", "realm": "金丹", "size": [150, 150], "pos": [0, 7], "theme": "North",
    "description": "金丹期修士的試煉終點，在這裡直面內心的恐懼。",
    "portals": [
      { "target_id": 36, "dir": "NorthWest", "pos": [0, 0] },
      { "target_id": 43, "dir": "South", "pos": [75, 150] }
    ],
    "boss": { "name": "蜃樓主", "realm": "金丹圓滿", "element": "幻/水", "pos": [75, 30], "desc": "製造分身。" }
  },
  {
    "id": 38, "name": "腐蝕灘塗", "realm": "金丹", "size": [150, 150], "pos": [0, -6], "theme": "South",
    "description": "充滿強酸性的海水不斷拍打著黑色礁石。",
    "portals": [
      { "target_id": 26, "dir": "North", "pos": [75, 0] },
      { "target_id": 39, "dir": "West", "pos": [0, 75] },
      { "target_id": 40, "dir": "East", "pos": [150, 75] }
    ],
    "boss": null
  },
  {
    "id": 39, "name": "沉沒古城", "realm": "金丹", "size": [150, 150], "pos": [-1, -6], "theme": "South",
    "description": "被淹沒在深海的輝煌城市，死寂中透露著威壓。",
    "portals": [
      { "target_id": 38, "dir": "East", "pos": [150, 75] },
      { "target_id": 45, "dir": "South", "pos": [75, 150] }
    ],
    "boss": null
  },
  {
    "id": 40, "name": "幽冥地宮", "realm": "金丹", "size": [150, 150], "pos": [1, -6], "theme": "South",
    "description": "隱藏在地底的陵墓，佈滿了針對神識的陰毒陷阱。",
    "portals": [
      { "target_id": 38, "dir": "West", "pos": [0, 75] },
      { "target_id": 45, "dir": "SouthWest", "pos": [0, 150] }
    ],
    "boss": null
  },
  {
    "id": 41, "name": "古禁制廢墟", "realm": "金丹", "size": [150, 150], "pos": [5, 2], "theme": "East",
    "description": "充滿了破碎的法則碎片，空間極其不穩定。",
    "portals": [
      { "target_id": 29, "dir": "West", "pos": [0, 75] },
      { "target_id": 48, "dir": "East", "pos": [150, 75] }
    ],
    "boss": null
  },
  {
    "id": 42, "name": "萬妖石窟", "realm": "金丹", "size": [150, 150], "pos": [-6, -2], "theme": "West",
    "description": "西方的最後屏障，萬千妖物匯聚於此。",
    "portals": [
      { "target_id": 34, "dir": "East", "pos": [150, 75] },
      { "target_id": 50, "dir": "West", "pos": [0, 75] }
    ],
    "boss": { "name": "百眼蛛母", "realm": "金丹圓滿", "element": "暗/毒", "pos": [20, 75] }
  },

  // --- Block 4: 43-54 ---
  { "id": 43, "name": "荒古遺地", "realm": "元嬰", "size": [120, 120], "pos": [0, 8], "theme": "North", "portals": [ { "target_id": 37, "dir": "North", "pos": [60, 0] }, { "target_id": 44, "dir": "East", "pos": [120, 60] }, { "target_id": 49, "dir": "West", "pos": [0, 60] } ] },
  { "id": 44, "name": "葬劍古塚", "realm": "元嬰", "size": [120, 120], "pos": [1, 8], "theme": "North", "portals": [ { "target_id": 43, "dir": "West", "pos": [0, 60] }, { "target_id": 52, "dir": "South", "pos": [60, 120] } ], "boss": { "name": "無名劍修", "realm": "元嬰大圓滿", "element": "物理/劍", "pos": [60, 30] } },
  { "id": 45, "name": "萬法枯竭荒漠", "realm": "元嬰", "size": [120, 120], "pos": [0, -8], "theme": "South", "portals": [ { "target_id": 39, "dir": "North", "pos": [60, 0] }, { "target_id": 40, "dir": "NorthEast", "pos": [120, 0] }, { "target_id": 46, "dir": "East", "pos": [120, 60] } ] },
  { "id": 46, "name": "寂滅星原", "realm": "元嬰", "size": [120, 120], "pos": [1, -8], "theme": "South", "portals": [ { "target_id": 45, "dir": "West", "pos": [0, 60] }, { "target_id": 53, "dir": "South", "pos": [60, 120] } ], "boss": { "name": "星塵巨人", "realm": "元嬰大圓滿", "element": "土/星辰", "pos": [60, 90] } },
  { "id": 47, "name": "鎮魔擎天塔", "realm": "元嬰", "size": [120, 120], "pos": [7, 2], "theme": "East", "portals": [ { "target_id": 41, "dir": "West", "pos": [0, 60] }, { "target_id": 48, "dir": "East", "pos": [120, 60] } ] },
  { "id": 48, "name": "不朽帝尊陵", "realm": "元嬰", "size": [120, 120], "pos": [8, 3], "theme": "East", "portals": [ { "target_id": 47, "dir": "West", "pos": [0, 60] }, { "target_id": 54, "dir": "East", "pos": [120, 60] } ], "boss": { "name": "屍皇", "realm": "元嬰巔峰", "element": "死/金", "pos": [90, 60] } },
  { "id": 49, "name": "碎星浮空島", "realm": "化神", "size": [120, 120], "pos": [-1, 8], "theme": "North", "portals": [ { "target_id": 43, "dir": "East", "pos": [120, 60] } ] },
  { "id": 50, "name": "乾坤倒置界", "realm": "化神", "size": [120, 120], "pos": [-7, -3], "theme": "West", "portals": [ { "target_id": 42, "dir": "East", "pos": [120, 60] }, { "target_id": 51, "dir": "West", "pos": [0, 60] } ] },
  { "id": 51, "name": "九天劫海", "realm": "化神", "size": [120, 120], "pos": [-8, -4], "theme": "West", "portals": [ { "target_id": 50, "dir": "East", "pos": [120, 60] }, { "target_id": 52, "dir": "North", "pos": [60, 0] } ], "boss": { "name": "霆祖", "realm": "化神圓滿", "element": "雷/罰", "pos": [30, 60] } },
  { "id": 52, "name": "空間崩壞裂縫", "realm": "合體", "size": [120, 120], "pos": [0, 9], "theme": "North", "portals": [ { "target_id": 44, "dir": "North", "pos": [60, 0] }, { "target_id": 51, "dir": "NorthWest", "pos": [0, 0] }, { "target_id": 55, "dir": "South", "pos": [60, 120] } ] },
  { "id": 53, "name": "天罰之巔", "realm": "合體", "size": [120, 120], "pos": [0, -9], "theme": "South", "portals": [ { "target_id": 46, "dir": "North", "pos": [60, 0] }, { "target_id": 55, "dir": "South", "pos": [60, 120] } ] },
  { "id": 54, "name": "虛空樞紐", "realm": "合體", "size": [120, 120], "pos": [9, 3], "theme": "East", "portals": [ { "target_id": 48, "dir": "West", "pos": [0, 60] }, { "target_id": 55, "dir": "SouthWest", "pos": [0, 120] } ], "boss": { "name": "虛空守衛", "realm": "合體大圓滿", "element": "空/混元", "pos": [90, 90] } },

  // --- Block 5: 55-59 ---
  {
    "id": 55, "name": "墜星之地", "realm": "大乘", "size": [200, 200], "pos": [0, 10], "theme": "Ascent",
    "portals": [
      { "target_id": 52, "dir": "North", "pos": [100, 0] },
      { "target_id": 53, "dir": "North", "pos": [80, 0] },
      { "target_id": 54, "dir": "NorthEast", "pos": [200, 0] },
      { "target_id": 56, "dir": "South", "pos": [100, 200] }
    ],
    "boss": null
  },
  {
    "id": 56, "name": "星辰盡頭", "realm": "大乘", "size": [200, 200], "pos": [0, 12], "theme": "Ascent",
    "portals": [ { "target_id": 55, "dir": "North", "pos": [100, 0] }, { "target_id": 57, "dir": "South", "pos": [100, 200] } ],
    "boss": { "name": "古神 · 星緯", "realm": "大乘巔峰", "element": "星辰", "pos": [100, 100] }
  },
  {
    "id": 57, "name": "法則之海", "realm": "金仙", "size": [200, 200], "pos": [0, 14], "theme": "Ascent",
    "portals": [ { "target_id": 56, "dir": "North", "pos": [100, 0] }, { "target_id": 58, "dir": "South", "pos": [100, 200] } ],
    "boss": null
  },
  {
    "id": 58, "name": "混沌源頭", "realm": "金仙", "size": [250, 250], "pos": [0, 17], "theme": "Ascent",
    "portals": [ { "target_id": 57, "dir": "North", "pos": [125, 0] }, { "target_id": 59, "dir": "South", "pos": [125, 250] } ],
    "boss": { "name": "鴻蒙之影", "realm": "金仙大圓滿", "element": "混沌", "pos": [125, 50] }
  },
  {
    "id": 59, "name": "彼岸終點", "realm": "仙帝", "size": [300, 300], "pos": [0, 21], "theme": "Ascent",
    "portals": [ { "target_id": 58, "dir": "North", "pos": [150, 0] } ],
    "boss": { "name": "天道意志 · 因果法身", "realm": "仙帝", "element": "全系/天道", "pos": [150, 50] }
  }
];

const getRealmEnum = (str: string): MajorRealm => {
    switch (str) {
        case '凡人': return MajorRealm.Mortal;
        case '練氣': return MajorRealm.QiRefining;
        case '築基': return MajorRealm.Foundation;
        case '金丹': return MajorRealm.GoldenCore;
        case '元嬰': return MajorRealm.NascentSoul;
        case '化神': return MajorRealm.SpiritSevering;
        case '合體': return MajorRealm.Fusion;
        case '大乘': return MajorRealm.Mahayana;
        case '金仙': return MajorRealm.GoldenImmortal;
        case '仙帝': return MajorRealm.ImmortalEmperor;
        default: return MajorRealm.Mortal;
    }
};

export const MAPS: MapData[] = RAW_MAPS_V60.map((raw, index) => {
    const realm = getRealmEnum(raw.realm);
    const id = raw.id.toString(); 
    
    const worldX = raw.pos[0];
    const worldY = raw.pos[1];
    const width = raw.size[0];
    const height = raw.size[1];

    // Generate Enemies List for the Map
    const enemies: Enemy[] = [];
    
    // Auto-populate fodder based on name (Keep existing logic)
    if (raw.name.includes('林') || raw.name.includes('木')) {
        if(BESTIARY['wind_wolf']) enemies.push(BESTIARY['wind_wolf']);
        if(BESTIARY['flower_spirit']) enemies.push(BESTIARY['flower_spirit']);
    } else if (raw.name.includes('谷') || raw.name.includes('坡') || raw.name.includes('穴') || raw.name.includes('崖')) {
        if(BESTIARY['poison_bee']) enemies.push(BESTIARY['poison_bee']);
        if(BESTIARY['stone_spirit']) enemies.push(BESTIARY['stone_spirit']);
    } else if (raw.name.includes('湖') || raw.name.includes('海') || raw.name.includes('潭') || raw.name.includes('澤') || raw.name.includes('蕩')) {
        if(BESTIARY['water_ghost']) enemies.push(BESTIARY['water_ghost']);
        if(BESTIARY['koi']) enemies.push(BESTIARY['koi']);
    } else if (raw.name.includes('火') || raw.name.includes('焰') || raw.name.includes('熔') || raw.name.includes('熱') || raw.name.includes('焦')) {
        if(BESTIARY['fire_ant']) enemies.push(BESTIARY['fire_ant']);
        if(BESTIARY['fire_charm']) enemies.push(BESTIARY['fire_charm']);
    } else if (raw.name.includes('塚') || raw.name.includes('墓') || raw.name.includes('屍') || raw.name.includes('葬') || raw.name.includes('崗')) {
        if(BESTIARY['corpse']) enemies.push(BESTIARY['corpse']);
        if(BESTIARY['ghost']) enemies.push(BESTIARY['ghost']);
    } else if (raw.name.includes('星') || raw.name.includes('空') || raw.name.includes('虛') || raw.name.includes('道')) {
        if(BESTIARY['void_ripper']) enemies.push(BESTIARY['void_ripper']);
        if(BESTIARY['star_fragment']) enemies.push(BESTIARY['star_fragment']);
    } else {
        if(BESTIARY['grey_fox']) enemies.push(BESTIARY['grey_fox']);
    }

    // Add Boss if defined (Use fixed position)
    let bossSpawn = undefined;
    // @ts-ignore
    if (raw.boss && raw.boss.name) {
        // @ts-ignore
        const bossNameKey = BOSS_MAPPING[raw.boss.name];
        if (bossNameKey && BESTIARY[bossNameKey]) {
             bossSpawn = {
                 // @ts-ignore
                 x: Math.max(0, Math.min(raw.boss.pos[0], width - 1)),
                 // @ts-ignore
                 y: Math.max(0, Math.min(raw.boss.pos[1], height - 1)),
                 enemyId: bossNameKey
             };
             // Ensure Boss is in enemies list
             enemies.push(BESTIARY[bossNameKey]);
        }
    }

    // Default Fallback
    if (enemies.length === 0) {
        enemies.push(BESTIARY['grey_fox']);
    }

    // Generate Portals from explicit positions
    const portals = raw.portals.map(p => {
        const targetIdNum = p.target_id;
        const targetMapRaw = RAW_MAPS_V60.find(m => m.id === targetIdNum);
        
        let targetX = 10;
        let targetY = 10;
        
        if (targetMapRaw) {
             // Find portal in target that points back to current map to determine spawn point
             const returnPortal = targetMapRaw.portals.find(rp => rp.target_id === raw.id);
             if (returnPortal) {
                 const tx = returnPortal.pos[0];
                 const ty = returnPortal.pos[1];
                 // Directly use the target's portal position as spawn
                 // Clamp to be safe
                 targetX = Math.max(0, Math.min(tx, targetMapRaw.size[0] - 1));
                 targetY = Math.max(0, Math.min(ty, targetMapRaw.size[1] - 1));
             } else {
                 // Default center fallback (Should not happen with complete data)
                 targetX = Math.floor(targetMapRaw.size[0] / 2);
                 targetY = Math.floor(targetMapRaw.size[1] / 2);
             }
        }

        // Clamp local portal position
        const px = Math.max(0, Math.min(p.pos[0], width - 1));
        const py = Math.max(0, Math.min(p.pos[1], height - 1));

        return {
            x: px,
            y: py,
            targetMapId: targetIdNum.toString(),
            targetX: targetX,
            targetY: targetY,
            label: targetMapRaw ? `前往 [${targetMapRaw.name}]` : '未知區域'
        };
    });

    return {
        id: id,
        name: raw.name,
        minRealm: realm,
        description: raw.description || '...', 
        introText: `踏入${raw.name}，${raw.description || '靈氣流動似乎有些不同...'}`,
        width: width,
        height: height,
        worldX: worldX,
        worldY: worldY,
        portals: portals,
        bossSpawn: bossSpawn,
        enemies: enemies,
        dropRateMultiplier: 1 + (index * 0.05)
    };
});
