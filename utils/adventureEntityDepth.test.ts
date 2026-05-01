import { describe, expect, it } from "vitest";
import { resolveAdventureEntityDepth } from "./adventureEntityDepth";

describe("resolveAdventureEntityDepth", () => {
  it("sorts overworld entities by their footline y coordinate", () => {
    expect(resolveAdventureEntityDepth({ footlineY: 96 })).toBe(96);
    expect(resolveAdventureEntityDepth({ footlineY: 128 })).toBeGreaterThan(
      resolveAdventureEntityDepth({ footlineY: 96 })
    );
  });
});
