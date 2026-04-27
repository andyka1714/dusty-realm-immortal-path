import { describe, expect, it } from "vitest";
import {
  getConsumableRecoveryBlockedReason,
  applyConsumableRecoveryEffects,
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
      applyConsumableRecoveryEffects(fullRestore, {
        hp: { current: 40, max: 120 },
      })
    ).toMatchObject({
      appliedEffects: 1,
      hp: { current: 120, max: 120 },
    });
  });
});
