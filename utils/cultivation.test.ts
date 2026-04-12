import { describe, expect, it } from "vitest";
import { MajorRealm, SpiritRootId } from "../types";
import {
  calculateSeclusionCost,
  getBaseCultivationRate,
  getManualCultivationGain,
  getPassiveCultivationRate,
} from "./cultivation";

const baseInput = {
  rootBone: 10,
  majorRealm: MajorRealm.Mortal,
  spiritRootId: SpiritRootId.MIXED_FIVE,
  gatheringLevel: 1,
};

describe("cultivation helpers", () => {
  it("uses a consistent passive rate formula", () => {
    expect(getBaseCultivationRate(baseInput)).toBe(10.5);
    expect(getPassiveCultivationRate(baseInput, false)).toBe(0.21);
    expect(getPassiveCultivationRate(baseInput, true)).toBe(2.1);
  });

  it("uses the same base formula for manual cultivation", () => {
    expect(getManualCultivationGain(baseInput, false)).toBeCloseTo(0.63);
    expect(getManualCultivationGain(baseInput, true)).toBeCloseTo(6.3);
  });

  it("calculates seclusion cost by realm and minor realm", () => {
    expect(calculateSeclusionCost(MajorRealm.Mortal, 0)).toBe(100);
    expect(calculateSeclusionCost(MajorRealm.Foundation, 3)).toBe(3250);
  });
});
