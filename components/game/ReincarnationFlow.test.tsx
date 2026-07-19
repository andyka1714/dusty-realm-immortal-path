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

  it("shows v3 route memory source, identity cue, and expected benefit on an available soul seal card", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.Immortal);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "lifespan",
          ageYears: 1800,
          highestRealm: MajorRealm.Immortal,
          realmMerit: 10000000,
          ageMerit: 900,
          totalMeritGained: 10000900,
          eligibleHeirlooms: [],
        }}
        totalMerit={10000900}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={["sect:sword:world-chapter-03"]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: ["sect:sword:world-chapter-03"],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
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

    expect(markup).toContain('data-testid="rebirth-seal-seal_sword_immortal_oath"');
    expect(markup).toContain("仙誓劍胎");
    expect(markup).toContain("route memory：sect:sword:world-chapter-03");
    expect(markup).toContain("下一世將帶著凌霄劍宗仙誓開局");
    expect(markup).toContain("預期收益：根骨 +3、悟性 +2");
  });

  it("shows the missing sect world-chapter-03 reason on a locked v3 soul seal card", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.Immortal);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "lifespan",
          ageYears: 1800,
          highestRealm: MajorRealm.Immortal,
          realmMerit: 10000000,
          ageMerit: 900,
          totalMeritGained: 10000900,
          eligibleHeirlooms: [],
        }}
        totalMerit={10000900}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={[]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: [],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
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

    expect(markup).toContain("仙誓劍胎");
    expect(markup).toContain("缺少 route memory：sect:sword:world-chapter-03");
    expect(markup).toContain("route memory：sect:sword:world-chapter-03");
  });

  it("shows v4 endgame memory source, identity cue, and benefit on an available soul seal card", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.ImmortalEmperor);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "voluntary",
          ageYears: 2600,
          highestRealm: MajorRealm.ImmortalEmperor,
          realmMerit: 100000000,
          ageMerit: 1300,
          totalMeritGained: 100001300,
          eligibleHeirlooms: [],
        }}
        totalMerit={100001300}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={["sect:sword:endgame-loop-v4"]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: ["sect:sword:endgame-loop-v4"],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
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

    expect(markup).toContain('data-testid="rebirth-seal-seal_sword_endgame_v4"');
    expect(markup).toContain("斬天輪迴劍印");
    expect(markup).toContain("route memory：sect:sword:endgame-loop-v4");
    expect(markup).toContain("下一世將帶著斬天終局記憶開局");
    expect(markup).toContain("預期收益：根骨 +4、悟性 +3、福緣 +1");
  });

  it("shows v5 endgame build hook on an available soul seal card", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.ImmortalEmperor);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "voluntary",
          ageYears: 2800,
          highestRealm: MajorRealm.ImmortalEmperor,
          realmMerit: 100000000,
          ageMerit: 1400,
          totalMeritGained: 100001400,
          eligibleHeirlooms: [],
        }}
        totalMerit={100001400}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={["sect:sword:endgame-loop-v4"]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: ["sect:sword:endgame-loop-v4"],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
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

    expect(markup).toContain('data-testid="rebirth-seal-seal_sword_endgame_v5"');
    expect(markup).toContain("斬天 v5 劍冕");
    expect(markup).toContain("route memory：sect:sword:endgame-loop-v4");
    expect(markup).toContain("下一世將帶著 v5 斬天劍冕開局");
    expect(markup).toContain("預期收益：根骨 +5、悟性 +3、福緣 +2");
    expect(markup).toContain("帝冕、劍系武器與劍修手札可帶入");
  });

  it("shows v6 endgame soul seal source and build identity on an available card", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.ImmortalEmperor);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "voluntary",
          ageYears: 3200,
          highestRealm: MajorRealm.ImmortalEmperor,
          realmMerit: 100000000,
          ageMerit: 1600,
          totalMeritGained: 100001600,
          eligibleHeirlooms: [],
        }}
        totalMerit={100001600}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={["sect:sword:endgame-loop-v4"]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: ["sect:sword:endgame-loop-v4"],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
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

    expect(markup).toContain('data-testid="rebirth-seal-seal_sword_endgame_v6"');
    expect(markup).toContain("斬天 v6 劍印");
    expect(markup).toContain("route memory：sect:sword:endgame-loop-v4");
    expect(markup).toContain("下一世將帶著 v6 斬天迴響開局");
    expect(markup).toContain("預期收益：根骨 +6、悟性 +4、福緣 +2");
  });

  it("shows the missing v4 endgame reason on a locked v5 soul seal card", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.ImmortalEmperor);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="hall"
        summary={{
          cause: "voluntary",
          ageYears: 2800,
          highestRealm: MajorRealm.ImmortalEmperor,
          realmMerit: 100000000,
          ageMerit: 1400,
          totalMeritGained: 100001400,
          eligibleHeirlooms: [],
        }}
        totalMerit={100001400}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={[]}
        unlockedPerks={getAvailableReincarnationPerks({
          lifetimeStats,
          worldMemoryTags: [],
        })}
        config={{
          plannerVersion: 2,
          selectedBuildIdentity: "sword",
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

    expect(markup).toContain("斬天 v5 劍冕");
    expect(markup).toContain("缺少 route memory：sect:sword:endgame-loop-v4");
  });

  it("shows voluntary endgame closure copy separately from death reincarnation", () => {
    const lifetimeStats = createLifetimeStats(MajorRealm.ImmortalEmperor);

    const markup = renderToStaticMarkup(
      <ReincarnationFlow
        flowStep="life_review"
        summary={{
          cause: "voluntary",
          ageYears: 2600,
          highestRealm: MajorRealm.ImmortalEmperor,
          realmMerit: 100000000,
          ageMerit: 1300,
          totalMeritGained: 100001300,
          eligibleHeirlooms: [],
        }}
        totalMerit={100001300}
        lifetimeStats={lifetimeStats}
        worldMemoryTags={["sect:sword:endgame-loop-v4"]}
        unlockedPerks={[]}
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

    expect(markup).toContain("本世收束");
    expect(markup).toContain("飛升/結局回顧");
    expect(markup).toContain("主動重開下一世");
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
    expect(markup).toContain("max-w-[1180px]");
    expect(markup).toContain("lg:grid-cols-2");
    expect(markup).toContain("手機維持單欄直向閱讀");
  });
});
