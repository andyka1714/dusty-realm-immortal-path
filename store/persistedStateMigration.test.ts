import { describe, expect, it } from "vitest";
import { getSkillManualId } from "../data/items/manuals";
import { MajorRealm } from "../types";
import {
  PersistedState,
  migratePersistedState,
} from "./persistedStateMigration";

const createPersistedState = (
  overrides: Partial<PersistedState> = {}
): PersistedState => ({
  character: {},
  logs: {},
  adventure: {},
  inventory: { items: [] },
  workshop: {},
  quest: {},
  ...overrides,
});

describe("persisted state migration", () => {
  it("upgrades a legacy raw save into a current+soul preloaded state", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        character: {
          majorRealm: MajorRealm.GoldenCore,
          age: 350 * 365,
          skills: ["m_ie_active", "m_im_active"],
        },
      })
    );

    expect(migrated.character).toBeDefined();
    expect((migrated.character as { skills?: string[] }).skills).toEqual(["m_tr_active"]);
    expect(migrated.soul).toMatchObject({
      totalMerit: 0,
      flowStep: "inactive",
      lifetimeStats: {
        highestRealmEver: MajorRealm.Mortal,
        totalDeaths: 0,
        totalReincarnations: 0,
      },
    });
    expect(migrated.encounter).toMatchObject({
      pendingEvent: null,
      resolvedEventIds: [],
    });
  });

  it("keeps soul progression when hydrating a versioned envelope", () => {
    const migrated = migratePersistedState({
      schemaVersion: 2,
      current: createPersistedState({
        character: {
          skills: ["s_bi_active"],
        },
      }),
      soul: {
        totalMerit: 420,
        flowStep: "hall",
        lifetimeStats: {
          highestRealmEver: MajorRealm.NascentSoul,
          highestAgeYears: 612,
          totalDeaths: 3,
          totalReincarnations: 2,
        },
      },
    } as PersistedState);

    expect((migrated.character as { skills?: string[] }).skills).toEqual(["s_tr_active"]);
    expect(migrated.soul).toMatchObject({
      totalMerit: 420,
      flowStep: "hall",
      lifetimeStats: {
        highestRealmEver: MajorRealm.NascentSoul,
        totalDeaths: 3,
      },
    });
    expect(migrated.encounter).toMatchObject({
      pendingEvent: null,
      resolvedEventIds: [],
    });
  });

  it("normalizes retired learned skills into a unique formal core list", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        character: {
          skills: ["m_ie_active", "m_im_active", "m_tr_active", "unknown_skill"],
        },
      })
    );

    expect((migrated.character as { skills?: string[] }).skills).toEqual(["m_tr_active"]);
  });

  it("upgrades retired manual ids in inventory and itemConsumption to formal manuals", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        character: {
          skills: ["s_bi_active"],
          itemConsumption: {
            [getSkillManualId("s_bi_active")]: 1,
            "m_ie_active_manual": 2,
          },
        },
        inventory: {
          items: [
            { itemId: getSkillManualId("s_tr_active"), count: 1 },
            { itemId: getSkillManualId("s_bi_active"), count: 2 },
            { itemId: "m_ie_active_manual", count: 1 },
          ],
        },
      })
    );

    expect((migrated.character as { skills?: string[] }).skills).toEqual(["s_tr_active"]);
    expect(
      (migrated.character as { itemConsumption?: Record<string, number> }).itemConsumption
    ).toEqual({
      [getSkillManualId("s_tr_active")]: 1,
      [getSkillManualId("m_tr_active")]: 2,
    });
    expect((migrated.inventory as { items?: Array<{ itemId: string; count: number }> }).items).toEqual(
      [
        { itemId: getSkillManualId("s_tr_active"), count: 3 },
        { itemId: getSkillManualId("m_tr_active"), count: 1 },
      ]
    );
  });

  it("sanitizes malformed encounter payloads while keeping valid resolved ids", () => {
    const migrated = migratePersistedState({
      schemaVersion: 2,
      current: createPersistedState({
        encounter: {
          pendingEvent: {
            eventId: 123,
            year: "11",
          },
          resolvedEventIds: ["wandering_smith", 42, null],
        },
      }),
      soul: {
        totalMerit: 20,
      },
    } as PersistedState);

    expect(migrated.encounter).toMatchObject({
      pendingEvent: null,
      resolvedEventIds: ["wandering_smith"],
    });
  });

  it("drops broken manual-like ids that cannot be mapped to a formal manual", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        character: {
          itemConsumption: {
            manual_missing_skill: 3,
          },
        },
        inventory: {
          items: [{ itemId: "manual_missing_skill", count: 1 }],
        },
      })
    );

    expect(
      (migrated.character as { itemConsumption?: Record<string, number> }).itemConsumption
    ).toEqual({});
    expect((migrated.inventory as { items?: unknown[] }).items).toEqual([]);
  });
});
