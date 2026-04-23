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

  it("exposes production semantic roles and named skeletons for representative terrain", () => {
    const portalRoute = buildAdventureTerrainTiles({
      mapId: "20",
      theme: "East",
      width: 12,
      height: 12,
      portals: [
        {
          x: 6,
          y: 0,
          targetMapId: "0",
          targetX: 0,
          targetY: 0,
          label: "前往 [仙緣鎮]",
          dir: "West",
        },
      ],
      npcs: [{ x: 3, y: 6 }],
    });
    const thunderPool = buildAdventureTerrainTiles({
      mapId: "161",
      theme: "Thunder",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const bossArena = buildAdventureTerrainTiles({
      mapId: "22",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
      bossSpawn: { x: 6, y: 6 },
    });

    expect(new Set(portalRoute.map((tile) => tile.skeletonId))).toEqual(
      new Set(["east-spirit-field"])
    );
    expect(portalRoute.find((tile) => tile.x === 6 && tile.y === 0)?.semanticRole).toBe(
      "portalClearing"
    );
    expect(portalRoute.find((tile) => tile.x === 3 && tile.y === 6)?.semanticRole).toBe("poi");
    expect(thunderPool.find((tile) => tile.x === 6 && tile.y === 2)?.semanticRole).toBe(
      "hazard"
    );
    expect(thunderPool.find((tile) => tile.x === 6 && tile.y === 6)?.semanticRole).toBe("water");
    expect(bossArena.find((tile) => tile.x === 6 && tile.y === 6)?.semanticRole).toBe(
      "bossArena"
    );
  });

  it("distinguishes readable production roles beyond legacy tile kind", () => {
    const spiritField = buildAdventureTerrainTiles({
      mapId: "20",
      theme: "East",
      width: 12,
      height: 12,
      portals: [
        {
          x: 6,
          y: 0,
          targetMapId: "0",
          targetX: 0,
          targetY: 0,
          label: "前往 [仙緣鎮]",
          dir: "West",
        },
      ],
      npcs: [{ x: 3, y: 6 }],
    });
    const lakeMeadow = buildAdventureTerrainTiles({
      mapId: "22",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const lavaInferno = buildAdventureTerrainTiles({
      mapId: "71",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const timeRiver = buildAdventureTerrainTiles({
      mapId: "130",
      theme: "Void",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const bossArena = buildAdventureTerrainTiles({
      mapId: "22",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
      bossSpawn: { x: 6, y: 6 },
    });

    expect(spiritField.find((tile) => tile.x === 6 && tile.y === 0)?.semanticRole).toBe(
      "portalClearing"
    );
    expect(spiritField.find((tile) => tile.x === 3 && tile.y === 6)?.semanticRole).toBe("poi");
    expect(spiritField.find((tile) => tile.x === 6 && tile.y === 6)?.semanticRole).toBe("path");
    expect(lakeMeadow.find((tile) => tile.x === 6 && tile.y === 3)?.semanticRole).toBe("water");
    expect(lavaInferno.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(lavaInferno.find((tile) => tile.x === 6 && tile.y === 6)?.semanticRole).toBe(
      "hazard"
    );
    expect(timeRiver.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(timeRiver.find((tile) => tile.x === 4 && tile.y === 6)?.semanticRole).toBe("hazard");
    expect(bossArena.find((tile) => tile.x === 6 && tile.y === 6)?.semanticRole).toBe(
      "bossArena"
    );
  });

  it("keeps route skeleton metadata distinct without leaking actor-token data into terrain", () => {
    const representativeRoutes = [
      buildAdventureTerrainTiles({
        mapId: "1",
        theme: "North",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
      buildAdventureTerrainTiles({
        mapId: "20",
        theme: "East",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
      buildAdventureTerrainTiles({
        mapId: "10",
        theme: "West",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
      buildAdventureTerrainTiles({
        mapId: "140",
        theme: "Spirit",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
      buildAdventureTerrainTiles({
        mapId: "130",
        theme: "Void",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
      buildAdventureTerrainTiles({
        mapId: "170",
        theme: "Immortal",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
      buildAdventureTerrainTiles({
        mapId: "180",
        theme: "Ultimate",
        width: 12,
        height: 12,
        portals: [],
        npcs: [],
      }),
    ];
    const skeletonIds = representativeRoutes.map((tiles) => tiles[0].skeletonId);
    const terrainOnlyKeys = new Set([
      "x",
      "y",
      "kind",
      "semanticRole",
      "skeletonId",
      "fillColor",
      "detailColor",
      "detailKind",
    ]);

    expect(new Set(skeletonIds).size).toBe(representativeRoutes.length);
    representativeRoutes.flat().forEach((tile) => {
      expect(Object.keys(tile).every((key) => terrainOnlyKeys.has(key))).toBe(true);
    });
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

  it("adds a market-square landmark for the origin town", () => {
    const originTown = buildAdventureTerrainTiles({
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
        {
          x: 6,
          y: 0,
          targetMapId: "10",
          targetX: 0,
          targetY: 0,
          label: "前往 [西郊密林]",
          dir: "West",
        },
        {
          x: 11,
          y: 6,
          targetMapId: "20",
          targetX: 0,
          targetY: 0,
          label: "前往 [東郊靈田]",
          dir: "East",
        },
      ],
      npcs: [{ x: 6, y: 6 }],
    });

    expect(originTown.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(originTown.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("accent");
    expect(originTown.find((tile) => tile.x === 4 && tile.y === 8)?.kind).toBe("accent");
    expect(originTown.find((tile) => tile.x === 8 && tile.y === 8)?.kind).toBe("accent");
    expect(originTown.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
  });

  it("keeps wild-route themes from generating town-like straight corridors", () => {
    const eastWild = buildAdventureTerrainTiles({
      mapId: "25",
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

    expect(seaRoute.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("water");
    expect(seaRoute.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("water");
    expect(thunderRoute.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(thunderRoute.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("accent");
    expect(immortalRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(immortalRoute.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("path");
    expect(ultimateRoute.find((tile) => tile.x === 6 && tile.y === 3)?.kind).toBe("path");
    expect(ultimateRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
  });

  it("adds dedicated terrain anchors for void, spirit, sky, and dark routes", () => {
    const voidRoute = buildAdventureTerrainTiles({
      mapId: "130",
      theme: "Void",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const spiritRoute = buildAdventureTerrainTiles({
      mapId: "140",
      theme: "Spirit",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const skyRoute = buildAdventureTerrainTiles({
      mapId: "151",
      theme: "Sky",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const darkRoute = buildAdventureTerrainTiles({
      mapId: "160",
      theme: "Dark",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(voidRoute.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
    expect(voidRoute.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("water");
    expect(voidRoute.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
    expect(spiritRoute.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("path");
    expect(spiritRoute.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("path");
    expect(spiritRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(skyRoute.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(skyRoute.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(skyRoute.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("path");
    expect(skyRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(darkRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(darkRoute.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("accent");
    expect(darkRoute.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("accent");
  });

  it("builds a terrain arena around boss spawns without changing entity rendering", () => {
    const bossArena = buildAdventureTerrainTiles({
      mapId: "22",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
      bossSpawn: { x: 6, y: 6 },
    });
    const wildRoute = buildAdventureTerrainTiles({
      mapId: "21",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(bossArena.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(bossArena.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(bossArena.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("accent");
    expect(wildRoute.find((tile) => tile.x === 6 && tile.y === 6)?.kind).not.toBe("path");
  });

  it("keeps ultimate-route maps visually distinct even when they share the same theme", () => {
    const emperorPalace = buildAdventureTerrainTiles({
      mapId: "180",
      theme: "Ultimate",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const outerRing = buildAdventureTerrainTiles({
      mapId: "181",
      theme: "Ultimate",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const riftRoute = buildAdventureTerrainTiles({
      mapId: "182",
      theme: "Ultimate",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(emperorPalace.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(emperorPalace.find((tile) => tile.x === 6 && tile.y === 3)?.kind).toBe("path");
    expect(outerRing.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("path");
    expect(outerRing.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
    expect(riftRoute.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
    expect(riftRoute.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("water");
    expect(riftRoute.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
  });

  it("keeps immortal-route maps visually distinct even when they share the same theme", () => {
    const ascensionHall = buildAdventureTerrainTiles({
      mapId: "170",
      theme: "Immortal",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const heavenPalace = buildAdventureTerrainTiles({
      mapId: "171",
      theme: "Immortal",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const celestialPrison = buildAdventureTerrainTiles({
      mapId: "172",
      theme: "Immortal",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(ascensionHall.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(ascensionHall.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(heavenPalace.find((tile) => tile.x === 2 && tile.y === 3)?.kind).toBe("path");
    expect(heavenPalace.find((tile) => tile.x === 9 && tile.y === 9)?.kind).toBe("path");
    expect(celestialPrison.find((tile) => tile.x === 3 && tile.y === 2)?.kind).toBe("accent");
    expect(celestialPrison.find((tile) => tile.x === 9 && tile.y === 9)?.kind).toBe("accent");
  });

  it("keeps center-route maps visually distinct even when they share the same theme", () => {
    const battlefield = buildAdventureTerrainTiles({
      mapId: "120",
      theme: "Center",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const abyss = buildAdventureTerrainTiles({
      mapId: "121",
      theme: "Center",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const bridge = buildAdventureTerrainTiles({
      mapId: "122",
      theme: "Center",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(battlefield.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(battlefield.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(abyss.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(abyss.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
    expect(bridge.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
    expect(bridge.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
  });

  it("keeps void-route maps visually distinct even when they share the same theme", () => {
    const timeRiver = buildAdventureTerrainTiles({
      mapId: "130",
      theme: "Void",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const brokenVoid = buildAdventureTerrainTiles({
      mapId: "131",
      theme: "Void",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const corridor = buildAdventureTerrainTiles({
      mapId: "132",
      theme: "Void",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(timeRiver.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
    expect(timeRiver.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(brokenVoid.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(brokenVoid.find((tile) => tile.x === 3 && tile.y === 3)?.kind).toBe("accent");
    expect(corridor.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
    expect(corridor.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
  });

  it("keeps spirit-route maps visually distinct even when they share the same theme", () => {
    const spiritCity = buildAdventureTerrainTiles({
      mapId: "140",
      theme: "Spirit",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const spiritCore = buildAdventureTerrainTiles({
      mapId: "141",
      theme: "Spirit",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const spiritAltar = buildAdventureTerrainTiles({
      mapId: "142",
      theme: "Spirit",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(spiritCity.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("path");
    expect(spiritCity.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("path");
    expect(spiritCity.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(spiritCore.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(spiritCore.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(spiritCore.find((tile) => tile.x === 8 && tile.y === 8)?.kind).toBe("accent");
    expect(spiritAltar.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(spiritAltar.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
  });

  it("keeps sea-route maps visually distinct even when they share the same theme", () => {
    const endlessSea = buildAdventureTerrainTiles({
      mapId: "150",
      theme: "Sea",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const loneBeacon = buildAdventureTerrainTiles({
      mapId: "152",
      theme: "Sea",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(endlessSea.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("water");
    expect(endlessSea.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("water");
    expect(endlessSea.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(loneBeacon.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(loneBeacon.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
    expect(loneBeacon.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
  });

  it("keeps thunder-route maps visually distinct even when they share the same theme", () => {
    const thunderCorridor = buildAdventureTerrainTiles({
      mapId: "162",
      theme: "Thunder",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const thunderPool = buildAdventureTerrainTiles({
      mapId: "161",
      theme: "Thunder",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(thunderCorridor.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("accent");
    expect(thunderCorridor.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("accent");
    expect(thunderPool.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(thunderPool.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(thunderPool.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
  });

  it("keeps sect maps visually distinct even when they share the same theme", () => {
    const swordSect = buildAdventureTerrainTiles({
      mapId: "4",
      theme: "Sect",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const beastSect = buildAdventureTerrainTiles({
      mapId: "13",
      theme: "Sect",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const mysticSect = buildAdventureTerrainTiles({
      mapId: "23",
      theme: "Sect",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(swordSect.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(swordSect.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
    expect(beastSect.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(beastSect.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(mysticSect.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(mysticSect.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("water");
  });

  it("adds landmark variants for iconic north-route maps", () => {
    const swordMound = buildAdventureTerrainTiles({
      mapId: "7",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const floatingIsles = buildAdventureTerrainTiles({
      mapId: "61",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const chainBridge = buildAdventureTerrainTiles({
      mapId: "62",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const swordWall = buildAdventureTerrainTiles({
      mapId: "92",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(swordMound.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(swordMound.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
    expect(floatingIsles.find((tile) => tile.x === 3 && tile.y === 4)?.kind).toBe("path");
    expect(floatingIsles.find((tile) => tile.x === 8 && tile.y === 7)?.kind).toBe("path");
    expect(chainBridge.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
    expect(chainBridge.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
    expect(swordWall.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(swordWall.find((tile) => tile.x === 5 && tile.y === 6)?.kind).toBe("path");
  });

  it("adds landmark variants for early north-route gateway maps", () => {
    const barrenTrail = buildAdventureTerrainTiles({
      mapId: "1",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const swordPass = buildAdventureTerrainTiles({
      mapId: "2",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const mountainFoot = buildAdventureTerrainTiles({
      mapId: "3",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(barrenTrail.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(barrenTrail.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(swordPass.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(swordPass.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(swordPass.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("accent");
    expect(mountainFoot.find((tile) => tile.x === 4 && tile.y === 3)?.kind).toBe("path");
    expect(mountainFoot.find((tile) => tile.x === 8 && tile.y === 3)?.kind).toBe("path");
  });

  it("adds landmark variants for mid north-route maps", () => {
    const snowline = buildAdventureTerrainTiles({
      mapId: "30",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const iceCanyon = buildAdventureTerrainTiles({
      mapId: "31",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const lightningCliff = buildAdventureTerrainTiles({
      mapId: "32",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(snowline.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
    expect(snowline.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
    expect(iceCanyon.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(iceCanyon.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(iceCanyon.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("water");
    expect(lightningCliff.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(lightningCliff.find((tile) => tile.x === 5 && tile.y === 6)?.kind).toBe("path");
    expect(lightningCliff.find((tile) => tile.x === 7 && tile.y === 6)?.kind).toBe("path");
  });

  it("adds landmark variants for qi-phase route side maps", () => {
    const swordTrial = buildAdventureTerrainTiles({
      mapId: "5",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const swordValley = buildAdventureTerrainTiles({
      mapId: "6",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const beastForest = buildAdventureTerrainTiles({
      mapId: "15",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const herbValley = buildAdventureTerrainTiles({
      mapId: "25",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(swordTrial.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(swordTrial.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("path");
    expect(swordValley.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(swordValley.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(swordValley.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(beastForest.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(beastForest.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(beastForest.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("accent");
    expect(herbValley.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(herbValley.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(herbValley.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("accent");
  });

  it("adds landmark variants for nascent soul route companion maps", () => {
    const frozenCave = buildAdventureTerrainTiles({
      mapId: "90",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const auroraRealm = buildAdventureTerrainTiles({
      mapId: "91",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const giantSpine = buildAdventureTerrainTiles({
      mapId: "100",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const dragonBloodPool = buildAdventureTerrainTiles({
      mapId: "101",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const soulSea = buildAdventureTerrainTiles({
      mapId: "110",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const ghostDomain = buildAdventureTerrainTiles({
      mapId: "111",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(frozenCave.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
    expect(frozenCave.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("water");
    expect(frozenCave.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(auroraRealm.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("path");
    expect(auroraRealm.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("path");
    expect(auroraRealm.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(giantSpine.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(giantSpine.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("accent");
    expect(giantSpine.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("path");
    expect(dragonBloodPool.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(dragonBloodPool.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(dragonBloodPool.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("accent");
    expect(soulSea.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("water");
    expect(soulSea.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("water");
    expect(soulSea.find((tile) => tile.x === 6 && tile.y === 4)?.kind).toBe("accent");
    expect(ghostDomain.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(ghostDomain.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("water");
    expect(ghostDomain.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("water");
  });

  it("adds landmark variants for golden core companion maps", () => {
    const galeLayer = buildAdventureTerrainTiles({
      mapId: "60",
      theme: "North",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const gravityMountain = buildAdventureTerrainTiles({
      mapId: "70",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const poisonPit = buildAdventureTerrainTiles({
      mapId: "72",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const stormSea = buildAdventureTerrainTiles({
      mapId: "80",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const mirageSea = buildAdventureTerrainTiles({
      mapId: "82",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(galeLayer.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
    expect(galeLayer.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
    expect(galeLayer.find((tile) => tile.x === 6 && tile.y === 4)?.kind).toBe("accent");
    expect(gravityMountain.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(gravityMountain.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("accent");
    expect(gravityMountain.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("path");
    expect(poisonPit.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(poisonPit.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(poisonPit.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("accent");
    expect(stormSea.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("water");
    expect(stormSea.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("water");
    expect(stormSea.find((tile) => tile.x === 6 && tile.y === 4)?.kind).toBe("accent");
    expect(mirageSea.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("water");
    expect(mirageSea.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("water");
    expect(mirageSea.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
  });

  it("adds landmark variants for ascension mainline maps", () => {
    const spiritCity = buildAdventureTerrainTiles({
      mapId: "140",
      theme: "Spirit",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const endlessSea = buildAdventureTerrainTiles({
      mapId: "150",
      theme: "Sea",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const ascensionStair = buildAdventureTerrainTiles({
      mapId: "151",
      theme: "Sky",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const tribulationFront = buildAdventureTerrainTiles({
      mapId: "160",
      theme: "Dark",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const originPalace = buildAdventureTerrainTiles({
      mapId: "180",
      theme: "Ultimate",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(spiritCity.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("path");
    expect(spiritCity.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("path");
    expect(spiritCity.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(endlessSea.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("water");
    expect(endlessSea.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("water");
    expect(endlessSea.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(endlessSea.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("accent");
    expect(ascensionStair.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("path");
    expect(ascensionStair.find((tile) => tile.x === 8 && tile.y === 8)?.kind).toBe("path");
    expect(ascensionStair.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(tribulationFront.find((tile) => tile.x === 2 && tile.y === 4)?.kind).toBe("accent");
    expect(tribulationFront.find((tile) => tile.x === 9 && tile.y === 8)?.kind).toBe("accent");
    expect(tribulationFront.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(originPalace.find((tile) => tile.x === 6 && tile.y === 3)?.kind).toBe("path");
    expect(originPalace.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("path");
    expect(originPalace.find((tile) => tile.x === 9 && tile.y === 6)?.kind).toBe("path");
    expect(originPalace.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(originPalace.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
  });

  it("adds landmark variants for iconic east-route maps", () => {
    const trialMaze = buildAdventureTerrainTiles({
      mapId: "24",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const spiritLake = buildAdventureTerrainTiles({
      mapId: "26",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const immortalIsland = buildAdventureTerrainTiles({
      mapId: "81",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const voidRift = buildAdventureTerrainTiles({
      mapId: "112",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(trialMaze.find((tile) => tile.x === 3 && tile.y === 3)?.kind).toBe("path");
    expect(trialMaze.find((tile) => tile.x === 8 && tile.y === 8)?.kind).toBe("path");
    expect(spiritLake.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(spiritLake.find((tile) => tile.x === 5 && tile.y === 5)?.kind).toBe("accent");
    expect(immortalIsland.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(immortalIsland.find((tile) => tile.x === 3 && tile.y === 6)?.kind).toBe("water");
    expect(voidRift.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(voidRift.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("accent");
  });

  it("adds landmark variants for early east-route gateway maps", () => {
    const spiritField = buildAdventureTerrainTiles({
      mapId: "20",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const mistMarsh = buildAdventureTerrainTiles({
      mapId: "21",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const lakeMeadow = buildAdventureTerrainTiles({
      mapId: "22",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(spiritField.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(spiritField.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("water");
    expect(spiritField.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("water");
    expect(mistMarsh.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(mistMarsh.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("water");
    expect(mistMarsh.find((tile) => tile.x === 8 && tile.y === 8)?.kind).toBe("water");
    expect(lakeMeadow.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(lakeMeadow.find((tile) => tile.x === 6 && tile.y === 3)?.kind).toBe("water");
  });

  it("adds landmark variants for mid east-route maps", () => {
    const darkForest = buildAdventureTerrainTiles({
      mapId: "50",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const miasmaBog = buildAdventureTerrainTiles({
      mapId: "51",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const thunderMarsh = buildAdventureTerrainTiles({
      mapId: "52",
      theme: "East",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(darkForest.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(darkForest.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(darkForest.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(miasmaBog.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("water");
    expect(miasmaBog.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("water");
    expect(miasmaBog.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("accent");
    expect(thunderMarsh.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(thunderMarsh.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(thunderMarsh.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("accent");
  });

  it("adds landmark variants for iconic west-route maps", () => {
    const bodyPool = buildAdventureTerrainTiles({
      mapId: "14",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const beastValley = buildAdventureTerrainTiles({
      mapId: "16",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const lavaInferno = buildAdventureTerrainTiles({
      mapId: "71",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const ancestorTemple = buildAdventureTerrainTiles({
      mapId: "102",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(bodyPool.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(bodyPool.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(beastValley.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(beastValley.find((tile) => tile.x === 4 && tile.y === 6)?.kind).toBe("accent");
    expect(lavaInferno.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
    expect(lavaInferno.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("water");
    expect(ancestorTemple.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("accent");
    expect(ancestorTemple.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
  });

  it("adds landmark variants for early west-route gateway maps", () => {
    const westForest = buildAdventureTerrainTiles({
      mapId: "10",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const hunterTrail = buildAdventureTerrainTiles({
      mapId: "11",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const valleyGate = buildAdventureTerrainTiles({
      mapId: "12",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(westForest.find((tile) => tile.x === 2 && tile.y === 6)?.kind).toBe("path");
    expect(westForest.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(hunterTrail.find((tile) => tile.x === 3 && tile.y === 8)?.kind).toBe("path");
    expect(hunterTrail.find((tile) => tile.x === 7 && tile.y === 4)?.kind).toBe("path");
    expect(valleyGate.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(valleyGate.find((tile) => tile.x === 4 && tile.y === 4)?.kind).toBe("accent");
    expect(valleyGate.find((tile) => tile.x === 8 && tile.y === 4)?.kind).toBe("accent");
  });

  it("adds landmark variants for mid west-route maps", () => {
    const beastNest = buildAdventureTerrainTiles({
      mapId: "40",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const manEaterJungle = buildAdventureTerrainTiles({
      mapId: "41",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });
    const flameWastes = buildAdventureTerrainTiles({
      mapId: "42",
      theme: "West",
      width: 12,
      height: 12,
      portals: [],
      npcs: [],
    });

    expect(beastNest.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("path");
    expect(beastNest.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(manEaterJungle.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("path");
    expect(manEaterJungle.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("path");
    expect(manEaterJungle.find((tile) => tile.x === 8 && tile.y === 6)?.kind).toBe("accent");
    expect(flameWastes.find((tile) => tile.x === 6 && tile.y === 2)?.kind).toBe("water");
    expect(flameWastes.find((tile) => tile.x === 6 && tile.y === 6)?.kind).toBe("water");
    expect(flameWastes.find((tile) => tile.x === 6 && tile.y === 9)?.kind).toBe("water");
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
