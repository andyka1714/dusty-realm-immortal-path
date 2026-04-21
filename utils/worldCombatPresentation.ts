import { Enemy, EnemyRank, ProfessionType } from "../types";
import {
  getEnemyAttackIntervalMs,
  getPlayerAttackIntervalMs,
} from "./battleProfiles";
import { getStatusLabel } from "./battleStatusLabels";
import {
  getEnemyAggroRange,
  getEnemyCombatRoleProfile,
  getEnemyEngagementRange,
  getEnemyPreferredDistance,
  shouldEnemyHoldPreferredRange,
  shouldEnemyRetreatFromCloseRange,
  shouldEnemyStrafeNearRange,
  type WorldCombatEnemyRoleId,
} from "./worldCombat";

export interface CombatCadencePresentation {
  ready: boolean;
  remainingMs: number;
  totalMs: number;
  fillPercent: number;
  label: string;
}

export type WorldCombatCueTone =
  | "neutral"
  | "warning"
  | "danger"
  | "ready"
  | "buff"
  | "debuff"
  | "control"
  | "immune";

export type WorldCombatCueIconKey =
  | "target"
  | "swords"
  | "move"
  | "sparkles"
  | "shield"
  | "shieldOff"
  | "zap"
  | "snowflake"
  | "flame"
  | "droplets"
  | "skull";

export interface WorldCombatRolePresentation {
  roleId: WorldCombatEnemyRoleId;
  label: string;
  summary: string;
  detail: string;
  tone: WorldCombatCueTone;
  iconKey: WorldCombatCueIconKey;
}

export interface WorldCombatStatusCue {
  key: string;
  label: string;
  detail: string;
  timingLabel: string;
  tone: WorldCombatCueTone;
  iconKey: WorldCombatCueIconKey;
}

export interface WorldCombatEventCue {
  label: string;
  detail: string;
  tone: WorldCombatCueTone;
  iconKey: WorldCombatCueIconKey;
}

export interface WorldCombatStagePresentation {
  playerRangeRadius: number;
  enemyRangeRadius: number;
  enemyAggroRadius: number;
  enemyPreferredRadius: number;
  showEnemyAggroRing: boolean;
  showEnemyPreferredRing: boolean;
  showEnemyDangerFill: boolean;
  showEnemyRetreatBand: boolean;
  showTargetFocusReticle: boolean;
  enemyRoleLabel: string;
  enemyRoleAccentColor: number;
  enemyAggroColor: number;
  enemyPreferredColor: number;
  enemyDangerFillAlpha: number;
  enemyChargeRadius?: number;
  enemyChargeState?: "channeling" | "ready";
  enemyChargeColor?: number;
  bossTelegraphRadius?: number;
  bossTelegraphState?: "warning" | "ready";
}

export interface WorldCombatEnemySpecialPresentation
  extends CombatCadencePresentation {
  name: string;
  warningLabel: string;
}

