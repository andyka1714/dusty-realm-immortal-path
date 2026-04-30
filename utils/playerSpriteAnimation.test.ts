import { describe, expect, it } from "vitest";
import {
  getCharacterSpriteLayout,
  getCharacterTileAnchorPosition,
  getPlayerSpriteGrounding,
  getPlayerCombatSpriteFrame,
  getPlayerSpriteFrame,
  getPlayerSpriteDirectionTowardTarget,
  getPlayerSpriteDirectionFromDelta,
  shouldFaceClickedInteractionTarget,
  shouldUsePlayerCombatSprite,
} from "./playerSpriteAnimation";

describe("playerSpriteAnimation", () => {
  it("keeps the player on an idle frame when no movement delta is present", () => {
    expect(
      getPlayerSpriteFrame({
        direction: "down",
        isMoving: false,
        elapsedMs: 480,
      })
    ).toEqual({ row: 0, col: 0, frameIndex: 0 });
  });

  it("uses walk-cycle frames only while the player is moving", () => {
    expect(
      getPlayerSpriteFrame({
        direction: "right",
        isMoving: true,
        elapsedMs: 160,
      })
    ).toEqual({ row: 2, col: 1, frameIndex: 9 });

    expect(
      getPlayerSpriteFrame({
        direction: "right",
        isMoving: true,
        elapsedMs: 480,
      })
    ).toEqual({ row: 2, col: 3, frameIndex: 11 });
  });

  it("resolves facing direction from the dominant movement axis", () => {
    expect(getPlayerSpriteDirectionFromDelta(0.1, 0.4, "left")).toBe("down");
    expect(getPlayerSpriteDirectionFromDelta(-0.4, 0.1, "down")).toBe("left");
    expect(getPlayerSpriteDirectionFromDelta(0, 0, "up")).toBe("up");
  });

  it("resolves facing direction toward a clicked interaction target", () => {
    expect(
      getPlayerSpriteDirectionTowardTarget({
        source: { x: 10, y: 10 },
        target: { x: 10, y: 11 },
        fallback: "left",
      })
    ).toBe("down");

    expect(
      getPlayerSpriteDirectionTowardTarget({
        source: { x: 10, y: 10 },
        target: { x: 12, y: 10 },
        fallback: "up",
      })
    ).toBe("right");

    expect(
      getPlayerSpriteDirectionTowardTarget({
        source: { x: 10, y: 10 },
        target: { x: 10, y: 10 },
        fallback: "left",
      })
    ).toBe("left");
  });

  it("only turns immediately for adjacent clicked interaction targets", () => {
    expect(
      shouldFaceClickedInteractionTarget({
        source: { x: 10, y: 10 },
        target: { x: 10, y: 11 },
        hasInteractionTarget: true,
      })
    ).toBe(true);

    expect(
      shouldFaceClickedInteractionTarget({
        source: { x: 10, y: 10 },
        target: { x: 10, y: 13 },
        hasInteractionTarget: true,
      })
    ).toBe(false);

    expect(
      shouldFaceClickedInteractionTarget({
        source: { x: 10, y: 10 },
        target: { x: 10, y: 11 },
        hasInteractionTarget: false,
      })
    ).toBe(false);
  });

  it("maps combat animation frames onto the active part of an attack interval", () => {
    expect(
      getPlayerCombatSpriteFrame({
        direction: "right",
        elapsedSinceActionMs: 0,
        attackIntervalMs: 1200,
      })
    ).toEqual({ row: 2, col: 0, frameIndex: 12 });

    expect(
      getPlayerCombatSpriteFrame({
        direction: "right",
        elapsedSinceActionMs: 360,
        attackIntervalMs: 1200,
      })
    ).toEqual({ row: 2, col: 3, frameIndex: 15 });

    expect(
      getPlayerCombatSpriteFrame({
        direction: "up",
        elapsedSinceActionMs: 900,
        attackIntervalMs: 1200,
      })
    ).toEqual({ row: 3, col: 5, frameIndex: 23 });
  });

  it("uses a foot anchor so every direction stands on the same tile baseline", () => {
    expect(getPlayerSpriteGrounding({ frameHeight: 96, footPixelY: 88 })).toEqual({
      anchorX: 0.5,
      anchorY: 88 / 96,
      yOffsetRatio: 0.5,
    });
  });

  it("places character sprites on the center of their tile", () => {
    expect(
      getCharacterTileAnchorPosition({
        tileX: 3,
        tileY: 5,
        cellSize: 40,
      })
    ).toEqual({ x: 140, y: 220 });
  });

  it("renders character sprite frames at two tile heights from a foot anchor", () => {
    expect(
      getCharacterSpriteLayout({
        cellSize: 40,
        frameHeight: 96,
      })
    ).toEqual({
      anchorX: 0.5,
      anchorY: 88 / 96,
      x: 0,
      y: 0,
      width: 80,
      height: 80,
    });
  });

  it("uses combat sprites only while a stationary world attack animation is active", () => {
    expect(
      shouldUsePlayerCombatSprite({
        isMoving: false,
        hasCombatPresentation: true,
        canPlayCombatAnimation: true,
        isAttackReady: false,
        elapsedSinceActionMs: 120,
        attackIntervalMs: 1200,
      })
    ).toBe(true);

    expect(
      shouldUsePlayerCombatSprite({
        isMoving: true,
        hasCombatPresentation: true,
        canPlayCombatAnimation: true,
        isAttackReady: false,
        elapsedSinceActionMs: 120,
        attackIntervalMs: 1200,
      })
    ).toBe(false);

    expect(
      shouldUsePlayerCombatSprite({
        isMoving: false,
        hasCombatPresentation: true,
        canPlayCombatAnimation: true,
        isAttackReady: true,
        elapsedSinceActionMs: 0,
        attackIntervalMs: 1200,
      })
    ).toBe(true);

    expect(
      shouldUsePlayerCombatSprite({
        isMoving: false,
        hasCombatPresentation: true,
        canPlayCombatAnimation: true,
        isAttackReady: false,
        elapsedSinceActionMs: 900,
        attackIntervalMs: 1200,
      })
    ).toBe(false);
  });

  it("does not enter combat pose before pursuit reaches engagement range", () => {
    expect(
      shouldUsePlayerCombatSprite({
        isMoving: false,
        hasCombatPresentation: true,
        canPlayCombatAnimation: false,
        isAttackReady: true,
        elapsedSinceActionMs: 0,
        attackIntervalMs: 1200,
      })
    ).toBe(false);
  });
});
