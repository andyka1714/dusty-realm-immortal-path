import {
  ActiveMonster,
  CombatLog,
  Enemy,
  ItemInstance,
  Skill,
  VisualEffect,
} from "../types";
import { BattleRewardManifest, createBattleRewardManifest } from "./battleRewards";

export interface AutoBattleReplaySession {
  displayedLogs: CombatLog[];
  replayQueue: CombatLog[];
  battleSnapshot: {
    playerHp: number;
    playerMaxHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    won: boolean;
    rewards?: {
      spiritStones: number;
      exp: number;
      drops: { itemId: string; count: number; instance?: ItemInstance }[];
    };
  };
}

export interface AdvancedAutoBattleReplaySession {
  nextLog?: CombatLog;
  nextSession: AutoBattleReplaySession;
}

export interface AutoBattleReplayOutcome {
  won: boolean;
  logs: CombatLog[];
  respawnMapId?: string;
  defeatedMonster: ActiveMonster | null;
  rewards?: AutoBattleReplaySession["battleSnapshot"]["rewards"];
  defeatLogMessage?: string;
}

export interface WorldStrikeVisualPlan {
  projectile?: {
    color: string;
    colorInt: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    durationMs?: number;
  };
  area?: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    durationMs?: number;
  };
  impact?: {
    color: string;
    colorInt: number;
    targetX: number;
    targetY: number;
    radius: number;
    damageText: string;
    damageTextColor: string;
    damageTextColorInt: number;
  };
}

export interface AutoBattleReplayState {
  displayedLogs: CombatLog[];
  replayQueue: CombatLog[];
  battleSnapshot: AutoBattleReplaySession["battleSnapshot"] | null;
  isReplayingBattle: boolean;
}

export interface AutoBattleReplayStepStatePlan {
  replayState: AutoBattleReplayState;
  visualPlan: WorldStrikeVisualPlan;
  shouldAutoScroll: true;
}

export interface AutoBattleReplayFinishPlan {
  shouldStopReplay: true;
  battleResult: {
    won: boolean;
    logs: CombatLog[];
    respawnMapId?: string;
  };
  victoryTarget?: Pick<ActiveMonster, "x" | "y">;
  rewards?: AutoBattleReplaySession["battleSnapshot"]["rewards"];
  defeatLogMessage?: string;
}

export interface AutoBattleReplayFinishResultPlan {
  shouldStopReplay: true;
  battleResult: AutoBattleReplayFinishPlan["battleResult"];
  finishEffects: Array<Omit<VisualEffect, "id">>;
  rewardManifest?: BattleRewardManifest;
  defeatLogMessage?: string;
}

export interface ResolvedAutoBattleReplayStep<TMonster, TSkill> {
  nextLog: CombatLog;
  nextSession: AutoBattleReplaySession;
  targetMonster: TMonster | null;
  normalizedUsedSkill?: TSkill;
}

export type AutoBattleReplayFrameResult =
  | { kind: "idle" }
  | { kind: "finish"; replayOutcome: AutoBattleReplayOutcome }
  | { kind: "step"; timer: ReturnType<typeof setTimeout> | undefined };

export type AutoBattleReplayFrameStateResult =
  | { kind: "idle" }
  | { kind: "finish"; finishResultPlan: AutoBattleReplayFinishResultPlan }
  | { kind: "step"; timer: ReturnType<typeof setTimeout> | undefined };

export const createAutoBattleReplayState = ({
  session,
  isReplayingBattle = true,
}: {
  session: AutoBattleReplaySession;
  isReplayingBattle?: boolean;
}): AutoBattleReplayState => ({
  displayedLogs: session.displayedLogs,
  replayQueue: session.replayQueue,
  battleSnapshot: session.battleSnapshot,
  isReplayingBattle,
});

export const createIdleAutoBattleReplayState =
  (): AutoBattleReplayState => ({
    displayedLogs: [],
    replayQueue: [],
    battleSnapshot: null,
    isReplayingBattle: false,
  });

export const advanceAutoBattleReplaySession = (
  session: AutoBattleReplaySession
): AdvancedAutoBattleReplaySession => {
  const [nextLog, ...remainingReplayQueue] = session.replayQueue;
  if (!nextLog) {
    return { nextSession: session };
  }

  return {
    nextLog,
    nextSession: {
      ...session,
      displayedLogs: [...session.displayedLogs, nextLog],
      replayQueue: remainingReplayQueue,
      battleSnapshot:
        nextLog.playerHp !== undefined
          ? {
              ...session.battleSnapshot,
              playerHp: nextLog.playerHp,
              enemyHp: nextLog.enemyHp,
            }
          : session.battleSnapshot,
    },
  };
};

