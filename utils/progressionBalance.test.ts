import { describe, expect, it } from "vitest";
import { EnemyRank, MajorRealm, QuestType } from "../types";
import {
  getCombatExperienceMultiplier,
  getCombatExperienceReward,
  getScaledQuestExperienceReward,
} from "./progressionBalance";

describe("progression balance", () => {
  it("keeps early combat readable and scales late combat with realm inflation", () => {
    expect(getCombatExperienceMultiplier(MajorRealm.Mortal)).toBe(1);
    expect(getCombatExperienceMultiplier(MajorRealm.Foundation)).toBe(2);
    expect(getCombatExperienceMultiplier(MajorRealm.Immortal)).toBe(1024);
    expect(getCombatExperienceReward({ exp: 100, realm: MajorRealm.GoldenCore })).toBe(400);
  });

  it("keeps quests meaningful without reducing authored rewards", () => {
    expect(getScaledQuestExperienceReward({
      baseExperience: 500,
      currentMaxExperience: 1000,
      questType: QuestType.Main,
    })).toBe(500);
    expect(getScaledQuestExperienceReward({
      baseExperience: 100,
      currentMaxExperience: 100000,
      questType: QuestType.Side,
    })).toBe(3000);
  });
});
