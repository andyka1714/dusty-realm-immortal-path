import { describe, expect, it } from "vitest";
import { getCoreAttributeEffects } from "./attributeEffects";

describe("attributeEffects", () => {
  it("derives readable gameplay effects from comprehension, fortune, and charm", () => {
    const effects = getCoreAttributeEffects({
      comprehension: 40,
      fortune: 30,
      charm: 25,
    });

    expect(effects.breakthroughBonus).toBeCloseTo(8);
    expect(effects.cultivationSpeedBonus).toBeCloseTo(4);
    expect(effects.dropRateBonus).toBeCloseTo(3);
    expect(effects.encounterLuckBonus).toBeCloseTo(1.5);
    expect(effects.shopDiscountPercent).toBe(5);
    expect(effects.summaryLabels).toEqual(
      expect.arrayContaining([
        "悟性：突破 +8.0%",
        "福緣：掉落 +3.0%",
        "魅力：商店折扣 5%",
      ])
    );
  });
});
