import {
  ActiveMonster,
  Enemy,
  ProfessionType,
  Skill,
} from "../types";
import {
  BattleLogEntryPlan,
  BattleRewardApplicationPlan,
  BattleRewardManifest,
  createBattleRewardApplicationPlan,
  createBattleRewardManifest,
} from "./battleRewards";
import {
  WorldPlayerDefeatPlan,
  WorldPlayerDefeatStatePlan,
  createWorldPlayerDefeatStatePlan,
  resolveWorldPlayerDefeatPlan,
} from "./battleLifecycle";
import { getWorldSkillAreaTargets } from "./worldCombat";

export interface WorldStrikeResult {
  damage: number;
  isCrit: boolean;
  skillName?: string;
  nextActionDelayMs: number;
  skillCooldownMs: number;
  executionTimeMs: number;
  playerStatusNames: string[];
  enemyStatusNames: string[];
  playerShieldGain: number;
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
  maxTargets?: number;
  isProjectile: boolean;
}

export interface EnemyWorldStrikeResolved {
  damage: number;
  skillName?: string;
  nextActionDelayMs: number;
  specialCooldownMs: number;
  executionTimeMs: number;
  statusNames: string[];
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
  isProjectile: boolean;
}

export interface WorldStrikeImpactPlan {
  color: string;
  colorInt: number;
  targetX: number;
  targetY: number;
  radius: number;
  damageText: string;
  damageTextColor: string;
  damageTextColorInt: number;
}

export interface WorldStrikeVisualPlan {
  projectile?: {
    color: string;
    colorInt: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    durationMs: number;
  };
  area?: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs: number;
  };
  impact?: WorldStrikeImpactPlan;
}

export interface WorldShieldedDamageResolution {
  absorbed: number;
  damageTaken: number;
  remainingShield: number;
}

export interface PlayerWorldStrikeImpactTarget {
  target: ActiveMonster;
  damage: number;
  defeated: boolean;
  visualPlan: WorldStrikeVisualPlan;
}

export interface PlayerWorldStrikeExecutionPlan {
  strikeVisualPlan: WorldStrikeVisualPlan;
  impactTargets: PlayerWorldStrikeImpactTarget[];
  defeatedTargets: ActiveMonster[];
  resolutionMessage: string;
  shouldClearEncounter: boolean;
}

export interface PlayerWorldStrikeDefeatResult {
  monsterName: string;
  rewardManifest: BattleRewardManifest;
  recoveryAmount: number;
  recoveryLogMessage: string;
  victoryLogMessage: string;
}

export interface PlayerWorldStrikeOutcomePlan {
  executionPlan: PlayerWorldStrikeExecutionPlan;
  defeatedResults: PlayerWorldStrikeDefeatResult[];
}

export interface PlayerWorldStrikeOutcomeStatePlan {
  monsterDamageApplications: Array<{
    monsterInstanceId: string;
    damage: number;
  }>;
  visualPlans: WorldStrikeVisualPlan[];
  worldLastCombatMessage: string;
  rewardApplicationPlans: BattleRewardApplicationPlan[];
  logEntries: BattleLogEntryPlan[];
  nextWorldPlayerHp: number;
  shouldClearEncounter: boolean;
}

export interface EnemyWorldStrikeExecutionPlan {
  shieldResolution: WorldShieldedDamageResolution;
  nextHp: number;
  nextStatuses: string[];
  resolutionMessage: string;
  visualPlan: WorldStrikeVisualPlan;
  shouldHandleDefeat: boolean;
}

export interface EnemyWorldStrikeOutcomePlan {
  executionPlan: EnemyWorldStrikeExecutionPlan;
  defeatPlan?: WorldPlayerDefeatPlan;
}

export interface EnemyWorldStrikeOutcomeStatePlan {
  shouldUpdateWorldPlayerShield: boolean;
  nextWorldPlayerShield: number;
  nextWorldPlayerHp: number;
  nextWorldCombatPlayerStatuses: string[];
  worldLastCombatMessage: string;
  visualPlan: WorldStrikeVisualPlan;
  defeatStatePlan?: WorldPlayerDefeatStatePlan;
}

export interface PlayerWorldStrikePreviewPlan {
  worldCombatTargetId: string;
  worldCombatTargetStatuses: string[];
  worldCombatPlayerStatuses: string[];
  nextWorldPlayerShield: number;
  worldLastCombatMessage: string;
  nextPlayerActionReadyAt: number;
  nextPlayerSkillReadyAt?: number;
}

export interface EnemyWorldStrikePreviewPlan {
  nextEnemyActionReadyAt: number;
  nextEnemySpecialReadyAt?: number;
  worldLastCombatMessage: string;
}

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

export const resolveWorldShieldedDamage = ({
  incomingDamage,
  currentShield,
}: {
  incomingDamage: number;
  currentShield: number;
}): WorldShieldedDamageResolution => {
  const absorbed = Math.min(currentShield, incomingDamage);
  return {
    absorbed,
    damageTaken: incomingDamage - absorbed,
    remainingShield: Math.max(0, currentShield - absorbed),
  };
};

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
      projectile: strike.isProjectile
        ? {
            color: strikeColor,
            colorInt: strikeColorInt,
            sourceX: playerPosition.x,
            sourceY: playerPosition.y,
            targetX: targetedMonster.x,
            targetY: targetedMonster.y,
            durationMs: Math.max(240, strike.executionTimeMs || 360),
          }
        : undefined,
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
  skillProfession?: ProfessionType;
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
    rewardApplicationPlan: PlayerWorldStrikeOutcomeStatePlan["rewardApplicationPlans"][number]
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
      projectile: strike.isProjectile
        ? {
            color: "#f87171",
            colorInt: 0xf87171,
            sourceX: sourcePosition.x,
            sourceY: sourcePosition.y,
            targetX: playerPosition.x,
            targetY: playerPosition.y,
            durationMs: Math.max(240, strike.executionTimeMs || 320),
          }
        : undefined,
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
