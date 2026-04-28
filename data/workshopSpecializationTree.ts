import {
  MajorRealm,
  MajorRealmCN,
  type WorkshopDiscipline,
  type WorkshopSpecializationDisciplineState,
  type WorkshopState,
} from "../types";
import type { WorkshopRecipeTier } from "./workshopRecipes";

export interface WorkshopSpecializationUnlockRequirement {
  minMastery?: number;
  minRealm?: MajorRealm;
}

export interface WorkshopSpecializationEffect {
  appliesToTier?: WorkshopRecipeTier;
  spiritStoneCostMultiplier?: number;
  masteryYieldBonus?: number;
  qualityCue?: string;
  outputCue?: string;
}

export interface WorkshopSpecializationNode {
  id: string;
  name: string;
  discipline: WorkshopDiscipline;
  branchId: string | null;
  tier: number;
  description: string;
  prerequisiteNodeIds?: string[];
  conflictsWithBranchIds?: string[];
  unlockRequirement?: WorkshopSpecializationUnlockRequirement;
  unlockCost?: number;
  switchCost?: number;
  resetCost?: number;
  effect?: WorkshopSpecializationEffect;
}

export interface WorkshopSpecializationNodeStatus {
  node: WorkshopSpecializationNode;
  isUnlocked: boolean;
  isActive: boolean;
  isAvailable: boolean;
  lockReason: string | null;
  conflictReason: string | null;
  requiredCost: number;
  actionLabel: string;
}

export interface WorkshopRecipeSpecializationEffect {
  activeNode: WorkshopSpecializationNode | null;
  spiritStoneCostMultiplier: number;
  masteryYieldBonus: number;
  qualityCues: string[];
  outputCues: string[];
}

export interface WorkshopMasteryMilestone {
  id: string;
  discipline: WorkshopDiscipline;
  name: string;
  requiredMastery: number;
  cue: string;
}

export interface WorkshopMasteryMilestoneStatus {
  milestone: WorkshopMasteryMilestone;
  isReached: boolean;
  currentMastery: number;
  remainingMastery: number;
}

const DISCIPLINE_LABELS: Record<WorkshopDiscipline, string> = {
  alchemy: "丹道",
  smithing: "器道",
};

export const WORKSHOP_SPECIALIZATION_BRANCH_LABELS: Record<string, string> = {
  alchemy_foundation: "煉丹根基",
  alchemy_hongmeng: "鴻蒙凝丹",
  alchemy_lifebloom: "萬獸生息",
  smithing_foundation: "煉器根基",
  smithing_starfire: "星火鍛胚",
  smithing_soulforge: "魂鋼銘紋",
};

export const WORKSHOP_MASTERY_MILESTONES: Record<
  WorkshopDiscipline,
  WorkshopMasteryMilestone[]
> = {
  alchemy: [
    {
      id: "alchemy_stable_fire",
      discipline: "alchemy",
      name: "內火穩定",
      requiredMastery: 8,
      cue: "開啟丹道根基節點，讓高階丹方開始回饋熟練。",
    },
    {
      id: "alchemy_branch_form",
      discipline: "alchemy",
      name: "分支成形",
      requiredMastery: 24,
      cue: "可進入鴻蒙凝丹路線，將熟練與高階材料 sink 綁在一起。",
    },
    {
      id: "alchemy_high_realm_leaf",
      discipline: "alchemy",
      name: "終盤專精葉",
      requiredMastery: 72,
      cue: "可觸發仙人後的二層丹道 leaf，強化終盤丹方熟練與品質提示。",
    },
  ],
  smithing: [
    {
      id: "smithing_stable_forge",
      discipline: "smithing",
      name: "爐心穩定",
      requiredMastery: 10,
      cue: "開啟器道根基節點，讓高階器方開始回饋熟練。",
    },
    {
      id: "smithing_branch_form",
      discipline: "smithing",
      name: "分支成形",
      requiredMastery: 30,
      cue: "可進入星火鍛胚路線，讓終盤鍛造明確消耗 route-specific 材料。",
    },
    {
      id: "smithing_high_realm_leaf",
      discipline: "smithing",
      name: "終盤專精葉",
      requiredMastery: 76,
      cue: "可觸發仙人後的二層器道 leaf，強化終盤帝兵熟練與副收益提示。",
    },
  ],
};

