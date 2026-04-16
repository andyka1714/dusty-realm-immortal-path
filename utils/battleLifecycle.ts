import { LogEntry } from "../types";
import {
  AutoBattleReplaySession,
  AutoBattleReplayState,
  createAutoBattleReplayState,
  createIdleAutoBattleReplayState,
} from "./battleReplay";

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

export const createCombatTimerBuckets = (): CombatTimerBuckets => ({
  world: new Set(),
  replay: new Set(),
});

export const clearCombatTimerBucket = (
  timerBuckets: CombatTimerBuckets,
  bucket: CombatTimerBucket
) => {
  timerBuckets[bucket].forEach((timer) => clearTimeout(timer));
  timerBuckets[bucket].clear();
};

export const clearAllCombatTimers = (timerBuckets: CombatTimerBuckets) => {
  clearCombatTimerBucket(timerBuckets, "world");
  clearCombatTimerBucket(timerBuckets, "replay");
};

export const resolveAutoBattleReplayLifecycle = ({
  isBattling,
  hasCurrentEnemy,
  lastBattleResult,
  replayProcessed,
}: {
  isBattling: boolean;
  hasCurrentEnemy: boolean;
  lastBattleResult: string | null;
  replayProcessed: boolean;
}): AutoBattleReplayLifecycle => {
  if (!isBattling) {
    return {
      shouldResetReplay: true,
      shouldStartReplay: false,
      nextProcessed: false,
    };
  }

  if (hasCurrentEnemy && !lastBattleResult && !replayProcessed) {
    return {
      shouldResetReplay: false,
      shouldStartReplay: true,
      nextProcessed: true,
    };
  }

  return {
    shouldResetReplay: false,
    shouldStartReplay: false,
    nextProcessed: replayProcessed,
  };
};

export const resolveAutoBattleReplayTransition = <TSession>({
  isBattling,
  hasCurrentEnemy,
  lastBattleResult,
  replayProcessed,
  createReplaySession,
}: {
  isBattling: boolean;
  hasCurrentEnemy: boolean;
  lastBattleResult: string | null;
  replayProcessed: boolean;
  createReplaySession?: () => TSession | undefined;
}): AutoBattleReplayTransition<TSession> => {
  const replayLifecycle = resolveAutoBattleReplayLifecycle({
    isBattling,
    hasCurrentEnemy,
    lastBattleResult,
    replayProcessed,
  });

  if (replayLifecycle.shouldResetReplay) {
    return {
      kind: "reset",
      nextProcessed: false,
    };
  }

  if (replayLifecycle.shouldStartReplay) {
    const session = createReplaySession?.();
    if (session) {
      return {
        kind: "start",
        nextProcessed: true,
        session,
      };
    }
  }

  return {
    kind: "idle",
    nextProcessed: replayLifecycle.nextProcessed,
  };
};

export const resolveAutoBattleReplayTransitionStatePlan = ({
  isBattling,
  hasCurrentEnemy,
  lastBattleResult,
  replayProcessed,
  createReplaySession,
}: {
  isBattling: boolean;
  hasCurrentEnemy: boolean;
  lastBattleResult: string | null;
  replayProcessed: boolean;
  createReplaySession?: () => AutoBattleReplaySession | undefined;
}): AutoBattleReplayTransitionStatePlan => {
  const replayTransition = resolveAutoBattleReplayTransition({
    isBattling,
    hasCurrentEnemy,
    lastBattleResult,
    replayProcessed,
    createReplaySession,
  });

  if (replayTransition.kind === "reset") {
    return {
      kind: "reset",
      nextProcessed: false,
      shouldClearReplayTimers: true,
      replayState: createIdleAutoBattleReplayState(),
    };
  }

  if (replayTransition.kind === "start") {
    return {
      kind: "start",
      nextProcessed: true,
      shouldClearReplayTimers: false,
      replayState: createAutoBattleReplayState({
        session: replayTransition.session,
      }),
    };
  }

  return {
    kind: "idle",
    nextProcessed: replayTransition.nextProcessed,
    shouldClearReplayTimers: false,
  };
};

export const getBattleReportAutoCloseDelayMs = ({
  lastBattleResult,
  isReplayingBattle,
  isAutoBattling,
}: {
  lastBattleResult: "won" | "lost" | null;
  isReplayingBattle: boolean;
  isAutoBattling: boolean;
}) => {
  if (!lastBattleResult || isReplayingBattle) return null;
  return isAutoBattling ? 1500 : 2200;
};

