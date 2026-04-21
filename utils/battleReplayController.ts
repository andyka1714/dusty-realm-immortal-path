import { resolveAutoBattleReplayTransitionStatePlan } from "./battleLifecycleReplay";
import { runAutoBattleReplayStateFrame } from "./battleReplayFrames";
import type {
  AutoBattleReplayControllerResult,
  AutoBattleReplaySession,
  ReplayMonsterPosition,
  ReplaySkillResolver,
  ReplayTimerSet,
  ReplayVisualSkillLike,
} from "./battleReplayTypes";
import { ActiveMonster, Enemy } from "../types";

export const runAutoBattleReplayController = <TSkill,>({
  isBattling,
  hasCurrentEnemy,
  lastBattleResult,
  replayProcessed,
  createReplaySession,
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
  isBattling: boolean;
  hasCurrentEnemy: boolean;
  lastBattleResult: string | null;
  replayProcessed: boolean;
  createReplaySession?: () => AutoBattleReplaySession | undefined;
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
  executeStepStatePlan: Parameters<
    typeof runAutoBattleReplayStateFrame<TSkill>
  >[0]["executeStepStatePlan"];
}): AutoBattleReplayControllerResult => {
  const replayTransitionStatePlan = resolveAutoBattleReplayTransitionStatePlan({
    isBattling,
    hasCurrentEnemy,
    lastBattleResult,
    replayProcessed,
    createReplaySession,
  });

  if (replayTransitionStatePlan.kind !== "idle") {
    return {
      kind: "transition",
      nextProcessed: replayTransitionStatePlan.nextProcessed,
      shouldClearReplayTimers: replayTransitionStatePlan.shouldClearReplayTimers,
      replayState: replayTransitionStatePlan.replayState,
    };
  }

  const replayFrame = runAutoBattleReplayStateFrame({
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
  });

  if (replayFrame.kind === "finish") {
    return {
      kind: "finish",
      nextProcessed: replayTransitionStatePlan.nextProcessed,
      shouldClearReplayTimers: false,
      finishResultPlan: replayFrame.finishResultPlan,
    };
  }

  if (replayFrame.kind === "step") {
    return {
      kind: "step",
      nextProcessed: replayTransitionStatePlan.nextProcessed,
      shouldClearReplayTimers: false,
      timer: replayFrame.timer,
    };
  }

  return {
    kind: "idle",
    nextProcessed: replayTransitionStatePlan.nextProcessed,
    shouldClearReplayTimers: false,
  };
};
