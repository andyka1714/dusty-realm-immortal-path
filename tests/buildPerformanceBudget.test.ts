import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { OutputOptions } from "rollup";
import type { UserConfig } from "vite";
import viteConfig from "../vite.config";

const config = viteConfig as UserConfig;

const getOutputOptions = (): OutputOptions => {
  const output = config.build?.rollupOptions?.output;

  if (Array.isArray(output)) {
    return output[0] ?? {};
  }

  return output ?? {};
};

const getManualChunkResolver = () => {
  const manualChunks = getOutputOptions().manualChunks;

  if (typeof manualChunks !== "function") {
    throw new Error("manualChunks must stay function-based for budget regression");
  }

  return manualChunks as (id: string) => string | undefined;
};

describe("client build performance budget", () => {
  it("sets an explicit chunk warning budget for the known Pixi runtime", () => {
    expect(config.build?.chunkSizeWarningLimit).toBeGreaterThanOrEqual(550);
  });

  it("keeps production Pixi and preview-only Pixi legacy in separate chunks", () => {
    const manualChunks = getManualChunkResolver();

    expect(manualChunks("/repo/node_modules/pixi.js/lib/index.mjs")).toBe("pixi");
    expect(manualChunks("/repo/node_modules/pixi.js-legacy/lib/index.mjs")).toBe(
      "pixi-preview"
    );
  });

  it("keeps the pixel prototype preview behind a dynamic import boundary", () => {
    const entrySource = readFileSync(resolve(process.cwd(), "index.tsx"), "utf8");

    expect(entrySource).not.toContain(
      "import { AdventurePixelPrototypePreview } from './components/adventure/AdventurePixelPrototypePreview'"
    );
    expect(entrySource).toContain("import('./components/adventure/AdventurePixelPrototypePreview')");
  });

  it("keeps the pixel prototype stage behind an Adventure-only dynamic import boundary", () => {
    const adventureSource = readFileSync(resolve(process.cwd(), "pages/Adventure.tsx"), "utf8");

    expect(adventureSource).not.toContain(
      "import { AdventurePixelStagePrototype } from '../components/adventure/AdventurePixelStagePrototype'"
    );
    expect(adventureSource).toContain(
      "import('../components/adventure/AdventurePixelStagePrototype')"
    );
  });
});
