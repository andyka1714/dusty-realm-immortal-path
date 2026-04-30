import { describe, expect, it } from "vitest";
import {
  getAssetDefinition,
  getAssetFrameFileUrls,
} from "../data/assets/assetRegistry";
import {
  BEAST_SECT_NPCS,
  MYSTIC_SECT_NPCS,
  SWORD_SECT_NPCS,
  VILLAGE_NPCS,
  WORLD_STORY_NPCS,
} from "../data/npcs";
import {
  listNpcSpriteMappings,
  resolveNpcSpriteAssetId,
} from "./npcSpriteAsset";

const npcCatalog = [
  ...VILLAGE_NPCS,
  ...SWORD_SECT_NPCS,
  ...BEAST_SECT_NPCS,
  ...MYSTIC_SECT_NPCS,
  ...WORLD_STORY_NPCS,
];

const expectedFrameUrls = (basePath: string): string[] => [
  `${basePath}/frames/npc_idle-1.png`,
  `${basePath}/frames/npc_idle-2.png`,
  `${basePath}/frames/npc_idle-3.png`,
  `${basePath}/frames/npc_idle-4.png`,
];

describe("npcSpriteAsset", () => {
  it("keeps every generated NPC idle mapping backed by a QC-passed asset", () => {
    listNpcSpriteMappings().forEach((mapping) => {
      const asset = getAssetDefinition(mapping.assetId);

      expect(asset.assetId).toBe(mapping.assetId);
      expect(asset.kind).toBe("npc");
      expect(asset.usage).toContain("npc_idle");
      expect(asset.files.sheet).toBe("sheet-transparent.png");
      expect(asset.files.framesDir).toBe("frames");
      expect(asset.files.framePrefix).toBe("npc_idle");
      expect(asset.sprite).toMatchObject({
        profile: "humanoid",
        rows: 2,
        cols: 2,
        frameCount: 4,
        frameWidth: 96,
        frameHeight: 96,
        footlineY: 88,
        centerX: 48,
        centerTolerance: 1,
        qcStatus: "passed",
      });
      expect(getAssetFrameFileUrls(asset.assetId)).toEqual(
        expectedFrameUrls(asset.basePath)
      );
    });
  });

  it("resolves every NPC with sprite identity through explicit mappings", () => {
    const wiredNpcs = npcCatalog.filter(
      (npc) => npc.spriteArchetype && npc.spriteVariant
    );

    expect(wiredNpcs.length).toBeGreaterThan(0);

    wiredNpcs.forEach((npc) => {
      const assetId = resolveNpcSpriteAssetId(npc);

      expect(assetId, npc.id).toBeTruthy();
      expect(getAssetDefinition(assetId!).kind, npc.id).toBe("npc");
    });
  });
});
