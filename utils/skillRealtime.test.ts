import { describe, expect, it } from "vitest";
import { ProfessionType } from "../types";
import { SKILLS } from "../data/skills";
import {
  getLearnedSkillEngagementRange,
  getSkillRealtimeProfile,
} from "./skillRealtime";

describe("skill realtime profiles", () => {
  it("hydrates realtime fields onto every exported active skill", () => {
    Object.values(SKILLS)
      .filter((skill) => skill.type === "Active")
      .forEach((skill) => {
        expect(skill.cooldownSeconds, `${skill.id} 缺少 cooldownSeconds`).toBeGreaterThan(0);
        expect(skill.castRange, `${skill.id} 缺少 castRange`).toBeGreaterThanOrEqual(0);
        expect(skill.castTimeMs, `${skill.id} 缺少 castTimeMs`).toBeGreaterThanOrEqual(0);
        expect(skill.areaShape, `${skill.id} 缺少 areaShape`).toBeDefined();
        expect(skill.maxTargets, `${skill.id} 缺少 maxTargets`).toBeGreaterThanOrEqual(1);
      });
  });

  it("resolves realtime profiles for every active skill", () => {
    Object.values(SKILLS)
      .filter((skill) => skill.type === "Active")
      .forEach((skill) => {
        const profile = getSkillRealtimeProfile(skill);

        expect(profile.cooldownSeconds).toBeGreaterThan(0);
        expect(profile.castTimeMs).toBeGreaterThanOrEqual(0);
        expect(profile.castRange).toBeGreaterThanOrEqual(0);
        expect(profile.maxTargets).toBeGreaterThanOrEqual(1);
      });
  });

  it("lets learned ranged skills expand engagement range", () => {
    expect(getLearnedSkillEngagementRange(ProfessionType.Sword, ["s_q_active"])).toBe(1);
    expect(getLearnedSkillEngagementRange(ProfessionType.Mage, ["m_f_active"])).toBe(6);
    expect(getLearnedSkillEngagementRange(ProfessionType.Mage, ["m_ie_active"])).toBe(
      getLearnedSkillEngagementRange(ProfessionType.Mage, ["m_tr_active"])
    );
  });
});
