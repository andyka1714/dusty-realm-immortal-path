import { MutableRefObject, useEffect } from 'react';
import { AppDispatch } from '../store/store';
import { addVisualEffect, closeBattleReport, resolveBattle } from '../store/slices/adventureSlice';
import { addLog } from '../store/slices/logSlice';
import { updateQuestProgress } from '../store/slices/questSlice';
import { QUESTS } from '../data/quests';
import { ActiveMonster, Enemy, ProfessionType, BaseAttributes, MajorRealm, SpiritRootId, Coordinate } from '../types';
import { EquipmentStats } from '../types';
import {
  calculatePlayerStats,
  createAutoBattleReplaySession,
  createBattleRewardApplicationPlan,
  getBattleRespawnMapId,
  resolveWorldBattleResultLifecyclePlan,
  runAutoBattleReplayController,
  runWorldCombatControllerFrame,
} from '../utils/battleSystem';
import { getFormalSkillByName } from '../data/skills';
import { resolveQuestKillProgressOnEnemyDefeat } from '../utils/questProgress';
import { getEnemyEngagementRange, getGridDistance } from '../utils/worldCombat';

type UseWorldCombatControllerEffectParams = {
  showIntro: boolean;
  isBattling: boolean;
  isAutoBattling: boolean;
  targetMonsterId: string | null;
  activeMonsters: ActiveMonster[];
  playerPosition: Coordinate;
  targetedMonster: ActiveMonster | null;
  targetedMonsterTemplate: Enemy | null;
  playerEngagementRange: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  enemyActionReadyAtById: Record<string, number>;
  enemySpecialReadyAtById: Record<string, number>;
  worldCombatTargetId: string | null;
  primaryActiveSkill: any;
  setTargetMonsterId: (value: string) => void;
  runPlayerWorldAction: (useSkill: boolean) => void;
  runEnemyWorldAction: () => void;
};

