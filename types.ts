
export enum MajorRealm {
  Mortal = 0,         // 凡人
  QiRefining = 1,     // 練氣
  Foundation = 2,     // 築基
  GoldenCore = 3,     // 金丹
  NascentSoul = 4,    // 元嬰
  SpiritSevering = 5, // 化神
  VoidRefining = 6,   // 煉虛
  Fusion = 7,         // 合體
  Mahayana = 8,       // 大乘
  Tribulation = 9,    // 渡劫
  Immortal = 10,      // 仙人 (Includes Human, Earth, Heaven, Golden)
  ImmortalEmperor = 11// 仙帝 (Max)
}

export enum ElementType {
  Metal = 'Metal', // 金
  Wood = 'Wood',   // 木
  Water = 'Water', // 水
  Fire = 'Fire',   // 火
  Earth = 'Earth', // 土
  None = 'None'    // 無/雜
}

export enum SpiritRootType {
  Heterogenous = 'Heterogenous', // 雜靈根 (1.0x) - 70%
  True = 'True',                 // 真靈根 (1.5x) - 20%
  Heavenly = 'Heavenly',         // 天靈根 (2.5x) - 8%
  Variant = 'Variant'            // 變異靈根 (2.0x, +Battle Stats) - 2%
}

// Detailed Spirit Root IDs based on the spec
export enum SpiritRootId {
  // Heavenly (2.5x)
  HEAVENLY_GOLD = 'heavenly_gold',
  HEAVENLY_WOOD = 'heavenly_wood',
  HEAVENLY_WATER = 'heavenly_water',
  HEAVENLY_FIRE = 'heavenly_fire',
  HEAVENLY_EARTH = 'heavenly_earth',

  // Variant (2.0x)
  VARIANT_WIND = 'variant_wind',
  VARIANT_THUNDER = 'variant_thunder',
  VARIANT_ICE = 'variant_ice',

  // True (1.5x)
  TRUE_WOOD_FIRE = 'true_wood_fire',
  TRUE_METAL_EARTH = 'true_metal_earth',
  TRUE_WATER_WOOD = 'true_water_wood',
  TRUE_TRI = 'true_tri',

  // Mixed (1.0x)
  MIXED_FOUR = 'mixed_four',
  MIXED_FIVE = 'mixed_five',
}

export enum ProfessionType {
  None = 'None',
  Sword = 'Sword',     // 劍修
  Body = 'Body',       // 體修
  Mage = 'Mage',       // 法修
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export interface BaseAttributes {
  physique: number;   // 體魄 (HP/Def)
  rootBone: number;   // 根骨 (Atk/Cultivation Base)
  insight: number;    // 神識 (MP/Crit/Craft)
  comprehension: number; // 悟性 (Speed/Breakthrough)
  fortune: number;    // 福緣 (Luck/Dodge)
  charm: number;      // 魅力 (Shop/Event) - New
}

export interface BreakthroughResult {
  success: boolean;
  dropRealm: boolean;
  isTribulation: boolean; // Is it a major realm tribulation?
  timestamp: number;
}

export interface CharacterState {
  isInitialized: boolean;
  isDead: boolean;
  name: string;
  gender: Gender;
  title: string;
  
  spiritRoot: SpiritRootType; // The Category (Tier)
  spiritRootId: SpiritRootId; // The Specific Flavor
  
  profession: ProfessionType;
  
  majorRealm: MajorRealm;
  minorRealm: number; // 0-9
  
  age: number;      // Days
  lifespan: number; // Days
  
  currentExp: number;
  maxExp: number;
  
  attributes: BaseAttributes;
  spiritStones: number;
  
  cultivationRate: number;
  isBreakthroughAvailable: boolean;
  
  isInSeclusion: boolean;
  
  gatheringLevel: number; 
  
  lastSaveTime: number; 
  
  lastBreakthroughResult?: BreakthroughResult;
  
  itemConsumption: Record<string, number>; // Track how many times an item was consumed
  
  lastProcessedYear: number;
  lastWarningAge?: number; // For yearly events
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'gain' | 'danger' | 'success' | 'gold' | 'age' | 'epiphany' | 'warning-low' | 'warning-med' | 'warning-critical' | 'tribulation';
}

// --- Combat & Map ---

export interface Coordinate {
  x: number;
  y: number;
}

export interface Portal extends Coordinate {
  targetMapId: string;
  targetX: number;
  targetY: number;
  label: string; // e.g., "前往 [野狼原]"
}

export enum EnemyRank {
  Common = 'Common',
  Elite = 'Elite',
  Boss = 'Boss'
}

export interface Enemy {
  id: string;
  name: string;
  realm: MajorRealm;
  rank: EnemyRank;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  element: ElementType;
  drops: string[]; // itemIds
  exp: number;
  description?: string;
}

export interface ActiveMonster extends Coordinate {
    instanceId: string;
    templateId: string;
    currentHp: number;
    rank: EnemyRank; // Cached for quick rendering logic
}

export interface MapData {
  id: string;
  name: string;
  minRealm: MajorRealm;
  description: string;
  introText: string; // Typewriter text
  width: number;
  height: number;
  worldX: number; // Global Map X
  worldY: number; // Global Map Y
  portals: Portal[];
  bossSpawn?: { x: number, y: number, enemyId: string };
  enemies: Enemy[];
  dropRateMultiplier: number;
}

export interface CombatLog {
  turn: number;
  message: string;
  isPlayer: boolean;
  damage?: number;
}

// --- Item & Inventory ---

export type ItemType = 'weapon' | 'armor' | 'pill' | 'material' | 'manual' | 'breakthrough';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  price: number; 
  effects?: {
    stat?: keyof BaseAttributes;
    value?: number;
    healHp?: number;
    healMp?: number;
    cultivationSpeed?: number;
    lifespan?: number;
  };
  rarity: number; // 1-5
  maxConsumption?: number; // Max times this item can be consumed
}

export interface InventoryItem {
  itemId: string;
  count: number;
}

export interface Equipment {
  weapon: string | null; 
  armor: string | null;  
  accessory: string | null; 
}

// --- Workshop ---

export interface WorkshopState {
  gatheringLevel: number;
  alchemyLevel: number;
  blacksmithLevel: number;
  unlockedRecipes: string[];
}
