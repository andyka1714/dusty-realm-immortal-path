import { describe, expect, it } from "vitest";
import {
  WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
  resolveWorldPlayerResourceRecovery,
} from "./worldPlayerResourceRecovery";

const baseAttributes = {
  physique: 20,
  rootBone: 30,
  insight: 40,
  comprehension: 50,
  fortune: 10,
  charm: 10,
};

describe("worldPlayerResourceRecovery", () => {
  it("does not recover before the 5 second recovery interval", () => {
    const result = resolveWorldPlayerResourceRecovery({
      now: 4_999,
      lastRecoveredAt: 0,
      hp: { current: 100, max: 1_000 },
      mp: { current: 50, max: 500 },
      attributes: baseAttributes,
      regenHp: 25,
    });

    expect(result.didRecover).toBe(false);
    expect(result.nextRecoveredAt).toBe(0);
    expect(result.hp.current).toBe(100);
    expect(result.mp.current).toBe(50);
  });

  it("recovers HP from base amount, attributes, and regenHp every 5 seconds", () => {
    const result = resolveWorldPlayerResourceRecovery({
      now: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
      lastRecoveredAt: 0,
      hp: { current: 100, max: 1_000 },
      mp: { current: 500, max: 500 },
      attributes: baseAttributes,
      regenHp: 25,
    });

    expect(result.didRecover).toBe(true);
    expect(result.nextRecoveredAt).toBe(WORLD_RESOURCE_RECOVERY_INTERVAL_MS);
    expect(result.hp.recovered).toBe(55);
    expect(result.hp.current).toBe(155);
  });

  it("recovers MP from base amount and attributes every 5 seconds", () => {
    const result = resolveWorldPlayerResourceRecovery({
      now: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
      lastRecoveredAt: 0,
      hp: { current: 1_000, max: 1_000 },
      mp: { current: 50, max: 500 },
      attributes: baseAttributes,
      regenHp: 0,
    });

    expect(result.mp.recovered).toBe(28);
    expect(result.mp.current).toBe(78);
  });

  it("clamps recovery at max resources", () => {
    const result = resolveWorldPlayerResourceRecovery({
      now: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
      lastRecoveredAt: 0,
      hp: { current: 990, max: 1_000 },
      mp: { current: 495, max: 500 },
      attributes: baseAttributes,
      regenHp: 25,
    });

    expect(result.hp.current).toBe(1_000);
    expect(result.hp.recovered).toBe(10);
    expect(result.mp.current).toBe(500);
    expect(result.mp.recovered).toBe(5);
  });

  it("adds active runtime recovery effects and ignores expired effects", () => {
    const result = resolveWorldPlayerResourceRecovery({
      now: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
      lastRecoveredAt: 0,
      hp: { current: 100, max: 5_000 },
      mp: { current: 50, max: 1_000 },
      attributes: baseAttributes,
      regenHp: 0,
      recoveryEffects: [
        {
          id: "hp-pill-over-time",
          resource: "hp",
          amountPerTick: 2_000,
          tickIntervalMs: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
          expiresAtMs: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
          source: "consumable",
        },
        {
          id: "expired-mp-pill",
          resource: "mp",
          amountPerTick: 300,
          tickIntervalMs: WORLD_RESOURCE_RECOVERY_INTERVAL_MS,
          expiresAtMs: WORLD_RESOURCE_RECOVERY_INTERVAL_MS - 1,
          source: "consumable",
        },
      ],
    });

    expect(result.hp.current).toBe(2_210);
    expect(result.hp.recovered).toBe(2_110);
    expect(result.mp.current).toBe(93);
    expect(result.mp.recovered).toBe(43);
  });
});