export const useWorldCombatControllerEffect = ({
  showIntro,
  isBattling,
  isAutoBattling,
  targetMonsterId,
  activeMonsters,
  playerPosition,
  targetedMonster,
  targetedMonsterTemplate,
  playerEngagementRange,
  playerActionReadyAt,
  playerSkillReadyAt,
  enemyActionReadyAtById,
  enemySpecialReadyAtById,
  worldCombatTargetId,
  primaryActiveSkill,
  setTargetMonsterId,
  runPlayerWorldAction,
  runEnemyWorldAction,
}: UseWorldCombatControllerEffectParams) => {
  useEffect(() => {
    if (showIntro || isBattling) return;

    const interval = setInterval(() => {
      const controllerFrame = runWorldCombatControllerFrame({
        autoTarget: {
          isAutoBattling,
          isBattling,
          hasTargetMonster: Boolean(targetMonsterId),
          showIntro,
          targets: activeMonsters,
          getId: (monster) => monster.instanceId,
          getDistance: (monster) => getGridDistance(playerPosition, monster),
        },
        combatStep:
          targetedMonster && targetedMonsterTemplate
            ? {
                distance: getGridDistance(playerPosition, targetedMonster),
                playerEngagementRange,
                playerActionReadyAt,
                playerSkillReadyAt,
                primaryActiveSkill,
                isAutoBattling,
                worldCombatTargetId,
                targetedMonsterInstanceId: targetedMonster.instanceId,
                enemyEngagementRange: getEnemyEngagementRange(targetedMonsterTemplate),
                enemyActionReadyAt:
                  enemyActionReadyAtById[targetedMonster.instanceId] ?? 0,
                enemySpecialReadyAt:
                  enemySpecialReadyAtById[targetedMonster.instanceId] ?? 0,
                playerAction: {
                  run: runPlayerWorldAction,
                },
                enemyAction: {
                  run: runEnemyWorldAction,
                },
              }
            : undefined,
      });

      if (controllerFrame.nextTargetMonsterId) {
        setTargetMonsterId(controllerFrame.nextTargetMonsterId);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [
    showIntro,
    isBattling,
    isAutoBattling,
    targetMonsterId,
    activeMonsters,
    playerPosition,
    targetedMonster,
    targetedMonsterTemplate,
    playerEngagementRange,
    playerActionReadyAt,
    playerSkillReadyAt,
    enemyActionReadyAtById,
    enemySpecialReadyAtById,
    worldCombatTargetId,
    primaryActiveSkill,
    setTargetMonsterId,
    runPlayerWorldAction,
    runEnemyWorldAction,
  ]);
};

type UseBattleResultLifecycleEffectParams = {
  dispatch: AppDispatch;
  lastBattleResult: 'won' | 'lost' | null;
  isReplayingBattle: boolean;
  isAutoBattling: boolean;
  setTargetMonsterId: (value: string | null) => void;
  setAutoMovePath: (path: Coordinate[]) => void;
  setIsAutoBattling: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useBattleResultLifecycleEffect = ({
  dispatch,
  lastBattleResult,
  isReplayingBattle,
  isAutoBattling,
  setTargetMonsterId,
  setAutoMovePath,
  setIsAutoBattling,
}: UseBattleResultLifecycleEffectParams) => {
  useEffect(() => {
    const lifecyclePlan = resolveWorldBattleResultLifecyclePlan({
      lastBattleResult,
      isReplayingBattle,
      isAutoBattling,
    });

    if (lifecyclePlan.shouldClearTargetMonster) setTargetMonsterId(null);
    if (lifecyclePlan.shouldClearAutoMovePath) setAutoMovePath([]);
    if (lifecyclePlan.shouldStopAutoBattle) setIsAutoBattling(false);

    if (lifecyclePlan.autoCloseDelayMs === null) return;

    const timer = setTimeout(() => {
      dispatch(closeBattleReport());
    }, lifecyclePlan.autoCloseDelayMs);

    return () => clearTimeout(timer);
  }, [
    lastBattleResult,
    isReplayingBattle,
    isAutoBattling,
    dispatch,
    setTargetMonsterId,
    setAutoMovePath,
    setIsAutoBattling,
  ]);
};

type UseAutoBattleReplayControllerEffectParams = {
  dispatch: AppDispatch;
  isBattling: boolean;
  lastBattleResult: 'won' | 'lost' | null;
  isReplayingBattle: boolean;
  replayQueue: any[];
  battleSnapshot: any;
  displayedLogs: any[];
  currentEnemy: Enemy | null;
  currentEnemyInstanceId: string | null;
  activeMonsters: ActiveMonster[];
  activeQuests: Record<string, { progress: number; isReadyToComplete: boolean }>;
  completedQuests: string[];
  playerPosition: Coordinate;
  attributes: BaseAttributes;
  majorRealm: MajorRealm;
  spiritRootId: SpiritRootId;
  equipmentStats: EquipmentStats;
  characterName: string;
  profession: ProfessionType;
  characterSkills: string[];
  battleProcessedRef: MutableRefObject<boolean>;
  replayTimerSet: Set<ReturnType<typeof setTimeout>>;
  applyBattleReplayState: (replayState: any) => void;
  dispatchWorldStrikeVisualPlan: (visualPlan: any) => void;
  applyBattleRewardApplicationPlan: (rewardApplicationPlan: any) => void;
  clearReplayTimers: () => void;
};

export const useAutoBattleReplayControllerEffect = ({
  dispatch,
  isBattling,
  lastBattleResult,
  isReplayingBattle,
  replayQueue,
  battleSnapshot,
  displayedLogs,
  currentEnemy,
  currentEnemyInstanceId,
  activeMonsters,
  activeQuests,
  completedQuests,
  playerPosition,
  attributes,
  majorRealm,
  spiritRootId,
  equipmentStats,
  characterName,
  profession,
  characterSkills,
  battleProcessedRef,
  replayTimerSet,
  applyBattleReplayState,
  dispatchWorldStrikeVisualPlan,
  applyBattleRewardApplicationPlan,
  clearReplayTimers,
}: UseAutoBattleReplayControllerEffectParams) => {
  useEffect(() => {
    const replaySession = battleSnapshot
      ? {
          displayedLogs,
          replayQueue,
          battleSnapshot,
        }
      : null;
    const replayController = runAutoBattleReplayController({
      isBattling,
      hasCurrentEnemy: Boolean(currentEnemy),
      lastBattleResult,
      replayProcessed: battleProcessedRef.current,
      createReplaySession: currentEnemy
        ? () => {
            const playerStats = calculatePlayerStats(
              attributes,
              majorRealm,
              spiritRootId,
              equipmentStats,
              characterName,
              profession,
              characterSkills
            );
            return createAutoBattleReplaySession(playerStats, currentEnemy);
          }
        : undefined,
      isReplayingBattle,
      replaySession,
      currentEnemy,
      currentEnemyInstanceId,
      activeMonsters,
      respawnMapId: getBattleRespawnMapId(completedQuests),
      resolveSkillByName: getFormalSkillByName,
      timerSet: replayTimerSet,
      playerPosition,
      enemyAttackRange: currentEnemy?.attackRange,
      executeStepStatePlan: (stepStatePlan) => {
        applyBattleReplayState(stepStatePlan.replayState);

        if (stepStatePlan.shouldAutoScroll) {
          const logContainer = document.getElementById('battle-log-container');
          if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
        }

        dispatchWorldStrikeVisualPlan(stepStatePlan.visualPlan);
      },
    });

    battleProcessedRef.current = replayController.nextProcessed;

    if (replayController.shouldClearReplayTimers) {
      battleProcessedRef.current = false;
      clearReplayTimers();
    }

    if (replayController.kind === 'transition') {
      applyBattleReplayState(replayController.replayState);
      return;
    }

    if (replayController.kind === 'finish') {
      const { finishResultPlan } = replayController;
      if (finishResultPlan.shouldStopReplay) {
        applyBattleReplayState({
          displayedLogs,
          replayQueue: [],
          battleSnapshot: null,
          isReplayingBattle: false,
        });
      }

      finishResultPlan.finishEffects.forEach((effect) => dispatch(addVisualEffect(effect)));

      dispatch(resolveBattle(finishResultPlan.battleResult));

      if (finishResultPlan.battleResult.won && currentEnemy) {
        Object.entries(activeQuests).forEach(([questId, activeQuestState]) => {
          const quest = QUESTS[questId];
          if (!quest) return;

          const update = resolveQuestKillProgressOnEnemyDefeat({
            quest,
            activeQuestState,
            defeatedEnemyId: currentEnemy.id,
            majorRealm,
          });

          if (!update) return;

          dispatch(
            updateQuestProgress({
              questId,
              progress: update.progress,
              isReady: update.isReadyToComplete,
            })
          );
        });
      }

      if (finishResultPlan.rewardManifest) {
        applyBattleRewardApplicationPlan(
          createBattleRewardApplicationPlan({
            rewardManifest: finishResultPlan.rewardManifest,
          })
        );
      } else if (finishResultPlan.defeatLogMessage) {
        dispatch(addLog({ message: finishResultPlan.defeatLogMessage, type: 'danger' }));
      }

      return;
    }

    if (replayController.kind !== 'step') {
      return;
    }

    return () => clearTimeout(replayController.timer);
  }, [
    isBattling,
    lastBattleResult,
    isReplayingBattle,
    replayQueue,
    battleSnapshot,
    displayedLogs,
    currentEnemy,
    currentEnemyInstanceId,
    activeMonsters,
    activeQuests,
    completedQuests,
    playerPosition,
    attributes,
    majorRealm,
    spiritRootId,
    equipmentStats,
    characterName,
    profession,
    characterSkills,
    dispatch,
    battleProcessedRef,
    replayTimerSet,
    applyBattleReplayState,
    dispatchWorldStrikeVisualPlan,
    applyBattleRewardApplicationPlan,
    clearReplayTimers,
  ]);
};
