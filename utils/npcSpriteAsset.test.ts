import { describe, expect, it } from "vitest";
import { getAssetDefinition, getAssetFrameFileUrls } from "../data/assets/assetRegistry";
import {
  BEAST_SECT_NPCS,
  MYSTIC_SECT_NPCS,
  SWORD_SECT_NPCS,
  VILLAGE_NPCS,
} from "../data/npcs";
import {
  listNpcSpriteMappings,
  resolveNpcSpriteAssetId,
} from "./npcSpriteAsset";

describe("npcSpriteAsset", () => {
  it("resolves the generated and QC-passed idle sheet for Lin Shouzhuo", () => {
    const elder = VILLAGE_NPCS.find((npc) => npc.id === "village_chief");

    expect(elder).toBeTruthy();
    expect(resolveNpcSpriteAssetId(elder!)).toBe(
      "npc.town_elder.village.idle_v1"
    );

    const asset = getAssetDefinition("npc.town_elder.village.idle_v1");

    expect(asset.kind).toBe("npc");
    expect(asset.usage).toContain("npc_idle");
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
      "/assets/generated/characters/npcs/town-elder-village-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/town-elder-village-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/town-elder-village-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/town-elder-village-idle-v1/frames/npc_idle-4.png",
    ]);
  });

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

  it("resolves the generated and QC-passed idle sheet for Zhang Tieshan", () => {
    const blacksmith = VILLAGE_NPCS.find((npc) => npc.id === "village_blacksmith");

    expect(blacksmith).toBeTruthy();
    expect(resolveNpcSpriteAssetId(blacksmith!)).toBe(
      "npc.lingbao_forgemaster.village_blacksmith.idle_v1"
    );

    const asset = getAssetDefinition(
      "npc.lingbao_forgemaster.village_blacksmith.idle_v1"
    );

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
      "/assets/generated/characters/npcs/lingbao-forgemaster-village-blacksmith-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-village-blacksmith-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-village-blacksmith-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-village-blacksmith-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Lu Jiansheng", () => {
    const keeper = VILLAGE_NPCS.find(
      (npc) => npc.id === "village_scripture_keeper"
    );

    expect(keeper).toBeTruthy();
    expect(resolveNpcSpriteAssetId(keeper!)).toBe(
      "npc.scripture_keeper.village.idle_v1"
    );

    const asset = getAssetDefinition("npc.scripture_keeper.village.idle_v1");

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
      "/assets/generated/characters/npcs/scripture-keeper-village-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/scripture-keeper-village-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/scripture-keeper-village-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/scripture-keeper-village-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Xiao Changfeng", () => {
    const elder = SWORD_SECT_NPCS.find((npc) => npc.id === "sect_sword_elder");

    expect(elder).toBeTruthy();
    expect(resolveNpcSpriteAssetId(elder!)).toBe("npc.sect_elder.sword.idle_v1");

    const asset = getAssetDefinition("npc.sect_elder.sword.idle_v1");

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
      "/assets/generated/characters/npcs/sect-elder-sword-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/sect-elder-sword-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/sect-elder-sword-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/sect-elder-sword-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Gu Xunyue", () => {
    const officer = SWORD_SECT_NPCS.find(
      (npc) => npc.id === "sect_sword_patrol_captain"
    );

    expect(officer).toBeTruthy();
    expect(resolveNpcSpriteAssetId(officer!)).toBe(
      "npc.sect_field_officer.sword.idle_v1"
    );

    const asset = getAssetDefinition("npc.sect_field_officer.sword.idle_v1");

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
      "/assets/generated/characters/npcs/sect-field-officer-sword-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/sect-field-officer-sword-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/sect-field-officer-sword-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/sect-field-officer-sword-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Han Yunshang", () => {
    const shopkeeper = SWORD_SECT_NPCS.find(
      (npc) => npc.id === "sect_sword_wanbao"
    );

    expect(shopkeeper).toBeTruthy();
    expect(resolveNpcSpriteAssetId(shopkeeper!)).toBe(
      "npc.wanbao_clerk.sword.idle_v1"
    );

    const asset = getAssetDefinition("npc.wanbao_clerk.sword.idle_v1");

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
      "/assets/generated/characters/npcs/wanbao-clerk-sword-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/wanbao-clerk-sword-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/wanbao-clerk-sword-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/wanbao-clerk-sword-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Shen Jianlu", () => {
    const forgemaster = SWORD_SECT_NPCS.find(
      (npc) => npc.id === "sect_sword_lingbao"
    );

    expect(forgemaster).toBeTruthy();
    expect(resolveNpcSpriteAssetId(forgemaster!)).toBe(
      "npc.lingbao_forgemaster.sword.idle_v1"
    );

    const asset = getAssetDefinition("npc.lingbao_forgemaster.sword.idle_v1");

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
      "/assets/generated/characters/npcs/lingbao-forgemaster-sword-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-sword-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-sword-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-sword-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Bai Jian", () => {
    const keeper = SWORD_SECT_NPCS.find((npc) => npc.id === "sect_sword_skills");

    expect(keeper).toBeTruthy();
    expect(resolveNpcSpriteAssetId(keeper!)).toBe(
      "npc.scripture_keeper.sword.idle_v1"
    );

    const asset = getAssetDefinition("npc.scripture_keeper.sword.idle_v1");

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
      "/assets/generated/characters/npcs/scripture-keeper-sword-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/scripture-keeper-sword-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/scripture-keeper-sword-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/scripture-keeper-sword-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Canggu Elder", () => {
    const elder = BEAST_SECT_NPCS.find((npc) => npc.id === "sect_beast_elder");

    expect(elder).toBeTruthy();
    expect(resolveNpcSpriteAssetId(elder!)).toBe("npc.sect_elder.beast.idle_v1");

    const asset = getAssetDefinition("npc.sect_elder.beast.idle_v1");

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
      "/assets/generated/characters/npcs/sect-elder-beast-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/sect-elder-beast-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/sect-elder-beast-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/sect-elder-beast-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Li Liechuan", () => {
    const huntmaster = BEAST_SECT_NPCS.find(
      (npc) => npc.id === "sect_beast_huntmaster"
    );

    expect(huntmaster).toBeTruthy();
    expect(resolveNpcSpriteAssetId(huntmaster!)).toBe(
      "npc.sect_field_officer.beast.idle_v1"
    );

    const asset = getAssetDefinition("npc.sect_field_officer.beast.idle_v1");

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
      "/assets/generated/characters/npcs/sect-field-officer-beast-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/sect-field-officer-beast-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/sect-field-officer-beast-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/sect-field-officer-beast-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Zhu Liaoshang", () => {
    const shopkeeper = BEAST_SECT_NPCS.find(
      (npc) => npc.id === "sect_beast_wanbao"
    );

    expect(shopkeeper).toBeTruthy();
    expect(resolveNpcSpriteAssetId(shopkeeper!)).toBe(
      "npc.wanbao_clerk.beast.idle_v1"
    );

    const asset = getAssetDefinition("npc.wanbao_clerk.beast.idle_v1");

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
      "/assets/generated/characters/npcs/wanbao-clerk-beast-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/wanbao-clerk-beast-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/wanbao-clerk-beast-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/wanbao-clerk-beast-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Tieguguang", () => {
    const forgemaster = BEAST_SECT_NPCS.find(
      (npc) => npc.id === "sect_beast_lingbao"
    );

    expect(forgemaster).toBeTruthy();
    expect(resolveNpcSpriteAssetId(forgemaster!)).toBe(
      "npc.lingbao_forgemaster.beast.idle_v1"
    );

    const asset = getAssetDefinition("npc.lingbao_forgemaster.beast.idle_v1");

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
      "/assets/generated/characters/npcs/lingbao-forgemaster-beast-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-beast-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-beast-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/lingbao-forgemaster-beast-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Xuanggu Jishu", () => {
    const keeper = BEAST_SECT_NPCS.find((npc) => npc.id === "sect_beast_skills");

    expect(keeper).toBeTruthy();
    expect(resolveNpcSpriteAssetId(keeper!)).toBe(
      "npc.scripture_keeper.beast.idle_v1"
    );

    const asset = getAssetDefinition("npc.scripture_keeper.beast.idle_v1");

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
      "/assets/generated/characters/npcs/scripture-keeper-beast-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/scripture-keeper-beast-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/scripture-keeper-beast-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/scripture-keeper-beast-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Lingwei Elder", () => {
    const elder = MYSTIC_SECT_NPCS.find((npc) => npc.id === "sect_mystic_elder");

    expect(elder).toBeTruthy();
    expect(resolveNpcSpriteAssetId(elder!)).toBe("npc.sect_elder.mystic.idle_v1");

    const asset = getAssetDefinition("npc.sect_elder.mystic.idle_v1");

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
      "/assets/generated/characters/npcs/sect-elder-mystic-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/sect-elder-mystic-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/sect-elder-mystic-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/sect-elder-mystic-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("resolves the generated and QC-passed idle sheet for Tao Xingshi", () => {
    const envoy = MYSTIC_SECT_NPCS.find((npc) => npc.id === "sect_mystic_envoy");

    expect(envoy).toBeTruthy();
    expect(resolveNpcSpriteAssetId(envoy!)).toBe(
      "npc.sect_field_officer.mystic.idle_v1"
    );

    const asset = getAssetDefinition("npc.sect_field_officer.mystic.idle_v1");

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
      "/assets/generated/characters/npcs/sect-field-officer-mystic-idle-v1/frames/npc_idle-1.png",
      "/assets/generated/characters/npcs/sect-field-officer-mystic-idle-v1/frames/npc_idle-2.png",
      "/assets/generated/characters/npcs/sect-field-officer-mystic-idle-v1/frames/npc_idle-3.png",
      "/assets/generated/characters/npcs/sect-field-officer-mystic-idle-v1/frames/npc_idle-4.png",
    ]);
  });

  it("keeps generated NPC idle assets wired through explicit mappings", () => {
    expect(listNpcSpriteMappings()).toEqual([
      {
        archetype: "town_elder",
        variant: "village",
        assetId: "npc.town_elder.village.idle_v1",
      },
      {
        archetype: "wanbao_clerk",
        variant: "village",
        assetId: "npc.wanbao_clerk.village.idle_v1",
      },
      {
        archetype: "lingbao_forgemaster",
        variant: "village_blacksmith",
        assetId: "npc.lingbao_forgemaster.village_blacksmith.idle_v1",
      },
      {
        archetype: "scripture_keeper",
        variant: "village",
        assetId: "npc.scripture_keeper.village.idle_v1",
      },
      {
        archetype: "sect_elder",
        variant: "sword",
        assetId: "npc.sect_elder.sword.idle_v1",
      },
      {
        archetype: "sect_field_officer",
        variant: "sword",
        assetId: "npc.sect_field_officer.sword.idle_v1",
      },
      {
        archetype: "wanbao_clerk",
        variant: "sword",
        assetId: "npc.wanbao_clerk.sword.idle_v1",
      },
      {
        archetype: "lingbao_forgemaster",
        variant: "sword",
        assetId: "npc.lingbao_forgemaster.sword.idle_v1",
      },
      {
        archetype: "scripture_keeper",
        variant: "sword",
        assetId: "npc.scripture_keeper.sword.idle_v1",
      },
      {
        archetype: "sect_elder",
        variant: "beast",
        assetId: "npc.sect_elder.beast.idle_v1",
      },
      {
        archetype: "sect_field_officer",
        variant: "beast",
        assetId: "npc.sect_field_officer.beast.idle_v1",
      },
      {
        archetype: "wanbao_clerk",
        variant: "beast",
        assetId: "npc.wanbao_clerk.beast.idle_v1",
      },
      {
        archetype: "lingbao_forgemaster",
        variant: "beast",
        assetId: "npc.lingbao_forgemaster.beast.idle_v1",
      },
      {
        archetype: "scripture_keeper",
        variant: "beast",
        assetId: "npc.scripture_keeper.beast.idle_v1",
      },
      {
        archetype: "sect_elder",
        variant: "mystic",
        assetId: "npc.sect_elder.mystic.idle_v1",
      },
      {
        archetype: "sect_field_officer",
        variant: "mystic",
        assetId: "npc.sect_field_officer.mystic.idle_v1",
      },
    ]);
  });
});
