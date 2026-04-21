export type { PlayerTurnPhaseDependencies } from "./battleTurnPhasePlayerDependencyTypes";
export type { EnemyTurnPhaseDependencies } from "./battleTurnPhaseEnemyDependencyTypes";
import type { PlayerTurnPhaseDependencies } from "./battleTurnPhasePlayerDependencyTypes";
import type { EnemyTurnPhaseDependencies } from "./battleTurnPhaseEnemyDependencyTypes";

export type TurnPhaseDependencies =
  PlayerTurnPhaseDependencies & EnemyTurnPhaseDependencies;
