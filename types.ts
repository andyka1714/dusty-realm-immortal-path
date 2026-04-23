export enum MajorRealm {
  Mortal = 0, // 凡人
  QiRefining = 1, // 練氣
  Foundation = 2, // 築基
  GoldenCore = 3, // 金丹
  NascentSoul = 4, // 元嬰
  SpiritSevering = 5, // 化神
  VoidRefining = 6, // 煉虛
  Fusion = 7, // 合體
  Mahayana = 8, // 大乘
  Tribulation = 9, // 渡劫
  Immortal = 10, // 仙人 (Includes Human, Earth, Heaven, Golden)
  ImmortalEmperor = 11, // 仙帝 (Max)
}

export const MajorRealmCN: Record<MajorRealm, string> = {
  [MajorRealm.Mortal]: "凡人",
  [MajorRealm.QiRefining]: "練氣",
  [MajorRealm.Foundation]: "築基",
  [MajorRealm.GoldenCore]: "金丹",
  [MajorRealm.NascentSoul]: "元嬰",
  [MajorRealm.SpiritSevering]: "化神",
  [MajorRealm.VoidRefining]: "煉虛",
  [MajorRealm.Fusion]: "合體",
  [MajorRealm.Mahayana]: "大乘",
  [MajorRealm.Tribulation]: "渡劫",
  [MajorRealm.Immortal]: "仙人",
  [MajorRealm.ImmortalEmperor]: "仙帝",
};

export enum ElementType {
  Metal = "Metal", // 金
  Wood = "Wood", // 木
  Water = "Water", // 水
  Fire = "Fire", // 火
  Earth = "Earth", // 土
  None = "None", // 無/雜
}

export enum SpiritRootType {
  Heterogenous = "Heterogenous", // 雜靈根 (1.0x) - 70%
  True = "True", // 真靈根 (1.5x) - 20%
  Heavenly = "Heavenly", // 天靈根 (2.5x) - 8%
  Variant = "Variant", // 變異靈根 (2.0x, +Battle Stats) - 2%
}

// Detailed Spirit Root IDs based on the spec
export enum SpiritRootId {
  // Heavenly (2.5x)
  HEAVENLY_GOLD = "heavenly_gold",
  HEAVENLY_WOOD = "heavenly_wood",
  HEAVENLY_WATER = "heavenly_water",
  HEAVENLY_FIRE = "heavenly_fire",
  HEAVENLY_EARTH = "heavenly_earth",

  // Variant (2.0x)
  VARIANT_WIND = "variant_wind",
  VARIANT_THUNDER = "variant_thunder",
  VARIANT_ICE = "variant_ice",

  // True (1.5x)
  TRUE_WOOD_FIRE = "true_wood_fire",
  TRUE_FIRE_METAL = "true_fire_metal",
  TRUE_METAL_EARTH = "true_metal_earth",
  TRUE_WATER_WOOD = "true_water_wood",
  TRUE_TRI = "true_tri",

  // Mixed (1.0x)
  MIXED_FOUR = "mixed_four",
  MIXED_FIVE = "mixed_five",
}

export enum ProfessionType {
  None = "None",
  Sword = "Sword", // 劍修
  Body = "Body", // 體修
  Mage = "Mage", // 法修
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export interface BaseAttributes {
  physique: number; // 體魄 (HP/Def)
  rootBone: number; // 根骨 (Atk/Cultivation Base)
  insight: number; // 神識 (MP/Crit/Craft)
  comprehension: number; // 悟性 (Speed/Breakthrough)
  fortune: number; // 福緣 (Luck/Dodge)
  charm: number; // 魅力 (Shop/Event) - New
}

export interface BreakthroughResult {
  success: boolean;
  dropRealm: boolean;
  isTribulation: boolean; // Is it a major realm tribulation?
  isMajor?: boolean;
  timestamp: number;
}

export interface CharacterState {
  isInitialized: boolean;
  isDead: boolean;
  lastDeathCause?: LifeEndCause;
  name: string;
  gender: Gender;
  title: string;

  spiritRoot: SpiritRootType; // The Category (Tier)
  spiritRootId: SpiritRootId; // The Specific Flavor

