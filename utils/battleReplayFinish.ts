import { Enemy, VisualEffect } from "../types";
import {
  BattleRewardManifest,
  createBattleRewardManifest,
} from "./battleRewards";
import type {
  AutoBattleReplayFinishPlan,
  AutoBattleReplayFinishResultPlan,
  AutoBattleReplayOutcome,
} from "./battleReplayTypes";

export const createAutoBattleReplayFinishPlan = ({
  replayOutcome,
}: {
  replayOutcome: AutoBattleReplayOutcome;
}): AutoBattleReplayFinishPlan => ({
  shouldStopReplay: true,
  battleResult: {
    won: replayOutcome.won,
    logs: replayOutcome.logs,
    respawnMapId: replayOutcome.respawnMapId,
  },
  victoryTarget: replayOutcome.won
    ? replayOutcome.defeatedMonster
      ? {
          x: replayOutcome.defeatedMonster.x,
          y: replayOutcome.defeatedMonster.y,
        }
      : undefined
    : undefined,
  rewards: replayOutcome.won ? replayOutcome.rewards : undefined,
  defeatLogMessage:
    replayOutcome.won ? undefined : replayOutcome.defeatLogMessage,
});

export const createAutoBattleReplayFinishEffects = ({
  finishPlan,
}: {
  finishPlan: AutoBattleReplayFinishPlan;
}): Array<Omit<VisualEffect, "id">> => {
  if (!finishPlan.victoryTarget) {
    return [];
  }

  return [
    {
      type: "area",
      text: "",
      color: "#fca5a5",
      colorInt: 0xfca5a5,
      targetX: finishPlan.victoryTarget.x,
      targetY: finishPlan.victoryTarget.y,
      radius: 0.9,
      durationMs: 420,
    },
    {
      type: "impact",
      text: "",
      color: "#ffffff",
      colorInt: 0xffffff,
      targetX: finishPlan.victoryTarget.x,
      targetY: finishPlan.victoryTarget.y,
      radius: 0.85,
      durationMs: 320,
    },
  ];
};

export const resolveAutoBattleReplayFinishResultPlan = ({
  replayOutcome,
  currentEnemy,
}: {
  replayOutcome: AutoBattleReplayOutcome;
  currentEnemy?: Enemy | null;
}): AutoBattleReplayFinishResultPlan => {
  const finishPlan = createAutoBattleReplayFinishPlan({
    replayOutcome,
  });

  return {
    shouldStopReplay: true,
    battleResult: finishPlan.battleResult,
    finishEffects: createAutoBattleReplayFinishEffects({ finishPlan }),
    rewardManifest:
      finishPlan.rewards && currentEnemy
        ? createBattleRewardManifest({
            enemy: currentEnemy,
            rewards: finishPlan.rewards,
          })
        : undefined,
    defeatLogMessage: finishPlan.defeatLogMessage,
  };
};

export type { BattleRewardManifest };
