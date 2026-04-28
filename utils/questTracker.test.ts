import { describe, expect, it } from "vitest";
import { QuestType } from "../types";
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
});
