import { describe, expect, it } from "vitest";
import { MajorRealm, SpiritRootId } from "../../types";
import soulReducer, {
  clearReincarnationFlow,
  enterReincarnationHall,
  startLifeReview,
  toggleRebirthPerk,
  setRebirthSpiritRootOverride,
} from "./soulSlice";
import { DEFAULT_REINCARNATION_PERKS } from "../../utils/reincarnation";

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
});
