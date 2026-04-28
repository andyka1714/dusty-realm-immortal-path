import { describe, expect, it } from "vitest";
import { ElementType, EnemyRank, MajorRealm, ProfessionType } from "../types";
import type { Enemy } from "../types";
import type { PlayerCombatStats } from "./battleSystem";
import {
  calculateEnemyCombatPower,
  calculatePlayerCombatPower,
  getCharacterDerivedLevel,
} from "./combatPower";

const createPlayerStats = (
  overrides: Partial<PlayerCombatStats> = {}
): PlayerCombatStats => ({
  hp: 500,
  maxHp: 500,
  mp: 220,
  maxMp: 220,
  attack: 80,
  magic: 60,
  defense: 42,
  res: 35,
  speed: 18,
  crit: 3,
  critDamage: 165,
  dodge: 2,
  blockRate: 1,
  damageReduction: 0,
  alchemyBonus: 0,
  craftingBonus: 0,
  breakthroughBonus: 0,
  dropRateBonus: 0,
  cultivationSpeedBonus: 0,
  name: "闕月星稀",
  element: ElementType.Water,
  regenHp: 0,
  profession: ProfessionType.Sword,
  learnedSkills: [],
  ...overrides,
});

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => ({
  id: "threat",
  name: "荒徑野狗",
  realm: MajorRealm.Foundation,
  minorRealm: "初期",
  rank: EnemyRank.Common,
  aiStyle: "melee",
  hp: 1200,
  maxHp: 1200,
  attack: 100,
  defense: 50,
  element: ElementType.Earth,
  drops: [],
  exp: 120,
  ...overrides,
});

describe("combat power", () => {
  it("raises player combat power when existing battle stats improve", () => {
    const baseline = calculatePlayerCombatPower({
      stats: createPlayerStats(),
      majorRealm: MajorRealm.Foundation,
      minorRealm: 0,
    });
    const upgraded = calculatePlayerCombatPower({
      stats: createPlayerStats({
        maxHp: 720,
        hp: 720,
        attack: 110,
        defense: 68,
        crit: 8,
      }),
      majorRealm: MajorRealm.Foundation,
      minorRealm: 0,
    });

    expect(upgraded).toBeGreaterThan(baseline);
  });

  it("scales equal enemies by rank so boss exceeds elite and common", () => {
    const common = calculateEnemyCombatPower(createEnemy({ rank: EnemyRank.Common }));
    const elite = calculateEnemyCombatPower(createEnemy({ rank: EnemyRank.Elite }));
    const boss = calculateEnemyCombatPower(createEnemy({ rank: EnemyRank.Boss }));

    expect(elite).toBeGreaterThan(common);
    expect(boss).toBeGreaterThan(elite);
  });

  it("treats higher minor realm and special attacks as additional threat", () => {
    const early = calculateEnemyCombatPower(createEnemy({ minorRealm: "初期" }));
    const perfected = calculateEnemyCombatPower(createEnemy({ minorRealm: "圓滿" }));
    const withSpecial = calculateEnemyCombatPower(
      createEnemy({
        minorRealm: "圓滿",
        specialAttack: {
          name: "裂地撲殺",
          cooldownSeconds: 8,
          damageMultiplier: 1.4,
        },
      })
    );

    expect(perfected).toBeGreaterThan(early);
    expect(withSpecial).toBeGreaterThan(perfected);
  });

  it("derives display level from realm without persisted state", () => {
    expect(getCharacterDerivedLevel(MajorRealm.Mortal, 0)).toBe(1);
    expect(getCharacterDerivedLevel(MajorRealm.Foundation, 0)).toBe(21);
    expect(getCharacterDerivedLevel(MajorRealm.ImmortalEmperor, 9)).toBe(120);
  });
});
