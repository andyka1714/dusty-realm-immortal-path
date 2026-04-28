import { ProfessionType, Skill } from "../types";

const canUseActiveSkillForProfession = (skill: Skill, profession: ProfessionType) =>
  skill.type === "Active" &&
  (skill.profession === profession || skill.profession === ProfessionType.None);

export const getHighestActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[]
): Skill | undefined =>
  learnedSkills
    .filter((skill) => canUseActiveSkillForProfession(skill, profession))
    .sort((left, right) => {
      if (left.minRealm !== right.minRealm) {
        return right.minRealm - left.minRealm;
      }
      const leftProfessionPriority = left.profession === profession ? 0 : 1;
      const rightProfessionPriority = right.profession === profession ? 0 : 1;
      return leftProfessionPriority - rightProfessionPriority;
    })[0];

export const getSelectedActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[],
  equippedActiveSkillId?: string | null
): Skill | undefined => {
  const equippedActiveSkill = equippedActiveSkillId
    ? learnedSkills.find(
        (skill) =>
          skill.id === equippedActiveSkillId &&
          canUseActiveSkillForProfession(skill, profession)
      )
    : undefined;

  return equippedActiveSkill ?? getHighestActiveSkill(profession, learnedSkills);
};
