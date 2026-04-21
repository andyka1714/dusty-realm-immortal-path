export type CombatStatusKindLike =
  | "incapacitate"
  | "burn"
  | "poison"
  | "bleed"
  | "armorBreak"
  | "vulnerable"
  | "damageAmp"
  | "lifesteal"
  | "controlImmune"
  | "taunt"
  | "critBoost"
  | "shield"
  | "reflect"
  | "drain";

export type CombatStatusLike = {
  id: string;
  name: string;
  kind: CombatStatusKindLike;
  value: number;
  expiresAtMs: number;
  nextTickAtMs?: number;
};
