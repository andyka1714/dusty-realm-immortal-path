import { describe, expect, it } from "vitest";
import { MajorRealm } from "../types";
import { ITEMS } from "./items";
import { MATERIAL_ITEMS } from "./items/materials";
import {
  WORKSHOP_RECIPES,
  WORKSHOP_SPECIALIZATIONS,
  getWorkshopRecipeCraftingPlan,
} from "./workshopRecipes";
import {
  WORKSHOP_SPECIALIZATION_TREE,
  createInitialWorkshopSpecializationTreeState,
  getWorkshopMasteryMilestoneStatuses,
} from "./workshopSpecializationTree";

const HIGH_TIER_RECIPE_CASES = [
  {
    id: "void_refining_starlotus_pill",
    discipline: "alchemy",
    outputItemId: "bt_spirit_void",
    expectedMinRealm: MajorRealm.SpiritSevering,
    expectedRouteTags: ["化神", "煉虛", "縹緲仙宮"],
    expectedSourceHint: "縹緲仙宮星砂秘材",
  },
  {
    id: "immortal_emperor_breakthrough_pill",
    discipline: "alchemy",
    outputItemId: "bt_immortal_emperor",
    expectedMinRealm: MajorRealm.SpiritSevering,
    expectedRouteTags: ["化神", "仙帝", "縹緲仙宮"],
    expectedSourceHint: "縹緲仙宮星砂秘材",
  },
  {
    id: "immortal_ascension_elixir",
    discipline: "alchemy",
    outputItemId: "bt_trib_immortal",
    expectedMinRealm: MajorRealm.Tribulation,
    expectedRouteTags: ["渡劫", "仙人", "萬獸山莊"],
    expectedSourceHint: "萬獸血骨殘材",
  },
  {
    id: "immortal_emperor_sword_forge",
    discipline: "smithing",
    outputItemId: "origin_sword",
    expectedMinRealm: MajorRealm.SpiritSevering,
    expectedRouteTags: ["化神", "仙帝", "凌霄劍宗"],
    expectedSourceHint: "凌霄劍宗前哨殘核",
  },
  {
    id: "great_dao_body_forge",
    discipline: "smithing",
    outputItemId: "great_dao_body",
    expectedMinRealm: MajorRealm.Immortal,
    expectedRouteTags: ["仙帝", "萬獸山莊", "歸墟裂界"],
    expectedSourceHint: "萬獸血骨殘材",
  },
  {
    id: "supreme_law_staff_forge",
    discipline: "smithing",
    outputItemId: "supreme_law_staff",
    expectedMinRealm: MajorRealm.Immortal,
    expectedRouteTags: ["仙帝", "縹緲仙宮", "歸墟裂界"],
    expectedSourceHint: "縹緲仙宮星砂秘材",
  },
  {
    id: "star_lotus_hongmeng_pill",
    discipline: "alchemy",
    outputItemId: "bt_immortal_emperor",
    expectedMinRealm: MajorRealm.Immortal,
    expectedRouteTags: ["仙帝", "縹緲仙宮", "鴻蒙丹火"],
    expectedSourceHint: "縹緲星魂蓮",
  },
  {
    id: "starsteel_bloodbone_sword_forge",
    discipline: "smithing",
    outputItemId: "origin_sword",
    expectedMinRealm: MajorRealm.Immortal,
    expectedRouteTags: ["仙帝", "凌霄劍宗", "萬獸山莊"],
    expectedSourceHint: "凌霄劍星鋼",
  },
] as const;

const ROUTE_SPECIFIC_MATERIAL_IDS = new Set([
  "sword_path_starsteel",
  "mystic_path_starlotus",
  "beast_path_bloodbone",
]);

const V3_ROUTE_MEMORY_CASES = [
  {
    memoryTag: "sect:sword:world-chapter-03",
    materialId: "sword_path_starsteel",
    expectedRecipes: ["immortal_emperor_sword_forge", "starsteel_bloodbone_sword_forge"],
    expectedSpecializationId: "smithing_starfire_starsteel_crown",
  },
  {
    memoryTag: "sect:beast:world-chapter-03",
    materialId: "beast_path_bloodbone",
    expectedRecipes: ["immortal_ascension_elixir", "starsteel_bloodbone_sword_forge"],
    expectedSpecializationId: "alchemy_lifebloom_resonance",
  },
  {
    memoryTag: "sect:mystic:world-chapter-03",
    materialId: "mystic_path_starlotus",
    expectedRecipes: ["star_lotus_hongmeng_pill", "supreme_law_staff_forge"],
    expectedSpecializationId: "alchemy_hongmeng_star_lotus_crown",
  },
] as const;

