import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import characterReducer, {
  addSpiritStones,
  initializeCharacter,
} from "../slices/characterSlice";
import inventoryReducer, { addItem } from "../slices/inventorySlice";
import workshopReducer from "../slices/workshopSlice";
import logReducer from "../slices/logSlice";
import { Gender } from "../../types";
import { craftWorkshopRecipe } from "./workshopActions";

const createTestStore = () =>
  configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      workshop: workshopReducer,
      logs: logReducer,
    },
  });

describe("workshop actions", () => {
  it("crafts qi pills from herbs and spirit stones", () => {
    const store = createTestStore();
    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(addSpiritStones({ amount: 120, source: "other" }));
    store.dispatch(addItem({ itemId: "spirit_herb", count: 3 }));

    store.dispatch(craftWorkshopRecipe("qi_pill"));

    const state = store.getState();
    const herbSlot = state.inventory.items.find((slot) => slot.itemId === "spirit_herb");
    const pillSlot = state.inventory.items.find((slot) => slot.itemId === "qi_pill");

    expect(herbSlot?.count).toBe(1);
    expect(pillSlot?.count).toBe(1);
    expect(state.character.spiritStones).toBe(95);
    expect(state.workshop.craftedRecipeCounts.qi_pill).toBe(1);
    expect(state.logs.logs[0]?.message).toContain("聚氣丹");
  });

  it("forges a novice sword instance from ore and monster parts", () => {
    const store = createTestStore();
    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(addSpiritStones({ amount: 120, source: "other" }));
    store.dispatch(addItem({ itemId: "iron_ore", count: 2 }));
    store.dispatch(addItem({ itemId: "wolf_fang", count: 1 }));

    store.dispatch(craftWorkshopRecipe("novice_sword_reforge"));

    const state = store.getState();
    const swordSlot = state.inventory.items.find(
      (slot) => slot.itemId === "novice_sword" && slot.instanceId
    );

    expect(swordSlot?.instance?.templateId).toBe("novice_sword");
    expect(state.workshop.craftedRecipeCounts.novice_sword_reforge).toBe(1);
    expect(state.logs.logs[0]?.message).toContain("鏽鐵劍");
  });
});
