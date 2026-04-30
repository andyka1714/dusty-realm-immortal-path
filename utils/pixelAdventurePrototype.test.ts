import { describe, expect, it } from "vitest";
import { MAPS } from "../data/maps";
import { EnemyRank } from "../types";
import type { WorldCombatStagePresentation } from "./worldCombatPresentation";
import {
  buildPixelPrototypeScene,
  createPixelPrototypePixiAppOptions,
  getPixelPrototypeMetrics,
  PIXEL_PROTOTYPE_MAP_ID,
  resolveAdventureStageRenderMode,
} from "./pixelAdventurePrototype";

const map20 = MAPS.find((map) => map.id === PIXEL_PROTOTYPE_MAP_ID);
const map21 = MAPS.find((map) => map.id === "21");

describe("pixelAdventurePrototype", () => {
  it("uses integer pixel scales for desktop and mobile metrics", () => {
    const desktop = getPixelPrototypeMetrics({
      width: 600,
      height: 600,
      isMobile: false,
    });
    const mobile = getPixelPrototypeMetrics({
      width: 360,
      height: 640,
      isMobile: true,
    });

    expect(desktop.cellSize).toBe(48);
    expect(desktop.scale).toBe(3);
    expect(desktop.cols % 2).toBe(1);
    expect(desktop.rows % 2).toBe(1);

    expect(mobile.cellSize).toBe(32);
    expect(mobile.scale).toBe(2);
    expect(mobile.cols % 2).toBe(1);
    expect(mobile.rows % 2).toBe(1);
  });

  it("builds a supported map-20 prototype scene with melee, ranged, portal, and cue data", () => {
    expect(map20).toBeTruthy();
    const stagePresentation: WorldCombatStagePresentation = {
      playerRangeRadius: 1,
      enemyRangeRadius: 3,
      enemyAggroRadius: 5,
      enemyPreferredRadius: 4,
      showEnemyAggroRing: true,
      showEnemyPreferredRing: true,
      showEnemyDangerFill: true,
      showEnemyRetreatBand: false,
      showTargetFocusReticle: true,
      enemyRoleLabel: "遠程風箏",
      enemyRoleAccentColor: 0x60a5fa,
      enemyAggroColor: 0xf87171,
      enemyPreferredColor: 0x38bdf8,
      enemyDangerFillAlpha: 0.24,
      playerAttackCycle: {
        ready: false,
        remainingMs: 600,
        totalMs: 1200,
        fillPercent: 50,
      },
    };

    const model = buildPixelPrototypeScene({
      mapData: map20!,
      playerPosition: { x: 40, y: 40 },
      activeMonsters: [
        {
          instanceId: "monster-ranged",
          templateId: "m20_c1",
          name: "田間稻草人",
          x: 42,
          y: 40,
          currentHp: 30,
          rank: EnemyRank.Common,
          spawnX: 42,
          spawnY: 40,
        },
        {
          instanceId: "monster-melee",
          templateId: "m20_c2",
          name: "偷糧碩鼠",
          x: 39,
          y: 41,
          currentHp: 26,
          rank: EnemyRank.Common,
          spawnX: 39,
          spawnY: 41,
        },
      ],
      portals: map20!.portals,
      targetMonsterId: "monster-ranged",
      combatPresentation: stagePresentation,
      width: 600,
      height: 600,
      isMobile: false,
    });

    expect(model.supported).toBe(true);
    expect(model.mapId).toBe("20");
    expect(model.player.worldX).toBe(40);
    expect(model.monsters.map((monster) => monster.archetype).sort()).toEqual([
      "melee",
      "ranged",
    ]);
    expect(model.monsters.find((monster) => monster.instanceId === "monster-ranged")?.isTargeted).toBe(
      true
    );
    expect(model.portals.length).toBeGreaterThan(0);
    expect(model.cues.showDangerZone).toBe(true);
    expect(model.cues.showProjectileCue).toBe(true);
    expect(model.cues.showTargetFocus).toBe(true);
  });

  it("builds readable text-token metadata for the player and monsters", () => {
    expect(map20).toBeTruthy();

    const model = buildPixelPrototypeScene({
      mapData: map20!,
      playerPosition: { x: 40, y: 40 },
      activeMonsters: [
        {
          instanceId: "monster-ranged",
          templateId: "m20_c1",
          name: "蝕骨田鼬",
          x: 42,
          y: 40,
          currentHp: 30,
          rank: EnemyRank.Common,
          spawnX: 42,
          spawnY: 40,
        },
        {
          instanceId: "monster-melee",
          templateId: "m20_c2",
          name: "偷糧碩鼠",
          x: 39,
          y: 41,
          currentHp: 26,
          rank: EnemyRank.Common,
          spawnX: 39,
          spawnY: 41,
        },
      ],
      portals: map20!.portals,
      targetMonsterId: "monster-ranged",
      combatPresentation: null,
      width: 600,
      height: 600,
      isMobile: false,
    });

    expect(model.player.tokenLabel).toBe("我");
    expect(model.player.tokenTone).toBe("player");
    expect(
      model.monsters.find((monster) => monster.instanceId === "monster-ranged")
        ?.tokenLabel
    ).toBe("鼬");
    expect(
      model.monsters.find((monster) => monster.instanceId === "monster-melee")
        ?.tokenLabel
    ).toBe("鼠");
    expect(
      model.monsters.find((monster) => monster.instanceId === "monster-ranged")
        ?.tokenTone
    ).toBe("enemy");
  });

  it("rejects maps outside the representative prototype scope", () => {
    expect(map21).toBeTruthy();

    const model = buildPixelPrototypeScene({
      mapData: map21!,
      playerPosition: { x: 40, y: 40 },
      activeMonsters: [],
      portals: map21!.portals,
      targetMonsterId: null,
      combatPresentation: null,
      width: 600,
      height: 600,
      isMobile: false,
    });

    expect(model.supported).toBe(false);
    expect(model.reason).toContain("東郊靈田");
  });

  it("only allows pixel prototype mode on the representative map", () => {
    expect(
      resolveAdventureStageRenderMode({
        requestedMode: "pixel_prototype",
        mapId: PIXEL_PROTOTYPE_MAP_ID,
      })
    ).toBe("pixel_prototype");

    expect(
      resolveAdventureStageRenderMode({
        requestedMode: "pixel_prototype",
        mapId: "21",
      })
    ).toBe("official");

    expect(
      resolveAdventureStageRenderMode({
        requestedMode: "official",
        mapId: PIXEL_PROTOTYPE_MAP_ID,
      })
    ).toBe("official");
  });

  it("forces canvas renderer options so automated browser captures do not crash on headless renderer detection", () => {
    const options = createPixelPrototypePixiAppOptions({
      width: 528,
      height: 528,
    });

    expect(options.forceCanvas).toBe(true);
    expect(options.antialias).toBe(false);
    expect(options.autoDensity).toBe(false);
    expect(options.resolution).toBe(1);
  });
});
