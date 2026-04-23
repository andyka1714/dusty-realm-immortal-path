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
    expect(migrated.soul.worldMemoryTags).toEqual([]);
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

  it("sanitizes valid pending cue payloads and world memory tags", () => {
    const migrated = migratePersistedState({
      schemaVersion: 2,
      current: createPersistedState({
        encounter: {
          pendingEvent: {
            eventId: "herb_garden",
            year: 11,
            presentationCue: {
              chainLabel: "劍脈回聲",
              memoryCue: "劍鞘共鳴會留下記憶",
              routeLabel: "凌霄劍宗",
              professionLabel: 42,
              sectLabel: "劍宗前置回響",
            },
          },
          resolvedEventIds: ["wandering_smith"],
        },
      }),
      soul: {
        totalMerit: 20,
        worldMemoryTags: ["route:sword:soul-sheath", 42, ""],
      },
    } as PersistedState);

    expect(migrated.encounter.pendingEvent).toMatchObject({
      eventId: "herb_garden",
      year: 11,
      presentationCue: {
        chainLabel: "劍脈回聲",
        memoryCue: "劍鞘共鳴會留下記憶",
        routeLabel: "凌霄劍宗",
        sectLabel: "劍宗前置回響",
      },
    });
    expect(migrated.soul.worldMemoryTags).toEqual(["route:sword:soul-sheath"]);
  });

  it("migrates legacy workshop state with high-tier mastery defaults", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        workshop: {
          alchemyLevel: 8,
          blacksmithLevel: 7,
          unlockedRecipes: ["qi_pill", "immortal_emperor_breakthrough_pill", 42],
          craftedRecipeCounts: {
            qi_pill: 3,
            broken_recipe: "bad",
          },
        },
      })
    );

    expect(migrated.workshop).toMatchObject({
      alchemyLevel: 8,
      blacksmithLevel: 7,
      unlockedRecipes: ["qi_pill", "immortal_emperor_breakthrough_pill"],
      craftedRecipeCounts: {
        qi_pill: 3,
      },
      masteryByDiscipline: {
        alchemy: 0,
        smithing: 0,
      },
      specializationByDiscipline: {
        alchemy: null,
        smithing: null,
      },
      specializationTreeByDiscipline: {
        alchemy: {
          unlockedNodeIds: [],
          activeNodeId: null,
          activeBranchId: null,
        },
        smithing: {
          unlockedNodeIds: [],
          activeNodeId: null,
          activeBranchId: null,
        },
      },
    });
  });

  it("migrates legacy workshop specialization selections into a safe tree path", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        workshop: {
          masteryByDiscipline: {
            alchemy: 28,
            smithing: "bad",
          },
          specializationByDiscipline: {
            alchemy: "alchemy_hongmeng_condenser",
            smithing: 99,
          },
        },
      })
    );

    expect(migrated.workshop).toMatchObject({
      masteryByDiscipline: {
        alchemy: 28,
        smithing: 0,
      },
      specializationByDiscipline: {
        alchemy: "alchemy_hongmeng_condenser",
        smithing: null,
      },
      specializationTreeByDiscipline: {
        alchemy: {
          unlockedNodeIds: ["alchemy_inner_fire_foundation", "alchemy_hongmeng_condenser"],
          activeNodeId: "alchemy_hongmeng_condenser",
          activeBranchId: "alchemy_hongmeng",
        },
        smithing: {
          unlockedNodeIds: [],
          activeNodeId: null,
          activeBranchId: null,
        },
      },
    });
  });

  it("sanitizes malformed workshop tree values and mirrors only valid active nodes", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        workshop: {
          specializationTreeByDiscipline: {
            alchemy: {
              unlockedNodeIds: [
                "alchemy_inner_fire_foundation",
                "missing",
                "alchemy_lifebloom_resonance",
              ],
              activeNodeId: "alchemy_lifebloom_resonance",
              activeBranchId: "wrong",
            },
            smithing: {
              unlockedNodeIds: ["missing"],
              activeNodeId: "missing",
            },
          },
          specializationByDiscipline: {
            alchemy: "unknown_flat",
            smithing: "smithing_starfire_tempering",
          },
        },
      })
    );

    expect(migrated.workshop.specializationTreeByDiscipline).toMatchObject({
      alchemy: {
        unlockedNodeIds: ["alchemy_inner_fire_foundation", "alchemy_lifebloom_resonance"],
        activeNodeId: "alchemy_lifebloom_resonance",
        activeBranchId: "alchemy_lifebloom",
      },
      smithing: {
        unlockedNodeIds: ["smithing_core_temper_foundation", "smithing_starfire_tempering"],
        activeNodeId: "smithing_starfire_tempering",
        activeBranchId: "smithing_starfire",
      },
    });
    expect(migrated.workshop.specializationByDiscipline).toEqual({
      alchemy: "alchemy_lifebloom_resonance",
      smithing: "smithing_starfire_tempering",
    });
  });

  it("rejects malformed workshop arrays and invalid numeric fields", () => {
    const migrated = migratePersistedState(
      createPersistedState({
        workshop: {
          alchemyLevel: -2,
          blacksmithLevel: 2.5,
          craftedRecipeCounts: [1, 2],
          masteryByDiscipline: {
            alchemy: -1,
            smithing: 1.5,
          },
        },
      })
    );

    expect(migrated.workshop).toMatchObject({
      alchemyLevel: 1,
      blacksmithLevel: 1,
      craftedRecipeCounts: {},
      masteryByDiscipline: {
        alchemy: 0,
        smithing: 0,
      },
    });
  });

  it("bootstraps advanced planner perks from lifetime milestones even when older saves do not list them", () => {
    const migrated = migratePersistedState({
      schemaVersion: 2,
      current: createPersistedState(),
      soul: {
        totalMerit: 900,
        lifetimeStats: {
          highestRealmEver: MajorRealm.NascentSoul,
          highestAgeYears: 620,
          totalDeaths: 4,
          totalReincarnations: 1,
        },
        unlockedPerkIds: ["rebirth_root_bone"],
      },
    } as PersistedState);

    expect(migrated.soul.unlockedPerkIds).toContain("rebirth_physique");
    expect(migrated.soul.unlockedPerkIds).toContain("rebirth_extra_heirloom_slot");
  });

  it("drops planner selections that exceed the migrated perk and heirloom rules", () => {
    const migrated = migratePersistedState({
      schemaVersion: 2,
      current: createPersistedState(),
      soul: {
        totalMerit: 300,
        lifetimeStats: {
          highestRealmEver: MajorRealm.Mortal,
          highestAgeYears: 90,
          totalDeaths: 1,
          totalReincarnations: 0,
        },
        unlockedPerkIds: ["rebirth_extra_heirloom_slot"],
        rebirthConfig: {
          selectedPerkIds: ["rebirth_extra_heirloom_slot"],
          selectedHeirloomIds: ["blade", "manual"],
        },
      },
    } as PersistedState);

    expect(migrated.soul.unlockedPerkIds).not.toContain("rebirth_extra_heirloom_slot");
    expect(migrated.soul.rebirthConfig.selectedPerkIds).toEqual([]);
    expect(migrated.soul.rebirthConfig.selectedHeirloomIds).toEqual(["manual"]);
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
