import type {
  EnemyActionWindowResult,
  EnemyTurnPhaseResult,
  ResolvedEnemyActionWindow,
  ResolvedEnemyTurnPhaseResult,
} from "./battleTurnPhaseEnemyTypes";

export const isResolvedEnemyActionWindow = (
  enemyActionWindow: EnemyActionWindowResult
): enemyActionWindow is ResolvedEnemyActionWindow => !enemyActionWindow.skipped;

export const isResolvedEnemyTurnPhaseResult = (
  enemyTurnResult: EnemyTurnPhaseResult
): enemyTurnResult is ResolvedEnemyTurnPhaseResult => !enemyTurnResult.skipped;
