import { ActiveMonster, Enemy } from "../types";
import { resolveAutoBattleReplayFinishResultPlan } from "./battleReplayFinish";
import { resolveAutoBattleReplayOutcome } from "./battleReplayState";
import { runAutoBattleReplayStep } from "./battleReplaySteps";
import { createAutoBattleReplayStepStatePlan } from "./battleReplayVisuals";
import type {
  AutoBattleReplayFrameResult,
  AutoBattleReplayFrameStateResult,
  AutoBattleReplaySession,
  ReplayEnemyRef,
  ReplayMonsterPosition,
  ReplaySkillResolver,
  ReplayTimerSet,
  ReplayVisualSkillLike,
  ResolvedAutoBattleReplayStep,
} from "./battleReplayTypes";

export const runAutoBattleReplayFrame = <TSkill>({
  isReplayingBattle,
  replaySession,
  currentEnemy,
  currentEnemyInstanceId,
  activeMonsters,
  respawnMapId,
  resolveSkillByName,
  timerSet,
  executeStep,
}: {
  isReplayingBattle: boolean;
  replaySession: AutoBattleReplaySession | null;
  currentEnemy?: ReplayEnemyRef;
  currentEnemyInstanceId: string | null;
  activeMonsters: ActiveMonster[];
  respawnMapId?: string;
  resolveSkillByName?: ReplaySkillResolver<TSkill>;
  timerSet?: ReplayTimerSet;
  executeStep: (
    resolvedStep: ResolvedAutoBattleReplayStep<ActiveMonster, TSkill>
  ) => void;
}): AutoBattleReplayFrameResult => {
  if (!isReplayingBattle || !replaySession) {
    return { kind: "idle" };
  }

  if (replaySession.replayQueue.length === 0) {
    return {
      kind: "finish",
      replayOutcome: resolveAutoBattleReplayOutcome({
        battleSnapshot: replaySession.battleSnapshot,
        displayedLogs: replaySession.displayedLogs,
        currentEnemy,
        currentEnemyInstanceId,
        activeMonsters,
        respawnMapId,
      }),
    };
  }

  return {
    kind: "step",
    timer: runAutoBattleReplayStep({
      replaySession,
      currentEnemyInstanceId,
      activeMonsters,
      getMonsterInstanceId: (monster) => monster.instanceId,
      resolveSkillByName,
      timerSet,
      execute: executeStep,
    }),
  };
};

export const runAutoBattleReplayStateFrame = <TSkill,>({
  isReplayingBattle,
  replaySession,
  currentEnemy,
  currentEnemyInstanceId,
  activeMonsters,
  respawnMapId,
  resolveSkillByName,
  timerSet,
  playerPosition,
  enemyAttackRange,
  executeStepStatePlan,
}: {
  isReplayingBattle: boolean;
  replaySession: AutoBattleReplaySession | null;
  currentEnemy?: Enemy | null;
  currentEnemyInstanceId: string | null;
  activeMonsters: ActiveMonster[];
  respawnMapId?: string;
  resolveSkillByName?: ReplaySkillResolver<TSkill>;
  timerSet?: ReplayTimerSet;
  playerPosition: ReplayMonsterPosition;
  enemyAttackRange?: number;
  executeStepStatePlan: (stepStatePlan: ReturnType<typeof createAutoBattleReplayStepStatePlan<TSkill>>) => void;
}): AutoBattleReplayFrameStateResult => {
  const replayFrame = runAutoBattleReplayFrame({
    isReplayingBattle,
    replaySession,
    currentEnemy,
    currentEnemyInstanceId,
    activeMonsters,
    respawnMapId,
    resolveSkillByName,
    timerSet,
    executeStep: (resolvedStep) => {
      executeStepStatePlan(
        createAutoBattleReplayStepStatePlan({
          ...resolvedStep,
          playerPosition,
          enemyAttackRange,
        })
      );
    },
  });

  if (replayFrame.kind === "finish") {
    return {
      kind: "finish",
      finishResultPlan: resolveAutoBattleReplayFinishResultPlan({
        replayOutcome: replayFrame.replayOutcome,
        currentEnemy,
      }),
    };
  }

  return replayFrame;
};
