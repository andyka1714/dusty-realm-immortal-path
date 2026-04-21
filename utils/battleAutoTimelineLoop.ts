import { CombatLog, Enemy } from "../types";
import {
  resolveEnemyOffenseRoll,
  resolvePlayerOffenseRoll,
} from "./battleOffense";
import {
  resolveEnemyTurnAftermath,
  resolvePlayerActiveAftermath,
} from "./battleAftermath";
import {
  type CombatLoopFeatureFlags,
  type CombatRuntimeContext,
  resolveTurnStartMaintenance,
} from "./battleEncounter";
import {
  resolveEnemyTurnPhase,
  resolvePlayerTurnPhase,
} from "./battleTurnPhases";
import { isResolvedEnemyTurnPhaseResult } from "./battleTurnPhaseEnemyGuards";
import type { CombatLoopState } from "./battleTimeline";
import { buildCombatLoopState, buildCombatLoopStepResult } from "./battleTimeline";
import type { CombatStatusLike } from "./battleStatusTypes";
import type { PlayerCombatStats } from "./battleSystem";

const advanceCombatLoop = ({
  bossBroken,
  playerDebuffed,
  turn,
}: {
  bossBroken: boolean;
  playerDebuffed: boolean;
  turn: number;
}) => ({
  bossBroken: false,
  playerDebuffed: false,
  turn: turn + 1,
  exceededTurnLimit: turn + 1 > 500,
});

export const resolveCombatLoopStep = ({
  state,
  processStatusTicks,
  player,
  enemy,
  logs,
  runtimeContext,
  featureFlags,
}: {
  state: CombatLoopState<CombatStatusLike>;
  processStatusTicks: (currentMs: number) => void;
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  runtimeContext: CombatRuntimeContext;
  featureFlags: CombatLoopFeatureFlags;
}) => {
  const {
    passiveFlags,
    pVsE,
    activeSkill,
    playerAttackIntervalMs,
    enemyAttackIntervalMs,
  } = runtimeContext;
  const {
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
    hasSwordImmortalPassive,
    hasSwordHeartPassive,
  } = featureFlags;
  const nextState = buildCombatLoopState(state);
  let {
    turn,
    currentTimeMs,
    playerNextActionMs,
    enemyNextActionMs,
    activeSkillReadyAtMs,
    enemySpecialReadyAtMs,
    bossBroken,
    playerDebuffed,
    lastRegenTimeMs,
    playerHp,
    enemyHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    swordDeathWardUsed,
    bodyRebirthTrueUsed,
    bodyTribulationStacks,
    mageFoundationStacks,
    swordHeartStacks,
    playerDamagedSinceSwordHeartWindow,
    nextSwordImmortalGuardAtMs,
  } = nextState;

  const finalizeLoopStep = (combatEnded: boolean) => {
    Object.assign(nextState, {
      turn,
      currentTimeMs,
      playerNextActionMs,
      enemyNextActionMs,
      activeSkillReadyAtMs,
      enemySpecialReadyAtMs,
      bossBroken,
      playerDebuffed,
      lastRegenTimeMs,
      playerHp,
      enemyHp,
      playerMp,
      playerStatuses,
      enemyStatuses,
      swordDeathWardUsed,
      bodyRebirthTrueUsed,
      bodyTribulationStacks,
      mageFoundationStacks,
      swordHeartStacks,
      playerDamagedSinceSwordHeartWindow,
      nextSwordImmortalGuardAtMs,
    });

    return buildCombatLoopStepResult({
      combatEnded,
      state: nextState,
    });
  };

  const playerActsFirst = playerNextActionMs <= enemyNextActionMs;
  currentTimeMs = playerActsFirst ? playerNextActionMs : enemyNextActionMs;

  const { combatEnded } = resolveTurnStartMaintenance({
    currentTimeMs,
    turn,
    processStatusTicks,
    player,
    enemy,
    logs,
    getPlayerHp: () => playerHp,
    getPlayerMp: () => playerMp,
    setPlayerHp: (value) => {
      playerHp = value;
    },
    setPlayerMp: (value) => {
      playerMp = value;
    },
    getEnemyHp: () => enemyHp,
    getPlayerStatuses: () => playerStatuses,
    setPlayerStatuses: (value) => {
      playerStatuses = value;
    },
    getLastRegenTimeMs: () => lastRegenTimeMs,
    setLastRegenTimeMs: (value) => {
      lastRegenTimeMs = value;
    },
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
    hasBodyImmortalPassive,
    hasBodyAncientPassive,
  });

  if (combatEnded) {
    return finalizeLoopStep(true);
  }

  if (playerActsFirst) {
    ({
      enemyHp,
      playerHp,
      playerMp,
      playerStatuses,
      enemyStatuses,
      activeSkillReadyAtMs,
      mageFoundationStacks,
      playerNextActionMs,
      nextSwordImmortalGuardAtMs,
      bossBroken,
    } = resolvePlayerTurnPhase({
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
      dependencies: {
        resolvePlayerOffenseRoll,
        resolvePlayerActiveAftermath,
      },
    }));

    if (enemyHp <= 0) {
      return finalizeLoopStep(true);
    }
  } else {
    const enemyTurnResult = resolveEnemyTurnPhase({
      currentTimeMs,
      turn,
      player,
      enemy,
      logs,
      passiveFlags,
      playerStatuses,
      enemyStatuses,
      playerHp,
      playerMp,
      enemyHp,
      enemyAttackIntervalMs,
      enemySpecialReadyAtMs,
      swordDeathWardUsed,
      bodyTribulationStacks,
      bodyRebirthTrueUsed,
      hasSwordHeartPassive,
      playerDamagedSinceSwordHeartWindow,
      swordHeartStacks,
      dependencies: {
        resolveEnemyOffenseRoll,
        resolveEnemyTurnAftermath,
      },
    });

    if (!isResolvedEnemyTurnPhaseResult(enemyTurnResult)) {
      turn += 1;
      enemyNextActionMs = enemyTurnResult.enemyNextActionMs;
      swordHeartStacks = enemyTurnResult.swordHeartStacks;
      playerDamagedSinceSwordHeartWindow =
        enemyTurnResult.playerDamagedSinceSwordHeartWindow;
      return finalizeLoopStep(false);
    }

    ({
      playerHp,
      playerMp,
      enemyHp,
      playerStatuses,
      enemyStatuses,
      swordDeathWardUsed,
      bodyTribulationStacks,
      bodyRebirthTrueUsed,
      playerDamagedSinceSwordHeartWindow,
      swordHeartStacks,
      enemySpecialReadyAtMs,
      enemyNextActionMs,
    } = enemyTurnResult);
  }

  const turnAdvance = advanceCombatLoop({
    bossBroken,
    playerDebuffed,
    turn,
  });
  ({ bossBroken, playerDebuffed, turn } = turnAdvance);

  return finalizeLoopStep(turnAdvance.exceededTurnLimit);
};
