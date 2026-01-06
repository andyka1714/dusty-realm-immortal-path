
import { MajorRealm, SpiritRootType, SpiritRootId, BaseAttributes, ElementType } from './types';

export const GAME_TICK_RATE_MS = 1000; // 1 sec = 1 day
export const DAYS_PER_YEAR = 365;

export const REALM_NAMES: Record<MajorRealm, string> = {
  [MajorRealm.Mortal]: '凡人',
  [MajorRealm.QiRefining]: '練氣',
  [MajorRealm.Foundation]: '築基',
  [MajorRealm.GoldenCore]: '金丹',
  [MajorRealm.NascentSoul]: '元嬰',
  [MajorRealm.SpiritSevering]: '化神',
  [MajorRealm.Fusion]: '合體',
  [MajorRealm.Mahayana]: '大乘',
  [MajorRealm.GoldenImmortal]: '金仙',
  [MajorRealm.ImmortalEmperor]: '仙帝',
};

// --- MOVEMENT SPEEDS (ms per cell) ---
export const MOVEMENT_SPEEDS: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 500,
  [MajorRealm.QiRefining]: 500,
  [MajorRealm.Foundation]: 500,
  
  [MajorRealm.GoldenCore]: 300,
  [MajorRealm.NascentSoul]: 300,
  [MajorRealm.SpiritSevering]: 300,
  
  [MajorRealm.Fusion]: 200,
  [MajorRealm.Mahayana]: 200,
  [MajorRealm.GoldenImmortal]: 150,
  
  [MajorRealm.ImmortalEmperor]: 100,
};

// --- FIVE ELEMENTS CONFIG ---

export const ELEMENT_NAMES: Record<ElementType, string> = {
    [ElementType.Metal]: '金',
    [ElementType.Wood]: '木',
    [ElementType.Water]: '水',
    [ElementType.Fire]: '火',
    [ElementType.Earth]: '土',
    [ElementType.None]: '無',
};

export const ELEMENT_COLORS: Record<ElementType, string> = {
    [ElementType.Metal]: 'text-yellow-400',
    [ElementType.Wood]: 'text-emerald-400',
    [ElementType.Water]: 'text-blue-400',
    [ElementType.Fire]: 'text-red-400',
    [ElementType.Earth]: 'text-amber-700',
    [ElementType.None]: 'text-stone-400',
};

// Map Spirit Roots to their Dominant Combat Element
export const SPIRIT_ROOT_TO_ELEMENT: Record<SpiritRootId, ElementType> = {
    // Heavenly
    [SpiritRootId.HEAVENLY_GOLD]: ElementType.Metal,
    [SpiritRootId.HEAVENLY_WOOD]: ElementType.Wood,
    [SpiritRootId.HEAVENLY_WATER]: ElementType.Water,
    [SpiritRootId.HEAVENLY_FIRE]: ElementType.Fire,
    [SpiritRootId.HEAVENLY_EARTH]: ElementType.Earth,

    // Variant
    // Wind -> Wood (Traditional Wuxia association)
    [SpiritRootId.VARIANT_WIND]: ElementType.Wood, 
    // Thunder -> Metal (Sharp, Fast) or Fire (Energy). Let's go Metal for physical interaction rules.
    [SpiritRootId.VARIANT_THUNDER]: ElementType.Metal, 
    // Ice -> Water
    [SpiritRootId.VARIANT_ICE]: ElementType.Water,

    // True (Dual/Tri) -> Dominant Element (Arbitrary but consistent choice based on "Outcome")
    [SpiritRootId.TRUE_WOOD_FIRE]: ElementType.Fire, // Wood feeds Fire
    [SpiritRootId.TRUE_METAL_EARTH]: ElementType.Metal, // Earth births Metal
    [SpiritRootId.TRUE_WATER_WOOD]: ElementType.Wood, // Water feeds Wood
    [SpiritRootId.TRUE_TRI]: ElementType.None, // Too balanced

    // Mixed
    [SpiritRootId.MIXED_FOUR]: ElementType.None,
    [SpiritRootId.MIXED_FIVE]: ElementType.None,
};

// ... (Keep existing SPIRIT_ROOT_NAMES and SPIRIT_ROOT_DETAILS definitions unchanged) ...

export const SPIRIT_ROOT_NAMES: Record<SpiritRootType, string> = {
  [SpiritRootType.Heterogenous]: '雜靈根', // 70%
  [SpiritRootType.True]: '真靈根',      // 20%
  [SpiritRootType.Heavenly]: '天靈根',  // 8%
  [SpiritRootType.Variant]: '變異靈根',  // 2%
};

