import {
  BaseAttributes,
  BreakthroughConsequence,
  MajorRealm,
  SpiritRootId,
  SpiritRootType,
} from "../types";
import {
  BREAKTHROUGH_CONFIG,
  MINOR_REALM_CAP,
  SPIRIT_ROOT_DETAILS,
} from "../constants";
import { getCoreAttributeEffects } from "./attributeEffects";

export interface BreakthroughPreview {
  isMajorBreakthrough: boolean;
  successRatePercent: number;
  riskLabel: string;
  preparationCues: string[];
}

export const buildBreakthroughPreview = ({
  majorRealm,
  minorRealm,
  attributes,
  spiritRootId,
  hasRequiredItem,
  requiredItemName,
  activeConsequence,
}: {
  majorRealm: MajorRealm;
  minorRealm: number;
  attributes: BaseAttributes;
  spiritRootId: SpiritRootId;
  hasRequiredItem: boolean;
  requiredItemName?: string;
  activeConsequence?: BreakthroughConsequence | null;
}): BreakthroughPreview => {
  const config = BREAKTHROUGH_CONFIG[majorRealm];
  const isMajorBreakthrough = minorRealm >= MINOR_REALM_CAP;
  const decay = Math.pow(0.95, minorRealm);
  const attributeEffects = getCoreAttributeEffects(attributes);
  let rate = config.baseRate * decay;
  rate += attributeEffects.breakthroughBonus / 100;
  rate += attributes.fortune * 0.001;
  if (
    !isMajorBreakthrough &&
    SPIRIT_ROOT_DETAILS[spiritRootId]?.type === SpiritRootType.Heavenly
  ) {
    rate += 0.05;
  }

  const successRatePercent = Math.min(95, Math.max(1, rate * 100));
  const baseRiskLabel = isMajorBreakthrough
    ? majorRealm >= MajorRealm.Tribulation
      ? "天劫與心魔並臨"
      : "破境反噬"
    : "小境瓶頸";
  const riskLabel = activeConsequence
    ? `${baseRiskLabel} · ${activeConsequence.label}`
    : baseRiskLabel;
  const preparationCues = [
    `悟性提供突破 +${attributeEffects.breakthroughBonus.toFixed(1)}%`,
    `福緣穩定風險 +${attributeEffects.encounterLuckBonus.toFixed(1)}%`,
  ];

  if (activeConsequence) {
    preparationCues.unshift(
      `${activeConsequence.label}：剩餘 ${activeConsequence.remainingDays} 天`
    );
  }

  if (isMajorBreakthrough && requiredItemName && !hasRequiredItem) {
    preparationCues.unshift(`缺少${requiredItemName}`);
  }

  return {
    isMajorBreakthrough,
    successRatePercent,
    riskLabel,
    preparationCues,
  };
};
