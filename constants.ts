
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
  [MajorRealm.VoidRefining]: '煉虛',
  [MajorRealm.Fusion]: '合體',
  [MajorRealm.Mahayana]: '大乘',
  [MajorRealm.Tribulation]: '渡劫',
  [MajorRealm.Immortal]: '仙人',
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
  [MajorRealm.VoidRefining]: 250,

  [MajorRealm.Fusion]: 200,
  [MajorRealm.Mahayana]: 200,
  [MajorRealm.Tribulation]: 200,
  [MajorRealm.Immortal]: 150,
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
    [SpiritRootId.TRUE_FIRE_METAL]: ElementType.Fire, // Fire melts Metal
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
    spiritStoneGainPercent?: number; // %
    alchemyBonus?: number; // %
    craftingBonus?: number; // %
    battle?: {
      atkPercent?: number;
      hpPercent?: number;
      mpPercent?: number;
      defPercent?: number;
      resPercent?: number; // Magic Defense
      critRate?: number; // Flat %
      dodgeRate?: number; // Flat %
      damageReduction?: number; // %
      hpRegen?: number; // % per turn
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
    comment: "這、這是...金芒刺眼！竟是傳說中的庚金天靈根！你注定為劍而生！",
    destiny: "庚金之體",
    description: "銳利無匹，萬物皆可為劍。",
    statsDescription: "攻擊力 +15% / 修煉效率 2.0x",
    tags: ["戰力無雙", "修煉極快", "劍修奇才"],
    weights: { cultivation: 100, battle: 100, utility: 40 },
    bonuses: { cultivationMult: 2.0, battle: { atkPercent: 15 } }
  },
  [SpiritRootId.HEAVENLY_WOOD]: {
    name: '木系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-emerald-500',
    glowClass: 'shadow-emerald-500/50 bg-emerald-500',
    comment: "生機如潮汐噴湧...天靈根！只要你還有一口氣在，上蒼便不許你枯萎。",
    destiny: "長青之體",
    description: "生機盎然，與天地同壽。",
    statsDescription: "氣血 +10% / 回血 / 修煉效率 2.0x",
    tags: ["修煉極快", "恢復力強", "肉盾潛力"],
    weights: { cultivation: 100, battle: 60, utility: 90 },
    bonuses: { cultivationMult: 2.0, battle: { hpPercent: 10, hpRegen: 1 } }
  },
  [SpiritRootId.HEAVENLY_WATER]: {
    name: '水系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-blue-500',
    glowClass: 'shadow-blue-500/50 bg-blue-500',
    comment: "感靈石竟化作一汪清泉...至柔天靈根！你的靈力將如大江之水，綿延不絕。",
    destiny: "上善若水",
    description: "至柔之質，納百川之靈。",
    statsDescription: "靈力上限 +20% / 法防 +10% / 修煉 2.0x",
    tags: ["靈力浩瀚", "修煉極快", "法術防禦"],
    weights: { cultivation: 100, battle: 80, utility: 70 },
    bonuses: { cultivationMult: 2.0, battle: { mpPercent: 20, resPercent: 10 } }
  },
  [SpiritRootId.HEAVENLY_FIRE]: {
    name: '火系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-red-500',
    glowClass: 'shadow-red-500/50 bg-red-500',
    comment: "赤炎焚天！這等熾熱的靈壓...火中至尊，毀滅一切！",
    destiny: "至陽之體",
    description: "烈焰焚天，丹火自生。",
    statsDescription: "暴擊率 +15% / 修煉效率 2.0x",
    tags: ["煉丹宗師", "修煉極快", "爆發傷害"],
    weights: { cultivation: 100, battle: 90, utility: 80 },
    bonuses: { cultivationMult: 2.0, battle: { critRate: 15 } }
  },
  [SpiritRootId.HEAVENLY_EARTH]: {
    name: '土系天靈根',
    type: SpiritRootType.Heavenly,
    colorClass: 'text-amber-700',
    glowClass: 'shadow-amber-700/50 bg-amber-700',
    comment: "感靈石沉重如山，動彈不得...厚德天靈根！你的根基將比這大地還要穩固。",
    destiny: "不滅之基",
    description: "厚德載物，穩如泰山。",
    statsDescription: "物防 +15% / 減傷 +5% / 修煉 2.0x",
    tags: ["肉身成聖", "修煉極快", "防禦無敵"],
    weights: { cultivation: 100, battle: 70, utility: 60 },
    bonuses: { cultivationMult: 2.0, battle: { defPercent: 15, damageReduction: 5 } }
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
    statsDescription: "閃避率 +10% / 修煉效率 1.7x",
    tags: ["身法超絕", "修煉甚快", "地圖神行"],
    weights: { cultivation: 80, battle: 90, utility: 70 },
    bonuses: { cultivationMult: 1.7, battle: { dodgeRate: 10 } }
  },
  [SpiritRootId.VARIANT_THUNDER]: {
    name: '雷系異靈根',
    type: SpiritRootType.Variant,
    colorClass: 'text-purple-500',
    glowClass: 'shadow-purple-500/50 bg-purple-500',
    comment: "狂暴的雷霆！這是...天道化身？你的修仙之路註定伴隨著雷劫與天威。",
    destiny: "雷罰之子",
    description: "天威難犯，執掌懲戒。",
    statsDescription: "突破損失減半 / 攻爆 +5% / 修煉效率 1.7x",
    tags: ["渡劫保送", "修煉甚快", "攻暴雙修"],
    weights: { cultivation: 85, battle: 95, utility: 50 },
    bonuses: { cultivationMult: 1.7, battle: { atkPercent: 5, critRate: 5 } }
  },
  [SpiritRootId.VARIANT_ICE]: {
    name: '冰系異靈根',
    type: SpiritRootType.Variant,
    colorClass: 'text-sky-300',
    glowClass: 'shadow-sky-300/50 bg-sky-300',
    comment: "寒氣透骨...感靈石都被凍住了！異靈根【冰】，你擁有一顆冷徹萬物的道心。",
    destiny: "極寒之心",
    description: "萬里冰封，神識清冷。",
    statsDescription: "暴擊率 +8% / 法防 +8% / 修煉效率 1.7x",
    tags: ["法防特化", "修煉甚快", "致命一擊"],
    weights: { cultivation: 80, battle: 90, utility: 60 },
    bonuses: { cultivationMult: 1.7, battle: { critRate: 8, resPercent: 8 } }
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
    statsDescription: "氣血+5% 暴擊+3% / 戰鬥靈石+10% / 修煉效率 1.3x",
    tags: ["煉丹輔助", "修煉尚可", "生財有道"],
    weights: { cultivation: 60, battle: 50, utility: 90 },
    bonuses: { cultivationMult: 1.3, spiritStoneGainPercent: 10, alchemyBonus: 10, battle: { hpPercent: 5, critRate: 3 } }
  },
  [SpiritRootId.TRUE_FIRE_METAL]: {
    name: '火金真靈根',
    type: SpiritRootType.True,
    colorClass: 'text-rose-500',
    glowClass: 'shadow-rose-500/50 bg-gradient-to-r from-red-600 to-yellow-400',
    comment: "烈火煉真金，百煉成器。真靈根！你天生具備極佳的煉器天賦。",
    destiny: "爐火純青",
    description: "火旺金鍛，器宇不凡。",
    statsDescription: "攻擊+5% 煉器+10% / 修煉效率 1.3x",
    tags: ["煉器專精", "修煉尚可", "器道天才"],
    weights: { cultivation: 60, battle: 60, utility: 80 },
    bonuses: { cultivationMult: 1.3, craftingBonus: 10, battle: { atkPercent: 5 } }
  },
  [SpiritRootId.TRUE_METAL_EARTH]: { // Gold-Earth
    name: '金土真靈根',
    type: SpiritRootType.True,
    colorClass: 'text-yellow-700',
    glowClass: 'shadow-yellow-700/50 bg-gradient-to-r from-yellow-500 to-amber-800',
    comment: "金石為開，厚積薄發。真靈根！你的道基穩固，極適合苦修。",
    destiny: "堅不可摧",
    description: "砂中淘金，道基穩固。",
    statsDescription: "雙防 +10% / 修煉效率 1.3x",
    tags: ["防禦加成", "修煉尚可", "生存力強"],
    weights: { cultivation: 60, battle: 70, utility: 50 },
    bonuses: { cultivationMult: 1.3, battle: { defPercent: 10 } } // Applied to magic res too in logic
  },
  [SpiritRootId.TRUE_WATER_WOOD]: {
    name: '水木真靈根',
    type: SpiritRootType.True,
    colorClass: 'text-teal-400',
    glowClass: 'shadow-teal-400/50 bg-gradient-to-r from-blue-500 to-emerald-500',
    comment: "水潤木長，生機勃勃。真靈根！你的道基之穩固，遠超常人預期。",
    destiny: "澤潤萬物",
    description: "溫潤如玉，生命頑強。",
    statsDescription: "HP/MP +10% / 修煉效率 1.3x",
    tags: ["根基深厚", "修煉尚可", "雙池加成"],
    weights: { cultivation: 60, battle: 50, utility: 80 },
    bonuses: { cultivationMult: 1.3, battle: { hpPercent: 10, mpPercent: 10 } }
  },
  [SpiritRootId.TRUE_TRI]: {
    name: '隨機三靈根',
    type: SpiritRootType.True,
    colorClass: 'text-indigo-400',
    glowClass: 'shadow-indigo-400/50 bg-indigo-400',
    comment: "三色匯聚，五行有序。真靈根！資質尚可，只要勤勉修煉，築基金丹指日可待。",
    destiny: "三才合一",
    description: "氣息平穩，循環往復。",
    statsDescription: "突破成功率 +5% / 修煉效率 1.3x",
    tags: ["突破加成", "修煉尚可", "均衡發展"],
    weights: { cultivation: 65, battle: 55, utility: 55 },
    bonuses: { cultivationMult: 1.3 }
  },

  // --- Mixed (1.0x) ---
  [SpiritRootId.MIXED_FOUR]: {
    name: '四系雜靈根',
    type: SpiritRootType.Heterogenous,
    colorClass: 'text-stone-500',
    glowClass: 'shadow-stone-500/50 bg-stone-500',
    comment: "四色雜亂...哎，靈氣入體如亂麻纏繞。你的求道之路將會極度艱難。",
    destiny: "求道艱辛",
    description: "駁雜不純，意志磨礪。",
    statsDescription: "傷害減免 +3% / 修煉 1.0x",
    tags: ["抗性提升", "修煉緩慢", "大器晚成"],
    weights: { cultivation: 20, battle: 40, utility: 60 },
    bonuses: { cultivationMult: 1.0, battle: { damageReduction: 3 } }
  },
  [SpiritRootId.MIXED_FIVE]: {
    name: '五行全靈根',
    type: SpiritRootType.Heterogenous,
    colorClass: 'text-stone-400',
    glowClass: 'shadow-stone-400/50 bg-gradient-to-r from-red-500 via-green-500 to-blue-500',
    comment: "五行全雜...這是廢靈根中的極品。除非有逆天奇遇，否則這輩子恐難望金丹之境。",
    destiny: "五行雜陳",
    description: "大道難尋，氣運莫測。",
    statsDescription: "福緣 +10 / 掉寶 +10% / 修煉 1.0x",
    tags: ["氣運之子", "掉寶UP", "奇遇連連"],
    weights: { cultivation: 10, battle: 30, utility: 100 },
    bonuses: { cultivationMult: 1.0, initialStats: { fortune: 10 } } // dropRate not in battle bonus yet, need to check adventure slice or map logic
  },
};

