import { describe, expect, it } from "vitest";
import {
  HUMANOID_COMBAT_SPRITE_STANDARD,
  HUMANOID_WALK_SPRITE_STANDARD,
} from "./humanoidSpriteStandard";

describe("humanoidSpriteStandard", () => {
  it("defines one shared player and NPC walk sprite profile", () => {
    expect(HUMANOID_WALK_SPRITE_STANDARD).toEqual({
      profile: "humanoid",
      frameWidth: 96,
      frameHeight: 96,
      rows: 4,
      cols: 4,
      frameCount: 16,
      rowOrder: ["down", "left", "right", "up"],
      targetHeight: 80,
      heightTolerance: 1,
      footlineY: 88,
      centerX: 48,
      centerTolerance: 1,
    });
  });

  it("defines one shared four-direction humanoid combat sprite profile", () => {
    expect(HUMANOID_COMBAT_SPRITE_STANDARD).toEqual({
      profile: "humanoid",
      frameWidth: 96,
      frameHeight: 96,
      rows: 4,
      cols: 6,
      frameCount: 24,
      framesPerDirection: 6,
      rowOrder: ["down", "left", "right", "up"],
      targetHeight: 80,
      maxWidth: 90,
      footlineY: 88,
      centerX: 48,
      centerTolerance: 2,
    });
  });
});
