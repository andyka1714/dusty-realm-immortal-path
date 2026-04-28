import { AffinityRecord, ProfessionType } from "../types";
import { getCoreAttributeEffects } from "./attributeEffects";

export interface NpcShopAffinity {
  attitudeLabel: string;
  discountPercent: number;
  discountSources: string[];
  applyDiscount: (price: number) => number;
}

export interface NpcInteractionAffinity {
  attitudeLabel: string;
  affinityValue: number;
  sources: string[];
}

export type AffinityRecordMap = Record<string, AffinityRecord>;

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

export const resolveSectIdFromRouteId = (id: string): string | null => {
  if (id.includes("sword")) return "sect_sword";
  if (id.includes("beast")) return "sect_beast";
  if (id.includes("mystic")) return "sect_mystic";
  return null;
};

export const resolveShopNpcId = (shopId: string): string | undefined => {
  if (shopId === "sect_shop_sword") return "sect_sword_lingbao";
  if (shopId === "sect_shop_beast") return "sect_beast_lingbao";
  if (shopId === "sect_shop_mystic") return "sect_mystic_lingbao";
  if (shopId === "sect_skill_sword") return "sect_sword_skills";
  if (shopId === "sect_skill_beast") return "sect_beast_skills";
  if (shopId === "sect_skill_mystic") return "sect_mystic_skills";
  if (shopId === "general_store_mortal") return "village_wanbao";
  if (shopId === "blacksmith_village") return "village_blacksmith";
  return undefined;
};

const getAttitudeLabel = (affinityValue: number, discountPercent = 0) => {
  if (affinityValue >= 20) return "患難之交";
  if (affinityValue >= 10 || discountPercent >= 10) return "同道相助";
  if (affinityValue > 0 || discountPercent > 0) return "禮遇";
  if (affinityValue < -20) return "疏離";
  return "平常";
};

export const resolveNpcInteractionAffinity = ({
  npcId,
  sectId,
  persistedNpcAffinity = {},
  persistedSectAffinity = {},
}: {
  npcId?: string;
  sectId?: string | null;
  persistedNpcAffinity?: AffinityRecordMap;
  persistedSectAffinity?: AffinityRecordMap;
}): NpcInteractionAffinity => {
  const npcRecord = npcId ? persistedNpcAffinity[npcId] : undefined;
  const sectRecord = sectId ? persistedSectAffinity[sectId] : undefined;
  const affinityValue = (npcRecord?.value ?? 0) + (sectRecord?.value ?? 0);
  const sources = [
    npcRecord ? `NPC 好感：${npcRecord.lastReason}` : null,
    sectRecord ? `宗門好感：${sectRecord.lastReason}` : null,
  ].filter((source): source is string => Boolean(source));

  return {
    attitudeLabel: getAttitudeLabel(affinityValue),
    affinityValue,
    sources: sources.length ? sources : ["尚無長期往來"],
  };
};

export const resolveNpcShopAffinity = ({
  shopId,
  npcId,
  charm,
  profession,
  completedQuestIds,
  persistedNpcAffinity = {},
  persistedSectAffinity = {},
}: {
  shopId: string;
  npcId?: string;
  charm: number;
  profession: ProfessionType;
  completedQuestIds: string[];
  persistedNpcAffinity?: AffinityRecordMap;
  persistedSectAffinity?: AffinityRecordMap;
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

  const sectId = resolveSectIdFromRouteId(shopId);
  const interactionAffinity = resolveNpcInteractionAffinity({
    npcId,
    sectId,
    persistedNpcAffinity,
    persistedSectAffinity,
  });

  const persistedDiscount = Math.max(0, Math.floor(interactionAffinity.affinityValue / 10));
  if (persistedDiscount > 0) {
    discountPercent += persistedDiscount;
  }
  interactionAffinity.sources
    .filter((source) => source !== "尚無長期往來")
    .forEach((source) => discountSources.push(source));

  discountPercent = Math.min(20, discountPercent);
  const attitudeLabel = getAttitudeLabel(interactionAffinity.affinityValue, discountPercent);

  return {
    attitudeLabel,
    discountPercent,
    discountSources: discountSources.length ? discountSources : ["無折扣"],
    applyDiscount: (price: number) =>
      Math.max(1, Math.ceil(price * (1 - discountPercent / 100))),
  };
};
