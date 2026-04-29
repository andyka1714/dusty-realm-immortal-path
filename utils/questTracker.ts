import {
  InventorySlot,
  MajorRealm,
  MapData,
  Quest,
  QuestRequirement,
  QuestType,
} from "../types";

export interface ActiveQuestTrackerState {
  progress: number;
  isReadyToComplete: boolean;
}

export interface QuestTrackerItem {
  questId: string;
  title: string;
  description: string;
  typeLabel: string;
  statusLabel: string;
  progressLabel: string;
  isReadyToComplete: boolean;
  isSuggested?: boolean;
  lifecycleStatus: QuestLifecycleStatus;
  lifecycleLabel: string;
  objectiveKind: QuestObjectiveKind;
  progressRows: QuestProgressRow[];
  primaryActionLabel: string;
  navigationTarget?: QuestNavigationTarget;
}

export type QuestLifecycleStatus = "available" | "active" | "ready";

export type QuestObjectiveKind =
  | "dialogue"
  | "kill"
  | "item"
  | "level"
  | "mixed";

export interface QuestProgressRow {
  kind: QuestObjectiveKind;
  label: string;
  current?: number;
  required?: number;
  complete: boolean;
}

export interface QuestNavigationTarget {
  kind: "npc" | "map" | "condition";
  mapId: string;
  x: number;
  y: number;
  label: string;
  targetId?: string;
}

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  [QuestType.Main]: "主線",
  [QuestType.Sect]: "宗門",
  [QuestType.Side]: "支線",
};

const QUEST_TYPE_PRIORITY: Record<QuestType, number> = {
  [QuestType.Main]: 0,
  [QuestType.Sect]: 1,
  [QuestType.Side]: 2,
};

const getPrimaryRequirement = (quest: Quest) =>
  quest.requirements.find((requirement) => requirement.type !== "level") ??
  quest.requirements[0];

const formatRequirementProgress = (
  requirement: QuestRequirement | undefined,
  activeQuest: ActiveQuestTrackerState
) => {
  if (!requirement) {
    return activeQuest.isReadyToComplete ? "可回報" : "進行中";
  }

  if (activeQuest.isReadyToComplete) {
    return "可回報";
  }

  switch (requirement.type) {
    case "kill":
      return `討伐 ${activeQuest.progress} / ${requirement.count ?? 1}`;
    case "item":
      return `道具 ${activeQuest.progress} / ${requirement.count ?? 1}`;
    case "dialogue":
      return "前往對話";
    case "level":
      return requirement.minRealm !== undefined
        ? `境界需求 ${requirement.minRealm}`
        : "境界需求";
    default:
      return "進行中";
  }
};

const resolveLifecycle = (
  activeQuest: ActiveQuestTrackerState | undefined,
  isSuggested = false
) => {
  if (!activeQuest || isSuggested) {
    return {
      lifecycleStatus: "available" as const,
      lifecycleLabel: "可接取",
      statusLabel: "可接取",
    };
  }

  if (activeQuest.isReadyToComplete) {
    return {
      lifecycleStatus: "ready" as const,
      lifecycleLabel: "可回報",
      statusLabel: "可回報",
    };
  }

  return {
    lifecycleStatus: "active" as const,
    lifecycleLabel: "進行中",
    statusLabel: "進行中",
  };
};

const getInventoryCount = (items: InventorySlot[] = [], itemId?: string) => {
  if (!itemId) return 0;
  return items
    .filter((item) => item.itemId === itemId)
    .reduce((total, item) => total + item.count, 0);
};

const findNpcName = (maps: MapData[] = [], npcId?: string) => {
  if (!npcId) return undefined;
  for (const map of maps) {
    const npc = map.npcs.find((candidate) => candidate.id === npcId);
    if (npc) {
      return npc.name;
    }
  }
  return undefined;
};

const findEnemyName = (maps: MapData[] = [], enemyId?: string) => {
  if (!enemyId) return undefined;
  for (const map of maps) {
    const enemy = map.enemies.find((candidate) => candidate.id === enemyId);
    if (enemy) {
      return enemy.name;
    }
  }
  return undefined;
};

const formatRequirementLabel = (
  requirement: QuestRequirement,
  maps: MapData[] = []
) => {
  switch (requirement.type) {
    case "dialogue":
      return `對話：${findNpcName(maps, requirement.targetNpcId) ?? "任務 NPC"}`;
    case "kill":
      return `討伐 ${findEnemyName(maps, requirement.targetId) ?? "目標妖獸"}`;
    case "item":
      return `提交 ${requirement.targetId ?? "任務物品"}`;
    case "level":
      return requirement.minRealm !== undefined
        ? `境界需求 ${requirement.minRealm}`
        : "境界需求";
    default:
      return "任務目標";
  }
};

