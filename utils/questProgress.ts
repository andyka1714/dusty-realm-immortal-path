import { MajorRealm, Quest, QuestRequirement } from '../types';

type ActiveQuestState = {
  progress: number;
  isReadyToComplete: boolean;
};

const isDialogueRequirementSatisfied = (
  requirement: QuestRequirement,
  quest: Quest,
  npcId: string
) => {
  if (requirement.type !== 'dialogue') return false;
  if (requirement.targetNpcId) return requirement.targetNpcId === npcId;
  return (quest.submitNpcId ?? quest.giverId) === npcId;
};

export const resolveQuestReadinessAtNpc = ({
  quest,
  activeQuestState,
  majorRealm,
  npcId,
}: {
  quest: Quest;
  activeQuestState: ActiveQuestState;
  majorRealm: MajorRealm;
  npcId: string;
}) =>
  quest.requirements.every((requirement) => {
    switch (requirement.type) {
      case 'level':
        return requirement.minRealm !== undefined && majorRealm >= requirement.minRealm;
      case 'kill':
      case 'item':
        return activeQuestState.progress >= (requirement.count ?? 1);
      case 'dialogue':
        return isDialogueRequirementSatisfied(requirement, quest, npcId);
      default:
        return false;
    }
  });

export const resolveQuestKillProgressOnEnemyDefeat = ({
  quest,
  activeQuestState,
  defeatedEnemyId,
  majorRealm,
}: {
  quest: Quest;
  activeQuestState: ActiveQuestState;
  defeatedEnemyId: string;
  majorRealm: MajorRealm;
}) => {
  const killRequirement = quest.requirements.find(
    (requirement) => requirement.type === 'kill'
  );

  if (!killRequirement || killRequirement.targetId !== defeatedEnemyId) {
    return null;
  }

  const nextProgress = Math.min(
    activeQuestState.progress + 1,
    killRequirement.count ?? 1
  );

  const isReadyToComplete = quest.requirements.every((requirement) => {
    switch (requirement.type) {
      case 'level':
        return requirement.minRealm !== undefined && majorRealm >= requirement.minRealm;
      case 'kill':
        return nextProgress >= (requirement.count ?? 1);
      case 'dialogue':
        return false;
      case 'item':
        return activeQuestState.progress >= (requirement.count ?? 1);
      default:
        return false;
    }
  });

  return {
    progress: nextProgress,
    isReadyToComplete,
  };
};
