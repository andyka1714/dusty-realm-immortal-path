import { MajorRealm, Skill } from "../../types";
import {
  ALL_RETIRED_ACTIVE_ALIASES,
  RETIRED_ACTIVE_ALIASES_BY_REALM,
} from "./retired_active_aliases";
import {
  ALL_RETIRED_PASSIVE_ALIASES,
  RETIRED_PASSIVE_ALIASES_BY_REALM,
} from "./retired_passive_aliases";
import {
  buildRetiredAliasExportSet,
  mergeRetiredAliasRealmMaps,
  mergeRetiredAliasRecords,
} from "./retired_alias_utils";

export const RETIRED_ALIASES_BY_REALM: Partial<Record<MajorRealm, Record<string, Skill>>> =
  mergeRetiredAliasRealmMaps(
    RETIRED_ACTIVE_ALIASES_BY_REALM,
    RETIRED_PASSIVE_ALIASES_BY_REALM
  );

export const ALL_RETIRED_ALIASES: Record<string, Skill> = mergeRetiredAliasRecords(
  ALL_RETIRED_ACTIVE_ALIASES,
  ALL_RETIRED_PASSIVE_ALIASES
);

const battleAbsorbedRetiredActiveAliasExports = buildRetiredAliasExportSet({
  skillIds: Object.keys(ALL_RETIRED_ACTIVE_ALIASES),
  allAliases: ALL_RETIRED_ACTIVE_ALIASES,
});

export const BATTLE_ABSORBED_RETIRED_ACTIVE_SKILL_IDS =
  battleAbsorbedRetiredActiveAliasExports.skillIds;

export const BATTLE_ABSORBED_RETIRED_ACTIVE_ALIASES: Record<string, Skill> =
  battleAbsorbedRetiredActiveAliasExports.aliases;

export const BATTLE_ABSORBED_RETIRED_ACTIVE_ALIAS_VIEWS =
  battleAbsorbedRetiredActiveAliasExports.views;

const battleAbsorbedRetiredPassiveAliasExports = buildRetiredAliasExportSet({
  skillIds: Object.keys(ALL_RETIRED_PASSIVE_ALIASES),
  allAliases: ALL_RETIRED_PASSIVE_ALIASES,
});

export const BATTLE_ABSORBED_RETIRED_PASSIVE_SKILL_IDS =
  battleAbsorbedRetiredPassiveAliasExports.skillIds;

export const BATTLE_ABSORBED_RETIRED_PASSIVE_ALIASES: Record<string, Skill> =
  battleAbsorbedRetiredPassiveAliasExports.aliases;

export const BATTLE_ABSORBED_RETIRED_PASSIVE_ALIAS_VIEWS =
  battleAbsorbedRetiredPassiveAliasExports.views;
