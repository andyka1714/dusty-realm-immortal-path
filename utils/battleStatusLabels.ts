import type { StatusEffectId } from "../types";
import type {
  CombatStatusKindLike,
  CombatStatusLike,
} from "./battleStatusTypes";

export const getStatusLabel = (statusId: StatusEffectId | string) => {
  switch (statusId) {
    case "stun":
      return "暈眩";
    case "freeze":
      return "凍結";
    case "paralyze":
      return "麻痺";
    case "banish":
      return "放逐";
    case "burn":
    case "true_fire_burn":
      return "燃燒";
    case "poison":
      return "中毒";
    case "bleed":
      return "流血";
    case "earth_shatter_debuff":
    case "armorBreak":
      return "破甲";
    case "vulnerable":
      return "易傷";
    case "reflect_taunt":
      return "反震";
    case "taunt":
      return "嘲諷";
    case "god_kingdom":
      return "神國侵蝕";
    case "spirit_sever":
      return "絕仙封脈";
    case "beast_god_form":
      return "獸神附體";
    case "sword_qi":
      return "劍氣";
    default:
      return statusId;
  }
};

export const isNegativeStatusKind = (kind: CombatStatusKindLike) =>
  [
    "burn",
    "poison",
    "bleed",
    "drain",
    "incapacitate",
    "armorBreak",
    "vulnerable",
  ].includes(kind);

export const isDotStatusKind = (kind: CombatStatusKindLike) =>
  ["burn", "poison", "bleed"].includes(kind);

export const getCombatStatusSnapshot = (
  statuses: CombatStatusLike[],
  timeMs: number
): string[] => {
  const labels = statuses
    .filter((status) => {
      if (status.kind === "shield") {
        return status.expiresAtMs > timeMs && status.value > 0;
      }
      return status.expiresAtMs > timeMs;
    })
    .map((status) => {
      const mapped = getStatusLabel(status.id);
      return mapped === status.id ? status.name : mapped;
    });

  return Array.from(new Set(labels));
};
