import { describe, expect, it } from "vitest";
import { NPCType } from "../types";
import { MAPS } from "./maps";
import { WORLD_STORY_NPCS } from "./npcs";
import { QUESTS } from "./quests";

const MAP_LOCAL_CONTENT_CASES = [
  {
    mapId: "160",
    mapName: "劫雲荒原",
    localNpcId: "local_tribulation_cloud_scout",
    localQuestId: "local_tribulation_cloud_watch",
    routeNpcIds: [
      "world_sword_tribulation_envoy",
      "world_beast_tribulation_envoy",
      "world_mystic_tribulation_envoy",
    ],
    materialNpcId: "local_tribulation_material_diviner",
    materialQuestId: "local_tribulation_material_clue",
    expectedClues: ["凌霄劍星鋼", "萬獸血骨殘材", "縹緲星魂蓮", "Workshop"],
  },
  {
    mapId: "170",
    mapName: "接引仙殿",
    localNpcId: "local_immortal_registry_keeper",
    localQuestId: "local_immortal_registry_check",
    routeNpcIds: [
      "world_sword_immortal_witness",
      "world_beast_immortal_witness",
      "world_mystic_immortal_witness",
    ],
    materialNpcId: "local_immortal_material_archivist",
    materialQuestId: "local_immortal_material_clue",
    expectedClues: ["帝劍", "帝血", "星詔", "高階丹方", "帝兵"],
  },
  {
    mapId: "182",
    mapName: "歸墟裂界",
    localNpcId: "local_guixu_rift_cartographer",
    localQuestId: "local_guixu_rift_chart",
    routeNpcIds: [
      "local_guixu_sword_echo",
      "local_guixu_beast_echo",
      "local_guixu_mystic_echo",
    ],
    materialNpcId: "local_guixu_material_forgemaster",
    materialQuestId: "local_guixu_material_clue",
    expectedClues: ["凌霄劍星鋼", "萬獸血骨殘材", "縹緲星魂蓮", "終盤"],
  },
] as const;

const mapById = (mapId: string) => MAPS.find((map) => map.id === mapId);
const npcById = (npcId: string) => WORLD_STORY_NPCS.find((npc) => npc.id === npcId);
const questText = (questId: string) => {
  const quest = QUESTS[questId];

  return [
    quest?.title,
    quest?.description,
    ...(quest?.dialogue.start ?? []),
    ...(quest?.dialogue.progress ?? []),
    ...(quest?.dialogue.complete ?? []),
  ].join("\n");
};

describe("map local content density", () => {
  it("adds local, route-sensitive, and workshop material clues to late representative maps", () => {
    MAP_LOCAL_CONTENT_CASES.forEach((testCase) => {
      const map = mapById(testCase.mapId);
      const mapNpcIds = map?.npcs.map((npc) => npc.id) ?? [];

      expect(map, `${testCase.mapName} should exist`).toBeDefined();
      expect(mapNpcIds).toContain(testCase.localNpcId);
      expect(mapNpcIds).toContain(testCase.materialNpcId);
      testCase.routeNpcIds.forEach((npcId) => {
        expect(mapNpcIds).toContain(npcId);
      });

      expect(npcById(testCase.localNpcId)?.type).toBe(NPCType.Quest);
      expect(npcById(testCase.localNpcId)?.questIds).toContain(testCase.localQuestId);
      expect(npcById(testCase.materialNpcId)?.questIds).toContain(testCase.materialQuestId);
      expect(npcById(testCase.materialNpcId)?.description).toMatch(/材料|工坊|Workshop|器方|丹方/);
    });
  });

  it("keeps map-local quests dialogue-only and anchored to valid NPCs", () => {
    MAP_LOCAL_CONTENT_CASES.forEach((testCase) => {
      [testCase.localQuestId, testCase.materialQuestId].forEach((questId) => {
        const quest = QUESTS[questId];

        expect(quest, `${questId} should exist`).toBeDefined();
        expect(npcById(quest.giverId), `${quest.giverId} should exist`).toBeDefined();
        expect(npcById(quest.submitNpcId ?? quest.giverId)).toBeDefined();
        expect(quest.requirements).toEqual([
          { type: "dialogue", targetNpcId: quest.submitNpcId ?? quest.giverId },
        ]);
        expect(quest.rewards.some((reward) => reward.exp || reward.spiritStones)).toBe(true);
      });
    });
  });

  it("ties local clue text back to map names, routes, and workshop material sources", () => {
    MAP_LOCAL_CONTENT_CASES.forEach((testCase) => {
      const combinedText = [
        npcById(testCase.localNpcId)?.description,
        npcById(testCase.materialNpcId)?.description,
        questText(testCase.localQuestId),
        questText(testCase.materialQuestId),
      ].join("\n");

      expect(combinedText).toContain(testCase.mapName);
      expect(combinedText).toMatch(/凌霄劍宗|萬獸山莊|縹緲仙宮|route|宗門/);
      testCase.expectedClues.forEach((clue) => {
        expect(combinedText).toContain(clue);
      });
    });
  });
});
