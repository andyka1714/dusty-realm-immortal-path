import {
  MANUAL_CULTIVATE_COOLDOWN,
  PASSIVE_CULTIVATION_PENALTY,
  REALM_MODIFIERS,
  SECLUSION_BASE_COST,
  SPIRIT_ROOT_DETAILS,
} from "../constants";
import { MajorRealm, SpiritRootId } from "../types";

interface CultivationRateInput {
  rootBone: number;
  majorRealm: MajorRealm;
  spiritRootId: SpiritRootId;
  gatheringLevel: number;
}

export const getGatheringMultiplier = (gatheringLevel: number): number =>
  1 + gatheringLevel * 0.05;

export const getBaseCultivationRate = ({
  rootBone,
  majorRealm,
  spiritRootId,
  gatheringLevel,
}: CultivationRateInput): number => {
  const realmMod = REALM_MODIFIERS[majorRealm];
  const spiritMod = SPIRIT_ROOT_DETAILS[spiritRootId].bonuses.cultivationMult;
  const gatheringMod = getGatheringMultiplier(gatheringLevel);

  return rootBone * realmMod * spiritMod * gatheringMod;
};

export const getPassiveCultivationRate = (
  input: CultivationRateInput,
  isInSeclusion: boolean
): number => {
  const baseRate = getBaseCultivationRate(input);
  return baseRate * (isInSeclusion ? 2 : PASSIVE_CULTIVATION_PENALTY);
};

export const getManualCultivationGain = (
  input: CultivationRateInput,
  isInSeclusion: boolean
): number => {
  const baseRate = getBaseCultivationRate(input);
  const stateMultiplier = isInSeclusion ? 2 : 1;
  return baseRate * stateMultiplier * 0.33;
};

export const calculateSeclusionCost = (
  majorRealm: MajorRealm,
  minorRealm: number
): number => {
  const baseCost = SECLUSION_BASE_COST[majorRealm] || 100;
  return Math.floor(baseCost * (1 + minorRealm * 0.1));
};

export const getManualCultivateCooldown = (): number =>
  MANUAL_CULTIVATE_COOLDOWN;
