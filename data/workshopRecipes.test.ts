import { describe, expect, it } from "vitest";
import { MajorRealm } from "../types";
import { ITEMS } from "./items";
import { MATERIAL_ITEMS } from "./items/materials";
import { WORKSHOP_RECIPES } from "./workshopRecipes";

const HIGH_TIER_RECIPE_CASES = [
  {
    id: "immortal_emperor_breakthrough_pill",
    discipline: "alchemy",
    outputItemId: "bt_immortal_emperor",
    expectedRouteTags: ["化神", "仙帝", "縹緲仙宮"],
    expectedSourceHint: "縹緲仙宮星砂秘材",
  },
  {
    id: "immortal_emperor_sword_forge",
    discipline: "smithing",
    outputItemId: "origin_sword",
    expectedRouteTags: ["化神", "仙帝", "凌霄劍宗"],
    expectedSourceHint: "凌霄劍宗前哨殘核",
  },
] as const;

describe("workshop recipe data", () => {
  it("adds representative high-tier alchemy and smithing recipes with planning metadata", () => {
    HIGH_TIER_RECIPE_CASES.forEach((testCase) => {
      const recipe = WORKSHOP_RECIPES[testCase.id];

      expect(recipe, `${testCase.id} should exist`).toBeDefined();
      expect(recipe?.discipline).toBe(testCase.discipline);
      expect(recipe?.tier).toBe("highRealm");
      expect(recipe?.minRealm).toBe(MajorRealm.SpiritSevering);
      expect(recipe?.qualityHint).toContain("仙品");
      expect(recipe?.sourceHint).toContain(testCase.expectedSourceHint);
      expect(recipe?.masteryYield).toBeGreaterThan(0);
      expect(recipe?.routeTags).toEqual(expect.arrayContaining([...testCase.expectedRouteTags]));
      expect(recipe?.routeTags?.length).toBeGreaterThan(0);
    });
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

  it("does not lose the low-tier starter recipe shape", () => {
    expect(WORKSHOP_RECIPES.qi_pill.tier).toBe("basic");
    expect(WORKSHOP_RECIPES.novice_sword_reforge.tier).toBe("basic");
  });
});
