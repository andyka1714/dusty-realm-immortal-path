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
});
