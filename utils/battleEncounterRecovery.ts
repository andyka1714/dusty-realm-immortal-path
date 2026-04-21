import { CombatLog } from "../types";
import { pushCombatLog } from "./battleLog";
import type { EncounterPlayerCombatStatsLike } from "./battleEncounterTypes";
import { isNegativeStatusKind } from "./battleStatuses";
import type { CombatStatusLike } from "./battleStatusTypes";

const getPassiveRegenMessages = (options: {
  healAmount: number;
  manaAmount: number;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
}) => {
  const {
    healAmount,
    manaAmount,
    hasBodyRebirthPassive,
    hasManaSpringPassive,
    hasMageFusionPassive,
  } = options;

  return {
    healMessage:
      healAmount > 0
        ? hasBodyRebirthPassive
          ? `【滴血重生】血肉自衍，你回復了 ${healAmount} 點氣血。`
          : hasMageFusionPassive
            ? `【五氣朝元】五氣回流護住周身，你回復了 ${healAmount} 點氣血。`
            : `氣血流轉，你回復了 ${healAmount} 點氣血。`
        : "",
    manaMessage:
      manaAmount > 0
        ? hasManaSpringPassive
          ? `【法力源泉】靈海回湧，你回復了 ${manaAmount} 點靈力。`
          : hasMageFusionPassive
            ? `【五氣朝元】五氣朝元不息，你回復了 ${manaAmount} 點靈力。`
            : `法力源泉湧動，你回復了 ${manaAmount} 點靈力。`
        : "",
  };
};

export const applyPassiveRegenAndCleanse = ({
  player,
  logs,
  turn,
  timeMs,
  playerHp,
  playerMp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  lastRegenTimeMs,
  hasBodyRebirthPassive,
  hasManaSpringPassive,
  hasMageFusionPassive,
  hasBodyImmortalPassive,
  hasBodyAncientPassive,
}: {
  player: EncounterPlayerCombatStatsLike;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  playerHp: number;
  playerMp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  lastRegenTimeMs: number;
  hasBodyRebirthPassive: boolean;
  hasManaSpringPassive: boolean;
  hasMageFusionPassive: boolean;
  hasBodyImmortalPassive: boolean;
  hasBodyAncientPassive: boolean;
}) => {
  if (
    !(player.regenHp > 0 || hasBodyRebirthPassive || hasManaSpringPassive || hasMageFusionPassive) ||
    (playerHp >= player.maxHp && playerMp >= player.maxMp)
  ) {
    return { playerHp, playerMp, playerStatuses, lastRegenTimeMs };
  }

  const regenIntervals = Math.floor((timeMs - lastRegenTimeMs) / 1000);
  if (regenIntervals <= 0) {
    return { playerHp, playerMp, playerStatuses, lastRegenTimeMs };
  }

  let nextPlayerHp = playerHp;
  let nextPlayerMp = playerMp;
  const nextPlayerStatuses = playerStatuses;
  let healPerSecond = Math.floor(player.maxHp * (player.regenHp / 100));

  if (hasBodyRebirthPassive) {
    const missingHp = Math.max(0, player.maxHp - nextPlayerHp);
    healPerSecond +=
      Math.floor(player.maxHp * 0.02) + Math.floor(missingHp * 0.05);
  }

  if (hasMageFusionPassive) {
    healPerSecond += Math.floor(player.maxHp * 0.05);
  }

  const healAmount = Math.floor(
    healPerSecond * regenIntervals * (hasBodyImmortalPassive ? 1.5 : 1)
  );
  if (healAmount > 0) {
    nextPlayerHp = Math.min(player.maxHp, nextPlayerHp + healAmount);
    const { healMessage } = getPassiveRegenMessages({
      healAmount,
      manaAmount: 0,
      hasBodyRebirthPassive,
      hasManaSpringPassive,
      hasMageFusionPassive,
    });
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer: true,
      message: healMessage,
      damage: -healAmount,
      playerHp: nextPlayerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  if ((hasManaSpringPassive || hasMageFusionPassive) && nextPlayerMp < player.maxMp) {
    const manaPerSecond =
      (hasManaSpringPassive ? Math.floor(player.maxMp * 0.1) : 0) +
      (hasMageFusionPassive ? Math.floor(player.maxMp * 0.05) : 0);
    const manaAmount = manaPerSecond * regenIntervals;
    if (manaAmount > 0) {
      nextPlayerMp = Math.min(player.maxMp, nextPlayerMp + manaAmount);
      const { manaMessage } = getPassiveRegenMessages({
        healAmount: 0,
        manaAmount,
        hasBodyRebirthPassive,
        hasManaSpringPassive,
        hasMageFusionPassive,
      });
      pushCombatLog(logs, {
        turn,
        timeMs,
        isPlayer: true,
        message: manaMessage,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp,
      });
    }
  }

  if (hasBodyAncientPassive) {
    const removableIndex = nextPlayerStatuses.findIndex(
      (status) => status.expiresAtMs > timeMs && isNegativeStatusKind(status.kind)
    );
    if (removableIndex >= 0) {
      const [removedStatus] = nextPlayerStatuses.splice(removableIndex, 1);
      pushCombatLog(logs, {
        turn,
        timeMs,
        isPlayer: true,
        message: `【荒古戰體】震散了【${removedStatus.name}】。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp,
      });
    }
  }

  return {
    playerHp: nextPlayerHp,
    playerMp: nextPlayerMp,
    playerStatuses: nextPlayerStatuses,
    lastRegenTimeMs: lastRegenTimeMs + regenIntervals * 1000,
  };
};
