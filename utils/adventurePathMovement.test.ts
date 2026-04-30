import { describe, expect, it } from "vitest";
import {
  resolveEngagementPath,
  resolveImmediatePathStep,
} from "./adventurePathMovement";

describe("adventurePathMovement", () => {
  it("extracts an immediate first step and leaves the remaining path queued", () => {
    expect(
      resolveImmediatePathStep({
        playerPosition: { x: 10, y: 10 },
        path: [
          { x: 11, y: 10 },
          { x: 12, y: 10 },
        ],
      })
    ).toEqual({
      dx: 1,
      dy: 0,
      nextPosition: { x: 11, y: 10 },
      remainingPath: [{ x: 12, y: 10 }],
    });
  });

  it("rejects empty or non-adjacent paths", () => {
    expect(
      resolveImmediatePathStep({
        playerPosition: { x: 10, y: 10 },
        path: [],
      })
    ).toBeNull();

    expect(
      resolveImmediatePathStep({
        playerPosition: { x: 10, y: 10 },
        path: [{ x: 12, y: 10 }],
      })
    ).toBeNull();
  });

  it("keeps melee pursuit one tile away from a moving monster", () => {
    const path = resolveEngagementPath({
      playerPosition: { x: 5, y: 5 },
      targetPosition: { x: 8, y: 5 },
      engagementRange: 1,
      width: 20,
      height: 20,
    });

    expect(path).toEqual([
      { x: 6, y: 5 },
      { x: 7, y: 5 },
    ]);
  });

  it("supports ranged pursuit without pathing onto the monster tile", () => {
    const path = resolveEngagementPath({
      playerPosition: { x: 5, y: 5 },
      targetPosition: { x: 10, y: 5 },
      engagementRange: 3,
      width: 20,
      height: 20,
    });

    expect(path[path.length - 1]).toEqual({ x: 7, y: 5 });
    expect(path).not.toContainEqual({ x: 10, y: 5 });
  });

  it("does not move when already within engagement range", () => {
    expect(
      resolveEngagementPath({
        playerPosition: { x: 5, y: 5 },
        targetPosition: { x: 7, y: 5 },
        engagementRange: 2,
        width: 20,
        height: 20,
      })
    ).toEqual([]);
  });
});
