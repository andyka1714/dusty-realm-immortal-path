import type { CombatLog, Enemy } from "../types";
import type { PlayerPassiveFlags } from "./battlePassives";
import type { EnemyTurnPhaseDependencies } from "./battleTurnPhaseEnemyDependencyTypes";
import type { CombatStatusLike } from "./battleStatusTypes";
import type {
  EnemyActionWindowResult,
  ResolvedEnemyActionWindow,
} from "./battleTurnPhaseEnemyTypes";
import type { PlayerCombatStatsLike } from "./battleTurnPhaseSharedTypes";

export type EnemyActionWindowArgs = {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyAttackIntervalMs: number;
  enemySpecialReadyAtMs: number;
  bodyTribulationStacks: number;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  dependencies: Pick<EnemyTurnPhaseDependencies, "resolveEnemyOffenseRoll">;
};

export type EnemyReadyActionWindowArgs = Omit<
  EnemyActionWindowArgs,
  | "enemyAttackIntervalMs"
  | "hasSwordHeartPassive"
  | "playerDamagedSinceSwordHeartWindow"
  | "swordHeartStacks"
>;

export type EnemySkippedActionWindowArgs = Pick<
  EnemyActionWindowArgs,
  | "currentTimeMs"
  | "enemy"
  | "enemyAttackIntervalMs"
  | "hasSwordHeartPassive"
  | "playerDamagedSinceSwordHeartWindow"
  | "swordHeartStacks"
  | "logs"
  | "turn"
  | "player"
  | "playerHp"
  | "enemyHp"
>;

export type EnemyActionPhaseArgs = {
  enemyActionWindow: ResolvedEnemyActionWindow;
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
  hasSwordHeartPassive: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  enemyAttackIntervalMs: number;
  dependencies: Pick<EnemyTurnPhaseDependencies, "resolveEnemyTurnAftermath">;
};

export type EnemyActionAftermathArgs = Omit<
  EnemyActionPhaseArgs,
  "enemyStatuses" | "hasSwordHeartPassive" | "playerDamagedSinceSwordHeartWindow" | "swordHeartStacks" | "enemyAttackIntervalMs"
>;

export type EnemyActionFinalizationArgs = Omit<
  EnemyActionPhaseArgs,
  "passiveFlags" | "dependencies"
> & {
  enemyDamage: number;
};

export type EnemyTurnPhaseDispatcherArgs = Omit<
  EnemyActionPhaseArgs,
  "enemyActionWindow" | "dependencies"
> & {
  enemyActionWindow: EnemyActionWindowResult;
  dependencies: EnemyTurnPhaseDependencies;
};

export type EnemyTurnPhaseArgs = Omit<
  EnemyTurnPhaseDispatcherArgs,
  "enemyActionWindow"
> & {
  enemySpecialReadyAtMs: number;
};
