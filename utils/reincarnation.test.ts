import { describe, expect, it } from "vitest";
import {
  EquipmentSlot,
  ItemQuality,
  MajorRealm,
  SpiritRootId,
  type InventorySlot,
} from "../types";
import { getSkillManualId } from "../data/items/manuals";
import {
  DEFAULT_REINCARNATION_PERKS,
  buildEligibleHeirloomCandidates,
  calculateAgeMerit,
  calculateLifeReviewSummary,
  calculateRealmMerit,
  getRebirthConfigCost,
} from "./reincarnation";

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
      selectedPerkIds: perkIds,
      selectedHeirloomIds: [],
      spiritRootOverride: SpiritRootId.HEAVENLY_FIRE,
    });

    expect(cost).toBeGreaterThan(DEFAULT_REINCARNATION_PERKS[0].cost);
  });
});
