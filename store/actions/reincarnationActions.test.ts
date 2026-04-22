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
});