const buildProgressRows = ({
  quest,
  activeQuest,
  inventoryItems = [],
  majorRealm = MajorRealm.Mortal,
  maps = [],
}: {
  quest: Quest;
  activeQuest?: ActiveQuestTrackerState;
  inventoryItems?: InventorySlot[];
  majorRealm?: MajorRealm;
  maps?: MapData[];
}): QuestProgressRow[] =>
  quest.requirements.map((requirement) => {
    switch (requirement.type) {
      case "dialogue":
        return {
          kind: "dialogue",
          label: formatRequirementLabel(requirement, maps),
          complete: Boolean(activeQuest?.isReadyToComplete),
        };
      case "kill": {
        const required = requirement.count ?? 1;
        const current = Math.min(activeQuest?.progress ?? 0, required);
        return {
          kind: "kill",
          label: formatRequirementLabel(requirement, maps),
          current,
          required,
          complete: current >= required,
        };
      }
      case "item": {
        const required = requirement.count ?? 1;
        const current = Math.min(
          getInventoryCount(inventoryItems, requirement.targetId),
          required
        );
        return {
          kind: "item",
          label: formatRequirementLabel(requirement, maps),
          current,
          required,
          complete: current >= required,
        };
      }
      case "level":
        return {
          kind: "level",
          label: formatRequirementLabel(requirement, maps),
          complete:
            requirement.minRealm !== undefined &&
            majorRealm >= requirement.minRealm,
        };
      default:
        return {
          kind: "mixed",
          label: "任務目標",
          complete: false,
        };
    }
  });

const resolveObjectiveKind = (rows: QuestProgressRow[]): QuestObjectiveKind => {
  const kinds = new Set(rows.map((row) => row.kind));
  if (kinds.size === 1) {
    return rows[0]?.kind ?? "mixed";
  }
  return "mixed";
};

const findNpcLocation = (maps: MapData[] = [], npcId: string) => {
  for (const map of maps) {
    const npc = map.npcs.find((candidate) => candidate.id === npcId);
    if (npc) {
      return {
        kind: "npc" as const,
        mapId: map.id,
        x: npc.x,
        y: npc.y,
        label: `前往${npc.name}`,
        targetId: npc.id,
      };
    }
  }

  return undefined;
};

const findEnemyMap = (maps: MapData[] = [], enemyId: string) => {
  const map = maps.find((candidate) =>
    candidate.enemies.some((enemy) => enemy.id === enemyId)
  );

  if (!map) {
    return undefined;
  }

  return {
    kind: "map" as const,
    mapId: map.id,
    x: Math.floor(map.width / 2),
    y: Math.floor(map.height / 2),
    label: `前往${map.name}`,
  };
};

const resolveRequirementTarget = (
  requirement: QuestRequirement | undefined,
  maps: MapData[] = []
): QuestNavigationTarget | undefined => {
  if (!requirement) {
    return undefined;
  }

  if (requirement.type === "dialogue" && requirement.targetNpcId) {
    return findNpcLocation(maps, requirement.targetNpcId);
  }

  if (requirement.type === "kill" && requirement.targetId) {
    return findEnemyMap(maps, requirement.targetId);
  }

  return undefined;
};

const resolveQuestNavigationTarget = ({
  quest,
  activeQuest,
  maps,
}: {
  quest: Quest;
  activeQuest?: ActiveQuestTrackerState;
  maps?: MapData[];
}): QuestNavigationTarget | undefined => {
  if (!activeQuest) {
    return findNpcLocation(maps, quest.giverId);
  }

  const submitNpcId = quest.submitNpcId ?? quest.giverId;
  if (activeQuest?.isReadyToComplete) {
    return findNpcLocation(maps, submitNpcId);
  }

  return (
    resolveRequirementTarget(getPrimaryRequirement(quest), maps) ??
    findNpcLocation(maps, submitNpcId)
  );
};

const resolvePrimaryActionLabel = ({
  lifecycleStatus,
  navigationTarget,
}: {
  lifecycleStatus: QuestLifecycleStatus;
  navigationTarget?: QuestNavigationTarget;
}) => {
  if (navigationTarget?.label) {
    if (lifecycleStatus === "ready") {
      return navigationTarget.label.replace(/^前往/, "回報");
    }
    return navigationTarget.label;
  }

  if (lifecycleStatus === "ready") {
    return "回報任務";
  }

  return "追蹤目標";
};

