import { Quest, QuestRequirement, QuestType } from "../types";

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

export const buildQuestTrackerItems = ({
  activeQuests,
  quests,
  limit = 4,
}: {
  activeQuests: Record<string, ActiveQuestTrackerState>;
  quests: Record<string, Quest>;
  limit?: number;
}): QuestTrackerItem[] =>
  Object.entries(activeQuests)
    .map(([questId, activeQuest]) => {
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
