import type { PlayerActionPhaseArgs } from "./battleTurnPhasePlayerArgTypes";
import { resolvePlayerPrelude } from "./battleTurnPhasePlayerPrelude";
import { resolvePlayerTurn } from "./battleTurnPhasePlayerTurn";
import type { ResolvePlayerActionPhaseResult } from "./battleTurnPhasePlayerTypes";

export const resolvePlayerActionPhase = ({
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
  nextSwordImmortalGuardAtMs,
  hasMageFusionPassive,
  hasSwordImmortalPassive,
  dependencies,
}: PlayerActionPhaseArgs): ResolvePlayerActionPhaseResult => {
  ({ playerStatuses, nextSwordImmortalGuardAtMs, bossBroken } =
    resolvePlayerPrelude({
      currentTimeMs,
      turn,
      player,
      enemy,
      logs,
      pVsE,
      bossBroken,
      playerHp,
      enemyHp,
      playerStatuses,
      nextSwordImmortalGuardAtMs,
      hasSwordImmortalPassive,
    }));

  const playerTurnResult = resolvePlayerTurn({
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
  });

  return {
    ...playerTurnResult,
    nextSwordImmortalGuardAtMs,
    bossBroken,
  };
};
