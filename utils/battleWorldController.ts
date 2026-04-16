import {
  ActiveMonster,
  Enemy,
  ProfessionType,
} from "../types";
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

export interface WorldCombatActionWindow {
  engagedTargetId: string | null;
  shouldPlayerAct: boolean;
  usePlayerSkill: boolean;
  shouldEnemyAct: boolean;
}

export interface WorldCombatControllerFrameResult {
  nextTargetMonsterId: string | null;
  actionWindow: WorldCombatActionWindow | null;
}

export interface WorldCombatAutoTargetContext<TTarget> {
  isAutoBattling: boolean;
  isBattling: boolean;
  hasTargetMonster: boolean;
  showIntro: boolean;
  targets: TTarget[];
  getId: (target: TTarget) => string;
  getDistance: (target: TTarget) => number;
}

export const selectNearestWorldCombatTarget = <TTarget,>({
  targets,
  getId,
  getDistance,
}: {
  targets: TTarget[];
  getId: (target: TTarget) => string;
  getDistance: (target: TTarget) => number;
}) => {
  let nearestId: string | null = null;
  let minDistance = Infinity;

  targets.forEach((target) => {
    const distance = getDistance(target);
    if (distance < minDistance) {
      minDistance = distance;
      nearestId = getId(target);
    }
  });

  return nearestId;
};

export const resolveWorldCombatAutoTarget = <TTarget,>({
  isAutoBattling,
  isBattling,
  hasTargetMonster,
  showIntro,
  targets,
  getId,
  getDistance,
}: WorldCombatAutoTargetContext<TTarget>) => {
  if (
    !isAutoBattling ||
    isBattling ||
    hasTargetMonster ||
    showIntro ||
    targets.length === 0
  ) {
    return null;
  }

  return selectNearestWorldCombatTarget({
    targets,
    getId,
    getDistance,
  });
};

export const resolveWorldCombatActionWindow = ({
  now,
  distance,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  hasPrimaryActiveSkill,
  isAutoBattling,
  worldCombatTargetId,
  targetedMonsterInstanceId,
  enemyEngagementRange,
  enemyActionReadyAt,
}: {
  now: number;
  distance: number;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  hasPrimaryActiveSkill: boolean;
  isAutoBattling: boolean;
  worldCombatTargetId: string | null;
  targetedMonsterInstanceId: string;
  enemyEngagementRange: number;
  enemyActionReadyAt: number;
}): WorldCombatActionWindow => {
  const engagedTargetId =
    worldCombatTargetId ?? (isAutoBattling ? targetedMonsterInstanceId : null);
  const shouldPlayerAct =
    isAutoBattling &&
    distance <= playerEngagementRange &&
    now >= playerActionReadyAt;
  const usePlayerSkill = hasPrimaryActiveSkill && now >= playerSkillReadyAt;
  const shouldEnemyAct =
    engagedTargetId === targetedMonsterInstanceId &&
    distance <= enemyEngagementRange &&
    now >= enemyActionReadyAt;

  return {
    engagedTargetId,
    shouldPlayerAct,
    usePlayerSkill,
    shouldEnemyAct,
  };
};

export const runWorldCombatActionWindowStep = ({
  actionWindow,
  runPlayerAction,
  runEnemyAction,
}: {
  actionWindow: WorldCombatActionWindow;
  runPlayerAction: (usePlayerSkill: boolean) => void;
  runEnemyAction: () => void;
}) => {
  if (actionWindow.shouldPlayerAct) {
    runPlayerAction(actionWindow.usePlayerSkill);
  }

  if (actionWindow.shouldEnemyAct) {
    runEnemyAction();
  }

  return actionWindow;
};

export const runWorldCombatStep = ({
  now = Date.now(),
  distance,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  hasPrimaryActiveSkill,
  isAutoBattling,
  worldCombatTargetId,
  targetedMonsterInstanceId,
  enemyEngagementRange,
  enemyActionReadyAt,
  runPlayerAction,
  runEnemyAction,
}: {
  now?: number;
  distance: number;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  hasPrimaryActiveSkill: boolean;
  isAutoBattling: boolean;
  worldCombatTargetId: string | null;
  targetedMonsterInstanceId: string;
  enemyEngagementRange: number;
  enemyActionReadyAt: number;
  runPlayerAction: (usePlayerSkill: boolean) => void;
  runEnemyAction: () => void;
}) => {
  const actionWindow = resolveWorldCombatActionWindow({
    now,
    distance,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    hasPrimaryActiveSkill,
    isAutoBattling,
    worldCombatTargetId,
    targetedMonsterInstanceId,
    enemyEngagementRange,
    enemyActionReadyAt,
  });

  runWorldCombatActionWindowStep({
    actionWindow,
    runPlayerAction,
    runEnemyAction,
  });

  return actionWindow;
};

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
    previewPlan: ReturnType<typeof createPlayerWorldStrikePreviewPlan>
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
    previewPlan: ReturnType<typeof createEnemyWorldStrikePreviewPlan>,
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

