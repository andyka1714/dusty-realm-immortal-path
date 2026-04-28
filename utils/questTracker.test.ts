import { describe, expect, it } from "vitest";
import {
  ElementType,
  EnemyRank,
  MajorRealm,
  NPCType,
  QuestType,
} from "../types";
import { buildQuestTrackerItems } from "./questTracker";

describe("questTracker", () => {
  it("prioritizes ready, main, sect, then side quests with readable progress labels", () => {
    const items = buildQuestTrackerItems({
      activeQuests: {
        side_hunt: { progress: 1, isReadyToComplete: false },
        main_ready: { progress: 0, isReadyToComplete: true },
        sect_trial: { progress: 2, isReadyToComplete: false },
      },
      quests: {
        side_hunt: {
          id: "side_hunt",
          type: QuestType.Side,
          title: "清理妖巢",
          description: "",
          giverId: "npc",
          requirements: [{ type: "kill", targetId: "wolf", count: 3 }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
        main_ready: {
          id: "main_ready",
          type: QuestType.Main,
          title: "回報仙緣",
          description: "",
          giverId: "npc",
          requirements: [{ type: "dialogue", targetNpcId: "elder" }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
        sect_trial: {
          id: "sect_trial",
          type: QuestType.Sect,
          title: "宗門試煉",
          description: "",
          giverId: "npc",
          requirements: [{ type: "item", targetId: "token", count: 2 }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
      },
    });

    expect(items.map((item) => item.questId)).toEqual([
      "main_ready",
      "sect_trial",
      "side_hunt",
    ]);
    expect(items[0]).toMatchObject({
      typeLabel: "主線",
      statusLabel: "可回報",
    });
    expect(items[1].progressLabel).toBe("道具 2 / 2");
    expect(items[2].progressLabel).toBe("討伐 1 / 3");
  });

  it("suggests the next available main quest when no quest is active", () => {
    const items = buildQuestTrackerItems({
      activeQuests: {},
      completedQuests: ["intro"],
      limit: 1,
      quests: {
        intro: {
          id: "intro",
          type: QuestType.Main,
          title: "初見村長",
          description: "",
          giverId: "chief",
          requirements: [{ type: "dialogue", targetNpcId: "chief" }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
        scripture: {
          id: "scripture",
          type: QuestType.Main,
          title: "藏經初問",
          description: "",
          giverId: "keeper",
          prerequisiteQuestId: "intro",
          requirements: [{ type: "dialogue", targetNpcId: "keeper" }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
      },
      maps: [
        {
          id: "0",
          name: "仙緣鎮",
          theme: "Center",
          minRealm: MajorRealm.Mortal,
          description: "",
          introText: "",
          width: 40,
          height: 40,
          worldX: 0,
          worldY: 0,
          portals: [],
          npcs: [
            {
              id: "keeper",
              name: "藏經閣執事",
              symbol: "經",
              type: NPCType.Shop,
              x: 20,
              y: 25,
              description: "",
            },
          ],
          enemies: [],
          dropRateMultiplier: 1,
        },
      ],
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      questId: "scripture",
      title: "藏經初問",
      typeLabel: "主線",
      statusLabel: "可接取",
      lifecycleStatus: "available",
      lifecycleLabel: "可接取",
      primaryActionLabel: "前往藏經閣執事",
      isSuggested: true,
      navigationTarget: {
        kind: "npc",
        mapId: "0",
        x: 20,
        y: 25,
        label: "前往藏經閣執事",
      },
    });
  });

  it("derives ready and active lifecycle statuses separately", () => {
    const items = buildQuestTrackerItems({
      activeQuests: {
        ready_report: { progress: 1, isReadyToComplete: true },
        active_hunt: { progress: 1, isReadyToComplete: false },
      },
      quests: {
        ready_report: {
          id: "ready_report",
          type: QuestType.Main,
          title: "回報仙緣",
          description: "",
          giverId: "chief",
          submitNpcId: "blacksmith",
          requirements: [{ type: "dialogue", targetNpcId: "chief" }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
        active_hunt: {
          id: "active_hunt",
          type: QuestType.Side,
          title: "清理妖巢",
          description: "",
          giverId: "chief",
          requirements: [{ type: "kill", targetId: "wolf", count: 3 }],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
      },
    });

    expect(items[0]).toMatchObject({
      lifecycleStatus: "ready",
      lifecycleLabel: "可回報",
      primaryActionLabel: "回報任務",
    });
    expect(items[1]).toMatchObject({
      lifecycleStatus: "active",
      lifecycleLabel: "進行中",
      primaryActionLabel: "追蹤目標",
    });
  });

  it("builds progress rows for mixed dialogue kill item and level objectives", () => {
    const items = buildQuestTrackerItems({
      activeQuests: {
        mixed_trial: { progress: 2, isReadyToComplete: false },
      },
      inventoryItems: [
        { itemId: "spirit_token", count: 1 },
      ],
      majorRealm: MajorRealm.Foundation,
      quests: {
        mixed_trial: {
          id: "mixed_trial",
          type: QuestType.Main,
          title: "複合試煉",
          description: "",
          giverId: "chief",
          requirements: [
            { type: "dialogue", targetNpcId: "chief" },
            { type: "kill", targetId: "wolf", count: 3 },
            { type: "item", targetId: "spirit_token", count: 2 },
            { type: "level", minRealm: MajorRealm.Foundation },
          ],
          rewards: [],
          dialogue: { start: [], progress: [], complete: [] },
        },
      },
    });

    expect(items[0]).toMatchObject({
      objectiveKind: "mixed",
      progressRows: [
        { kind: "dialogue", label: "對話：前往 chief", complete: false },
        { kind: "kill", label: "討伐 wolf", current: 2, required: 3, complete: false },
        { kind: "item", label: "提交 spirit_token", current: 1, required: 2, complete: false },
        { kind: "level", label: "境界需求 2", complete: true },
      ],
    });
  });

  it("points ready active quests to their submit npc and kill quests to their target map", () => {
    const sharedQuestFields = {
      description: "",
      rewards: [],
      dialogue: { start: [], progress: [], complete: [] },
    };

    const items = buildQuestTrackerItems({
      activeQuests: {
        ready_report: { progress: 1, isReadyToComplete: true },
        tiger_hunt: { progress: 0, isReadyToComplete: false },
      },
      quests: {
        ready_report: {
          id: "ready_report",
          type: QuestType.Main,
          title: "回報村長",
          giverId: "chief",
          submitNpcId: "blacksmith",
          requirements: [{ type: "dialogue", targetNpcId: "chief" }],
          ...sharedQuestFields,
        },
        tiger_hunt: {
          id: "tiger_hunt",
          type: QuestType.Side,
          title: "斬虎",
          giverId: "chief",
          requirements: [{ type: "kill", targetId: "tiger", count: 1 }],
          ...sharedQuestFields,
        },
      },
      maps: [
        {
          id: "0",
          name: "仙緣鎮",
          theme: "Center",
          minRealm: MajorRealm.Mortal,
          description: "",
          introText: "",
          width: 40,
          height: 40,
          worldX: 0,
          worldY: 0,
          portals: [],
          npcs: [
            {
              id: "blacksmith",
              name: "鐵匠鋪",
              symbol: "匠",
              type: NPCType.Shop,
              x: 25,
              y: 20,
              description: "",
            },
          ],
          enemies: [],
          dropRateMultiplier: 1,
        },
        {
          id: "3",
          name: "凌霄山腳",
          theme: "North",
          minRealm: MajorRealm.Mortal,
          description: "",
          introText: "",
          width: 80,
          height: 80,
          worldX: 0,
          worldY: 3,
          portals: [],
          npcs: [],
          enemies: [
            {
              id: "tiger",
              name: "守山靈虎",
              realm: MajorRealm.Mortal,
              rank: EnemyRank.Boss,
              hp: 10,
              maxHp: 10,
              attack: 1,
              defense: 1,
              element: ElementType.Metal,
              drops: [],
              exp: 1,
            },
          ],
          dropRateMultiplier: 1,
        },
      ],
    });

    expect(items[0].navigationTarget).toMatchObject({
      kind: "npc",
      mapId: "0",
      x: 25,
      y: 20,
      label: "前往鐵匠鋪",
    });
    expect(items[1].navigationTarget).toMatchObject({
      kind: "map",
      mapId: "3",
      x: 40,
      y: 40,
      label: "前往凌霄山腳",
    });
  });
});
