import {
  ActiveMonster,
  CombatLog,
  Enemy,
  ItemInstance,
  Skill,
  VisualEffect,
} from "../types";
import type { BattleRewardManifest } from "./battleRewards";

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

export type AutoBattleReplayControllerResult =
  | {
      kind: "idle";
      nextProcessed: boolean;
      shouldClearReplayTimers: false;
    }
  | {
      kind: "transition";
      nextProcessed: boolean;
      shouldClearReplayTimers: boolean;
      replayState: AutoBattleReplayState;
    }
  | {
      kind: "finish";
      nextProcessed: boolean;
      shouldClearReplayTimers: false;
      finishResultPlan: AutoBattleReplayFinishResultPlan;
    }
  | {
      kind: "step";
      nextProcessed: boolean;
      shouldClearReplayTimers: false;
      timer: ReturnType<typeof setTimeout> | undefined;
    };

export type ReplayVisualSkillLike = {
  castRange?: number;
  castTimeMs?: number;
  areaShape?: Skill["areaShape"];
  areaRadius?: number;
};

export type ReplaySkillResolver<TSkill> = (
  skillName: string
) => TSkill | undefined;

export type ReplayTimerSet = Set<ReturnType<typeof setTimeout>>;

export type ReplayStepPlan<TResolved> =
  | {
      previousTimeMs?: number;
      nextTimeMs?: number;
      timerSet?: ReplayTimerSet;
      execute: () => void;
    }
  | undefined;

export type ReplayMonsterPosition = Pick<ActiveMonster, "x" | "y">;
export type ReplayEnemyRef = Enemy | null | undefined;
