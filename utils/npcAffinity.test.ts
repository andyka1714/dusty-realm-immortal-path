import { describe, expect, it } from "vitest";
import { ProfessionType } from "../types";
import { resolveNpcInteractionAffinity, resolveNpcShopAffinity } from "./npcAffinity";

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

  it("merges persisted NPC and sect affinity with deterministic shop baseline", () => {
    const affinity = resolveNpcShopAffinity({
      shopId: "sect_shop_sword",
      npcId: "sect_sword_lingbao",
      charm: 10,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join"],
      persistedNpcAffinity: {
        sect_sword_lingbao: {
          value: 18,
          lastReason: "常客往來",
          updatedAt: 100,
        },
      },
      persistedSectAffinity: {
        sect_sword: {
          value: 12,
          lastReason: "宗門功績",
          updatedAt: 90,
        },
      },
    });

    expect(affinity.attitudeLabel).toBe("患難之交");
    expect(affinity.discountPercent).toBe(13);
    expect(affinity.discountSources).toEqual(
      expect.arrayContaining(["NPC 好感：常客往來", "宗門好感：宗門功績", "宗門身份"])
    );
  });

  it("resolves NPC modal relationship copy from persisted affinity", () => {
    const affinity = resolveNpcInteractionAffinity({
      npcId: "sect_mystic_envoy",
      sectId: "sect_mystic",
      persistedNpcAffinity: {
        sect_mystic_envoy: {
          value: 22,
          lastReason: "星詔問答",
          updatedAt: 200,
        },
      },
      persistedSectAffinity: {},
    });

    expect(affinity.attitudeLabel).toBe("患難之交");
    expect(affinity.sources).toContain("NPC 好感：星詔問答");
  });
});
