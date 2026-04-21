import { CombatLog, Enemy } from "../types";
import { createCombatInfrastructure } from "./battleEncounterInfrastructure";
import { seedCombatEncounter } from "./battleEncounterOpening";
import type { CombatRuntimeContext } from "./battleEncounterContext";
import type { EncounterPlayerCombatStatsLike } from "./battleEncounterTypes";
import type { CombatStatusLike } from "./battleStatusTypes";

export const prepareCombatLoopEnvironment = ({
  player,
  enemy,
  logs,
  runtimeContext,
  getTurn,
  playerStatusesRef,
  enemyStatusesRef,
  activeSkillReadyAtMsRef,
  getPlayerHp,
  getEnemyHp,
  setPlayerHp,
  setEnemyHp,
  setPlayerStatuses,
  setEnemyStatuses,
  getLastStatusTickMs,
  setLastStatusTickMs,
  getPlayerDamagedSinceSwordHeartWindow,
  setPlayerDamagedSinceSwordHeartWindow,
  playerHp,
  enemyHp,
  playerStatuses,
}: {
  player: EncounterPlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  runtimeContext: CombatRuntimeContext;
  getTurn: () => number;
  playerStatusesRef: () => CombatStatusLike[];
  enemyStatusesRef: () => CombatStatusLike[];
  activeSkillReadyAtMsRef: () => number;
  getPlayerHp: () => number;
  getEnemyHp: () => number;
  setPlayerHp: (value: number) => void;
  setEnemyHp: (value: number) => void;
  setPlayerStatuses: (value: CombatStatusLike[]) => void;
  setEnemyStatuses: (value: CombatStatusLike[]) => void;
  getLastStatusTickMs: () => number;
  setLastStatusTickMs: (value: number) => void;
  getPlayerDamagedSinceSwordHeartWindow: () => boolean;
  setPlayerDamagedSinceSwordHeartWindow: (value: boolean) => void;
  playerHp: number;
  enemyHp: number;
  playerStatuses: CombatStatusLike[];
}) => {
  const { activeSkill, passiveFlags, pVsE, enemyElementalAffinity } = runtimeContext;
  const { processStatusTicks } = createCombatInfrastructure({
    player,
    enemy,
    logs,
    passiveFlags,
    activeSkill,
    learnedSkills: player.learnedSkills,
    getTurn,
    playerStatusesRef,
    enemyStatusesRef,
    activeSkillReadyAtMsRef,
    getPlayerHp,
    getEnemyHp,
    setPlayerHp,
    setEnemyHp,
    setPlayerStatuses,
    setEnemyStatuses,
    getLastStatusTickMs,
    setLastStatusTickMs,
    getPlayerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow,
  });

  const seededEncounter = seedCombatEncounter({
    player,
    enemy,
    logs,
    passiveFlags,
    restriction: pVsE,
    elementalAffinity: enemyElementalAffinity,
    playerHp,
    enemyHp,
    playerStatuses,
  });

  return {
    processStatusTicks,
    ...seededEncounter,
  };
};
