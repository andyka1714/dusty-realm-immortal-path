import { describe, expect, it } from "vitest";
import { MajorRealm } from "../types";
import { ITEMS } from "./items";
import { BOSS_ENEMIES } from "./enemies/boss";
import { QUESTS } from "./quests";
import { SWORD_SECT_NPCS, BEAST_SECT_NPCS, MYSTIC_SECT_NPCS } from "./npcs";

const LATE_QUEST_CASES = [
  {
    questId: "sect_sword_task_04",
    prerequisiteQuestId: "sect_sword_task_03",
    giverId: "sect_sword_patrol_captain",
    minRealm: MajorRealm.NascentSoul,
    targetId: "m92_b1",
    rewardItemIds: ["seven_star_sword", "void_sword_box", "sword_intent_crystal"],
  },
  {
    questId: "sect_beast_task_04",
    prerequisiteQuestId: "sect_beast_task_03",
    giverId: "sect_beast_huntmaster",
    minRealm: MajorRealm.NascentSoul,
    targetId: "m102_b1",
    rewardItemIds: ["god_fiend_gauntlet", "immortal_king_shield", "bood_soul_bead"],
  },
  {
    questId: "sect_mystic_task_04",
    prerequisiteQuestId: "sect_mystic_task_03",
    giverId: "sect_mystic_envoy",
    minRealm: MajorRealm.NascentSoul,
    targetId: "m112_b1",
    rewardItemIds: ["elemental_chaos_staff", "heaven_earth_mirror", "bodhi_seed"],
  },
] as const;

describe("sect late progression data", () => {
  it("adds YuanYing milestone quests after each sect's task_03", () => {
    LATE_QUEST_CASES.forEach((testCase) => {
      const quest = QUESTS[testCase.questId];

      expect(quest, `${testCase.questId} should exist`).toBeDefined();
      expect(quest?.prerequisiteQuestId).toBe(testCase.prerequisiteQuestId);
      expect(quest?.giverId).toBe(testCase.giverId);
      expect(quest?.submitNpcId).toBe(testCase.giverId);

      const levelRequirement = quest?.requirements.find((req) => req.type === "level");
      const killRequirement = quest?.requirements.find((req) => req.type === "kill");

      expect(levelRequirement?.minRealm).toBe(testCase.minRealm);
      expect(killRequirement?.targetId).toBe(testCase.targetId);
      expect(killRequirement?.count).toBe(1);
      expect(BOSS_ENEMIES[testCase.targetId]).toBeDefined();

      const rewardItemIds =
        quest?.rewards.flatMap((reward) => reward.items?.map((item) => item.itemId) ?? []) ?? [];
      expect([...rewardItemIds].sort()).toEqual([...testCase.rewardItemIds].sort());

      testCase.rewardItemIds.forEach((itemId) => {
        expect(ITEMS[itemId], `${itemId} should exist`).toBeDefined();
      });

      const dialogueText = (quest?.dialogue.complete ?? []).join("\n");
      expect(dialogueText).toContain("三界戰場");
      expect(dialogueText).toContain("120");
      expect(dialogueText).toMatch(/化神|元嬰/);
    });
  });

  it("adds the YuanYing quest to each sect hub NPC", () => {
    const swordNpc = SWORD_SECT_NPCS.find((npc) => npc.id === "sect_sword_patrol_captain");
    const beastNpc = BEAST_SECT_NPCS.find((npc) => npc.id === "sect_beast_huntmaster");
    const mysticNpc = MYSTIC_SECT_NPCS.find((npc) => npc.id === "sect_mystic_envoy");

    expect(swordNpc?.questIds).toEqual([
      "sect_sword_task_02",
      "sect_sword_task_03",
      "sect_sword_task_04",
    ]);
    expect(beastNpc?.questIds).toEqual([
      "sect_beast_task_02",
      "sect_beast_task_03",
      "sect_beast_task_04",
    ]);
    expect(mysticNpc?.questIds).toEqual([
      "sect_mystic_task_02",
      "sect_mystic_task_03",
      "sect_mystic_task_04",
    ]);

    expect((swordNpc?.dialogue ?? []).join("\n")).toMatch(/三界戰場|化神/);
    expect((beastNpc?.dialogue ?? []).join("\n")).toMatch(/三界戰場|化神/);
    expect((mysticNpc?.dialogue ?? []).join("\n")).toMatch(/三界戰場|化神/);
  });
});
