import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../types";
import {
  ENCOUNTER_EVENTS,
  getAvailableEncounterEvents,
  type EncounterEvent,
} from "./encounters";
import { MAPS } from "./maps";
import { WORLD_STORY_NPCS } from "./npcs";
import { QUESTS } from "./quests";

const WORLD_STORY_BRANCH_CASES = [
  {
    routeLabel: "凌霄劍宗",
    profession: ProfessionType.Sword,
    task04QuestId: "sect_sword_task_04",
    worldQuestId: "sect_sword_world_chapter_01",
    giverNpcId: "world_sword_battlefield_envoy",
    abyssNpcId: "world_sword_abyss_witness",
    submitNpcId: "world_sword_void_river_witness",
    encounterId: "sword_world_void_river_oath",
  },
  {
    routeLabel: "萬獸山莊",
    profession: ProfessionType.Body,
    task04QuestId: "sect_beast_task_04",
    worldQuestId: "sect_beast_world_chapter_01",
    giverNpcId: "world_beast_battlefield_envoy",
    abyssNpcId: "world_beast_abyss_witness",
    submitNpcId: "world_beast_void_river_witness",
    encounterId: "beast_world_void_river_oath",
  },
  {
    routeLabel: "縹緲仙宮",
    profession: ProfessionType.Mage,
    task04QuestId: "sect_mystic_task_04",
    worldQuestId: "sect_mystic_world_chapter_01",
    giverNpcId: "world_mystic_battlefield_envoy",
    abyssNpcId: "world_mystic_abyss_witness",
    submitNpcId: "world_mystic_void_river_witness",
    encounterId: "mystic_world_void_river_oath",
  },
] as const;

const mapById = (mapId: string) => MAPS.find((map) => map.id === mapId);
const npcById = (npcId: string) => WORLD_STORY_NPCS.find((npc) => npc.id === npcId);
const eventCueLabels = (event: EncounterEvent) =>
  event.choices.flatMap((choice) => choice.cue?.tags?.map((tag) => tag.label) ?? []);

describe("sect world story branches", () => {
  it("adds route-specific post-task_04 quests that bridge maps 120, 121, and 130", () => {
    WORLD_STORY_BRANCH_CASES.forEach((testCase) => {
      const quest = QUESTS[testCase.worldQuestId];

      expect(quest, `${testCase.worldQuestId} should exist`).toBeDefined();
      expect(quest.prerequisiteQuestId).toBe(testCase.task04QuestId);
      expect(quest.giverId).toBe(testCase.giverNpcId);
      expect(quest.submitNpcId).toBe(testCase.submitNpcId);
      expect(quest.requirements).toContainEqual({
        type: "level",
        minRealm: MajorRealm.SpiritSevering,
      });
      expect(quest.requirements).toContainEqual({
        type: "dialogue",
        targetNpcId: testCase.submitNpcId,
      });

      const questText = [
        quest.title,
        quest.description,
        ...quest.dialogue.start,
        ...quest.dialogue.progress,
        ...quest.dialogue.complete,
      ].join("\n");

      expect(questText).toContain("三界戰場");
      expect(questText).toContain("隕仙深淵");
      expect(questText).toMatch(/時光長河|煉虛|130/);
      expect(questText).toContain(testCase.routeLabel);
    });
  });

  it("places discoverable NPC hooks on the representative late world maps", () => {
    const battlefield = mapById("120");
    const abyss = mapById("121");
    const voidRiver = mapById("130");

    WORLD_STORY_BRANCH_CASES.forEach((testCase) => {
      expect(battlefield?.npcs.map((npc) => npc.id)).toContain(testCase.giverNpcId);
      expect(abyss?.npcs.map((npc) => npc.id)).toContain(testCase.abyssNpcId);
      expect(voidRiver?.npcs.map((npc) => npc.id)).toContain(testCase.submitNpcId);

      expect(npcById(testCase.giverNpcId)?.questIds).toEqual([testCase.worldQuestId]);
      expect((npcById(testCase.giverNpcId)?.dialogue ?? []).join("\n")).toContain("120");
      expect((npcById(testCase.abyssNpcId)?.dialogue ?? []).join("\n")).toContain("121");
      expect((npcById(testCase.submitNpcId)?.dialogue ?? []).join("\n")).toMatch(
        /130|煉虛|時光長河/
      );
    });
  });

  it("keeps the story milestone encounters route-aware and gated by the new world quests", () => {
    WORLD_STORY_BRANCH_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.encounterId];

      expect(event, `${testCase.encounterId} should exist`).toBeDefined();
      expect(event.minRealm).toBe(MajorRealm.VoidRefining);
      expect(event.maxRealm).toBe(MajorRealm.VoidRefining);
      expect(event.selector?.repeatPolicy).toBe("once_per_run");
      expect(event.selector?.eligibleProfessions).toEqual([testCase.profession]);
      expect(event.selector?.requiredCompletedQuestIds).toEqual([testCase.worldQuestId]);
      expect(event.presentation?.routeLabel).toBe(testCase.routeLabel);
      expect(event.presentation?.categoryLabel).toContain("世界章節");
      expect(eventCueLabels(event).join("\n")).toContain(testCase.routeLabel);

      const matchingContext = {
        majorRealm: MajorRealm.VoidRefining,
        profession: testCase.profession,
        completedQuestIds: [testCase.worldQuestId],
        resolvedEventIds: [],
      };

      expect(
        getAvailableEncounterEvents(matchingContext).some(
          (availableEvent) => availableEvent.id === testCase.encounterId
        )
      ).toBe(true);
      expect(
        getAvailableEncounterEvents({ ...matchingContext, completedQuestIds: [] }).some(
          (availableEvent) => availableEvent.id === testCase.encounterId
        )
      ).toBe(false);
    });
  });
});
