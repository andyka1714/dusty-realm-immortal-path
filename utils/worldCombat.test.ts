import { describe, expect, it } from "vitest";
import { EnemyRank, ElementType, MajorRealm, ProfessionType } from "../types";
import {
  getEnemyAggroRange,
  getEnemyEngagementRange,
  getEnemyPreferredDistance,
  getGridDistance,
  getPlayerEngagementRange,
  getWorldSkillAreaTargets,
  shouldEnemyHoldPreferredRange,
  shouldEnemyStrafeNearRange,
} from "./worldCombat";

describe("world combat ranges", () => {
  it("uses profession-based player engagement range", () => {
    expect(getPlayerEngagementRange(ProfessionType.Sword)).toBe(1);
    expect(getPlayerEngagementRange(ProfessionType.Body)).toBe(1);
    expect(getPlayerEngagementRange(ProfessionType.Mage)).toBe(3);
  });

  it("supports enemy-specific attack range overrides", () => {
    const rangedEnemy = {
      id: "test",
      name: "遠程妖物",
      realm: MajorRealm.QiRefining,
      rank: EnemyRank.Elite,
      attackRange: 4,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      element: ElementType.Water,
      drops: [],
      exp: 10,
    };

    expect(getEnemyEngagementRange(rangedEnemy)).toBe(4);
    expect(getEnemyAggroRange(rangedEnemy)).toBe(8);
  });

  it("calculates map distance with Manhattan range", () => {
    expect(getGridDistance({ x: 20, y: 20 }, { x: 23, y: 21 })).toBe(4);
  });

  it("gives caster enemies a longer preferred spacing and strafe window", () => {
    const casterEnemy = {
      id: "caster",
      name: "法術妖物",
      realm: MajorRealm.QiRefining,
      rank: EnemyRank.Elite,
      aiStyle: "caster" as const,
      attackRange: 3,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      element: ElementType.Water,
      drops: [],
      exp: 10,
    };

    expect(getEnemyPreferredDistance(casterEnemy)).toBe(5);
    expect(shouldEnemyHoldPreferredRange(casterEnemy, 5)).toBe(true);
    expect(shouldEnemyStrafeNearRange(casterEnemy, 4)).toBe(true);
    expect(shouldEnemyStrafeNearRange(casterEnemy, 2)).toBe(false);
  });

  it("selects nearby monsters for circular world-skill AOE", () => {
    const monsters = [
      { instanceId: "a", templateId: "t1", name: "甲", x: 5, y: 5, spawnX: 5, spawnY: 5, currentHp: 100, rank: EnemyRank.Common },
      { instanceId: "b", templateId: "t2", name: "乙", x: 6, y: 5, spawnX: 6, spawnY: 5, currentHp: 100, rank: EnemyRank.Common },
      { instanceId: "c", templateId: "t3", name: "丙", x: 9, y: 5, spawnX: 9, spawnY: 5, currentHp: 100, rank: EnemyRank.Common },
    ];

    const hits = getWorldSkillAreaTargets({
      origin: { x: 3, y: 5 },
      primaryTarget: { x: 5, y: 5 },
      monsters,
      primaryTargetId: "a",
      areaShape: "circle",
      areaRadius: 2,
      maxTargets: 3,
    });

    expect(hits.map((monster) => monster.instanceId)).toEqual(["a", "b"]);
  });

  it("uses line and cone geometry to filter world-skill AOE targets", () => {
    const monsters = [
      { instanceId: "primary", templateId: "t1", name: "主目標", x: 5, y: 5, spawnX: 5, spawnY: 5, currentHp: 100, rank: EnemyRank.Common },
      { instanceId: "inline", templateId: "t2", name: "直線怪", x: 7, y: 5, spawnX: 7, spawnY: 5, currentHp: 100, rank: EnemyRank.Common },
      { instanceId: "off", templateId: "t3", name: "偏移怪", x: 7, y: 7, spawnX: 7, spawnY: 7, currentHp: 100, rank: EnemyRank.Common },
    ];

    const lineHits = getWorldSkillAreaTargets({
      origin: { x: 3, y: 5 },
      primaryTarget: { x: 5, y: 5 },
      monsters,
      primaryTargetId: "primary",
      areaShape: "line",
      areaRadius: 1,
      maxTargets: 3,
    });
    expect(lineHits.map((monster) => monster.instanceId)).toEqual(["primary", "inline"]);

    const coneHits = getWorldSkillAreaTargets({
      origin: { x: 3, y: 5 },
      primaryTarget: { x: 5, y: 5 },
      monsters,
      primaryTargetId: "primary",
      areaShape: "cone",
      areaRadius: 3,
      maxTargets: 3,
    });
    expect(coneHits.map((monster) => monster.instanceId)).toEqual(["primary", "inline", "off"]);
  });
});
