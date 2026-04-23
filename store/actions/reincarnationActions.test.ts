import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import characterReducer, {
  initializeCharacter,
} from "../slices/characterSlice";
import inventoryReducer, { addItem } from "../slices/inventorySlice";
import logReducer, { addLog } from "../slices/logSlice";
import adventureReducer, { enterMap } from "../slices/adventureSlice";
import workshopReducer, { upgradeAlchemy } from "../slices/workshopSlice";
import questReducer, { acceptQuest } from "../slices/questSlice";
import encounterReducer, {
  markEncounterResolved,
  setPendingEncounter,
} from "../slices/encounterSlice";
import soulReducer, {
  enterReincarnationHall,
  setRebirthBuildIdentity,
  setRebirthSoulSeal,
  toggleRebirthPerk,
  toggleSelectedHeirloom,
} from "../slices/soulSlice";
import { Gender, MajorRealm } from "../../types";
import { getSkillManualId } from "../../data/items/manuals";
import {
  completeRebirthFromHall,
  startLifeReviewFromCurrentRun,
} from "./reincarnationActions";

const createTestStore = (preloadedState?: Parameters<typeof configureStore>[0]["preloadedState"]) =>
  configureStore({
    reducer: {
      character: characterReducer,
      logs: logReducer,
      adventure: adventureReducer,
      inventory: inventoryReducer,
      workshop: workshopReducer,
      quest: questReducer,
      encounter: encounterReducer,
      soul: soulReducer,
    },
    preloadedState,
  });

const createReincarnationReadyStore = () => {
  const seeded = createTestStore();
  seeded.dispatch(
    initializeCharacter({
      name: "韓立",
      gender: Gender.Male,
    })
  );
  seeded.dispatch(addItem({ itemId: "novice_sword", count: 1 }));
  seeded.dispatch(addItem({ itemId: getSkillManualId("s_q_passive"), count: 1 }));
  seeded.dispatch(addLog({ message: "本世日誌", type: "info" }));
  seeded.dispatch(enterMap({ mapId: "0", startX: 1, startY: 1 }));
  seeded.dispatch(upgradeAlchemy());
  seeded.dispatch(acceptQuest({ questId: "tutorial_01" }));
  seeded.dispatch(setPendingEncounter({ eventId: "herb_garden", year: 350 }));
  seeded.dispatch(markEncounterResolved("wandering_smith"));

  return createTestStore({
    ...seeded.getState(),
    character: {
      ...seeded.getState().character,
      majorRealm: MajorRealm.GoldenCore,
      age: 350 * 365,
      isDead: true,
    },
  });
};

