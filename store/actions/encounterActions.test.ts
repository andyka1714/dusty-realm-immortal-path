import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import characterReducer, { initializeCharacter } from "../slices/characterSlice";
import inventoryReducer from "../slices/inventorySlice";
import logReducer from "../slices/logSlice";
import encounterReducer, { setPendingEncounter } from "../slices/encounterSlice";
import soulReducer from "../slices/soulSlice";
import { Gender } from "../../types";
import {
  dismissPendingEncounter,
  resolvePendingEncounterChoice,
} from "./encounterActions";

const configureEncounterTestStore = () =>
  configureStore({
    reducer: {
      character: characterReducer,
      inventory: inventoryReducer,
      logs: logReducer,
      encounter: encounterReducer,
      soul: soulReducer,
    },
  });

describe("encounter actions", () => {
  it("resolves a pending encounter choice into concrete rewards and clears the pending event", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(
      setPendingEncounter({
        eventId: "herb_garden",
        year: 11,
      })
    );

    store.dispatch(resolvePendingEncounterChoice("gather_herbs"));

    const state = store.getState();
    const herbSlot = state.inventory.items.find((slot) => slot.itemId === "spirit_herb");

    expect(herbSlot?.count).toBe(2);
    expect(state.encounter.pendingEvent).toBeNull();
    expect(state.logs.logs[0]?.message).toContain("聚靈草");
  });

  it("resolves a costly choice while exposing its reward preview cue in encounter data", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(
      setPendingEncounter({
        eventId: "wandering_smith",
        year: 11,
      })
    );

    store.dispatch(resolvePendingEncounterChoice("buy_ore"));

    const state = store.getState();
    const oreSlot = state.inventory.items.find((slot) => slot.itemId === "iron_ore");

    expect(oreSlot?.count).toBe(2);
    expect(state.character.spiritStones).toBe(-20);
    expect(state.encounter.pendingEvent).toBeNull();
  });

  it("writes chain world memory after resolving a chain-aware encounter", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(
      setPendingEncounter({
        eventId: "nascent_sword_soul_sheath",
        year: 81,
      })
    );

    store.dispatch(resolvePendingEncounterChoice("temper_soul_edge"));

    const state = store.getState();

    expect(state.soul.worldMemoryTags).toContain("route:sword:soul-sheath");
    expect(state.encounter.resolvedEventIds).toContain("nascent_sword_soul_sheath");
    expect(state.encounter.pendingEvent).toBeNull();
  });

  it("dismisses a pending encounter without rewards or chain progress", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(
      setPendingEncounter({
        eventId: "herb_garden",
        year: 11,
      })
    );

    store.dispatch(dismissPendingEncounter());

    const state = store.getState();

    expect(state.encounter.pendingEvent).toBeNull();
    expect(state.encounter.resolvedEventIds).toEqual([]);
    expect(state.inventory.items).toEqual([]);
    expect(state.logs.logs[0]?.message).toContain("暫且離開");
  });

  it("ignores invalid choices without mutating encounter or memory state", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch(
      setPendingEncounter({
        eventId: "nascent_sword_soul_sheath",
        year: 81,
      })
    );

    store.dispatch(resolvePendingEncounterChoice("not_a_real_choice"));

    const state = store.getState();

    expect(state.soul.worldMemoryTags).toEqual([]);
    expect(state.encounter.pendingEvent?.eventId).toBe("nascent_sword_soul_sheath");
    expect(state.encounter.resolvedEventIds).toEqual([]);
    expect(state.logs.logs[0]?.type).toBe("danger");
  });

  it.each([
    {
      eventId: "sword_immortal_afterglow_starsteel",
      choiceId: "salvage_afterglow_starsteel",
      rewardItemId: "sword_path_starsteel",
    },
    {
      eventId: "beast_immortal_afterglow_bloodbone",
      choiceId: "hunt_afterglow_bloodbone",
      rewardItemId: "beast_path_bloodbone",
    },
    {
      eventId: "mystic_immortal_afterglow_starlotus",
      choiceId: "gather_afterglow_starlotus",
      rewardItemId: "mystic_path_starlotus",
    },
  ])(
    "resolves repeatable v3 aftermath reward and marks $eventId without adding memory state",
    ({ eventId, choiceId, rewardItemId }) => {
      const store = configureEncounterTestStore();

      store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
      store.dispatch(
        setPendingEncounter({
          eventId,
          year: 301,
        })
      );
      const soulStateKeysBefore = Object.keys(store.getState().soul).sort();

      store.dispatch(resolvePendingEncounterChoice(choiceId));

      const state = store.getState();
      const rewardSlot = state.inventory.items.find((slot) => slot.itemId === rewardItemId);

      expect(rewardSlot?.count).toBe(1);
      expect(state.encounter.resolvedEventIds).toContain(eventId);
      expect(state.encounter.pendingEvent).toBeNull();
      expect(state.soul.worldMemoryTags).toEqual([]);
      expect(Object.keys(state.soul).sort()).toEqual(soulStateKeysBefore);
    }
  );
});
