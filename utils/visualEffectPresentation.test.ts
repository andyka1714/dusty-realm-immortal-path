import { describe, expect, it } from "vitest";
import { getVisualEffectLifeTime, getVisualEffectPresentation } from "./visualEffectPresentation";

describe("visual effect presentation", () => {
  it("derives default lifetimes by effect type", () => {
    expect(getVisualEffectLifeTime("text")).toBe(1500);
    expect(getVisualEffectLifeTime("projectile")).toBe(420);
    expect(getVisualEffectLifeTime("impact")).toBe(260);
    expect(getVisualEffectLifeTime("cast")).toBe(320);
    expect(getVisualEffectLifeTime("area")).toBe(650);
    expect(getVisualEffectLifeTime("area", 900)).toBe(900);
  });

  it("builds area and impact presentation geometry from world coordinates", () => {
    const area = getVisualEffectPresentation({
      effect: {
        id: "area-1",
        type: "area",
        text: "",
        color: "#fff",
        colorInt: 0xffffff,
        targetX: 10,
        targetY: 8,
        radius: 2,
      },
      playerPosition: { x: 3, y: 4 },
      cellSize: 40,
    });

    expect(area.effectType).toBe("area");
    expect(area.targetX).toBe(420);
    expect(area.targetY).toBe(340);
    expect(area.radiusPx).toBe(80);

    const impact = getVisualEffectPresentation({
      effect: {
        id: "impact-1",
        type: "impact",
        text: "",
        color: "#fff",
        colorInt: 0xffffff,
        targetX: 6,
        targetY: 5,
      },
      playerPosition: { x: 3, y: 4 },
      cellSize: 40,
    });

    expect(impact.radiusPx).toBe(20);
    expect(impact.targetX).toBe(260);
    expect(impact.targetY).toBe(220);
  });

  it("falls back to player-centered text spawn when world coordinates are omitted", () => {
    const text = getVisualEffectPresentation({
      effect: {
        id: "text-1",
        type: "text",
        text: "-128",
        color: "#fff",
        colorInt: 0xffffff,
      },
      playerPosition: { x: 7, y: 9 },
      cellSize: 40,
    });

    expect(text.effectType).toBe("text");
    expect(text.startX).toBe(300);
    expect(text.startY).toBe(320);
    expect(text.targetX).toBeUndefined();
  });
});
