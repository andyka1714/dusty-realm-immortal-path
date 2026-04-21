import { CombatLog } from "../types";
import { pushCombatLog } from "./battleLog";
import type { CombatStatusLike } from "./battleStatusTypes";

export const logPlayerSwordResonance = ({
  skillReady,
  activeSkillCanonicalId,
  activeSwordQiStatuses,
  hasSwordQiChain,
  currentTimeMs,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  skillReady: boolean;
  activeSkillCanonicalId?: string;
  activeSwordQiStatuses: CombatStatusLike[];
  hasSwordQiChain: boolean;
  currentTimeMs: number;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (
    skillReady &&
    activeSkillCanonicalId === "s_tr_active" &&
    activeSwordQiStatuses.length > 0
  ) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劍歸一】引爆 ${activeSwordQiStatuses.length} 層劍氣共鳴，劍勢瞬間攀升。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
    return true;
  }

  if (
    skillReady &&
    activeSkillCanonicalId === "s_tr_active" &&
    hasSwordQiChain
  ) {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【萬劍歸一】殘存劍勢與破劫一擊共鳴，爆發再度攀升。`,
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  return false;
};
