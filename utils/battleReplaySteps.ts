import {
  createBattleReplayStepPlan,
  runResolvedTimedCombatPlan,
} from "./battleTiming";
import { advanceAutoBattleReplaySession } from "./battleReplayState";
import type {
  ReplaySkillResolver,
  ReplayStepPlan,
  ReplayTimerSet,
  ResolvedAutoBattleReplayStep,
  AutoBattleReplaySession,
} from "./battleReplayTypes";

export const runResolvedBattleReplayStep = <TResolved,>({
  resolve,
  buildPlan,
}: {
  resolve: () => TResolved;
  buildPlan: (resolved: TResolved) => ReplayStepPlan<TResolved>;
}) =>
  runResolvedTimedCombatPlan({
    resolve: () => resolve(),
    buildPlan: (resolved) => {
      const plan = buildPlan(resolved);
      if (!plan) return undefined;
      return createBattleReplayStepPlan(plan);
    },
  });

export const runAutoBattleReplayStep = <TMonster, TSkill>({
  replaySession,
  currentEnemyInstanceId,
  activeMonsters,
  getMonsterInstanceId,
  resolveSkillByName,
  timerSet,
  execute,
}: {
  replaySession: AutoBattleReplaySession;
  currentEnemyInstanceId: string | null;
  activeMonsters: TMonster[];
  getMonsterInstanceId: (monster: TMonster) => string;
  resolveSkillByName?: ReplaySkillResolver<TSkill>;
  timerSet?: ReplayTimerSet;
  execute: (resolvedStep: ResolvedAutoBattleReplayStep<TMonster, TSkill>) => void;
}) =>
  runResolvedBattleReplayStep({
    resolve: () => {
      const { nextLog, nextSession } =
        advanceAutoBattleReplaySession(replaySession);
      if (!nextLog) return undefined;

      const targetMonster = currentEnemyInstanceId
        ? activeMonsters.find(
            (monster) => getMonsterInstanceId(monster) === currentEnemyInstanceId
          ) ?? null
        : null;
      const skillMatch = nextLog.message.match(/施展【([^】]+)】/);
      const normalizedUsedSkill = skillMatch
        ? resolveSkillByName?.(skillMatch[1])
        : undefined;

      return {
        nextLog,
        nextSession,
        targetMonster,
        normalizedUsedSkill,
      };
    },
    buildPlan: (resolvedStep) => {
      if (!resolvedStep) return undefined;

      return {
        previousTimeMs: replaySession.displayedLogs.at(-1)?.timeMs ?? 0,
        nextTimeMs: resolvedStep.nextLog.timeMs,
        timerSet,
        execute: () => execute(resolvedStep),
      };
    },
  });