  profession: ProfessionType;

  majorRealm: MajorRealm;
  minorRealm: number; // 0-9

  age: number; // Days
  lifespan: number; // Days

  currentExp: number;
  maxExp: number;

  attributes: BaseAttributes;
  spiritStones: number;

  cultivationRate: number;
  cultivationCycle: number; // For 5s tick logic
  isBreakthroughAvailable: boolean;

  isInSeclusion: boolean;
  seclusionEndTime?: number; // Timestamp when seclusion ends

  gatheringLevel: number;

  lastSaveTime: number;

  lastBreakthroughResult?: BreakthroughResult;

  itemConsumption: Record<string, number>; // Track how many times an item was consumed

  lastProcessedYear: number;
  lastWarningAge?: number; // For yearly events
  lastManualCultivateTime?: number;
  skills: string[]; // Learned Skill IDs
}

export type LifeEndCause = "lifespan" | "battle" | "voluntary";

export type ReincarnationFlowStep = "inactive" | "life_review" | "hall";
export type ReincarnationBuildIdentity = "balanced" | "sword" | "body" | "mage";

export interface HeirloomCandidate {
  id: string;
  itemId: string;
  label: string;
  sourceType: "equipment" | "skill_manual";
  count: number;
  quality: ItemQuality;
  instanceId?: string;
  instance?: ItemInstance;
}

export interface LifeReviewSummary {
  cause: LifeEndCause;
  ageYears: number;
  highestRealm: MajorRealm;
  realmMerit: number;
  ageMerit: number;
  totalMeritGained: number;
  eligibleHeirlooms: HeirloomCandidate[];
}

export interface SoulLifetimeStats {
  highestRealmEver: MajorRealm;
  highestAgeYears: number;
  totalDeaths: number;
  totalReincarnations: number;
}

export interface ReincarnationPerk {
  id: string;
  name: string;
  description: string;
  cost: number;
  category?: "attribute" | "resource" | "legacy";
  buildIdentity?: Exclude<ReincarnationBuildIdentity, "balanced">;
  unlockRequirement?: {
    minHighestRealm?: MajorRealm;
    minReincarnations?: number;
  };
  requiredWorldMemoryTags?: string[];
  statBonuses?: Partial<BaseAttributes>;
  spiritStoneBonus?: number;
  heirloomSlotBonus?: number;
}

export interface ReincarnationSoulSeal {
  id: string;
  lane: Exclude<ReincarnationBuildIdentity, "balanced">;
  name: string;
  description: string;
  cost: number;
  unlockRequirement?: {
    minHighestRealm?: MajorRealm;
    minReincarnations?: number;
  };
  requiredWorldMemoryTags?: string[];
  statBonuses?: Partial<BaseAttributes>;
  spiritStoneBonus?: number;
  identityTitle: string;
  identityCue: string;
  heirloomHint: string;
}

export interface ReincarnationPlannerContext {
  lifetimeStats: SoulLifetimeStats;
  worldMemoryTags: string[];
}

export interface RebirthConfig {
  plannerVersion: number;
  selectedBuildIdentity: ReincarnationBuildIdentity;
  selectedSealId?: string;
  selectedPerkIds: string[];
  selectedHeirloomIds: string[];
  spiritRootOverride?: SpiritRootId;
}

export interface RebirthValidationReason {
  type: "merit" | "slot" | "prereq" | "mutual_exclusion";
  message: string;
}

export interface RebirthPlanPreview {
  identityTitle: string;
  identityCue: string;
  expectedBenefits: string[];
  invalidReasons: RebirthValidationReason[];
  perkBlockedReasons: Record<string, RebirthValidationReason | undefined>;
  heirloomBlockedReasons: Record<string, RebirthValidationReason | undefined>;
  canConfirm: boolean;
}

export interface SoulState {
  totalMerit: number;
  flowStep: ReincarnationFlowStep;
  lifetimeStats: SoulLifetimeStats;
  unlockedPerkIds: string[];
  heirloomVault: HeirloomCandidate[];
  worldMemoryTags: string[];
  pendingLifeReview: LifeReviewSummary | null;
  rebirthConfig: RebirthConfig;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type:
    | "info"
    | "gain"
    | "danger"
    | "success"
    | "gold"
    | "age"
    | "epiphany"
    | "warning-low"
    | "warning-med"
    | "warning-critical"
    | "tribulation";
}

export type StatusEffectId =
  | "stun"
  | "freeze"
  | "paralyze"
  | "banish"
  | "burn"
  | "true_fire_burn"
  | "poison"
  | "bleed"
  | "armorBreak"
  | "vulnerable"
  | "taunt"
  | "reflect_taunt"
  | "sword_qi"
  | "god_kingdom"
  | "spirit_sever"
  | "earth_shatter_debuff"
  | "beast_god_form"
  | "giant_form"
  | "zhuxian_domain"
  | "drain";

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: "Active" | "Passive";
  cooldown: number; // Turns
  cooldownSeconds?: number;
  minRealm: MajorRealm;
  profession?: ProfessionType; // Specific to a profession or general (None)
  castRange?: number;
  castTimeMs?: number;
  projectileSpeed?: number;
  areaShape?: "single" | "line" | "cone" | "circle" | "self";
  areaRadius?: number;
  maxTargets?: number;