export const resolveWorldBattleResultCleanup = ({
  lastBattleResult,
}: {
  lastBattleResult: "won" | "lost" | null;
}): WorldBattleResultCleanup => {
  if (lastBattleResult === "lost") {
    return {
      shouldClearTargetMonster: true,
      shouldClearAutoMovePath: true,
      shouldStopAutoBattle: true,
    };
  }

  if (lastBattleResult === "won") {
    return {
      shouldClearTargetMonster: false,
      shouldClearAutoMovePath: true,
      shouldStopAutoBattle: false,
    };
  }

  return {
    shouldClearTargetMonster: false,
    shouldClearAutoMovePath: false,
    shouldStopAutoBattle: false,
  };
};

export const resolveWorldBattleResultLifecyclePlan = ({
  lastBattleResult,
  isReplayingBattle,
  isAutoBattling,
}: {
  lastBattleResult: "won" | "lost" | null;
  isReplayingBattle: boolean;
  isAutoBattling: boolean;
}): WorldBattleResultLifecyclePlan => ({
  autoCloseDelayMs: getBattleReportAutoCloseDelayMs({
    lastBattleResult,
    isReplayingBattle,
    isAutoBattling,
  }),
  ...resolveWorldBattleResultCleanup({
    lastBattleResult,
  }),
});

export const getBattleRespawnMapId = (completedQuestIds: string[]) =>
  completedQuestIds.includes("sect_sword_join")
    ? "4"
    : completedQuestIds.includes("sect_beast_join")
      ? "14"
      : completedQuestIds.includes("sect_mystic_join")
        ? "23"
        : "0";

export const createClearWorldCombatEncounterState = ({
  worldPlayerShield,
  playerActionReadyAt,
  playerSkillReadyAt,
}: {
  worldPlayerShield: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
}): WorldCombatEncounterState => ({
  worldCombatTargetId: null,
  worldCombatTargetStatuses: [],
  worldCombatPlayerStatuses: [],
  worldLastCombatMessage: null,
  worldPlayerShield,
  playerActionReadyAt,
  playerSkillReadyAt,
  enemyActionReadyAtById: {},
  enemySpecialReadyAtById: {},
});

export const createResetWorldCombatEncounterState =
  (): WorldCombatEncounterState => ({
    ...createClearWorldCombatEncounterState({
      worldPlayerShield: 0,
      playerActionReadyAt: 0,
      playerSkillReadyAt: 0,
    }),
  });

export const resolveWorldPlayerDefeatOutcome = ({
  completedQuestIds,
}: {
  completedQuestIds: string[];
}): WorldPlayerDefeatOutcome => ({
  respawnMapId: getBattleRespawnMapId(completedQuestIds),
  startX: 20,
  startY: 20,
  logMessage: "你在野外遭受重創，被傳送回安全地帶調息。",
});

export const resolveWorldPlayerDefeatPlan = ({
  completedQuestIds,
  playerMaxHp,
}: {
  completedQuestIds: string[];
  playerMaxHp: number;
}): WorldPlayerDefeatPlan => ({
  defeatOutcome: resolveWorldPlayerDefeatOutcome({
    completedQuestIds,
  }),
  nextWorldPlayerHp: playerMaxHp,
  shouldClearTargetMonster: true,
  shouldClearAutoMovePath: true,
  shouldStopAutoBattle: true,
  encounterState: createResetWorldCombatEncounterState(),
});

export const createWorldPlayerDefeatStatePlan = ({
  defeatPlan,
}: {
  defeatPlan: WorldPlayerDefeatPlan;
}): WorldPlayerDefeatStatePlan => ({
  logEntry: {
    message: defeatPlan.defeatOutcome.logMessage,
    type: "danger",
  },
  respawnMapId: defeatPlan.defeatOutcome.respawnMapId,
  startX: defeatPlan.defeatOutcome.startX,
  startY: defeatPlan.defeatOutcome.startY,
  shouldClearTargetMonster: defeatPlan.shouldClearTargetMonster,
  shouldClearAutoMovePath: defeatPlan.shouldClearAutoMovePath,
  shouldStopAutoBattle: defeatPlan.shouldStopAutoBattle,
  nextWorldPlayerHp: defeatPlan.nextWorldPlayerHp,
  encounterState: defeatPlan.encounterState,
  shouldClearWorldCombatTimers: true,
});
