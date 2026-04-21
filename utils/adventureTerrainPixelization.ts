import type { NPC, Portal } from "../types";

export type AdventureTerrainTileKind =
  | "base"
  | "alt"
  | "accent"
  | "water"
  | "path";

export type AdventureTerrainDetailKind =
  | "none"
  | "bars"
  | "dots"
  | "ripples"
  | "cracks"
  | "glyph";

export interface AdventureTerrainPalette {
  theme: string;
  backgroundColor: number;
  gridColor: number;
  fillColors: Record<AdventureTerrainTileKind, number>;
  detailColor: number;
}

export interface AdventureTerrainTile {
  x: number;
  y: number;
  kind: AdventureTerrainTileKind;
  fillColor: number;
  detailColor: number;
  detailKind: AdventureTerrainDetailKind;
}

interface AdventureTerrainPaletteConfig extends AdventureTerrainPalette {
  waterChance: number;
  accentChance: number;
  altChance: number;
  detailChance: number;
  detailKinds: Record<AdventureTerrainTileKind, AdventureTerrainDetailKind>;
}

interface BuildAdventureTerrainTilesInput {
  mapId: string;
  theme: string;
  width: number;
  height: number;
  portals: Portal[];
  npcs?: Pick<NPC, "x" | "y">[];
  bossSpawn?: { x: number; y: number };
}

interface TerrainZone {
  x: number;
  y: number;
  radius: number;
}

interface ForcedTerrainZone extends TerrainZone {
  kind: AdventureTerrainTileKind;
}

const DEFAULT_PALETTE: AdventureTerrainPaletteConfig = {
  theme: "Default",
  backgroundColor: 0x14110f,
  gridColor: 0x3f3a34,
  fillColors: {
    base: 0x2c3a27,
    alt: 0x24311f,
    accent: 0x546b35,
    water: 0x29485a,
    path: 0x6b5a3a,
  },
  detailColor: 0xb9c37a,
  waterChance: 0.07,
  accentChance: 0.17,
  altChance: 0.36,
  detailChance: 0.18,
  detailKinds: {
    base: "bars",
    alt: "dots",
    accent: "bars",
    water: "ripples",
    path: "dots",
  },
};

