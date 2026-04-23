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
import { craftWorkshopRecipe, selectWorkshopSpecialization } from "./workshopActions";
import { createInitialWorkshopSpecializationTreeState } from "../../data/workshopSpecializationTree";

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

  it("applies alchemy specialization to cost and mastery without bypassing route material sinks", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.Tribulation, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        alchemyLevel: 8,
        unlockedRecipes: ["qi_pill", "novice_sword_reforge", "immortal_ascension_elixir"],
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
      },
    });
    store.dispatch(addItem({ itemId: "beast_path_bloodbone", count: 2 }));
    store.dispatch(addItem({ itemId: "mystic_path_starlotus", count: 1 }));
    store.dispatch(addItem({ itemId: "spirit_herb", count: 8 }));

    store.dispatch(craftWorkshopRecipe("immortal_ascension_elixir"));

    const state = store.getState();

    expect(state.inventory.items.find((slot) => slot.itemId === "bt_trib_immortal")?.count).toBe(1);
    expect(state.inventory.items.find((slot) => slot.itemId === "beast_path_bloodbone")).toBeUndefined();
    expect(state.inventory.items.find((slot) => slot.itemId === "mystic_path_starlotus")).toBeUndefined();
    expect(state.workshop.masteryByDiscipline.alchemy).toBe(56);
    expect(state.character.spiritStones).toBe(784);
    expect(state.logs.logs[0]?.message).toContain("專精：鴻蒙凝丹");
  });

  it("applies smithing specialization while preserving final-route ingredient requirements", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.Immortal, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        blacksmithLevel: 8,
        unlockedRecipes: ["qi_pill", "novice_sword_reforge", "great_dao_body_forge"],
        masteryByDiscipline: {
          alchemy: 0,
          smithing: 30,
        },
        specializationTreeByDiscipline: {
          ...createInitialWorkshopSpecializationTreeState(),
          smithing: {
            unlockedNodeIds: ["smithing_core_temper_foundation", "smithing_starfire_tempering"],
            activeNodeId: "smithing_starfire_tempering",
            activeBranchId: "smithing_starfire",
          },
        },
        specializationByDiscipline: {
          alchemy: null,
          smithing: "smithing_starfire_tempering",
        },
      },
    });
    store.dispatch(addItem({ itemId: "beast_path_bloodbone", count: 3 }));
    store.dispatch(addItem({ itemId: "sword_path_starsteel", count: 1 }));
    store.dispatch(addItem({ itemId: "iron_ore", count: 6 }));

    store.dispatch(craftWorkshopRecipe("great_dao_body_forge"));

    const state = store.getState();
    const armorSlot = state.inventory.items.find(
      (slot) => slot.itemId === "great_dao_body" && slot.instanceId
    );

    expect(armorSlot?.instance?.templateId).toBe("great_dao_body");
    expect(state.inventory.items.find((slot) => slot.itemId === "beast_path_bloodbone")).toBeUndefined();
    expect(state.inventory.items.find((slot) => slot.itemId === "sword_path_starsteel")).toBeUndefined();
    expect(state.workshop.masteryByDiscipline.smithing).toBe(70);
    expect(state.character.spiritStones).toBe(730);
    expect(state.logs.logs[0]?.message).toContain("專精：星火鍛胚");
  });

  it("blocks specialization selection until prerequisite node is unlocked", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.SpiritSevering, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        masteryByDiscipline: {
          alchemy: 0,
          smithing: 0,
        },
      },
    });

    store.dispatch(
      selectWorkshopSpecialization({
        discipline: "alchemy",
        specializationId: "alchemy_hongmeng_condenser",
      })
    );

    const state = store.getState();

    expect(state.workshop.specializationByDiscipline.alchemy).toBeNull();
    expect(state.character.spiritStones).toBe(1000);
    expect(state.logs.logs[0]?.message).toContain("需先解鎖");
  });

  it("blocks specialization root selection until mastery requirement is met", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.SpiritSevering, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        masteryByDiscipline: {
          alchemy: 0,
          smithing: 0,
        },
      },
    });

    store.dispatch(
      selectWorkshopSpecialization({
        discipline: "alchemy",
        specializationId: "alchemy_inner_fire_foundation",
      })
    );

    const state = store.getState();

    expect(state.workshop.specializationByDiscipline.alchemy).toBeNull();
    expect(state.character.spiritStones).toBe(1000);
    expect(state.logs.logs[0]?.message).toContain("丹道熟練需達 8");
  });

  it("unlocks specialization tree nodes with unlock costs", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.SpiritSevering, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        masteryByDiscipline: {
          alchemy: 24,
          smithing: 0,
        },
      },
    });

    store.dispatch(
      selectWorkshopSpecialization({
        discipline: "alchemy",
        specializationId: "alchemy_inner_fire_foundation",
      })
    );
    store.dispatch(
      selectWorkshopSpecialization({
        discipline: "alchemy",
        specializationId: "alchemy_hongmeng_condenser",
      })
    );

    const state = store.getState();

    expect(state.workshop.specializationByDiscipline.alchemy).toBe("alchemy_hongmeng_condenser");
    expect(state.workshop.specializationTreeByDiscipline.alchemy).toMatchObject({
      unlockedNodeIds: ["alchemy_inner_fire_foundation", "alchemy_hongmeng_condenser"],
      activeNodeId: "alchemy_hongmeng_condenser",
      activeBranchId: "alchemy_hongmeng",
    });
    expect(state.character.spiritStones).toBe(380);
    expect(state.logs.logs[0]?.message).toContain("已解鎖並啟用丹道專精：鴻蒙凝丹");
  });

  it("blocks mutually exclusive specialization branches until reset", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.Tribulation, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        masteryByDiscipline: {
          alchemy: 40,
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
      },
    });

    store.dispatch(
      selectWorkshopSpecialization({
        discipline: "alchemy",
        specializationId: "alchemy_lifebloom_resonance",
      })
    );

    const state = store.getState();

    expect(state.workshop.specializationByDiscipline.alchemy).toBe("alchemy_hongmeng_condenser");
    expect(state.character.spiritStones).toBe(1000);
    expect(state.logs.logs[0]?.message).toContain("分支互斥");
  });

  it("resets one discipline specialization tree with accumulated node reset cost", () => {
    const store = createTestStore({
      character: createCharacterAtRealm(MajorRealm.Tribulation, 1000),
      workshop: {
        ...workshopReducer(undefined, { type: "@@INIT" }),
        masteryByDiscipline: {
          alchemy: 40,
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
      },
    });

    store.dispatch(
      selectWorkshopSpecialization({
        discipline: "alchemy",
        specializationId: null,
      })
    );

    const state = store.getState();

    expect(state.workshop.specializationTreeByDiscipline.alchemy).toEqual({
      unlockedNodeIds: [],
      activeNodeId: null,
      activeBranchId: null,
    });
    expect(state.workshop.specializationByDiscipline.alchemy).toBeNull();
    expect(state.workshop.masteryByDiscipline.alchemy).toBe(40);
    expect(state.character.spiritStones).toBe(640);
    expect(state.logs.logs[0]?.message).toContain("已重置丹道專精");
  });
});