export const SPIRIT_ROOT_MULTIPLIERS: Record<SpiritRootType, number> = {
  [SpiritRootType.Heterogenous]: 1.0,
  [SpiritRootType.True]: 1.3,
  [SpiritRootType.Heavenly]: 2.0,
  [SpiritRootType.Variant]: 1.7, 
};

export const MANUAL_CULTIVATE_COOLDOWN = 3000; // 3 seconds
export const PASSIVE_CULTIVATION_PENALTY = 0.3; // 30% Efficiency for passive

export const SECLUSION_DURATION_MS = 30000; // 30 seconds

export const SECLUSION_BASE_COST: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 100,
  [MajorRealm.QiRefining]: 500,
  [MajorRealm.Foundation]: 2500,
  [MajorRealm.GoldenCore]: 50000,
  [MajorRealm.NascentSoul]: 150000,
  [MajorRealm.SpiritSevering]: 2000000,
  [MajorRealm.VoidRefining]: 10000000,
  [MajorRealm.Fusion]: 50000000,
  [MajorRealm.Mahayana]: 200000000,
  [MajorRealm.Tribulation]: 1000000000,
  [MajorRealm.Immortal]: 25000000000,
  [MajorRealm.ImmortalEmperor]: 500000000000,
};

// ... (Keep Realm Modifiers and Base Stats) ...

