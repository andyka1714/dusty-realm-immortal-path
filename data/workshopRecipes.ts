import { MajorRealm, ItemQuality, type WorkshopDiscipline, type WorkshopState } from "../types";
import {
  WORKSHOP_SPECIALIZATION_NODES,
  getActiveWorkshopSpecializationNode,
  getWorkshopRecipeSpecializationEffect,
  getWorkshopSpecializationNodeStatus,
  type WorkshopSpecializationNode,
} from "./workshopSpecializationTree";

export type WorkshopRecipeDiscipline = WorkshopDiscipline;
export type WorkshopRecipeTier = "basic" | "advanced" | "highRealm";

export interface WorkshopRecipe {
  id: string;
  name: string;
  discipline: WorkshopRecipeDiscipline;
  tier?: WorkshopRecipeTier;
  minRealm?: MajorRealm;
  routeTags?: string[];
  qualityHint?: string;
  sourceHint?: string;
  masteryYield?: number;
  description: string;
  spiritStoneCost: number;
  requiredLevel: number;
  ingredients: Array<{
    itemId: string;
    count: number;
  }>;
  outputs: Array<{
    itemId: string;
    count: number;
    quality?: ItemQuality;
  }>;
}

export type WorkshopSpecialization = WorkshopSpecializationNode;

export interface WorkshopSpecializationUnlockStatus {
  unlocked: boolean;
  reason: string | null;
}

export interface WorkshopRecipeCraftingPlan {
  spiritStoneCost: number;
  masteryYield: number;
  activeSpecialization: WorkshopSpecialization | null;
  qualityCues: string[];
  outputCues: string[];
}

export const WORKSHOP_SPECIALIZATIONS: Record<string, WorkshopSpecialization> =
  WORKSHOP_SPECIALIZATION_NODES;

