import { describe, expect, it } from "vitest";
import { MajorRealm } from "../types";
import { ITEMS } from "./items";
import { BOSS_ENEMIES } from "./enemies/boss";
import { QUESTS } from "./quests";
import { SWORD_SECT_NPCS, BEAST_SECT_NPCS, MYSTIC_SECT_NPCS } from "./npcs";

const MIDGAME_QUEST_CASES = [
  {
    questId: "sect_sword_task_02",
    prerequisiteQuestId: "sect_sword_task_01",
    giverId: "sect_sword_patrol_captain",
    minRealm: MajorRealm.Foundation,
    targetId: "m32_b1",
    rewardItemIds: ["flow_light_sword", "sword_scabbard"],
  },
  {
    questId: "sect_sword_task_03",
    prerequisiteQuestId: "sect_sword_task_02",
    giverId: "sect_sword_patrol_captain",
    minRealm: MajorRealm.GoldenCore,
    targetId: "m62_b1",
    rewardItemIds: ["azure_frost_sword", "sword_spirit_stone"],
  },
  {
    questId: "sect_beast_task_02",
    prerequisiteQuestId: "sect_beast_task_01",
    giverId: "sect_beast_huntmaster",
    minRealm: MajorRealm.Foundation,
    targetId: "m42_b1",
    rewardItemIds: ["tiger_king_gauntlet", "scale_shield"],
  },
  {
    questId: "sect_beast_task_03",
    prerequisiteQuestId: "sect_beast_task_02",
    giverId: "sect_beast_huntmaster",
    minRealm: MajorRealm.GoldenCore,
    targetId: "m72_b1",
    rewardItemIds: ["dragon_claw", "black_tortoise_shield"],
  },
  {
    questId: "sect_mystic_task_02",
    prerequisiteQuestId: "sect_mystic_task_01",
    giverId: "sect_mystic_envoy",
    minRealm: MajorRealm.Foundation,
    targetId: "m52_b1",
    rewardItemIds: ["jade_bamboo_staff", "elemental_fan"],
  },
  {
    questId: "sect_mystic_task_03",
    prerequisiteQuestId: "sect_mystic_task_02",
    giverId: "sect_mystic_envoy",
    minRealm: MajorRealm.GoldenCore,
    targetId: "m82_b1",
    rewardItemIds: ["phoenix_feather_staff", "yin_yang_mirror"],
  },
];

describe("sect midgame progression data", () => {
  it("adds chained midgame quests for each sect", () => {
    MIDGAME_QUEST_CASES.forEach((testCase) => {
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
    });
  });

  it("adds dedicated quest NPCs to each sect hub", () => {
    expect(SWORD_SECT_NPCS.find((npc) => npc.id === "sect_sword_patrol_captain")?.questIds).toEqual([
      "sect_sword_task_02",
      "sect_sword_task_03",
    ]);
    expect(BEAST_SECT_NPCS.find((npc) => npc.id === "sect_beast_huntmaster")?.questIds).toEqual([
      "sect_beast_task_02",
      "sect_beast_task_03",
    ]);
    expect(MYSTIC_SECT_NPCS.find((npc) => npc.id === "sect_mystic_envoy")?.questIds).toEqual([
      "sect_mystic_task_02",
      "sect_mystic_task_03",
    ]);
  });
});
