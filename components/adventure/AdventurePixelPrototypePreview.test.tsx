import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdventurePixelPrototypePreview } from "./AdventurePixelPrototypePreview";

describe("AdventurePixelPrototypePreview", () => {
  it("renders the validation HUD and performance budget copy", () => {
    const markup = renderToStaticMarkup(<AdventurePixelPrototypePreview />);

    expect(markup).toContain("Pixel Prototype Validation");
    expect(markup).toContain("像素地圖");
    expect(markup).toContain("文字 token");
    expect(markup).toContain("東郊靈田");
    expect(markup).toContain("Desktop / Mobile");
    expect(markup).toContain("Boot budget");
    expect(markup).toContain("FPS budget");
    expect(markup).toContain("蝕骨田鼬");
  });

  it("supports a forced mobile validation mode without resizing the real browser window", () => {
    const markup = renderToStaticMarkup(
      <AdventurePixelPrototypePreview modeOverride="mobile" />
    );

    expect(markup).toContain('data-preview-mode="mobile"');
    expect(markup).toContain("Mobile 2x");
  });
});
