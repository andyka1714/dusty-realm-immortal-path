import { CombatLog, Enemy, Skill } from "../types";
import { setCombatLogSnapshotProvider } from "./battleLog";
import type { EncounterPlayerCombatStatsLike } from "./battleEncounterTypes";
import { type PlayerPassiveFlags } from "./battlePassives";
import {
  createCombatSnapshotProvider,
  createStatusTickProcessor,
} from "./battleStatuses";
import { getResolvedSkillCooldownSeconds } from "./battleProfiles";
import type { CombatStatusLike } from "./battleStatusTypes";

export const createCombatInfrastructure = ({
  player,
  enemy,
  logs,
  passiveFlags,
  activeSkill,
  learnedSkills,
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
}: {
  player: EncounterPlayerCombatStatsLike;
  enemy: Enemy;
  logs: CombatLog[];
  passiveFlags: PlayerPassiveFlags;
  activeSkill?: Skill;
  learnedSkills: Skill[];
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
}) => {
  setCombatLogSnapshotProvider(
    createCombatSnapshotProvider({
      activeSkill,
      playerStatusesRef,
      enemyStatusesRef,
      activeSkillReadyAtMsRef,
      learnedSkills,
      resolveSkillCooldownSeconds: getResolvedSkillCooldownSeconds,
    })
  );

  const processStatusTicks = createStatusTickProcessor({
    getTurn,
    logs,
    player,
    enemy,
    passiveFlags,
    getPlayerHp,
    getEnemyHp,
    setPlayerHp,
    setEnemyHp,
    getPlayerStatuses: playerStatusesRef,
    setPlayerStatuses,
    getEnemyStatuses: enemyStatusesRef,
    setEnemyStatuses,
    getLastStatusTickMs,
    setLastStatusTickMs,
    getPlayerDamagedSinceSwordHeartWindow,
    setPlayerDamagedSinceSwordHeartWindow,
  });

  return {
    processStatusTicks,
  };
};
