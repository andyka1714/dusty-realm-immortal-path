import { MapData, Quest, QuestRequirement, QuestType } from "../types";

export interface ActiveQuestTrackerState {
  progress: number;
  isReadyToComplete: boolean;
}

export interface QuestTrackerItem {
  questId: string;
  title: string;
  typeLabel: string;
  statusLabel: string;
  progressLabel: string;
  isReadyToComplete: boolean;
  isSuggested?: boolean;
  navigationTarget?: QuestNavigationTarget;
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
  const submitNpcId = quest.submitNpcId ?? quest.giverId;
  if (activeQuest?.isReadyToComplete) {
    return findNpcLocation(maps, submitNpcId);
  }

  return (
    resolveRequirementTarget(getPrimaryRequirement(quest), maps) ??
    findNpcLocation(maps, submitNpcId)
  );
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
  quests,
  maps = [],
  limit = 4,
}: {
  activeQuests: Record<string, ActiveQuestTrackerState>;
  completedQuests?: string[];
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

      return {
        questId,
        title: quest.title,
        typeLabel: QUEST_TYPE_LABELS[quest.type],
        statusLabel: activeQuest.isReadyToComplete ? "可回報" : "追蹤中",
        progressLabel: formatRequirementProgress(
          getPrimaryRequirement(quest),
          activeQuest
        ),
        isReadyToComplete: activeQuest.isReadyToComplete,
        navigationTarget: resolveQuestNavigationTarget({
          quest,
          activeQuest,
          maps,
        }),
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
    {
      questId: nextMainQuest.id,
      title: nextMainQuest.title,
      typeLabel: QUEST_TYPE_LABELS[nextMainQuest.type],
      statusLabel: "下一主線",
      progressLabel: formatRequirementProgress(
        getPrimaryRequirement(nextMainQuest),
        { progress: 0, isReadyToComplete: false }
      ),
      isReadyToComplete: false,
      isSuggested: true,
      navigationTarget: resolveQuestNavigationTarget({
        quest: nextMainQuest,
        maps,
      }),
    },
  ];
};
