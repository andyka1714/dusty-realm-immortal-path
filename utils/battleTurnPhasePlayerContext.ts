import {
  type SkillTimelineProfile,
  resolvePlayerActiveSkillWindow,
} from "./battleProfiles";
import type { PlayerTurnArgs } from "./battleTurnPhasePlayerArgTypes";
import type { ResolvedPlayerTurnContext } from "./battleTurnPhasePlayerTypes";

export const resolvePlayerTurnContext = ({
  currentTimeMs,
  player,
  enemy,
  passiveFlags,
  bossBroken,
  playerDebuffed,
  playerHp,
  playerMp,
  enemyHp,
  playerStatuses,
  enemyStatuses,
  activeSkill,
  activeSkillReadyAtMs,
  mageFoundationStacks,
  swordHeartStacks,
  hasMageFusionPassive,
  dependencies,
}: PlayerTurnArgs): ResolvedPlayerTurnContext => {
  const { skillReady, activeSkillTimelineProfile, activeSkillCanonicalId } =
    resolvePlayerActiveSkillWindow({
      activeSkill,
      currentTimeMs,
      activeSkillReadyAtMs,
      playerMp,
      hasMageFusionPassive,
    });

  const {
    dealsDirectDamage,
    effectiveDefense,
    bodyFoundationStacks,
    voidSwordProc,
    manaSpringEmpowered,
    hasSwordQiChain,
    activeSwordQiStatuses,
    isCrit,
    playerDamage,
    pVsE: playerRestriction,
    enemyElementalAffinity: playerEnemyElementalAffinity,
  } = dependencies.resolvePlayerOffenseRoll({
    player: {
      ...player,
      hp: playerHp,
      mp: playerMp,
    },
    enemy: {
      ...enemy,
      hp: enemyHp,
    },
    activeSkill: activeSkill ?? undefined,
    activeSkillCanonicalId,
    activeSkillTimelineProfile:
      activeSkillTimelineProfile as SkillTimelineProfile | undefined,
    skillReady,
    passiveFlags,
    playerHp,
    playerMp,
    playerStatuses,
    enemyStatuses,
    bossBroken,
    playerDebuffed,
    mageFoundationStacks,
    swordHeartStacks,
    currentTimeMs,
  });

  return {
    skillReady,
    activeSkillTimelineProfile:
      activeSkillTimelineProfile as SkillTimelineProfile | undefined,
    activeSkillCanonicalId,
    dealsDirectDamage,
    effectiveDefense,
    bodyFoundationStacks,
    voidSwordProc,
    manaSpringEmpowered,
    hasSwordQiChain,
    activeSwordQiStatuses,
    isCrit,
    playerDamage,
    pVsE: playerRestriction,
    enemyElementalAffinity: playerEnemyElementalAffinity,
    enemyHp: Math.max(0, enemyHp - playerDamage),
  };
};
