import { AppDispatch } from '../store/store';
import { enterMap } from '../store/slices/adventureSlice';
import { addSpiritStones, gainExperience } from '../store/slices/characterSlice';
import { addItem } from '../store/slices/inventorySlice';
import { addLog } from '../store/slices/logSlice';
import { Coordinate } from '../types';
import {
  createAutoBattleReplayState,
  createBattleRewardApplicationPlan,
  createResetWorldCombatEncounterState,
  createWorldPlayerDefeatStatePlan,
} from './battleSystem';

type BattleReplayState = ReturnType<typeof createAutoBattleReplayState>;
type WorldCombatEncounterState = ReturnType<typeof createResetWorldCombatEncounterState>;
type BattleRewardApplicationPlan = ReturnType<typeof createBattleRewardApplicationPlan>;
type WorldPlayerDefeatStatePlan = ReturnType<typeof createWorldPlayerDefeatStatePlan>;

type AdventureBattleUiBridgeParams = {
  dispatch: AppDispatch;
  setDisplayedLogs: (displayedLogs: BattleReplayState['displayedLogs']) => void;
  setReplayQueue: (replayQueue: BattleReplayState['replayQueue']) => void;
  setBattleSnapshot: (battleSnapshot: BattleReplayState['battleSnapshot']) => void;
  setIsReplayingBattle: (isReplayingBattle: BattleReplayState['isReplayingBattle']) => void;
  setWorldCombatTargetId: (worldCombatTargetId: WorldCombatEncounterState['worldCombatTargetId']) => void;
  setWorldCombatTargetStatuses: (
    worldCombatTargetStatuses: WorldCombatEncounterState['worldCombatTargetStatuses']
  ) => void;
  setWorldCombatPlayerStatuses: (
    worldCombatPlayerStatuses: WorldCombatEncounterState['worldCombatPlayerStatuses']
  ) => void;
  setWorldLastCombatMessage: (
    worldLastCombatMessage: WorldCombatEncounterState['worldLastCombatMessage']
  ) => void;
  setWorldPlayerShield: (worldPlayerShield: WorldCombatEncounterState['worldPlayerShield']) => void;
  setPlayerActionReadyAt: (
    playerActionReadyAt: WorldCombatEncounterState['playerActionReadyAt']
  ) => void;
  setPlayerSkillReadyAt: (playerSkillReadyAt: WorldCombatEncounterState['playerSkillReadyAt']) => void;
  setEnemyActionReadyAtById: (
    enemyActionReadyAtById: WorldCombatEncounterState['enemyActionReadyAtById']
  ) => void;
  setEnemySpecialReadyAtById: (
    enemySpecialReadyAtById: WorldCombatEncounterState['enemySpecialReadyAtById']
  ) => void;
  setTargetMonsterId: (targetMonsterId: string | null) => void;
  setAutoMovePath: (path: Coordinate[]) => void;
  setIsAutoBattling: (isAutoBattling: boolean) => void;
  setWorldPlayerHp: (worldPlayerHp: number) => void;
  clearWorldCombatTimers: () => void;
};

export const createAdventureBattleUiBridge = ({
  dispatch,
  setDisplayedLogs,
  setReplayQueue,
  setBattleSnapshot,
  setIsReplayingBattle,
  setWorldCombatTargetId,
  setWorldCombatTargetStatuses,
  setWorldCombatPlayerStatuses,
  setWorldLastCombatMessage,
  setWorldPlayerShield,
  setPlayerActionReadyAt,
  setPlayerSkillReadyAt,
  setEnemyActionReadyAtById,
  setEnemySpecialReadyAtById,
  setTargetMonsterId,
  setAutoMovePath,
  setIsAutoBattling,
  setWorldPlayerHp,
  clearWorldCombatTimers,
}: AdventureBattleUiBridgeParams) => {
  const applyBattleReplayState = ({
    displayedLogs,
    replayQueue,
    battleSnapshot,
    isReplayingBattle,
  }: BattleReplayState) => {
    setDisplayedLogs(displayedLogs);
    setReplayQueue(replayQueue);
    setBattleSnapshot(battleSnapshot);
    setIsReplayingBattle(isReplayingBattle);
  };

  const applyWorldCombatEncounterState = ({
    worldCombatTargetId,
    worldCombatTargetStatuses,
    worldCombatPlayerStatuses,
    worldLastCombatMessage,
    worldPlayerShield,
    playerActionReadyAt,
    playerSkillReadyAt,
    enemyActionReadyAtById,
    enemySpecialReadyAtById,
  }: WorldCombatEncounterState) => {
    setWorldCombatTargetId(worldCombatTargetId);
    setWorldCombatTargetStatuses(worldCombatTargetStatuses);
    setWorldCombatPlayerStatuses(worldCombatPlayerStatuses);
    setWorldLastCombatMessage(worldLastCombatMessage);
    setWorldPlayerShield(worldPlayerShield);
    setPlayerActionReadyAt(playerActionReadyAt);
    setPlayerSkillReadyAt(playerSkillReadyAt);
    setEnemyActionReadyAtById(enemyActionReadyAtById);
    setEnemySpecialReadyAtById(enemySpecialReadyAtById);
  };

  const applyBattleRewardApplicationPlan = (rewardApplicationPlan: BattleRewardApplicationPlan) => {
    if (rewardApplicationPlan.expAmount > 0) {
      dispatch(gainExperience(rewardApplicationPlan.expAmount));
    }
    rewardApplicationPlan.spiritStoneAwards.forEach((amount) => {
      dispatch(addSpiritStones({ amount, source: 'battle' }));
    });
    rewardApplicationPlan.inventoryRewards.forEach((drop) => {
      dispatch(addItem({ itemId: drop.itemId, count: drop.count, instance: drop.instance }));
    });
    rewardApplicationPlan.logEntries.forEach((logEntry) => {
      dispatch(addLog(logEntry));
    });
  };

  const applyWorldPlayerDefeatStatePlan = (defeatStatePlan: WorldPlayerDefeatStatePlan | undefined) => {
    if (!defeatStatePlan) return;

    dispatch(addLog(defeatStatePlan.logEntry));
    dispatch(
      enterMap({
        mapId: defeatStatePlan.respawnMapId,
        startX: defeatStatePlan.startX,
        startY: defeatStatePlan.startY,
      })
    );
    if (defeatStatePlan.shouldClearTargetMonster) setTargetMonsterId(null);
    if (defeatStatePlan.shouldClearAutoMovePath) setAutoMovePath([]);
    if (defeatStatePlan.shouldStopAutoBattle) setIsAutoBattling(false);
    setWorldPlayerHp(defeatStatePlan.nextWorldPlayerHp);
    applyWorldCombatEncounterState(defeatStatePlan.encounterState);
    if (defeatStatePlan.shouldClearWorldCombatTimers) {
      clearWorldCombatTimers();
    }
  };

  return {
    applyBattleReplayState,
    applyWorldCombatEncounterState,
    applyBattleRewardApplicationPlan,
    applyWorldPlayerDefeatStatePlan,
  };
};
