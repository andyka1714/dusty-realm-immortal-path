import { ELEMENT_NAMES } from "../constants";
import { CombatLog, ElementType, Enemy } from "../types";
import { pushCombatLog } from "./battleLog";
import { type PlayerPassiveFlags } from "./battlePassives";
import {
  getInitialPassiveBattleLogMessages,
  type EncounterOpeningPassiveFlags,
} from "./battleEncounterOpeningMessages";
import type {
  EncounterElementalAffinity,
  EncounterPlayerCombatStatsLike,
  EncounterRestriction,
} from "./battleEncounterTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

const getInitialEnemySpecialReadyAtMs = (hasMageEmperorPassive: boolean) =>
  hasMageEmperorPassive ? 2000 : 0;

const getInitialPassiveStatuses = (
  passiveFlags: Pick<
    EncounterOpeningPassiveFlags,
    "hasReflectPassive" | "hasInitialShieldPassive"
  >
) => {
  const statuses: CombatStatusLike[] = [];

  if (passiveFlags.hasReflectPassive) {
    statuses.push({
      id: "thorn_reflect",
      name: "荊棘反震",
      kind: "reflect",
      value: 0.15,
      expiresAtMs: Number.MAX_SAFE_INTEGER,
    });
  }

  if (passiveFlags.hasInitialShieldPassive) {
    statuses.push({
      id: "elemental_barrier",
      name: "元素護盾",
      kind: "shield",
      value: 1,
      expiresAtMs: Number.MAX_SAFE_INTEGER,
    });
  }

  return statuses;
};

const resolveInitialPassiveStateBundle = (
  passiveFlags: EncounterOpeningPassiveFlags
) => ({
  initialPassiveStatuses: getInitialPassiveStatuses(passiveFlags),
  openingMessages: getInitialPassiveBattleLogMessages(passiveFlags),
  initialEnemySpecialReadyAtMs: getInitialEnemySpecialReadyAtMs(
    passiveFlags.hasMageEmperorPassive
  ),
});

const getCombatOpeningMessages = ({
  player,
  enemy,
  restriction,
  elementalAffinity,
  passiveFlags,
}: {
  player: EncounterPlayerCombatStatsLike;
  enemy: Enemy;
  restriction: EncounterRestriction;
  elementalAffinity: EncounterElementalAffinity;
  passiveFlags: EncounterOpeningPassiveFlags;
}) => {
  const messages: string[] = [];

  if (player.element !== ElementType.None && enemy.element !== ElementType.None) {
    if (restriction.isEffective) {
      messages.push(
        `屬性克制：你的【${ELEMENT_NAMES[player.element]}】克制了敵方的【${ELEMENT_NAMES[enemy.element]}】！攻擊更易穿透對方護體。`
      );
    }
    if (restriction.isResisted) {
      messages.push(
        `屬性受制：你的【${ELEMENT_NAMES[player.element]}】受到敵方【${ELEMENT_NAMES[enemy.element]}】壓制，輸出略有削弱。`
      );
    }
    if (elementalAffinity.reason === "weakness") {
      messages.push(
        `弱點洞察：敵方對【${ELEMENT_NAMES[player.element]}】存在明顯弱點，造成的直接傷害將額外提升。`
      );
    } else if (elementalAffinity.reason === "resistance") {
      messages.push(
        `元素抗性：敵方對【${ELEMENT_NAMES[player.element]}】具備抗性，造成的直接傷害會被部分削減。`
      );
    }
  }

  messages.push(...getInitialPassiveBattleLogMessages(passiveFlags));

  return messages;
};

const initializeCombatEncounter = ({
  player,
  enemy,
  logs,
  passiveFlags,
  restriction,
  elementalAffinity,
  playerHp,
  enemyHp,
}: {
  player: EncounterPlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: EncounterOpeningPassiveFlags;
  restriction: EncounterRestriction;
  elementalAffinity: EncounterElementalAffinity;
  playerHp: number;
  enemyHp: number;
}) => {
  const {
    initialPassiveStatuses,
    openingMessages,
    initialEnemySpecialReadyAtMs,
  } = resolveInitialPassiveStateBundle(passiveFlags);

  getCombatOpeningMessages({
    player,
    enemy,
    restriction,
    elementalAffinity,
    passiveFlags,
  })
    .concat(openingMessages)
    .forEach((message) => {
      pushCombatLog(logs, {
        turn: 0,
        timeMs: 0,
        isPlayer: true,
        message,
        damage: 0,
        playerHp,
        playerMaxHp: player.maxHp,
        enemyHp,
        enemyMaxHp: enemy.maxHp,
      });
    });

  return {
    initialPassiveStatuses,
    initialEnemySpecialReadyAtMs,
  };
};

export const seedCombatEncounter = ({
  player,
  enemy,
  logs,
  passiveFlags,
  restriction,
  elementalAffinity,
  playerHp,
  enemyHp,
  playerStatuses,
}: {
  player: EncounterPlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  restriction: EncounterRestriction;
  elementalAffinity: EncounterElementalAffinity;
  playerHp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
}) => {
  const { initialPassiveStatuses, initialEnemySpecialReadyAtMs } =
    initializeCombatEncounter({
      player,
      enemy,
      logs,
      passiveFlags,
      restriction,
      elementalAffinity,
      playerHp,
      enemyHp,
    });

  return {
    playerStatuses:
      initialPassiveStatuses.length > 0
        ? [...playerStatuses, ...initialPassiveStatuses]
        : playerStatuses,
    enemySpecialReadyAtMs: initialEnemySpecialReadyAtMs,
  };
};
