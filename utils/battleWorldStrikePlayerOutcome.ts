import { ActiveMonster, Enemy, ProfessionType } from "../types";
import {
  BattleRewardApplicationPlan,
  createBattleRewardApplicationPlan,
  createBattleRewardManifest,
} from "./battleRewards";
import { getWorldSkillAreaTargets } from "./worldCombat";
import type {
  PlayerWorldStrikeExecutionPlan,
  PlayerWorldStrikeOutcomePlan,
  PlayerWorldStrikeOutcomeStatePlan,
  WorldStrikeResult,
  WorldStrikeSkillProfession,
  WorldStrikeVisualPlan,
} from "./battleWorldStrikeLiveTypes";
import { getPlayerWorldStrikeResolutionMessage } from "./battleWorldStrikePreviewPlans";

export const createPlayerWorldStrikeExecutionPlan = ({
  strike,
  skillName,
  skillProfession,
  targetedMonster,
  activeMonsters,
  playerPosition,
}: {
  strike: WorldStrikeResult;
  skillName?: string;
  skillProfession?: ProfessionType;
  targetedMonster: ActiveMonster;
  activeMonsters: ActiveMonster[];
  playerPosition: Pick<ActiveMonster, "x" | "y">;
}): PlayerWorldStrikeExecutionPlan => {
  const strikeColor =
    skillProfession === ProfessionType.Mage ? "#60a5fa" : "#f59e0b";
  const strikeColorInt =
    skillProfession === ProfessionType.Mage ? 0x60a5fa : 0xf59e0b;

  const impactedMonsters = getWorldSkillAreaTargets({
    origin: playerPosition,
    primaryTarget: { x: targetedMonster.x, y: targetedMonster.y },
    monsters: activeMonsters,
    primaryTargetId: targetedMonster.instanceId,
    areaShape: strike.areaShape,
    areaRadius: strike.areaRadius,
    maxTargets: strike.maxTargets,
  });

  const impactTargets = impactedMonsters
    .filter(() => strike.damage > 0)
    .map((monster, index) => {
      const defeated = Math.max(0, monster.currentHp - strike.damage) <= 0;
      return {
        target: monster,
        damage: strike.damage,
        defeated,
        visualPlan: {
          impact: {
            color: strikeColor,
            colorInt: strikeColorInt,
            targetX: monster.x,
            targetY: monster.y,
            radius:
              strike.areaShape && strike.areaShape !== "single" ? 0.8 : 0.45,
            damageText: `${index === 0 && strike.isCrit ? "暴擊 " : ""}${strike.damage}`,
            damageTextColor: index === 0 && strike.isCrit ? "#facc15" : "#ffffff",
            damageTextColorInt:
              index === 0 && strike.isCrit ? 0xfacc15 : 0xffffff,
          },
        },
      };
    });

  const defeatedTargets = impactTargets
    .filter((impactTarget) => impactTarget.defeated)
    .map((impactTarget) => impactTarget.target);

  return {
    strikeVisualPlan: {
      area:
        strike.areaShape &&
        strike.areaShape !== "single" &&
        strike.areaShape !== "self"
          ? {
              color: strikeColor,
              colorInt: strikeColorInt,
              targetX: targetedMonster.x,
              targetY: targetedMonster.y,
              radius: Math.max(0.8, strike.areaRadius ?? 1),
              durationMs: 420,
            }
          : undefined,
    },
    impactTargets,
    defeatedTargets,
    resolutionMessage: getPlayerWorldStrikeResolutionMessage({
      skillName,
      targetName: targetedMonster.name,
      damage: strike.damage,
      impactedTargetCount: impactedMonsters.length,
    }),
    shouldClearEncounter: defeatedTargets.some(
      (defeatedTarget) => defeatedTarget.instanceId === targetedMonster.instanceId
    ),
  };
};

export const resolvePlayerWorldStrikeOutcomePlan = ({
  executionPlan,
  mapEnemies,
  playerMaxHp,
}: {
  executionPlan: PlayerWorldStrikeExecutionPlan;
  mapEnemies: Enemy[] | undefined;
  playerMaxHp: number;
}): PlayerWorldStrikeOutcomePlan => ({
  executionPlan,
  defeatedResults: executionPlan.defeatedTargets.flatMap((monster) => {
    const monsterTemplate = mapEnemies?.find((enemy) => enemy.id === monster.templateId);
    if (!monsterTemplate) return [];

    const recoveryAmount = Math.max(8, Math.floor(playerMaxHp * 0.08));

    return [
      {
        monsterName: monster.name,
        rewardManifest: createBattleRewardManifest({
          enemy: monsterTemplate,
        }),
        recoveryAmount,
        recoveryLogMessage: `脫戰調息，恢復 <heal>${recoveryAmount} 氣血</heal>。`,
        victoryLogMessage: `你擊敗了 ${monster.name}。`,
      },
    ];
  }),
});

