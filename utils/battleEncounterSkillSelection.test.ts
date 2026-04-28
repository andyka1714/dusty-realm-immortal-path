import { describe, expect, it } from "vitest";
import { getFormalSkill } from "../data/skills";
import { ProfessionType } from "../types";
import { getSelectedActiveSkill } from "./battleEncounterSkillSelection";

const learnedSwordSkills = ["s_q_active", "s_f_active", "s_q_passive"]
  .map((skillId) => getFormalSkill(skillId))
  .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill));

const learnedSwordAndCommonSkills = ["s_q_active", "s_f_active", "common_f_active"]
  .map((skillId) => getFormalSkill(skillId))
  .filter((skill): skill is NonNullable<typeof skill> => Boolean(skill));

describe("battle encounter skill selection", () => {
  it("uses the equipped active skill before falling back to the highest learned active skill", () => {
    expect(
      getSelectedActiveSkill(ProfessionType.Sword, learnedSwordSkills, "s_q_active")?.id
    ).toBe("s_q_active");

    expect(
      getSelectedActiveSkill(ProfessionType.Sword, learnedSwordSkills, "s_q_passive")?.id
    ).toBe("s_f_active");

    expect(
      getSelectedActiveSkill(ProfessionType.Sword, learnedSwordSkills, "b_q_active")?.id
    ).toBe("s_f_active");
  });

  it("allows common active skills to be selected for any profession", () => {
    expect(
      getSelectedActiveSkill(
        ProfessionType.Sword,
        learnedSwordAndCommonSkills,
        "common_f_active"
      )?.id
    ).toBe("common_f_active");
  });
});
