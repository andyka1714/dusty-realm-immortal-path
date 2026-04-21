import { createAutoBattleReplayState, createIdleAutoBattleReplayState } from "./battleReplayState";
import type { ReplaySessionFactory } from "./battleLifecycleTypes";
import type {
  AutoBattleReplayLifecycle,
  AutoBattleReplayTransition,
  AutoBattleReplayTransitionStatePlan,
} from "./battleLifecycleTypes";

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
  createReplaySession?: ReplaySessionFactory;
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
