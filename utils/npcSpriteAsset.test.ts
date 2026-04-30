import { describe, expect, it } from "vitest";
import { getAssetDefinition, getAssetFrameFileUrls } from "../data/assets/assetRegistry";
import { VILLAGE_NPCS } from "../data/npcs";
import {
  listNpcSpriteMappings,
  resolveNpcSpriteAssetId,
} from "./npcSpriteAsset";

describe("npcSpriteAsset", () => {
  it("resolves the generated and QC-passed idle sheet for Wang Zhanggui", () => {
    const wang = VILLAGE_NPCS.find((npc) => npc.id === "village_wanbao");

    expect(wang).toBeTruthy();
    expect(resolveNpcSpriteAssetId(wang!)).toBe(
      "npc.wanbao_clerk.village.idle_v1"
    );

    const asset = getAssetDefinition("npc.wanbao_clerk.village.idle_v1");

    expect(asset.kind).toBe("npc");
    expect(asset.usage).toContain("npc_idle");
    expect(asset.files.sheet).toBe("sheet-transparent.png");
    expect(asset.files.framesDir).toBe("frames");
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
    expect(getAssetFrameFileUrls(asset.assetId)).toEqual([
      "/assets/generated/characters/npcs/wanbao-clerk-village-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/wanbao-clerk-village-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/wanbao-clerk-village-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/wanbao-clerk-village-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("keeps generated NPC idle assets wired through explicit mappings", () => {
    expect(listNpcSpriteMappings()).toEqual([
      {
        archetype: "wanbao_clerk",
        variant: "village",
        assetId: "npc.wanbao_clerk.village.idle_v1",
      },
    ]);
  });
});
