import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import characterReducer, { initializeCharacter } from "../slices/characterSlice";
import logReducer from "../slices/logSlice";
import inventoryReducer from "../slices/inventorySlice";
import workshopReducer from "../slices/workshopSlice";
import questReducer from "../slices/questSlice";
import encounterReducer from "../slices/encounterSlice";
import soulReducer from "../slices/soulSlice";
import { Gender, MajorRealm, ProfessionType } from "../../types";
import { DAYS_PER_YEAR } from "../../constants";
import { checkTimeEvents } from "./timeActions";
import * as encounterData from "../../data/encounters";

describe("timeActions encounter flow", () => {
  const randomSpy = vi.spyOn(Math, "random");

  beforeEach(() => {
    randomSpy.mockReset();
  });

  afterEach(() => {
    randomSpy.mockReset();
  });

  it("creates a pending encounter during yearly processing before falling back to flavor logs", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        logs: logReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        quest: questReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch({
      type: "character/initializeCharacter",
      payload: { name: "韓立", gender: Gender.Male },
    });
    store.dispatch({
      type: "character/updateLastProcessedYear",
      payload: 10,
    });

    const seededState = store.getState();
    const seededStore = configureStore({
      reducer: {
        character: characterReducer,
        logs: logReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        quest: questReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
      preloadedState: {
        ...seededState,
        character: {
          ...seededState.character,
          age: 11 * DAYS_PER_YEAR,
          lastProcessedYear: 10,
        },
      },
    });

    randomSpy
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.01)
      .mockReturnValueOnce(0);

    seededStore.dispatch(checkTimeEvents());

    const nextState = seededStore.getState();

    expect(nextState.encounter.pendingEvent?.eventId).toBe("herb_garden");
    expect(nextState.encounter.pendingEvent?.year).toBe(11);
  });

  it("passes profession, quest, and resolved encounter context into selector selection", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        logs: logReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        quest: questReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch({
      type: "character/updateLastProcessedYear",
      payload: 10,
    });

    const seededState = store.getState();
    const seededStore = configureStore({
      reducer: {
        character: characterReducer,
        logs: logReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        quest: questReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
      preloadedState: {
        ...seededState,
        character: {
          ...seededState.character,
          age: 11 * DAYS_PER_YEAR,
          lastProcessedYear: 10,
          majorRealm: MajorRealm.SpiritSevering,
          profession: ProfessionType.Sword,
        },
        quest: {
          activeQuests: {},
          completedQuests: ["sect_sword_join"],
        },
        encounter: {
          pendingEvent: null,
          resolvedEventIds: [],
        },
        soul: soulReducer(undefined, { type: "@@INIT" }),
      },
    });

    const selectorSpy = vi
      .spyOn(encounterData, "pickEncounterEvent")
      .mockReturnValue(encounterData.ENCOUNTER_EVENTS.sword_sect_patrol_cache);

    randomSpy.mockReturnValueOnce(0.5).mockReturnValueOnce(0.01);

    seededStore.dispatch(checkTimeEvents());

    const nextState = seededStore.getState();

    expect(selectorSpy).toHaveBeenCalledWith(
      {
        majorRealm: MajorRealm.SpiritSevering,
        profession: ProfessionType.Sword,
        completedQuestIds: ["sect_sword_join"],
        resolvedEventIds: [],
        worldMemoryTags: [],
      },
      expect.any(Number)
    );
    expect(nextState.encounter.pendingEvent?.eventId).toBe("sword_sect_patrol_cache");
    expect(nextState.encounter.pendingEvent?.year).toBe(11);

    selectorSpy.mockRestore();
  });

  it("does not reroll a new encounter while one is already pending", () => {
    const store = configureStore({
      reducer: {
        character: characterReducer,
        logs: logReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        quest: questReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
    });

    store.dispatch(initializeCharacter({ name: "韓立", gender: Gender.Male }));
    store.dispatch({
      type: "character/updateLastProcessedYear",
      payload: 10,
    });

    const seededState = store.getState();
    const seededStore = configureStore({
      reducer: {
        character: characterReducer,
        logs: logReducer,
        inventory: inventoryReducer,
        workshop: workshopReducer,
        quest: questReducer,
        encounter: encounterReducer,
        soul: soulReducer,
      },
      preloadedState: {
        ...seededState,
        character: {
          ...seededState.character,
          age: 11 * DAYS_PER_YEAR,
          lastProcessedYear: 10,
        },
        encounter: {
          pendingEvent: {
            eventId: "herb_garden",
            year: 10,
          },
          resolvedEventIds: [],
        },
      },
    });

    const selectorSpy = vi.spyOn(encounterData, "pickEncounterEvent");

    randomSpy.mockReturnValueOnce(0.5);

    seededStore.dispatch(checkTimeEvents());

    expect(selectorSpy).not.toHaveBeenCalled();
    expect(seededStore.getState().encounter.pendingEvent?.eventId).toBe("herb_garden");

    selectorSpy.mockRestore();
  });
});