// Detailed Definitions for every Spirit Root ID
interface SpiritRootDef {
  name: string;
  type: SpiritRootType;
  colorClass: string; // Text color
  glowClass: string;  // Glow effect class for Intro
  comment: string;    // Immortal's dialogue
  destiny: string;    // Destiny Title (e.g., "Geng Jin Body")
  description: string; // Destiny Description
  statsDescription: string; // Short stats summary for UI
  tags: string[]; // Highlight tags for UI
  weights: { // 0-100 for UI bars
    cultivation: number;
    battle: number;
    utility: number; // Luck, survival, alchemy etc.
  };
  bonuses: {
    cultivationMult: number;
    initialLifespan?: number; // Years
    initialStats?: Partial<BaseAttributes>;
    battle?: {
      atkPercent?: number;
      hpPercent?: number;
      mpPercent?: number;
      defPercent?: number;
      critRate?: number; // Flat %
      dodgeRate?: number; // Flat %
      damageReduction?: number; // %
    }
  }
}

export const SPIRIT_ROOT_DETAILS: Record<SpiritRootId, SpiritRootDef> = {
  // --- Heavenly (2.5x) ---
  [SpiritRootId.HEAVENLY_GOLD]: {
    name: '金系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-yellow-500',
    glowClass: 'shadow-yellow-500/50 bg-yellow-500',
    comment: "這、這是...金芒刺眼！竟是傳說中的庚金天靈根！林凡，你注定為劍而生！",
    destiny: "庚金之體",
    description: "銳利無匹，萬物皆可為劍。",
    statsDescription: "攻擊力 +15% / 修煉效率 2.5x",
    tags: ["戰力無雙", "修煉極快", "劍修奇才"],
    weights: { cultivation: 100, battle: 100, utility: 40 },
    bonuses: { cultivationMult: 2.5, battle: { atkPercent: 15 } }
  },
  [SpiritRootId.HEAVENLY_WOOD]: {
    name: '木系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-emerald-500',
    glowClass: 'shadow-emerald-500/50 bg-emerald-500',
    comment: "生機如潮汐噴湧...天靈根！只要你還有一口氣在，上蒼便不許你枯萎。",
    destiny: "長青之體",
    description: "生機盎然，與天地同壽。",
    statsDescription: "初始壽元 +5歲 / 修煉效率 2.5x",
    tags: ["壽元綿長", "修煉極快", "恢復力強"],
    weights: { cultivation: 100, battle: 60, utility: 90 },
    bonuses: { cultivationMult: 2.5, initialLifespan: 5 }
  },
  [SpiritRootId.HEAVENLY_WATER]: {
    name: '水系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-blue-500',
    glowClass: 'shadow-blue-500/50 bg-blue-500',
    comment: "感靈石竟化作一汪清泉...至柔天靈根！你的靈力將如大江之水，綿延不絕。",
    destiny: "上善若水",
    description: "至柔之質，納百川之靈。",
    statsDescription: "靈力上限 +20% / 修煉效率 2.5x",
    tags: ["靈力浩瀚", "修煉極快", "法術連發"],
    weights: { cultivation: 100, battle: 80, utility: 70 },
    bonuses: { cultivationMult: 2.5, battle: { mpPercent: 20 } }
  },
  [SpiritRootId.HEAVENLY_FIRE]: {
    name: '火系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-red-500',
    glowClass: 'shadow-red-500/50 bg-red-500',
    comment: "赤炎焚天！這等熾熱的靈壓...你便是天生的煉丹大師，火中至尊！",
    destiny: "至陽之體",
    description: "烈焰焚天，丹火自生。",
    statsDescription: "煉丹成功率 +20% / 修煉效率 2.5x",
    tags: ["煉丹宗師", "修煉極快", "爆發傷害"],
    weights: { cultivation: 100, battle: 90, utility: 80 },
    bonuses: { cultivationMult: 2.5 } // Battle crit dmg not implemented yet
  },
  [SpiritRootId.HEAVENLY_EARTH]: {
    name: '土系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-amber-700',
    glowClass: 'shadow-amber-700/50 bg-amber-700',
    comment: "感靈石沉重如山，動彈不得...厚德天靈根！你的根基將比這大地還要穩固。",
    destiny: "不滅之基",
    description: "厚德載物，穩如泰山。",
    statsDescription: "體魄上限 +20% / 修煉效率 2.5x",
    tags: ["肉身成聖", "修煉極快", "防禦無敵"],
    weights: { cultivation: 100, battle: 70, utility: 60 },
    bonuses: { cultivationMult: 2.5, battle: { hpPercent: 20, damageReduction: 5 } }
  },

  // --- Variant (2.0x) ---
  [SpiritRootId.VARIANT_WIND]: {
    name: '風系異靈根',
    type: SpiritRootType.Variant,
    colorClass: 'text-cyan-300',
    glowClass: 'shadow-cyan-300/50 bg-cyan-300',
    comment: "靈氣如疾風掠過，抓不住、摸不著...異靈根【風】，這世間凡塵難以束縛你的腳步。",
    destiny: "御風而行",
    description: "縹緲無蹤，瞬息千里。",
    statsDescription: "閃避率 +10% / 修煉效率 2.0x",
    tags: ["身法超絕", "修煉甚快", "地圖神行"],
    weights: { cultivation: 80, battle: 90, utility: 70 },
    bonuses: { cultivationMult: 2.0, battle: { dodgeRate: 10 } }
  },
  [SpiritRootId.VARIANT_THUNDER]: {
    name: '雷系異靈根',
    type: SpiritRootType.Variant,
    colorClass: 'text-purple-500',
    glowClass: 'shadow-purple-500/50 bg-purple-500',
    comment: "狂暴的雷霆！這是...天道化身？林凡，你的修仙之路註定伴隨著雷劫與天威。",
    destiny: "雷罰之子",
    description: "天威難犯，執掌懲戒。",
    statsDescription: "突破損失減半 / 修煉效率 2.0x",
    tags: ["渡劫保送", "修煉甚快", "戰鬥麻痺"],
    weights: { cultivation: 85, battle: 95, utility: 50 },
    bonuses: { cultivationMult: 2.0 } // Breakthrough bonus logic in slice
  },
  [SpiritRootId.VARIANT_ICE]: {
    name: '冰系異靈根',
    type: SpiritRootType.Variant,
    colorClass: 'text-sky-300',
    glowClass: 'shadow-sky-300/50 bg-sky-300',
    comment: "寒氣透骨...感靈石都被凍住了！異靈根【冰】，你擁有一顆冷徹萬物的道心。",
    destiny: "極寒之心",
    description: "萬里冰封，神識清冷。",
    statsDescription: "暴擊率 +10% / 修煉效率 2.0x",
    tags: ["神識強大", "修煉甚快", "致命一擊"],
    weights: { cultivation: 80, battle: 90, utility: 60 },
    bonuses: { cultivationMult: 2.0, battle: { critRate: 10 } }
  },

  // --- True (1.5x) ---
  [SpiritRootId.TRUE_WOOD_FIRE]: {
    name: '木火真靈根',
    type: SpiritRootType.True,
    colorClass: 'text-orange-400',
    glowClass: 'shadow-orange-400/50 bg-gradient-to-r from-emerald-500 to-red-500',
    comment: "木助火勢，靈光流轉。真靈根！雖然資質不敵天才，但你具備極佳的煉丹天賦。",
    destiny: "丹火長燃",
    description: "相生相旺，生生不息。",
    statsDescription: "煉丹產量提升 / 修煉效率 1.5x",
    tags: ["煉丹輔助", "修煉尚可", "生財有道"],
    weights: { cultivation: 60, battle: 50, utility: 90 },
    bonuses: { cultivationMult: 1.5 }
  },
  [SpiritRootId.TRUE_METAL_EARTH]: { // Gold-Earth
    name: '金土真靈根',
    type: SpiritRootType.True,
    colorClass: 'text-yellow-700',
    glowClass: 'shadow-yellow-700/50 bg-gradient-to-r from-yellow-500 to-amber-800',
    comment: "金石為開，厚積薄發。真靈根！你的道基穩固，極適合苦修。",
    destiny: "堅不可摧",
    description: "砂中淘金，道基穩固。",
    statsDescription: "雙防 +10% / 修煉效率 1.5x",
    tags: ["防禦加成", "修煉尚可", "生存力強"],
    weights: { cultivation: 60, battle: 70, utility: 50 },
    bonuses: { cultivationMult: 1.5, battle: { defPercent: 10 } } // Applied to magic res too in logic
  },
  [SpiritRootId.TRUE_WATER_WOOD]: {
    name: '水木真靈根',
    type: SpiritRootType.True,
    colorClass: 'text-teal-400',
    glowClass: 'shadow-teal-400/50 bg-gradient-to-r from-blue-500 to-emerald-500',
    comment: "水潤木長，生機勃勃。真靈根！你的道基之穩固，遠超常人預期。",
    destiny: "澤潤萬物",
    description: "溫潤如玉，生命頑強。",
    statsDescription: "抗性 +15% / 修煉效率 1.5x",
    tags: ["百毒不侵", "修煉尚可", "回復力UP"],
    weights: { cultivation: 60, battle: 50, utility: 80 },
    bonuses: { cultivationMult: 1.5 }
  },
  [SpiritRootId.TRUE_TRI]: {
    name: '隨機三靈根',
    type: SpiritRootType.True,
    colorClass: 'text-indigo-400',
    glowClass: 'shadow-indigo-400/50 bg-indigo-400',
    comment: "三色匯聚，五行有序。真靈根！資質尚可，只要勤勉修煉，築基金丹指日可待。",
    destiny: "三才合一",
    description: "氣息平穩，循環往復。",
    statsDescription: "突破成功率 +5% / 修煉效率 1.5x",
    tags: ["突破加成", "修煉尚可", "均衡發展"],
    weights: { cultivation: 65, battle: 55, utility: 55 },
    bonuses: { cultivationMult: 1.5 }
  },

  // --- Mixed (1.0x) ---
  [SpiritRootId.MIXED_FOUR]: {
    name: '四系雜靈根',
    type: SpiritRootType.Heterogenous,
    colorClass: 'text-stone-500',
    glowClass: 'shadow-stone-500/50 bg-stone-500',
    comment: "四色雜亂...哎，靈氣入體如亂麻纏繞。林凡，你的求道之路將會極度艱難。",
    destiny: "求道艱辛",
    description: "駁雜不純，意志磨礪。",
    statsDescription: "傷害抗性 +8% / 修煉效率 1.0x",
    tags: ["抗性提升", "修煉緩慢", "大器晚成"],
    weights: { cultivation: 20, battle: 40, utility: 60 },
    bonuses: { cultivationMult: 1.0, battle: { damageReduction: 8 } }
  },
  [SpiritRootId.MIXED_FIVE]: {
    name: '五行全靈根',
    type: SpiritRootType.Heterogenous,
    colorClass: 'text-stone-400',
    glowClass: 'shadow-stone-400/50 bg-gradient-to-r from-red-500 via-green-500 to-blue-500',
    comment: "五行全雜...這是廢靈根中的極品。除非有逆天奇遇，否則這輩子恐難望金丹之境。",
    destiny: "五行雜陳",
    description: "大道難尋，氣運莫測。",
    statsDescription: "福緣 +10 / 修煉效率 1.0x",
    tags: ["氣運之子", "掉寶UP", "奇遇連連"],
    weights: { cultivation: 10, battle: 30, utility: 100 },
    bonuses: { cultivationMult: 1.0, initialStats: { fortune: 10 } }
  },
};

