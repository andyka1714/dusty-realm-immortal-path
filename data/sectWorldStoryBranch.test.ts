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

const WORLD_STORY_CHAPTER_V2_CASES = [
  {
    routeLabel: "凌霄劍宗",
    otherRouteLabels: ["萬獸山莊", "縹緲仙宮"],
    priorQuestId: "sect_sword_world_chapter_01",
    worldQuestId: "sect_sword_world_chapter_02",
    giverNpcId: "world_sword_sacred_city_envoy",
    submitNpcId: "world_sword_endless_sea_witness",
    profession: ProfessionType.Sword,
    encounterId: "sword_world_endless_sea_oath",
    rewardItemId: "sword_path_starsteel",
    memoryTag: "sect:sword:world-chapter-02",
  },
  {
    routeLabel: "萬獸山莊",
    otherRouteLabels: ["凌霄劍宗", "縹緲仙宮"],
    priorQuestId: "sect_beast_world_chapter_01",
    worldQuestId: "sect_beast_world_chapter_02",
    giverNpcId: "world_beast_sacred_city_envoy",
    submitNpcId: "world_beast_endless_sea_witness",
    profession: ProfessionType.Body,
    encounterId: "beast_world_endless_sea_oath",
    rewardItemId: "beast_path_bloodbone",
    memoryTag: "sect:beast:world-chapter-02",
  },
  {
    routeLabel: "縹緲仙宮",
    otherRouteLabels: ["凌霄劍宗", "萬獸山莊"],
    priorQuestId: "sect_mystic_world_chapter_01",
    worldQuestId: "sect_mystic_world_chapter_02",
    giverNpcId: "world_mystic_sacred_city_envoy",
    submitNpcId: "world_mystic_endless_sea_witness",
    profession: ProfessionType.Mage,
    encounterId: "mystic_world_endless_sea_oath",
    rewardItemId: "mystic_path_starlotus",
    memoryTag: "sect:mystic:world-chapter-02",
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

  it("extends each sect world route with a 140 to 150 chapter that keeps route text and rewards separated", () => {
    WORLD_STORY_CHAPTER_V2_CASES.forEach((testCase) => {
      const quest = QUESTS[testCase.worldQuestId];

      expect(quest, `${testCase.worldQuestId} should exist`).toBeDefined();
      expect(quest.prerequisiteQuestId).toBe(testCase.priorQuestId);
      expect(quest.giverId).toBe(testCase.giverNpcId);
      expect(quest.submitNpcId).toBe(testCase.submitNpcId);
      expect(quest.requirements).toContainEqual({
        type: "level",
        minRealm: MajorRealm.Fusion,
      });
      expect(quest.requirements).toContainEqual({
        type: "dialogue",
        targetNpcId: testCase.submitNpcId,
      });
      expect(quest.rewards).toContainEqual({
        items: [{ itemId: testCase.rewardItemId, count: 2 }],
      });
      expect(quest.rewards.some((reward) => reward.exp && reward.spiritStones)).toBe(true);

      const questText = [
        quest.title,
        quest.description,
        ...quest.dialogue.start,
        ...quest.dialogue.progress,
        ...quest.dialogue.complete,
      ].join("\n");

      expect(questText).toContain("萬法聖城");
      expect(questText).toContain("140");
      expect(questText).toContain("無盡海");
      expect(questText).toContain("150");
      expect(questText).toContain("後段世界章節");
      expect(questText).toContain(testCase.routeLabel);
      testCase.otherRouteLabels.forEach((otherRouteLabel) => {
        expect(questText).not.toContain(otherRouteLabel);
      });
    });
  });

  it("places chapter v2 giver and submit NPCs on maps 140 and 150", () => {
    const sacredCity = mapById("140");
    const endlessSea = mapById("150");

    WORLD_STORY_CHAPTER_V2_CASES.forEach((testCase) => {
      expect(sacredCity?.npcs.map((npc) => npc.id)).toContain(testCase.giverNpcId);
      expect(endlessSea?.npcs.map((npc) => npc.id)).toContain(testCase.submitNpcId);

      expect(npcById(testCase.giverNpcId)?.questIds).toEqual([testCase.worldQuestId]);
      expect(npcById(testCase.submitNpcId)?.type).toBeDefined();
      expect((npcById(testCase.giverNpcId)?.dialogue ?? []).join("\n")).toMatch(
        /萬法聖城|140/
      );
      expect((npcById(testCase.submitNpcId)?.dialogue ?? []).join("\n")).toMatch(
        /無盡海|150/
      );
      expect((npcById(testCase.giverNpcId)?.dialogue ?? []).join("\n")).toContain(
        testCase.routeLabel
      );
      expect((npcById(testCase.submitNpcId)?.dialogue ?? []).join("\n")).toContain(
        testCase.routeLabel
      );
    });
  });

  it("adds chapter v2 once-per-run milestone encounters with route cue and world memory output", () => {
    WORLD_STORY_CHAPTER_V2_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.encounterId];

      expect(event, `${testCase.encounterId} should exist`).toBeDefined();
      expect(event.minRealm).toBe(MajorRealm.Fusion);
      expect(event.maxRealm).toBe(MajorRealm.Fusion);
      expect(event.selector?.repeatPolicy).toBe("once_per_run");
      expect(event.selector?.eligibleProfessions).toEqual([testCase.profession]);
      expect(event.selector?.requiredCompletedQuestIds).toEqual([testCase.worldQuestId]);
      expect(event.presentation?.routeLabel).toBe(testCase.routeLabel);
      expect(event.presentation?.categoryLabel).toContain("後段世界章節");
      expect(event.presentation?.chainLabel).toBeTruthy();
      expect(event.presentation?.memoryCue).toContain("無盡海");
      expect(event.chain?.step).toBe(2);
      expect(event.chain?.worldMemoryTags).toContain(testCase.memoryTag);
      expect(eventCueLabels(event).join("\n")).toContain(testCase.routeLabel);
      expect(eventCueLabels(event).join("\n")).toContain(
        testCase.rewardItemId === "sword_path_starsteel"
          ? "凌霄劍星鋼 x1"
          : testCase.rewardItemId === "beast_path_bloodbone"
            ? "萬獸血骨殘材 x1"
            : "縹緲星魂蓮 x1"
      );

      const matchingContext = {
        majorRealm: MajorRealm.Fusion,
        profession: testCase.profession,
        completedQuestIds: [testCase.worldQuestId],
        resolvedEventIds: [],
      };
      const wrongProfessionContext = {
        ...matchingContext,
        profession:
          testCase.profession === ProfessionType.Sword
            ? ProfessionType.Body
            : ProfessionType.Sword,
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
      expect(
        getAvailableEncounterEvents({
          ...matchingContext,
          resolvedEventIds: [testCase.encounterId],
        }).some((availableEvent) => availableEvent.id === testCase.encounterId)
      ).toBe(false);
      expect(
        getAvailableEncounterEvents(wrongProfessionContext).some(
          (availableEvent) => availableEvent.id === testCase.encounterId
        )
      ).toBe(false);
    });
  });
});
