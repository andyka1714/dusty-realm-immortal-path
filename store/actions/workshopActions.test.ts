import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import characterReducer, {
  addSpiritStones,
  initializeCharacter,
} from "../slices/characterSlice";
import inventoryReducer, { addItem } from "../slices/inventorySlice";
import workshopReducer from "../slices/workshopSlice";
import logReducer from "../slices/logSlice";
import { Gender, MajorRealm } from "../../types";
import { craftWorkshopRecipe } from "./workshopActions";

type TestStoreState = {
  character: ReturnType<typeof characterReducer>;
  inventory: ReturnType<typeof inventoryReducer>;
  workshop: ReturnType<typeof workshopReducer>;
  logs: ReturnType<typeof logReducer>;
};

const createTestStore = (preloadedState?: Partial<TestStoreState>) =>
  configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      workshop: workshopReducer,
      logs: logReducer,
    },
    preloadedState,
  });

const createCharacterAtRealm = (majorRealm: MajorRealm, spiritStones = 0) => ({
  ...characterReducer(
    undefined,
    initializeCharacter({ name: "韓立", gender: Gender.Male })
  ),
  majorRealm,
  spiritStones,
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

  it("crafts high-tier recipes into mastery progress", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.SpiritSevering, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        alchemyLevel: 8,
        unlockedRecipes: ["qi_pill", "novice_sword_reforge", "immortal_emperor_breakthrough_pill"],
      },
    });
    store.dispatch(addItem({ itemId: "mystic_path_starlotus", count: 2 }));
    store.dispatch(addItem({ itemId: "beast_path_bloodbone", count: 1 }));
    store.dispatch(addItem({ itemId: "spirit_herb", count: 6 }));

    store.dispatch(craftWorkshopRecipe("immortal_emperor_breakthrough_pill"));

    const state = store.getState();
    const pillSlot = state.inventory.items.find((slot) => slot.itemId === "bt_immortal_emperor");

    expect(pillSlot?.count).toBe(1);
    expect(state.workshop.craftedRecipeCounts.immortal_emperor_breakthrough_pill).toBe(1);
    expect(state.workshop.masteryByDiscipline.alchemy).toBe(28);
    expect(state.character.spiritStones).toBe(712);
    expect(state.logs.logs[0]?.message).toContain("丹道熟練 +28");
  });

  it("blocks high-tier recipes before the required realm", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.NascentSoul, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        alchemyLevel: 8,
        unlockedRecipes: ["qi_pill", "novice_sword_reforge", "immortal_emperor_breakthrough_pill"],
      },
    });
    store.dispatch(addItem({ itemId: "mystic_path_starlotus", count: 2 }));
    store.dispatch(addItem({ itemId: "beast_path_bloodbone", count: 1 }));
    store.dispatch(addItem({ itemId: "spirit_herb", count: 6 }));

    store.dispatch(craftWorkshopRecipe("immortal_emperor_breakthrough_pill"));

    const state = store.getState();

    expect(state.inventory.items.find((slot) => slot.itemId === "bt_immortal_emperor")).toBeUndefined();
    expect(state.workshop.masteryByDiscipline.alchemy).toBe(0);
    expect(state.logs.logs[0]?.message).toContain("境界不足");
  });
});
