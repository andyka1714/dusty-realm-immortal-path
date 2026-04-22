import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSkillManualId } from "../data/items/manuals";
import { MajorRealm } from "../types";
import { loadState, saveState } from "./localStorage";

const KEY = "dusty-realm-save-v1";

describe("loadState", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    });
  });

  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });

  it("hydrates old retired skills and manuals as formal core data", () => {
    storage.set(
      KEY,
      JSON.stringify({
        character: {
          skills: ["b_ie_active", "b_ma_active"],
          itemConsumption: {
            [getSkillManualId("b_ie_active")]: 1,
          },
        },
        logs: {},
        adventure: {},
        inventory: {
          items: [{ itemId: "b_ie_active_manual", count: 2 }],
        },
        workshop: {},
        quest: {},
      })
    );

    const loaded = loadState();

    expect((loaded?.character as { skills?: string[] }).skills).toEqual(["b_ma_active"]);
    expect(
      (loaded?.character as { itemConsumption?: Record<string, number> }).itemConsumption
    ).toEqual({
      [getSkillManualId("b_ma_active")]: 1,
    });
    expect((loaded?.inventory as { items?: Array<{ itemId: string; count: number }> }).items).toEqual(
      [{ itemId: getSkillManualId("b_ma_active"), count: 2 }]
    );
    expect(loaded?.encounter).toMatchObject({
      pendingEvent: null,
      resolvedEventIds: [],
    });
  });

  it("hydrates a versioned envelope into preloaded redux state", () => {
    storage.set(
      KEY,
      JSON.stringify({
        schemaVersion: 2,
        current: {
          character: {
            skills: ["m_ie_active"],
          },
          logs: {},
          adventure: {},
          inventory: { items: [] },
          workshop: {},
          quest: {},
          encounter: {
            pendingEvent: {
              eventId: "herb_garden",
              year: 11,
            },
            resolvedEventIds: ["wandering_smith"],
          },
        },
        soul: {
          totalMerit: 512,
          flowStep: "hall",
          lifetimeStats: {
            highestRealmEver: MajorRealm.NascentSoul,
            highestAgeYears: 777,
            totalDeaths: 4,
            totalReincarnations: 3,
          },
        },
      })
    );

    const loaded = loadState();

    expect((loaded?.character as { skills?: string[] }).skills).toEqual(["m_tr_active"]);
    expect(loaded?.soul).toMatchObject({
      totalMerit: 512,
      flowStep: "hall",
    });
    expect(loaded?.encounter).toMatchObject({
      pendingEvent: {
        eventId: "herb_garden",
        year: 11,
      },
      resolvedEventIds: ["wandering_smith"],
    });
  });

  it("saves redux state back as a versioned envelope", () => {
    saveState({
      character: { isInitialized: true, skills: [] },
      logs: { logs: [] },
      adventure: { currentMapId: null },
      inventory: { items: [] },
      workshop: { alchemyLevel: 1 },
      quest: { activeQuests: {}, completedQuests: [] },
      encounter: {
        pendingEvent: {
          eventId: "herb_garden",
          year: 13,
        },
        resolvedEventIds: ["wandering_smith"],
      },
      soul: {
        totalMerit: 80,
        flowStep: "inactive",
        lifetimeStats: {
          highestRealmEver: MajorRealm.Mortal,
          highestAgeYears: 0,
          totalDeaths: 0,
          totalReincarnations: 0,
        },
      },
    } as never);

    const parsed = JSON.parse(storage.get(KEY) ?? "{}");

    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.current.character.isInitialized).toBe(true);
    expect(parsed.current.encounter.pendingEvent.eventId).toBe("herb_garden");
    expect(parsed.soul.totalMerit).toBe(80);
  });

  it("drops malformed encounter payloads when hydrating a versioned envelope", () => {
    storage.set(
      KEY,
      JSON.stringify({
        schemaVersion: 2,
        current: {
          character: {},
          logs: {},
          adventure: {},
          inventory: { items: [] },
          workshop: {},
          quest: {},
          encounter: {
            pendingEvent: {
              eventId: "herb_garden",
            },
            resolvedEventIds: ["wandering_smith", 99],
          },
        },
        soul: {},
      })
    );

    const loaded = loadState();

    expect(loaded?.encounter).toMatchObject({
      pendingEvent: null,
      resolvedEventIds: ["wandering_smith"],
    });
  });
});