  // Battle Logic Descriptors
  damageMultiplier?: number; // e.g. 1.5 for 150%
  healMultiplier?: number;
  effectType?: "damage" | "heal" | "buff" | "debuff" | "summon" | "special";
  targetType?: "single" | "all" | "self";
  statusEffect?: {
    id: StatusEffectId | string;
    duration: number;
    chance: number;
    value?: number; // e.g. Poison damage %
  };
  cost?: number; // MP cost usually, or special resource
  replacementSkillId?: string;
  poolStatus?: "core" | "transition" | "legacy";
  formalRole?: "guaranteed" | "utility" | "burst" | "passive";
  formalSourceTier?: "shop" | "elite" | "boss" | "inheritance";
  prerequisiteSkillIds?: string[];
}

export type SkillAcquisitionTier =
  | "basic"
  | "advanced"
  | "boss_core"
  | "inheritance";

export type SkillManualSourceType =
  | "shop_mortal"
  | "shop_sect"
  | "quest_sect_trial"
  | "drop_elite"
  | "drop_boss"
  | "inheritance";

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
  dir?: string; // Direction hint for visualization (North, South, etc.)
}

export enum EnemyRank {
  Common = "Common",
  Elite = "Elite",
  Boss = "Boss",
}

export type MinorRealmType = "初期" | "中期" | "後期" | "圓滿";

export interface Enemy {
  id: string;
  name: string;
  realm: MajorRealm;
  minorRealm?: MinorRealmType; // e.g. '初期', '中期', '後期', '圓滿'
  symbol?: string; // Single character for map display
  rank: EnemyRank;
  aiStyle?: "melee" | "ranged" | "caster";
  attackRange?: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  element: ElementType;
  resistances?: ElementType[];
  weaknesses?: ElementType[];
  affixes?: string[];
  drops: string[]; // itemIds
  exp: number;
  description?: string;
  specialAttack?: {
    name: string;
    cooldownSeconds: number;
    damageMultiplier?: number;
    statusEffect?: {
      id: StatusEffectId | string;
      duration: number;
      chance: number;
      value?: number;
    };
    castRange?: number;
    castTimeMs?: number;
    projectileSpeed?: number;
    areaShape?: "single" | "line" | "cone" | "circle" | "self";
    areaRadius?: number;
    maxTargets?: number;
  };
}

export interface ActiveMonster extends Coordinate {
  instanceId: string;
  templateId: string;
  name: string; // Synced for display
  symbol?: string; // Synced for display
  currentHp: number;
  rank: EnemyRank; // Cached for quick rendering logic
  spawnX: number;
  spawnY: number;
  nextMoveTime?: number; // Timestamp for next move
}

export enum NPCType {
  Shop = "Shop",
  Quest = "Quest",
  Healer = "Healer",
  Crafting = "Crafting",
  Info = "Info", // rumors
}

export interface NPC extends Coordinate {
  id: string;
  name: string;
  symbol: string; // e.g. '商'
  type: NPCType;
  description: string;
  dialogue?: string[];
  // Placeholder for future functionality
  shopId?: string;
  questIds?: string[];
}