describe("workshop recipe data", () => {
  it("adds representative high-tier alchemy and smithing recipes with planning metadata", () => {
    HIGH_TIER_RECIPE_CASES.forEach((testCase) => {
      const recipe = WORKSHOP_RECIPES[testCase.id];

      expect(recipe, `${testCase.id} should exist`).toBeDefined();
      expect(recipe?.discipline).toBe(testCase.discipline);
      expect(recipe?.tier).toBe("highRealm");
      expect(recipe?.minRealm).toBe(testCase.expectedMinRealm);
      expect(recipe?.qualityHint).toContain("仙品");
      expect(recipe?.sourceHint).toContain(testCase.expectedSourceHint);
      expect(recipe?.masteryYield).toBeGreaterThan(0);
      expect(recipe?.routeTags).toEqual(expect.arrayContaining([...testCase.expectedRouteTags]));
      expect(recipe?.routeTags?.length).toBeGreaterThan(0);
    });
  });

  it("adds a second high-tier batch across both disciplines instead of a single terminal recipe pair", () => {
    const highTierRecipes = Object.values(WORKSHOP_RECIPES).filter(
      (recipe) => recipe.tier === "highRealm"
    );

    expect(highTierRecipes).toHaveLength(8);
    expect(highTierRecipes.filter((recipe) => recipe.discipline === "alchemy")).toHaveLength(4);
    expect(highTierRecipes.filter((recipe) => recipe.discipline === "smithing")).toHaveLength(4);
  });

  it("keeps all high-tier recipe ingredients and outputs anchored to real items", () => {
    HIGH_TIER_RECIPE_CASES.forEach((testCase) => {
      const recipe = WORKSHOP_RECIPES[testCase.id];

      recipe?.ingredients.forEach((ingredient) => {
        expect(
          MATERIAL_ITEMS[ingredient.itemId],
          `${ingredient.itemId} should exist as a workshop material`
        ).toBeDefined();
      });

      recipe?.outputs.forEach((output) => {
        expect(ITEMS[output.itemId], `${output.itemId} should exist as an item`).toBeDefined();
      });
    });
  });

  it("keeps every high-tier recipe tied to route-specific material sinks and traceable metadata", () => {
    Object.values(WORKSHOP_RECIPES)
      .filter((recipe) => recipe.tier === "highRealm")
      .forEach((recipe) => {
        expect(recipe.routeTags?.length, `${recipe.id} route tags`).toBeGreaterThan(0);
        expect(recipe.qualityHint, `${recipe.id} quality hint`).toBeTruthy();
        expect(recipe.sourceHint, `${recipe.id} source hint`).toBeTruthy();
        expect(recipe.masteryYield, `${recipe.id} mastery yield`).toBeGreaterThan(0);
        expect(
          recipe.ingredients.some((ingredient) =>
            ROUTE_SPECIFIC_MATERIAL_IDS.has(ingredient.itemId)
          ),
          `${recipe.id} should consume at least one route-specific material`
        ).toBe(true);
      });
  });

  it("maps each v3 sect world memory to high-tier recipe source cues and material sinks", () => {
    V3_ROUTE_MEMORY_CASES.forEach((testCase) => {
      const matchingRecipes = Object.values(WORKSHOP_RECIPES).filter((recipe) =>
        recipe.routeTags?.includes(testCase.memoryTag)
      );

      expect(
        matchingRecipes.map((recipe) => recipe.id),
        `${testCase.memoryTag} should publish high-tier Workshop recipe branches`
      ).toEqual(expect.arrayContaining([...testCase.expectedRecipes]));

      matchingRecipes.forEach((recipe) => {
        expect(recipe.tier, `${recipe.id} tier`).toBe("highRealm");
        expect(recipe.sourceHint, `${recipe.id} source hint`).toContain(testCase.memoryTag);
        expect(recipe.qualityHint, `${recipe.id} quality hint`).toMatch(/品質|仙品|副收益|熟練/);
        expect(
          recipe.ingredients.some((ingredient) => ingredient.itemId === testCase.materialId),
          `${recipe.id} should consume ${testCase.materialId}`
        ).toBe(true);
      });
    });
  });

  it("publishes alchemy and smithing specialization trees with prerequisites and branch conflicts", () => {
    expect(WORKSHOP_SPECIALIZATION_TREE.alchemy.map((node) => node.id)).toEqual([
      "alchemy_inner_fire_foundation",
      "alchemy_hongmeng_condenser",
      "alchemy_lifebloom_resonance",
      "alchemy_hongmeng_star_lotus_crown",
    ]);
    expect(WORKSHOP_SPECIALIZATION_TREE.smithing.map((node) => node.id)).toEqual([
      "smithing_core_temper_foundation",
      "smithing_starfire_tempering",
      "smithing_soulsteel_inscription",
      "smithing_starfire_starsteel_crown",
    ]);
    expect(WORKSHOP_SPECIALIZATIONS.alchemy_hongmeng_condenser).toMatchObject({
      prerequisiteNodeIds: ["alchemy_inner_fire_foundation"],
      conflictsWithBranchIds: ["alchemy_lifebloom"],
      unlockRequirement: { minMastery: 24 },
      unlockCost: 500,
      switchCost: 180,
      resetCost: 240,
    });
    expect(WORKSHOP_SPECIALIZATIONS.smithing_starfire_tempering).toMatchObject({
      prerequisiteNodeIds: ["smithing_core_temper_foundation"],
      conflictsWithBranchIds: ["smithing_soulforge"],
      unlockRequirement: { minMastery: 30 },
      unlockCost: 500,
      switchCost: 180,
      resetCost: 240,
    });
  });

  it("publishes second-layer specialization leaves with higher mastery gates and high-realm cues", () => {
    expect(WORKSHOP_SPECIALIZATIONS.alchemy_hongmeng_star_lotus_crown).toMatchObject({
      discipline: "alchemy",
      tier: 2,
      prerequisiteNodeIds: ["alchemy_hongmeng_condenser"],
      unlockRequirement: { minMastery: 72, minRealm: MajorRealm.Immortal },
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 14,
      },
    });
    expect(WORKSHOP_SPECIALIZATIONS.alchemy_hongmeng_star_lotus_crown.effect?.qualityCue).toContain(
      "星魂蓮"
    );
    expect(WORKSHOP_SPECIALIZATIONS.smithing_starfire_starsteel_crown).toMatchObject({
      discipline: "smithing",
      tier: 2,
      prerequisiteNodeIds: ["smithing_starfire_tempering"],
      unlockRequirement: { minMastery: 76, minRealm: MajorRealm.Immortal },
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 16,
      },
    });
    expect(WORKSHOP_SPECIALIZATIONS.smithing_starfire_starsteel_crown.effect?.outputCue).toContain(
      "路線材料"
    );
  });

  it("publishes readable specialization cues for v3 route memory sources", () => {
    V3_ROUTE_MEMORY_CASES.forEach((testCase) => {
      const specialization = WORKSHOP_SPECIALIZATIONS[testCase.expectedSpecializationId];
      const readableCue = [
        specialization.description,
        specialization.effect?.qualityCue,
        specialization.effect?.outputCue,
      ].join(" ");

      expect(readableCue, `${specialization.id} should mention ${testCase.memoryTag}`).toContain(
        testCase.memoryTag
      );
      expect(readableCue, `${specialization.id} should mention ${testCase.materialId}`).toContain(
        testCase.materialId
      );
      expect(readableCue, `${specialization.id} should preserve route material sink`).toContain(
        "材料"
      );
    });
  });

  it("derives mastery milestone statuses from existing mastery without new state", () => {
    const milestones = getWorkshopMasteryMilestoneStatuses(
      {
        alchemyLevel: 8,
        blacksmithLevel: 8,
        unlockedRecipes: [],
        craftedRecipeCounts: {},
        masteryByDiscipline: {
          alchemy: 74,
          smithing: 0,
        },
        specializationTreeByDiscipline: createInitialWorkshopSpecializationTreeState(),
        specializationByDiscipline: {
          alchemy: null,
          smithing: null,
        },
      },
      "alchemy"
    );

    expect(milestones.map((status) => status.milestone.id)).toEqual([
      "alchemy_stable_fire",
      "alchemy_branch_form",
      "alchemy_high_realm_leaf",
    ]);
    expect(milestones.map((status) => status.isReached)).toEqual([true, true, true]);
    expect(milestones.at(-1)).toMatchObject({
      currentMastery: 74,
      remainingMastery: 0,
    });
  });

  it("keeps first-pass alchemy and smithing specialization effects as recipe-safe data", () => {
    expect(WORKSHOP_SPECIALIZATIONS.alchemy_hongmeng_condenser).toMatchObject({
      discipline: "alchemy",
      effect: {
        appliesToTier: "highRealm",
        spiritStoneCostMultiplier: 0.9,
        masteryYieldBonus: 6,
      },
    });
    expect(WORKSHOP_SPECIALIZATIONS.smithing_starfire_tempering).toMatchObject({
      discipline: "smithing",
      effect: {
        appliesToTier: "highRealm",
        spiritStoneCostMultiplier: 0.9,
        masteryYieldBonus: 8,
      },
    });
    expect(WORKSHOP_SPECIALIZATIONS.alchemy_hongmeng_condenser.description).toContain("材料 sink");
    expect(WORKSHOP_SPECIALIZATIONS.smithing_starfire_tempering.description).toContain("路線材料不被減免");
  });

  it("calculates specialization craft plan without mutating ingredient requirements", () => {
    const recipe = WORKSHOP_RECIPES.immortal_ascension_elixir;
    const plan = getWorkshopRecipeCraftingPlan(recipe, {
      alchemyLevel: 8,
      blacksmithLevel: 8,
      unlockedRecipes: [recipe.id],
      craftedRecipeCounts: {},
      masteryByDiscipline: {
        alchemy: 24,
        smithing: 0,
      },
      specializationTreeByDiscipline: {
        ...createInitialWorkshopSpecializationTreeState(),
        alchemy: {
          unlockedNodeIds: ["alchemy_inner_fire_foundation", "alchemy_hongmeng_condenser"],
          activeNodeId: "alchemy_hongmeng_condenser",
          activeBranchId: "alchemy_hongmeng",
        },
      },
      specializationByDiscipline: {
        alchemy: "alchemy_hongmeng_condenser",
        smithing: null,
      },
    });

    expect(plan.spiritStoneCost).toBe(216);
    expect(plan.masteryYield).toBe(32);
    expect(plan.activeSpecialization?.name).toBe("鴻蒙凝丹");
    expect(plan.qualityCues).toEqual(
      expect.arrayContaining([
        "爐火穩定，較容易維持仙品品質。",
        "鴻蒙丹火降低靈石火耗，不減免核心路線材料。",
      ])
    );
    expect(recipe.ingredients).toEqual([
      { itemId: "beast_path_bloodbone", count: 2 },
      { itemId: "mystic_path_starlotus", count: 1 },
      { itemId: "spirit_herb", count: 8 },
    ]);
  });

  it("stacks second-layer leaf effects while leaving route-specific ingredient requirements intact", () => {
    const recipe = WORKSHOP_RECIPES.star_lotus_hongmeng_pill;
    const plan = getWorkshopRecipeCraftingPlan(recipe, {
      alchemyLevel: 8,
      blacksmithLevel: 8,
      unlockedRecipes: [recipe.id],
      craftedRecipeCounts: {},
      masteryByDiscipline: {
        alchemy: 72,
        smithing: 0,
      },
      specializationTreeByDiscipline: {
        ...createInitialWorkshopSpecializationTreeState(),
        alchemy: {
          unlockedNodeIds: [
            "alchemy_inner_fire_foundation",
            "alchemy_hongmeng_condenser",
            "alchemy_hongmeng_star_lotus_crown",
          ],
          activeNodeId: "alchemy_hongmeng_star_lotus_crown",
          activeBranchId: "alchemy_hongmeng",
        },
      },
      specializationByDiscipline: {
        alchemy: "alchemy_hongmeng_star_lotus_crown",
        smithing: null,
      },
    });

    expect(plan.masteryYield).toBe(60);
    expect(plan.activeSpecialization?.name).toBe("星蓮鴻蒙冠火");
    expect(plan.qualityCues).toEqual(
      expect.arrayContaining(["星魂蓮冠火穩住終盤丹品，但不替代路線材料。"])
    );
    expect(recipe.ingredients).toEqual([
      { itemId: "mystic_path_starlotus", count: 3 },
      { itemId: "sword_path_starsteel", count: 1 },
      { itemId: "beast_path_bloodbone", count: 1 },
      { itemId: "spirit_herb", count: 10 },
    ]);
  });

  it("does not apply specialization craft effects before its mastery requirement is met", () => {
    const recipe = WORKSHOP_RECIPES.immortal_ascension_elixir;
    const plan = getWorkshopRecipeCraftingPlan(recipe, {
      alchemyLevel: 8,
      blacksmithLevel: 8,
      unlockedRecipes: [recipe.id],
      craftedRecipeCounts: {},
      masteryByDiscipline: {
        alchemy: 0,
        smithing: 0,
      },
      specializationTreeByDiscipline: createInitialWorkshopSpecializationTreeState(),
      specializationByDiscipline: {
        alchemy: "alchemy_hongmeng_condenser",
        smithing: null,
      },
    });

    expect(plan.spiritStoneCost).toBe(240);
    expect(plan.masteryYield).toBe(24);
    expect(plan.activeSpecialization).toBeNull();
  });

  it("does not lose the low-tier starter recipe shape", () => {
    expect(WORKSHOP_RECIPES.qi_pill.tier).toBe("basic");
    expect(WORKSHOP_RECIPES.novice_sword_reforge.tier).toBe("basic");
  });
});