export interface WorldCombatTargetPresentation {
  canPlayerStrike: boolean;
  canEnemyStrike: boolean;
  shouldHoldPreferredRange: boolean;
  shouldRetreatFromCloseRange: boolean;
  shouldStrafeNearRange: boolean;
  isAutoEngaged: boolean;
  enemyEngagementRange: number;
  enemyAggroRange: number;
  enemyPreferredRange: number;
  rolePresentation: WorldCombatRolePresentation;
  playerStatusCues: WorldCombatStatusCue[];
  enemyStatusCues: WorldCombatStatusCue[];
  recentEventCue: WorldCombatEventCue;
  playerAction: CombatCadencePresentation;
  playerSkill?: CombatCadencePresentation;
  enemyAction: CombatCadencePresentation;
  enemySpecial?: WorldCombatEnemySpecialPresentation;
  intentLabel: string;
  intentTone: "neutral" | "warning" | "danger" | "ready";
  rangeHint: string;
  stagePresentation: WorldCombatStagePresentation;
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const CONTROL_LABELS = ["暈眩", "凍結", "麻痺", "放逐"] as const;

const getCuePriority = ({
  tone,
  iconKey,
}: Pick<WorldCombatStatusCue, "tone" | "iconKey">) => {
  if (tone === "control") return 0;
  if (tone === "immune") return 1;
  if (iconKey === "shield") return 2;
  if (tone === "debuff" || tone === "danger") return 3;
  if (tone === "buff") return 4;
  return 5;
};

const createStatusCue = ({
  label,
  detail,
  timingLabel,
  tone,
  iconKey,
}: Omit<WorldCombatStatusCue, "key">): WorldCombatStatusCue => ({
  key: `${label}:${tone}:${iconKey}`,
  label,
  detail,
  timingLabel,
  tone,
  iconKey,
});

const buildCombatStatusCue = ({
  status,
  owner,
}: {
  status: string;
  owner: "player" | "enemy";
}): WorldCombatStatusCue => {
  const label = getStatusLabel(status);

  switch (label) {
    case "燃燒":
      return createStatusCue({
        label,
        detail: "持續灼傷，會穩定削血",
        timingLabel: "灼燒中",
        tone: "danger",
        iconKey: "flame",
      });
    case "中毒":
      return createStatusCue({
        label,
        detail: "持續侵蝕，拖長站場會更痛",
        timingLabel: "侵蝕中",
        tone: "danger",
        iconKey: "droplets",
      });
    case "流血":
      return createStatusCue({
        label,
        detail: "持續失血，近身換血風險更高",
        timingLabel: "失血中",
        tone: "danger",
        iconKey: "droplets",
      });
    case "暈眩":
      return createStatusCue({
        label,
        detail: "行動被打斷，無法順利出手",
        timingLabel: "控制中",
        tone: "control",
        iconKey: "zap",
      });
    case "凍結":
      return createStatusCue({
        label,
        detail: "節奏被凍住，走位與輸出同步受限",
        timingLabel: "凍結中",
        tone: "control",
        iconKey: "snowflake",
      });
    case "麻痺":
      return createStatusCue({
        label,
        detail: "出手節奏失衡，容易被連段壓制",
        timingLabel: "麻痺中",
        tone: "control",
        iconKey: "zap",
      });
    case "放逐":
      return createStatusCue({
        label,
        detail: "暫時脫離正常交鋒節奏",
        timingLabel: "放逐中",
        tone: "control",
        iconKey: "sparkles",
      });
    case "護盾":
      return createStatusCue({
        label,
        detail: "先吃盾值，再結算本體傷害",
        timingLabel: "吸收中",
        tone: "buff",
        iconKey: "shield",
      });
    case "元素護盾":
      return createStatusCue({
        label,
        detail: "元素傷害先被護盾消化",
        timingLabel: "護盾中",
        tone: "buff",
        iconKey: "shield",
      });
    case "破甲":
      return createStatusCue({
        label,
        detail: "防禦被削弱，近接爆發更危險",
        timingLabel: "弱化中",
        tone: "debuff",
        iconKey: "shieldOff",
      });
    case "易傷":
      return createStatusCue({
        label,
        detail: "承傷上升，吃到連招會更痛",
        timingLabel: "放大中",
        tone: "debuff",
        iconKey: "shieldOff",
      });
    case "反震":
      return createStatusCue({
        label,
        detail: "近身反打時會被反震回來",
        timingLabel: "反震中",
        tone: "warning",
        iconKey: "shield",
      });
    case "嘲諷":
      return createStatusCue({
        label,
        detail: "目標鎖定傾向更強，容易被拖住",
        timingLabel: "牽制中",
        tone: "warning",
        iconKey: "target",
      });
    case "獸神附體":
      return createStatusCue({
        label,
        detail: "爆發、吸血與控制免疫同時啟動",
        timingLabel: "形態中",
        tone: "buff",
        iconKey: "sparkles",
      });
    case "劍氣":
      return createStatusCue({
        label,
        detail: "下一輪劍勢與破甲壓力更強",
        timingLabel: "蓄勢中",
        tone: "buff",
        iconKey: "swords",
      });
    case "絕仙封脈":
    case "神國侵蝕":
      return createStatusCue({
        label,
        detail: "特殊壓制效果持續覆蓋中",
        timingLabel: "壓制中",
        tone: "debuff",
        iconKey: "sparkles",
      });
    default:
      return createStatusCue({
        label,
        detail: owner === "player" ? "增益或被動效果仍在生效" : "壓制或場控效果仍在生效",
        timingLabel: owner === "player" ? "啟動中" : "生效中",
        tone: owner === "player" ? "buff" : "warning",
        iconKey: owner === "player" ? "sparkles" : "target",
      });
  }
};

export const resolveWorldCombatStatusCues = ({
  statuses,
  owner,
}: {
  statuses: string[];
  owner: "player" | "enemy";
}): WorldCombatStatusCue[] =>
  Array.from(
    new Map(
      statuses.map((status) => {
        const cue = buildCombatStatusCue({ status, owner });
        return [cue.key, cue];
      })
    ).values()
  ).sort((left, right) => {
    const leftPriority = getCuePriority(left);
    const rightPriority = getCuePriority(right);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }
    return left.label.localeCompare(right.label, "zh-Hant");
  });

