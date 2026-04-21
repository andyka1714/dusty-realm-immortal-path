import {
  type BuildPlayerWorldStrikeResultOptions,
} from "./battleWorldStrikePlayerTypes";
import {
  type SkillTimelineProfile,
  getPlayerAttackIntervalMs,
  getResolvedSkillCooldownSeconds,
} from "./battleProfiles";
import type { WorldStrikeResult } from "./battleWorldStrike";
import { buildPlayerWorldStrikeStatusNames } from "./battleWorldStrikePlayerStatuses";

const buildPlayerWorldStrikeTiming = ({
  player,
  skill,
  timelineProfile,
}: {
  player: BuildPlayerWorldStrikeResultOptions["player"];
  skill?: BuildPlayerWorldStrikeResultOptions["skill"];
  timelineProfile: SkillTimelineProfile;
}) => ({
  nextActionDelayMs: Math.max(
    getPlayerAttackIntervalMs(player),
    timelineProfile.executionTimeMs
  ),
  skillCooldownMs: skill
    ? Math.floor(
        getResolvedSkillCooldownSeconds(skill, player.learnedSkills) * 1000
      )
    : 0,
  executionTimeMs: timelineProfile.executionTimeMs,
});

export const buildPlayerWorldStrikeResult = ({
  damage,
  isCrit,
  skill,
  player,
  playerSideStatuses,
  filteredEnemyStatuses,
  passiveFlags,
  canonicalSkillId,
  hasSwordQiChain,
  swordTribulationActive,
  bodyFoundationStacks,
  voidSwordProc,
  dealsDirectDamage,
  timelineProfile,
}: BuildPlayerWorldStrikeResultOptions): WorldStrikeResult => ({
  damage,
  isCrit,
  skillName: skill?.name,
  ...buildPlayerWorldStrikeTiming({
    player,
    skill,
    timelineProfile,
  }),
  playerStatusNames: buildPlayerWorldStrikeStatusNames({
    playerSideStatuses,
    passiveFlags,
    player,
    skill,
    isCrit,
    dealsDirectDamage,
    canonicalSkillId,
    hasSwordQiChain,
    swordTribulationActive,
    bodyFoundationStacks,
    voidSwordProc,
  }),
  enemyStatusNames: filteredEnemyStatuses.map((status) => status.name),
  playerShieldGain: playerSideStatuses
    .filter((status) => status.kind === "shield")
    .reduce((sum, status) => sum + Math.floor(status.value), 0),
  areaShape: timelineProfile.areaShape,
  areaRadius: timelineProfile.areaRadius,
  maxTargets: timelineProfile.maxTargets,
  isProjectile: timelineProfile.isProjectile,
});