export const WORKSHOP_SPECIALIZATION_TREE: Record<
  WorkshopDiscipline,
  WorkshopSpecializationNode[]
> = {
  alchemy: [
    {
      id: "alchemy_inner_fire_foundation",
      name: "內火定基",
      discipline: "alchemy",
      branchId: "alchemy_foundation",
      tier: 0,
      description: "穩定爐火與收丹節奏，高階丹方熟練收益小幅提升。",
      unlockRequirement: { minMastery: 8 },
      unlockCost: 120,
      switchCost: 0,
      resetCost: 120,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 2,
        qualityCue: "爐火穩定，較容易維持仙品品質。",
      },
    },
    {
      id: "alchemy_hongmeng_condenser",
      name: "鴻蒙凝丹",
      discipline: "alchemy",
      branchId: "alchemy_hongmeng",
      tier: 1,
      description: "高階丹方靈石火耗降低，並額外累積丹道熟練；材料 sink 維持原配方。",
      prerequisiteNodeIds: ["alchemy_inner_fire_foundation"],
      conflictsWithBranchIds: ["alchemy_lifebloom"],
      unlockRequirement: { minMastery: 24 },
      unlockCost: 500,
      switchCost: 180,
      resetCost: 240,
      effect: {
        appliesToTier: "highRealm",
        spiritStoneCostMultiplier: 0.9,
        masteryYieldBonus: 6,
        qualityCue: "鴻蒙丹火降低靈石火耗，不減免核心路線材料。",
      },
    },
    {
      id: "alchemy_lifebloom_resonance",
      name: "萬獸生息",
      discipline: "alchemy",
      branchId: "alchemy_lifebloom",
      tier: 1,
      description: "偏向 sect:beast:world-chapter-03 的藥性共鳴與副收益，高階丹方熟練提升更高，但 beast_path_bloodbone 核心材料需求不降低。",
      prerequisiteNodeIds: ["alchemy_inner_fire_foundation"],
      conflictsWithBranchIds: ["alchemy_hongmeng"],
      unlockRequirement: { minMastery: 30, minRealm: MajorRealm.Tribulation },
      unlockCost: 650,
      switchCost: 220,
      resetCost: 260,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 10,
        qualityCue: "sect:beast:world-chapter-03 讓 beast_path_bloodbone 藥性共鳴提高品質穩定感。",
        outputCue: "有機會衍生藥渣、丹香等副收益；主產出與 beast_path_bloodbone 核心材料不變。",
      },
    },
    {
      id: "alchemy_hongmeng_star_lotus_crown",
      name: "星蓮鴻蒙冠火",
      discipline: "alchemy",
      branchId: "alchemy_hongmeng",
      tier: 2,
      description: "以 sect:mystic:world-chapter-03 的 mystic_path_starlotus 冠住鴻蒙丹火，讓仙人後丹方熟練與品質提示再深化；路線材料仍依原配方完整消耗。",
      prerequisiteNodeIds: ["alchemy_hongmeng_condenser"],
      conflictsWithBranchIds: ["alchemy_lifebloom"],
      unlockRequirement: { minMastery: 72, minRealm: MajorRealm.Immortal },
      unlockCost: 780,
      switchCost: 260,
      resetCost: 780,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 14,
        qualityCue: "星魂蓮冠火穩住終盤丹品，但不替代路線材料。",
        outputCue: "sect:mystic:world-chapter-03 收丹時標記 mystic_path_starlotus 星蓮火候，主產出與路線材料消耗不變。",
      },
    },
    {
      id: "alchemy_v6_star_throne_lotus",
      name: "v6 星詔蓮命冠火",
      discipline: "alchemy",
      branchId: "alchemy_hongmeng",
      tier: 3,
      description: "讀取 sect:mystic:endgame-loop-v4 的星詔迴響，讓法修 v6 終盤丹火與法杖 follow-up 有更清楚的品質 cue；路線材料仍完整消耗。",
      prerequisiteNodeIds: ["alchemy_hongmeng_star_lotus_crown"],
      conflictsWithBranchIds: ["alchemy_lifebloom"],
      unlockRequirement: { minMastery: 96, minRealm: MajorRealm.ImmortalEmperor },
      unlockCost: 980,
      switchCost: 320,
      resetCost: 980,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 18,
        qualityCue: "v6 星詔蓮命穩住 sect:mystic:endgame-loop-v4 終盤品質，不跳過核心材料。",
        outputCue: "法修 v6 follow-up 只提供副產物與品質提示，mystic_path_starlotus 仍按配方消耗。",
      },
    },
  ],
  smithing: [
    {
      id: "smithing_core_temper_foundation",
      name: "爐心定鍛",
      discipline: "smithing",
      branchId: "smithing_foundation",
      tier: 0,
      description: "穩定鍛台火候，高階器方熟練收益小幅提升。",
      unlockRequirement: { minMastery: 10 },
      unlockCost: 140,
      switchCost: 0,
      resetCost: 140,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 2,
        qualityCue: "鍛台火候穩定，器胚品質更可靠。",
      },
    },
    {
      id: "smithing_starfire_tempering",
      name: "星火鍛胚",
      discipline: "smithing",
      branchId: "smithing_starfire",
      tier: 1,
      description: "高階器方靈石火耗降低，並額外累積器道熟練；路線材料不被減免。",
      prerequisiteNodeIds: ["smithing_core_temper_foundation"],
      conflictsWithBranchIds: ["smithing_soulforge"],
      unlockRequirement: { minMastery: 30 },
      unlockCost: 500,
      switchCost: 180,
      resetCost: 240,
      effect: {
        appliesToTier: "highRealm",
        spiritStoneCostMultiplier: 0.9,
        masteryYieldBonus: 8,
        qualityCue: "星火降低靈石火耗，不減免核心路線材料。",
      },
    },
    {
      id: "smithing_soulsteel_inscription",
      name: "魂鋼銘紋",
      discipline: "smithing",
      branchId: "smithing_soulforge",
      tier: 1,
      description: "偏向器胚銘紋與品質提示，高階器方熟練提升更高，材料 sink 仍照原配方消耗。",
      prerequisiteNodeIds: ["smithing_core_temper_foundation"],
      conflictsWithBranchIds: ["smithing_starfire"],
      unlockRequirement: { minMastery: 36, minRealm: MajorRealm.Immortal },
      unlockCost: 700,
      switchCost: 240,
      resetCost: 280,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 12,
        qualityCue: "銘紋穩定器胚品質。",
        outputCue: "有機會產生銘紋殘片等副收益；主產出與核心材料不變。",
      },
    },
    {
      id: "smithing_starfire_starsteel_crown",
      name: "星鋼冠火",
      discipline: "smithing",
      branchId: "smithing_starfire",
      tier: 2,
      description: "以 sect:sword:world-chapter-03 的 sword_path_starsteel 承接星火鍛胚，讓仙人後帝兵鍛造取得更高熟練與副收益 cue；路線材料不折抵。",
      prerequisiteNodeIds: ["smithing_starfire_tempering"],
      conflictsWithBranchIds: ["smithing_soulforge"],
      unlockRequirement: { minMastery: 76, minRealm: MajorRealm.Immortal },
      unlockCost: 820,
      switchCost: 280,
      resetCost: 820,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 16,
        qualityCue: "sect:sword:world-chapter-03 的 sword_path_starsteel 冠火讓終盤器胚火候更穩。",
        outputCue: "星鋼碎火會標記副收益機會，sword_path_starsteel 路線材料照配方完整消耗。",
      },
    },
    {
      id: "smithing_v6_heaven_sunder_edge",
      name: "v6 斬天劍冕刃",
      discipline: "smithing",
      branchId: "smithing_starfire",
      tier: 3,
      description: "讀取 sect:sword:endgame-loop-v4 的斬天迴響，讓劍修帝劍 follow-up 顯示 v6 品質與副產物 cue；凌霄劍星鋼仍完整消耗。",
      prerequisiteNodeIds: ["smithing_starfire_starsteel_crown"],
      conflictsWithBranchIds: ["smithing_soulforge"],
      unlockRequirement: { minMastery: 98, minRealm: MajorRealm.ImmortalEmperor },
      unlockCost: 1020,
      switchCost: 340,
      resetCost: 1020,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 18,
        qualityCue: "v6 斬天劍冕刃提高 sect:sword:endgame-loop-v4 帝兵火候可讀性。",
        outputCue: "劍修 v6 follow-up 只增加副收益提示，sword_path_starsteel 不減免。",
      },
    },
    {
      id: "smithing_v6_worldblood_body",
      name: "v6 帝血骨相爐",
      discipline: "smithing",
      branchId: "smithing_soulforge",
      tier: 3,
      description: "讀取 sect:beast:endgame-loop-v4 的帝血迴響，讓體修大道真身 follow-up 顯示 v6 承壓品質 cue；萬獸血骨殘材仍完整消耗。",
      prerequisiteNodeIds: ["smithing_soulsteel_inscription"],
      conflictsWithBranchIds: ["smithing_starfire"],
      unlockRequirement: { minMastery: 98, minRealm: MajorRealm.ImmortalEmperor },
      unlockCost: 1020,
      switchCost: 340,
      resetCost: 1020,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 20,
        qualityCue: "v6 帝血骨相爐提高 sect:beast:endgame-loop-v4 大道真身品質提示。",
        outputCue: "體修 v6 follow-up 只提供副產物 cue，beast_path_bloodbone 不減免。",
      },
    },
  ],
};

