import { describe, expect, it } from "vitest";
import {
  EquipmentSlot,
  ItemQuality,
  MajorRealm,
  SpiritRootId,
  type ReincarnationPlannerContext,
  type InventorySlot,
} from "../types";
import { getSkillManualId } from "../data/items/manuals";
import {
  DEFAULT_REINCARNATION_PERKS,
  DEFAULT_REINCARNATION_SOUL_SEALS,
  buildEligibleHeirloomCandidates,
  calculateAgeMerit,
  calculateLifeReviewSummary,
  calculateRealmMerit,
  getAvailableReincarnationPerks,
  getAvailableReincarnationSoulSeals,
  getRebirthBuildPreview,
  getRebirthConfigCost,
  getRebirthConfigHeirloomSlotCount,
  sanitizeRebirthConfig,
} from "./reincarnation";

const createPlannerContext = (
  overrides: Partial<ReincarnationPlannerContext> = {}
): ReincarnationPlannerContext => ({
  lifetimeStats: {
    highestRealmEver: MajorRealm.NascentSoul,
    highestAgeYears: 620,
    totalDeaths: 4,
    totalReincarnations: 2,
  },
  worldMemoryTags: [],
  ...overrides,
});

describe("reincarnation utils", () => {
  it("uses the documented realm and age merit calculation", () => {
    expect(calculateRealmMerit(MajorRealm.GoldenCore)).toBe(200);
    expect(calculateAgeMerit(350)).toBe(175);

    expect(
      calculateLifeReviewSummary({
        cause: "lifespan",
        highestRealm: MajorRealm.GoldenCore,
        ageYears: 350,
        inventory: [],
      })
    ).toMatchObject({
      realmMerit: 200,
      ageMerit: 175,
      totalMeritGained: 375,
    });
  });

  it("only exposes equipment instances and skill manuals as heirloom candidates", () => {
    const inventory: InventorySlot[] = [
      {
        itemId: "novice_sword",
        count: 1,
        instanceId: "inst_sword",
        instance: {
          instanceId: "inst_sword",
          templateId: "novice_sword",
          quality: ItemQuality.Low,
          stats: { attack: 4 },
        },
      },
      {
        itemId: "qi_pill",
        count: 5,
      },
      {
        itemId: getSkillManualId("s_q_passive"),
        count: 2,
      },
    ];

    const candidates = buildEligibleHeirloomCandidates(inventory);

    expect(candidates).toHaveLength(2);
    expect(candidates.map((candidate) => candidate.sourceType)).toEqual(["equipment", "skill_manual"]);
  });

  it("totals selected perk costs and supports spirit-root override perks", () => {
    const perkIds = DEFAULT_REINCARNATION_PERKS.slice(0, 2).map((perk) => perk.id);
    const cost = getRebirthConfigCost({
      plannerVersion: 2,
      selectedBuildIdentity: "balanced",
      selectedPerkIds: perkIds,
      selectedHeirloomIds: [],
      spiritRootOverride: SpiritRootId.HEAVENLY_FIRE,
    });

    expect(cost).toBeGreaterThan(DEFAULT_REINCARNATION_PERKS[0].cost);
  });

  it("unlocks advanced reincarnation perks from lifetime milestones instead of exposing the full catalog immediately", () => {
    const baselinePerks = getAvailableReincarnationPerks(
      createPlannerContext({
        lifetimeStats: {
          highestRealmEver: MajorRealm.Mortal,
          highestAgeYears: 90,
          totalDeaths: 1,
          totalReincarnations: 0,
        },
      })
    );
    const advancedPerks = getAvailableReincarnationPerks(createPlannerContext());

    expect(baselinePerks.map((perk) => perk.id)).toEqual([
      "rebirth_root_bone",
      "rebirth_comprehension",
      "rebirth_spirit_stones",
    ]);
    expect(advancedPerks.map((perk) => perk.id)).toContain("rebirth_physique");
    expect(advancedPerks.map((perk) => perk.id)).toContain(
      "rebirth_extra_heirloom_slot"
    );
  });

  it("only unlocks route-memory perks and soul seals when the matching world memory exists", () => {
    const swordContext = createPlannerContext({
      worldMemoryTags: ["route:sword:soul-sheath"],
    });
    const baselineContext = createPlannerContext();

    expect(
      getAvailableReincarnationPerks(swordContext).map((perk) => perk.id)
    ).toContain("rebirth_sword_memory");
    expect(
      getAvailableReincarnationPerks(baselineContext).map((perk) => perk.id)
    ).not.toContain("rebirth_sword_memory");

    expect(
      getAvailableReincarnationSoulSeals(swordContext).map((seal) => seal.id)
    ).toContain("seal_sword_edge");
    expect(
      getAvailableReincarnationSoulSeals(baselineContext).map((seal) => seal.id)
    ).not.toContain("seal_sword_edge");
  });

  it("unlocks v6 endgame soul seals from the existing sect endgame memories", () => {
    const v6Seals = [
      {
        id: "seal_sword_endgame_v6",
        lane: "sword",
        tag: "sect:sword:endgame-loop-v4",
      },
      {
        id: "seal_body_endgame_v6",
        lane: "body",
        tag: "sect:beast:endgame-loop-v4",
      },
      {
        id: "seal_mage_endgame_v6",
        lane: "mage",
        tag: "sect:mystic:endgame-loop-v4",
      },
    ] as const;

    v6Seals.forEach(({ id, lane, tag }) => {
      const seal = DEFAULT_REINCARNATION_SOUL_SEALS.find(
        (entry) => entry.id === id
      );

      expect(seal).toMatchObject({
        id,
        lane,
        unlockRequirement: { minHighestRealm: MajorRealm.ImmortalEmperor },
        requiredWorldMemoryTags: [tag],
      });
      expect(seal?.identityCue).toContain("v6");
      expect(seal?.heirloomHint).toContain("v6");
      expect(
        getAvailableReincarnationSoulSeals(
          createPlannerContext({
            lifetimeStats: {
              highestRealmEver: MajorRealm.ImmortalEmperor,
              highestAgeYears: 3200,
              totalDeaths: 8,
              totalReincarnations: 4,
            },
            worldMemoryTags: [tag],
          })
        ).map((availableSeal) => availableSeal.id)
      ).toContain(id);
      expect(
        getAvailableReincarnationSoulSeals(
          createPlannerContext({
            lifetimeStats: {
              highestRealmEver: MajorRealm.Immortal,
              highestAgeYears: 2200,
              totalDeaths: 7,
              totalReincarnations: 3,
            },
            worldMemoryTags: [tag],
          })
        ).map((availableSeal) => availableSeal.id)
      ).not.toContain(id);
    });
  });

  it("unlocks v3 route-memory soul seals only from chapter 03 memories at Immortal realm", () => {
    const v3Seals = [
      {
        id: "seal_sword_immortal_oath",
        lane: "sword",
        tag: "sect:sword:world-chapter-03",
      },
      {
        id: "seal_body_immortal_blood",
        lane: "body",
        tag: "sect:beast:world-chapter-03",
      },
      {
        id: "seal_mage_immortal_star",
        lane: "mage",
        tag: "sect:mystic:world-chapter-03",
      },
    ] as const;

    v3Seals.forEach(({ id, lane, tag }) => {
      const seal = DEFAULT_REINCARNATION_SOUL_SEALS.find(
        (entry) => entry.id === id
      );
      expect(seal).toMatchObject({
        id,
        lane,
        unlockRequirement: { minHighestRealm: MajorRealm.Immortal },
        requiredWorldMemoryTags: [tag],
      });
      expect(seal?.identityTitle).toBeTruthy();
      expect(seal?.identityCue).toBeTruthy();
      expect(seal?.heirloomHint).toBeTruthy();
      expect(
        Boolean(seal?.statBonuses && Object.keys(seal.statBonuses).length > 0) ||
          Boolean(seal?.spiritStoneBonus)
      ).toBe(true);

      expect(
        getAvailableReincarnationSoulSeals(
          createPlannerContext({
            lifetimeStats: {
              highestRealmEver: MajorRealm.Immortal,
              highestAgeYears: 3000,
              totalDeaths: 6,
              totalReincarnations: 3,
            },
            worldMemoryTags: [tag],
          })
        ).map((availableSeal) => availableSeal.id)
      ).toContain(id);
      expect(
        getAvailableReincarnationSoulSeals(
          createPlannerContext({
            lifetimeStats: {
              highestRealmEver: MajorRealm.Immortal,
              highestAgeYears: 3000,
              totalDeaths: 6,
              totalReincarnations: 3,
            },
            worldMemoryTags: [],
          })
        ).map((availableSeal) => availableSeal.id)
      ).not.toContain(id);
      expect(
        getAvailableReincarnationSoulSeals(
          createPlannerContext({
            lifetimeStats: {
              highestRealmEver: MajorRealm.Tribulation,
              highestAgeYears: 2600,
              totalDeaths: 5,
              totalReincarnations: 2,
            },
            worldMemoryTags: [tag],
          })
        ).map((availableSeal) => availableSeal.id)
      ).not.toContain(id);
    });
  });

  it("derives heirloom slot count from the selected planner perks", () => {
    expect(
      getRebirthConfigHeirloomSlotCount({
        plannerVersion: 2,
        selectedBuildIdentity: "balanced",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      })
    ).toBe(1);

    expect(
      getRebirthConfigHeirloomSlotCount({
        plannerVersion: 2,
        selectedBuildIdentity: "balanced",
        selectedPerkIds: ["rebirth_extra_heirloom_slot"],
        selectedHeirloomIds: [],
      })
    ).toBe(2);
  });

  it("includes soul seal cost in the rebirth planner total", () => {
    const cost = getRebirthConfigCost({
      plannerVersion: 2,
      selectedBuildIdentity: "sword",
      selectedSealId: DEFAULT_REINCARNATION_SOUL_SEALS[0].id,
      selectedPerkIds: [],
      selectedHeirloomIds: [],
    });

    expect(cost).toBe(DEFAULT_REINCARNATION_SOUL_SEALS[0].cost);
  });

  it("sanitizes lane-incompatible perks, seals, and heirlooms from a planner config", () => {
    const sanitized = sanitizeRebirthConfig({
      config: {
        plannerVersion: 1,
        selectedBuildIdentity: "sword",
        selectedSealId: "seal_mage_lantern",
        selectedPerkIds: [
          "rebirth_extra_heirloom_slot",
          "rebirth_mage_insight",
          "rebirth_sword_edge",
        ],
        selectedHeirloomIds: ["sword_manual", "mage_manual", "novice_sword"],
        spiritRootOverride: SpiritRootId.HEAVENLY_FIRE,
      },
      totalMerit: 500,
      plannerContext: createPlannerContext({
        worldMemoryTags: [
          "route:sword:soul-sheath",
          "route:mage:lantern",
        ],
      }),
      summary: {
        cause: "battle",
        ageYears: 350,
        highestRealm: MajorRealm.NascentSoul,
        realmMerit: 1000,
        ageMerit: 175,
        totalMeritGained: 1175,
        eligibleHeirlooms: [
          {
            id: "sword_manual",
            itemId: getSkillManualId("s_tr_active"),
            label: "通玄劍錄 x1",
            sourceType: "skill_manual",
            count: 1,
            quality: ItemQuality.High,
          },
          {
            id: "mage_manual",
            itemId: getSkillManualId("m_tr_active"),
            label: "太乙玄光策 x1",
            sourceType: "skill_manual",
            count: 1,
            quality: ItemQuality.High,
          },
          {
            id: "novice_sword",
            itemId: "novice_sword",
            label: "下品 鏽鐵劍",
            sourceType: "equipment",
            count: 1,
            quality: ItemQuality.Low,
          },
        ],
      },
    });

    expect(sanitized.plannerVersion).toBe(2);
    expect(sanitized.selectedBuildIdentity).toBe("sword");
    expect(sanitized.selectedSealId).toBeUndefined();
    expect(sanitized.selectedPerkIds).toEqual([
      "rebirth_extra_heirloom_slot",
      "rebirth_sword_edge",
    ]);
    expect(sanitized.selectedHeirloomIds).toEqual([
      "sword_manual",
      "novice_sword",
    ]);
  });

  it("sanitizes selected v3 soul seals when chapter 03 memory is missing", () => {
    const withMemory = sanitizeRebirthConfig({
      config: {
        plannerVersion: 2,
        selectedBuildIdentity: "sword",
        selectedSealId: "seal_sword_immortal_oath",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      },
      totalMerit: 1000,
      plannerContext: createPlannerContext({
        lifetimeStats: {
          highestRealmEver: MajorRealm.Immortal,
          highestAgeYears: 3000,
          totalDeaths: 6,
          totalReincarnations: 3,
        },
        worldMemoryTags: ["sect:sword:world-chapter-03"],
      }),
    });
    const withoutMemory = sanitizeRebirthConfig({
      config: {
        plannerVersion: 2,
        selectedBuildIdentity: "sword",
        selectedSealId: "seal_sword_immortal_oath",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      },
      totalMerit: 1000,
      plannerContext: createPlannerContext({
        lifetimeStats: {
          highestRealmEver: MajorRealm.Immortal,
          highestAgeYears: 3000,
          totalDeaths: 6,
          totalReincarnations: 3,
        },
        worldMemoryTags: [],
      }),
    });

    expect(withMemory.selectedSealId).toBe("seal_sword_immortal_oath");
    expect(withoutMemory.selectedSealId).toBeUndefined();
  });

  it("surfaces v3 route memory as a build identity hint in the preview helper", () => {
    const preview = getRebirthBuildPreview({
      config: {
        plannerVersion: 2,
        selectedBuildIdentity: "balanced",
        selectedPerkIds: [],
        selectedHeirloomIds: [],
      },
      totalMerit: 1000,
      plannerContext: createPlannerContext({
        lifetimeStats: {
          highestRealmEver: MajorRealm.Immortal,
          highestAgeYears: 3000,
          totalDeaths: 6,
          totalReincarnations: 3,
        },
        worldMemoryTags: ["sect:mystic:world-chapter-03"],
      }),
    });

    expect(preview.constraintLines).toContain(
      "前世記憶提示：仙宮星圖已入魂，可解鎖更高階的法修轉世規劃。"
    );
  });
});
