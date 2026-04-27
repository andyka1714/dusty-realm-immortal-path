import {
  ConsumableType,
  EquipmentType,
  HeirloomCandidate,
  InventorySlot,
  ItemCategory,
  ItemQuality,
  LifeReviewSummary,
  MajorRealm,
  RebirthConfig,
  RebirthPlanPreview,
  RebirthValidationReason,
  ReincarnationBuildIdentity,
  ReincarnationPerk,
  ReincarnationPlannerContext,
  ReincarnationSoulSeal,
  SoulLifetimeStats,
  type LifeEndCause,
} from "../types";
import { ITEMS } from "../data/items";
import {
  DEFAULT_REINCARNATION_PERKS,
  DEFAULT_REINCARNATION_SOUL_SEALS,
} from "../data/reincarnationPerks";

export { DEFAULT_REINCARNATION_PERKS, DEFAULT_REINCARNATION_SOUL_SEALS };

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
export const REINCARNATION_PLANNER_VERSION = 2;

const MEMORY_ROUTE_LABELS: Array<{
  tags: string[];
  lane: Exclude<ReincarnationBuildIdentity, "balanced">;
  label: string;
}> = [
  {
    tags: ["route:sword:soul-sheath", "sect:sword:world-chapter-02"],
    lane: "sword",
    label: "劍脈殘響仍在，可解鎖更深的劍修轉世規劃。",
  },
  {
    tags: ["sect:sword:world-chapter-03"],
    lane: "sword",
    label: "凌霄仙誓已入魂，可解鎖更高階的劍修轉世規劃。",
  },
  {
    tags: ["route:body:blooddrum", "sect:beast:world-chapter-02"],
    lane: "body",
    label: "戰軀殘響仍在，可解鎖更深的體修轉世規劃。",
  },
  {
    tags: ["sect:beast:world-chapter-03"],
    lane: "body",
    label: "萬獸不滅血印已入魂，可解鎖更高階的體修轉世規劃。",
  },
  {
    tags: ["route:mage:lantern", "sect:mystic:world-chapter-02"],
    lane: "mage",
    label: "玄燈殘響仍在，可解鎖更深的法修轉世規劃。",
  },
  {
    tags: ["sect:mystic:world-chapter-03"],
    lane: "mage",
    label: "仙宮星圖已入魂，可解鎖更高階的法修轉世規劃。",
  },
];

export const REINCARNATION_BUILD_IDENTITY_LABELS: Record<
  ReincarnationBuildIdentity,
  string
> = {
  balanced: "均衡開局",
  sword: "劍修轉世",
  body: "體修轉世",
  mage: "法修轉世",
};

const REINCARNATION_BUILD_IDENTITY_SHORT_LABELS: Record<
  Exclude<ReincarnationBuildIdentity, "balanced">,
  string
> = {
  sword: "劍修",
  body: "體修",
  mage: "法修",
};

const BALANCED_IDENTITY_TITLE = "均衡開局";
const BALANCED_IDENTITY_CUE =
  "沿用通用魂印與遺珍，不額外限制職業向遺珍，適合保守開局。";
const BUILD_IDENTITY_CUES: Record<
  Exclude<ReincarnationBuildIdentity, "balanced">,
  { title: string; cue: string; benefit: string }
> = {
  sword: {
    title: "劍修轉世",
    cue: "下一世將偏向劍修開局，能穩定承接劍系遺珍與爆發向起手。",
    benefit: "僅劍修或通用遺珍可穩定承接，其他職業遺珍會被排除。",
  },
  body: {
    title: "體修轉世",
    cue: "下一世將偏向體修開局，能穩定承接站樁與續戰向遺珍。",
    benefit: "僅體修或通用遺珍可穩定承接，其他職業遺珍會被排除。",
  },
  mage: {
    title: "法修轉世",
    cue: "下一世將偏向法修開局，能穩定承接術式與法力循環向遺珍。",
    benefit: "僅法修或通用遺珍可穩定承接，其他職業遺珍會被排除。",
  },
};

const normalizePlannerContext = (
  context: ReincarnationPlannerContext | SoulLifetimeStats
): ReincarnationPlannerContext =>
  "lifetimeStats" in context
    ? {
        lifetimeStats: context.lifetimeStats,
        worldMemoryTags: context.worldMemoryTags,
      }
    : {
        lifetimeStats: context,
        worldMemoryTags: [],
      };

const hasRequiredWorldMemoryTags = (
  worldMemoryTags: string[],
  requiredWorldMemoryTags?: string[]
) =>
  !requiredWorldMemoryTags?.length ||
  requiredWorldMemoryTags.every((tag) => worldMemoryTags.includes(tag));

