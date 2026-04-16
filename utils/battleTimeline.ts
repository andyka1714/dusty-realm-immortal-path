export type CombatLoopState<TStatus = unknown> = {
  turn: number;
  currentTimeMs: number;
  playerNextActionMs: number;
  enemyNextActionMs: number;
  activeSkillReadyAtMs: number;
  enemySpecialReadyAtMs: number;
  bossBroken: boolean;
  playerDebuffed: boolean;
  lastRegenTimeMs: number;
  playerHp: number;
  enemyHp: number;
  playerMp: number;
  playerStatuses: TStatus[];
  enemyStatuses: TStatus[];
  swordDeathWardUsed: boolean;
  bodyRebirthTrueUsed: boolean;
  bodyTribulationStacks: number;
  mageFoundationStacks: number;
  swordHeartStacks: number;
  playerDamagedSinceSwordHeartWindow: boolean;
  nextSwordImmortalGuardAtMs: number;
};

export const buildCombatLoopState = <TStatus>(
  state: CombatLoopState<TStatus>
): CombatLoopState<TStatus> => ({ ...state });

export const buildCombatLoopStepResult = <TStatus>({
  combatEnded,
  state,
}: {
  combatEnded: boolean;
  state: CombatLoopState<TStatus>;
}) => ({
  combatEnded,
  state: buildCombatLoopState(state),
});

export const applyPreparedCombatLoopState = <TStatus>(
  state: CombatLoopState<TStatus>,
  prepared: {
    playerStatuses: TStatus[];
    enemySpecialReadyAtMs: number;
  }
): CombatLoopState<TStatus> => ({
  ...state,
  playerStatuses: prepared.playerStatuses,
  enemySpecialReadyAtMs: prepared.enemySpecialReadyAtMs,
});

export const createInitialCombatLoopState = <TStatus = never>(
  player: { hp: number; mp: number },
  enemy: { hp: number }
): CombatLoopState<TStatus> => ({
  turn: 1,
  currentTimeMs: 0,
  playerNextActionMs: 0,
  enemyNextActionMs: 0,
  activeSkillReadyAtMs: 0,
  enemySpecialReadyAtMs: 0,
  bossBroken: false,
  playerDebuffed: false,
  lastRegenTimeMs: 0,
  playerHp: player.hp,
  enemyHp: enemy.hp,
  playerMp: player.mp,
  playerStatuses: [],
  enemyStatuses: [],
  swordDeathWardUsed: false,
  bodyRebirthTrueUsed: false,
  bodyTribulationStacks: 0,
  mageFoundationStacks: 0,
  swordHeartStacks: 0,
  playerDamagedSinceSwordHeartWindow: false,
  nextSwordImmortalGuardAtMs: 5000,
});

export const runCombatTimelineLoop = <TStatus, TPlayer, TEnemy, TLog, TRuntimeContext, TFeatureFlags>(
  {
    initialState,
    processStatusTicks,
    player,
    enemy,
    logs,
    runtimeContext,
    featureFlags,
    resolveCombatLoopStep,
  }: {
    initialState: CombatLoopState<TStatus>;
    processStatusTicks: (currentMs: number) => void;
    player: TPlayer;
    enemy: TEnemy;
    logs: TLog[];
    runtimeContext: TRuntimeContext;
    featureFlags: TFeatureFlags;
    resolveCombatLoopStep: (args: {
      state: CombatLoopState<TStatus>;
      processStatusTicks: (currentMs: number) => void;
      player: TPlayer;
      enemy: TEnemy;
      logs: TLog[];
      runtimeContext: TRuntimeContext;
      featureFlags: TFeatureFlags;
    }) => {
      combatEnded: boolean;
      state: CombatLoopState<TStatus>;
    };
  }
) => {
  const state = initialState;

  while (state.playerHp > 0 && state.enemyHp > 0) {
    const loopStep = resolveCombatLoopStep({
      state,
      processStatusTicks,
      player,
      enemy,
      logs,
      runtimeContext,
      featureFlags,
    });

    Object.assign(state, loopStep.state);

    if (loopStep.combatEnded) break;
  }

  return state;
};
