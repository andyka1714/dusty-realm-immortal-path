import { CombatLog, Enemy } from "../types";
import {
  clearCombatLogSnapshotProvider,
  executeAutoBattleTimeline,
  prepareAutoBattleExecution,
} from "./battleAutoTimelineExecution";
import type { AutoBattleTimelineResult } from "./battleTimelineResults";
import type { AutoBattleReplaySession } from "./battleReplayTypes";
import type { PlayerCombatStats } from "./battleSystem";

export const runAutoBattle = (
  player: PlayerCombatStats,
  enemy: Enemy
): AutoBattleTimelineResult => {
  const logs: CombatLog[] = [];
  const result = executeAutoBattleTimeline({
    player,
    enemy,
    logs,
    prepared: prepareAutoBattleExecution(player, enemy, logs),
  });
  clearCombatLogSnapshotProvider();
  return result;
};

export const createAutoBattleReplaySession = (
  player: PlayerCombatStats,
  enemy: Enemy
): AutoBattleReplaySession => {
  const { won, logs, rewards } = runAutoBattle(player, enemy);
  const firstLog =
    logs[0] ??
    ({
      turn: 1,
      message: `你與 ${enemy.name} 展開交戰。`,
      isPlayer: true,
      playerHp: player.hp,
      playerMaxHp: player.maxHp,
      enemyHp: enemy.hp,
      enemyMaxHp: enemy.hp,
    } satisfies CombatLog);

  return {
    displayedLogs: [firstLog],
    replayQueue: logs.slice(1),
    battleSnapshot: {
      playerHp: firstLog.playerHp ?? player.hp,
      playerMaxHp: firstLog.playerMaxHp ?? player.maxHp,
      enemyHp: firstLog.enemyHp ?? enemy.hp,
      enemyMaxHp: firstLog.enemyMaxHp ?? enemy.hp,
      won,
      rewards,
    },
  };
};