const TERRAIN_PALETTES: Record<string, AdventureTerrainPaletteConfig> = {
  East: {
    theme: "East",
    backgroundColor: 0x120f0b,
    gridColor: 0x31462f,
    fillColors: {
      base: 0x355f32,
      alt: 0x2d512b,
      accent: 0x6f8f3a,
      water: 0x2f6f8c,
      path: 0x8a744d,
    },
    detailColor: 0xc49b4f,
    waterChance: 0.12,
    accentChance: 0.19,
    altChance: 0.4,
    detailChance: 0.22,
    detailKinds: {
      base: "dots",
      alt: "bars",
      accent: "bars",
      water: "ripples",
      path: "dots",
    },
  },
  West: {
    theme: "West",
    backgroundColor: 0x120d0b,
    gridColor: 0x4a362c,
    fillColors: {
      base: 0x4b3c28,
      alt: 0x3d2f20,
      accent: 0x77522a,
      water: 0x4a2f25,
      path: 0x8a693f,
    },
    detailColor: 0xd29a52,
    waterChance: 0.03,
    accentChance: 0.22,
    altChance: 0.4,
    detailChance: 0.16,
    detailKinds: {
      base: "cracks",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "dots",
    },
  },
  North: {
    theme: "North",
    backgroundColor: 0x0d1015,
    gridColor: 0x384756,
    fillColors: {
      base: 0x3f5364,
      alt: 0x324451,
      accent: 0x8ca7b8,
      water: 0x4a7fa0,
      path: 0x6f7b86,
    },
    detailColor: 0xdce8f0,
    waterChance: 0.08,
    accentChance: 0.16,
    altChance: 0.42,
    detailChance: 0.14,
    detailKinds: {
      base: "cracks",
      alt: "dots",
      accent: "dots",
      water: "ripples",
      path: "dots",
    },
  },
  Sect: {
    theme: "Sect",
    backgroundColor: 0x100d0a,
    gridColor: 0x5a4936,
    fillColors: {
      base: 0x5f5648,
      alt: 0x4a4338,
      accent: 0x786c58,
      water: 0x39546a,
      path: 0x8b7758,
    },
    detailColor: 0xd2c0a1,
    waterChance: 0.02,
    accentChance: 0.14,
    altChance: 0.38,
    detailChance: 0.15,
    detailKinds: {
      base: "glyph",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "glyph",
    },
  },
  Center: {
    theme: "Center",
    backgroundColor: 0x140f0b,
    gridColor: 0x4d4133,
    fillColors: {
      base: 0x4d4336,
      alt: 0x40372c,
      accent: 0x826845,
      water: 0x3b5060,
      path: 0x8a724f,
    },
    detailColor: 0xd8b36c,
    waterChance: 0.04,
    accentChance: 0.18,
    altChance: 0.39,
    detailChance: 0.16,
    detailKinds: {
      base: "dots",
      alt: "cracks",
      accent: "glyph",
      water: "ripples",
      path: "dots",
    },
  },
  Void: {
    theme: "Void",
    backgroundColor: 0x0b0d13,
    gridColor: 0x273245,
    fillColors: {
      base: 0x1a2230,
      alt: 0x141b25,
      accent: 0x325063,
      water: 0x243a50,
      path: 0x4d5566,
    },
    detailColor: 0x9ec2da,
    waterChance: 0.06,
    accentChance: 0.18,
    altChance: 0.45,
    detailChance: 0.15,
    detailKinds: {
      base: "dots",
      alt: "cracks",
      accent: "glyph",
      water: "ripples",
      path: "glyph",
    },
  },
  Spirit: {
    theme: "Spirit",
    backgroundColor: 0x0d120f,
    gridColor: 0x2d5a4a,
    fillColors: {
      base: 0x284537,
      alt: 0x21392d,
      accent: 0x4b7f60,
      water: 0x366372,
      path: 0x75674d,
    },
    detailColor: 0xc5e3bf,
    waterChance: 0.05,
    accentChance: 0.19,
    altChance: 0.37,
    detailChance: 0.17,
    detailKinds: {
      base: "bars",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "dots",
    },
  },
  Sea: {
    theme: "Sea",
    backgroundColor: 0x0b1015,
    gridColor: 0x28586d,
    fillColors: {
      base: 0x1d4251,
      alt: 0x173644,
      accent: 0x3c7389,
      water: 0x2a6f83,
      path: 0x6b7c73,
    },
    detailColor: 0xb4e3eb,
    waterChance: 0.18,
    accentChance: 0.15,
    altChance: 0.35,
    detailChance: 0.18,
    detailKinds: {
      base: "ripples",
      alt: "dots",
      accent: "bars",
      water: "ripples",
      path: "dots",
    },
  },
  Sky: {
    theme: "Sky",
    backgroundColor: 0x0c1017,
    gridColor: 0x5a7188,
    fillColors: {
      base: 0x516577,
      alt: 0x425463,
      accent: 0x8fa4b7,
      water: 0x5f7f95,
      path: 0x8e8575,
    },
    detailColor: 0xe5eef5,
    waterChance: 0.03,
    accentChance: 0.2,
    altChance: 0.4,
    detailChance: 0.13,
    detailKinds: {
      base: "dots",
      alt: "cracks",
      accent: "bars",
      water: "ripples",
      path: "glyph",
    },
  },
  Dark: {
    theme: "Dark",
    backgroundColor: 0x0f0b0d,
    gridColor: 0x5a3442,
    fillColors: {
      base: 0x2f1f27,
      alt: 0x24171e,
      accent: 0x5b3742,
      water: 0x372a34,
      path: 0x685248,
    },
    detailColor: 0xf0a3ad,
    waterChance: 0.03,
    accentChance: 0.22,
    altChance: 0.46,
    detailChance: 0.14,
    detailKinds: {
      base: "cracks",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "dots",
    },
  },
  Thunder: {
    theme: "Thunder",
    backgroundColor: 0x0d0f15,
    gridColor: 0x53618a,
    fillColors: {
      base: 0x2a3246,
      alt: 0x202739,
      accent: 0x596d9d,
      water: 0x364a70,
      path: 0x707589,
    },
    detailColor: 0xe6dd8d,
    waterChance: 0.05,
    accentChance: 0.2,
    altChance: 0.42,
    detailChance: 0.15,
    detailKinds: {
      base: "cracks",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "dots",
    },
  },
  Immortal: {
    theme: "Immortal",
    backgroundColor: 0x0d1012,
    gridColor: 0x497c72,
    fillColors: {
      base: 0x23463e,
      alt: 0x1c3933,
      accent: 0x4c8a7b,
      water: 0x3e6c77,
      path: 0x8c7b58,
    },
    detailColor: 0xd9f4d7,
    waterChance: 0.05,
    accentChance: 0.18,
    altChance: 0.4,
    detailChance: 0.16,
    detailKinds: {
      base: "bars",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "glyph",
    },
  },
  Ultimate: {
    theme: "Ultimate",
    backgroundColor: 0x09090b,
    gridColor: 0x6a5344,
    fillColors: {
      base: 0x1d1c20,
      alt: 0x151419,
      accent: 0x5b4738,
      water: 0x2a313c,
      path: 0x88714f,
    },
    detailColor: 0xf2c679,
    waterChance: 0.02,
    accentChance: 0.24,
    altChance: 0.48,
    detailChance: 0.13,
    detailKinds: {
      base: "cracks",
      alt: "dots",
      accent: "glyph",
      water: "ripples",
      path: "glyph",
    },
  },
};

