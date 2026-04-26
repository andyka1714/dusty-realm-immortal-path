export interface AdventureCombatUiStateInput {
  hasCombatEncounters: boolean;
  isInSeclusion: boolean;
  showIntro: boolean;
  isBattling: boolean;
  isMapModalOpen: boolean;
}

export const resolveAdventureCombatUiState = ({
  hasCombatEncounters,
  isInSeclusion,
  showIntro,
  isBattling,
  isMapModalOpen,
}: AdventureCombatUiStateInput) => {
  const showTopCombatControls = hasCombatEncounters && !showIntro;

  return {
    hudActivityLabel: isInSeclusion
      ? "閉關中"
      : hasCombatEncounters
        ? "歷練中"
        : "城鎮中",
    showTopCombatControls,
    showCombatCommandSurface:
      showTopCombatControls && !isBattling && !isMapModalOpen,
  };
};

export interface WorldCombatTargetSelectionInput {
  clickedMonsterInstanceId: string | null;
  isAutoBattling: boolean;
}

export const resolveWorldCombatTargetSelection = ({
  clickedMonsterInstanceId,
  isAutoBattling,
}: WorldCombatTargetSelectionInput) => {
  if (clickedMonsterInstanceId) {
    return {
      nextTargetMonsterId: clickedMonsterInstanceId,
      nextWorldCombatTargetId: clickedMonsterInstanceId,
      nextIsAutoBattling: isAutoBattling,
    };
  }

  return {
    nextTargetMonsterId: null,
    nextWorldCombatTargetId: null,
    nextIsAutoBattling: false,
  };
};
