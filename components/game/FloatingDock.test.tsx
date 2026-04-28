import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FloatingDock } from "./FloatingDock";

describe("FloatingDock", () => {
  it("renders bottom actions as independent buttons instead of a single bar", () => {
    const markup = renderToStaticMarkup(
      <FloatingDock activePanel="skills" onTogglePanel={vi.fn()} />
    );

    expect(markup).toContain('data-testid="floating-dock"');
    expect(markup).toContain('data-display-mode="separate-actions"');
    expect(markup).toContain('data-testid="floating-dock-actions"');
    expect(markup).not.toContain('data-testid="floating-dock-bar"');

    for (const panel of [
      "character",
      "inventory",
      "skills",
      "workshop",
      "compendium",
      "map",
    ]) {
      expect(markup).toContain(`data-testid="dock-action-${panel}"`);
      expect(markup).toContain(`data-testid="dock-${panel}"`);
    }
  });
});
