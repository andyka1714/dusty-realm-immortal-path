import type { BaseAttributes } from "../types";

export interface CoreAttributeEffects {
  breakthroughBonus: number;
  cultivationSpeedBonus: number;
  dropRateBonus: number;
  encounterLuckBonus: number;
  shopDiscountPercent: number;
  summaryLabels: string[];
}

const roundOne = (value: number) => Math.round(value * 10) / 10;

export const getCoreAttributeEffects = (
  attributes: Pick<BaseAttributes, "comprehension" | "fortune" | "charm">
): CoreAttributeEffects => {
  const breakthroughBonus = roundOne(attributes.comprehension * 0.2);
  const cultivationSpeedBonus = roundOne(attributes.comprehension * 0.1);
  const dropRateBonus = roundOne(attributes.fortune * 0.1);
  const encounterLuckBonus = roundOne(attributes.fortune * 0.05);
  const shopDiscountPercent = Math.min(12, Math.floor(attributes.charm / 5));

  return {
    breakthroughBonus,
    cultivationSpeedBonus,
    dropRateBonus,
    encounterLuckBonus,
    shopDiscountPercent,
    summaryLabels: [
      `悟性：突破 +${breakthroughBonus.toFixed(1)}%`,
      `悟性：修煉 +${cultivationSpeedBonus.toFixed(1)}%`,
      `福緣：掉落 +${dropRateBonus.toFixed(1)}%`,
      `福緣：遭遇 +${encounterLuckBonus.toFixed(1)}%`,
      `魅力：商店折扣 ${shopDiscountPercent}%`,
    ],
  };
};
