import { describe, expect, it } from "vitest";
import { Gender } from "../types";
import {
  getPlayerCombatSpriteAssetId,
  getPlayerSpriteAssetId,
} from "./playerSpriteAsset";

describe("playerSpriteAsset", () => {
  it("selects player sprite assets by character gender", () => {
    expect(getPlayerSpriteAssetId(Gender.Male)).toBe(
      "character.player.mortal_male.v1"
    );
    expect(getPlayerSpriteAssetId(Gender.Female)).toBe(
      "character.player.mortal_female.v1"
    );
  });

  it("selects player combat sprite assets by character gender", () => {
    expect(getPlayerCombatSpriteAssetId(Gender.Male)).toBe(
      "character.player.mortal_male.combat_v1"
    );
    expect(getPlayerCombatSpriteAssetId(Gender.Female)).toBe(
      "character.player.mortal_female.combat_v1"
    );
  });
});