export const createPlayerWorldStrikeOutcomeStatePlan = ({
  outcomePlan,
  currentWorldPlayerHp,
  playerMaxHp,
}: {
  outcomePlan: PlayerWorldStrikeOutcomePlan;
  currentWorldPlayerHp: number;
  playerMaxHp: number;
}): PlayerWorldStrikeOutcomeStatePlan => {
  const nextWorldPlayerHp = outcomePlan.defeatedResults.reduce(
    (hp, defeatedResult) =>
      Math.min(playerMaxHp, hp + defeatedResult.recoveryAmount),
    currentWorldPlayerHp
  );

  return {
    monsterDamageApplications: outcomePlan.executionPlan.impactTargets.map(
      ({ target, damage }) => ({
        monsterInstanceId: target.instanceId,
        damage,
      })
    ),
    visualPlans: [
      ...outcomePlan.executionPlan.impactTargets.map(
        ({ visualPlan }) => visualPlan
      ),
      outcomePlan.executionPlan.strikeVisualPlan,
    ],
    worldLastCombatMessage: outcomePlan.executionPlan.resolutionMessage,
    rewardApplicationPlans: outcomePlan.defeatedResults.map((defeatedResult) =>
      createBattleRewardApplicationPlan({
        rewardManifest: defeatedResult.rewardManifest,
      })
    ),
    logEntries: outcomePlan.defeatedResults.flatMap((defeatedResult) => [
      {
        message: defeatedResult.recoveryLogMessage,
        type: "gain" as const,
      },
      {
        message: defeatedResult.victoryLogMessage,
        type: "success" as const,
      },
    ]),
    nextWorldPlayerHp,
    shouldClearEncounter: outcomePlan.executionPlan.shouldClearEncounter,
  };
};

export const resolvePlayerWorldStrikeOutcomeStatePlan = ({
  strike,
  skillName,
  skillProfession,
  targetedMonster,
  activeMonsters,
  playerPosition,
  mapEnemies,
  playerMaxHp,
  currentWorldPlayerHp,
}: {
  strike: WorldStrikeResult;
  skillName?: string;
  skillProfession?: WorldStrikeSkillProfession;
  targetedMonster: ActiveMonster;
  activeMonsters: ActiveMonster[];
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  mapEnemies: Enemy[] | undefined;
  playerMaxHp: number;
  currentWorldPlayerHp: number;
}): PlayerWorldStrikeOutcomeStatePlan =>
  createPlayerWorldStrikeOutcomeStatePlan({
    outcomePlan: resolvePlayerWorldStrikeOutcomePlan({
      executionPlan: createPlayerWorldStrikeExecutionPlan({
        strike,
        skillName,
        skillProfession,
        targetedMonster,
        activeMonsters,
        playerPosition,
      }),
      mapEnemies,
      playerMaxHp,
    }),
    currentWorldPlayerHp,
    playerMaxHp,
  });

export const runPlayerWorldStrikeOutcomePipeline = ({
  strike,
  skillName,
  skillProfession,
  targetedMonster,
  activeMonsters,
  playerPosition,
  mapEnemies,
  playerMaxHp,
  currentWorldPlayerHp,
  applyMonsterDamage,
  applyVisualPlan,
  applyRewardApplicationPlan,
  appendLogEntry,
  setWorldLastCombatMessage,
  setWorldPlayerHp,
  clearEncounter,
}: {
  strike: WorldStrikeResult;
  skillName?: string;
  skillProfession?: ProfessionType;
  targetedMonster: ActiveMonster;
  activeMonsters: ActiveMonster[];
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  mapEnemies: Enemy[] | undefined;
  playerMaxHp: number;
  currentWorldPlayerHp: number;
  applyMonsterDamage: (
    damageApplication: PlayerWorldStrikeOutcomeStatePlan["monsterDamageApplications"][number]
  ) => void;
  applyVisualPlan: (visualPlan: WorldStrikeVisualPlan) => void;
  applyRewardApplicationPlan: (
    rewardApplicationPlan: BattleRewardApplicationPlan
  ) => void;
  appendLogEntry: (
    logEntry: PlayerWorldStrikeOutcomeStatePlan["logEntries"][number]
  ) => void;
  setWorldLastCombatMessage: (message: string) => void;
  setWorldPlayerHp: (hp: number) => void;
  clearEncounter?: () => void;
}): PlayerWorldStrikeOutcomeStatePlan => {
  const outcomeStatePlan = resolvePlayerWorldStrikeOutcomeStatePlan({
    strike,
    skillName,
    skillProfession,
    targetedMonster,
    activeMonsters,
    playerPosition,
    mapEnemies,
    playerMaxHp,
    currentWorldPlayerHp,
  });

  outcomeStatePlan.monsterDamageApplications.forEach(applyMonsterDamage);
  outcomeStatePlan.visualPlans.forEach(applyVisualPlan);
  setWorldLastCombatMessage(outcomeStatePlan.worldLastCombatMessage);
  outcomeStatePlan.rewardApplicationPlans.forEach(applyRewardApplicationPlan);
  setWorldPlayerHp(outcomeStatePlan.nextWorldPlayerHp);
  outcomeStatePlan.logEntries.forEach(appendLogEntry);

  if (outcomeStatePlan.shouldClearEncounter) {
    clearEncounter?.();
  }

  return outcomeStatePlan;
};