export const WORKSHOP_SPECIALIZATION_NODES: Record<string, WorkshopSpecializationNode> =
  Object.values(WORKSHOP_SPECIALIZATION_TREE)
    .flat()
    .reduce<Record<string, WorkshopSpecializationNode>>((nodes, node) => {
      nodes[node.id] = node;
      return nodes;
    }, {});

export const createInitialWorkshopSpecializationDisciplineState =
  (): WorkshopSpecializationDisciplineState => ({
    unlockedNodeIds: [],
    activeNodeId: null,
    activeBranchId: null,
  });

export const createInitialWorkshopSpecializationTreeState = (): Record<
  WorkshopDiscipline,
  WorkshopSpecializationDisciplineState
> => ({
  alchemy: createInitialWorkshopSpecializationDisciplineState(),
  smithing: createInitialWorkshopSpecializationDisciplineState(),
});

export const getWorkshopSpecializationNodesForDiscipline = (
  discipline: WorkshopDiscipline
) => WORKSHOP_SPECIALIZATION_TREE[discipline];

export const getWorkshopMasteryMilestoneStatuses = (
  workshop: WorkshopState,
  discipline: WorkshopDiscipline
): WorkshopMasteryMilestoneStatus[] => {
  const currentMastery = workshop.masteryByDiscipline[discipline];

  return WORKSHOP_MASTERY_MILESTONES[discipline].map((milestone) => ({
    milestone,
    isReached: currentMastery >= milestone.requiredMastery,
    currentMastery,
    remainingMastery: Math.max(0, milestone.requiredMastery - currentMastery),
  }));
};

