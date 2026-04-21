import { LogEntry } from "../types";
import type { AutoBattleReplayState, AutoBattleReplaySession } from "./battleReplayTypes";

export interface WorldCombatEncounterState {
  worldCombatTargetId: string | null;
  worldCombatTargetStatuses: string[];
  worldCombatPlayerStatuses: string[];
  worldLastCombatMessage: string | null;
  worldPlayerShield: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  enemyActionReadyAtById: Record<string, number>;
  enemySpecialReadyAtById: Record<string, number>;
}

export interface WorldPlayerDefeatOutcome {
  respawnMapId: string;
  startX: number;
  startY: number;
  logMessage: string;
}

export interface WorldPlayerDefeatPlan {
  defeatOutcome: WorldPlayerDefeatOutcome;
  nextWorldPlayerHp: number;
  shouldClearTargetMonster: true;
  shouldClearAutoMovePath: true;
  shouldStopAutoBattle: true;
  encounterState: WorldCombatEncounterState;
}

export interface WorldPlayerDefeatStatePlan {
  logEntry: {
    message: string;
    type: LogEntry["type"];
  };
  respawnMapId: string;
  startX: number;
  startY: number;
  shouldClearTargetMonster: true;
  shouldClearAutoMovePath: true;
  shouldStopAutoBattle: true;
  nextWorldPlayerHp: number;
  encounterState: WorldCombatEncounterState;
  shouldClearWorldCombatTimers: true;
}

export type CombatTimerBucket = "world" | "replay";
export type CombatTimerBuckets = Record<
  CombatTimerBucket,
  Set<ReturnType<typeof setTimeout>>
>;

export interface AutoBattleReplayLifecycle {
  shouldResetReplay: boolean;
  shouldStartReplay: boolean;
  nextProcessed: boolean;
}

export type AutoBattleReplayTransition<TSession> =
  | {
      kind: "idle";
      nextProcessed: boolean;
    }
  | {
      kind: "reset";
      nextProcessed: false;
    }
  | {
      kind: "start";
      nextProcessed: true;
      session: TSession;
    };

export type AutoBattleReplayTransitionStatePlan =
  | {
      kind: "idle";
      nextProcessed: boolean;
      shouldClearReplayTimers: false;
    }
  | {
      kind: "reset";
      nextProcessed: false;
      shouldClearReplayTimers: true;
      replayState: AutoBattleReplayState;
    }
  | {
      kind: "start";
      nextProcessed: true;
      shouldClearReplayTimers: false;
      replayState: AutoBattleReplayState;
    };

export interface WorldBattleResultCleanup {
  shouldClearTargetMonster: boolean;
  shouldClearAutoMovePath: boolean;
  shouldStopAutoBattle: boolean;
}

export interface WorldBattleResultLifecyclePlan
  extends WorldBattleResultCleanup {
  autoCloseDelayMs: number | null;
}

export type ReplaySessionFactory = () => AutoBattleReplaySession | undefined;