export const SPIRIT_ROOT_MULTIPLIERS: Record<SpiritRootType, number> = {
  [SpiritRootType.Heterogenous]: 1.0,
  [SpiritRootType.True]: 1.5,
  [SpiritRootType.Heavenly]: 2.5,
  [SpiritRootType.Variant]: 2.0, 
};

// ... (Keep Realm Modifiers and Base Stats) ...

export const REALM_MODIFIERS: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 1,
  [MajorRealm.QiRefining]: 3,    
  [MajorRealm.Foundation]: 8,    
  [MajorRealm.GoldenCore]: 25,   
  [MajorRealm.NascentSoul]: 100, 
  [MajorRealm.SpiritSevering]: 500,
  [MajorRealm.Fusion]: 2000,      // Re-balanced for 2.0
  [MajorRealm.Mahayana]: 10000,   // Re-balanced
  [MajorRealm.GoldenImmortal]: 50000,
  [MajorRealm.ImmortalEmperor]: 200000,
};

export const LIFESPAN_BONUS: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 0,
  [MajorRealm.QiRefining]: 50,
  [MajorRealm.Foundation]: 150,
  [MajorRealm.GoldenCore]: 300,
  [MajorRealm.NascentSoul]: 600,
  [MajorRealm.SpiritSevering]: 1200,
  [MajorRealm.Fusion]: 2500,
  [MajorRealm.Mahayana]: 5000,
  [MajorRealm.GoldenImmortal]: 10000,
  [MajorRealm.ImmortalEmperor]: 99999,
};

