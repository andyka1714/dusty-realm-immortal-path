import { Enemy, Skill } from "../types";
import type { PlayerCombatStatsLike } from "./battleTurnPhaseSharedTypes";

export const createPlayerAttackLogMessage = ({
  player,
  skillReady,
  activeSkill,
  isCrit,
  playerDamage,
}: {
  player: PlayerCombatStatsLike;
  skillReady: boolean;
  activeSkill?: Skill;
  isCrit: boolean;
  playerDamage: number;
}) => {
  if (!skillReady || !activeSkill) {
    return `<player>${player.name}</player> 發動攻擊，${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`;
  }

  if (
    activeSkill.effectType === "damage" ||
    activeSkill.damageMultiplier !== undefined
  ) {
    return `<player>${player.name}</player> 施展【${activeSkill.name}】${
      activeSkill.areaShape &&
      activeSkill.areaShape !== "single" &&
      activeSkill.areaShape !== "self"
        ? "，範圍術式震盪四散，"
        : "，"
    }${isCrit ? "暴擊！" : ""}造成 <dmg>${playerDamage}</dmg> 點傷害！`;
  }

  return `<player>${player.name}</player> 施展【${activeSkill.name}】，靈力在戰場上激盪開來！`;
};

export const createSwordQiArmorBreakMessage = (enemy: Enemy) =>
  `【劍脈初成】劍勢貫通護體，為 <enemy rank="${enemy.rank}">${enemy.name}</enemy> 施加【劍脈破甲】。`;
