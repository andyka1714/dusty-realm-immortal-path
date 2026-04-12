import { describe, expect, it } from "vitest";
import { BESTIARY } from ".";

const HIGH_REALM_MAP_IDS = [120, 121, 130, 131, 140, 141, 150, 151, 160, 161, 170, 171, 180];

describe("high realm enemy density", () => {
  it("provides four common enemies for every map from spirit severing onward", () => {
    HIGH_REALM_MAP_IDS.forEach((mapId) => {
      for (let i = 1; i <= 4; i += 1) {
        expect(BESTIARY[`m${mapId}_c${i}`], `missing common m${mapId}_c${i}`).toBeDefined();
      }
    });
  });

  it("provides two elite enemies for every map from spirit severing onward", () => {
    HIGH_REALM_MAP_IDS.forEach((mapId) => {
      for (let i = 1; i <= 2; i += 1) {
        expect(BESTIARY[`m${mapId}_e${i}`], `missing elite m${mapId}_e${i}`).toBeDefined();
      }
    });
  });

  it("keeps a boss enemy for every peak map from spirit severing onward", () => {
    [121, 131, 141, 151, 161, 171, 180].forEach((mapId) => {
      expect(BESTIARY[`m${mapId}_b1`], `missing boss m${mapId}_b1`).toBeDefined();
    });
  });
});
