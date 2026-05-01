import { describe, expect, it } from "vitest";
import {
  BEAST_SECT_NPCS,
  MYSTIC_SECT_NPCS,
  SWORD_SECT_NPCS,
  VILLAGE_NPCS,
  WORLD_STORY_NPCS,
} from "./npcs";

const firstPhaseNpcs = [
  ...VILLAGE_NPCS,
  ...SWORD_SECT_NPCS,
  ...BEAST_SECT_NPCS,
  ...MYSTIC_SECT_NPCS,
];

describe("NPC identity metadata", () => {
  it("gives first-phase NPCs personal names, affiliations, roles, and sprite variants", () => {
    expect(firstPhaseNpcs).toHaveLength(19);

    firstPhaseNpcs.forEach((npc) => {
      expect(npc.name).not.toMatch(/^(萬寶閣|靈寶閣|藏經閣)$/);
      expect(npc.affiliationLabel).toBeTruthy();
      expect(npc.roleLabel).toBeTruthy();
      expect(npc.spriteArchetype).toBeTruthy();
      expect(npc.spriteVariant).toBeTruthy();
    });
  });

  it("keeps institution labels separate from personal names", () => {
    expect(VILLAGE_NPCS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "village_wanbao",
          name: "王掌櫃",
          affiliationLabel: "萬寶閣",
          roleLabel: "掌櫃",
          spriteArchetype: "wanbao_clerk",
          spriteVariant: "village",
        }),
        expect.objectContaining({
          id: "village_scripture_keeper",
          name: "陸簡生",
          affiliationLabel: "藏經閣",
          roleLabel: "入門藏書執事",
          spriteArchetype: "scripture_keeper",
          spriteVariant: "village",
        }),
      ])
    );
  });

  it("gives every world-story NPC identity labels and sprite variants", () => {
    expect(WORLD_STORY_NPCS).toHaveLength(34);

    WORLD_STORY_NPCS.forEach((npc) => {
      expect(npc.affiliationLabel, npc.id).toBeTruthy();
      expect(npc.roleLabel, npc.id).toBeTruthy();
      expect(npc.spriteArchetype, npc.id).toBeTruthy();
      expect(npc.spriteVariant, npc.id).toBeTruthy();
    });
  });
});
