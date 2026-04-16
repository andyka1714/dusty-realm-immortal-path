import { CombatLog, Enemy, Skill } from "../types";
import { pushCombatLog } from "./battleLog";

type StatusLike = {
  id: string;
  name: string;
  kind: string;
  value: number;
  expiresAtMs: number;
  nextTickAtMs?: number;
};

type PassiveFlagsLike = {
  hasSwordEmperorPassive?: boolean;
  hasBodyImmortalPassive?: boolean;
};

export const getStatusLabel = (statusId: string) => {
  switch (statusId) {
    case "stun":
      return "暈眩";
    case "freeze":
      return "凍結";
    case "paralyze":
      return "麻痺";
    case "banish":
      return "放逐";
    case "burn":
    case "true_fire_burn":
      return "燃燒";
    case "poison":
      return "中毒";
    case "bleed":
      return "流血";
    case "earth_shatter_debuff":
    case "armorBreak":
      return "破甲";
    case "reflect_taunt":
      return "反震";
    case "taunt":
      return "嘲諷";
    case "god_kingdom":
      return "神國侵蝕";
    case "spirit_sever":
      return "絕仙封脈";
    case "sword_qi":
      return "劍氣";
    default:
      return statusId;
  }
};

export const isNegativeStatusKind = (kind: string) =>
  [
    "burn",
    "poison",
    "bleed",
    "drain",
    "incapacitate",
    "armorBreak",
  ].includes(kind);

export const isDotStatusKind = (kind: string) =>
  ["burn", "poison", "bleed"].includes(kind);

const getCombatStatusSnapshot = (
  statuses: StatusLike[],
  timeMs: number
): string[] => {
  const labels = statuses
    .filter((status) => {
      if (status.kind === "shield") {
        return status.expiresAtMs > timeMs && status.value > 0;
      }
      return status.expiresAtMs > timeMs;
    })
    .map((status) => {
      const mapped = getStatusLabel(status.id);
      return mapped === status.id ? status.name : mapped;
    });

  return Array.from(new Set(labels));
};

export const createCombatSnapshotProvider = ({
  activeSkill,
  playerStatusesRef,
  enemyStatusesRef,
  activeSkillReadyAtMsRef,
  learnedSkills,
  resolveSkillCooldownSeconds,
}: {
  activeSkill?: Skill;
  playerStatusesRef: () => StatusLike[];
  enemyStatusesRef: () => StatusLike[];
  activeSkillReadyAtMsRef: () => number;
  learnedSkills: Skill[];
  resolveSkillCooldownSeconds: (
    skill: Skill | undefined,
    learnedSkills: string[] | Skill[]
  ) => number;
}) => (snapshotTimeMs: number) => ({
  playerStatuses: getCombatStatusSnapshot(playerStatusesRef(), snapshotTimeMs),
  enemyStatuses: getCombatStatusSnapshot(enemyStatusesRef(), snapshotTimeMs),
  playerActiveSkillName: activeSkill?.name,
  playerActiveSkillCooldownRemainingMs: activeSkill
    ? Math.max(0, activeSkillReadyAtMsRef() - snapshotTimeMs)
    : 0,
  playerActiveSkillCooldownTotalMs: activeSkill
    ? Math.floor(resolveSkillCooldownSeconds(activeSkill, learnedSkills) * 1000)
    : 0,
});

const resolveStatusTickOutcome = ({
  status,
  targetMaxHp,
  targetIsPlayer,
  enemy,
}: {
  status: StatusLike;
  targetMaxHp: number;
  targetIsPlayer: boolean;
  enemy?: Enemy;
}) => {
  let damage = 0;
  let message = "";
  let restoreToPlayer = false;
  let restoreToEnemy = false;

  switch (status.kind) {
    case "burn":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.02, status.value)));
      message = targetIsPlayer
        ? `你身陷【${status.name}】，承受 <dmg>${damage}</dmg> 點傷害！`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 身陷【${status.name}】，承受 <dmg>${damage}</dmg> 點傷害！`;
      break;
    case "poison":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.018, status.value)));
      message = targetIsPlayer
        ? `你遭【${status.name}】侵蝕，承受 <dmg>${damage}</dmg> 點傷害！`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 遭【${status.name}】侵蝕，承受 <dmg>${damage}</dmg> 點傷害！`;
      break;
    case "bleed":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.015, status.value)));
      message = targetIsPlayer
        ? `你氣血流失，因【${status.name}】承受 <dmg>${damage}</dmg> 點傷害！`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 傷口撕裂，流失 <dmg>${damage}</dmg> 點氣血！`;
      break;
    case "drain":
      damage = Math.max(1, Math.floor(targetMaxHp * Math.max(0.04, status.value)));
      restoreToPlayer = !targetIsPlayer;
      restoreToEnemy = targetIsPlayer;
      message = targetIsPlayer
        ? `你被【${status.name}】抽離生機，承受 <dmg>${damage}</dmg> 點傷害，敵方恢復同等氣血。`
        : `<enemy rank="${enemy?.rank}">${enemy?.name}</enemy> 遭【${status.name}】吞噬，承受 <dmg>${damage}</dmg> 點傷害，你回復了同等氣血。`;
      break;
  }

  return { damage, message, restoreToPlayer, restoreToEnemy };
};

const kindToStatusMessage = (
  status: StatusLike,
  targetIsPlayer: boolean,
  enemy: Enemy
) => {
  if (status.kind === "incapacitate") {
    return targetIsPlayer
      ? `你陷入【${status.name}】，行動受制。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 陷入【${status.name}】！`;
  }

  if (status.kind === "armorBreak") {
    return targetIsPlayer
      ? `你被施加【${status.name}】，護體被削弱！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】，護體被削弱！`;
  }

  if (status.kind === "critBoost") {
    return targetIsPlayer
      ? `你凝聚了【${status.name}】，下一輪劍勢更加凌厲。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 凝聚了【${status.name}】。`;
  }

  if (status.kind === "reflect") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，近身來敵將被反噬。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 佈下【${status.name}】。`;
  }

  if (
    status.kind === "burn" ||
    status.kind === "poison" ||
    status.kind === "bleed" ||
    status.kind === "drain"
  ) {
    return targetIsPlayer
      ? `你被施加【${status.name}】！`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 被施加【${status.name}】！`;
  }

  if (status.kind === "shield") {
    return targetIsPlayer
      ? `你獲得了【${status.name}】，可抵擋 ${Math.floor(status.value)} 點傷害。`
      : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 獲得了【${status.name}】。`;
  }

  return targetIsPlayer
    ? `你受到【${status.name}】影響。`
    : `<enemy rank="${enemy.rank}">${enemy.name}</enemy> 受到【${status.name}】影響。`;
};

