import { Enemy, MajorRealm, QuestType } from "../types";

export const getCombatExperienceMultiplier = (realm: MajorRealm) =>
  realm <= MajorRealm.QiRefining
    ? 1
    : 2 ** (
        realm -
        MajorRealm.QiRefining +
        (realm >= MajorRealm.Tribulation ? 1 : 0)
      );

export const getCombatExperienceReward = (enemy: Pick<Enemy, "exp" | "realm">) =>
  Math.max(0, Math.floor(enemy.exp * getCombatExperienceMultiplier(enemy.realm)));

const QUEST_PROGRESS_RATIOS: Record<QuestType, number> = {
  [QuestType.Main]: 0.06,
  [QuestType.Sect]: 0.05,
  [QuestType.Side]: 0.03,
};

export const getScaledQuestExperienceReward = ({
  baseExperience,
  currentMaxExperience,
  questType,
}: {
  baseExperience: number;
  currentMaxExperience: number;
  questType: QuestType;
}) =>
  Math.max(
    Math.max(0, Math.floor(baseExperience)),
    Math.floor(Math.max(0, currentMaxExperience) * QUEST_PROGRESS_RATIOS[questType])
  );
