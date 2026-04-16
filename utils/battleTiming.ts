export interface TimedCombatQueuePlan {
  delayMs: number | undefined;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  onQueue?: () => void;
  execute: () => void;
}

export const scheduleTimedCombatAction = ({
  delayMs,
  execute,
  timerSet,
}: {
  delayMs: number | undefined;
  execute: () => void;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
}) => {
  if ((delayMs ?? 0) > 0) {
    const timer = setTimeout(() => {
      timerSet?.delete(timer);
      execute();
    }, delayMs);
    timerSet?.add(timer);
    return timer;
  }

  execute();
  return undefined;
};

export const queueTimedCombatPlan = ({
  delayMs,
  timerSet,
  onQueue,
  execute,
}: TimedCombatQueuePlan) => {
  onQueue?.();
  return scheduleTimedCombatAction({
    delayMs,
    execute,
    timerSet,
  });
};

export const createTimedCombatPlan = ({
  delayMs,
  timerSet,
  onQueue,
  execute,
}: TimedCombatQueuePlan): TimedCombatQueuePlan => ({
  delayMs,
  timerSet,
  onQueue,
  execute,
});

export const createWorldStrikeQueuePlan = ({
  delayMs,
  timerSet,
  applyCastEffect,
  applyPreview,
  execute,
}: {
  delayMs: number | undefined;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  applyCastEffect?: () => void;
  applyPreview: () => void;
  execute: () => void;
}): TimedCombatQueuePlan =>
  createTimedCombatPlan({
    delayMs,
    timerSet,
    onQueue: () => {
      applyCastEffect?.();
      applyPreview();
    },
    execute,
  });

export const createResolvedWorldStrikeActionPlan = <TStrike,>({
  strike,
  timerSet,
  delayMs,
  applyCastEffect,
  applyPreview,
  execute,
}: {
  strike: TStrike;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  delayMs: (strike: TStrike) => number | undefined;
  applyCastEffect?: (strike: TStrike) => void;
  applyPreview: (strike: TStrike) => void;
  execute: (strike: TStrike) => void;
}) =>
  createWorldStrikeQueuePlan({
    delayMs: delayMs(strike),
    timerSet,
    applyCastEffect: applyCastEffect ? () => applyCastEffect(strike) : undefined,
    applyPreview: () => applyPreview(strike),
    execute: () => execute(strike),
  });

export const getBattleReplayStepDelayMs = ({
  previousTimeMs = 0,
  nextTimeMs,
}: {
  previousTimeMs?: number;
  nextTimeMs?: number;
}) => {
  const resolvedNextTime = nextTimeMs ?? previousTimeMs + 500;
  return Math.max(180, Math.min(900, resolvedNextTime - previousTimeMs || 250));
};

export const createBattleReplayStepPlan = ({
  previousTimeMs = 0,
  nextTimeMs,
  timerSet,
  execute,
}: {
  previousTimeMs?: number;
  nextTimeMs?: number;
  timerSet?: Set<ReturnType<typeof setTimeout>>;
  execute: () => void;
}): TimedCombatQueuePlan =>
  createTimedCombatPlan({
    delayMs: getBattleReplayStepDelayMs({
      previousTimeMs,
      nextTimeMs,
    }),
    timerSet,
    execute,
  });

export const createResolvedTimedCombatPlan = <TResolved,>({
  resolve,
  buildPlan,
}: {
  resolve: () => TResolved;
  buildPlan: (resolved: TResolved) => TimedCombatQueuePlan | undefined;
}) => buildPlan(resolve());

export const queueResolvedTimedCombatPlan = <TResolved,>({
  resolve,
  buildPlan,
}: {
  resolve: () => TResolved;
  buildPlan: (resolved: TResolved) => TimedCombatQueuePlan | undefined;
}) => {
  const plan = createResolvedTimedCombatPlan({ resolve, buildPlan });
  if (!plan) return undefined;
  return queueTimedCombatPlan(plan);
};

export const runResolvedTimedCombatPlan = <TResolved,>({
  readyAt,
  canExecute = () => true,
  resolve,
  buildPlan,
}: {
  readyAt?: number;
  canExecute?: () => boolean;
  resolve: (now: number) => TResolved;
  buildPlan: (resolved: TResolved) => TimedCombatQueuePlan | undefined;
}) => {
  if (!canExecute()) return undefined;

  const now = Date.now();
  if (readyAt !== undefined && now < readyAt) return undefined;

  return queueResolvedTimedCombatPlan({
    resolve: () => resolve(now),
    buildPlan,
  });
};

export const runResolvedWorldStrikeAction = <TResolved, TStrike>({
  readyAt,
  canExecute,
  resolve,
  buildPlan,
}: {
  readyAt?: number;
  canExecute?: () => boolean;
  resolve: (now: number) => TResolved;
  buildPlan: (
    resolved: TResolved
  ) =>
    | {
        strike: TStrike;
        timerSet?: Set<ReturnType<typeof setTimeout>>;
        delayMs: (strike: TStrike) => number | undefined;
        applyCastEffect?: (strike: TStrike) => void;
        applyPreview: (strike: TStrike) => void;
        execute: (strike: TStrike) => void;
      }
    | undefined;
}) =>
  runResolvedTimedCombatPlan({
    readyAt,
    canExecute,
    resolve,
    buildPlan: (resolved) => {
      const plan = buildPlan(resolved);
      if (!plan) return undefined;
      return createResolvedWorldStrikeActionPlan(plan);
    },
  });