const meetsUnlockRequirement = (
  context: ReincarnationPlannerContext | SoulLifetimeStats,
  requirement?: {
    minHighestRealm?: MajorRealm;
    minReincarnations?: number;
  },
  requiredWorldMemoryTags?: string[]
) => {
  const plannerContext = normalizePlannerContext(context);

  if (requirement?.minHighestRealm !== undefined) {
    if (plannerContext.lifetimeStats.highestRealmEver < requirement.minHighestRealm) {
      return false;
    }
  }

  if (requirement?.minReincarnations !== undefined) {
    if (
      plannerContext.lifetimeStats.totalReincarnations <
      requirement.minReincarnations
    ) {
      return false;
    }
  }

  return hasRequiredWorldMemoryTags(
    plannerContext.worldMemoryTags,
    requiredWorldMemoryTags
  );
};

export const calculateRealmMerit = (realm: MajorRealm) =>
  REALM_MERIT_TABLE[realm] ?? 0;

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

export const getReincarnationSoulSealById = (sealId: string) =>
  DEFAULT_REINCARNATION_SOUL_SEALS.find((seal) => seal.id === sealId);

export const getAvailableReincarnationPerks = (
  context: ReincarnationPlannerContext | SoulLifetimeStats
) =>
  DEFAULT_REINCARNATION_PERKS.filter((perk) =>
    meetsUnlockRequirement(
      context,
      perk.unlockRequirement,
      perk.requiredWorldMemoryTags
    )
  );

export const getAvailableReincarnationSoulSeals = (
  context: ReincarnationPlannerContext | SoulLifetimeStats
) =>
  DEFAULT_REINCARNATION_SOUL_SEALS.filter((seal) =>
    meetsUnlockRequirement(
      context,
      seal.unlockRequirement,
      seal.requiredWorldMemoryTags
    )
  );

const getSealLane = (config: RebirthConfig) =>
  config.selectedBuildIdentity === "balanced"
    ? undefined
    : config.selectedBuildIdentity;

const getHeirloomBuildIdentity = (
  candidate: HeirloomCandidate
): ReincarnationBuildIdentity | "generic" => {
  const item = ITEMS[candidate.itemId];
  if (!item) {
    return "generic";
  }

  if (
    item.category === ItemCategory.Consumable &&
    item.subType === ConsumableType.Manual
  ) {
    switch (item.requiredProfession) {
      case "Sword":
        return "sword";
      case "Body":
        return "body";
      case "Mage":
        return "mage";
      default:
        return "generic";
    }
  }

  if (item.category === ItemCategory.Equipment) {
    switch (item.subType) {
      case EquipmentType.Sword:
        return "sword";
      case EquipmentType.Gauntlet:
        return "body";
      case EquipmentType.Staff:
        return "mage";
      default:
        return "generic";
    }
  }

  return "generic";
};

export const getRebirthHeirloomBlockedReason = (
  candidate: HeirloomCandidate,
  config: RebirthConfig
) => {
  const lane = getSealLane(config);
  if (!lane) {
    return undefined;
  }

  const heirloomIdentity = getHeirloomBuildIdentity(candidate);
  if (heirloomIdentity === "generic" || heirloomIdentity === lane) {
    return undefined;
  }

  return `與當前${REINCARNATION_BUILD_IDENTITY_SHORT_LABELS[lane]}流派不符`;
};

export const getRebirthPerkBlockedReason = (
  perk: ReincarnationPerk,
  config: RebirthConfig
) => {
  if (!perk.buildIdentity) {
    return undefined;
  }

  const lane = getSealLane(config);
  if (!lane) {
    return `需先切換到對應流派後才可選擇`;
  }

  if (perk.buildIdentity !== lane) {
    return `與當前${REINCARNATION_BUILD_IDENTITY_SHORT_LABELS[lane]}流派互斥`;
  }

  return undefined;
};

