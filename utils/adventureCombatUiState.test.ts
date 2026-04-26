import { describe, expect, it } from "vitest";
import {
  resolveAdventureCombatUiState,
  resolveWorldCombatTargetSelection,
} from "./adventureCombatUiState";

describe("adventure combat UI state", () => {
  it("keeps combat-only controls out of safe maps", () => {
    expect(
      resolveAdventureCombatUiState({
        hasCombatEncounters: false,
        isInSeclusion: false,
        showIntro: false,
        isBattling: false,
        isMapModalOpen: false,
      })
    ).toEqual({
      hudActivityLabel: "城鎮中",
      showTopCombatControls: false,
      showCombatCommandSurface: false,
    });
  });

  it("shows combat controls only when the current map can spawn enemies", () => {
    expect(
      resolveAdventureCombatUiState({
        hasCombatEncounters: true,
        isInSeclusion: false,
        showIntro: false,
        isBattling: false,
        isMapModalOpen: false,
      })
    ).toEqual({
      hudActivityLabel: "歷練中",
      showTopCombatControls: true,
      showCombatCommandSurface: true,
    });
  });

  it("keeps the seclusion HUD label authoritative", () => {
    expect(
      resolveAdventureCombatUiState({
        hasCombatEncounters: true,
        isInSeclusion: true,
        showIntro: false,
        isBattling: false,
        isMapModalOpen: false,
      }).hudActivityLabel
    ).toBe("閉關中");
  });

  it("treats a clicked monster as an engaged world-combat target", () => {
    expect(
      resolveWorldCombatTargetSelection({
        clickedMonsterInstanceId: "monster-2",
        isAutoBattling: true,
      })
    ).toEqual({
      nextTargetMonsterId: "monster-2",
      nextWorldCombatTargetId: "monster-2",
      nextIsAutoBattling: true,
    });
  });

  it("stops auto-battle when the player intentionally clicks empty ground", () => {
    expect(
      resolveWorldCombatTargetSelection({
        clickedMonsterInstanceId: null,
        isAutoBattling: true,
      })
    ).toEqual({
      nextTargetMonsterId: null,
      nextWorldCombatTargetId: null,
      nextIsAutoBattling: false,
    });
  });
});
