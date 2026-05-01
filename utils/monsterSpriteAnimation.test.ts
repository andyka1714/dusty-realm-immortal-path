import { describe, expect, it } from "vitest";
import { BESTIARY } from "../data/enemies";
import {
  getMonsterSpriteFrame,
  getMonsterSpriteLayout,
} from "./monsterSpriteAnimation";
import { resolveMonsterVisualProfile } from "./monsterVisualProfile";

describe("monsterSpriteAnimation", () => {
  it("sizes monster sprites from profile height and footprint instead of forcing one tile", () => {
    const dogProfile = resolveMonsterVisualProfile(BESTIARY.m1_c1);
    const daoProfile = resolveMonsterVisualProfile(BESTIARY.m180_b1);

    expect(getMonsterSpriteLayout({ cellSize: 40, profile: dogProfile, frameHeight: 96 })).toMatchObject({
      width: 80,
      height: 40,
      anchorX: 0.5,
      anchorY: 11 / 12,
    });
    expect(getMonsterSpriteLayout({ cellSize: 40, profile: daoProfile, frameHeight: 96 })).toMatchObject({
      width: 80,
      height: 240,
      anchorX: 0.5,
      anchorY: 11 / 12,
    });
  });

  it("selects four-direction movement and combat frames", () => {
    expect(
      getMonsterSpriteFrame({
        direction: "left",
        action: "movement",
        elapsedMs: 320,
      })
    ).toMatchObject({ row: 1, col: 2, frameIndex: 6 });

    expect(
      getMonsterSpriteFrame({
        direction: "up",
        action: "combat",
        elapsedMs: 220,
      })
    ).toMatchObject({ row: 3, col: 2, frameIndex: 20 });
  });
});
