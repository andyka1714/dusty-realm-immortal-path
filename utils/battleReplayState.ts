import { ActiveMonster, CombatLog, Enemy } from "../types";
import type {
  AdvancedAutoBattleReplaySession,
  AutoBattleReplayOutcome,
  AutoBattleReplaySession,
  AutoBattleReplayState,
} from "./battleReplayTypes";

export const createAutoBattleReplayState = ({
  session,
  isReplayingBattle = true,
}: {
  session: AutoBattleReplaySession;
  isReplayingBattle?: boolean;
}): AutoBattleReplayState => ({
  displayedLogs: session.displayedLogs,
  replayQueue: session.replayQueue,
  battleSnapshot: session.battleSnapshot,
  isReplayingBattle,
});

export const createIdleAutoBattleReplayState =
  (): AutoBattleReplayState => ({
    displayedLogs: [],
    replayQueue: [],
    battleSnapshot: null,
    isReplayingBattle: false,
  });

export const advanceAutoBattleReplaySession = (
  session: AutoBattleReplaySession
): AdvancedAutoBattleReplaySession => {
  const [nextLog, ...remainingReplayQueue] = session.replayQueue;
  if (!nextLog) {
    return { nextSession: session };
  }

  return {
    nextLog,
    nextSession: {
      ...session,
      displayedLogs: [...session.displayedLogs, nextLog],
      replayQueue: remainingReplayQueue,
      battleSnapshot:
        nextLog.playerHp !== undefined
          ? {
              ...session.battleSnapshot,
              playerHp: nextLog.playerHp,
              enemyHp: nextLog.enemyHp,
            }
          : session.battleSnapshot,
    },
  };
};

export const resolveAutoBattleReplayOutcome = ({
  battleSnapshot,
  displayedLogs,
  currentEnemy,
  currentEnemyInstanceId,
  activeMonsters,
  respawnMapId,
}: {
  battleSnapshot: AutoBattleReplaySession["battleSnapshot"];
  displayedLogs: CombatLog[];
  currentEnemy?: Enemy | null;
  currentEnemyInstanceId?: string | null;
  activeMonsters: ActiveMonster[];
  respawnMapId?: string;
}): AutoBattleReplayOutcome => {
  const defeatedMonster =
    battleSnapshot.won && currentEnemyInstanceId
      ? activeMonsters.find(
          (monster) => monster.instanceId === currentEnemyInstanceId
        ) ?? null
      : null;

  return {
    won: battleSnapshot.won,
    logs: displayedLogs,
    respawnMapId: battleSnapshot.won ? undefined : respawnMapId,
    defeatedMonster,
    rewards: battleSnapshot.won ? battleSnapshot.rewards : undefined,
    defeatLogMessage:
      !battleSnapshot.won && currentEnemy
        ? `不敵 ${currentEnemy.name}，狼狽逃回。`
        : undefined,
  };
};
