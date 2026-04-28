import { describe, expect, it } from "vitest";
import { QuestType } from "../types";
import { VILLAGE_NPCS } from "./npcs";
import { QUESTS } from "./quests";

describe("main questline foundation", () => {
  it("adds an early scripture pavilion main quest after the weapon tutorial", () => {
    const quest = QUESTS.tutorial_03_scripture_intro;

    expect(quest).toBeDefined();
    expect(quest.type).toBe(QuestType.Main);
    expect(quest.prerequisiteQuestId).toBe("tutorial_02_get_sword");
    expect(quest.giverId).toBe("village_scripture_keeper");
    expect(quest.submitNpcId).toBe("village_scripture_keeper");
    expect(quest.requirements).toEqual([
      { type: "dialogue", targetNpcId: "village_scripture_keeper" },
    ]);

    const questText = [
      quest.title,
      quest.description,
      ...quest.dialogue.start,
      ...quest.dialogue.progress,
      ...quest.dialogue.complete,
    ].join("\n");

    expect(questText).toContain("藏經閣");
    expect(questText).toContain("背包參悟");
    expect(questText).toContain("功法面板");
    expect(questText).toContain("裝備參戰");
  });

  it("hangs the scripture intro quest on the village scripture keeper", () => {
    const npc = VILLAGE_NPCS.find((entry) => entry.id === "village_scripture_keeper");

    expect(npc?.questIds).toContain("tutorial_03_scripture_intro");
  });
});