export const REALM_BASE_STATS: Record<MajorRealm, { hp: number; mp: number }> = {
  [MajorRealm.Mortal]: { hp: 100, mp: 0 },
  [MajorRealm.QiRefining]: { hp: 500, mp: 200 },
  [MajorRealm.Foundation]: { hp: 2000, mp: 1000 },
  [MajorRealm.GoldenCore]: { hp: 10000, mp: 5000 },
  [MajorRealm.NascentSoul]: { hp: 50000, mp: 25000 },
  [MajorRealm.SpiritSevering]: { hp: 200000, mp: 100000 },
  [MajorRealm.Fusion]: { hp: 1000000, mp: 500000 },
  [MajorRealm.Mahayana]: { hp: 5000000, mp: 2500000 },
  [MajorRealm.GoldenImmortal]: { hp: 20000000, mp: 10000000 },
  [MajorRealm.ImmortalEmperor]: { hp: 100000000, mp: 50000000 },
};

export const REALM_EXP_CONFIG: Record<MajorRealm, { base: number; growth: number; isLinear?: boolean }> = {
    [MajorRealm.Mortal]: { base: 100, growth: 1, isLinear: true },
    [MajorRealm.QiRefining]: { base: 1000, growth: 1.25 },
    [MajorRealm.Foundation]: { base: 15000, growth: 1.15 },
    [MajorRealm.GoldenCore]: { base: 100000, growth: 1.14 },
    [MajorRealm.NascentSoul]: { base: 1000000, growth: 1.13 },
    [MajorRealm.SpiritSevering]: { base: 10000000, growth: 1.12 },
    [MajorRealm.Fusion]: { base: 80000000, growth: 1.11 },
    [MajorRealm.Mahayana]: { base: 500000000, growth: 1.10 },
    [MajorRealm.GoldenImmortal]: { base: 5000000000, growth: 1.09 },
    [MajorRealm.ImmortalEmperor]: { base: 100000000000, growth: 1.05 },
};

