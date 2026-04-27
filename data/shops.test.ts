import { describe, expect, it } from "vitest";
import { SHOPS } from "./shops";
import { ITEMS } from "./items";
import { ConsumableItem, ItemCategory } from "../types";

describe("shop supply catalog", () => {
  it("keeps every formal shop stocked with valid catalog items", () => {
    for (const shop of Object.values(SHOPS)) {
      expect(shop.items.length, `${shop.id} should not be empty`).toBeGreaterThan(0);

      for (const shopItem of shop.items) {
        expect(
          ITEMS[shopItem.itemId],
          `${shop.id} references missing item ${shopItem.itemId}`
        ).toBeDefined();
      }
    }
  });

  it("keeps the mortal general store stocked with readable basic supplies", () => {
    const generalStore = SHOPS.general_store_mortal;

    expect(generalStore.items.length).toBeGreaterThan(0);

    const itemIds = generalStore.items.map((shopItem) => shopItem.itemId);
    expect(itemIds).toContain("qi_pill");
    expect(itemIds).toContain("heal_pill");

    for (const shopItem of generalStore.items) {
      const item = ITEMS[shopItem.itemId];
      expect(item, `Missing catalog item for ${shopItem.itemId}`).toBeDefined();

      if (item.category === ItemCategory.Consumable) {
        expect((item as ConsumableItem).effects.length).toBeGreaterThan(0);
      }
    }
  });
});
