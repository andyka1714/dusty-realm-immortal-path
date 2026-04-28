import { ProfessionType } from "../types";
import { getCoreAttributeEffects } from "./attributeEffects";

export interface NpcShopAffinity {
  attitudeLabel: string;
  discountPercent: number;
  discountSources: string[];
  applyDiscount: (price: number) => number;
}

const shopMatchesProfession = (shopId: string, profession: ProfessionType) => {
  if (profession === ProfessionType.Sword) return shopId.includes("sword");
  if (profession === ProfessionType.Body) return shopId.includes("beast");
  if (profession === ProfessionType.Mage) return shopId.includes("mystic");
  return false;
};

const hasSectMerit = (completedQuestIds: string[], profession: ProfessionType) => {
  const prefix =
    profession === ProfessionType.Sword
      ? "sect_sword"
      : profession === ProfessionType.Body
        ? "sect_beast"
        : profession === ProfessionType.Mage
          ? "sect_mystic"
          : "";
  return Boolean(prefix) && completedQuestIds.some((questId) => questId.startsWith(prefix));
};

export const resolveNpcShopAffinity = ({
  shopId,
  charm,
  profession,
  completedQuestIds,
}: {
  shopId: string;
  charm: number;
  profession: ProfessionType;
  completedQuestIds: string[];
}): NpcShopAffinity => {
  const baseDiscount = getCoreAttributeEffects({
    comprehension: 0,
    fortune: 0,
    charm,
  }).shopDiscountPercent;
  const discountSources: string[] = [];
  let discountPercent = 0;

  if (baseDiscount > 0) {
    discountPercent += baseDiscount;
    discountSources.push("魅力折扣");
  }
  if (shopMatchesProfession(shopId, profession)) {
    discountPercent += 5;
    discountSources.push("宗門身份");
  }
  if (hasSectMerit(completedQuestIds, profession)) {
    discountPercent += 3;
    discountSources.push("宗門功績");
  }

  discountPercent = Math.min(20, discountPercent);
  const attitudeLabel =
    discountPercent >= 10 ? "同道相助" : discountPercent > 0 ? "禮遇" : "平常";

  return {
    attitudeLabel,
    discountPercent,
    discountSources: discountSources.length ? discountSources : ["無折扣"],
    applyDiscount: (price: number) =>
      Math.max(1, Math.ceil(price * (1 - discountPercent / 100))),
  };
};
