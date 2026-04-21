import {
  logPlayerSwordResonance,
} from "./battleTurnPhasePlayerResonanceLogs";
import type { PlayerResonanceCleanupArgs } from "./battleTurnPhasePlayerArgTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const resolvePlayerResonanceCleanup = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  playerHp,
  playerStatuses,
  resolvedTurnContext,
}: PlayerResonanceCleanupArgs): CombatStatusLike[] => {
  const {
    skillReady,
    activeSkillCanonicalId,
    activeSwordQiStatuses,
    hasSwordQiChain,
    enemyHp,
  } = resolvedTurnContext;

  if (
    logPlayerSwordResonance({
      skillReady,
      activeSkillCanonicalId,
      activeSwordQiStatuses,
      hasSwordQiChain,
      currentTimeMs,
      logs,
      turn,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    })
  ) {
    return playerStatuses.filter(
      (status) =>
        !(
          status.kind === "critBoost" &&
          status.expiresAtMs > currentTimeMs
        )
    );
  }

  return playerStatuses;
};
