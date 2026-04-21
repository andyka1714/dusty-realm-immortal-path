import { CombatLog, Enemy } from "../types";
import { pushCombatLog } from "./battleLog";
import {
  isDotStatusKind,
  isNegativeStatusKind,
} from "./battleStatusLabels";
import type { CombatStatusLike } from "./battleStatusTypes";

type PassiveFlagsLike = {
  hasSwordEmperorPassive?: boolean;
  hasBodyImmortalPassive?: boolean;
};

const resolveStatusTickOutcome = ({
  status,
  targetMaxHp,
  targetIsPlayer,
  enemy,
}: {
  status: CombatStatusLike;
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
  statuses: CombatStatusLike[];
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
  getPlayerStatuses: () => CombatStatusLike[];
  setPlayerStatuses: (value: CombatStatusLike[]) => void;
  getEnemyStatuses: () => CombatStatusLike[];
  setEnemyStatuses: (value: CombatStatusLike[]) => void;
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
        enemy,
        passiveFlags,
      });
      setPlayerHp(playerTickResult.playerHp);
      setEnemyHp(playerTickResult.enemyHp);

      if (playerTickResult.playerTookDamage) {
        setPlayerDamagedSinceSwordHeartWindow(true);
      }

      cleanupExpiredStatuses(tickMs);
    }
  };
};
