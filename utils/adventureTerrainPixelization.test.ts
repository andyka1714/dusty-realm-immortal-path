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

  it("builds structured corridors and plazas for center and sect safe maps", () => {
    const centerTown = buildAdventureTerrainTiles({
      mapId: "0",
      theme: "Center",
      width: 12,
      height: 12,
      portals: [
        {
          x: 0,
          y: 6,
          targetMapId: "1",
          targetX: 0,
          targetY: 0,
          label: "前往 [北郊荒徑]",
          dir: "North",
        },
      ],
      npcs: [{ x: 6, y: 6 }],
    });
    const sectHub = buildAdventureTerrainTiles({
      mapId: "4",
      theme: "Sect",
      width: 12,
      height: 12,
      portals: [
        {
          x: 6,
          y: 0,
          targetMapId: "3",
          targetX: 0,
          targetY: 0,
          label: "前往 [凌霄山腳]",
          dir: "South",
        },
      ],
      npcs: [{ x: 6, y: 6 }],
    });

    expect(centerTown.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("path");
    expect(centerTown.find((tile) => tile.x === 6 && tile.y === 8)?.kind).toBe("path");
    expect(sectHub.find((tile) => tile.x === 6 && tile.y === 3)?.kind).toBe("path");
    expect(sectHub.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("path");
  });

  it("keeps wild-route themes from generating town-like straight corridors", () => {
    const eastWild = buildAdventureTerrainTiles({
      mapId: "20",
      theme: "East",
      width: 12,
      height: 12,
      portals: [
        {
          x: 0,
          y: 6,
          targetMapId: "0",
          targetX: 0,
          targetY: 0,
          label: "前往 [仙緣鎮]",
          dir: "West",
        },
      ],
      npcs: [{ x: 6, y: 6 }],
    });

    expect(eastWild.find((tile) => tile.x === 3 && tile.y === 6)?.kind).not.toBe("path");
  });

  it("builds macro shapes for high-realm route themes instead of palette-only swaps", () => {
    const seaRoute = buildAdventureTerrainTiles({
      mapId: "150",
      theme: "Sea",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const thunderRoute = buildAdventureTerrainTiles({
      mapId: "161",
      theme: "Thunder",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const immortalRoute = buildAdventureTerrainTiles({
      mapId: "170",
      theme: "Immortal",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const ultimateRoute = buildAdventureTerrainTiles({
      mapId: "180",
      theme: "Ultimate",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(seaRoute.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("water");
    expect(seaRoute.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("water");
    expect(thunderRoute.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(thunderRoute.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("accent");
    expect(immortalRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(immortalRoute.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("path");
    expect(ultimateRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(ultimateRoute.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
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