export const REALM_MODIFIERS: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 1,
  [MajorRealm.QiRefining]: 2,    
  [MajorRealm.Foundation]: 4,    
  [MajorRealm.GoldenCore]: 8,   
  [MajorRealm.NascentSoul]: 16, 
  [MajorRealm.SpiritSevering]: 32,
  [MajorRealm.VoidRefining]: 64,
  [MajorRealm.Fusion]: 128,
  [MajorRealm.Mahayana]: 256,
  [MajorRealm.Tribulation]: 512,
  [MajorRealm.Immortal]: 1024,
  [MajorRealm.ImmortalEmperor]: 2048,
};

export const LIFESPAN_BONUS: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 0,
  [MajorRealm.QiRefining]: 50,
  [MajorRealm.Foundation]: 150,
  [MajorRealm.GoldenCore]: 300,
  [MajorRealm.NascentSoul]: 600,
  [MajorRealm.SpiritSevering]: 1200,
  [MajorRealm.VoidRefining]: 2500,
  [MajorRealm.Fusion]: 5000,
  [MajorRealm.Mahayana]: 10000, // Approaching immortal
  [MajorRealm.Tribulation]: 200000,  // Survival phase
  [MajorRealm.Immortal]: 500000, // Massive boost once Immortal
  [MajorRealm.ImmortalEmperor]: 999999,
};

