import type {
  WorldBattleResultCleanup,
  WorldBattleResultLifecyclePlan,
} from "./battleLifecycleTypes";

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
