import { ActiveMonster } from "../types";
import {
  createWorldPlayerDefeatStatePlan,
  resolveWorldPlayerDefeatPlan,
} from "./battleLifecycle";
import type {
  EnemyWorldStrikeExecutionPlan,
  EnemyWorldStrikeOutcomePlan,
  EnemyWorldStrikeOutcomeStatePlan,
  EnemyWorldStrikeResolved,
  WorldStrikeVisualPlan,
} from "./battleWorldStrikeLiveTypes";
import { getEnemyWorldStrikeResolutionMessage } from "./battleWorldStrikePreviewPlans";
import { resolveWorldShieldedDamage } from "./battleWorldStrikeShield";

export const createEnemyWorldStrikeExecutionPlan = ({
  strike,
  enemyName,
  enemyPosition,
  fallbackSourcePosition,
  playerPosition,
  currentShield,
  currentHp,
  currentStatuses,
}: {
  strike: Pick<
    EnemyWorldStrikeResolved,
    "damage" | "skillName" | "executionTimeMs" | "areaShape" | "areaRadius" | "isProjectile" | "statusNames"
  >;
  enemyName: string;
  enemyPosition?: Pick<ActiveMonster, "x" | "y"> | null;
  fallbackSourcePosition: Pick<ActiveMonster, "x" | "y">;
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  currentShield: number;
  currentHp: number;
  currentStatuses: string[];
}): EnemyWorldStrikeExecutionPlan => {
  const shieldResolution = resolveWorldShieldedDamage({
    incomingDamage: strike.damage,
    currentShield,
  });
  const nextHp = Math.max(0, currentHp - shieldResolution.damageTaken);
  const sourcePosition = enemyPosition ?? fallbackSourcePosition;

  return {
    shieldResolution,
    nextHp,
    nextStatuses: Array.from(new Set([...currentStatuses, ...strike.statusNames])),
    resolutionMessage: getEnemyWorldStrikeResolutionMessage({
      enemyName,
      skillName: strike.skillName,
      damage: shieldResolution.damageTaken,
    }),
    visualPlan: {
      area:
        strike.areaShape &&
        strike.areaShape !== "single" &&
        strike.areaShape !== "self"
          ? {
              color: "#f87171",
              colorInt: 0xf87171,
              targetX: playerPosition.x,
              targetY: playerPosition.y,
              radius: Math.max(0.8, strike.areaRadius ?? 1),
              durationMs: 360,
            }
          : undefined,
      impact: {
        color: "#f87171",
        colorInt: 0xf87171,
        targetX: playerPosition.x,
        targetY: playerPosition.y,
        radius: 0.45,
        damageText:
          shieldResolution.absorbed > 0
            ? `-${shieldResolution.damageTaken} / 格擋 ${shieldResolution.absorbed}`
            : `-${shieldResolution.damageTaken}`,
        damageTextColor: shieldResolution.absorbed > 0 ? "#67e8f9" : "#fca5a5",
        damageTextColorInt:
          shieldResolution.absorbed > 0 ? 0x67e8f9 : 0xfca5a5,
      },
    },
    shouldHandleDefeat: nextHp <= 0,
  };
};

export const resolveEnemyWorldStrikeOutcomePlan = ({
  executionPlan,
  completedQuestIds,
  playerMaxHp,
}: {
  executionPlan: EnemyWorldStrikeExecutionPlan;
  completedQuestIds: string[];
  playerMaxHp: number;
}): EnemyWorldStrikeOutcomePlan => ({
  executionPlan,
  defeatPlan: executionPlan.shouldHandleDefeat
    ? resolveWorldPlayerDefeatPlan({
        completedQuestIds,
        playerMaxHp,
      })
    : undefined,
});

export const createEnemyWorldStrikeOutcomeStatePlan = ({
  outcomePlan,
}: {
  outcomePlan: EnemyWorldStrikeOutcomePlan;
}): EnemyWorldStrikeOutcomeStatePlan => ({
  shouldUpdateWorldPlayerShield:
    outcomePlan.executionPlan.shieldResolution.absorbed > 0,
  nextWorldPlayerShield:
    outcomePlan.executionPlan.shieldResolution.remainingShield,
  nextWorldPlayerHp: outcomePlan.executionPlan.nextHp,
  nextWorldCombatPlayerStatuses: outcomePlan.executionPlan.nextStatuses,
  worldLastCombatMessage: outcomePlan.executionPlan.resolutionMessage,
  visualPlan: outcomePlan.executionPlan.visualPlan,
  defeatStatePlan: outcomePlan.defeatPlan
    ? createWorldPlayerDefeatStatePlan({
        defeatPlan: outcomePlan.defeatPlan,
      })
    : undefined,
});

