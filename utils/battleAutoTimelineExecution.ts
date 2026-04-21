import { CombatLog, Enemy } from "../types";
import {
  type CombatLoopFeatureFlags,
  type CombatRuntimeContext,
  createCombatLoopFeatureFlags,
  createCombatRuntimeContext,
  prepareCombatLoopEnvironment,
} from "./battleEncounter";
import {
  type CombatLoopState,
  applyPreparedCombatLoopState,
  createInitialCombatLoopState,
  runCombatTimelineLoop,
} from "./battleTimeline";
import {
  finalizeCombatResult,
  type AutoBattleTimelineResult,
} from "./battleTimelineResults";
import { clearCombatLogSnapshotProvider } from "./battleLog";
import type { PreparedAutoBattleExecution } from "./battleAutoTimelineTypes";
import { resolveCombatLoopStep } from "./battleAutoTimelineLoop";
import type { CombatStatusLike } from "./battleStatusTypes";
import type { PlayerCombatStats } from "./battleSystem";

export const prepareAutoBattleExecution = (
  player: PlayerCombatStats,
  enemy: Enemy,
  logs: CombatLog[]
): PreparedAutoBattleExecution => {
  let state = createInitialCombatLoopState<CombatStatusLike>(player, enemy);
  let lastStatusTickMs = 0;

  const {
    activeSkill,
    playerAttackIntervalMs,
    enemyAttackIntervalMs,
    pVsE,
    enemyElementalAffinity,
    passiveFlags,
  } = createCombatRuntimeContext(player, enemy);
  const featureFlags = createCombatLoopFeatureFlags(passiveFlags);

  const runtimeContext = {
    activeSkill: activeSkill ?? undefined,
    playerAttackIntervalMs,
    enemyAttackIntervalMs,
    pVsE,
    enemyElementalAffinity,
    passiveFlags,
  } satisfies CombatRuntimeContext;

  const {
    processStatusTicks,
    playerStatuses: seededPlayerStatuses,
    enemySpecialReadyAtMs: seededEnemySpecialReadyAtMs,
  } = prepareCombatLoopEnvironment({
    player,
    enemy,
    logs,
    runtimeContext,
    getTurn: () => state.turn,
    playerStatusesRef: () => state.playerStatuses,
    enemyStatusesRef: () => state.enemyStatuses,
    activeSkillReadyAtMsRef: () => state.activeSkillReadyAtMs,
    getPlayerHp: () => state.playerHp,
    getEnemyHp: () => state.enemyHp,
    setPlayerHp: (value) => {
      state.playerHp = value;
    },
    setEnemyHp: (value) => {
      state.enemyHp = value;
    },
    setPlayerStatuses: (value) => {
      state.playerStatuses = value;
    },
    setEnemyStatuses: (value) => {
      state.enemyStatuses = value;
    },
    getLastStatusTickMs: () => lastStatusTickMs,
    setLastStatusTickMs: (value) => {
      lastStatusTickMs = value;
    },
    getPlayerDamagedSinceSwordHeartWindow: () =>
      state.playerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow: (value) => {
      state.playerDamagedSinceSwordHeartWindow = value;
    },
    playerHp: state.playerHp,
    enemyHp: state.enemyHp,
    playerStatuses: state.playerStatuses,
  });

  state = applyPreparedCombatLoopState(state, {
    playerStatuses: seededPlayerStatuses,
    enemySpecialReadyAtMs: seededEnemySpecialReadyAtMs,
  });

  return {
    state,
    runtimeContext,
    featureFlags,
    processStatusTicks,
  };
};

export const executeAutoBattleTimeline = ({
  player,
  enemy,
  logs,
  prepared,
}: {
  player: PlayerCombatStats;
  enemy: Enemy;
  logs: CombatLog[];
  prepared: PreparedAutoBattleExecution;
}): AutoBattleTimelineResult => {
  const finalState = runCombatTimelineLoop({
    initialState: prepared.state,
    processStatusTicks: prepared.processStatusTicks,
    player,
    enemy,
    logs,
    runtimeContext: prepared.runtimeContext,
    featureFlags: prepared.featureFlags,
    resolveCombatLoopStep,
  });

  return finalizeCombatResult({
    won: finalState.playerHp > 0 && finalState.enemyHp <= 0,
    logs,
    turn: finalState.turn,
    currentTimeMs: finalState.currentTimeMs,
    playerMaxHp: player.maxHp,
    enemy,
    playerHp: finalState.playerHp,
    enemyHp: finalState.enemyHp,
  });
};

export { clearCombatLogSnapshotProvider };