export interface MapData {
  id: string;
  name: string;
  theme: string;
  minRealm: MajorRealm;
  description: string;
  introText: string; // Typewriter text
  width: number;
  height: number;
  worldX: number; // Global Map X
  worldY: number; // Global Map Y
  portals: Portal[];
  npcs: NPC[]; // New field
  bossSpawn?: { x: number; y: number; enemyId: string };
  enemies: Enemy[];
  dropRateMultiplier: number;
}

export interface CombatLog {
  turn: number;
  timeMs?: number;
  message: string;
  isPlayer: boolean;
  damage?: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses?: string[];
  enemyStatuses?: string[];
  playerActiveSkillName?: string;
  playerActiveSkillCooldownRemainingMs?: number;
  playerActiveSkillCooldownTotalMs?: number;
}

// --- Item & Inventory ---

// --- Item & Inventory System ---

export enum ItemCategory {
  Equipment = "Equipment",
  Consumable = "Consumable",
  Material = "Material",
  SkillBook = "SkillBook",
  Breakthrough = "Breakthrough",
}

export enum ItemQuality {
  Low = 0, // 下品 (Grey)
  Medium = 1, // 中品 (Green)
  High = 2, // 上品 (Blue)
  Immortal = 3, // 仙品 (Gold)
}

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  quality: ItemQuality;
  price: number;
  maxStack: number;
  minRealm?: MajorRealm;
}

// -- Consumables --
export enum ConsumableType {
  Pill = "Pill", // 丹藥
  Fateful = "Fateful", // 機緣物品
  Manual = "Manual", // 功法秘籍
  Map = "Map", // 地圖
  Other = "Other",
}

export interface ConsumableEffect {
  type:
    | "full_restore"
    | "heal_hp"
    | "heal_mp"
    | "gain_exp"
    | "buff_stat"
    | "lifespan"
    | "breakthrough_chance"
    | "learn_skill";
  value: number;
  duration?: number; // seconds, 0 for instant
  stat?: keyof BaseAttributes;
  skillId?: string; // For learn_skill
}

export interface ConsumableItem extends BaseItem {
  category: ItemCategory.Consumable | ItemCategory.Breakthrough;
  subType: ConsumableType;
  effects: ConsumableEffect[];
  cooldown?: number;
  maxUsage?: number;
  requiredProfession?: ProfessionType;
  requiredRealm?: MajorRealm;
  manualSkillId?: string;
  manualAcquisitionTier?: SkillAcquisitionTier;
  manualSourceTypes?: SkillManualSourceType[];
  prerequisiteSkillIds?: string[];
}

// -- Materials --
export enum MaterialType {
  Herb = "Herb", // 藥草
  MonsterPart = "MonsterPart", // 妖獸素材
  Ore = "Ore", // 礦石
  Other = "Other",
}

export interface MaterialItem extends BaseItem {
  category: ItemCategory.Material;
  subType: MaterialType;
  element?: ElementType;
}

// -- Equipment --
export enum EquipmentSlot {
  Weapon = "Weapon",
  Head = "Head",
  Body = "Body",
  Legs = "Legs",
  Accessory = "Accessory",
  Offhand = "Offhand",
}

export enum EquipmentType {
  // Weapon
  Sword = "Sword", // 劍修
  Gauntlet = "Gauntlet", // 體修
  Staff = "Staff", // 法修

  // Defense
  Helmet = "Helmet",
  Armor = "Armor",
  Boots = "Boots",
  Ring = "Ring", // 戒指 (Accessory)
  SimpleRobe = "SimpleRobe", // Novice
  Shield = "Shield",
  Accessory = "Accessory", // Add missing value
}

export interface EquipmentStats extends Partial<BaseAttributes> {
  hp?: number;
  mp?: number;
  attack?: number;
  defense?: number;
  magic?: number;
  res?: number;
  speed?: number;
  crit?: number;
  critDamage?: number;
  dodge?: number;
  blockRate?: number;
  regenHp?: number;
  damageReduction?: number;
}

export interface EquipmentItem extends BaseItem {
  category: ItemCategory.Equipment;
  slot: EquipmentSlot;
  subType: EquipmentType;

