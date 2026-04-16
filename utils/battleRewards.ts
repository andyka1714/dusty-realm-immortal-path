import { Enemy, ItemInstance, LogEntry } from "../types";
import { getItem } from "../data/items";
import { getDropRewards } from "../data/drop_tables";
import { generateDrops } from "./dropSystem";
import { formatSpiritStone } from "./currency";

export interface BattleRewardManifest {
  expAmount: number;
  spiritStoneAwards: number[];
  inventoryRewards: {
    itemId: string;
    count: number;
    instance?: ItemInstance;
  }[];
  expLogMessage?: string;
  lootLogMessage?: string;
}

export interface BattleLogEntryPlan {
  message: string;
  type: LogEntry["type"];
}

export interface BattleRewardApplicationPlan {
  expAmount: number;
  spiritStoneAwards: number[];
  inventoryRewards: BattleRewardManifest["inventoryRewards"];
  logEntries: BattleLogEntryPlan[];
}

type BattleRewardSource = {
  spiritStones: number;
  exp: number;
  drops: { itemId: string; count: number; instance?: ItemInstance }[];
};

export const createBattleRewardManifest = ({
  enemy,
  rewards,
}: {
  enemy: Enemy;
  rewards?: BattleRewardSource;
}): BattleRewardManifest => {
  const expAmount = rewards?.exp && rewards.exp > 0 ? rewards.exp : enemy.exp;
  const spiritStones = rewards?.spiritStones ?? getDropRewards(enemy).spiritStones;
  const drops = rewards?.drops ?? generateDrops(enemy);
  const spiritStoneAwards: number[] = [];
  const inventoryRewards: BattleRewardManifest["inventoryRewards"] = [];
  const lootParts: string[] = [];

  if (spiritStones > 0) {
    spiritStoneAwards.push(spiritStones);
    lootParts.push(formatSpiritStone(spiritStones));
  }

  drops.forEach((drop) => {
    if (drop.itemId === "spirit_stone") {
      spiritStoneAwards.push(drop.count);
      lootParts.push(formatSpiritStone(drop.count));
      return;
    }

    inventoryRewards.push({
      itemId: drop.itemId,
      count: drop.count,
      instance: drop.instance,
    });

    const item = getItem(drop.itemId);
    if (!item) return;

    const qualityValue = drop.instance?.quality ?? item.quality ?? 0;
    let itemStr = item.name;
    if (qualityValue === 0) itemStr += "(下品)";
    if (qualityValue === 1) itemStr += "(中品)";
    if (qualityValue === 2) itemStr += "(上品)";
    if (qualityValue === 3) itemStr += "(仙品)";

    lootParts.push(
      drop.count > 1
        ? `<item q="${qualityValue}">${itemStr}</item> x${drop.count}`
        : `<item q="${qualityValue}">${itemStr}</item>`
    );
  });

  return {
    expAmount,
    spiritStoneAwards,
    inventoryRewards,
    expLogMessage:
      expAmount > 0
        ? `擊敗 <enemy rank="${enemy.rank}">${enemy.name}</enemy>，獲得 <exp>${expAmount} 修為</exp>`
        : undefined,
    lootLogMessage:
      lootParts.length > 0 ? `獲得戰利品：${lootParts.join("，")}` : undefined,
  };
};

export const createBattleRewardApplicationPlan = ({
  rewardManifest,
}: {
  rewardManifest: BattleRewardManifest;
}): BattleRewardApplicationPlan => {
  const logEntries: BattleLogEntryPlan[] = [];

  if (rewardManifest.expLogMessage) {
    logEntries.push({
      message: rewardManifest.expLogMessage,
      type: "gain",
    });
  }

  if (rewardManifest.lootLogMessage) {
    logEntries.push({
      message: rewardManifest.lootLogMessage,
      type: "gold",
    });
  }

  return {
    expAmount: rewardManifest.expAmount,
    spiritStoneAwards: rewardManifest.spiritStoneAwards,
    inventoryRewards: rewardManifest.inventoryRewards,
    logEntries,
  };
};
