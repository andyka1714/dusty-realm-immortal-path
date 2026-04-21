import { ProfessionType } from "../types";
import {
  EnemyWorldStrikeOutcomeStatePlan,
  EnemyWorldStrikePreviewPlan,
  EnemyWorldStrikeResolved,
  PlayerWorldStrikeOutcomeStatePlan,
  PlayerWorldStrikePreviewPlan,
  WorldStrikeResult,
  WorldStrikeVisualPlan,
  createEnemyWorldStrikePreviewPlan,
  createPlayerWorldStrikePreviewPlan,
  runEnemyWorldStrikeOutcomePipeline,
  runPlayerWorldStrikeOutcomePipeline,
} from "./battleWorldStrike";
import { runResolvedWorldStrikeAction } from "./battleTiming";
import { ActiveMonster, Enemy } from "../types";

export const runPlayerWorldStrikeAction = <
  TTarget,
  TSkill,
  TStrike extends { executionTimeMs: number },
>({
  readyAt,
  canExecute,
  resolveTarget,
  selectSkill,
  resolveStrike,
  timerSet,
  applyCastEffect,
  applyPreview,
  execute,
}: {
  readyAt?: number;
  canExecute?: () => boolean;
  resolveTarget: () => TTarget | undefined;
  selectSkill: (now: number) => TSkill | undefined;
  resolveStrike: (chosenSkill: TSkill | undefined) => TStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TStrike;
  }) => void;
  applyPreview: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TStrike;
  }) => void;
  execute: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TStrike;
  }) => void;
}) =>
  runResolvedWorldStrikeAction({
    readyAt,
    canExecute,
    resolve: (now) => {
      const target = resolveTarget();
      if (!target) return undefined;

      const chosenSkill = selectSkill(now);
      return {
        now,
        chosenSkill,
        target,
        strike: resolveStrike(chosenSkill),
      };
    },
    buildPlan: (resolved) => {
      if (!resolved) return undefined;

      return {
        strike: resolved.strike,
        timerSet,
        delayMs: (strike: TStrike) => strike.executionTimeMs,
        applyCastEffect: applyCastEffect
          ? () => applyCastEffect(resolved)
          : undefined,
        applyPreview: () => applyPreview(resolved),
        execute: () => execute(resolved),
      };
    },
  });

export const runEnemyWorldStrikeAction = <
  TStrike extends { executionTimeMs: number },
>({
  canExecute,
  resolveCanUseSpecial,
  resolveStrike,
  timerSet,
  applyCastEffect,
  applyPreview,
  execute,
}: {
  canExecute?: () => boolean;
  resolveCanUseSpecial: (now: number) => boolean;
  resolveStrike: (canUseSpecial: boolean) => TStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TStrike;
  }) => void;
  applyPreview: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TStrike;
  }) => void;
  execute: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TStrike;
  }) => void;
}) =>
  runResolvedWorldStrikeAction({
    canExecute,
    resolve: (now) => {
      const canUseSpecial = resolveCanUseSpecial(now);
      return {
        now,
        canUseSpecial,
        strike: resolveStrike(canUseSpecial),
      };
    },
    buildPlan: (resolved) => ({
      strike: resolved.strike,
      timerSet,
      delayMs: (strike: TStrike) => strike.executionTimeMs,
      applyCastEffect: applyCastEffect ? () => applyCastEffect(resolved) : undefined,
      applyPreview: () => applyPreview(resolved),
      execute: () => execute(resolved),
    }),
  });

export const runWorldPlayerCombatAction = <
  TTarget,
  TSkill,
  TStrike extends { executionTimeMs: number },
>({
  readyAt,
  canExecute,
  target,
  primaryActiveSkill,
  playerSkillReadyAt,
  useSkill,
  resolveStrike,
  timerSet,
  applyCastEffect,
  applyPreview,
  execute,
}: {
  readyAt?: number;
  canExecute?: () => boolean;
  target?: TTarget;
  primaryActiveSkill?: TSkill;
  playerSkillReadyAt: number;
  useSkill: boolean;
  resolveStrike: (chosenSkill: TSkill | undefined) => TStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TStrike;
  }) => void;
  applyPreview: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TStrike;
  }) => void;
  execute: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TStrike;
  }) => void;
}) =>
  runPlayerWorldStrikeAction({
    readyAt,
    canExecute,
    resolveTarget: () => target,
    selectSkill: (now) =>
      useSkill && primaryActiveSkill && now >= playerSkillReadyAt
        ? primaryActiveSkill
        : undefined,
    resolveStrike,
    timerSet,
    applyCastEffect,
    applyPreview,
    execute,
  });

