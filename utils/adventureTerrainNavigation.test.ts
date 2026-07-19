import { describe, expect, it } from "vitest";
import { MAPS } from "../data/maps";
import { findAdventurePath, getAdventureTerrainBlockedCoordinates, isAdventureTerrainBlocked } from "./adventureTerrainNavigation";

describe("adventure terrain navigation", () => {
  it("keeps portals and NPC approach cells traversable", () => {
    const map = MAPS.find((entry) => entry.id === "0")!;
    map.portals.forEach((portal) => expect(isAdventureTerrainBlocked(map, portal.x, portal.y)).toBe(false));
    map.npcs.forEach((npc) => expect(isAdventureTerrainBlocked(map, npc.x + 1, npc.y)).toBe(false));
  });

  it("creates real blocked terrain on exploration maps", () => {
    const map = MAPS.find((entry) => entry.id === "21")!;
    expect(getAdventureTerrainBlockedCoordinates(map).size).toBeGreaterThan(0);
  });

  it("routes around blocked terrain without crossing it", () => {
    const map = MAPS.find((entry) => entry.id === "21")!;
    const path = findAdventurePath({ start: map.portals[0], end: map.portals[1], mapData: map });
    expect(path.length).toBeGreaterThan(0);
    expect(path.every((point) => !isAdventureTerrainBlocked(map, point.x, point.y))).toBe(true);
  });
});
