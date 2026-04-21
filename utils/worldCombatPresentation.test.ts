import { describe, expect, it } from "vitest";
import { EnemyRank, ElementType, MajorRealm, ProfessionType } from "../types";
import {
  formatCombatCountdown,
  getWorldProjectileTravelDurationMs,
  resolveCombatCadencePresentation,
  resolveWorldCombatStatusCues,
  resolveWorldCombatTargetPresentation,
} from "./worldCombatPresentation";

describe("world combat presentation", () => {
  it("formats combat countdowns and cadence fills", () => {
    expect(formatCombatCountdown(950)).toBe("0.9s");

    const cadence = resolveCombatCadencePresentation({
      now: 1000,
      readyAtMs: 1600,
      totalMs: 1200,
    });

    expect(cadence.ready).toBe(false);
    expect(cadence.remainingMs).toBe(600);
    expect(cadence.fillPercent).toBe(50);
    expect(cadence.label).toBe("0.6s");
  });

  it("scales projectile travel time by actual map distance", () => {
    const closeTravel = getWorldProjectileTravelDurationMs({
      source: { x: 1, y: 1 },
      target: { x: 2, y: 1 },
      executionTimeMs: 480,
    });
    const farTravel = getWorldProjectileTravelDurationMs({
      source: { x: 1, y: 1 },
      target: { x: 6, y: 1 },
      executionTimeMs: 480,
    });

    expect(closeTravel).toBeLessThan(farTravel);
    expect(farTravel).toBeLessThanOrEqual(480);
  });

  it("surfaces caster spacing intent and boss special telegraphs", () => {
    const bossCaster = {
      id: "boss",
      name: "靈湖水蛟",
      realm: MajorRealm.SpiritSevering,
      rank: EnemyRank.Boss,
      aiStyle: "caster" as const,
      attackRange: 5,
      hp: 5000,
      maxHp: 5000,
      attack: 300,
      defense: 140,
      element: ElementType.Water,
      drops: [],
      exp: 500,
      specialAttack: {
        name: "怒潮龍息",
        cooldownSeconds: 8,
        castTimeMs: 900,
        areaShape: "circle" as const,
        areaRadius: 2,
      },
    };

    const presentation = resolveWorldCombatTargetPresentation({
      now: 5000,
      distance: 6,
      playerEngagementRange: 3,
      profession: ProfessionType.Mage,
      playerSpeed: 18,
      playerActionReadyAt: 5400,
      playerSkillReadyAt: 6200,
      playerSkillTotalMs: 3000,
      enemy: bossCaster,
      enemyActionReadyAt: 5600,
      enemySpecialReadyAt: 5200,
      worldCombatTargetId: "boss-1",
      targetMonsterInstanceId: "boss-1",
      isAutoBattling: true,
      playerStatusNames: ["護盾"],
      enemyStatusNames: ["易傷", "凍結"],
      recentMessage: "怒潮龍息正在蓄力。",
    });

    expect(presentation.shouldHoldPreferredRange).toBe(true);
    expect(presentation.intentLabel).toBe("維持施法距離");
    expect(presentation.rolePresentation.label).toBe("Boss 危險節奏");
    expect(presentation.enemyStatusCues[0].label).toBe("凍結");
    expect(presentation.recentEventCue.label).toContain("怒潮龍息");
    expect(presentation.stagePresentation.showEnemyPreferredRing).toBe(true);
    expect(presentation.stagePresentation.bossTelegraphRadius).toBe(2);
    expect(presentation.stagePresentation.enemyChargeState).toBe("channeling");

    const readyPresentation = resolveWorldCombatTargetPresentation({
      now: 7000,
      distance: 4,
      playerEngagementRange: 3,
      profession: ProfessionType.Mage,
      playerSpeed: 18,
      playerActionReadyAt: 5400,
      playerSkillReadyAt: 6200,
      playerSkillTotalMs: 3000,
      enemy: bossCaster,
      enemyActionReadyAt: 5600,
      enemySpecialReadyAt: 6800,
      worldCombatTargetId: "boss-1",
      targetMonsterInstanceId: "boss-1",
      isAutoBattling: true,
      recentMessage: "怒潮龍息即將落下。",
    });

    expect(readyPresentation.enemySpecial?.ready).toBe(true);
    expect(readyPresentation.intentTone).toBe("ready");
    expect(readyPresentation.intentLabel).toContain("怒潮龍息");
    expect(readyPresentation.recentEventCue.label).toContain("怒潮龍息");
    expect(readyPresentation.stagePresentation.bossTelegraphState).toBe("ready");
  });

  it("keeps melee enemies focused on close pursuit without ranged spacing rings", () => {
    const meleeEnemy = {
      id: "wolf",
      name: "裂爪妖狼",
      realm: MajorRealm.Foundation,
      rank: EnemyRank.Elite,
      aiStyle: "melee" as const,
      attackRange: 1,
      hp: 600,
      maxHp: 600,
      attack: 80,
      defense: 40,
      element: ElementType.None,
      drops: [],
      exp: 40,
    };

    const presentation = resolveWorldCombatTargetPresentation({
      now: 2000,
      distance: 4,
      playerEngagementRange: 1,
      profession: ProfessionType.Sword,
      playerSpeed: 15,
      playerActionReadyAt: 2100,
      playerSkillReadyAt: 2100,
      enemy: meleeEnemy,
      enemyActionReadyAt: 2600,
      worldCombatTargetId: null,
      targetMonsterInstanceId: "wolf-1",
      isAutoBattling: false,
      recentMessage: "裂爪妖狼猛撲而上。",
    });

    expect(presentation.intentLabel).toBe("近身追擊");
    expect(presentation.rolePresentation.label).toBe("近戰壓迫");
    expect(presentation.stagePresentation.showEnemyDangerFill).toBe(true);
    expect(presentation.stagePresentation.showEnemyPreferredRing).toBe(false);
    expect(presentation.stagePresentation.showEnemyAggroRing).toBe(false);
  });

  it("surfaces control and immunity cues from world-combat statuses and messages", () => {
    const enemyStatusCues = resolveWorldCombatStatusCues({
      statuses: ["凍結", "易傷", "誅仙劍陣"],
      owner: "enemy",
    });
    const playerStatusCues = resolveWorldCombatStatusCues({
      statuses: ["獸神附體", "護盾"],
      owner: "player",
    });

    expect(enemyStatusCues.map((cue) => cue.label)).toEqual(["凍結", "易傷", "誅仙劍陣"]);
    expect(enemyStatusCues[0].timingLabel).toBe("凍結中");
    expect(playerStatusCues[0].label).toBe("護盾");
    expect(playerStatusCues[1].label).toBe("獸神附體");

    const rangedEnemy = {
      id: "hawk",
      name: "裂羽獵妖",
      realm: MajorRealm.GoldenCore,
      rank: EnemyRank.Elite,
      aiStyle: "ranged" as const,
      attackRange: 4,
      hp: 900,
      maxHp: 900,
      attack: 120,
      defense: 55,
      element: ElementType.Fire,
      drops: [],
      exp: 120,
    };

    const presentation = resolveWorldCombatTargetPresentation({
      now: 3000,
      distance: 3,
      playerEngagementRange: 1,
      profession: ProfessionType.Sword,
      playerSpeed: 16,
      playerActionReadyAt: 3400,
      playerSkillReadyAt: 4200,
      playerSkillTotalMs: 2600,
      enemy: rangedEnemy,
      enemyActionReadyAt: 3600,
      worldCombatTargetId: "hawk-1",
      targetMonsterInstanceId: "hawk-1",
      isAutoBattling: false,
      playerStatusNames: ["獸神附體"],
      enemyStatusNames: ["麻痺"],
      recentMessage: "【獸神附體】獸魂狂潮撕碎了控制侵蝕。",
    });

    expect(presentation.shouldRetreatFromCloseRange).toBe(true);
    expect(presentation.recentEventCue.label).toBe("控制免疫");
    expect(presentation.stagePresentation.showEnemyRetreatBand).toBe(true);
    expect(presentation.playerStatusCues.some((cue) => cue.label === "獸神附體")).toBe(true);
  });
});