const getBossTelegraphRadius = (enemy: Enemy) => {
  if (!enemy.specialAttack) return undefined;

  const shape = enemy.specialAttack.areaShape ?? "single";
  if (shape !== "single" && shape !== "self") {
    return Math.max(1, enemy.specialAttack.areaRadius ?? 1);
  }

  return 0.95;
};

const resolveRolePresentation = (enemy: Enemy): WorldCombatRolePresentation => {
  const role = getEnemyCombatRoleProfile(enemy);

  if (role.id === "boss-hazard") {
    return {
      roleId: role.id,
      label: role.label,
      summary: role.summary,
      detail: role.detail,
      tone: "danger",
      iconKey: "skull",
    };
  }

  if (role.id === "caster-channeler") {
    return {
      roleId: role.id,
      label: role.label,
      summary: role.summary,
      detail: role.detail,
      tone: "warning",
      iconKey: "sparkles",
    };
  }

  if (role.id === "ranged-skirmisher") {
    return {
      roleId: role.id,
      label: role.label,
      summary: role.summary,
      detail: role.detail,
      tone: "warning",
      iconKey: "target",
    };
  }

  return {
    roleId: role.id,
    label: role.label,
    summary: role.summary,
    detail: role.detail,
    tone: "danger",
    iconKey: "swords",
  };
};