export const REALM_BASE_STATS: Record<MajorRealm, { hp: number; mp: number }> = {
  [MajorRealm.Mortal]: { hp: 100, mp: 0 },
  [MajorRealm.QiRefining]: { hp: 500, mp: 200 },
  [MajorRealm.Foundation]: { hp: 2000, mp: 1000 },
  [MajorRealm.GoldenCore]: { hp: 10000, mp: 5000 },
  [MajorRealm.NascentSoul]: { hp: 50000, mp: 25000 },
  [MajorRealm.SpiritSevering]: { hp: 200000, mp: 100000 },
  [MajorRealm.VoidRefining]: { hp: 500000, mp: 250000 },
  [MajorRealm.Fusion]: { hp: 1000000, mp: 500000 },
  [MajorRealm.Mahayana]: { hp: 5000000, mp: 2500000 },
  [MajorRealm.Tribulation]: { hp: 10000000, mp: 5000000 },
  [MajorRealm.Immortal]: { hp: 100000000, mp: 50000000 },
  [MajorRealm.ImmortalEmperor]: { hp: 1000000000, mp: 500000000 },
};

export const REALM_EXP_CONFIG: Record<MajorRealm, { base: number; growth: number; isLinear?: boolean }> = {
    [MajorRealm.Mortal]: { base: 100, growth: 1, isLinear: true },
    [MajorRealm.QiRefining]: { base: 1000, growth: 1.25 },
    [MajorRealm.Foundation]: { base: 15000, growth: 1.15 },
    [MajorRealm.GoldenCore]: { base: 100000, growth: 1.14 },
    [MajorRealm.NascentSoul]: { base: 1000000, growth: 1.13 },
    [MajorRealm.SpiritSevering]: { base: 10000000, growth: 1.12 },
    [MajorRealm.VoidRefining]: { base: 50000000, growth: 1.11 },
    [MajorRealm.Fusion]: { base: 200000000, growth: 1.10 },
    [MajorRealm.Mahayana]: { base: 1000000000, growth: 1.09 },
    [MajorRealm.Tribulation]: { base: 5000000000, growth: 1.08 },
  [MajorRealm.Immortal]: { base: 100000000000, growth: 1.06 },
  [MajorRealm.ImmortalEmperor]: { base: 0, growth: 0 }, // No Exp
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
  increment?: number; // Optional: skip realms (e.g., 2 to skip one)
}

