import { MajorRealm, Skill } from "../../types";

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

export const buildRetiredAliasViewSet = (
  skillIds: string[],
  allAliases: Record<string, Skill>
) => {
  const aliases = buildRetiredAliasRecord(skillIds, allAliases);
  return {
    skillIds,
    aliases,
    views: Object.values(aliases),
  };
};

export const buildRetiredAliasViewGroups = ({
  activeSkillIds,
  passiveSkillIds,
  activeAliases,
  passiveAliases,
}: {
  activeSkillIds: string[];
  passiveSkillIds: string[];
  activeAliases: Record<string, Skill>;
  passiveAliases: Record<string, Skill>;
}) => ({
  active: buildRetiredAliasViewSet(activeSkillIds, activeAliases),
  passive: buildRetiredAliasViewSet(passiveSkillIds, passiveAliases),
});

export const mergeRetiredAliasRealmMaps = (
  ...realmMaps: Array<Partial<Record<MajorRealm, Record<string, Skill>>>>
): Partial<Record<MajorRealm, Record<string, Skill>>> =>
  Object.fromEntries(
    Array.from(new Set(realmMaps.flatMap((realmMap) => Object.keys(realmMap)))).map((realm) => [
      Number(realm),
      Object.assign(
        {},
        ...realmMaps.map((realmMap) => realmMap[Number(realm) as MajorRealm] ?? {})
      ),
    ])
  ) as Partial<Record<MajorRealm, Record<string, Skill>>>;

export const mergeRetiredAliasRecords = (
  ...aliasRecords: Array<Record<string, Skill>>
): Record<string, Skill> => Object.assign({}, ...aliasRecords);