export const getWorkshopSpecializationNode = (nodeId: string) =>
  WORKSHOP_SPECIALIZATION_NODES[nodeId] ?? null;

export const getWorkshopSpecializationResetCost = (
  workshop: WorkshopState,
  discipline: WorkshopDiscipline
) => {
  const treeState = workshop.specializationTreeByDiscipline[discipline];
  return treeState.unlockedNodeIds.reduce((cost, nodeId) => {
    const node = getWorkshopSpecializationNode(nodeId);
    return cost + (node?.resetCost ?? 0);
  }, 0);
};

const getUnlockedBranchIds = (
  workshop: WorkshopState,
  discipline: WorkshopDiscipline
) =>
  workshop.specializationTreeByDiscipline[discipline].unlockedNodeIds
    .map((nodeId) => getWorkshopSpecializationNode(nodeId)?.branchId ?? null)
    .filter((branchId): branchId is string => Boolean(branchId));

export const getWorkshopSpecializationNodeStatus = ({
  workshop,
  node,
  majorRealm,
  spiritStones,
}: {
  workshop: WorkshopState;
  node: WorkshopSpecializationNode;
  majorRealm?: MajorRealm;
  spiritStones?: number;
}): WorkshopSpecializationNodeStatus => {
  const treeState = workshop.specializationTreeByDiscipline[node.discipline];
  const isUnlocked = treeState.unlockedNodeIds.includes(node.id);
  const isActive = treeState.activeNodeId === node.id;
  const requiredCost = isUnlocked ? node.switchCost ?? 0 : node.unlockCost ?? 0;
  const missingPrerequisite = node.prerequisiteNodeIds?.find(
    (prerequisiteId) => !treeState.unlockedNodeIds.includes(prerequisiteId)
  );
  const minMastery = node.unlockRequirement?.minMastery;
  const minRealm = node.unlockRequirement?.minRealm;
  const conflictingBranchId = getUnlockedBranchIds(workshop, node.discipline).find(
    (branchId) => node.conflictsWithBranchIds?.includes(branchId)
  );

  let lockReason: string | null = null;
  if (missingPrerequisite) {
    lockReason = `需先解鎖「${getWorkshopSpecializationNode(missingPrerequisite)?.name ?? missingPrerequisite}」`;
  } else if (
    minMastery !== undefined &&
    workshop.masteryByDiscipline[node.discipline] < minMastery
  ) {
    lockReason = `${DISCIPLINE_LABELS[node.discipline]}熟練需達 ${minMastery}`;
  } else if (minRealm !== undefined && majorRealm !== undefined && majorRealm < minRealm) {
    lockReason = `境界需達${MajorRealmCN[minRealm]}`;
  } else if (spiritStones !== undefined && spiritStones < requiredCost && !isActive) {
    lockReason = `靈石不足：${spiritStones.toLocaleString()}/${requiredCost.toLocaleString()}`;
  }

  const conflictReason = conflictingBranchId
    ? `與「${WORKSHOP_SPECIALIZATION_BRANCH_LABELS[conflictingBranchId] ?? conflictingBranchId}」分支互斥，需先重置`
    : null;

  return {
    node,
    isUnlocked,
    isActive,
    isAvailable: !lockReason && !conflictReason,
    lockReason,
    conflictReason,
    requiredCost,
    actionLabel: isActive ? "已啟用" : isUnlocked ? "切換" : "解鎖",
  };
};

