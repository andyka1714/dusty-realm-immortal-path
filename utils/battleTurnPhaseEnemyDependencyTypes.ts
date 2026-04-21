import { type CombatLog, type Enemy } from "../types";
import type { PlayerPassiveFlags } from "./battlePassives";
import type { EnemySpecialTimelineProfile } from "./battleProfiles";
import type { CombatStatusLike } from "./battleStatusTypes";
import type {
  ResolveEnemyOffenseRollResult,
  ResolveEnemyTurnAftermathResult,
} from "./battleTurnPhaseEnemyTypes";
import type { PlayerCombatStatsLike } from "./battleTurnPhaseSharedTypes";

export type EnemyTurnPhaseDependencies = {
  resolveEnemyOffenseRoll: (args: {
    enemy: Enemy;
    player: PlayerCombatStatsLike;
    enemyStatuses: CombatStatusLike[];
    playerStatuses: CombatStatusLike[];
    currentTimeMs: number;
    enemySpecialReady: boolean;
    enemySpecialTimelineProfile?: EnemySpecialTimelineProfile;
    passiveFlags: PlayerPassiveFlags;
    bodyTribulationStacks: number;
  }) => ResolveEnemyOffenseRollResult;
  resolveEnemyTurnAftermath: (args: {
    enemyDamage: number;
    isDodge: boolean;
    voidEvasion: boolean;
    isBlock: boolean;
    enemySpecialReady: boolean;
    currentTimeMs: number;
    turn: number;
    logs: CombatLog[];
    enemy: Enemy;
    player: PlayerCombatStatsLike;
    playerHp: number;
    playerMp: number;
    enemyHp: number;
    playerStatuses: CombatStatusLike[];
    passiveFlags: PlayerPassiveFlags;
    bodyFoundationStacks: number;
    swordDeathWardUsed: boolean;
    bodyTribulationStacks: number;
    bodyRebirthTrueUsed: boolean;
  }) => ResolveEnemyTurnAftermathResult;
};