export const calculateMaxExp = (major: number, minor: number): number => {
  const config = REALM_EXP_CONFIG[major as MajorRealm];
  if (!config) return 1000000;
  if (config.isLinear) {
      return Math.floor(config.base * (minor + 1));
  }
  return Math.floor(config.base * Math.pow(config.growth, minor));
};

export const MINOR_REALM_CAP = 9;

export const INITIAL_BASE_STATS = {
  physique: 10,
  rootBone: 10,
  insight: 10,
  comprehension: 10,
  fortune: 10,
  charm: 10,
};

// --- BREAKTHROUGH & TRIBULATION CONFIGURATION ---

interface BreakthroughRequirement {
  baseRate: number; // Base Success Rate (0-1)
  requiredItemId?: string; // Item needed for this breakthrough (only for Major boundaries)
  tribulationName?: string; // If set, this breakthrough is a Tribulation
  bossHint?: string; // Hint where to find the item
  penaltyType: 'minor' | 'major_safe' | 'major_unsafe'; 
}

// Config for MAJOR Boundaries (transitioning FROM this realm TO next)
// e.g. Mortal -> Qi Refining is defined under Mortal
export const BREAKTHROUGH_CONFIG: Record<MajorRealm, BreakthroughRequirement> = {
  [MajorRealm.Mortal]: { 
    baseRate: 1.0, 
    requiredItemId: 'bt_mortal_qi', 
    penaltyType: 'major_safe',
    bossHint: '幽谷巨蟒 (萬獸林入口)'
  },
  [MajorRealm.QiRefining]: { 
    baseRate: 0.9, 
    requiredItemId: 'bt_qi_foundation', 
    penaltyType: 'major_safe',
    bossHint: '寒潭蛟龍 (寒潭深處)'
  },
  [MajorRealm.Foundation]: { 
    baseRate: 0.8, 
    requiredItemId: 'bt_foundation_gold', 
    tribulationName: '三九小雷劫',
    penaltyType: 'major_unsafe', // Foundation -> Golden Core is the first unsafe one
    bossHint: '烈焰妖王 (極熱深淵)'
  },
  [MajorRealm.GoldenCore]: { 
    baseRate: 0.7, 
    requiredItemId: 'bt_gold_nascent', 
    tribulationName: '六九中雷劫',
    penaltyType: 'major_unsafe',
    bossHint: '幻境之主 (幻夢神海)'
  },
  [MajorRealm.NascentSoul]: { 
    baseRate: 0.6, 
    requiredItemId: 'bt_nascent_spirit', 
    tribulationName: '九九大雷劫',
    penaltyType: 'major_unsafe',
    bossHint: '萬年屍王 (荒古墓塚)'
  },
  [MajorRealm.SpiritSevering]: { 
    baseRate: 0.5, 
    requiredItemId: 'bt_spirit_fusion', // Item ID needs update in items.ts
    tribulationName: '紫霄神雷劫',
    penaltyType: 'major_unsafe',
    bossHint: '雷霆巨獸 (雷鳴廢墟)'
  },
  [MajorRealm.Fusion]: { 
    baseRate: 0.4, 
    requiredItemId: 'bt_fusion_maha', 
    tribulationName: '五行混元劫',
    penaltyType: 'major_unsafe',
    bossHint: '虛空守衛 (虛空核心)'
  },
  [MajorRealm.Mahayana]: { 
    baseRate: 0.3, 
    requiredItemId: 'bt_maha_golden', 
    tribulationName: '飛升成仙劫',
    penaltyType: 'major_unsafe',
    bossHint: '星辰古神 (星辰盡頭)'
  },
  [MajorRealm.GoldenImmortal]: { 
    baseRate: 0.2, 
    requiredItemId: 'bt_golden_emperor', 
    tribulationName: '滅世虛無劫',
    penaltyType: 'major_unsafe',
    bossHint: '鴻蒙之影 (混沌源頭)'
  },
  [MajorRealm.ImmortalEmperor]: { 
    baseRate: 0.1, 
    tribulationName: '終極因果劫',
    penaltyType: 'major_unsafe',
    bossHint: '天道化身 (彼岸終點)'
  },
};