  // Stats
  stats: EquipmentStats;

  // Requirements
  reqRealm?: MajorRealm;
}

export type Item = ConsumableItem | MaterialItem | EquipmentItem;

export interface ItemInstance {
  instanceId: string;
  templateId: string; // The original Item ID
  quality: ItemQuality;
  stats: EquipmentStats;
  affixes?: { name: string; description: string }[];
}

export interface InventorySlot {
  itemId: string;
  count: number;
  // If present, this slot represents a single unique item instance (non-stackable)
  instanceId?: string;
  instance?: ItemInstance;
}

export interface EquipmentState {
  [EquipmentSlot.Weapon]: string | null; // instanceId
  [EquipmentSlot.Head]: string | null;
  [EquipmentSlot.Body]: string | null;
  [EquipmentSlot.Legs]: string | null;
  [EquipmentSlot.Accessory]: string | null;
  [EquipmentSlot.Offhand]: string | null;
}

// --- Workshop ---

export type WorkshopDiscipline = "alchemy" | "smithing";

export interface WorkshopSpecializationDisciplineState {
  unlockedNodeIds: string[];
  activeNodeId: string | null;
  activeBranchId: string | null;
}

export interface WorkshopState {
  alchemyLevel: number;
  blacksmithLevel: number;
  unlockedRecipes: string[];
  craftedRecipeCounts: Record<string, number>;
  masteryByDiscipline: Record<WorkshopDiscipline, number>;
  specializationTreeByDiscipline: Record<
    WorkshopDiscipline,
    WorkshopSpecializationDisciplineState
  >;
  /**
   * Legacy compatibility mirror for old saves and older selectors.
   * New rules should read specializationTreeByDiscipline.
   */
  specializationByDiscipline: Record<WorkshopDiscipline, string | null>;
}

export interface EncounterPresentationCue {
  chainLabel?: string;
  memoryCue?: string;
  routeLabel?: string;
  professionLabel?: string;
  sectLabel?: string;
}

export interface PendingEncounter {
  eventId: string;
  year: number;
  presentationCue?: EncounterPresentationCue;
}

export interface EncounterState {
  pendingEvent: PendingEncounter | null;
  resolvedEventIds: string[];
}

// --- Quest System ---

export enum QuestType {
  Main = "main", // 主線
  Side = "side", // 支線
  Sect = "sect", // 門派任務 (長老發布)
}

export enum QuestStatus {
  Available = "available", // 可接取
  Active = "active", // 進行中
  Completed = "completed", // 已完成
}

export interface QuestRequirement {
  type: "level" | "item" | "kill" | "dialogue"; // dialogue 代表純對話任務
  targetId?: string; // 物品ID 或 怪物ID
  targetNpcId?: string; // 對話對象 NPC ID (For 'dialogue' requirements)
  count?: number; // 數量
  minRealm?: number; // 等級需求
}

export interface QuestReward {
  exp?: number;
  spiritStones?: number;
  items?: { itemId: string; count: number; quality?: ItemQuality }[];
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  giverId: string; // 發布 NPC ID

  // 需求條件
  requirements: QuestRequirement[];

  // 獎勵
  rewards: QuestReward[];

  // 對話配置 (支持多段對話)
  dialogue: {
    start: string[]; // 接任務時的對話
    progress: string[]; // 任務進行中的對話 (未完成)
    complete: string[]; // 完成任務時的對話
  };

  // 前置任務 ID
  prerequisiteQuestId?: string;

  // 交付任務 NPC ID (若為空則預設為 giverId)
  // 用於 A 發布 -> B 交付 的流程
  submitNpcId?: string;
}

export interface VisualEffect {
  id: string;
  type: "text" | "projectile" | "area" | "impact" | "cast";
  text: string;
  color: string; // hex string: '#ff0000' or numeric 0xff0000? Let's use string for CSS or PIXI interop, probably numeric is better for PIXI but string is versatile. Let's use numeric.
  colorInt: number;
  x?: number; // fallback or override
  y?: number;
  targetX?: number;
  targetY?: number;
  radius?: number;
  durationMs?: number;
}
