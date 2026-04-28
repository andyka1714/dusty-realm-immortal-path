import { describe, expect, it } from "vitest";
import { MajorRealm, SpiritRootId } from "../types";
import { buildBreakthroughPreview } from "./breakthroughPreview";

describe("breakthroughPreview", () => {
  it("surfaces success rate, tribulation risk, and preparation cues", () => {
    const preview = buildBreakthroughPreview({
      majorRealm: MajorRealm.Tribulation,
      minorRealm: 9,
      attributes: {
        physique: 12,
        rootBone: 12,
        insight: 18,
        comprehension: 35,
        fortune: 20,
        charm: 10,
      },
      spiritRootId: SpiritRootId.TRUE_WOOD_FIRE,
      hasRequiredItem: false,
      requiredItemName: "登仙丹",
    });

    expect(preview.isMajorBreakthrough).toBe(true);
    expect(preview.successRatePercent).toBeGreaterThan(0);
    expect(preview.riskLabel).toContain("天劫");
    expect(preview.preparationCues).toEqual(
      expect.arrayContaining(["缺少登仙丹", expect.stringContaining("悟性")])
    );
  });

  it("includes active breakthrough consequence in risk and preparation cues", () => {
    const preview = buildBreakthroughPreview({
      majorRealm: MajorRealm.Tribulation,
      minorRealm: 9,
      attributes: {
        physique: 12,
        rootBone: 12,
        insight: 18,
        comprehension: 35,
        fortune: 20,
        charm: 10,
      },
      spiritRootId: SpiritRootId.TRUE_WOOD_FIRE,
      hasRequiredItem: true,
      activeConsequence: {
        type: "heart_demon",
        severity: "major",
        remainingDays: 365,
        label: "心魔纏身",
        recoveryHint: "靜修或服用清心丹可降低影響。",
      },
    });

    expect(preview.riskLabel).toContain("心魔纏身");
    expect(preview.preparationCues).toEqual(
      expect.arrayContaining([expect.stringContaining("剩餘 365 天")])
    );
  });
});