// Config for MAJOR Boundaries (transitioning FROM this realm TO next)
// e.g. Mortal -> Qi Refining is defined under Mortal
export const BREAKTHROUGH_CONFIG: Record<MajorRealm, BreakthroughRequirement> = {
  // === 無天劫 (No Tribulation) ===
  [MajorRealm.Mortal]: { 
    baseRate: 1.0, 
    requiredItemId: 'bt_mortal_qi', 
    penaltyType: 'major_safe',
    bossHint: '守塚老屍 (荒塚)'
  },
  [MajorRealm.QiRefining]: { 
    baseRate: 0.9, 
    requiredItemId: 'bt_qi_foundation', 
    penaltyType: 'major_safe',
    bossHint: '裂風狼王、寒霜白猿等 (練氣各域妖王)'
  },

  // === 天劫開始 (Tribulation Begins from Golden Core) ===
  [MajorRealm.Foundation]: { 
    baseRate: 0.8, 
    requiredItemId: 'bt_foundation_gold', 
    tribulationName: '三九小雷劫', // 27道天雷
    penaltyType: 'major_unsafe', 
    bossHint: '烈焰妖王、極地劍靈等 (築基各域妖王)'
  },
  [MajorRealm.GoldenCore]: { 
    baseRate: 0.7, 
    requiredItemId: 'bt_gold_nascent', 
    tribulationName: '六九中雷劫', // 54道天雷
    penaltyType: 'major_unsafe',
    bossHint: '蜃樓主、百眼蛛母 (金丹各域妖王)'
  },
  [MajorRealm.NascentSoul]: { 
    baseRate: 0.6, 
    requiredItemId: 'bt_nascent_spirit', 
    tribulationName: '九九大雷劫', // 81道天雷
    penaltyType: 'major_unsafe',
    bossHint: '屍皇、無名劍修等 (元嬰各域妖王)'
  },
  [MajorRealm.SpiritSevering]: { 
    baseRate: 0.5, 
    requiredItemId: 'bt_spirit_void', 
    tribulationName: '天人五衰劫', // 肉身崩解之劫
    penaltyType: 'major_unsafe',
    bossHint: '霆祖 (雷罰之地)'
  },
  [MajorRealm.VoidRefining]: {
    baseRate: 0.45, 
    requiredItemId: 'bt_void_fusion', 
    tribulationName: '虛空破碎劫', // 虛空法則之劫
    penaltyType: 'major_unsafe',
    bossHint: '太虛夢魘 (虛空裂縫)'
  },
  [MajorRealm.Fusion]: { 
    baseRate: 0.4, 
    requiredItemId: 'bt_fusion_maha', 
    tribulationName: '五行混元劫', // 五行相生相剋之劫
    penaltyType: 'major_unsafe',
    bossHint: '虛空守衛 (五行神殿)'
  },
  [MajorRealm.Mahayana]: { 
    baseRate: 0.35, 
    requiredItemId: 'bt_maha_trib', 
    tribulationName: '心魔渡化劫', // 心魔入侵之劫
    penaltyType: 'major_unsafe',
    bossHint: '古神 · 星緯 (星空古路)'
  },
  [MajorRealm.Tribulation]: {
    baseRate: 0.3, 
    requiredItemId: 'bt_trib_immortal', 
    tribulationName: '九天玄雷劫', // 飛升前最終一劫
    penaltyType: 'major_unsafe',
    bossHint: '劫灰守衛 (天劫之門)'
  },
  [MajorRealm.Immortal]: { 
    baseRate: 0.1, 
    requiredItemId: 'bt_immortal_emperor', 
    tribulationName: '滅世虛無劫', // 仙人晉階帝君的終極考驗
    penaltyType: 'major_unsafe',
    bossHint: '鴻蒙之影、巡天神將 (混沌之源)'
  },
  [MajorRealm.ImmortalEmperor]: { 
    baseRate: 0.0, // 已達頂峰
    tribulationName: '終極因果劫', // 世界毀滅級別 (不可觸發)
    penaltyType: 'major_unsafe',
    bossHint: '天道意志 · 因果法身 (彼岸)'
  },
};