export const resolveEnemyWorldStrikeOutcomeStatePlan = ({
  strike,
  enemyName,
  enemyPosition,
  fallbackSourcePosition,
  playerPosition,
  currentShield,
  currentHp,
  currentStatuses,
  completedQuestIds,
  playerMaxHp,
}: {
  strike: Pick<
    EnemyWorldStrikeResolved,
    | "damage"
    | "skillName"
    | "executionTimeMs"
    | "areaShape"
    | "areaRadius"
    | "isProjectile"
    | "statusNames"
  >;
  enemyName: string;
  enemyPosition?: Pick<ActiveMonster, "x" | "y"> | null;
  fallbackSourcePosition: Pick<ActiveMonster, "x" | "y">;
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  currentShield: number;
  currentHp: number;
  currentStatuses: string[];
  completedQuestIds: string[];
  playerMaxHp: number;
}): EnemyWorldStrikeOutcomeStatePlan =>
  createEnemyWorldStrikeOutcomeStatePlan({
    outcomePlan: resolveEnemyWorldStrikeOutcomePlan({
      executionPlan: createEnemyWorldStrikeExecutionPlan({
        strike,
        enemyName,
        enemyPosition,
        fallbackSourcePosition,
        playerPosition,
        currentShield,
        currentHp,
        currentStatuses,
      }),
      completedQuestIds,
      playerMaxHp,
    }),
  });

export const runEnemyWorldStrikeOutcomePipeline = ({
  strike,
  enemyName,
  enemyPosition,
  fallbackSourcePosition,
  playerPosition,
  currentShield,
  currentHp,
  currentStatuses,
  completedQuestIds,
  playerMaxHp,
  setWorldPlayerShield,
  setWorldPlayerHp,
  setWorldCombatPlayerStatuses,
  setWorldLastCombatMessage,
  applyVisualPlan,
  applyDefeatStatePlan,
}: {
  strike: Pick<
    EnemyWorldStrikeResolved,
    | "damage"
    | "skillName"
    | "executionTimeMs"
    | "areaShape"
    | "areaRadius"
    | "isProjectile"
    | "statusNames"
  >;
  enemyName: string;
  enemyPosition?: Pick<ActiveMonster, "x" | "y"> | null;
  fallbackSourcePosition: Pick<ActiveMonster, "x" | "y">;
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  currentShield: number;
  currentHp: number;
  currentStatuses: string[];
  completedQuestIds: string[];
  playerMaxHp: number;
  setWorldPlayerShield: (shield: number) => void;
  setWorldPlayerHp: (hp: number) => void;
  setWorldCombatPlayerStatuses: (statuses: string[]) => void;
  setWorldLastCombatMessage: (message: string) => void;
  applyVisualPlan: (visualPlan: WorldStrikeVisualPlan) => void;
  applyDefeatStatePlan: (
    defeatStatePlan: EnemyWorldStrikeOutcomeStatePlan["defeatStatePlan"]
  ) => void;
}): EnemyWorldStrikeOutcomeStatePlan => {
  const outcomeStatePlan = resolveEnemyWorldStrikeOutcomeStatePlan({
    strike,
    enemyName,
    enemyPosition,
    fallbackSourcePosition,
    playerPosition,
    currentShield,
    currentHp,
    currentStatuses,
    completedQuestIds,
    playerMaxHp,
  });

  if (outcomeStatePlan.shouldUpdateWorldPlayerShield) {
    setWorldPlayerShield(outcomeStatePlan.nextWorldPlayerShield);
  }

  setWorldPlayerHp(outcomeStatePlan.nextWorldPlayerHp);
  setWorldCombatPlayerStatuses(outcomeStatePlan.nextWorldCombatPlayerStatuses);
  setWorldLastCombatMessage(outcomeStatePlan.worldLastCombatMessage);
  applyVisualPlan(outcomeStatePlan.visualPlan);

  if (outcomeStatePlan.defeatStatePlan) {
    applyDefeatStatePlan(outcomeStatePlan.defeatStatePlan);
  }

  return outcomeStatePlan;
};
