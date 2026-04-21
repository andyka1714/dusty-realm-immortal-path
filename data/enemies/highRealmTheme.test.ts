import { describe, expect, it } from "vitest";
import { MajorRealm } from "../../types";
import { getEquipmentRealmAudit } from "../items/equipment/audit";
import { BOSS_ENEMIES } from "./boss";
import { ELITE_ENEMIES } from "./elite";

const HIGH_REALM_ELITE_IDS = [
  "m122_e1",
  "m122_e2",
  "m132_e1",
  "m132_e2",
  "m140_e1",
  "m140_e2",
  "m142_e1",
  "m142_e2",
  "m141_e1",
  "m141_e2",
  "m152_e1",
  "m152_e2",
  "m160_e1",
  "m160_e2",
  "m162_e1",
  "m162_e2",
  "m161_e2",
  "m170_e1",
  "m170_e2",
  "m172_e1",
  "m172_e2",
  "m171_e1",
  "m171_e2",
  "m181_e1",
  "m181_e2",
  "m182_e1",
  "m182_e2",
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

  it("keeps emperor pressure-route elites on distinct dual-theme drop pools", () => {
    const audit = getEquipmentRealmAudit(MajorRealm.ImmortalEmperor);
    expect(audit).toBeDefined();

    const swordMageItemIds = [
      ...(audit?.paths.sword?.itemIds || []),
      ...(audit?.paths.mage?.itemIds || []),
    ];
    const bodyMageItemIds = [
      ...(audit?.paths.body?.itemIds || []),
      ...(audit?.paths.mage?.itemIds || []),
    ];

    const outerRingElite = ELITE_ENEMIES.m181_e1;
    const riftRouteElite = ELITE_ENEMIES.m182_e1;

    expect(outerRingElite.drops.every((itemId) => swordMageItemIds.includes(itemId))).toBe(true);
    expect(
      outerRingElite.drops.some((itemId) => audit?.paths.sword?.itemIds.includes(itemId))
    ).toBe(true);
    expect(
      outerRingElite.drops.some((itemId) => audit?.paths.mage?.itemIds.includes(itemId))
    ).toBe(true);

    expect(riftRouteElite.drops.every((itemId) => bodyMageItemIds.includes(itemId))).toBe(true);
    expect(
      riftRouteElite.drops.some((itemId) => audit?.paths.body?.itemIds.includes(itemId))
    ).toBe(true);
    expect(
      riftRouteElite.drops.some((itemId) => audit?.paths.mage?.itemIds.includes(itemId))
    ).toBe(true);
    expect(outerRingElite.drops).not.toEqual(riftRouteElite.drops);
  });
});
