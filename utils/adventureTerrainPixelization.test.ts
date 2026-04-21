import { describe, expect, it } from "vitest";
import { MAPS } from "../data/maps";
import {
  buildAdventureTerrainTiles,
  resolveAdventureTerrainPalette,
} from "./adventureTerrainPixelization";

const map20 = MAPS.find((map) => map.id === "20");
const map4 = MAPS.find((map) => map.id === "4");
const map180 = MAPS.find((map) => map.id === "180");

describe("adventureTerrainPixelization", () => {
  it("preserves theme metadata on official maps used for terrain generation", () => {
    expect(map20?.theme).toBe("East");
    expect(map4?.theme).toBe("Sect");
    expect(map180?.theme).toBe("Ultimate");
  });

  it("builds deterministic terrain tiles with portal clearings", () => {
    expect(map20).toBeTruthy();

    const first = buildAdventureTerrainTiles({
      mapId: map20!.id,
      theme: map20!.theme,
      width: 12,
      height: 12,
      portals: [{ ...map20!.portals[0], x: 6, y: 0 }],
      npcs: [],
    });
    const second = buildAdventureTerrainTiles({
      mapId: map20!.id,
      theme: map20!.theme,
      width: 12,
      height: 12,
      portals: [{ ...map20!.portals[0], x: 6, y: 0 }],
      npcs: [],
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(144);
    expect(first.find((tile) => tile.x === 6 && tile.y === 0)?.kind).toBe("path");
    expect(new Set(first.map((tile) => tile.kind)).size).toBeGreaterThan(2);
  });

  it("resolves distinct palettes for east, sect, and ultimate maps", () => {
    const east = resolveAdventureTerrainPalette("East");
    const sect = resolveAdventureTerrainPalette("Sect");
    const ultimate = resolveAdventureTerrainPalette("Ultimate");

    expect(east.backgroundColor).not.toBe(sect.backgroundColor);
    expect(sect.backgroundColor).not.toBe(ultimate.backgroundColor);
    expect(east.gridColor).not.toBe(ultimate.gridColor);
  });
});
