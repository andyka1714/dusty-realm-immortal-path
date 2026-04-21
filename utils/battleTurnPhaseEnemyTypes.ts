import type { EnemySpecialTimelineProfile } from "./battleProfiles";
import type { CombatStatusLike } from "./battleStatusTypes";
import type { RestrictionLike } from "./battleTurnPhaseSharedTypes";

export type ResolveEnemyOffenseRollResult = {
  enemyDamage: number;
  isDodge: boolean;
  voidEvasion: boolean;
  isBlock: boolean;
  bodyFoundationStacks: number;
  eVsP: RestrictionLike;
};

export type ResolveEnemyTurnAftermathResult = {
  enemyDamage: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
};

export type SkippedEnemyActionWindow = {
  skipped: true;
  enemyNextActionMs: number;
  swordHeartStacks: number;
  playerDamagedSinceSwordHeartWindow: boolean;
};

export type ResolvedEnemyActionWindow = ResolveEnemyOffenseRollResult & {
  skipped: false;
  enemySpecialReadyAtMs: number;
  enemySpecialReady: boolean;
  enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
};

export type EnemyActionWindowResult =
  | SkippedEnemyActionWindow
  | ResolvedEnemyActionWindow;

export type ResolveEnemyActionPhaseResult = {
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  swordDeathWardUsed: boolean;
  bodyTribulationStacks: number;
  bodyRebirthTrueUsed: boolean;
  playerDamagedSinceSwordHeartWindow: boolean;
  swordHeartStacks: number;
  enemySpecialReadyAtMs: number;
  enemyNextActionMs: number;
};

export type SkippedEnemyTurnPhaseResult = {
  skipped: true;
  enemyNextActionMs: number;
  swordHeartStacks: number;
  playerDamagedSinceSwordHeartWindow: boolean;
};

export type ResolvedEnemyTurnPhaseResult = ResolveEnemyActionPhaseResult & {
  skipped: false;
};

export type EnemyTurnPhaseResult =
  | SkippedEnemyTurnPhaseResult
  | ResolvedEnemyTurnPhaseResult;
