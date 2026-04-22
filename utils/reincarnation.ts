import {
  ConsumableType,
  HeirloomCandidate,
  InventorySlot,
  ItemCategory,
  ItemQuality,
  LifeReviewSummary,
  MajorRealm,
  RebirthConfig,
  ReincarnationPerk,
  SoulLifetimeStats,
  type LifeEndCause,
} from "../types";
import { ITEMS } from "../data/items";

const REALM_MERIT_TABLE: Record<MajorRealm, number> = {
  [MajorRealm.Mortal]: 0,
  [MajorRealm.QiRefining]: 10,
  [MajorRealm.Foundation]: 50,
  [MajorRealm.GoldenCore]: 200,
  [MajorRealm.NascentSoul]: 1000,
  [MajorRealm.SpiritSevering]: 5000,
  [MajorRealm.VoidRefining]: 20000,
  [MajorRealm.Fusion]: 100000,
  [MajorRealm.Mahayana]: 500000,
  [MajorRealm.Tribulation]: 2000000,
  [MajorRealm.Immortal]: 10000000,
  [MajorRealm.ImmortalEmperor]: 100000000,
};

export const SPIRIT_ROOT_OVERRIDE_COST = 100;

export const DEFAULT_REINCARNATION_PERKS: ReincarnationPerk[] = [
  {
    id: "rebirth_root_bone",
    name: "先天根骨",
    description: "下一世根骨 +2。",
    cost: 25,
    category: "attribute",
    statBonuses: { rootBone: 2 },
  },
  {
    id: "rebirth_comprehension",
    name: "靈慧早開",
    description: "下一世悟性 +2。",
    cost: 25,
    category: "attribute",
    statBonuses: { comprehension: 2 },
  },
  {
    id: "rebirth_spirit_stones",
    name: "前世餘澤",
    description: "下一世初始靈石 +150。",
    cost: 40,
    category: "resource",
    spiritStoneBonus: 150,
  },
  {
    id: "rebirth_physique",
    name: "武魄先成",
    description: "下一世體魄 +2。",
    cost: 25,
    category: "attribute",
    unlockRequirement: {
      minHighestRealm: MajorRealm.GoldenCore,
    },
    statBonuses: { physique: 2 },
  },
  {
    id: "rebirth_extra_heirloom_slot",
    name: "前塵寶匣",
    description: "下一世可額外攜帶 1 件遺珍。",
    cost: 80,
    category: "legacy",
    unlockRequirement: {
      minHighestRealm: MajorRealm.NascentSoul,
    },
    heirloomSlotBonus: 1,
  },
];

export const calculateRealmMerit = (realm: MajorRealm) => REALM_MERIT_TABLE[realm] ?? 0;

export const calculateAgeMerit = (ageYears: number) =>
  Math.max(0, Math.floor(ageYears * 0.5));

const getEquipmentCandidateLabel = (slot: InventorySlot) => {
  const item = ITEMS[slot.itemId];
  const quality = slot.instance?.quality ?? item?.quality ?? ItemQuality.Low;
  const qualityLabel = ["下品", "中品", "上品", "仙品"][quality] ?? "遺珍";
  return `${qualityLabel} ${item?.name ?? slot.itemId}`;
};

const getManualCandidateLabel = (slot: InventorySlot) => {
  const item = ITEMS[slot.itemId];
  return `${item?.name ?? slot.itemId} x1`;
};

export const buildEligibleHeirloomCandidates = (
  inventory: InventorySlot[]
): HeirloomCandidate[] =>
  inventory.flatMap<HeirloomCandidate>((slot) => {
    const item = ITEMS[slot.itemId];
    if (!item) {
      return [];
    }

    if (
      item.category === ItemCategory.Equipment &&
      slot.instance &&
      slot.instanceId
    ) {
      return [
        {
          id: slot.instanceId,
          itemId: slot.itemId,
          label: getEquipmentCandidateLabel(slot),
          sourceType: "equipment",
          count: 1,
          quality: slot.instance.quality,
          instanceId: slot.instanceId,
          instance: slot.instance,
        },
      ];
    }

    if (
      item.category === ItemCategory.Consumable &&
      "subType" in item &&
      item.subType === ConsumableType.Manual &&
      slot.count > 0
    ) {
      return [
        {
          id: `${slot.itemId}:manual`,
          itemId: slot.itemId,
          label: getManualCandidateLabel(slot),
          sourceType: "skill_manual",
          count: 1,
          quality: item.quality,
        },
      ];
    }

    return [];
  });

export const calculateLifeReviewSummary = ({
  cause,
  highestRealm,
  ageYears,
  inventory,
}: {
  cause: LifeEndCause;
  highestRealm: MajorRealm;
  ageYears: number;
  inventory: InventorySlot[];
}): LifeReviewSummary => {
  const realmMerit = calculateRealmMerit(highestRealm);
  const ageMerit = calculateAgeMerit(ageYears);

  return {
    cause,
    ageYears,
    highestRealm,
    realmMerit,
    ageMerit,
    totalMeritGained: realmMerit + ageMerit,
    eligibleHeirlooms: buildEligibleHeirloomCandidates(inventory),
  };
};

export const getReincarnationPerkById = (perkId: string) =>
  DEFAULT_REINCARNATION_PERKS.find((perk) => perk.id === perkId);

const meetsPerkUnlockRequirement = (
  lifetimeStats: SoulLifetimeStats,
  perk: ReincarnationPerk
) => {
  const requirement = perk.unlockRequirement;
  if (!requirement) {
    return true;
  }

  if (
    requirement.minHighestRealm !== undefined &&
    lifetimeStats.highestRealmEver < requirement.minHighestRealm
  ) {
    return false;
  }

  if (
    requirement.minReincarnations !== undefined &&
    lifetimeStats.totalReincarnations < requirement.minReincarnations
  ) {
    return false;
  }

  return true;
};

export const getAvailableReincarnationPerks = (
  lifetimeStats: SoulLifetimeStats
) =>
  DEFAULT_REINCARNATION_PERKS.filter((perk) =>
    meetsPerkUnlockRequirement(lifetimeStats, perk)
  );

export const getRebirthConfigCost = (config: RebirthConfig) => {
  const perkCost = config.selectedPerkIds.reduce((total, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    return total + (perk?.cost ?? 0);
  }, 0);

  return perkCost + (config.spiritRootOverride ? SPIRIT_ROOT_OVERRIDE_COST : 0);
};

export const getRebirthConfigHeirloomSlotCount = (config: RebirthConfig) =>
  1 +
  config.selectedPerkIds.reduce((total, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    return total + (perk?.heirloomSlotBonus ?? 0);
  }, 0);

export const getRebirthConfigStatBonuses = (config: RebirthConfig) =>
  config.selectedPerkIds.reduce<Record<string, number>>((bonuses, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    if (!perk?.statBonuses) {
      return bonuses;
    }

    Object.entries(perk.statBonuses).forEach(([key, value]) => {
      if (!value) {
        return;
      }
      bonuses[key] = (bonuses[key] ?? 0) + value;
    });

    return bonuses;
  }, {});

export const getRebirthConfigSpiritStoneBonus = (config: RebirthConfig) =>
  config.selectedPerkIds.reduce((total, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    return total + (perk?.spiritStoneBonus ?? 0);
  }, 0);