export const runWorldEnemyCombatAction = <
  TStrike extends { executionTimeMs: number },
>({
  canExecute,
  enemySpecialReadyAt,
  resolveStrike,
  timerSet,
  applyCastEffect,
  applyPreview,
  execute,
}: {
  canExecute?: () => boolean;
  enemySpecialReadyAt: number;
  resolveStrike: (canUseSpecial: boolean) => TStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TStrike;
  }) => void;
  applyPreview: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TStrike;
  }) => void;
  execute: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TStrike;
  }) => void;
}) =>
  runEnemyWorldStrikeAction({
    canExecute,
    resolveCanUseSpecial: (now) => now >= enemySpecialReadyAt,
    resolveStrike,
    timerSet,
    applyCastEffect,
    applyPreview,
    execute,
  });

export const runPlayerWorldStrikePipeline = <
  TSkill extends { name?: string; profession?: ProfessionType },
>({
  readyAt,
  canExecute,
  target,
  primaryActiveSkill,
  playerSkillReadyAt,
  useSkill,
  resolveStrike,
  activeMonsters,
  playerPosition,
  mapEnemies,
  playerMaxHp,
  currentWorldPlayerHp,
  currentShield,
  timerSet,
  applyCastEffect,
  applyPreviewStatePlan,
  applyMonsterDamage,
  applyVisualPlan,
  applyRewardApplicationPlan,
  appendLogEntry,
  setWorldLastCombatMessage,
  setWorldPlayerHp,
  clearEncounter,
}: {
  readyAt?: number;
  canExecute?: () => boolean;
  target?: ActiveMonster;
  primaryActiveSkill?: TSkill;
  playerSkillReadyAt: number;
  useSkill: boolean;
  resolveStrike: (chosenSkill: TSkill | undefined) => WorldStrikeResult;
  activeMonsters: ActiveMonster[];
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  mapEnemies: Enemy[] | undefined;
  playerMaxHp: number;
  currentWorldPlayerHp: number;
  currentShield: number;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: ActiveMonster;
    strike: WorldStrikeResult;
  }) => void;
  applyPreviewStatePlan: (
    previewPlan: PlayerWorldStrikePreviewPlan
  ) => void;
  applyMonsterDamage: (
    damageApplication: PlayerWorldStrikeOutcomeStatePlan["monsterDamageApplications"][number]
  ) => void;
  applyVisualPlan: (visualPlan: WorldStrikeVisualPlan) => void;
  applyRewardApplicationPlan: (
    rewardApplicationPlan: PlayerWorldStrikeOutcomeStatePlan["rewardApplicationPlans"][number]
  ) => void;
  appendLogEntry: (
    logEntry: PlayerWorldStrikeOutcomeStatePlan["logEntries"][number]
  ) => void;
  setWorldLastCombatMessage: (message: string) => void;
  setWorldPlayerHp: (hp: number) => void;
  clearEncounter?: () => void;
}) =>
  runWorldPlayerCombatAction({
    readyAt,
    canExecute,
    target,
    primaryActiveSkill,
    playerSkillReadyAt,
    useSkill,
    resolveStrike,
    timerSet,
    applyCastEffect,
    applyPreview: ({ now, chosenSkill, target, strike }) =>
      applyPreviewStatePlan(
        createPlayerWorldStrikePreviewPlan({
          now,
          targetId: target.instanceId,
          targetName: target.name,
          strike,
          currentShield,
          skillName: chosenSkill?.name,
        })
      ),
    execute: ({ chosenSkill, target, strike }) =>
      runPlayerWorldStrikeOutcomePipeline({
        strike,
        skillName: chosenSkill?.name,
        skillProfession: chosenSkill?.profession,
        targetedMonster: target,
        activeMonsters,
        playerPosition,
        mapEnemies,
        playerMaxHp,
        currentWorldPlayerHp,
        applyMonsterDamage,
        applyVisualPlan,
        applyRewardApplicationPlan,
        appendLogEntry,
        setWorldLastCombatMessage,
        setWorldPlayerHp,
        clearEncounter,
      }),
  });

