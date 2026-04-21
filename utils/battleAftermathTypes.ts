export type RestrictionLike = {
  isEffective: boolean;
  isResisted: boolean;
};

export type ElementalAffinityLike = {
  multiplier: number;
  reason?: "resistance" | "weakness";
};