const logAppliedCombatStatuses = ({
  logs,
  turn,
  timeMs,
  isPlayer,
  statuses,
  targetIsPlayer,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  isPlayer: boolean;
  statuses: StatusLike[];
  targetIsPlayer: boolean;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  statuses.forEach((status) => {
    pushCombatLog(logs, {
      turn,
      timeMs,
      isPlayer,
      message: kindToStatusMessage(status, targetIsPlayer, enemy),
      damage: 0,
      playerHp,
      playerMaxHp,
      enemyHp,
      enemyMaxHp,
    });
  });
};

export const appendAndLogCombatStatuses = ({
  container,
  statuses,
  logs,
  turn,
  timeMs,
  isPlayer,
  targetIsPlayer,
  enemy,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
}: {
  container: StatusLike[];
  statuses: StatusLike[];
  logs: CombatLog[];
  turn: number;
  timeMs: number;
  isPlayer: boolean;
  targetIsPlayer: boolean;
  enemy: Enemy;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
}) => {
  if (statuses.length === 0) {
    return;
  }

  container.push(...statuses);
  logAppliedCombatStatuses({
    logs,
    turn,
    timeMs,
    isPlayer,
    statuses,
    targetIsPlayer,
    enemy,
    playerHp,
    playerMaxHp,
    enemyHp,
    enemyMaxHp,
  });
};

const applyStatusTickBatch = ({
  statuses,
  tickMs,
  targetIsPlayer,
  targetMaxHp,
  actorIsPlayer,
  logs,
  turn,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  enemy,
  passiveFlags,
}: {
  statuses: StatusLike[];
  tickMs: number;
  targetIsPlayer: boolean;
  targetMaxHp: number;
  actorIsPlayer: boolean;
  logs: CombatLog[];
  turn: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemy?: Enemy;
  passiveFlags: PassiveFlagsLike;
}) => {
  let nextPlayerHp = playerHp;
  let nextEnemyHp = enemyHp;
  let playerTookDamage = false;

  statuses.forEach((status) => {
    if ((status.nextTickAtMs ?? 0) > tickMs || status.expiresAtMs <= tickMs) {
      return;
    }

    if (
      targetIsPlayer &&
      passiveFlags.hasSwordEmperorPassive &&
      isNegativeStatusKind(status.kind)
    ) {
      status.expiresAtMs = tickMs;
      status.nextTickAtMs = undefined;
      pushCombatLog(logs, {
        turn,
        timeMs: tickMs,
        isPlayer: true,
        message: `【萬法皆空】直接抹除了【${status.name}】。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp,
      });
      return;
    }

    if (
      targetIsPlayer &&
      passiveFlags.hasBodyImmortalPassive &&
      isDotStatusKind(status.kind)
    ) {
      status.expiresAtMs = tickMs;
      status.nextTickAtMs = undefined;
      pushCombatLog(logs, {
        turn,
        timeMs: tickMs,
        isPlayer: true,
        message: `【仙體無垢】淨化了【${status.name}】的侵蝕。`,
        damage: 0,
        playerHp: nextPlayerHp,
        playerMaxHp,
        enemyHp: nextEnemyHp,
        enemyMaxHp,
      });
      return;
    }

    const outcome = resolveStatusTickOutcome({
      status,
      targetMaxHp,
      targetIsPlayer,
      enemy,
    });

    if (targetIsPlayer) {
      if (outcome.restoreToEnemy && outcome.damage > 0) {
        nextEnemyHp = Math.min(enemyMaxHp, nextEnemyHp + outcome.damage);
      }
      if (outcome.damage > 0) {
        nextPlayerHp = Math.max(0, nextPlayerHp - outcome.damage);
        playerTookDamage = true;
        pushCombatLog(logs, {
          turn,
          timeMs: tickMs,
          isPlayer: actorIsPlayer,
          message: outcome.message,
          damage: outcome.damage,
          playerHp: nextPlayerHp,
          playerMaxHp,
          enemyHp: nextEnemyHp,
          enemyMaxHp,
        });
      }
    } else {
      if (outcome.restoreToPlayer && outcome.damage > 0) {
        nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + outcome.damage);
      }
      if (outcome.damage > 0) {
        nextEnemyHp = Math.max(0, nextEnemyHp - outcome.damage);
        pushCombatLog(logs, {
          turn,
          timeMs: tickMs,
          isPlayer: actorIsPlayer,
          message: outcome.message,
          damage: outcome.damage,
          playerHp: nextPlayerHp,
          playerMaxHp,
          enemyHp: nextEnemyHp,
          enemyMaxHp,
        });
      }
    }

    status.nextTickAtMs = tickMs + 1000;
  });

  return {
    playerHp: nextPlayerHp,
    enemyHp: nextEnemyHp,
    playerTookDamage,
  };
};

export const createStatusTickProcessor = ({
  getTurn,
  logs,
  player,
  enemy,
  passiveFlags,
  getPlayerHp,
  getEnemyHp,
  setPlayerHp,
  setEnemyHp,
  getPlayerStatuses,
  setPlayerStatuses,
  getEnemyStatuses,
  setEnemyStatuses,
  getLastStatusTickMs,
  setLastStatusTickMs,
  getPlayerDamagedSinceSwordHeartWindow: _getPlayerDamagedSinceSwordHeartWindow,
  setPlayerDamagedSinceSwordHeartWindow,
}: {
  getTurn: () => number;
  logs: CombatLog[];
  player: { maxHp: number };
  enemy: { maxHp: number } & Enemy;
  passiveFlags: PassiveFlagsLike;
  getPlayerHp: () => number;
  getEnemyHp: () => number;
  setPlayerHp: (value: number) => void;
  setEnemyHp: (value: number) => void;
  getPlayerStatuses: () => StatusLike[];
  setPlayerStatuses: (value: StatusLike[]) => void;
  getEnemyStatuses: () => StatusLike[];
  setEnemyStatuses: (value: StatusLike[]) => void;
  getLastStatusTickMs: () => number;
  setLastStatusTickMs: (value: number) => void;
  getPlayerDamagedSinceSwordHeartWindow: () => boolean;
  setPlayerDamagedSinceSwordHeartWindow: (value: boolean) => void;
}) => {
  const cleanupExpiredStatuses = (currentMs: number) => {
    setPlayerStatuses(
      getPlayerStatuses().filter(
        (status) =>
          status.expiresAtMs > currentMs &&
          (status.kind !== "shield" || status.value > 0)
      )
    );
    setEnemyStatuses(
      getEnemyStatuses().filter(
        (status) =>
          status.expiresAtMs > currentMs &&
          (status.kind !== "shield" || status.value > 0)
      )
    );
  };

  return (currentMs: number) => {
    while (
      getLastStatusTickMs() + 1000 <= currentMs &&
      getPlayerHp() > 0 &&
      getEnemyHp() > 0
    ) {
      const tickMs = getLastStatusTickMs() + 1000;
      setLastStatusTickMs(tickMs);

      cleanupExpiredStatuses(tickMs);

      const enemyTickResult = applyStatusTickBatch({
        statuses: getEnemyStatuses(),
        tickMs,
        targetIsPlayer: false,
        targetMaxHp: enemy.maxHp,
        actorIsPlayer: true,
        logs,
        turn: getTurn(),
        playerHp: getPlayerHp(),
        playerMaxHp: player.maxHp,
        enemyHp: getEnemyHp(),
        enemyMaxHp: enemy.maxHp,
        enemy,
        passiveFlags,
      });
      setPlayerHp(enemyTickResult.playerHp);
      setEnemyHp(enemyTickResult.enemyHp);

      const playerTickResult = applyStatusTickBatch({
        statuses: getPlayerStatuses(),
        tickMs,
        targetIsPlayer: true,
        targetMaxHp: player.maxHp,
        actorIsPlayer: false,
        logs,
        turn: getTurn(),
        playerHp: getPlayerHp(),
        playerMaxHp: player.maxHp,
        enemyHp: getEnemyHp(),
        enemyMaxHp: enemy.maxHp,
        passiveFlags,
      });
      setPlayerHp(playerTickResult.playerHp);
      setEnemyHp(playerTickResult.enemyHp);
      if (playerTickResult.playerTookDamage) {
        setPlayerDamagedSinceSwordHeartWindow(true);
      }
    }

    cleanupExpiredStatuses(currentMs);
  };
};