export const runEnemyWorldStrikePipeline = ({
  canExecute,
  enemySpecialReadyAt,
  enemyInstanceId,
  enemyName,
  enemyPosition,
  fallbackSourcePosition,
  playerPosition,
  currentShield,
  currentHp,
  currentStatuses,
  completedQuestIds,
  playerMaxHp,
  resolveStrike,
  timerSet,
  applyCastEffect,
  applyPreviewStatePlan,
  setWorldPlayerShield,
  setWorldPlayerHp,
  setWorldCombatPlayerStatuses,
  setWorldLastCombatMessage,
  applyVisualPlan,
  applyDefeatStatePlan,
}: {
  canExecute?: () => boolean;
  enemySpecialReadyAt: number;
  enemyInstanceId: string;
  enemyName: string;
  enemyPosition?: Pick<ActiveMonster, "x" | "y"> | null;
  fallbackSourcePosition: Pick<ActiveMonster, "x" | "y">;
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  currentShield: number;
  currentHp: number;
  currentStatuses: string[];
  completedQuestIds: string[];
  playerMaxHp: number;
  resolveStrike: (canUseSpecial: boolean) => EnemyWorldStrikeResolved;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: EnemyWorldStrikeResolved;
  }) => void;
  applyPreviewStatePlan: (
    previewPlan: EnemyWorldStrikePreviewPlan,
    enemyInstanceId: string
  ) => void;
  setWorldPlayerShield: (shield: number) => void;
  setWorldPlayerHp: (hp: number) => void;
  setWorldCombatPlayerStatuses: (statuses: string[]) => void;
  setWorldLastCombatMessage: (message: string) => void;
  applyVisualPlan: (visualPlan: WorldStrikeVisualPlan) => void;
  applyDefeatStatePlan: (
    defeatStatePlan: EnemyWorldStrikeOutcomeStatePlan["defeatStatePlan"]
  ) => void;
}) =>
  runWorldEnemyCombatAction({
    canExecute,
    enemySpecialReadyAt,
    resolveStrike,
    timerSet,
    applyCastEffect,
    applyPreview: ({ now, canUseSpecial, strike }) =>
      applyPreviewStatePlan(
        createEnemyWorldStrikePreviewPlan({
          now,
          enemyName,
          strike,
          canUseSpecial,
        }),
        enemyInstanceId
      ),
    execute: ({ strike }) =>
      runEnemyWorldStrikeOutcomePipeline({
        strike,
        enemyName,
        enemyPosition,
        fallbackSourcePosition,
        playerPosition,
        currentShield,
        currentHp,
        currentStatuses,
        completedQuestIds,
        playerMaxHp,
        setWorldPlayerShield,
        setWorldPlayerHp,
        setWorldCombatPlayerStatuses,
        setWorldLastCombatMessage,
        applyVisualPlan,
        applyDefeatStatePlan,
      }),
  });

export type WorldCombatPlayerActionRunner = {
  run: (usePlayerSkill: boolean) => void;
};

export type WorldCombatEnemyActionRunner = {
  run: () => void;
};

export type WorldCombatPlayerActionConfig<
  TTarget,
  TSkill,
  TPlayerStrike extends { executionTimeMs: number },
> = {
  canExecute?: () => boolean;
  target?: TTarget;
  resolveStrike: (chosenSkill: TSkill | undefined) => TPlayerStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TPlayerStrike;
  }) => void;
  applyPreview: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TPlayerStrike;
  }) => void;
  execute: (resolved: {
    now: number;
    chosenSkill: TSkill | undefined;
    target: TTarget;
    strike: TPlayerStrike;
  }) => void;
};

export type WorldCombatEnemyActionConfig<
  TEnemyStrike extends { executionTimeMs: number },
> = {
  canExecute?: () => boolean;
  resolveStrike: (canUseSpecial: boolean) => TEnemyStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TEnemyStrike;
  }) => void;
  applyPreview: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TEnemyStrike;
  }) => void;
  execute: (resolved: {
    now: number;
    canUseSpecial: boolean;
    strike: TEnemyStrike;
  }) => void;
};
