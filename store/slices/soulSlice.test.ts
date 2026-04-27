import { describe, expect, it } from "vitest";
import { MajorRealm, SpiritRootId } from "../../types";
import soulReducer, {
  clearReincarnationFlow,
  enterReincarnationHall,
  setRebirthBuildIdentity,
  setRebirthSoulSeal,
  startLifeReview,
  toggleRebirthPerk,
  toggleSelectedHeirloom,
  setRebirthSpiritRootOverride,
  addWorldMemoryTags,
} from "./soulSlice";
import {
  DEFAULT_REINCARNATION_PERKS,
  getAvailableReincarnationPerks,
} from "../../utils/reincarnation";

describe("soulSlice", () => {
  it("starts a life review and banks the gained merit", () => {
    const next = soulReducer(
      undefined,
      startLifeReview({
        cause: "lifespan",
        ageYears: 350,
        highestRealm: MajorRealm.GoldenCore,
        realmMerit: 200,
        ageMerit: 175,
        totalMeritGained: 375,
        eligibleHeirlooms: [],
      })
    );

    expect(next.totalMerit).toBe(375);
    expect(next.flowStep).toBe("life_review");
    expect(next.lifetimeStats).toMatchObject({
      highestRealmEver: MajorRealm.GoldenCore,
      highestAgeYears: 350,
      totalDeaths: 1,
    });
  });

  it("only allows perk selection after entering the reincarnation hall", () => {
    const perkId = DEFAULT_REINCARNATION_PERKS[0].id;
    const reviewed = soulReducer(
      undefined,
      startLifeReview({
        cause: "lifespan",
        ageYears: 120,
        highestRealm: MajorRealm.Foundation,
        realmMerit: 50,
        ageMerit: 60,
        totalMeritGained: 110,
        eligibleHeirlooms: [],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const selected = soulReducer(hall, toggleRebirthPerk(perkId));

    expect(selected.flowStep).toBe("hall");
    expect(selected.rebirthConfig.selectedPerkIds).toEqual([perkId]);
    expect(selected.rebirthConfig.plannerVersion).toBe(2);
    expect(selected.rebirthConfig.selectedBuildIdentity).toBe("balanced");
  });

  it("tracks a spirit-root override and can clear the reincarnation flow", () => {
    const reviewed = soulReducer(
      undefined,
      startLifeReview({
        cause: "lifespan",
        ageYears: 400,
        highestRealm: MajorRealm.GoldenCore,
        realmMerit: 200,
        ageMerit: 200,
        totalMeritGained: 400,
        eligibleHeirlooms: [],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const overridden = soulReducer(
      hall,
      setRebirthSpiritRootOverride(SpiritRootId.VARIANT_THUNDER)
    );
    const cleared = soulReducer(overridden, clearReincarnationFlow());

    expect(overridden.rebirthConfig.spiritRootOverride).toBe(
      SpiritRootId.VARIANT_THUNDER
    );
    expect(cleared.flowStep).toBe("inactive");
    expect(cleared.pendingLifeReview).toBeNull();
  });

  it("unlocks advanced planner perks when lifetime milestones are reached", () => {
    const next = soulReducer(
      undefined,
      startLifeReview({
        cause: "lifespan",
        ageYears: 620,
        highestRealm: MajorRealm.NascentSoul,
        realmMerit: 1000,
        ageMerit: 310,
        totalMeritGained: 1310,
        eligibleHeirlooms: [],
      })
    );

    expect(next.unlockedPerkIds).toEqual(
      getAvailableReincarnationPerks(next.lifetimeStats).map((perk) => perk.id)
    );
    expect(next.unlockedPerkIds).toContain("rebirth_physique");
    expect(next.unlockedPerkIds).toContain("rebirth_extra_heirloom_slot");
  });

  it("lets the hall select multiple heirlooms only when the slot-expansion perk is active", () => {
    const reviewed = soulReducer(
      undefined,
      startLifeReview({
        cause: "lifespan",
        ageYears: 620,
        highestRealm: MajorRealm.NascentSoul,
        realmMerit: 1000,
        ageMerit: 310,
        totalMeritGained: 1310,
        eligibleHeirlooms: [
          {
            id: "blade",
            itemId: "novice_sword",
            label: "下品 新手劍",
            sourceType: "equipment",
            count: 1,
            quality: 0,
          },
          {
            id: "manual",
            itemId: "s_q_passive_manual",
            label: "青鋒訣手札 x1",
            sourceType: "skill_manual",
            count: 1,
            quality: 0,
          },
        ],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const singleSlot = soulReducer(hall, toggleSelectedHeirloom("blade"));
    const forcedSingle = soulReducer(singleSlot, toggleSelectedHeirloom("manual"));
    const expanded = soulReducer(
      hall,
      toggleRebirthPerk("rebirth_extra_heirloom_slot")
    );
    const doubleSlot = soulReducer(
      soulReducer(expanded, toggleSelectedHeirloom("blade")),
      toggleSelectedHeirloom("manual")
    );

    expect(forcedSingle.rebirthConfig.selectedHeirloomIds).toEqual(["manual"]);
    expect(doubleSlot.rebirthConfig.selectedHeirloomIds).toEqual([
      "blade",
      "manual",
    ]);
  });

  it("keeps lane-specific perks mutually exclusive with the selected build identity", () => {
    const reviewed = soulReducer(
      undefined,
      startLifeReview({
        cause: "lifespan",
        ageYears: 620,
        highestRealm: MajorRealm.NascentSoul,
        realmMerit: 1000,
        ageMerit: 310,
        totalMeritGained: 1310,
        eligibleHeirlooms: [],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const sword = soulReducer(hall, setRebirthBuildIdentity("sword"));
    const rejectedMage = soulReducer(sword, toggleRebirthPerk("rebirth_mage_insight"));
    const acceptedSword = soulReducer(rejectedMage, toggleRebirthPerk("rebirth_sword_edge"));

    expect(rejectedMage.rebirthConfig.selectedPerkIds).toEqual([]);
    expect(acceptedSword.rebirthConfig.selectedPerkIds).toEqual([
      "rebirth_sword_edge",
    ]);
  });

  it("drops incompatible heirlooms and seals when the build identity changes", () => {
    const reviewed = soulReducer(
      {
        ...soulReducer(undefined, { type: "@@INIT" }),
        worldMemoryTags: ["route:sword:soul-sheath", "route:mage:lantern"],
      },
      startLifeReview({
        cause: "battle",
        ageYears: 620,
        highestRealm: MajorRealm.NascentSoul,
        realmMerit: 1000,
        ageMerit: 310,
        totalMeritGained: 1310,
        eligibleHeirlooms: [
          {
            id: "sword_manual",
            itemId: "manual_s_tr_active",
            label: "通玄劍錄 x1",
            sourceType: "skill_manual",
            count: 1,
            quality: 2,
          },
          {
            id: "mage_manual",
            itemId: "manual_m_tr_active",
            label: "太乙玄光策 x1",
            sourceType: "skill_manual",
            count: 1,
            quality: 2,
          },
        ],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const sword = soulReducer(hall, setRebirthBuildIdentity("sword"));
    const sealed = soulReducer(sword, setRebirthSoulSeal("seal_sword_edge"));
    const withSwordManual = soulReducer(sealed, toggleSelectedHeirloom("sword_manual"));
    const attemptedMageManual = soulReducer(
      withSwordManual,
      toggleSelectedHeirloom("mage_manual")
    );
    const switchedToMage = soulReducer(
      attemptedMageManual,
      setRebirthBuildIdentity("mage")
    );

    expect(attemptedMageManual.rebirthConfig.selectedHeirloomIds).toEqual([
      "sword_manual",
    ]);
    expect(sealed.rebirthConfig.selectedSealId).toBe("seal_sword_edge");
    expect(switchedToMage.rebirthConfig.selectedSealId).toBeUndefined();
    expect(switchedToMage.rebirthConfig.selectedHeirloomIds).toEqual([]);
  });

  it("selects v3 soul seals from chapter 03 memories and drops them when identity changes", () => {
    const reviewed = soulReducer(
      {
        ...soulReducer(undefined, { type: "@@INIT" }),
        worldMemoryTags: ["sect:beast:world-chapter-03"],
      },
      startLifeReview({
        cause: "battle",
        ageYears: 3000,
        highestRealm: MajorRealm.Immortal,
        realmMerit: 10000000,
        ageMerit: 1500,
        totalMeritGained: 10001500,
        eligibleHeirlooms: [],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const body = soulReducer(hall, setRebirthBuildIdentity("body"));
    const sealed = soulReducer(
      body,
      setRebirthSoulSeal("seal_body_immortal_blood")
    );
    const switchedToSword = soulReducer(sealed, setRebirthBuildIdentity("sword"));

    expect(sealed.rebirthConfig.selectedSealId).toBe(
      "seal_body_immortal_blood"
    );
    expect(switchedToSword.rebirthConfig.selectedSealId).toBeUndefined();
  });

  it("keeps selected v3 soul seals sanitized when the required memory is absent", () => {
    const reviewed = soulReducer(
      undefined,
      startLifeReview({
        cause: "battle",
        ageYears: 3000,
        highestRealm: MajorRealm.Immortal,
        realmMerit: 10000000,
        ageMerit: 1500,
        totalMeritGained: 10001500,
        eligibleHeirlooms: [],
      })
    );
    const hall = soulReducer(reviewed, enterReincarnationHall());
    const sword = soulReducer(hall, setRebirthBuildIdentity("sword"));
    const rejected = soulReducer(
      sword,
      setRebirthSoulSeal("seal_sword_immortal_oath")
    );
    const withMemory = soulReducer(
      rejected,
      addWorldMemoryTags(["sect:sword:world-chapter-03"])
    );
    const accepted = soulReducer(
      withMemory,
      setRebirthSoulSeal("seal_sword_immortal_oath")
    );

    expect(rejected.rebirthConfig.selectedSealId).toBeUndefined();
    expect(accepted.rebirthConfig.selectedSealId).toBe(
      "seal_sword_immortal_oath"
    );
  });
});
