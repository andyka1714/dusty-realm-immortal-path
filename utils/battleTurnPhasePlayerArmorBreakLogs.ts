import { CombatLog, Enemy, Skill } from "../types";
import { pushCombatLog } from "./battleLog";
import type { PlayerPassiveFlags } from "./battlePassives";
import { shouldApplySwordQiArmorBreak } from "./battleStatusEffects";
import { createSwordQiArmorBreakMessage } from "./battleTurnPhasePlayerAttackMessages";

const logSwordQiArmorBreak = ({
  shouldTrigger,
  logs,
  turn,
  timeMs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  shouldTrigger: boolean;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (!shouldTrigger) return;

  pushCombatLog(logs, {
    turn,
    timeMs,
    isPlayer: true,
    message: createSwordQiArmorBreakMessage(enemy),
    damage: 0,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

export const buildSwordQiArmorBreakLog = (options: {
  passiveFlags: PlayerPassiveFlags;
  skill?: Skill;
  isCrit: boolean;
  enemyHp: number;
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyMaxHp: number;
}) =>
  logSwordQiArmorBreak({
    shouldTrigger: shouldApplySwordQiArmorBreak({
      passiveFlags: options.passiveFlags,
      skill: options.skill,
      isCrit: options.isCrit,
      enemyHp: options.enemyHp,
    }),
    logs: options.logs,
    turn: options.turn,
    timeMs: options.timeMs,
    enemy: options.enemy,
    playerHp: options.playerHp,
    playerMaxHp: options.playerMaxHp,
    enemyHp: options.enemyHp,
    enemyMaxHp: options.enemyMaxHp,
  });
