import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve("public/assets/generated/characters/paper-monster-motion-v2");
const ARCHETYPES = [
  "low_crawler",
  "humanoid",
  "winged",
  "serpentine",
  "spirit",
  "construct",
  "plant",
] as const;

describe("paper monster motion runtime pack", () => {
  it("ships four-direction movement and combat frames for every body archetype", () => {
    const manifest = JSON.parse(readFileSync(resolve(ROOT, "asset.json"), "utf8"));
    expect(manifest.globalScaleAnimation).toBe(false);
    expect(manifest.qcStatus).toBe("passed");

    const quadrupedWalk = readdirSync(resolve(ROOT, "quadruped/walk/frames"));
    const quadrupedAttack = readdirSync(resolve(ROOT, "quadruped/attack/frames"));
    expect(quadrupedWalk.filter((file) => file.endsWith(".png"))).toHaveLength(16);
    expect(quadrupedAttack.filter((file) => file.endsWith(".png"))).toHaveLength(16);

    for (const archetype of ARCHETYPES) {
      const directory = resolve(ROOT, archetype, "combined/frames");
      expect(existsSync(directory)).toBe(true);
      expect(readdirSync(directory).filter((file) => file.endsWith(".png"))).toHaveLength(16);
      const metadata = JSON.parse(
        readFileSync(resolve(ROOT, archetype, "combined/pipeline-meta.json"), "utf8")
      );
      expect(metadata.edge_touch_frames ?? []).toEqual([]);
    }
  });
});