export const WORKSHOP_RECIPES: Record<string, WorkshopRecipe> = {
  qi_pill: {
    id: "qi_pill",
    name: "聚氣丹",
    discipline: "alchemy",
    tier: "basic",
    description: "以聚靈草萃出溫和丹氣，補上前期修為缺口。",
    spiritStoneCost: 25,
    requiredLevel: 1,
    ingredients: [{ itemId: "spirit_herb", count: 2 }],
    outputs: [{ itemId: "qi_pill", count: 1 }],
  },
  novice_sword_reforge: {
    id: "novice_sword_reforge",
    name: "鏽鐵劍重鑄",
    discipline: "smithing",
    tier: "basic",
    description: "以玄鐵礦與妖狼牙重鑄一柄能入世歷練的劍器。",
    spiritStoneCost: 35,
    requiredLevel: 1,
    ingredients: [
      { itemId: "iron_ore", count: 2 },
      { itemId: "wolf_fang", count: 1 },
    ],
    outputs: [{ itemId: "novice_sword", count: 1, quality: ItemQuality.Low }],
  },
  void_refining_starlotus_pill: {
    id: "void_refining_starlotus_pill",
    name: "太虛星魂丹",
    discipline: "alchemy",
    tier: "highRealm",
    minRealm: MajorRealm.SpiritSevering,
    routeTags: ["化神", "煉虛", "縹緲仙宮"],
    qualityHint: "仙品破障丹，補足化神後期踏入煉虛的丹道 sink。",
    sourceHint: "縹緲仙宮星砂秘材與聚靈草熬成的太虛破障丹。",
    masteryYield: 18,
    description: "以星魂蓮穩住神識，再以血骨殘材壓住破虛反噬，凝成可開太虛之門的高階丹藥。",
    spiritStoneCost: 180,
    requiredLevel: 6,
    ingredients: [
      { itemId: "mystic_path_starlotus", count: 1 },
      { itemId: "beast_path_bloodbone", count: 1 },
      { itemId: "spirit_herb", count: 5 },
    ],
    outputs: [{ itemId: "bt_spirit_void", count: 1, quality: ItemQuality.Immortal }],
  },
  immortal_emperor_breakthrough_pill: {
    id: "immortal_emperor_breakthrough_pill",
    name: "九轉鴻蒙丹",
    discipline: "alchemy",
    tier: "highRealm",
    minRealm: MajorRealm.SpiritSevering,
    routeTags: ["化神", "仙帝", "縹緲仙宮"],
    qualityHint: "仙品破境丹，專供化神後期衝擊仙帝門檻。",
    sourceHint: "縹緲仙宮星砂秘材與萬獸血骨殘材熬煉出的高階破境丹。",
    masteryYield: 28,
    description: "以星砂秘材壓住丹火，再以血骨殘材鎮住反噬，直指仙帝門檻。",
    spiritStoneCost: 288,
    requiredLevel: 8,
    ingredients: [
      { itemId: "mystic_path_starlotus", count: 2 },
      { itemId: "beast_path_bloodbone", count: 1 },
      { itemId: "spirit_herb", count: 6 },
    ],
    outputs: [{ itemId: "bt_immortal_emperor", count: 1, quality: ItemQuality.Immortal }],
  },
  immortal_ascension_elixir: {
    id: "immortal_ascension_elixir",
    name: "萬獸飛昇液",
    discipline: "alchemy",
    tier: "highRealm",
    minRealm: MajorRealm.Tribulation,
    routeTags: ["渡劫", "仙人", "萬獸山莊"],
    qualityHint: "仙品飛昇丹液，承接渡劫後段轉入仙人境的高壓材料 sink。",
    sourceHint: "萬獸血骨殘材輔以縹緲仙宮星砂秘材，洗去凡胎並凝聚仙引。",
    masteryYield: 24,
    description: "將血骨殘材化作護道藥引，再以星魂蓮鎖住仙元，形成可承受飛昇反噬的丹液。",
    spiritStoneCost: 240,
    requiredLevel: 7,
    ingredients: [
      { itemId: "beast_path_bloodbone", count: 2 },
      { itemId: "mystic_path_starlotus", count: 1 },
      { itemId: "spirit_herb", count: 8 },
    ],
    outputs: [{ itemId: "bt_trib_immortal", count: 1, quality: ItemQuality.Immortal }],
  },
  star_lotus_hongmeng_pill: {
    id: "star_lotus_hongmeng_pill",
    name: "星蓮鴻蒙丹",
    discipline: "alchemy",
    tier: "highRealm",
    minRealm: MajorRealm.Immortal,
    routeTags: ["仙帝", "縹緲仙宮", "鴻蒙丹火"],
    qualityHint: "仙品終盤丹，將星魂蓮與三路線殘材轉成仙帝前置補強。",
    sourceHint: "縹緲星魂蓮為主藥，凌霄劍星鋼與萬獸血骨殘材穩住丹火反噬。",
    masteryYield: 38,
    description: "以星魂蓮冠住鴻蒙火候，再用星鋼與血骨殘材封住反噬，形成仙帝前夕的終盤丹道 sink。",
    spiritStoneCost: 370,
    requiredLevel: 8,
    ingredients: [
      { itemId: "mystic_path_starlotus", count: 3 },
      { itemId: "sword_path_starsteel", count: 1 },
      { itemId: "beast_path_bloodbone", count: 1 },
      { itemId: "spirit_herb", count: 10 },
    ],
    outputs: [{ itemId: "bt_immortal_emperor", count: 1, quality: ItemQuality.Immortal }],
  },
  immortal_emperor_sword_forge: {
    id: "immortal_emperor_sword_forge",
    name: "萬古帝劍鍛造",
    discipline: "smithing",
    tier: "highRealm",
    minRealm: MajorRealm.SpiritSevering,
    routeTags: ["化神", "仙帝", "凌霄劍宗"],
    qualityHint: "仙品帝兵，劍修終局的證道兵器。",
    sourceHint: "凌霄劍宗前哨殘核熔出的劍心星鋼，混入血骨殘材鍛成帝劍胚。",
    masteryYield: 32,
    description: "將劍宗殘核、血骨殘材與靈石火候一併熔鑄，成就可承載帝意的終局劍器。",
    spiritStoneCost: 320,
    requiredLevel: 8,
    ingredients: [
      { itemId: "sword_path_starsteel", count: 2 },
      { itemId: "beast_path_bloodbone", count: 2 },
      { itemId: "iron_ore", count: 4 },
    ],
    outputs: [{ itemId: "origin_sword", count: 1, quality: ItemQuality.Immortal }],
  },
  starsteel_bloodbone_sword_forge: {
    id: "starsteel_bloodbone_sword_forge",
    name: "星血帝劍重鍛",
    discipline: "smithing",
    tier: "highRealm",
    minRealm: MajorRealm.Immortal,
    routeTags: ["仙帝", "凌霄劍宗", "萬獸山莊"],
    qualityHint: "仙品終盤帝兵，將星鋼、血骨與星魂蓮壓成劍修終局 sink。",
    sourceHint: "凌霄劍星鋼作劍骨，萬獸血骨殘材作劍脊，縹緲星魂蓮定住劍心。",
    masteryYield: 38,
    description: "以凌霄星鋼為骨、萬獸血骨為脊，再用星魂蓮定住劍心，重鍛仙帝前夕的本命帝劍。",
    spiritStoneCost: 400,
    requiredLevel: 8,
    ingredients: [
      { itemId: "sword_path_starsteel", count: 3 },
      { itemId: "beast_path_bloodbone", count: 2 },
      { itemId: "mystic_path_starlotus", count: 1 },
      { itemId: "iron_ore", count: 8 },
    ],
    outputs: [{ itemId: "origin_sword", count: 1, quality: ItemQuality.Immortal }],
  },
  great_dao_body_forge: {
    id: "great_dao_body_forge",
    name: "大道真身鑄胚",
    discipline: "smithing",
    tier: "highRealm",
    minRealm: MajorRealm.Immortal,
    routeTags: ["仙帝", "萬獸山莊", "歸墟裂界"],
    qualityHint: "仙品體修帝兵，將萬獸血骨殘材轉成終盤肉身裝備。",
    sourceHint: "萬獸血骨殘材混入歸墟裂界壓力火候，鍛出大道真身胚。",
    masteryYield: 30,
    description: "以血骨殘材為主骨、星鋼為筋，反覆壓入歸墟裂界火候，成就體修終盤戰甲。",
    spiritStoneCost: 300,
    requiredLevel: 8,
    ingredients: [
      { itemId: "beast_path_bloodbone", count: 3 },
      { itemId: "sword_path_starsteel", count: 1 },
      { itemId: "iron_ore", count: 6 },
    ],
    outputs: [{ itemId: "great_dao_body", count: 1, quality: ItemQuality.Immortal }],
  },
  supreme_law_staff_forge: {
    id: "supreme_law_staff_forge",
    name: "至高法杖鍛造",
    discipline: "smithing",
    tier: "highRealm",
    minRealm: MajorRealm.Immortal,
    routeTags: ["仙帝", "縹緲仙宮", "歸墟裂界"],
    qualityHint: "仙品法修帝兵，將縹緲仙宮材料轉成終盤法器 sink。",
    sourceHint: "縹緲仙宮星砂秘材與凌霄劍宗前哨殘核共同定住法則杖芯。",
    masteryYield: 30,
    description: "將星魂蓮煉成法則杖芯，再以劍心星鋼約束外層靈脈，形成可承載至高法則的終盤法器。",
    spiritStoneCost: 300,
    requiredLevel: 8,
    ingredients: [
      { itemId: "mystic_path_starlotus", count: 3 },
      { itemId: "sword_path_starsteel", count: 1 },
      { itemId: "iron_ore", count: 6 },
    ],
    outputs: [{ itemId: "supreme_law_staff", count: 1, quality: ItemQuality.Immortal }],
  },
};

