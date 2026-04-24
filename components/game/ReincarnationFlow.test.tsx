import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ItemQuality, MajorRealm } from "../../types";
import { ReincarnationFlow } from "./ReincarnationFlow";
import { getAvailableReincarnationPerks } from "../../utils/reincarnation";

const createLifetimeStats = (realm = MajorRealm.NascentSoul) =>
  ({
    highestRealmEver: realm,
    highestAgeYears: 620,
    totalDeaths: 4,
    totalReincarnations: 1,
  }) as const;

describe("ReincarnationFlow", () => {
  it("renders advanced planner perks and expanded heirloom slots in the hall", () => {
    const lifetimeStats = createLifetimeStats();

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
        worldMemoryTags={["route:sword:soul-sheath"]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: ["route:sword:soul-sheath"],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "balanced",
          selectedPerkIds: ["rebirth_extra_heirloom_slot"],
          selectedHeirloomIds: ["blade"],
        }}
        onEnterHall={() => undefined}
        onSelectBuildIdentity={() => undefined}
        onSelectSoulSeal={() => undefined}
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
        worldMemoryTags={[]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: [],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "balanced",
          selectedPerkIds: [],
          selectedHeirloomIds: [],
        }}
        onEnterHall={() => undefined}
        onSelectBuildIdentity={() => undefined}
        onSelectSoulSeal={() => undefined}
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

  it("shows build identity cues, expected benefits, and blocked reasons in the hall preview", () => {
    const lifetimeStats = {
      highestRealmEver: MajorRealm.GoldenCore,
      highestAgeYears: 280,
      totalDeaths: 2,
      totalReincarnations: 0,
    } as const;

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "lifespan",
          ageYears: 280,
          highestRealm: MajorRealm.Foundation,
          realmMerit: 50,
          ageMerit: 140,
          totalMeritGained: 190,
          eligibleHeirlooms: [
            {
              id: "shield",
              itemId: "wooden_shield",
              label: "下品 木鍋蓋",
              sourceType: "equipment",
              count: 1,
              quality: ItemQuality.Low,
            },
            {
              id: "mage-manual",
              itemId: "manual_m_tr_active",
              label: "天演真解秘卷 x1",
              sourceType: "skill_manual",
              count: 1,
              quality: ItemQuality.Medium,
            },
          ],
        }}
        totalMerit={100}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={["route:sword:soul-sheath"]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: ["route:sword:soul-sheath"],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
          selectedSealId: "seal_sword_edge",
          selectedPerkIds: ["rebirth_sword_edge", "rebirth_extra_heirloom_slot"],
          selectedHeirloomIds: ["shield"],
        }}
        onEnterHall={() => undefined}
        onSelectBuildIdentity={() => undefined}
        onSelectSoulSeal={() => undefined}
        onTogglePerk={() => undefined}
        onToggleHeirloom={() => undefined}
        onSelectSpiritRoot={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(markup).toContain("劍修轉世");
    expect(markup).toContain("本命魂印");
    expect(markup).toContain("劍脈轉世");
    expect(markup).toContain("功德不足");
    expect(markup).toContain("與當前劍修流派不符");
    expect(markup).toContain("與當前劍修流派互斥");
  });

  it("uses a mobile-first single-column shell so the hall can scroll within the viewport", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.GoldenCore);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "lifespan",
          ageYears: 410,
          highestRealm: MajorRealm.GoldenCore,
          realmMerit: 320,
          ageMerit: 180,
          totalMeritGained: 500,
          eligibleHeirlooms: [],
        }}
        totalMerit={500}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={[]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: [],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "balanced",
          selectedPerkIds: [],
          selectedHeirloomIds: [],
        }}
        onEnterHall={() => undefined}
        onSelectBuildIdentity={() => undefined}
        onSelectSoulSeal={() => undefined}
        onTogglePerk={() => undefined}
        onToggleHeirloom={() => undefined}
        onSelectSpiritRoot={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(markup).toContain("min-h-dvh");
    expect(markup).toContain("max-w-[560px]");
    expect(markup).toContain("單欄直向閱讀");
  });
});