const hashNoise = (seed: number, x: number, y: number, salt: number) => {
  const value = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233 + seed * 0.173 + salt * 19.19);
  return value - Math.floor(value);
};

const createSeed = (mapId: string, theme: string) =>
  `${mapId}:${theme}`.split("").reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 3), 17);

const isNearPoint = (
  x: number,
  y: number,
  points: { x: number; y: number }[],
  radius: number
) => points.some((point) => Math.abs(point.x - x) <= radius && Math.abs(point.y - y) <= radius);

const isInsideZone = (x: number, y: number, zones: TerrainZone[]) =>
  zones.some((zone) => Math.abs(zone.x - x) <= zone.radius && Math.abs(zone.y - y) <= zone.radius);

const resolveForcedKind = (
  x: number,
  y: number,
  zones: ForcedTerrainZone[]
): AdventureTerrainTileKind | null => {
  for (const zone of zones) {
    if (Math.abs(zone.x - x) <= zone.radius && Math.abs(zone.y - y) <= zone.radius) {
      return zone.kind;
    }
  }
  return null;
};

const getPaletteConfig = (theme: string): AdventureTerrainPaletteConfig =>
  TERRAIN_PALETTES[theme] ?? DEFAULT_PALETTE;

const clampPoint = (value: number, max: number) => Math.max(0, Math.min(value, max));

const pushHorizontalLine = (
  zones: ForcedTerrainZone[],
  y: number,
  fromX: number,
  toX: number,
  kind: AdventureTerrainTileKind
) => {
  for (let x = fromX; x <= toX; x += 1) {
    zones.push({ x, y, radius: 0, kind });
  }
};

const pushVerticalLine = (
  zones: ForcedTerrainZone[],
  x: number,
  fromY: number,
  toY: number,
  kind: AdventureTerrainTileKind
) => {
  for (let y = fromY; y <= toY; y += 1) {
    zones.push({ x, y, radius: 0, kind });
  }
};

const buildOrthogonalRoute = (
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  const points: { x: number; y: number }[] = [];
  const stepX = from.x <= to.x ? 1 : -1;
  const stepY = from.y <= to.y ? 1 : -1;

  for (let x = from.x; x !== to.x; x += stepX) {
    points.push({ x, y: from.y });
  }
  points.push({ x: to.x, y: from.y });

  for (let y = from.y; y !== to.y; y += stepY) {
    points.push({ x: to.x, y });
  }
  points.push({ x: to.x, y: to.y });

  return points;
};

const buildStructuredZones = ({
  theme,
  width,
  height,
  portals,
  npcs,
}: {
  theme: string;
  width: number;
  height: number;
  portals: Portal[];
  npcs: Pick<NPC, "x" | "y">[];
}) => {
  if (theme !== "Center" && theme !== "Sect") {
    return {
      pathPoints: [...portals.map((portal) => ({ x: portal.x, y: portal.y })), ...npcs],
      plazaZones: [] as TerrainZone[],
    };
  }

  const fallbackHub = {
    x: clampPoint(Math.floor(width / 2), width - 1),
    y: clampPoint(Math.floor(height / 2), height - 1),
  };
  const npcHub =
    npcs.length > 0
      ? {
          x: clampPoint(
            Math.round(npcs.reduce((sum, npc) => sum + npc.x, 0) / npcs.length),
            width - 1
          ),
          y: clampPoint(
            Math.round(npcs.reduce((sum, npc) => sum + npc.y, 0) / npcs.length),
            height - 1
          ),
        }
      : fallbackHub;

  const pathPoints = [
    ...portals.map((portal) => ({ x: portal.x, y: portal.y })),
    ...npcs.map((npc) => ({ x: npc.x, y: npc.y })),
    ...buildOrthogonalRoute(fallbackHub, npcHub),
  ];

  portals.forEach((portal) => {
    pathPoints.push(...buildOrthogonalRoute({ x: portal.x, y: portal.y }, npcHub));
  });
  npcs.forEach((npc) => {
    pathPoints.push(...buildOrthogonalRoute({ x: npc.x, y: npc.y }, npcHub));
  });

  const plazaZones: TerrainZone[] = [
    { ...npcHub, radius: theme === "Center" ? 2 : 1 },
    ...npcs.map((npc) => ({ x: npc.x, y: npc.y, radius: 2 })),
    ...portals.map((portal) => ({ x: portal.x, y: portal.y, radius: 1 })),
  ];

  return { pathPoints, plazaZones };
};