export const getActiveWorkshopSpecializationNode = (
  workshop: WorkshopState,
  discipline: WorkshopDiscipline
) => {
  const activeNodeId = workshop.specializationTreeByDiscipline[discipline].activeNodeId;
  const activeNode = activeNodeId ? getWorkshopSpecializationNode(activeNodeId) : null;
  return activeNode?.discipline === discipline ? activeNode : null;
};

export const getWorkshopRecipeSpecializationEffect = ({
  workshop,
  discipline,
  tier,
}: {
  workshop: WorkshopState;
  discipline: WorkshopDiscipline;
  tier?: WorkshopRecipeTier;
}): WorkshopRecipeSpecializationEffect => {
  const activeNode = getActiveWorkshopSpecializationNode(workshop, discipline);
  const unlockedNodes = workshop.specializationTreeByDiscipline[discipline].unlockedNodeIds
    .map((nodeId) => getWorkshopSpecializationNode(nodeId))
    .filter((node): node is WorkshopSpecializationNode => Boolean(node));
  const applicableNodes = unlockedNodes.filter((node) => {
    const effect = node.effect;
    return Boolean(effect) && (!effect?.appliesToTier || effect.appliesToTier === tier);
  });

  const spiritStoneCostMultiplier = applicableNodes.reduce(
    (multiplier, node) => multiplier * (node.effect?.spiritStoneCostMultiplier ?? 1),
    1
  );
  const masteryYieldBonus = applicableNodes.reduce(
    (bonus, node) => bonus + (node.effect?.masteryYieldBonus ?? 0),
    0
  );

  return {
    activeNode:
      activeNode?.effect && (!activeNode.effect.appliesToTier || activeNode.effect.appliesToTier === tier)
        ? activeNode
        : null,
    spiritStoneCostMultiplier,
    masteryYieldBonus,
    qualityCues: applicableNodes
      .map((node) => node.effect?.qualityCue)
      .filter((cue): cue is string => Boolean(cue)),
    outputCues: applicableNodes
      .map((node) => node.effect?.outputCue)
      .filter((cue): cue is string => Boolean(cue)),
  };
};
