import { describe, expect, it } from "vitest";
import {
  getRecoveryConsumableCooldownLabel,
  getRecoveryConsumableCooldownRemainingMs,
  getConsumableRecoveryBlockedReason,
  applyConsumableRecoveryEffects,
  RECOVERY_CONSUMABLE_COOLDOWN_MS,
} from "./consumableEffects";
import { ConsumableEffect } from "../types";

describe("consumable recovery effects", () => {
  const healHp: ConsumableEffect[] = [{ type: "heal_hp", value: 50 }];
  const healMp: ConsumableEffect[] = [{ type: "heal_mp", value: 30 }];
  const fullRestore: ConsumableEffect[] = [{ type: "full_restore", value: 0 }];

  it("blocks recovery consumables when the matching runtime resource is unavailable", () => {
    expect(getConsumableRecoveryBlockedReason(healHp, {})).toBe(
      "目前沒有可恢復的戰鬥氣血"
    );
    expect(getConsumableRecoveryBlockedReason(healMp, {})).toBe(
      "目前沒有可恢復的真元資源"
    );
    expect(getConsumableRecoveryBlockedReason(fullRestore, {})).toBe(
      "目前沒有可恢復的戰鬥氣血"
    );
  });

  it("blocks MP recovery when true essence is already full", () => {
    expect(
      getConsumableRecoveryBlockedReason(healMp, {
        mp: { current: 80, max: 80 },
      })
    ).toBe("真元已滿");
  });

  it("blocks HP recovery when the player is already full", () => {
    expect(
      getConsumableRecoveryBlockedReason(healHp, {
        hp: { current: 120, max: 120 },
      })
    ).toBe("氣血已滿");
  });

  it("applies heal_hp and full_restore only to supported visible resources", () => {
    expect(
      applyConsumableRecoveryEffects(healHp, {
        hp: { current: 40, max: 120 },
      })
    ).toMatchObject({
      appliedEffects: 1,
      hp: { current: 90, max: 120 },
    });

    expect(
      applyConsumableRecoveryEffects(healMp, {
        mp: { current: 20, max: 80 },
      })
    ).toMatchObject({
      appliedEffects: 1,
      mp: { current: 50, max: 80 },
    });

    expect(
      applyConsumableRecoveryEffects(fullRestore, {
        hp: { current: 40, max: 120 },
        mp: { current: 20, max: 80 },
      })
    ).toMatchObject({
      appliedEffects: 1,
      hp: { current: 120, max: 120 },
      mp: { current: 80, max: 80 },
    });
  });

  it("uses one shared five-second cooldown for recovery consumables", () => {
    expect(RECOVERY_CONSUMABLE_COOLDOWN_MS).toBe(5000);
    expect(getRecoveryConsumableCooldownRemainingMs(null, 10_000)).toBe(0);
    expect(getRecoveryConsumableCooldownRemainingMs(10_000, 10_000)).toBe(5000);
    expect(getRecoveryConsumableCooldownRemainingMs(10_000, 12_000)).toBe(3000);
    expect(getRecoveryConsumableCooldownRemainingMs(10_000, 15_001)).toBe(0);
    expect(getRecoveryConsumableCooldownLabel(3200)).toBe("冷卻 4 秒");
  });
});
