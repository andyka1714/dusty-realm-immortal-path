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
