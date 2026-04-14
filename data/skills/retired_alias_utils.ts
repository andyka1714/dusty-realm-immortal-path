import { Skill } from "../../types";

export const buildRetiredAliasRecord = (
  skillIds: string[],
  allAliases: Record<string, Skill>
) =>
  Object.fromEntries(
    skillIds.map((skillId) => [skillId, allAliases[skillId]])
  ) as Record<string, Skill>;

export const buildRetiredAliasViews = (
  skillIds: string[],
  allAliases: Record<string, Skill>
) => Object.values(buildRetiredAliasRecord(skillIds, allAliases));