const findNextMainQuest = ({
  activeQuests,
  completedQuests,
  quests,
}: {
  activeQuests: Record<string, ActiveQuestTrackerState>;
  completedQuests: string[];
  quests: Record<string, Quest>;
}) =>
  Object.values(quests).find((quest) => {
    if (quest.type !== QuestType.Main) {
      return false;
    }
    if (activeQuests[quest.id] || completedQuests.includes(quest.id)) {
      return false;
    }
    return (
      !quest.prerequisiteQuestId ||
      completedQuests.includes(quest.prerequisiteQuestId)
    );
  });

export const buildQuestTrackerItems = ({
  activeQuests,
  completedQuests = [],
  inventoryItems = [],
  majorRealm = MajorRealm.Mortal,
  quests,
  maps = [],
  limit = 4,
}: {
  activeQuests: Record<string, ActiveQuestTrackerState>;
  completedQuests?: string[];
  inventoryItems?: InventorySlot[];
  majorRealm?: MajorRealm;
  quests: Record<string, Quest>;
  maps?: MapData[];
  limit?: number;
}): QuestTrackerItem[] => {
  const activeItems = Object.entries(activeQuests)
    .map<QuestTrackerItem | null>(([questId, activeQuest]) => {
      const quest = quests[questId];
      if (!quest) {
        return null;
      }
      const lifecycle = resolveLifecycle(activeQuest);
      const progressRows = buildProgressRows({
        quest,
        activeQuest,
        inventoryItems,
        majorRealm,
        maps,
      });
      const navigationTarget = resolveQuestNavigationTarget({
        quest,
        activeQuest,
        maps,
      });

      return {
        questId,
        title: quest.title,
        description: quest.description,
        typeLabel: QUEST_TYPE_LABELS[quest.type],
        statusLabel: lifecycle.statusLabel,
        progressLabel: formatRequirementProgress(
          getPrimaryRequirement(quest),
          activeQuest
        ),
        isReadyToComplete: activeQuest.isReadyToComplete,
        lifecycleStatus: lifecycle.lifecycleStatus,
        lifecycleLabel: lifecycle.lifecycleLabel,
        objectiveKind: resolveObjectiveKind(progressRows),
        progressRows,
        primaryActionLabel: resolvePrimaryActionLabel({
          lifecycleStatus: lifecycle.lifecycleStatus,
          navigationTarget,
        }),
        navigationTarget,
      };
    })
    .filter((item): item is QuestTrackerItem => Boolean(item))
    .sort((left, right) => {
      if (left.isReadyToComplete !== right.isReadyToComplete) {
        return left.isReadyToComplete ? -1 : 1;
      }
      const leftQuest = quests[left.questId];
      const rightQuest = quests[right.questId];
      return (
        QUEST_TYPE_PRIORITY[leftQuest.type] -
          QUEST_TYPE_PRIORITY[rightQuest.type] ||
        left.title.localeCompare(right.title, "zh-Hant")
      );
    })
    .slice(0, limit);
  if (activeItems.length > 0) {
    return activeItems;
  }

  const nextMainQuest = findNextMainQuest({
    activeQuests,
    completedQuests,
    quests,
  });

  if (!nextMainQuest) {
    return [];
  }

  return [
    (() => {
      const lifecycle = resolveLifecycle(undefined, true);
      const progressRows = buildProgressRows({
        quest: nextMainQuest,
        inventoryItems,
        majorRealm,
        maps,
      });
      const navigationTarget = resolveQuestNavigationTarget({
        quest: nextMainQuest,
        maps,
      });

      return {
        questId: nextMainQuest.id,
        title: nextMainQuest.title,
        description: nextMainQuest.description,
        typeLabel: QUEST_TYPE_LABELS[nextMainQuest.type],
        statusLabel: lifecycle.statusLabel,
        progressLabel: formatRequirementProgress(
          getPrimaryRequirement(nextMainQuest),
          { progress: 0, isReadyToComplete: false }
        ),
        isReadyToComplete: false,
        isSuggested: true,
        lifecycleStatus: lifecycle.lifecycleStatus,
        lifecycleLabel: lifecycle.lifecycleLabel,
        objectiveKind: resolveObjectiveKind(progressRows),
        progressRows,
        primaryActionLabel: resolvePrimaryActionLabel({
          lifecycleStatus: lifecycle.lifecycleStatus,
          navigationTarget,
        }),
        navigationTarget,
      };
    })(),
  ];
};
