import { ProfessionType, Skill } from "../types";

export const getHighestActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[]
): Skill | undefined =>
  learnedSkills
    .filter((skill) => skill.profession === profession && skill.type === "Active")
    .sort((left, right) => right.minRealm - left.minRealm)[0];

export const getSelectedActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[],
  equippedActiveSkillId?: string | null
): Skill | undefined => {
  const equippedActiveSkill = equippedActiveSkillId
    ? learnedSkills.find(
        (skill) =>
          skill.id === equippedActiveSkillId &&
          skill.profession === profession &&
          skill.type === "Active"
      )
    : undefined;

  return equippedActiveSkill ?? getHighestActiveSkill(profession, learnedSkills);
};