type WorldCombatPlayerActionRunner = {
  run: (usePlayerSkill: boolean) => void;
};

type WorldCombatEnemyActionRunner = {
  run: () => void;
};

type WorldCombatPlayerActionConfig<
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

type WorldCombatEnemyActionConfig<
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

export const runWorldCombatControllerStep = <
  TTarget,
  TSkill,
  TPlayerStrike extends { executionTimeMs: number },
  TEnemyStrike extends { executionTimeMs: number },
>({
  now = Date.now(),
  distance,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  primaryActiveSkill,
  isAutoBattling,
  worldCombatTargetId,
  targetedMonsterInstanceId,
  enemyEngagementRange,
  enemyActionReadyAt,
  enemySpecialReadyAt,
  playerAction,
  enemyAction,
}: {
  now?: number;
  distance: number;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  primaryActiveSkill?: TSkill;
  isAutoBattling: boolean;
  worldCombatTargetId: string | null;
  targetedMonsterInstanceId: string;
  enemyEngagementRange: number;
  enemyActionReadyAt: number;
  enemySpecialReadyAt: number;
  playerAction:
    | WorldCombatPlayerActionRunner
    | WorldCombatPlayerActionConfig<TTarget, TSkill, TPlayerStrike>;
  enemyAction:
    | WorldCombatEnemyActionRunner
    | WorldCombatEnemyActionConfig<TEnemyStrike>;
}) => {
  const actionWindow = resolveWorldCombatActionWindow({
    now,
    distance,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    hasPrimaryActiveSkill: Boolean(primaryActiveSkill),
    isAutoBattling,
    worldCombatTargetId,
    targetedMonsterInstanceId,
    enemyEngagementRange,
    enemyActionReadyAt,
  });

  if (actionWindow.shouldPlayerAct) {
    if ("run" in playerAction) {
      playerAction.run(actionWindow.usePlayerSkill);
    } else {
      runWorldPlayerCombatAction({
        readyAt: playerActionReadyAt,
        canExecute: playerAction.canExecute,
        target: playerAction.target,
        primaryActiveSkill,
        playerSkillReadyAt,
        useSkill: actionWindow.usePlayerSkill,
        resolveStrike: playerAction.resolveStrike,
        timerSet: playerAction.timerSet,
        applyCastEffect: playerAction.applyCastEffect,
        applyPreview: playerAction.applyPreview,
        execute: playerAction.execute,
      });
    }
  }

  if (actionWindow.shouldEnemyAct) {
    if ("run" in enemyAction) {
      enemyAction.run();
    } else {
      runWorldEnemyCombatAction({
        canExecute: enemyAction.canExecute,
        enemySpecialReadyAt,
        resolveStrike: enemyAction.resolveStrike,
        timerSet: enemyAction.timerSet,
        applyCastEffect: enemyAction.applyCastEffect,
        applyPreview: enemyAction.applyPreview,
        execute: enemyAction.execute,
      });
    }
  }

  return actionWindow;
};

export const runWorldCombatControllerFrame = <
  TTarget,
  TSkill,
  TPlayerStrike extends { executionTimeMs: number },
  TEnemyStrike extends { executionTimeMs: number },
>({
  autoTarget,
  combatStep,
}: {
  autoTarget: WorldCombatAutoTargetContext<TTarget>;
  combatStep?: {
    now?: number;
    distance: number;
    playerEngagementRange: number;
    playerActionReadyAt: number;
    playerSkillReadyAt: number;
    primaryActiveSkill?: TSkill;
    isAutoBattling: boolean;
    worldCombatTargetId: string | null;
    targetedMonsterInstanceId: string;
    enemyEngagementRange: number;
    enemyActionReadyAt: number;
    enemySpecialReadyAt: number;
    playerAction:
      | WorldCombatPlayerActionRunner
      | WorldCombatPlayerActionConfig<TTarget, TSkill, TPlayerStrike>;
    enemyAction:
      | WorldCombatEnemyActionRunner
      | WorldCombatEnemyActionConfig<TEnemyStrike>;
  };
}): WorldCombatControllerFrameResult => ({
  nextTargetMonsterId: resolveWorldCombatAutoTarget(autoTarget),
  actionWindow: combatStep ? runWorldCombatControllerStep(combatStep) : null,
});
