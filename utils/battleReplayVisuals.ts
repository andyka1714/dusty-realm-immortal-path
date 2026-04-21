import { ActiveMonster, CombatLog, Skill } from "../types";
import { createAutoBattleReplayState } from "./battleReplayState";
import type {
  AutoBattleReplayStepStatePlan,
  ReplayMonsterPosition,
  ReplayVisualSkillLike,
  ResolvedAutoBattleReplayStep,
  WorldStrikeVisualPlan,
} from "./battleReplayTypes";

export const createBattleReplayVisualPlan = <TSkill,>(
  {
    nextLog,
    targetMonster,
    playerPosition,
    enemyAttackRange,
    normalizedUsedSkill,
  }: {
    nextLog: CombatLog;
    targetMonster: ActiveMonster | null;
    playerPosition: ReplayMonsterPosition;
    enemyAttackRange?: number;
    normalizedUsedSkill?: TSkill;
  }
): WorldStrikeVisualPlan => {
  const visualSkill = normalizedUsedSkill as ReplayVisualSkillLike | undefined;
  const projectilePlan =
    visualSkill && nextLog.isPlayer && targetMonster
      ? (visualSkill.castRange ?? 1) > 1
        ? {
            color: "#60a5fa",
            colorInt: 0x60a5fa,
            sourceX: playerPosition.x,
            sourceY: playerPosition.y,
            targetX: targetMonster.x,
            targetY: targetMonster.y,
            durationMs: Math.max(220, visualSkill.castTimeMs ?? 280),
          }
        : undefined
      : !nextLog.isPlayer && (enemyAttackRange ?? 1) > 1 && targetMonster
        ? {
            color: "#fb7185",
            colorInt: 0xfb7185,
            sourceX: targetMonster.x,
            sourceY: targetMonster.y,
            targetX: playerPosition.x,
            targetY: playerPosition.y,
            durationMs: 260,
          }
        : undefined;

  const areaPlan =
    visualSkill &&
    nextLog.isPlayer &&
    targetMonster &&
    visualSkill.areaShape &&
    visualSkill.areaShape !== "single" &&
    visualSkill.areaShape !== "self" &&
    (visualSkill.areaRadius ?? 0) > 0
      ? {
          color: "#a78bfa",
          colorInt: 0xa78bfa,
          targetX: targetMonster.x,
          targetY: targetMonster.y,
          radius: visualSkill.areaRadius,
          durationMs: 520,
        }
      : undefined;

  const impactPlan =
    nextLog.damage && nextLog.damage > 0
      ? nextLog.isPlayer
        ? targetMonster
          ? {
              color: "#fde68a",
              colorInt: 0xfde68a,
              targetX: targetMonster.x,
              targetY: targetMonster.y,
              radius: 0.55,
              damageText: `${nextLog.damage}`,
              damageTextColor: "#fbbf24",
              damageTextColorInt: 0xfbbf24,
            }
          : undefined
        : {
            color: "#fca5a5",
            colorInt: 0xfca5a5,
            targetX: playerPosition.x,
            targetY: playerPosition.y,
            radius: 0.55,
            damageText: `${nextLog.damage}`,
            damageTextColor: "#fb7185",
            damageTextColorInt: 0xfb7185,
          }
      : undefined;

  return {
    projectile: projectilePlan,
    area: areaPlan,
    impact: impactPlan,
  };
};

export const createAutoBattleReplayStepStatePlan = <TSkill,>({
  nextLog,
  nextSession,
  targetMonster,
  normalizedUsedSkill,
  playerPosition,
  enemyAttackRange,
}: ResolvedAutoBattleReplayStep<ActiveMonster, TSkill> & {
  playerPosition: ReplayMonsterPosition;
  enemyAttackRange?: number;
}): AutoBattleReplayStepStatePlan => ({
  replayState: createAutoBattleReplayState({
    session: nextSession,
  }),
  visualPlan: createBattleReplayVisualPlan({
    nextLog,
    targetMonster,
    playerPosition,
    enemyAttackRange,
    normalizedUsedSkill,
  }),
  shouldAutoScroll: true,
});
