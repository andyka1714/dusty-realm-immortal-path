import { MajorRealm, Skill } from "../../types";

export const buildRetiredAliasRecord = (
  skillIds: string[],
  allAliases: Record<string, Skill>
) =>
  Object.fromEntries(
    skillIds.map((skillId) => [skillId, allAliases[skillId]])
  ) as Record<string, Skill>;

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

export const buildRetiredAliasExportSet = ({
  skillIds,
  allAliases,
}: {
  skillIds: string[];
  allAliases: Record<string, Skill>;
}) => {
  const { aliases, views } = buildRetiredAliasViewSet(skillIds, allAliases);
  return {
    skillIds,
    aliases,
    views,
  };
};

export const buildRetiredAliasExportSetFromRecord = (
  allAliases: Record<string, Skill>
) =>
  buildRetiredAliasExportSet({
    skillIds: Object.keys(allAliases),
    allAliases,
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