const buildThemeMacroZones = ({
  mapId,
  theme,
  width,
  height,
}: {
  mapId: string;
  theme: string;
  width: number;
  height: number;
}) => {
  const centerX = clampPoint(Math.floor(width / 2), width - 1);
  const centerY = clampPoint(Math.floor(height / 2), height - 1);
  const forcedZones: ForcedTerrainZone[] = [];

  if (theme === "Sea") {
    pushHorizontalLine(forcedZones, centerY, 2, width - 3, "water");
  }

  if (theme === "Thunder") {
    pushVerticalLine(forcedZones, centerX, 2, height - 3, "accent");
  }

  if (theme === "Void") {
    pushVerticalLine(forcedZones, centerX, 2, height - 3, "water");
    forcedZones.push({ x: centerX - 1, y: centerY - 1, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX + 1, y: centerY + 1, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX - 1, y: centerY + 1, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX + 1, y: centerY - 1, radius: 0, kind: "accent" });
  }

  if (theme === "Spirit") {
    forcedZones.push({ x: centerX, y: centerY, radius: 0, kind: "path" });
    forcedZones.push({ x: centerX - 2, y: centerY, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX + 2, y: centerY, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX, y: centerY - 2, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX, y: centerY + 2, radius: 0, kind: "accent" });
  }

  if (theme === "Sky") {
    pushVerticalLine(forcedZones, centerX, 2, height - 3, "path");
    forcedZones.push({ x: centerX - 2, y: centerY - 2, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX - 1, y: centerY - 1, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX + 1, y: centerY + 1, radius: 0, kind: "accent" });
    forcedZones.push({ x: centerX + 2, y: centerY + 2, radius: 0, kind: "accent" });
  }

  if (theme === "Dark") {
    forcedZones.push({ x: centerX, y: centerY, radius: 1, kind: "water" });
    pushHorizontalLine(forcedZones, centerY, centerX - 2, centerX + 2, "accent");
    pushVerticalLine(forcedZones, centerX, centerY - 2, centerY + 2, "accent");
    forcedZones.push({ x: centerX, y: centerY, radius: 0, kind: "water" });
  }

  if (theme === "Immortal") {
    if (mapId === "170") {
      pushVerticalLine(forcedZones, centerX, 2, height - 3, "path");
      pushHorizontalLine(forcedZones, centerY, centerX - 3, centerX + 3, "path");
      forcedZones.push({ x: centerX - 1, y: centerY, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 1, y: centerY, radius: 0, kind: "accent" });
    } else if (mapId === "171") {
      pushHorizontalLine(forcedZones, centerY - 3, 2, width - 3, "path");
      pushHorizontalLine(forcedZones, centerY, 2, width - 3, "path");
      pushHorizontalLine(forcedZones, centerY + 3, 2, width - 3, "path");
      pushVerticalLine(forcedZones, centerX, centerY - 3, centerY + 3, "accent");
    } else if (mapId === "172") {
      pushVerticalLine(forcedZones, centerX - 3, 2, height - 3, "accent");
      pushVerticalLine(forcedZones, centerX, 2, height - 3, "accent");
      pushVerticalLine(forcedZones, centerX + 3, 2, height - 3, "accent");
      pushHorizontalLine(forcedZones, centerY, centerX - 2, centerX + 2, "path");
    } else {
      forcedZones.push({ x: centerX, y: centerY, radius: 1, kind: "path" });
      forcedZones.push({ x: centerX - 3, y: centerY, radius: 1, kind: "path" });
      forcedZones.push({ x: centerX + 3, y: centerY, radius: 1, kind: "path" });
      forcedZones.push({ x: centerX, y: centerY - 3, radius: 1, kind: "path" });
    }
  }

  if (theme === "Ultimate") {
    if (mapId === "181") {
      pushHorizontalLine(forcedZones, centerY, centerX - 3, centerX + 3, "path");
      pushVerticalLine(forcedZones, centerX, centerY - 3, centerY + 3, "path");
      forcedZones.push({ x: centerX - 3, y: centerY - 3, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 3, y: centerY - 3, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX - 3, y: centerY + 3, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 3, y: centerY + 3, radius: 0, kind: "accent" });
    } else if (mapId === "182") {
      pushVerticalLine(forcedZones, centerX, 2, height - 3, "water");
      forcedZones.push({ x: centerX - 1, y: centerY - 1, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 1, y: centerY - 1, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX - 1, y: centerY + 1, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 1, y: centerY + 1, radius: 0, kind: "accent" });
    } else {
      forcedZones.push({ x: centerX, y: centerY, radius: 0, kind: "path" });
      forcedZones.push({ x: centerX - 1, y: centerY - 1, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 1, y: centerY - 1, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX - 1, y: centerY + 1, radius: 0, kind: "accent" });
      forcedZones.push({ x: centerX + 1, y: centerY + 1, radius: 0, kind: "accent" });
    }
  }

  return forcedZones;
};

