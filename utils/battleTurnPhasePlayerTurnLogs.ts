import { applyPlayerBaseLogs } from "./battleTurnPhasePlayerBaseLogs";
import { resolvePlayerResonanceCleanup } from "./battleTurnPhasePlayerResonanceCleanup";
import type { PlayerTurnLogArgs } from "./battleTurnPhasePlayerArgTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const applyPlayerTurnLogs = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  playerHp,
  playerStatuses,
  resolvedTurnContext,
  ...baseLogArgs
}: PlayerTurnLogArgs): CombatStatusLike[] => {
  applyPlayerBaseLogs({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    playerHp,
    playerStatuses,
    resolvedTurnContext,
    ...baseLogArgs,
  });

  return resolvePlayerResonanceCleanup({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    playerHp,
    playerStatuses,
    resolvedTurnContext,
  });
};
