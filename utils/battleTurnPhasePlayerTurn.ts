import type { PlayerTurnArgs } from "./battleTurnPhasePlayerArgTypes";
import type { ResolvePlayerTurnResult } from "./battleTurnPhasePlayerTypes";
import { resolvePlayerTurnContext } from "./battleTurnPhasePlayerContext";
import { applyPlayerTurnLogs } from "./battleTurnPhasePlayerTurnLogs";
import { resolvePlayerTurnOutcome } from "./battleTurnPhasePlayerTurnOutcome";

export const resolvePlayerTurn = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  pVsE,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  playerAttackIntervalMs,
  hasMageFusionPassive,
  dependencies,
}: PlayerTurnArgs): ResolvePlayerTurnResult => {
  const resolvedTurnContext = resolvePlayerTurnContext({
    player,
    enemy,
    activeSkill,
    currentTimeMs,
    activeSkillReadyAtMs,
    playerMp,
    hasMageFusionPassive,
    passiveFlags,
    bossBroken,
    playerDebuffed,
    playerHp,
    enemyHp,
    playerStatuses,
    enemyStatuses,
    mageFoundationStacks,
    swordHeartStacks,
    playerAttackIntervalMs,
    turn,
    logs,
    pVsE,
    dependencies,
  });

  playerStatuses = applyPlayerTurnLogs({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    playerHp,
    playerStatuses,
    activeSkill,
    resolvedTurnContext,
  });

  return resolvePlayerTurnOutcome({
    currentTimeMs,
    turn,
    player,
    enemy,
    logs,
    passiveFlags,
    playerHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    activeSkill,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    playerAttackIntervalMs,
    resolvedTurnContext,
    dependencies,
  });
};
