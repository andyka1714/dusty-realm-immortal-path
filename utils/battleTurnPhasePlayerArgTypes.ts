import type { CombatLog, Enemy, Skill } from "../types";
import type { PlayerPassiveFlags } from "./battlePassives";
import type { PlayerTurnPhaseDependencies } from "./battleTurnPhasePlayerDependencyTypes";
import type { CombatStatusLike } from "./battleStatusTypes";
import type {
  PlayerCombatStatsLike,
  RestrictionLike,
} from "./battleTurnPhaseSharedTypes";
import type { ResolvedPlayerTurnContext } from "./battleTurnPhasePlayerTypes";

export type PlayerTurnArgs = {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  pVsE: RestrictionLike;
  bossBroken: boolean;
  playerDebuffed: boolean;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerAttackIntervalMs: number;
  hasMageFusionPassive: boolean;
  dependencies: PlayerTurnPhaseDependencies;
};

export type PlayerActionPhaseArgs = PlayerTurnArgs & {
  nextSwordImmortalGuardAtMs: number;
  hasSwordImmortalPassive: boolean;
};

export type PlayerTurnPhaseArgs = PlayerActionPhaseArgs;

export type PlayerPreludeArgs = Pick<
  PlayerActionPhaseArgs,
  | "currentTimeMs"
  | "turn"
  | "player"
  | "enemy"
  | "logs"
  | "pVsE"
  | "bossBroken"
  | "playerHp"
  | "enemyHp"
  | "playerStatuses"
  | "nextSwordImmortalGuardAtMs"
  | "hasSwordImmortalPassive"
>;

export type PlayerTurnLogArgs = {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerStatuses: CombatStatusLike[];
  activeSkill?: Skill;
  resolvedTurnContext: ResolvedPlayerTurnContext;
};

export type PlayerResonanceCleanupArgs = Pick<
  PlayerTurnLogArgs,
  | "currentTimeMs"
  | "turn"
  | "player"
  | "enemy"
  | "logs"
  | "playerHp"
  | "playerStatuses"
  | "resolvedTurnContext"
>;

export type PlayerTurnOutcomeArgs = {
  currentTimeMs: number;
  turn: number;
  player: PlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  playerHp: number;
  playerMp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  activeSkill?: Skill;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  playerAttackIntervalMs: number;
  resolvedTurnContext: ResolvedPlayerTurnContext;
  dependencies: Pick<PlayerTurnPhaseDependencies, "resolvePlayerActiveAftermath">;
};
