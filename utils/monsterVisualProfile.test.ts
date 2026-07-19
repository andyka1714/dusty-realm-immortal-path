import { describe, expect, it } from "vitest";
import { BESTIARY } from "../data/enemies";
import { PRODUCTION_READY_MONSTER_IDS } from "../data/assets/monsterSpriteReadiness";
import { EnemyRank } from "../types";
import {
  listMissingMonsterVisualProfiles,
  resolveMonsterVisualProfile,
} from "./monsterVisualProfile";

describe("monsterVisualProfile", () => {
  it("derives a visual profile for every current enemy template", () => {
    expect(Object.keys(BESTIARY)).toHaveLength(265);
    expect(listMissingMonsterVisualProfiles(BESTIARY)).toEqual([]);
  });

  it("uses the player 1x2 baseline while assigning sizes from monster semantics", () => {
    expect(resolveMonsterVisualProfile(BESTIARY.m1_c1)).toMatchObject({
      visualArchetype: "dog",
      bodyType: "quadruped",
      footprintTiles: { width: 2, height: 1 },
      heightTiles: 1,
      playerScaleReference: { width: 1, height: 2 },
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m2_c1)).toMatchObject({
      visualArchetype: "swordsman",
      bodyType: "humanoid",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m3_c2)).toMatchObject({
      visualArchetype: "bear",
      bodyType: "quadruped",
      footprintTiles: { width: 2, height: 2 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m12_c2)).toMatchObject({
      bodyType: "winged",
      footprintTiles: { width: 2, height: 1 },
      heightTiles: 1,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m32_c1)).toMatchObject({
      bodyType: "winged",
      footprintTiles: { width: 2, height: 1 },
      heightTiles: 1,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m20_c1)).toMatchObject({
      visualArchetype: "plant",
      bodyType: "humanoid",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m5_c1)).toMatchObject({
      visualArchetype: "plant",
      bodyType: "plant",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m20_c2)).toMatchObject({
      bodyType: "quadruped",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 1,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m22_b1)).toMatchObject({
      visualArchetype: "giant_crab",
      bodyType: "low_crawler",
      footprintTiles: { width: 4, height: 2 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m31_c1)).toMatchObject({
      visualArchetype: "undead_humanoid",
      bodyType: "humanoid",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m31_c2)).toMatchObject({
      visualArchetype: "undead_humanoid",
      bodyType: "humanoid",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m42_c1)).toMatchObject({
      visualArchetype: "lizard",
      bodyType: "low_crawler",
      footprintTiles: { width: 2, height: 1 },
      heightTiles: 1,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m42_c2)).toMatchObject({
      visualArchetype: "construct",
      bodyType: "construct",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 3,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m50_c2)).toMatchObject({
      visualArchetype: "insect",
      bodyType: "winged",
      footprintTiles: { width: 2, height: 1 },
      heightTiles: 1,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m61_c2)).toMatchObject({
      visualArchetype: "beast",
      bodyType: "winged",
      footprintTiles: { width: 2, height: 1 },
      heightTiles: 1,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m62_c2)).toMatchObject({
      visualArchetype: "humanoid_guard",
      bodyType: "humanoid",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m70_c1)).toMatchObject({
      visualArchetype: "construct",
      bodyType: "construct",
      footprintTiles: { width: 1, height: 1 },
      heightTiles: 3,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m70_c2)).toMatchObject({
      bodyType: "quadruped",
      footprintTiles: { width: 2, height: 2 },
      heightTiles: 2,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m92_b1)).toMatchObject({
      visualArchetype: "sword_avatar",
      bodyType: "humanoid",
      footprintTiles: { width: 2, height: 2 },
      heightTiles: 4,
    });

    expect(resolveMonsterVisualProfile(BESTIARY.m180_b1)).toMatchObject({
      visualArchetype: "dao_avatar",
      bodyType: "colossus",
      footprintTiles: { width: 2, height: 2 },
      heightTiles: 6,
    });
  });

  it("keeps rank visual language separate from species/body semantics", () => {
    const common = resolveMonsterVisualProfile(BESTIARY.m1_c1);
    const elite = resolveMonsterVisualProfile(BESTIARY.m15_e1);
    const boss = resolveMonsterVisualProfile(BESTIARY.m180_b1);

    expect(common.rankVisual).toMatchObject({
      rank: EnemyRank.Common,
      aura: "none",
      targetCue: "standard",
      animationIntensity: "low",
    });
    expect(elite.rankVisual).toMatchObject({
      rank: EnemyRank.Elite,
      aura: "element_edge",
      targetCue: "elite",
      animationIntensity: "medium",
    });
    expect(boss.rankVisual).toMatchObject({
      rank: EnemyRank.Boss,
      aura: "domain",
      targetCue: "boss",
      animationIntensity: "high",
    });
  });

  it("assigns every monster independent pending movement and combat asset ids", () => {
    const profiles = Object.values(BESTIARY).map(resolveMonsterVisualProfile);
    const movementAssetIds = new Set(
      profiles.map((profile) => profile.movementAssetId)
    );
    const combatAssetIds = new Set(
      profiles.map((profile) => profile.combatAssetId)
    );

    expect(
      profiles.filter((profile) => profile.productionReadySprite).map((profile) => profile.enemyId)
    ).toEqual(PRODUCTION_READY_MONSTER_IDS);
    expect(profiles.every((profile) => profile.paperCutRuntimeReady)).toBe(true);
    expect(movementAssetIds.size).toBe(profiles.length);
    expect(combatAssetIds.size).toBe(profiles.length);
    expect(
      profiles.every((profile) => profile.movementAssetId.includes(profile.enemyId))
    ).toBe(true);
    expect(
      profiles.every((profile) => profile.combatAssetId.includes(profile.enemyId))
    ).toBe(true);
    expect(
      profiles.filter(
        (profile) => !profile.movementAssetId || !profile.combatAssetId
      )
    ).toEqual([]);
    expect(
      profiles.every(
        (profile) =>
          profile.directionalMovement === "four_direction" &&
          profile.directionalCombat === "four_direction"
      )
    ).toBe(true);
  });
});
