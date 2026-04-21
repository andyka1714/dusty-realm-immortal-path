import {
  WorldCombatAutoTargetContext,
  resolveWorldCombatAutoTarget,
} from "./battleWorldCombatAutoTarget";
import {
  WorldCombatActionWindow,
  resolveWorldCombatActionWindow,
} from "./battleWorldCombatActionWindow";
import {
  WorldCombatEnemyActionConfig,
  WorldCombatEnemyActionRunner,
  WorldCombatPlayerActionConfig,
  WorldCombatPlayerActionRunner,
  runWorldEnemyCombatAction,
  runWorldPlayerCombatAction,
} from "./battleWorldCombatActions";

export interface WorldCombatControllerFrameResult {
  nextTargetMonsterId: string | null;
  actionWindow: WorldCombatActionWindow | null;
}

export const runWorldCombatControllerStep = <
  TTarget,
  TSkill,
  TPlayerStrike extends { executionTimeMs: number },
  TEnemyStrike extends { executionTimeMs: number },
>({
  now = Date.now(),
  distance,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  primaryActiveSkill,
  isAutoBattling,
  worldCombatTargetId,
  targetedMonsterInstanceId,
  enemyEngagementRange,
  enemyActionReadyAt,
  enemySpecialReadyAt,
  playerAction,
  enemyAction,
}: {
  now?: number;
  distance: number;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  primaryActiveSkill?: TSkill;
  isAutoBattling: boolean;
  worldCombatTargetId: string | null;
  targetedMonsterInstanceId: string;
  enemyEngagementRange: number;
  enemyActionReadyAt: number;
  enemySpecialReadyAt: number;
  playerAction:
    | WorldCombatPlayerActionRunner
    | WorldCombatPlayerActionConfig<TTarget, TSkill, TPlayerStrike>;
  enemyAction:
    | WorldCombatEnemyActionRunner
    | WorldCombatEnemyActionConfig<TEnemyStrike>;
}) => {
  const actionWindow = resolveWorldCombatActionWindow({
    now,
    distance,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    hasPrimaryActiveSkill: Boolean(primaryActiveSkill),
    isAutoBattling,
    worldCombatTargetId,
    targetedMonsterInstanceId,
    enemyEngagementRange,
    enemyActionReadyAt,
  });

  if (actionWindow.shouldPlayerAct) {
    if ("run" in playerAction) {
      playerAction.run(actionWindow.usePlayerSkill);
    } else {
      runWorldPlayerCombatAction({
        readyAt: playerActionReadyAt,
        canExecute: playerAction.canExecute,
        target: playerAction.target,
        primaryActiveSkill,
        playerSkillReadyAt,
        useSkill: actionWindow.usePlayerSkill,
        resolveStrike: playerAction.resolveStrike,
        timerSet: playerAction.timerSet,
        applyCastEffect: playerAction.applyCastEffect,
        applyPreview: playerAction.applyPreview,
        execute: playerAction.execute,
      });
    }
  }

  if (actionWindow.shouldEnemyAct) {
    if ("run" in enemyAction) {
      enemyAction.run();
    } else {
      runWorldEnemyCombatAction({
        canExecute: enemyAction.canExecute,
        enemySpecialReadyAt,
        resolveStrike: enemyAction.resolveStrike,
        timerSet: enemyAction.timerSet,
        applyCastEffect: enemyAction.applyCastEffect,
        applyPreview: enemyAction.applyPreview,
        execute: enemyAction.execute,
      });
    }
  }

  return actionWindow;
};

export const runWorldCombatControllerFrame = <
  TTarget,
  TSkill,
  TPlayerStrike extends { executionTimeMs: number },
  TEnemyStrike extends { executionTimeMs: number },
>({
  autoTarget,
  combatStep,
}: {
  autoTarget: WorldCombatAutoTargetContext<TTarget>;
  combatStep?: {
    now?: number;
    distance: number;
    playerEngagementRange: number;
    playerActionReadyAt: number;
    playerSkillReadyAt: number;
    primaryActiveSkill?: TSkill;
    isAutoBattling: boolean;
    worldCombatTargetId: string | null;
    targetedMonsterInstanceId: string;
    enemyEngagementRange: number;
    enemyActionReadyAt: number;
    enemySpecialReadyAt: number;
    playerAction:
      | WorldCombatPlayerActionRunner
      | WorldCombatPlayerActionConfig<TTarget, TSkill, TPlayerStrike>;
    enemyAction:
      | WorldCombatEnemyActionRunner
      | WorldCombatEnemyActionConfig<TEnemyStrike>;
  };
}): WorldCombatControllerFrameResult => ({
  nextTargetMonsterId: resolveWorldCombatAutoTarget(autoTarget),
  actionWindow: combatStep ? runWorldCombatControllerStep(combatStep) : null,
});
