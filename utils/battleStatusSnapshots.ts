import { Skill } from "../types";
import { getCombatStatusSnapshot } from "./battleStatusLabels";
import type { CombatStatusLike } from "./battleStatusTypes";

export const createCombatSnapshotProvider = ({
  activeSkill,
  playerStatusesRef,
  enemyStatusesRef,
  activeSkillReadyAtMsRef,
  learnedSkills,
  resolveSkillCooldownSeconds,
}: {
  activeSkill?: Skill;
  playerStatusesRef: () => CombatStatusLike[];
  enemyStatusesRef: () => CombatStatusLike[];
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
