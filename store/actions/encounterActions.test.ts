import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";
import characterReducer, { initializeCharacter } from "../slices/characterSlice";
import inventoryReducer from "../slices/inventorySlice";
import logReducer from "../slices/logSlice";
import encounterReducer, { setPendingEncounter } from "../slices/encounterSlice";
import { Gender } from "../../types";
import { resolvePendingEncounterChoice } from "./encounterActions";

describe("encounter actions", () => {
  it("resolves a pending encounter choice into concrete rewards and clears the pending event", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        inventory: inventoryReducer,
        logs: logReducer,
        encounter: encounterReducer,
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
});
