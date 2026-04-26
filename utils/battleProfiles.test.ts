import { describe, expect, it } from "vitest";
import { EnemyRank, ElementType, MajorRealm, ProfessionType } from "../types";
import {
  getEnemyAttackIntervalMs,
  getPlayerAttackIntervalMs,
} from "./battleProfiles";

describe("battle timeline profiles", () => {
  it("derives player basic attack interval from profession and speed", () => {
    expect(
      getPlayerAttackIntervalMs({
        profession: ProfessionType.Sword,
        speed: 0,
      })
    ).toBe(1280);

    expect(
      getPlayerAttackIntervalMs({
        profession: ProfessionType.Sword,
        speed: 10,
      })
    ).toBe(1140);

    expect(
      getPlayerAttackIntervalMs({
        profession: ProfessionType.Sword,
        speed: 999,
      })
    ).toBe(760);
  });

  it("derives enemy basic attack interval from rank, range, and swift affix", () => {
    const commonEnemy = {
      id: "common",
      name: "野獸",
      realm: MajorRealm.Mortal,
      rank: EnemyRank.Common,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      element: ElementType.None,
      drops: [],
      exp: 1,
    };

    expect(getEnemyAttackIntervalMs(commonEnemy)).toBe(1550);
    expect(
      getEnemyAttackIntervalMs({
        ...commonEnemy,
        rank: EnemyRank.Elite,
        attackRange: 3,
      })
    ).toBe(1500);
    expect(
      getEnemyAttackIntervalMs({
        ...commonEnemy,
        rank: EnemyRank.Boss,
        affixes: ["迅影"],
      })
    ).toBe(1140);
  });
});
