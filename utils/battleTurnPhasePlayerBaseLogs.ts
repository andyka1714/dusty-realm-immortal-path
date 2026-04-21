import { pushCombatLog } from "./battleLog";
import {
  buildSwordQiArmorBreakLog,
} from "./battleTurnPhasePlayerArmorBreakLogs";
import {
  createPlayerAttackLogMessage,
} from "./battleTurnPhasePlayerAttackMessages";
import {
  buildPlayerActivePassiveProcMessages,
} from "./battleTurnPhasePlayerPassiveMessages";
import type { PlayerTurnLogArgs } from "./battleTurnPhasePlayerArgTypes";

export const applyPlayerBaseLogs = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  activeSkill,
  resolvedTurnContext,
}: PlayerTurnLogArgs) => {
  const {
    skillReady,
    bodyFoundationStacks,
    voidSwordProc,
    manaSpringEmpowered,
    isCrit,
    playerDamage,
    enemyHp,
  } = resolvedTurnContext;

  buildPlayerActivePassiveProcMessages({
    player,
    enemy,
    skillReady,
    activeSkill: activeSkill ?? undefined,
    isCrit,
    manaSpringEmpowered,
    hasMageMahayanaPassive: passiveFlags.hasMageMahayanaPassive,
    hasSwordMahayanaPassive: passiveFlags.hasSwordMahayanaPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    bodyFoundationStacks,
    voidSwordProc,
  }).forEach((message) => {
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  });

  pushCombatLog(logs, {
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    message: createPlayerAttackLogMessage({
      player,
      skillReady,
      activeSkill: activeSkill ?? undefined,
      isCrit,
      playerDamage,
    }),
    damage: playerDamage,
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
  });

  buildSwordQiArmorBreakLog({
    passiveFlags,
    skill: skillReady ? activeSkill ?? undefined : undefined,
    isCrit,
    enemy,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
    logs,
    turn,
    timeMs: currentTimeMs,
    playerHp,
    playerMaxHp: player.maxHp,
  });
};
