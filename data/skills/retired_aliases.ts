import { MajorRealm, Skill } from "../../types";
import {
  ALL_RETIRED_ACTIVE_ALIASES,
  RETIRED_ACTIVE_ALIASES_BY_REALM,
} from "./retired_active_aliases";
import {
  ALL_RETIRED_PASSIVE_ALIASES,
  RETIRED_PASSIVE_ALIASES_BY_REALM,
} from "./retired_passive_aliases";

export const RETIRED_ALIASES_BY_REALM: Partial<Record<MajorRealm, Record<string, Skill>>> =
  Object.fromEntries(
    Array.from(
      new Set([
        ...Object.keys(RETIRED_ACTIVE_ALIASES_BY_REALM),
        ...Object.keys(RETIRED_PASSIVE_ALIASES_BY_REALM),
      ])
    ).map((realm) => [
      Number(realm),
      {
        ...(RETIRED_ACTIVE_ALIASES_BY_REALM[Number(realm) as MajorRealm] ?? {}),
        ...(RETIRED_PASSIVE_ALIASES_BY_REALM[Number(realm) as MajorRealm] ?? {}),
      },
    ])
  ) as Partial<Record<MajorRealm, Record<string, Skill>>>;

export const ALL_RETIRED_ALIASES: Record<string, Skill> = {
  ...ALL_RETIRED_ACTIVE_ALIASES,
  ...ALL_RETIRED_PASSIVE_ALIASES,
};