const resolveRecentEventCue = ({
  recentMessage,
  enemySpecial,
  canEnemyStrike,
  shouldHoldPreferredRange,
  shouldRetreatFromCloseRange,
  shouldStrafeNearRange,
  enemyEngagementRange,
  enemyPreferredRange,
  rolePresentation,
}: {
  recentMessage?: string | null;
  enemySpecial?: WorldCombatEnemySpecialPresentation;
  canEnemyStrike: boolean;
  shouldHoldPreferredRange: boolean;
  shouldRetreatFromCloseRange: boolean;
  shouldStrafeNearRange: boolean;
  enemyEngagementRange: number;
  enemyPreferredRange: number;
  rolePresentation: WorldCombatRolePresentation;
}): WorldCombatEventCue => {
  const resolvedMessage = recentMessage?.trim() ?? "";
  const matchedControl = CONTROL_LABELS.find((label) =>
    resolvedMessage.includes(label)
  );

  if (
    resolvedMessage.includes("免疫") ||
    resolvedMessage.includes("掙脫") ||
    resolvedMessage.includes("撕碎了控制")
  ) {
    return {
      label: matchedControl ? `${matchedControl} 被免疫` : "控制免疫",
      detail: resolvedMessage || "本次控制被直接抵消，無法靠日誌外推命中。",
      tone: "immune",
      iconKey: "shield",
    };
  }

  if (matchedControl) {
    return {
      label: `${matchedControl} 生效`,
      detail: "本輪控制已命中，目標節奏會被強行打斷。",
      tone: "control",
      iconKey:
        matchedControl === "凍結"
          ? "snowflake"
          : matchedControl === "放逐"
            ? "sparkles"
            : "zap",
    };
  }

  if (enemySpecial?.ready) {
    return {
      label: `${enemySpecial.name} 已落點`,
      detail: `${enemySpecial.warningLabel}，剩餘節奏 ${enemySpecial.label}`,
      tone: "ready",
      iconKey: "skull",
    };
  }

  if (enemySpecial && enemySpecial.remainingMs > 0) {
    return {
      label: `${enemySpecial.name} 蓄力中`,
      detail: `${enemySpecial.warningLabel}，倒數 ${enemySpecial.label}`,
      tone: "warning",
      iconKey: "sparkles",
    };
  }

  if (shouldRetreatFromCloseRange) {
    return {
      label: "後撤拉距",
      detail: `敵方正在回到 ${enemyPreferredRange} 格附近的輸出帶。`,
      tone: "warning",
      iconKey: "move",
    };
  }

  if (shouldHoldPreferredRange) {
    return {
      label:
        rolePresentation.roleId === "caster-channeler" ? "維持施法距離" : "維持射擊距離",
      detail: `敵方正在壓在 ${enemyPreferredRange} 格附近穩定出手。`,
      tone: "warning",
      iconKey: "move",
    };
  }

  if (shouldStrafeNearRange) {
    return {
      label: "側移風箏",
      detail: "敵方會邊移動邊維持火線，避免原地吃正面輸出。",
      tone: "warning",
      iconKey: "move",
    };
  }

  if (canEnemyStrike) {
    return {
      label: "進入危險區",
      detail: `敵方 ${enemyEngagementRange} 格危險區已覆蓋到你的位置。`,
      tone: "danger",
      iconKey: "target",
    };
  }

  return {
    label: rolePresentation.summary,
    detail: rolePresentation.detail,
    tone: rolePresentation.tone,
    iconKey: rolePresentation.iconKey,
  };
};

export const formatCombatCountdown = (remainingMs: number) => {
  const seconds = Math.max(0, remainingMs) / 1000;
  return seconds >= 10 ? `${seconds.toFixed(0)}s` : `${seconds.toFixed(1)}s`;
};

export const resolveCombatCadencePresentation = ({
  now,
  readyAtMs,
  totalMs,
}: {
  now: number;
  readyAtMs: number;
  totalMs: number;
}): CombatCadencePresentation => {
  const resolvedTotalMs = Math.max(0, totalMs);
  const remainingMs = Math.max(0, readyAtMs - now);
  const ready = remainingMs <= 0 || resolvedTotalMs <= 0;
  const fillPercent = ready
    ? 100
    : clampPercent(100 - (remainingMs / resolvedTotalMs) * 100);

  return {
    ready,
    remainingMs,
    totalMs: resolvedTotalMs,
    fillPercent,
    label: ready ? "就緒" : formatCombatCountdown(remainingMs),
  };
};

export const getWorldProjectileTravelDurationMs = ({
  source,
  target,
  executionTimeMs,
}: {
  source: { x: number; y: number };
  target: { x: number; y: number };
  executionTimeMs?: number;
}) => {
  const distance = Math.max(
    1,
    Math.hypot(target.x - source.x, target.y - source.y)
  );
  const distanceBasedMs = Math.round(140 + distance * 90);
  if (!executionTimeMs || executionTimeMs <= 0) {
    return Math.max(180, distanceBasedMs);
  }

  return Math.max(180, Math.min(executionTimeMs, distanceBasedMs));
};

