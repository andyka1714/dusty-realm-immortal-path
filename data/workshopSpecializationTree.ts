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
      description: "偏向藥性共鳴與副收益，高階丹方熟練提升更高，但不降低核心材料需求。",
      prerequisiteNodeIds: ["alchemy_inner_fire_foundation"],
      conflictsWithBranchIds: ["alchemy_hongmeng"],
      unlockRequirement: { minMastery: 30, minRealm: MajorRealm.Tribulation },
      unlockCost: 650,
      switchCost: 220,
      resetCost: 260,
      effect: {
        appliesToTier: "highRealm",
        masteryYieldBonus: 10,
        qualityCue: "藥性共鳴提高品質穩定感。",
        outputCue: "有機會衍生藥渣、丹香等副收益；主產出與核心材料不變。",
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
