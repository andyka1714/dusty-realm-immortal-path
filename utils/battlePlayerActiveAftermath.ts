import { CombatLog, Enemy, ProfessionType, Skill } from "../types";
import { pushCombatLog } from "./battleLog";
import type { PlayerCombatStats } from "./battleSystem";
import { appendAndLogCombatStatuses } from "./battleStatuses";
import { resolvePlayerSkillStatusApplication } from "./battleStatusEffects";
import type { PlayerPassiveFlags } from "./battlePassives";
import type {
  ElementalAffinityLike,
  RestrictionLike,
} from "./battleAftermathTypes";
import type { CombatStatusLike } from "./battleStatusTypes";
import { applyPlayerEchoAndSummonFollowupEffects, applyPlayerActiveFollowupEffects } from "./battleAftermathPlayerFollowups";
import { resolvePlayerActiveResourceFlow } from "./battleAftermathPlayerResources";

export const resolvePlayerActiveAftermath = ({
  player,
  skillReady,
  activeSkill,
  activeSkillCanonicalId,
  currentTimeMs,
  turn,
  logs,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerStatuses,
  enemyStatuses,
  playerMp,
  playerDamage,
  effectiveDefense,
  pVsE,
  enemyElementalAffinity,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  isCrit,
  dealsDirectDamage,
  passiveFlags,
}: {
  player: PlayerCombatStats;
  skillReady: boolean;
  activeSkill?: Skill;
  activeSkillCanonicalId?: string;
  currentTimeMs: number;
  turn: number;
  logs: CombatLog[];
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerStatuses: CombatStatusLike[];
  enemyStatuses: CombatStatusLike[];
  playerMp: number;
  playerDamage: number;
  effectiveDefense: number;
  pVsE: RestrictionLike;
  enemyElementalAffinity: ElementalAffinityLike;
  activeSkillReadyAtMs: number;
  mageFoundationStacks: number;
  isCrit: boolean;
  dealsDirectDamage: boolean;
  passiveFlags: PlayerPassiveFlags;
}) => {
  if (!skillReady || !activeSkill) {
    return {
      enemyHp,
      playerHp,
      playerStatuses,
      enemyStatuses,
      playerMp,
      activeSkillReadyAtMs,
      mageFoundationStacks,
    };
  }

  ({
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  } = resolvePlayerActiveResourceFlow({
    activeSkill,
    activeSkillCanonicalId,
    player,
    playerMp,
    currentTimeMs,
    activeSkillReadyAtMs,
    mageFoundationStacks,
    isCrit,
    logs,
    turn,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
    hasMageFusionPassive: passiveFlags.hasMageFusionPassive,
    hasMageQiPassive: passiveFlags.hasMageQiPassive,
    hasSwordGoldenPassive: passiveFlags.hasSwordGoldenPassive,
    hasMageFoundationPassive: passiveFlags.hasMageFoundationPassive,
  }));

  const { playerSideStatuses, filteredEnemyStatuses } =
    resolvePlayerSkillStatusApplication({
      skill: activeSkill,
      targetMaxHp:
        activeSkill.targetType === "self" ? playerMaxHp : enemyMaxHp,
      enemy,
      passiveFlags,
      dealsDirectDamage,
      isCrit,
      currentTimeMs,
      enemyHp,
    });

  appendAndLogCombatStatuses({
    container: playerStatuses,
    statuses: playerSideStatuses,
    logs,
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    targetIsPlayer: true,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  appendAndLogCombatStatuses({
    container: enemyStatuses,
    statuses: filteredEnemyStatuses,
    logs,
    turn,
    timeMs: currentTimeMs,
    isPlayer: true,
    targetIsPlayer: false,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });

  if (
    passiveFlags.hasMageImmortalPassive &&
    activeSkill.profession === ProfessionType.Mage &&
    playerDamage > 0 &&
    Math.random() < 0.3
  ) {
    const repeatedDamage = Math.max(1, Math.floor(playerDamage));
    enemyHp = Math.max(0, enemyHp - repeatedDamage);
    pushCombatLog(logs, {
      turn,
      timeMs: currentTimeMs + 1,
      isPlayer: true,
      message: `【仙法通神】術式回響，再度造成 <dmg>${repeatedDamage}</dmg> 點傷害！`,
      damage: repeatedDamage,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  }

  ({
    enemyHp,
    playerHp,
    activeSkillReadyAtMs,
  } = applyPlayerActiveFollowupEffects({
    activeSkillCanonicalId,
    playerDamage,
    currentTimeMs,
    enemy,
    enemyHp,
    playerHp,
    playerMaxHp,
    turn,
    logs,
    hasBodyImmortalPassive: passiveFlags.hasBodyImmortalPassive,
    enemyStatuses,
    activeSkillReadyAtMs,
  }));

  enemyHp = applyPlayerEchoAndSummonFollowupEffects({
    skillReady,
    activeSkillCanonicalId,
    hasSwordEchoPassive: passiveFlags.hasSwordEchoPassive,
    currentTimeMs,
    turn,
    logs,
    player,
    enemy,
    enemyHp,
    playerHp,
    playerMaxHp,
    playerDamage,
    effectiveDefense,
    enemyStatuses,
    pVsE,
    enemyElementalAffinity,
  });

  return {
    enemyHp,
    playerHp,
    playerStatuses,
    enemyStatuses,
    playerMp,
    activeSkillReadyAtMs,
    mageFoundationStacks,
  };
};
