import { ProfessionType, Skill } from "../types";

export const getHighestActiveSkill = (
  profession: ProfessionType,
  learnedSkills: Skill[]
): Skill | undefined =>
  learnedSkills.find(
    (skill) => skill.profession === profession && skill.type === "Active"
  );
