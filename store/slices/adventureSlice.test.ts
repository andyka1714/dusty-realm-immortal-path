import { afterEach, describe, expect, it, vi } from "vitest";
import reducer, {
  applyWorldDamageToMonster,
  engageMonster,
  enterMap,
  movePlayer,
  resolveBattle,
  setWorldPlayerResources,
  setAutoConsumableSettings,
  tickMonsters,
} from "./adventureSlice";
import { ElementType, EnemyRank, MajorRealm } from "../../types";
import { getGridDistance } from "../../utils/worldCombat";
import { MAPS } from "../../data/maps";
import { isAdventureTerrainBlocked } from "../../utils/adventureTerrainNavigation";

const fixedRandom = vi.spyOn(Math, "random");

afterEach(() => {
  fixedRandom.mockRestore();
});

describe("adventure engagement flow", () => {
  it("initializes persisted auto consumable settings for HP and MP", () => {
    const state = reducer(undefined, { type: "@@INIT" });

    expect(state.autoConsumableSettings).toEqual({
      hp: { enabled: true, thresholdPercent: 45 },
      mp: { enabled: false, thresholdPercent: 25 },
    });
  });

  it("sanitizes auto consumable thresholds when settings are changed", () => {
    const state = reducer(
      undefined,
      setAutoConsumableSettings({
        hp: { enabled: false, thresholdPercent: 5 },
        mp: { enabled: true, thresholdPercent: 120 },
      })
    );

    expect(state.autoConsumableSettings).toEqual({
      hp: { enabled: false, thresholdPercent: 10 },
      mp: { enabled: true, thresholdPercent: 90 },
    });
  });

  it("stores live world player resources for shared HUD display", () => {
    const state = reducer(
      undefined,
      setWorldPlayerResources({
        hp: 42,
        maxHp: 280,
        mp: 96,
        maxMp: 130,
      })
    );

    expect(state.worldPlayerResources).toEqual({
      hp: 42,
      maxHp: 280,
      mp: 96,
      maxMp: 130,
    });
  });

  it("does not let the player move onto an NPC occupied cell", () => {
    const state = reducer(
      undefined,
      enterMap({ mapId: "0", startX: 20, startY: 16 })
    );

    const next = reducer(state, movePlayer({ dx: 0, dy: -1 }));

    expect(next.playerPosition).toEqual({ x: 20, y: 16 });
  });

  it("places quest navigation map entries next to NPCs instead of on top of them", () => {
    const state = reducer(
      undefined,
      enterMap({ mapId: "0", startX: 20, startY: 15 })
    );

    expect(state.playerPosition).not.toEqual({ x: 20, y: 15 });
    expect(
      Math.abs(state.playerPosition.x - 20) + Math.abs(state.playerPosition.y - 15)
    ).toBe(1);
  });

  it("does not let the player move onto a monster occupied cell", () => {
    let state = reducer(
      undefined,
      enterMap({ mapId: "20", startX: 20, startY: 20 })
    );
    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "blocking-monster",
          templateId: "m20_c1",
          name: "田間稻草人",
          symbol: "草",
          x: 21,
          y: 20,
          spawnX: 21,
          spawnY: 20,
          currentHp: 250,
          rank: EnemyRank.Common,
        },
      ],
    };

    const next = reducer(state, movePlayer({ dx: 1, dy: 0 }));

    expect(next.playerPosition).toEqual({ x: 20, y: 20 });
  });

  it("engages the selected monster instance instead of requiring tile collision", () => {
    let state = reducer(undefined, enterMap({ mapId: "20", startX: 20, startY: 20 }));

    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "target",
          templateId: "m20_c1",
          name: "田間稻草人",
          symbol: "草",
          x: 23,
          y: 20,
          spawnX: 23,
          spawnY: 20,
          currentHp: 250,
          rank: EnemyRank.Common,
        },
      ],
    };

    const next = reducer(state, engageMonster({ monsterInstanceId: "target" }));

    expect(next.isBattling).toBe(true);
    expect(next.currentEnemy?.id).toBe("m20_c1");
    expect(next.currentEnemyInstanceId).toBe("target");
  });

  it("removes the engaged monster instance after a win", () => {
    const state = {
      ...reducer(undefined, enterMap({ mapId: "20", startX: 20, startY: 20 })),
      isBattling: true,
      currentEnemy: {
        id: "m20_c1",
        name: "田間稻草人",
        realm: MajorRealm.Mortal,
        rank: EnemyRank.Common,
        hp: 250,
        maxHp: 250,
        attack: 28,
        defense: 10,
        element: ElementType.Wood,
        drops: [],
        exp: 12,
      },
      currentEnemyInstanceId: "target",
      activeMonsters: [
        {
          instanceId: "target",
          templateId: "m20_c1",
          name: "田間稻草人",
          symbol: "草",
          x: 23,
          y: 20,
          spawnX: 23,
          spawnY: 20,
          currentHp: 250,
          rank: EnemyRank.Common,
        },
        {
          instanceId: "other",
          templateId: "m20_c2",
          name: "偷糧碩鼠",
          symbol: "鼠",
          x: 24,
          y: 20,
          spawnX: 24,
          spawnY: 20,
          currentHp: 220,
          rank: EnemyRank.Common,
        },
      ],
    };

    const next = reducer(state, resolveBattle({ won: true, logs: [] }));

    expect(next.activeMonsters.map((monster) => monster.instanceId)).toEqual(["other"]);
  });

  it("does not auto-enter battle modal when enemies move into attack range", () => {
    let state = reducer(undefined, enterMap({ mapId: "20", startX: 20, startY: 20 }));

    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "ranged",
          templateId: "m20_c1",
          name: "田間稻草人",
          symbol: "草",
          x: 21,
          y: 20,
          spawnX: 21,
          spawnY: 20,
          currentHp: 250,
          rank: EnemyRank.Common,
          nextMoveTime: 0,
        },
      ],
    };

    state.currentMapId = "20";
    const next = reducer(state, tickMonsters());
    expect(next.isBattling).toBe(false);
    expect(next.currentEnemyInstanceId).toBeNull();
  });

  it("lets caster enemies hold preferred range instead of always closing in", () => {
    fixedRandom.mockReturnValue(0);

    let state = reducer(undefined, enterMap({ mapId: "26", startX: 20, startY: 20 }));
    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "caster",
          templateId: "m26_b1",
          name: "靈湖水蛟",
          symbol: "蛟",
          x: 25,
          y: 20,
          spawnX: 25,
          spawnY: 20,
          currentHp: 4650,
          rank: EnemyRank.Boss,
          nextMoveTime: 0,
        },
      ],
    };

    const next = reducer(state, tickMonsters());
    const caster = next.activeMonsters.find((monster) => monster.instanceId === "caster");
    expect(next.isBattling).toBe(false);
    expect(caster?.x).toBe(25);
    expect(caster).toBeDefined();
    expect(getGridDistance(caster!, next.playerPosition)).toBeGreaterThanOrEqual(5);
  });

  it("lets ranged and caster enemies backstep when the player gets too close", () => {
    fixedRandom.mockReturnValue(0);

    const map = MAPS.find((entry) => entry.id === "26")!;
    let lane = { x: 20, y: 20 };
    outer: for (let y = 1; y < map.height - 1; y += 1) {
      for (let x = 1; x < map.width - 2; x += 1) {
        if (
          !isAdventureTerrainBlocked(map, x, y) &&
          !isAdventureTerrainBlocked(map, x + 1, y) &&
          !isAdventureTerrainBlocked(map, x + 2, y)
        ) {
          lane = { x, y };
          break outer;
        }
      }
    }

    let state = reducer(undefined, enterMap({ mapId: "26", startX: lane.x, startY: lane.y }));
    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "caster",
          templateId: "m26_b1",
          name: "靈湖水蛟",
          symbol: "蛟",
          x: lane.x + 1,
          y: lane.y,
          spawnX: lane.x + 1,
          spawnY: lane.y,
          currentHp: 4650,
          rank: EnemyRank.Boss,
          nextMoveTime: 0,
        },
      ],
    };

    const next = reducer(state, tickMonsters());
    const caster = next.activeMonsters.find((monster) => monster.instanceId === "caster");
    expect(caster).toBeDefined();
    expect(caster?.x).toBeGreaterThan(state.activeMonsters[0].x);
    expect(getGridDistance(caster!, next.playerPosition)).toBeGreaterThan(
      getGridDistance(state.activeMonsters[0], state.playerPosition)
    );
  });

  it("applies direct world damage to the selected monster instance", () => {
    let state = reducer(undefined, enterMap({ mapId: "20", startX: 20, startY: 20 }));

    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "target",
          templateId: "m20_c1",
          name: "田間稻草人",
          symbol: "草",
          x: 21,
          y: 20,
          spawnX: 21,
          spawnY: 20,
          currentHp: 40,
          rank: EnemyRank.Common,
        },
      ],
    };

    const next = reducer(
      state,
      applyWorldDamageToMonster({ monsterInstanceId: "target", damage: 25 })
    );
    expect(next.activeMonsters[0].currentHp).toBe(15);

    const defeated = reducer(
      next,
      applyWorldDamageToMonster({ monsterInstanceId: "target", damage: 20 })
    );
    expect(defeated.activeMonsters).toHaveLength(0);
  });

  it("does not let monsters end movement on the player's occupied cell", () => {
    let state = reducer(undefined, enterMap({ mapId: "20", startX: 20, startY: 20 }));

    state = {
      ...state,
      activeMonsters: [
        {
          instanceId: "adjacent",
          templateId: "m20_c1",
          name: "田間稻草人",
          symbol: "草",
          x: 21,
          y: 20,
          spawnX: 21,
          spawnY: 20,
          currentHp: 250,
          rank: EnemyRank.Common,
          nextMoveTime: 0,
        },
      ],
    };

    const next = reducer(state, tickMonsters());
    expect(next.activeMonsters[0].x === next.playerPosition.x && next.activeMonsters[0].y === next.playerPosition.y).toBe(false);
  });

  it("spawns monsters away from the player's starting cell", () => {
    fixedRandom.mockReturnValue(0);

    const state = reducer(undefined, enterMap({ mapId: "20", startX: 0, startY: 0 }));
    expect(
      state.activeMonsters.every(
        (monster) => monster.x !== state.playerPosition.x || monster.y !== state.playerPosition.y
      )
    ).toBe(true);
  });
});
