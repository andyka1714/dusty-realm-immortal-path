import { describe, expect, it } from "vitest";
import { ProfessionType } from "../types";
import { resolveNpcShopAffinity } from "./npcAffinity";

describe("npcAffinity", () => {
  it("derives deterministic attitude and shop discount from existing character and quest state", () => {
    const affinity = resolveNpcShopAffinity({
      shopId: "skill_shop_sword",
      charm: 34,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join", "sect_sword_task_04"],
    });

    expect(affinity.attitudeLabel).toBe("同道相助");
    expect(affinity.discountPercent).toBeGreaterThanOrEqual(10);
    expect(affinity.discountSources).toEqual(
      expect.arrayContaining(["魅力折扣", "宗門身份", "宗門功績"])
    );
    expect(affinity.applyDiscount(1000)).toBeLessThan(1000);
  });
});
