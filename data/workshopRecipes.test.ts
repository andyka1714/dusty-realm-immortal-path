import { describe, expect, it } from "vitest";
import { MajorRealm } from "../types";
import { ITEMS } from "./items";
import { MATERIAL_ITEMS } from "./items/materials";
import { WORKSHOP_RECIPES } from "./workshopRecipes";

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
] as const;

const ROUTE_SPECIFIC_MATERIAL_IDS = new Set([
  "sword_path_starsteel",
  "mystic_path_starlotus",
  "beast_path_bloodbone",
]);

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

    expect(highTierRecipes).toHaveLength(6);
    expect(highTierRecipes.filter((recipe) => recipe.discipline === "alchemy")).toHaveLength(3);
    expect(highTierRecipes.filter((recipe) => recipe.discipline === "smithing")).toHaveLength(3);
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

  it("does not lose the low-tier starter recipe shape", () => {
    expect(WORKSHOP_RECIPES.qi_pill.tier).toBe("basic");
    expect(WORKSHOP_RECIPES.novice_sword_reforge.tier).toBe("basic");
  });
});
