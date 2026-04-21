import type {
  PlayerCombatStatsLike as TurnPhasePlayerCombatStatsLike,
} from "./battleTurnPhaseSharedTypes";

export type EncounterPlayerCombatStatsLike = Pick<
  TurnPhasePlayerCombatStatsLike,
  "profession" | "learnedSkills" | "element" | "speed" | "maxHp" | "maxMp" | "regenHp"
>;

export type EncounterRestriction = {
  isEffective: boolean;
  isResisted: boolean;
};

export type EncounterElementalAffinity = {
  multiplier: number;
  reason?: "resistance" | "weakness";
};
