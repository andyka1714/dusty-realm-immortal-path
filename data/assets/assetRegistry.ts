import type { AssetDefinition, GeneratedAssetFiles } from "./types";
import {
  HUMANOID_COMBAT_SPRITE_STANDARD,
  HUMANOID_WALK_SPRITE_STANDARD,
} from "../../utils/humanoidSpriteStandard";

export const FALLBACK_ASSET_ID = "ui.fallback.transparent.v1";

const assetDefinitions: Record<string, AssetDefinition> = {
  [FALLBACK_ASSET_ID]: {
    assetId: FALLBACK_ASSET_ID,
    kind: "ui",
    name: "透明備用素材",
    description: "素材缺失時使用的透明 fallback，避免介面崩潰。",
    style: "project_native",
    source: "placeholder",
    version: 1,
    usage: ["fallback"],
    basePath: "/assets/generated/ui/fallback",
    files: {
      preview: "transparent.png",
      transparent: "transparent.png",
    },
    tags: ["fallback", "transparent"],
  },
  "character.player.mortal_male.v1": {
    assetId: "character.player.mortal_male.v1",
    kind: "character",
    name: "男性凡人主角",
    description: "初入仙途的男性凡人主角，行走時木劍背於身後，供地圖角色行走與後續角色外觀演進使用。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["player_walk", "map_token"],
    basePath: "/assets/generated/characters/player/mortal-male-v1",
    files: {
      raw: "raw-sheet.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      ...HUMANOID_WALK_SPRITE_STANDARD,
      rows: 4,
      cols: 4,
      frameCount: 16,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    },
    tags: ["player", "mortal", "male", "wooden-sword", "walk-sheet"],
  },
  "character.player.mortal_female.v1": {
    assetId: "character.player.mortal_female.v1",
    kind: "character",
    name: "女性凡人主角",
    description: "初入仙途的女性凡人主角，行走時木劍背於身後，供地圖角色行走與後續角色外觀演進使用。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["player_walk", "map_token"],
    basePath: "/assets/generated/characters/player/mortal-female-v1",
    files: {
      raw: "raw-sheet.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      ...HUMANOID_WALK_SPRITE_STANDARD,
      rows: 4,
      cols: 4,
      frameCount: 16,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    },
    tags: ["player", "mortal", "female", "wooden-sword", "walk-sheet"],
  },
  "character.player.mortal_male.combat_v1": {
    assetId: "character.player.mortal_male.combat_v1",
    kind: "character",
    name: "男性凡人木劍戰鬥動作",
    description: "男性凡人主角進入戰鬥時使用的四方向 4x6 木劍攻擊動作 sheet。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["player_combat_idle", "player_combat_attack", "map_token"],
    basePath: "/assets/generated/characters/player/mortal-male-combat-v1",
    files: {
      raw: "raw-combat.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      ...HUMANOID_COMBAT_SPRITE_STANDARD,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    },
    tags: ["player", "mortal", "male", "wooden-sword", "combat-sheet"],
  },
  "character.player.mortal_female.combat_v1": {
    assetId: "character.player.mortal_female.combat_v1",
    kind: "character",
    name: "女性凡人木劍戰鬥動作",
    description: "女性凡人主角進入戰鬥時使用的四方向 4x6 木劍攻擊動作 sheet。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["player_combat_idle", "player_combat_attack", "map_token"],
    basePath: "/assets/generated/characters/player/mortal-female-combat-v1",
    files: {
      raw: "raw-combat.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      ...HUMANOID_COMBAT_SPRITE_STANDARD,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    },
    tags: ["player", "mortal", "female", "wooden-sword", "combat-sheet"],
  },
  "npc.town_elder.village.idle_v1": {
    assetId: "npc.town_elder.village.idle_v1",
    kind: "npc",
    name: "村中長老原地待機",
    description: "林守拙的 2x2 原地待機 sheet，供仙緣鎮村中長老 NPC map token 使用。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["npc_idle", "map_token"],
    basePath: "/assets/generated/characters/npcs/town-elder-village-idle-v1",
    files: {
      raw: "raw-sheet.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      framePrefix: "npc_idle",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      profile: "humanoid",
      rows: 2,
      cols: 2,
      frameCount: 4,
      anchor: "feet",
      view: "topdown",
      frameWidth: 96,
      frameHeight: 96,
      targetHeight: 80,
      heightTolerance: 1,
      footlineY: 88,
      centerX: 48,
      centerTolerance: 1,
      idleCadenceMs: 800,
      qcStatus: "passed",
    },
    tags: ["npc", "idle-sheet", "town-elder", "village"],
  },
  "npc.wanbao_clerk.village.idle_v1": {
    assetId: "npc.wanbao_clerk.village.idle_v1",
    kind: "npc",
    name: "仙緣鎮萬寶閣掌櫃原地待機",
    description: "王掌櫃的 2x2 原地待機 sheet，供仙緣鎮萬寶閣 NPC map token 使用。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["npc_idle", "map_token"],
    basePath: "/assets/generated/characters/npcs/wanbao-clerk-village-idle-v1",
    files: {
      raw: "raw-sheet.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      framePrefix: "npc_idle",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      profile: "humanoid",
      rows: 2,
      cols: 2,
      frameCount: 4,
      anchor: "feet",
      view: "topdown",
      frameWidth: 96,
      frameHeight: 96,
      targetHeight: 80,
      heightTolerance: 1,
      footlineY: 88,
      centerX: 48,
      centerTolerance: 1,
      idleCadenceMs: 800,
      qcStatus: "passed",
    },
    tags: ["npc", "idle-sheet", "wanbao", "merchant", "village"],
  },
  "npc.lingbao_forgemaster.village_blacksmith.idle_v1": {
    assetId: "npc.lingbao_forgemaster.village_blacksmith.idle_v1",
    kind: "npc",
    name: "仙緣鎮鐵匠原地待機",
    description: "張鐵山的 2x2 原地待機 sheet，供仙緣鎮鐵匠鋪 NPC map token 使用。",
    style: "pixel_art",
    source: "generated",
    version: 1,
    usage: ["npc_idle", "map_token"],
    basePath: "/assets/generated/characters/npcs/lingbao-forgemaster-village-blacksmith-idle-v1",
    files: {
      raw: "raw-sheet.png",
      sheet: "sheet-transparent.png",
      preview: "animation.gif",
      framesDir: "frames",
      framePrefix: "npc_idle",
      prompt: "prompt-used.txt",
      meta: "pipeline-meta.json",
    },
    sprite: {
      profile: "humanoid",
      rows: 2,
      cols: 2,
      frameCount: 4,
      anchor: "feet",
      view: "topdown",
      frameWidth: 96,
      frameHeight: 96,
      targetHeight: 80,
      heightTolerance: 1,
      footlineY: 88,
      centerX: 48,
      centerTolerance: 1,
      idleCadenceMs: 800,
      qcStatus: "passed",
    },
    tags: ["npc", "idle-sheet", "forge", "blacksmith", "village"],
  },
};

export const getAssetDefinition = (assetId: string): AssetDefinition =>
  assetDefinitions[assetId] ?? assetDefinitions[FALLBACK_ASSET_ID];

export const hasAssetDefinition = (assetId: string): boolean =>
  Boolean(assetDefinitions[assetId]);

export const getAssetFileUrl = (
  assetId: string,
  fileKey: keyof GeneratedAssetFiles
): string => {
  const asset = getAssetDefinition(assetId);
  const file = asset.files[fileKey] ?? asset.files.preview ?? asset.files.transparent;

  return file ? `${asset.basePath}/${file}` : asset.basePath;
};

export const getAssetFrameFileUrls = (assetId: string): string[] => {
  const asset = getAssetDefinition(assetId);

  if (!asset.sprite || !asset.files.framesDir) {
    return [];
  }

  return Array.from(
    { length: asset.sprite.frameCount },
    (_, index) => {
      const framePrefix = asset.files.framePrefix ?? "player_sheet";

      return `${asset.basePath}/${asset.files.framesDir}/${framePrefix}-${index + 1}.png`;
    }
  );
};

export const listAssetDefinitions = (): AssetDefinition[] =>
  Object.values(assetDefinitions);