export const getWorkshopDisciplineLevel = (
  workshop: WorkshopState,
  discipline: WorkshopRecipeDiscipline
) => (discipline === "alchemy" ? workshop.alchemyLevel : workshop.blacksmithLevel);

const getActiveWorkshopSpecialization = (
  workshop: WorkshopState,
  recipe: WorkshopRecipe
) => {
  return getWorkshopRecipeSpecializationEffect({
    workshop,
    discipline: recipe.discipline,
    tier: recipe.tier,
  }).activeNode;
};

export const getWorkshopSpecializationUnlockStatus = (
  workshop: WorkshopState,
  specialization: WorkshopSpecialization
): WorkshopSpecializationUnlockStatus => {
  const status = getWorkshopSpecializationNodeStatus({ workshop, node: specialization });
  return {
    unlocked: status.isAvailable,
    reason: status.lockReason ?? status.conflictReason,
  };
};

export const getWorkshopRecipeCraftingPlan = (
  recipe: WorkshopRecipe,
  workshop: WorkshopState
): WorkshopRecipeCraftingPlan => {
  const specializationEffect = getWorkshopRecipeSpecializationEffect({
    workshop,
    discipline: recipe.discipline,
    tier: recipe.tier,
  });
  const activeSpecialization = getActiveWorkshopSpecializationNode(workshop, recipe.discipline);
  const spiritStoneCost = Math.ceil(
    recipe.spiritStoneCost * specializationEffect.spiritStoneCostMultiplier
  );
  const masteryYield =
    (recipe.masteryYield ?? 1) + specializationEffect.masteryYieldBonus;

  return {
    spiritStoneCost,
    masteryYield,
    activeSpecialization:
      activeSpecialization?.effect &&
      (!activeSpecialization.effect.appliesToTier ||
        activeSpecialization.effect.appliesToTier === recipe.tier)
        ? activeSpecialization
        : null,
    qualityCues: specializationEffect.qualityCues,
    outputCues: specializationEffect.outputCues,
  };
};

export const getUnlockedWorkshopRecipes = (
  workshop: WorkshopState,
  discipline: WorkshopRecipeDiscipline
) =>
  workshop.unlockedRecipes
    .map((recipeId) => WORKSHOP_RECIPES[recipeId])
    .filter(
      (recipe): recipe is WorkshopRecipe =>
        Boolean(recipe) && recipe.discipline === discipline
    );