export const resolveWorldCombatTargetPresentation = ({
  now,
  distance,
  playerEngagementRange,
  profession,
  playerSpeed,
  playerActionReadyAt,
  playerSkillReadyAt,
  playerSkillTotalMs,
  enemy,
  enemyActionReadyAt,
  enemySpecialReadyAt,
  worldCombatTargetId,
  targetMonsterInstanceId,
  isAutoBattling,
  playerStatusNames = [],
  enemyStatusNames = [],
  recentMessage,
}: {
  now: number;
  distance: number;
  playerEngagementRange: number;
  profession: ProfessionType;
  playerSpeed: number;
  playerActionReadyAt: number;
  playerSkillReadyAt: number;
  playerSkillTotalMs?: number;
  enemy: Enemy;
  enemyActionReadyAt: number;
  enemySpecialReadyAt?: number;
  worldCombatTargetId: string | null;
  targetMonsterInstanceId: string;
  isAutoBattling: boolean;
  playerStatusNames?: string[];
  enemyStatusNames?: string[];
  recentMessage?: string | null;
}): WorldCombatTargetPresentation => {
  const roleProfile = getEnemyCombatRoleProfile(enemy);
  const rolePresentation = resolveRolePresentation(enemy);
  const enemyEngagementRange = getEnemyEngagementRange(enemy);
  const enemyAggroRange = getEnemyAggroRange(enemy);
  const enemyPreferredRange = getEnemyPreferredDistance(enemy);
  const canPlayerStrike = distance <= playerEngagementRange;
  const canEnemyStrike = distance <= enemyEngagementRange;
  const retreatFromCloseRange = shouldEnemyRetreatFromCloseRange(enemy, distance);
  const holdPreferred = shouldEnemyHoldPreferredRange(enemy, distance);
  const strafeNearRange = shouldEnemyStrafeNearRange(enemy, distance);
  const isAutoEngaged =
    worldCombatTargetId === targetMonsterInstanceId || isAutoBattling;

  const playerAction = resolveCombatCadencePresentation({
    now,
    readyAtMs: playerActionReadyAt,
    totalMs: getPlayerAttackIntervalMs({
      profession,
      speed: playerSpeed,
    }),
  });

  const playerSkill =
    playerSkillTotalMs && playerSkillTotalMs > 0
      ? resolveCombatCadencePresentation({
          now,
          readyAtMs: playerSkillReadyAt,
          totalMs: playerSkillTotalMs,
        })
      : undefined;

  const enemyAction = resolveCombatCadencePresentation({
    now,
    readyAtMs: enemyActionReadyAt,
    totalMs: getEnemyAttackIntervalMs(enemy),
  });

  const enemySpecialTotalMs = Math.max(
    0,
    (enemy.specialAttack?.cooldownSeconds ?? 0) * 1000
  );
  const enemySpecialCadence =
    enemy.specialAttack && enemySpecialTotalMs > 0
      ? resolveCombatCadencePresentation({
          now,
          readyAtMs: enemySpecialReadyAt ?? now,
          totalMs: enemySpecialTotalMs,
        })
      : undefined;

  const showBossTelegraph =
    enemy.rank === EnemyRank.Boss &&
    Boolean(enemy.specialAttack) &&
    Boolean(enemySpecialCadence) &&
    (enemySpecialCadence.ready ||
      enemySpecialCadence.remainingMs <=
        Math.max(800, Math.min(2200, enemySpecialCadence.totalMs * 0.35)));

  const playerStatusCues = resolveWorldCombatStatusCues({
    statuses: playerStatusNames,
    owner: "player",
  });
  const enemyStatusCues = resolveWorldCombatStatusCues({
    statuses: enemyStatusNames,
    owner: "enemy",
  });

  const intentLabel = enemySpecialCadence?.ready
    ? `${enemy.specialAttack?.name ?? "特招"} 已就緒`
    : retreatFromCloseRange
      ? enemy.aiStyle === "caster"
        ? "後撤重整施法位"
        : "後撤重整火線"
      : holdPreferred
        ? enemy.aiStyle === "caster"
          ? "維持施法距離"
          : "維持射擊距離"
        : strafeNearRange
          ? "側移風箏"
          : distance > enemyAggroRange
            ? "警戒範圍外"
            : canEnemyStrike
              ? "進入打擊距離"
              : enemy.aiStyle === "melee"
                ? "近身追擊"
                : "拉開攻擊線";

  const intentTone: WorldCombatTargetPresentation["intentTone"] =
    enemySpecialCadence?.ready
      ? "ready"
      : showBossTelegraph || canEnemyStrike
        ? "danger"
        : retreatFromCloseRange || holdPreferred || strafeNearRange
          ? "warning"
          : "neutral";

  const rangeHint = canEnemyStrike
    ? `敵方危險區 ${enemyEngagementRange} 格，已可直接回擊`
    : retreatFromCloseRange
      ? `敵方會回撤到 ${enemyPreferredRange} 格附近再重整出手`
      : holdPreferred
        ? `敵方傾向維持 ${enemyPreferredRange} 格施法/射擊距離`
        : `敵方危險區 ${enemyEngagementRange} 格，警戒 ${enemyAggroRange} 格`;

  const enemySpecial = enemySpecialCadence
    ? {
        ...enemySpecialCadence,
        name: enemy.specialAttack?.name ?? "特招",
        warningLabel: enemySpecialCadence.ready
          ? "Boss 技能圈已進入落點階段"
          : "Boss 特招蓄力中",
      }
    : undefined;

  const recentEventCue = resolveRecentEventCue({
    recentMessage,
    enemySpecial,
    canEnemyStrike,
    shouldHoldPreferredRange: holdPreferred,
    shouldRetreatFromCloseRange: retreatFromCloseRange,
    shouldStrafeNearRange: strafeNearRange,
    enemyEngagementRange,
    enemyPreferredRange,
    rolePresentation,
  });

  const stageChargeState =
    enemySpecialCadence && !enemySpecialCadence.ready
      ? "channeling"
      : enemySpecialCadence?.ready
        ? "ready"
        : undefined;

  return {
    canPlayerStrike,
    canEnemyStrike,
    shouldHoldPreferredRange: holdPreferred,
    shouldRetreatFromCloseRange: retreatFromCloseRange,
    shouldStrafeNearRange: strafeNearRange,
    isAutoEngaged,
    enemyEngagementRange,
    enemyAggroRange,
    enemyPreferredRange,
    rolePresentation,
    playerStatusCues,
    enemyStatusCues,
    recentEventCue,
    playerAction,
    playerSkill,
    enemyAction,
    enemySpecial,
    intentLabel,
    intentTone,
    rangeHint,
    stagePresentation: {
      playerRangeRadius: playerEngagementRange,
      enemyRangeRadius: enemyEngagementRange,
      enemyAggroRadius: enemyAggroRange,
      enemyPreferredRadius: enemyPreferredRange,
      showEnemyAggroRing:
        enemy.rank === EnemyRank.Boss ||
        enemy.aiStyle === "caster" ||
        enemy.aiStyle === "ranged",
      showEnemyPreferredRing:
        enemy.aiStyle === "caster" || enemy.aiStyle === "ranged",
      showEnemyDangerFill:
        roleProfile.id === "melee-pressure" || roleProfile.id === "boss-hazard",
      showEnemyRetreatBand: retreatFromCloseRange,
      showTargetFocusReticle: isAutoEngaged || canEnemyStrike || canPlayerStrike,
      enemyRoleLabel: roleProfile.label,
      enemyRoleAccentColor: roleProfile.accentColor,
      enemyAggroColor: 0xf59e0b,
      enemyPreferredColor:
        roleProfile.id === "caster-channeler" ? 0x60a5fa : 0xf59e0b,
      enemyDangerFillAlpha:
        roleProfile.id === "boss-hazard"
          ? 0.16
          : roleProfile.id === "melee-pressure"
            ? 0.12
            : 0.08,
      enemyChargeRadius:
        enemySpecialCadence && stageChargeState
          ? Math.max(0.8, Math.min(1.6, enemyEngagementRange * 0.75))
          : undefined,
      enemyChargeState: stageChargeState,
      enemyChargeColor:
        stageChargeState === "ready"
          ? 0xfb7185
          : roleProfile.id === "caster-channeler"
            ? 0x60a5fa
            : 0xf59e0b,
      bossTelegraphRadius: showBossTelegraph
        ? getBossTelegraphRadius(enemy)
        : undefined,
      bossTelegraphState: showBossTelegraph
        ? enemySpecialCadence?.ready
          ? "ready"
          : "warning"
        : undefined,
    },
  };
};
