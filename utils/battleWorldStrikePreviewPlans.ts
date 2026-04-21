import { ActiveMonster } from "../types";
import type {
  EnemyWorldStrikePreviewPlan,
  EnemyWorldStrikeResolved,
  PlayerWorldStrikePreviewPlan,
  WorldStrikeResult,
} from "./battleWorldStrikeLiveTypes";

export const getPlayerWorldStrikePreviewMessage = ({
  targetName,
  skillName,
}: {
  targetName: string;
  skillName?: string;
}) =>
  skillName ? `你開始施展【${skillName}】。` : `你朝 ${targetName} 發動攻擊。`;

export const getEnemyWorldStrikePreviewMessage = ({
  enemyName,
  skillName,
}: {
  enemyName: string;
  skillName?: string;
}) =>
  skillName ? `${enemyName} 正在施展【${skillName}】。` : `${enemyName} 朝你撲殺而來。`;

export const createPlayerWorldStrikePreviewPlan = ({
  now,
  targetId,
  targetName,
  strike,
  currentShield,
  skillName,
}: {
  now: number;
  targetId: string;
  targetName: string;
  strike: Pick<
    WorldStrikeResult,
    | "enemyStatusNames"
    | "playerStatusNames"
    | "playerShieldGain"
    | "nextActionDelayMs"
    | "skillCooldownMs"
  >;
  currentShield: number;
  skillName?: string;
}): PlayerWorldStrikePreviewPlan => ({
  worldCombatTargetId: targetId,
  worldCombatTargetStatuses: strike.enemyStatusNames,
  worldCombatPlayerStatuses: strike.playerStatusNames,
  nextWorldPlayerShield: currentShield + strike.playerShieldGain,
  worldLastCombatMessage: getPlayerWorldStrikePreviewMessage({
    targetName,
    skillName,
  }),
  nextPlayerActionReadyAt: now + strike.nextActionDelayMs,
  nextPlayerSkillReadyAt: skillName
    ? now + strike.skillCooldownMs
    : undefined,
});

export const createEnemyWorldStrikePreviewPlan = ({
  now,
  enemyName,
  strike,
  canUseSpecial,
}: {
  now: number;
  enemyName: string;
  strike: Pick<
    EnemyWorldStrikeResolved,
    "skillName" | "nextActionDelayMs" | "specialCooldownMs"
  >;
  canUseSpecial: boolean;
}): EnemyWorldStrikePreviewPlan => ({
  nextEnemyActionReadyAt: now + strike.nextActionDelayMs,
  nextEnemySpecialReadyAt:
    canUseSpecial && strike.specialCooldownMs > 0
      ? now + strike.specialCooldownMs
      : undefined,
  worldLastCombatMessage: getEnemyWorldStrikePreviewMessage({
    enemyName,
    skillName: strike.skillName,
  }),
});

export const getPlayerWorldStrikeResolutionMessage = ({
  skillName,
  targetName,
  damage,
  impactedTargetCount,
}: {
  skillName?: string;
  targetName: string;
  damage: number;
  impactedTargetCount: number;
}) =>
  skillName
    ? `你施展【${skillName}】造成 ${damage} 點傷害${
        impactedTargetCount > 1 ? `，波及 ${impactedTargetCount} 個目標` : ""
      }。`
    : `你對 ${targetName} 造成 ${damage} 點傷害。`;

export const getEnemyWorldStrikeResolutionMessage = ({
  enemyName,
  skillName,
  damage,
}: {
  enemyName: string;
  skillName?: string;
  damage: number;
}) =>
  skillName
    ? `${enemyName} 施展【${skillName}】對你造成 ${damage} 點傷害。`
    : `${enemyName} 對你造成 ${damage} 點傷害。`;