export const AGE_MILESTONE_MESSAGES: Partial<Record<MajorRealm, string[]>> = {
    // ... (Keep existing messages) ...
    [MajorRealm.Mortal]: [
        "春去秋來，花開花落。你摸了摸眼角的皺紋，感嘆凡人百年終是黃土，必須加緊修煉了。",
        "山下的桃樹開了又謝，這是你踏入仙途的第 ${year} 個年頭，引氣入體時感覺經脈隱隱發燙。",
        "鄰家的孩童已成家立業，你卻仍在洞府中枯坐。修仙之路，孤獨才是常態。",
        "清晨的露水滴在手背，你猛然驚覺：原來自己已踏入 ${age} 歲。練氣尚未圓滿，天命不等人。",
        "你試圖捕捉那一絲縹緲的靈氣，雖然進展微小，但你感覺生命之火燃燒得更旺了一些。",
        "時光荏苒，你已 ${age} 歲，感嘆肉身凡胎，歲月不饒人。"
    ],
    // ... Keep others as is for brevity in this output block, assume they are there in real file ... 
};

export const ATTRIBUTE_EPIPHANY_MESSAGES: Record<keyof BaseAttributes, string[]> = {
  // ... (Keep existing messages) ...
    physique: ["你於雷雨之夜感悟雷霆生滅，一絲細微電弧淬鍊了你的皮肉，體質更勝從前。"],
    rootBone: ["你在懸崖邊觀松樹紮根石縫，對『堅韌』二字有了全新體悟，丹田道基愈發沉穩。"],
    insight: ["你於靜室中點燃一盞青燈，觀燈火明滅，神魂竟隨著火光收縮凝練。"],
    comprehension: ["你觀看兩名凡人老者對弈七日，忽覺萬物如棋，天地為局，心中阻滯豁然開朗。"],
    fortune: ["你在後山散步時被一枚石子絆倒，挖開一看竟是早已滅絕的古玉殘片，當真是運氣。"],
    charm: ["隨著修為精進，你皮膚表層隱有月華流轉，舉手投足間盡顯飄逸仙姿。"]
};

export const LIFESPAN_WARNINGS = {
  low: [
    "【天命】你忽然感覺心跳漏了一拍，體內生機隱隱有乾涸之象。此時距離壽元大限，僅剩 ${years} 年。",
  ],
  med: [
    "【大限】你呼吸沈重，每一次吐納都顯得極其艱難。死神已在門外徘徊，距離大限僅剩 12 個月。",
  ],
  critical: [
    "【死亡】你的肉身散發出淡淡的腐朽氣息，這是天人五衰的預兆。剩餘：${days} 天。",
  ]
};
