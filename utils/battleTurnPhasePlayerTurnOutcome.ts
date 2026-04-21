import { getLifestealValue } from "./battleCombatMath";
import { pushCombatLog } from "./battleLog";
import type { PlayerTurnOutcomeArgs } from "./battleTurnPhasePlayerArgTypes";
import type { ResolvePlayerTurnResult } from "./battleTurnPhasePlayerTypes";

export const resolvePlayerTurnOutcome = ({
  currentTimeMs,
  turn,
  player,
  enemy,
  logs,
  passiveFlags,
  playerHp,
  playerMp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  playerAttackIntervalMs,
  resolvedTurnContext,
  dependencies,
}: PlayerTurnOutcomeArgs): ResolvePlayerTurnResult => {
  let enemyHp = resolvedTurnContext.enemyHp;

  ({
    enemyHp,
    playerHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  } = dependencies.resolvePlayerActiveAftermath({
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    skillReady: resolvedTurnContext.skillReady,
    activeSkill: activeSkill ?? undefined,
    activeSkillCanonicalId: resolvedTurnContext.activeSkillCanonicalId,
    currentTimeMs,
    turn,
    logs,
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    playerHp,
    playerMaxHp: player.maxHp,
    enemyHp,
    enemyMaxHp: enemy.maxHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    playerDamage: resolvedTurnContext.playerDamage,
    effectiveDefense: resolvedTurnContext.effectiveDefense,
    pVsE: resolvedTurnContext.pVsE,
    enemyElementalAffinity: resolvedTurnContext.enemyElementalAffinity,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    isCrit: resolvedTurnContext.isCrit,
    dealsDirectDamage: resolvedTurnContext.dealsDirectDamage,
    passiveFlags,
  }));

  const lifestealRate = getLifestealValue(playerStatuses, currentTimeMs);
  if (resolvedTurnContext.playerDamage > 0 && lifestealRate > 0) {
    const lifestealAmount = Math.max(
      1,
      Math.floor(resolvedTurnContext.playerDamage * lifestealRate)
    );
    playerHp = Math.min(player.maxHp, playerHp + lifestealAmount);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs,
      isPlayer: true,
      message: `【獸神附體】吞納敵血，回復了 <heal>${lifestealAmount}</heal> 點氣血。`,
      damage: 0,
      playerHp,
      playerMaxHp: player.maxHp,
      enemyHp,
      enemyMaxHp: enemy.maxHp,
    });
  }

  const skillExecutionTimeMs =
    resolvedTurnContext.activeSkillTimelineProfile?.executionTimeMs ?? 0;

  return {
    enemyHp,
    playerHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    playerNextActionMs:
      currentTimeMs + Math.max(playerAttackIntervalMs, skillExecutionTimeMs),
  };
};
