import { describe, expect, it } from "vitest";
import { BOSS_ENEMIES } from "./boss";
import { ELITE_ENEMIES } from "./elite";

const HIGH_REALM_ELITE_IDS = [
  "m140_e1",
  "m140_e2",
  "m141_e1",
  "m141_e2",
  "m160_e1",
  "m160_e2",
  "m161_e2",
  "m170_e1",
  "m170_e2",
  "m171_e1",
  "m171_e2",
  "m180_e1",
  "m180_e2",
];

const HIGH_REALM_BOSS_IDS = [
  "m121_b1",
  "m131_b1",
  "m141_b1",
  "m151_b1",
  "m161_b1",
  "m171_b1",
  "m180_b1",
];

describe("high realm enemy theming", () => {
  it("gives late high-realm elites explicit descriptions and custom special attacks", () => {
    HIGH_REALM_ELITE_IDS.forEach((enemyId) => {
      const enemy = ELITE_ENEMIES[enemyId];

      expect(enemy.description, `${enemyId} 缺少主題描述`).toBeTruthy();
      expect(enemy.specialAttack, `${enemyId} 缺少主題特招`).toBeDefined();
      expect(enemy.affixes && enemy.affixes.length >= 2, `${enemyId} 詞綴不足`).toBe(true);
      expect(enemy.specialAttack?.name.endsWith("式殺招"), `${enemyId} 仍在使用預設特招名稱`).toBe(false);
    });
  });

  it("ensures every high-realm boss has bespoke theme hooks instead of only default templates", () => {
    HIGH_REALM_BOSS_IDS.forEach((enemyId) => {
      const enemy = BOSS_ENEMIES[enemyId];

      expect(enemy.description, `${enemyId} 缺少 Boss 描述`).toBeTruthy();
      expect(enemy.specialAttack, `${enemyId} 缺少 Boss 專屬特招`).toBeDefined();
      expect(enemy.affixes && enemy.affixes.length >= 3, `${enemyId} Boss 詞綴不足`).toBe(true);
      expect(enemy.specialAttack?.name.endsWith("式殺招"), `${enemyId} Boss 仍在使用預設特招名稱`).toBe(false);
    });
  });
});