export const resolveAutoBattleReplayOutcome = ({
  battleSnapshot,
  displayedLogs,
  currentEnemy,
  currentEnemyInstanceId,
  activeMonsters,
  respawnMapId,
}: {
  battleSnapshot: AutoBattleReplaySession["battleSnapshot"];
  displayedLogs: CombatLog[];
  currentEnemy?: Enemy | null;
  currentEnemyInstanceId?: string | null;
  activeMonsters: ActiveMonster[];
  respawnMapId?: string;
}): AutoBattleReplayOutcome => {
  const defeatedMonster =
    battleSnapshot.won && currentEnemyInstanceId
      ? activeMonsters.find(
          (monster) => monster.instanceId === currentEnemyInstanceId
        ) ?? null
      : null;

  return {
    won: battleSnapshot.won,
    logs: displayedLogs,
    respawnMapId: battleSnapshot.won ? undefined : respawnMapId,
    defeatedMonster,
    rewards: battleSnapshot.won ? battleSnapshot.rewards : undefined,
    defeatLogMessage:
      !battleSnapshot.won && currentEnemy
        ? `不敵 ${currentEnemy.name}，狼狽逃回。`
        : undefined,
  };
};

export const createBattleReplayVisualPlan = <TSkill extends {
  castRange?: number;
  castTimeMs?: number;
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
}>({
  nextLog,
  targetMonster,
  playerPosition,
  enemyAttackRange,
  normalizedUsedSkill,
}: {
  nextLog: CombatLog;
  targetMonster: ActiveMonster | null;
  playerPosition: Pick<ActiveMonster, "x" | "y">;
  enemyAttackRange?: number;
  normalizedUsedSkill?: TSkill;
}): WorldStrikeVisualPlan => {
  const projectilePlan =
    normalizedUsedSkill && nextLog.isPlayer && targetMonster
      ? (normalizedUsedSkill.castRange ?? 1) > 1
        ? {
            color: "#60a5fa",
            colorInt: 0x60a5fa,
            sourceX: playerPosition.x,
            sourceY: playerPosition.y,
            targetX: targetMonster.x,
            targetY: targetMonster.y,
            durationMs: Math.max(220, normalizedUsedSkill.castTimeMs ?? 280),
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
    normalizedUsedSkill &&
    nextLog.isPlayer &&
    targetMonster &&
    normalizedUsedSkill.areaShape &&
    normalizedUsedSkill.areaShape !== "single" &&
    normalizedUsedSkill.areaShape !== "self" &&
    (normalizedUsedSkill.areaRadius ?? 0) > 0
      ? {
          color: "#a78bfa",
          colorInt: 0xa78bfa,
          targetX: targetMonster.x,
          targetY: targetMonster.y,
          radius: normalizedUsedSkill.areaRadius,
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

export const createAutoBattleReplayStepStatePlan = <TSkill>({
  nextLog,
  nextSession,
  targetMonster,
  normalizedUsedSkill,
  playerPosition,
  enemyAttackRange,
}: ResolvedAutoBattleReplayStep<ActiveMonster, TSkill> & {
  playerPosition: Pick<ActiveMonster, "x" | "y">;
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

export const createAutoBattleReplayFinishPlan = ({
  replayOutcome,
}: {
  replayOutcome: AutoBattleReplayOutcome;
}): AutoBattleReplayFinishPlan => ({
  shouldStopReplay: true,
  battleResult: {
    won: replayOutcome.won,
    logs: replayOutcome.logs,
    respawnMapId: replayOutcome.respawnMapId,
  },
  victoryTarget: replayOutcome.won
    ? replayOutcome.defeatedMonster
      ? {
          x: replayOutcome.defeatedMonster.x,
          y: replayOutcome.defeatedMonster.y,
        }
      : undefined
    : undefined,
  rewards: replayOutcome.won ? replayOutcome.rewards : undefined,
  defeatLogMessage: replayOutcome.won ? undefined : replayOutcome.defeatLogMessage,
});

export const createAutoBattleReplayFinishEffects = ({
  finishPlan,
}: {
  finishPlan: AutoBattleReplayFinishPlan;
}): Array<Omit<VisualEffect, "id">> => {
  if (!finishPlan.victoryTarget) {
    return [];
  }

  return [
    {
      type: "area",
      text: "",
      color: "#fca5a5",
      colorInt: 0xfca5a5,
      targetX: finishPlan.victoryTarget.x,
      targetY: finishPlan.victoryTarget.y,
      radius: 0.9,
      durationMs: 420,
    },
    {
      type: "impact",
      text: "",
      color: "#ffffff",
      colorInt: 0xffffff,
      targetX: finishPlan.victoryTarget.x,
      targetY: finishPlan.victoryTarget.y,
      radius: 0.85,
      durationMs: 320,
    },
  ];
};

export const resolveAutoBattleReplayFinishResultPlan = ({
  replayOutcome,
  currentEnemy,
}: {
  replayOutcome: AutoBattleReplayOutcome;
  currentEnemy?: Enemy | null;
}): AutoBattleReplayFinishResultPlan => {
  const finishPlan = createAutoBattleReplayFinishPlan({
    replayOutcome,
  });

  return {
    shouldStopReplay: true,
    battleResult: finishPlan.battleResult,
    finishEffects: createAutoBattleReplayFinishEffects({ finishPlan }),
    rewardManifest:
      finishPlan.rewards && currentEnemy
        ? createBattleRewardManifest({
            enemy: currentEnemy,
            rewards: finishPlan.rewards,
          })
        : undefined,
    defeatLogMessage: finishPlan.defeatLogMessage,
  };
};
