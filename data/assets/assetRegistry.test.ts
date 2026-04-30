import { describe, expect, it } from "vitest";
import {
  FALLBACK_ASSET_ID,
  getAssetDefinition,
  getAssetFileUrl,
  getAssetFrameFileUrls,
  hasAssetDefinition,
} from "./assetRegistry";

describe("assetRegistry", () => {
  it("resolves the first generated mortal male player sprite by assetId", () => {
    const asset = getAssetDefinition("character.player.mortal_male.v1");

    expect(asset.assetId).toBe("character.player.mortal_male.v1");
    expect(asset.kind).toBe("character");
    expect(asset.usage).toContain("player_walk");
    expect(asset.files.sheet).toBe("sheet-transparent.png");
    expect(asset.sprite).toMatchObject({
      profile: "humanoid",
      rows: 4,
      cols: 4,
      frameWidth: 96,
      frameHeight: 96,
      targetHeight: 80,
      footlineY: 88,
      centerX: 48,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    });
    expect(getAssetFileUrl(asset.assetId, "sheet")).toBe(
      "/assets/generated/characters/player/mortal-male-v1/sheet-transparent.png"
    );
  });

  it("resolves the generated mortal female player sprite by assetId", () => {
    const asset = getAssetDefinition("character.player.mortal_female.v1");

    expect(asset.assetId).toBe("character.player.mortal_female.v1");
    expect(asset.kind).toBe("character");
    expect(asset.usage).toContain("player_walk");
    expect(asset.files.sheet).toBe("sheet-transparent.png");
    expect(asset.sprite).toMatchObject({
      profile: "humanoid",
      rows: 4,
      cols: 4,
      frameWidth: 96,
      frameHeight: 96,
      targetHeight: 80,
      footlineY: 88,
      centerX: 48,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    });
    expect(getAssetFileUrl(asset.assetId, "sheet")).toBe(
      "/assets/generated/characters/player/mortal-female-v1/sheet-transparent.png"
    );
  });

  it("resolves generated player combat animation sheet assets", () => {
    const male = getAssetDefinition("character.player.mortal_male.combat_v1");
    const female = getAssetDefinition("character.player.mortal_female.combat_v1");

    expect(male.usage).toContain("player_combat_idle");
    expect(male.usage).toContain("player_combat_attack");
    expect(male.files.sheet).toBe("sheet-transparent.png");
    expect(male.sprite).toMatchObject({
      profile: "humanoid",
      rows: 4,
      cols: 6,
      frameCount: 24,
      framesPerDirection: 6,
      rowOrder: ["down", "left", "right", "up"],
      frameWidth: 96,
      frameHeight: 96,
      targetHeight: 80,
      maxWidth: 90,
      footlineY: 88,
      centerX: 48,
      anchor: "feet",
      view: "topdown",
      qcStatus: "passed",
    });
    expect(female.usage).toContain("player_combat_idle");
    expect(female.usage).toContain("player_combat_attack");
    expect(female.files.sheet).toBe("sheet-transparent.png");
    expect(getAssetFileUrl(female.assetId, "sheet")).toBe(
      "/assets/generated/characters/player/mortal-female-combat-v1/sheet-transparent.png"
    );
  });

  it("resolves generated sprite frame files without sampling from the sheet", () => {
    expect(getAssetFrameFileUrls("character.player.mortal_female.v1")).toEqual(
      Array.from(
        { length: 16 },
        (_, index) =>
          `/assets/generated/characters/player/mortal-female-v1/frames/player_sheet-${index + 1}.png`
      )
    );
  });

  it("returns a fallback asset for unknown assetIds", () => {
    const asset = getAssetDefinition("enemy.unknown.missing.v1");

    expect(asset.assetId).toBe(FALLBACK_ASSET_ID);
    expect(hasAssetDefinition("enemy.unknown.missing.v1")).toBe(false);
    expect(getAssetFileUrl("enemy.unknown.missing.v1", "preview")).toBe(
      "/assets/generated/ui/fallback/transparent.png"
    );
  });
});
