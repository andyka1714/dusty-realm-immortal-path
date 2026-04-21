import { describe, expect, it } from "vitest";
import { PIXEL_PROTOTYPE_MAP_ID } from "./pixelAdventurePrototype";
import {
  PIXEL_PROTOTYPE_PREVIEW_BOOT_BUDGET_MS,
  PIXEL_PROTOTYPE_PREVIEW_MODE_QUERY_KEY,
  PIXEL_PROTOTYPE_PREVIEW_QUERY_KEY,
  PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS,
  createPixelPrototypePreviewFixture,
  getPixelPrototypePreviewModeOverride,
  isPixelPrototypePreviewEnabled,
} from "./pixelPrototypePreview";

describe("pixelPrototypePreview", () => {
  it("detects the dedicated preview query switch", () => {
    expect(isPixelPrototypePreviewEnabled("")).toBe(false);
    expect(
      isPixelPrototypePreviewEnabled(`?${PIXEL_PROTOTYPE_PREVIEW_QUERY_KEY}=1`)
    ).toBe(true);
    expect(
      isPixelPrototypePreviewEnabled(`?foo=bar&${PIXEL_PROTOTYPE_PREVIEW_QUERY_KEY}=true`)
    ).toBe(true);
    expect(
      isPixelPrototypePreviewEnabled(`?${PIXEL_PROTOTYPE_PREVIEW_QUERY_KEY}=0`)
    ).toBe(false);
  });

  it("provides a representative map-20 fixture and explicit validation budgets", () => {
    const fixture = createPixelPrototypePreviewFixture();

    expect(fixture.mapData.id).toBe(PIXEL_PROTOTYPE_MAP_ID);
    expect(fixture.activeMonsters).toHaveLength(2);
    expect(fixture.targetMonsterId).toBe("preview-ranged");
    expect(fixture.combatPresentation?.showEnemyDangerFill).toBe(true);
    expect(fixture.playerStatusNames).toEqual(["護盾"]);
    expect(fixture.enemyStatusNames).toEqual(["燃燒", "破甲"]);
    expect(PIXEL_PROTOTYPE_PREVIEW_BOOT_BUDGET_MS).toBeGreaterThanOrEqual(150);
    expect(PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS.desktop).toBeGreaterThanOrEqual(45);
    expect(PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS.mobile).toBeGreaterThanOrEqual(30);
  });

  it("parses an optional preview viewport override for deterministic mobile validation", () => {
    expect(getPixelPrototypePreviewModeOverride("")).toBe(null);
    expect(
      getPixelPrototypePreviewModeOverride(
        `?${PIXEL_PROTOTYPE_PREVIEW_MODE_QUERY_KEY}=mobile`
      )
    ).toBe("mobile");
    expect(
      getPixelPrototypePreviewModeOverride(
        `?${PIXEL_PROTOTYPE_PREVIEW_MODE_QUERY_KEY}=desktop`
      )
    ).toBe("desktop");
    expect(
      getPixelPrototypePreviewModeOverride(
        `?${PIXEL_PROTOTYPE_PREVIEW_MODE_QUERY_KEY}=tablet`
      )
    ).toBe(null);
  });
});