const formatStatBonusLines = (bonuses: Record<string, number>) => {
  const labels: Record<string, string> = {
    physique: "體魄",
    rootBone: "根骨",
    insight: "神識",
    comprehension: "悟性",
    fortune: "福緣",
    charm: "魅力",
  };

  return Object.entries(bonuses)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${labels[key] ?? key} +${value}`);
};

const getIdentityPresentation = (config: RebirthConfig) => {
  const seal = config.selectedSealId
    ? getReincarnationSoulSealById(config.selectedSealId)
    : undefined;

  if (seal) {
    return {
      title: seal.identityTitle,
      cue: seal.identityCue,
      benefit: seal.heirloomHint,
    };
  }

  if (config.selectedBuildIdentity === "balanced") {
    return {
      title: BALANCED_IDENTITY_TITLE,
      cue: BALANCED_IDENTITY_CUE,
      benefit: "通用遺珍皆可保留，適合不想投入流派規劃的輪迴配置。",
    };
  }

  return BUILD_IDENTITY_CUES[config.selectedBuildIdentity];
};

export const getRebirthPlanPreview = ({
  config,
  totalMerit,
  summary,
  displayedPerks = DEFAULT_REINCARNATION_PERKS,
}: {
  config: RebirthConfig;
  totalMerit: number;
  summary: LifeReviewSummary;
  displayedPerks?: ReincarnationPerk[];
}): RebirthPlanPreview => {
  const totalCost = getRebirthConfigCost(config);
  const slotLimit = getRebirthConfigHeirloomSlotCount(config);
  const identityPresentation = getIdentityPresentation(config);
  const perkBlockedReasons = Object.fromEntries(
    displayedPerks.map((perk) => {
      const blockedMessage =
        !config.selectedPerkIds.includes(perk.id) &&
        getRebirthPerkBlockedReason(perk, config);
      return [
        perk.id,
        blockedMessage
          ? ({
              type:
                blockedMessage.includes("互斥") ? "mutual_exclusion" : "prereq",
              message: blockedMessage,
            } as RebirthValidationReason)
          : undefined,
      ];
    })
  );
  const selectedHeirloomIds = new Set(config.selectedHeirloomIds);
  const heirloomBlockedReasons = Object.fromEntries(
    summary.eligibleHeirlooms.map((candidate) => {
      const laneBlockedMessage = getRebirthHeirloomBlockedReason(candidate, config);
      const slotBlockedMessage =
        !selectedHeirloomIds.has(candidate.id) &&
        config.selectedHeirloomIds.length >= slotLimit
          ? "遺珍欄位已滿"
          : undefined;
      const blockedMessage = laneBlockedMessage ?? slotBlockedMessage;
      return [
        candidate.id,
        blockedMessage
          ? ({
              type: blockedMessage.includes("欄位") ? "slot" : "prereq",
              message: blockedMessage,
            } as RebirthValidationReason)
          : undefined,
      ];
    })
  );

  const invalidReasons: RebirthValidationReason[] = [];
  if (totalCost > totalMerit) {
    invalidReasons.push({
      type: "merit",
      message: `功德不足，尚缺 ${totalCost - totalMerit} 點。`,
    });
  }
  if (config.selectedHeirloomIds.length > slotLimit) {
    invalidReasons.push({
      type: "slot",
      message: `遺珍超出欄位上限，目前僅可保留 ${slotLimit} 件。`,
    });
  }

  const firstPerkBlockedReason = Object.values(perkBlockedReasons).find(Boolean);
  if (firstPerkBlockedReason) {
    invalidReasons.push(firstPerkBlockedReason);
  }
  const firstHeirloomBlockedReason = Object.values(heirloomBlockedReasons).find(Boolean);
  if (firstHeirloomBlockedReason) {
    invalidReasons.push(firstHeirloomBlockedReason);
  }

  const expectedBenefits = [
    identityPresentation.benefit,
    ...formatStatBonusLines(getRebirthConfigStatBonuses(config)),
  ];
  const spiritStoneBonus = getRebirthConfigSpiritStoneBonus(config);
  if (spiritStoneBonus > 0) {
    expectedBenefits.push(`初始靈石 +${spiritStoneBonus}`);
  }
  const extraSlots = slotLimit - 1;
  if (extraSlots > 0) {
    expectedBenefits.push(`可額外攜帶 ${extraSlots} 件遺珍`);
  }

  return {
    identityTitle: identityPresentation.title,
    identityCue: identityPresentation.cue,
    expectedBenefits,
    invalidReasons,
    perkBlockedReasons,
    heirloomBlockedReasons,
    canConfirm: invalidReasons.every((reason) => reason.type !== "merit"),
  };
};

const normalizeIdentity = (
  identity: unknown
): ReincarnationBuildIdentity => {
  switch (identity) {
    case "sword":
    case "body":
    case "mage":
      return identity;
    default:
      return "balanced";
  }
};

const dedupe = (values: string[]) => Array.from(new Set(values));

export const getRebirthConfigCost = (config: RebirthConfig) => {
  const perkCost = config.selectedPerkIds.reduce((total, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    return total + (perk?.cost ?? 0);
  }, 0);
  const sealCost = config.selectedSealId
    ? getReincarnationSoulSealById(config.selectedSealId)?.cost ?? 0
    : 0;

  return (
    perkCost +
    sealCost +
    (config.spiritRootOverride ? SPIRIT_ROOT_OVERRIDE_COST : 0)
  );
};

export const getRebirthConfigHeirloomSlotCount = (config: RebirthConfig) =>
  1 +
  config.selectedPerkIds.reduce((total, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    return total + (perk?.heirloomSlotBonus ?? 0);
  }, 0);

export const getRebirthConfigStatBonuses = (config: RebirthConfig) => {
  const bonuses = config.selectedPerkIds.reduce<Record<string, number>>(
    (nextBonuses, perkId) => {
      const perk = getReincarnationPerkById(perkId);
      if (!perk?.statBonuses) {
        return nextBonuses;
      }

      Object.entries(perk.statBonuses).forEach(([key, value]) => {
        if (!value) {
          return;
        }
        nextBonuses[key] = (nextBonuses[key] ?? 0) + value;
      });

      return nextBonuses;
    },
    {}
  );

  const seal = config.selectedSealId
    ? getReincarnationSoulSealById(config.selectedSealId)
    : undefined;
  if (seal?.statBonuses) {
    Object.entries(seal.statBonuses).forEach(([key, value]) => {
      if (!value) {
        return;
      }
      bonuses[key] = (bonuses[key] ?? 0) + value;
    });
  }

  return bonuses;
};

export const getRebirthConfigSpiritStoneBonus = (config: RebirthConfig) => {
  const perkBonus = config.selectedPerkIds.reduce((total, perkId) => {
    const perk = getReincarnationPerkById(perkId);
    return total + (perk?.spiritStoneBonus ?? 0);
  }, 0);
  const sealBonus = config.selectedSealId
    ? getReincarnationSoulSealById(config.selectedSealId)?.spiritStoneBonus ?? 0
    : 0;

  return perkBonus + sealBonus;
};

export const sanitizeRebirthConfig = ({
  config,
  totalMerit,
  plannerContext,
  summary,
}: {
  config?: Partial<RebirthConfig> | null;
  totalMerit: number;
  plannerContext: ReincarnationPlannerContext | SoulLifetimeStats;
  summary?: LifeReviewSummary | null;
}): RebirthConfig => {
  const normalizedContext = normalizePlannerContext(plannerContext);
  const nextConfig: RebirthConfig = {
    plannerVersion: REINCARNATION_PLANNER_VERSION,
    selectedBuildIdentity: normalizeIdentity(config?.selectedBuildIdentity),
    selectedSealId:
      typeof config?.selectedSealId === "string"
        ? config.selectedSealId
        : undefined,
    selectedPerkIds: Array.isArray(config?.selectedPerkIds)
      ? dedupe(
          config.selectedPerkIds.filter(
            (perkId): perkId is string => typeof perkId === "string"
          )
        )
      : [],
    selectedHeirloomIds: Array.isArray(config?.selectedHeirloomIds)
      ? dedupe(
          config.selectedHeirloomIds.filter(
            (heirloomId): heirloomId is string => typeof heirloomId === "string"
          )
        )
      : [],
    spiritRootOverride:
      typeof config?.spiritRootOverride === "string"
        ? config.spiritRootOverride
        : undefined,
  };

  const unlockedPerkIds = getAvailableReincarnationPerks(normalizedContext).map(
    (perk) => perk.id
  );
  nextConfig.selectedPerkIds = nextConfig.selectedPerkIds.filter((perkId) =>
    unlockedPerkIds.includes(perkId)
  );

  nextConfig.selectedPerkIds = nextConfig.selectedPerkIds.filter((perkId) => {
    const perk = getReincarnationPerkById(perkId);
    if (!perk?.buildIdentity) {
      return true;
    }
    return nextConfig.selectedBuildIdentity === perk.buildIdentity;
  });

  const availableSealIds = getAvailableReincarnationSoulSeals(normalizedContext)
    .filter((seal) => seal.lane === nextConfig.selectedBuildIdentity)
    .map((seal) => seal.id);
  if (!nextConfig.selectedSealId || !availableSealIds.includes(nextConfig.selectedSealId)) {
    nextConfig.selectedSealId = undefined;
  }

  if (summary && Array.isArray(summary.eligibleHeirlooms)) {
    const validHeirloomIds = new Set(
      summary.eligibleHeirlooms.map((candidate) => candidate.id)
    );
    nextConfig.selectedHeirloomIds = nextConfig.selectedHeirloomIds
      .filter((heirloomId) => validHeirloomIds.has(heirloomId))
      .filter((heirloomId) => {
        const candidate = summary.eligibleHeirlooms.find(
          (entry) => entry.id === heirloomId
        );
        return candidate
          ? !getRebirthHeirloomBlockedReason(candidate, nextConfig)
          : false;
      });
  }

  const trimHeirloomsToSlots = () => {
    nextConfig.selectedHeirloomIds = nextConfig.selectedHeirloomIds.slice(
      -getRebirthConfigHeirloomSlotCount(nextConfig)
    );
  };

  trimHeirloomsToSlots();

  if (getRebirthConfigCost(nextConfig) > totalMerit && nextConfig.spiritRootOverride) {
    nextConfig.spiritRootOverride = undefined;
  }
  if (getRebirthConfigCost(nextConfig) > totalMerit && nextConfig.selectedSealId) {
    nextConfig.selectedSealId = undefined;
  }
  while (getRebirthConfigCost(nextConfig) > totalMerit && nextConfig.selectedPerkIds.length) {
    nextConfig.selectedPerkIds = nextConfig.selectedPerkIds.slice(
      0,
      nextConfig.selectedPerkIds.length - 1
    );
    trimHeirloomsToSlots();
  }
  if (getRebirthConfigCost(nextConfig) > totalMerit) {
    nextConfig.spiritRootOverride = undefined;
  }

  trimHeirloomsToSlots();
  return nextConfig;
};

const getSuggestedIdentity = (
  plannerContext: ReincarnationPlannerContext | SoulLifetimeStats
) =>
  MEMORY_ROUTE_LABELS.find(({ tags }) =>
    tags.some((tag) => normalizePlannerContext(plannerContext).worldMemoryTags.includes(tag))
  );

export const getRebirthBuildPreview = ({
  config,
  totalMerit,
  plannerContext,
  summary,
}: {
  config: RebirthConfig;
  totalMerit: number;
  plannerContext: ReincarnationPlannerContext | SoulLifetimeStats;
  summary?: LifeReviewSummary;
}) => {
  const normalizedContext = normalizePlannerContext(plannerContext);
  const selectedSeal = config.selectedSealId
    ? getReincarnationSoulSealById(config.selectedSealId)
    : undefined;
  const suggestedIdentity = getSuggestedIdentity(normalizedContext);
  const identityLabel =
    REINCARNATION_BUILD_IDENTITY_LABELS[config.selectedBuildIdentity];
  const identityTitle =
    selectedSeal?.identityTitle ??
    (config.selectedBuildIdentity === "balanced"
      ? BALANCED_IDENTITY_TITLE
      : identityLabel);
  const identityCue =
    selectedSeal?.identityCue ??
    (config.selectedBuildIdentity === "balanced"
      ? BALANCED_IDENTITY_CUE
      : "已切換流派，現在可選擇對應的魂印與職業向遺珍。");

  const benefitLines = [
    ...(selectedSeal ? [`本命魂印：${selectedSeal.name}`] : []),
    ...Object.entries(getRebirthConfigStatBonuses(config))
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${key} +${value}`),
    `初始靈石 +${getRebirthConfigSpiritStoneBonus(config)}`,
  ];

  const issueLines: string[] = [];
  const totalCost = getRebirthConfigCost(config);
  if (totalCost > totalMerit) {
    issueLines.push(`功德不足：尚缺 ${totalCost - totalMerit}`);
  }
  const slotLimit = getRebirthConfigHeirloomSlotCount(config);
  if (config.selectedHeirloomIds.length > slotLimit) {
    issueLines.push(`遺珍欄位不足：目前僅可攜帶 ${slotLimit} 件`);
  }
  if (summary?.eligibleHeirlooms?.length) {
    const blockedHeirloom = summary.eligibleHeirlooms.find(
      (candidate) =>
        !config.selectedHeirloomIds.includes(candidate.id) &&
        getRebirthHeirloomBlockedReason(candidate, config)
    );
    if (blockedHeirloom) {
      issueLines.push(
        getRebirthHeirloomBlockedReason(blockedHeirloom, config) as string
      );
    }
  }

  const constraintLines: string[] = [];
  if (config.selectedBuildIdentity !== "balanced") {
    constraintLines.push(
      selectedSeal?.heirloomHint ??
        `${identityLabel}會限制不相符的職業武器與心法遺珍。`
    );
  } else {
    constraintLines.push("均衡開局不限制職業向遺珍，但也不會啟用專精魂印。");
  }

  if (
    suggestedIdentity &&
    suggestedIdentity.lane !== config.selectedBuildIdentity
  ) {
    constraintLines.push(`前世記憶提示：${suggestedIdentity.label}`);
  }

  return {
    identityLabel,
    identityTitle,
    identityCue,
    benefitLines,
    issueLines,
    constraintLines,
  };
};
