import { describe, expect, it, vi } from "vitest";
import { BREAKTHROUGH_CONFIG } from "../constants";
import { BOSS_ENEMIES } from "./enemies/boss";
import { ITEMS } from "./items";
import { EnemyRank, ItemCategory, MajorRealm } from "../types";
import { generateDrops } from "../utils/dropSystem";

describe("breakthrough item drops", () => {
  it("keeps every major realm breakthrough item in the catalog and on same-realm boss drops", () => {
    Object.values(MajorRealm)
      .filter((realm): realm is MajorRealm => typeof realm === "number")
      .filter((realm) => realm < MajorRealm.ImmortalEmperor)
      .forEach((realm) => {
        const requiredItemId = BREAKTHROUGH_CONFIG[realm].requiredItemId;
        expect(requiredItemId, `realm ${realm} required item`).toBeDefined();

        const item = requiredItemId ? ITEMS[requiredItemId] : undefined;
        expect(item, `${requiredItemId} should exist`).toBeDefined();
        expect(item?.category, `${requiredItemId} should be breakthrough`).toBe(
          ItemCategory.Breakthrough
        );

        const sameRealmBosses = Object.values(BOSS_ENEMIES).filter(
          (enemy) => enemy.realm === realm && enemy.rank === EnemyRank.Boss
        );
        expect(sameRealmBosses.length, `realm ${realm} bosses`).toBeGreaterThan(0);
        expect(
          sameRealmBosses.some((enemy) => enemy.drops.includes(requiredItemId!)),
          `${requiredItemId} should drop from same-realm boss`
        ).toBe(true);
      });
  });

  it("guarantees boss breakthrough items even when random rolls pick other drops", () => {
    const boss = Object.values(BOSS_ENEMIES).find((enemy) =>
      enemy.drops.includes("bt_qi_foundation")
    );
    expect(boss).toBeDefined();

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    const drops = generateDrops(boss!);
    randomSpy.mockRestore();

    expect(drops).toContainEqual({ itemId: "bt_qi_foundation", count: 1 });
  });
});
