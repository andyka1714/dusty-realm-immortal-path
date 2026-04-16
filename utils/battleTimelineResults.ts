import { CombatLog, Enemy, ItemInstance, ItemQuality } from "../types";
import { getDropRewards } from "../data/drop_tables";
import { getItem } from "../data/items";
import { generateDrops } from "./dropSystem";

export interface AutoBattleRewards {
  spiritStones: number;
  exp: number;
  drops: { itemId: string; count: number; instance?: ItemInstance }[];
}

export interface AutoBattleTimelineResult {
  won: boolean;
  logs: CombatLog[];
  rewards?: AutoBattleRewards;
}

type PushCombatLog = (logs: CombatLog[], log: CombatLog) => void;

const buildVictoryLootMessage = (
  formatSpiritStones: (amount: number) => string,
  spiritStones: number,
  drops: { itemId: string; count: number; instance?: ItemInstance }[]
) => {
  let lootMsg = "";

  if (spiritStones > 0) {
    lootMsg += formatSpiritStones(spiritStones);
  }

  if (drops.length > 0) {
    if (lootMsg) lootMsg += "，";
    const dropNames = drops.map((d) => {
      const item = getItem(d.itemId);
      const name = item ? item.name : d.itemId;
      let qStr = "";
      let qVal = 0;

      if (d.instance) {
        qVal = d.instance.quality;
      } else if (item) {
        qVal = item.quality || 0;
      }

      if (qVal === ItemQuality.Low) qStr = "(下品)";
      if (qVal === ItemQuality.Medium) qStr = "(中品)";
      if (qVal === ItemQuality.High) qStr = "(上品)";
      if (qVal === ItemQuality.Immortal) qStr = "(仙品)";

      return `<item q="${qVal}">${name}${qStr}</item>`;
    });
    lootMsg += dropNames.join("，");
  }

  return lootMsg;
};

export const resolveVictoryRewards = ({
  enemy,
  logs,
  turn,
  currentTimeMs,
  playerHp,
  playerMaxHp,
  enemyHp,
  pushCombatLog,
  formatSpiritStones,
}: {
  enemy: Enemy;
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  pushCombatLog: PushCombatLog;
  formatSpiritStones: (amount: number) => string;
}): AutoBattleRewards => {
  const exp = enemy.exp || 0;
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: `<acc>擊敗了</acc> <enemy rank="${enemy.rank}">${enemy.name}</enemy>，獲得 <exp>${exp} 修為</exp>`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  let { spiritStones } = getDropRewards(enemy);
  const drops = generateDrops(enemy);
  const finalDrops: { itemId: string; count: number; instance?: ItemInstance }[] = [];

  drops.forEach((d) => {
    if (d.itemId === "spirit_stone") {
      spiritStones += d.count;
    } else {
      finalDrops.push(d);
    }
  });

  if (spiritStones > 0 || finalDrops.length > 0) {
    const lootMsg = buildVictoryLootMessage(
      formatSpiritStones,
      spiritStones,
      finalDrops
    );

    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `獲得戰利品：${lootMsg}`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  return { spiritStones, exp, drops };
};

export const createCombatDefeatLog = ({
  logs,
  turn,
  currentTimeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  pushCombatLog,
}: {
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  pushCombatLog: PushCombatLog;
}) => {
  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: false,
    message: `不敵 [${enemy.name}]，身受重傷...`,
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });
};

export const finalizeCombatResult = ({
  won,
  logs,
  turn,
  currentTimeMs,
  playerMaxHp,
  enemy,
  playerHp,
  enemyHp,
  pushCombatLog,
  formatSpiritStones,
}: {
  won: boolean;
  logs: CombatLog[];
  turn: number;
  currentTimeMs: number;
  playerMaxHp: number;
  enemy: Enemy;
  playerHp: number;
  enemyHp: number;
  pushCombatLog: PushCombatLog;
  formatSpiritStones: (amount: number) => string;
}): AutoBattleTimelineResult => {
  if (won) {
    const rewards = resolveVictoryRewards({
      enemy,
      logs,
      turn,
      currentTimeMs,
      playerHp,
      playerMaxHp,
      enemyHp,
      pushCombatLog,
      formatSpiritStones,
    });

    return { won, logs, rewards };
  }

  createCombatDefeatLog({
    logs,
    turn,
    currentTimeMs,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    pushCombatLog,
  });

  return { won, logs };
};
