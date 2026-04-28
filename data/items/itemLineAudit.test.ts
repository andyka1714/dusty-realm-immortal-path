import { describe, expect, it } from "vitest";
import { ConsumableItem, ConsumableType, ItemCategory, MajorRealm } from "../../types";
import { SHOPS } from "../shops";
import { WORKSHOP_RECIPES } from "../workshopRecipes";
import { ITEMS } from ".";
import {
  FIRST_WAVE_ITEM_LINE_ITEM_IDS,
  ITEM_LINE_REALM_COVERAGE,
  QUEST_ITEM_IDS,
  REGION_SPECIALTY_ITEMS,
  TOKEN_ITEMS,
} from "./itemLineMetadata";

describe("item line metadata", () => {
  it("covers low and mid realms for first-wave item lines", () => {
    const requiredRealms = [
      MajorRealm.Mortal,
      MajorRealm.QiRefining,
      MajorRealm.Foundation,
      MajorRealm.GoldenCore,
    ];

    for (const line of [
      "manual",
      "equipment",
      "alchemy_material",
      "smithing_material",
      "pill",
    ] as const) {
      for (const realm of requiredRealms) {
        expect(
          ITEM_LINE_REALM_COVERAGE[line][realm]?.length ?? 0,
          `${line} realm ${realm}`
        ).toBeGreaterThan(0);
      }
    }
  });

  it("anchors low and mid realm alchemy and smithing materials to real item ids", () => {
    const materialLines = ["alchemy_material", "smithing_material"] as const;
    const requiredRealms = [
      MajorRealm.Mortal,
      MajorRealm.QiRefining,
      MajorRealm.Foundation,
      MajorRealm.GoldenCore,
    ];

    for (const line of materialLines) {
      for (const realm of requiredRealms) {
        const itemIds = FIRST_WAVE_ITEM_LINE_ITEM_IDS[line][realm] ?? [];

        expect(itemIds.length, `${line} realm ${realm} ids`).toBeGreaterThan(0);
        itemIds.forEach((itemId) => {
          expect(ITEMS[itemId], `${itemId} should exist`).toBeDefined();
        });
      }
    }
  });

  it("gives first-wave alchemy and smithing materials at least one workshop sink", () => {
    const sinkedItemIds = new Set(
      Object.values(WORKSHOP_RECIPES).flatMap((recipe) =>
        recipe.ingredients.map((ingredient) => ingredient.itemId)
      )
    );

    for (const line of ["alchemy_material", "smithing_material"] as const) {
      const itemIds = Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS[line]).flat();
      itemIds.forEach((itemId) => {
        expect(sinkedItemIds.has(itemId), `${itemId} should have a recipe sink`).toBe(
          true
        );
      });
    }
  });

  it("anchors first-wave pills to real consumables with effects and sources", () => {
    const sourcedItemIds = new Set([
      ...Object.values(WORKSHOP_RECIPES).flatMap((recipe) =>
        recipe.outputs.map((output) => output.itemId)
      ),
      ...Object.values(SHOPS).flatMap((shop) =>
        shop.items.map((shopItem) => shopItem.itemId)
      ),
    ]);

    const requiredEffectTypes = new Set([
      "gain_exp",
      "heal_hp",
      "full_restore",
      "breakthrough_chance",
      "buff_stat",
    ]);

    const pillIds = Object.values(FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill).flat();
    expect(pillIds.length).toBeGreaterThan(0);

    pillIds.forEach((itemId) => {
      const item = ITEMS[itemId] as ConsumableItem | undefined;

      expect(item, `${itemId} should exist`).toBeDefined();
      expect(item?.category, `${itemId} category`).toBe(ItemCategory.Consumable);
      expect(item?.subType, `${itemId} subtype`).toBe(ConsumableType.Pill);
      expect(item?.effects.length ?? 0, `${itemId} effects`).toBeGreaterThan(0);
      expect(sourcedItemIds.has(itemId), `${itemId} should have a shop or recipe source`).toBe(true);
      item?.effects.forEach((effect) => {
        expect(
          requiredEffectTypes.has(effect.type),
          `${itemId} effect ${effect.type} should fit the first-wave pill line`
        ).toBe(true);
      });
    });
  });

  it("keeps quest items separate from workshop recipes and shops", () => {
    const workshopItemIds = new Set(
      Object.values(WORKSHOP_RECIPES).flatMap((recipe) => [
        ...recipe.ingredients.map((ingredient) => ingredient.itemId),
        ...recipe.outputs.map((output) => output.itemId),
      ])
    );
    const shopItemIds = new Set(
      Object.values(SHOPS).flatMap((shop) =>
        shop.items.map((shopItem) => shopItem.itemId)
      )
    );

    expect(QUEST_ITEM_IDS.length).toBeGreaterThan(0);

    QUEST_ITEM_IDS.forEach((itemId) => {
      const item = ITEMS[itemId];

      expect(item, `${itemId} should exist`).toBeDefined();
      expect(item?.category, `${itemId} category`).toBe(ItemCategory.Material);
      expect(workshopItemIds.has(itemId), `${itemId} should not be a recipe item`).toBe(
        false
      );
      expect(shopItemIds.has(itemId), `${itemId} should not be sold in shops`).toBe(
        false
      );
    });
  });

  it("anchors region specialties to real items with map source metadata", () => {
    expect(REGION_SPECIALTY_ITEMS.length).toBeGreaterThanOrEqual(6);

    REGION_SPECIALTY_ITEMS.forEach((specialty) => {
      const item = ITEMS[specialty.itemId];

      expect(item, `${specialty.itemId} should exist`).toBeDefined();
      expect(item?.category, `${specialty.itemId} category`).toBe(ItemCategory.Material);
      expect(item?.minRealm, `${specialty.itemId} min realm`).toBe(specialty.realm);
      expect(specialty.regionLabel.length, `${specialty.itemId} region`).toBeGreaterThan(0);
      expect(specialty.mapHint.length, `${specialty.itemId} map hint`).toBeGreaterThan(0);
    });
  });

  it("anchors currency tokens to inventory items without workshop sinks", () => {
    const workshopItemIds = new Set(
      Object.values(WORKSHOP_RECIPES).flatMap((recipe) => [
        ...recipe.ingredients.map((ingredient) => ingredient.itemId),
        ...recipe.outputs.map((output) => output.itemId),
      ])
    );

    expect(TOKEN_ITEMS.length).toBeGreaterThanOrEqual(5);

    TOKEN_ITEMS.forEach((token) => {
      const item = ITEMS[token.itemId];

      expect(item, `${token.itemId} should exist`).toBeDefined();
      expect(item?.category, `${token.itemId} category`).toBe(ItemCategory.Material);
      expect(item?.maxStack, `${token.itemId} stack`).toBeGreaterThanOrEqual(999);
      expect(token.exchangeLoop.length, `${token.itemId} exchange loop`).toBeGreaterThan(0);
      expect(workshopItemIds.has(token.itemId), `${token.itemId} should not be a workshop item`).toBe(false);
    });
  });
});