describe("reincarnation actions", () => {
  it("builds a life review from the current run", () => {
    const store = createReincarnationReadyStore();

    store.dispatch(startLifeReviewFromCurrentRun("lifespan"));

    const state = store.getState();

    expect(state.soul.flowStep).toBe("life_review");
    expect(state.soul.totalMerit).toBe(375);
    expect(state.soul.pendingLifeReview?.eligibleHeirlooms.length).toBeGreaterThan(0);
  });

  it("infers the recorded death cause when opening life review", () => {
    const store = createReincarnationReadyStore();
    const seededState = store.getState();
    const battleDeathStore = createTestStore({
      ...seededState,
      character: {
        ...seededState.character,
        lastDeathCause: "battle",
      },
    });

    battleDeathStore.dispatch(startLifeReviewFromCurrentRun());

    expect(battleDeathStore.getState().soul.pendingLifeReview?.cause).toBe("battle");
  });

  it("supports voluntary life review while the current run is still alive", () => {
    const store = createReincarnationReadyStore();
    const seededState = store.getState();
    const voluntaryStore = createTestStore({
      ...seededState,
      character: {
        ...seededState.character,
        isDead: false,
      },
    });

    voluntaryStore.dispatch(startLifeReviewFromCurrentRun("voluntary"));

    expect(voluntaryStore.getState().soul.pendingLifeReview?.cause).toBe(
      "voluntary"
    );
    expect(voluntaryStore.getState().soul.flowStep).toBe("life_review");
  });

  it("rebuilds a fresh current run while keeping soul progression", () => {
    const store = createReincarnationReadyStore();

    store.dispatch(startLifeReviewFromCurrentRun("lifespan"));
    store.dispatch(enterReincarnationHall());
    store.dispatch(toggleRebirthPerk("rebirth_spirit_stones"));

    const heirloomId =
      store.getState().soul.pendingLifeReview?.eligibleHeirlooms[0]?.id ?? "";
    if (heirloomId) {
      store.dispatch(toggleSelectedHeirloom(heirloomId));
    }

    store.dispatch(completeRebirthFromHall());

    const state = store.getState();

    expect(state.character.isInitialized).toBe(true);
    expect(state.character.isDead).toBe(false);
    expect(state.character.majorRealm).toBe(MajorRealm.Mortal);
    expect(state.character.spiritStones).toBeGreaterThanOrEqual(150);
    expect(state.logs.logs).toHaveLength(1);
    expect(state.logs.logs[0].message).toContain("新一世");
    expect(state.adventure.currentMapId).toBeNull();
    expect(state.inventory.items).toHaveLength(1);
    expect(state.quest.activeQuests).toEqual({});
    expect(state.workshop.alchemyLevel).toBe(1);
    expect(state.workshop.blacksmithLevel).toBe(1);
    expect(state.workshop.craftedRecipeCounts).toEqual({});
    expect(state.encounter.pendingEvent).toBeNull();
    expect(state.encounter.resolvedEventIds).toEqual([]);
    expect(state.soul.flowStep).toBe("inactive");
    expect(state.soul.lifetimeStats.totalReincarnations).toBe(1);
  });

  it("enforces build-identity heirloom constraints and carries the identity bonus into the next life", () => {
    const seeded = createReincarnationReadyStore();
    seeded.dispatch(addItem({ itemId: "wooden_shield", count: 1 }));
    seeded.dispatch(addItem({ itemId: getSkillManualId("m_tr_active"), count: 1 }));
    seeded.dispatch(addItem({ itemId: getSkillManualId("s_tr_active"), count: 1 }));
    const store = createTestStore({
      ...seeded.getState(),
      soul: {
        ...seeded.getState().soul,
        worldMemoryTags: ["route:sword:soul-sheath"],
      },
      character: {
        ...seeded.getState().character,
        majorRealm: MajorRealm.GoldenCore,
      },
    });

    store.dispatch(startLifeReviewFromCurrentRun("lifespan"));
    store.dispatch(enterReincarnationHall());
    store.dispatch(setRebirthBuildIdentity("sword"));
    store.dispatch(setRebirthSoulSeal("seal_sword_edge"));
    store.dispatch(toggleRebirthPerk("rebirth_sword_edge"));
    store.dispatch(toggleRebirthPerk("rebirth_extra_heirloom_slot"));

    const candidates = store.getState().soul.pendingLifeReview?.eligibleHeirlooms ?? [];
    const genericShieldId =
      candidates.find((candidate) => candidate.itemId === "wooden_shield")?.id ?? "";
    const swordManualId =
      candidates.find((candidate) => candidate.itemId === getSkillManualId("s_tr_active"))?.id ??
      "";
    const mageManualId =
      candidates.find((candidate) => candidate.itemId === getSkillManualId("m_tr_active"))?.id ??
      "";

    store.dispatch(toggleSelectedHeirloom(mageManualId));
    store.dispatch(toggleSelectedHeirloom(genericShieldId));
    store.dispatch(toggleSelectedHeirloom(swordManualId));
    store.dispatch(completeRebirthFromHall());

    const state = store.getState();

    expect(state.soul.rebirthConfig.plannerVersion).toBe(2);
    expect(state.soul.heirloomVault.map((candidate) => candidate.itemId)).toEqual([
      getSkillManualId("s_tr_active"),
    ]);
    expect(state.inventory.items.map((slot) => slot.itemId)).toEqual([
      getSkillManualId("s_tr_active"),
    ]);
    expect(state.character.attributes.rootBone).toBeGreaterThan(10);
    expect(state.character.attributes.comprehension).toBeGreaterThan(10);
  });
});