const buildBossArenaZones = ({
  bossSpawn,
  width,
  height,
}: {
  bossSpawn?: { x: number; y: number };
  width: number;
  height: number;
}) => {
  if (!bossSpawn) {
    return [] as ForcedTerrainZone[];
  }

  const centerX = clampPoint(bossSpawn.x, width - 1);
  const centerY = clampPoint(bossSpawn.y, height - 1);
  const forcedZones: ForcedTerrainZone[] = [{ x: centerX, y: centerY, radius: 1, kind: "path" }];

  pushHorizontalLine(
    forcedZones,
    centerY,
    clampPoint(centerX - 2, width - 1),
    clampPoint(centerX + 2, width - 1),
    "accent"
  );
  pushVerticalLine(
    forcedZones,
    centerX,
    clampPoint(centerY - 2, height - 1),
    clampPoint(centerY + 2, height - 1),
    "accent"
  );

  return forcedZones;
};

export const resolveAdventureTerrainPalette = (theme: string): AdventureTerrainPalette => {
  const palette = getPaletteConfig(theme);
  return {
    theme: palette.theme,
    backgroundColor: palette.backgroundColor,
    gridColor: palette.gridColor,
    fillColors: palette.fillColors,
    detailColor: palette.detailColor,
  };
};

const resolveTileKind = ({
  seed,
  x,
  y,
  palette,
  pathPoints,
  plazaZones,
  forcedZones,
}: {
  seed: number;
  x: number;
  y: number;
  palette: AdventureTerrainPaletteConfig;
  pathPoints: { x: number; y: number }[];
  plazaZones: TerrainZone[];
  forcedZones: ForcedTerrainZone[];
}): AdventureTerrainTileKind => {
  const forcedKind = resolveForcedKind(x, y, forcedZones);
  if (forcedKind) {
    return forcedKind;
  }
  if (isInsideZone(x, y, plazaZones)) {
    return "path";
  }
  if (isNearPoint(x, y, pathPoints, 1)) {
    return "path";
  }

  const primaryNoise = hashNoise(seed, x, y, 1);
  const secondaryNoise = hashNoise(seed, x, y, 2);

  if (primaryNoise < palette.waterChance) return "water";
  if (secondaryNoise < palette.accentChance) return "accent";
  if (primaryNoise < palette.altChance) return "alt";
  return "base";
};

export const buildAdventureTerrainTiles = ({
  mapId,
  theme,
  width,
  height,
  portals,
  npcs = [],
  bossSpawn,
}: BuildAdventureTerrainTilesInput): AdventureTerrainTile[] => {
  const palette = getPaletteConfig(theme);
  const seed = createSeed(mapId, theme);
  const { pathPoints, plazaZones } = buildStructuredZones({
    theme,
    width,
    height,
    portals,
    npcs,
  });
  const forcedZones = buildThemeMacroZones({
    mapId,
    theme,
    width,
    height,
  });
  const bossArenaZones = buildBossArenaZones({
    bossSpawn,
    width,
    height,
  });

  const tiles: AdventureTerrainTile[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const kind = resolveTileKind({
        seed,
        x,
        y,
        palette,
        pathPoints,
        plazaZones,
        forcedZones: [...bossArenaZones, ...forcedZones],
      });
      const detailNoise = hashNoise(seed, x, y, 5);
      const showDetail =
        kind !== "path" && detailNoise < palette.detailChance
          ? true
          : kind === "path" && detailNoise < palette.detailChance * 0.5;
      tiles.push({
        x,
        y,
        kind,
        fillColor: palette.fillColors[kind],
        detailColor: palette.detailColor,
        detailKind: showDetail ? palette.detailKinds[kind] : "none",
      });
    }
  }

  return tiles;
};
