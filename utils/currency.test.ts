import { describe, expect, it } from "vitest";
import { formatSpiritStone, parseSpiritStone } from "./currency";

describe("currency helpers", () => {
  it("formats mixed-quality spirit stones", () => {
    expect(formatSpiritStone(1002503)).toBe("1 上品 2 中品");
    expect(formatSpiritStone(999)).toBe("999 下品");
  });

  it("parses spirit stones into denominations", () => {
    expect(parseSpiritStone(1002503)).toEqual({
      ultimate: 0,
      high: 1,
      medium: 2,
      low: 503,
    });
  });
});
