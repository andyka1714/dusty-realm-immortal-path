import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ItemQuality, MajorRealm } from "../../types";
import { ReincarnationFlow } from "./ReincarnationFlow";
import { getAvailableReincarnationPerks } from "../../utils/reincarnation";

describe("ReincarnationFlow", () => {
  it("renders advanced planner perks and expanded heirloom slots in the hall", () => {
    const lifetimeStats = {
      highestRealmEver: MajorRealm.NascentSoul,
      highestAgeYears: 620,
      totalDeaths: 4,
      totalReincarnations: 1,
    } as const;

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
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
              quality: ItemQuality.Low,
            },
            {
              id: "manual",
              itemId: "s_q_passive_manual",
              label: "青鋒訣手札 x1",
              sourceType: "skill_manual",
              count: 1,
              quality: ItemQuality.Low,
            },
          ],
        }}
        totalMerit={1310}
        lifetimeStats={lifetimeStats}
        unlockedPerks={getAvailableReincarnationPerks(lifetimeStats)}
        config={{
          selectedPerkIds: ["rebirth_extra_heirloom_slot"],
          selectedHeirloomIds: ["blade"],
        }}
        onEnterHall={() => undefined}
        onTogglePerk={() => undefined}
        onToggleHeirloom={() => undefined}
        onSelectSpiritRoot={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(markup).toContain("武魄先成");
    expect(markup).toContain("前塵寶匣");
    expect(markup).toContain("可攜遺珍（限 2 件）");
  });

  it("shows locked planner perks with their unlock condition instead of hiding them", () => {
    const lifetimeStats = {
      highestRealmEver: MajorRealm.GoldenCore,
      highestAgeYears: 350,
      totalDeaths: 2,
      totalReincarnations: 0,
    } as const;

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "lifespan",
          ageYears: 350,
          highestRealm: MajorRealm.GoldenCore,
          realmMerit: 200,
          ageMerit: 175,
          totalMeritGained: 375,
          eligibleHeirlooms: [],
        }}
        totalMerit={375}
        lifetimeStats={lifetimeStats}
        unlockedPerks={getAvailableReincarnationPerks(lifetimeStats)}
        config={{
          selectedPerkIds: [],
          selectedHeirloomIds: [],
        }}
        onEnterHall={() => undefined}
        onTogglePerk={() => undefined}
        onToggleHeirloom={() => undefined}
        onSelectSpiritRoot={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(markup).toContain("尚未悟透");
    expect(markup).toContain("前塵寶匣");
    expect(markup).toContain("抵達元嬰後解鎖");
  });
});
