import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ElementType, ProfessionType } from "../types";
import { COMMON_ENEMIES } from "../data/enemies/common";
import { getSkill } from "../data/skills";
import { resolvePlayerOffenseRoll } from "./battleOffense";
import { getPlayerPassiveFlags } from "./battlePassives";
import { buildStatusesFromSkill } from "./battleStatusEffectBuilders";
import {
  resolveEnemyWorldStrike,
  resolvePlayerWorldStrike,
  runAutoBattle,
} from "./battleSystem";
import type { PlayerCombatStats } from "./battleSystem";

let fixedRandom: ReturnType<typeof vi.spyOn>;

const createPlayer = (
  overrides: Partial<PlayerCombatStats> = {}
): PlayerCombatStats => ({
  hp: 2400,
  maxHp: 2400,
  mp: 800,
  maxMp: 800,
  attack: 420,
  magic: 160,
  defense: 180,
  res: 120,
  speed: 8,
  crit: 0,
  critDamage: 150,
  dodge: 0,
  blockRate: 0,
  damageReduction: 0,
  alchemyBonus: 0,
  craftingBonus: 0,
  breakthroughBonus: 0,
  dropRateBonus: 0,
  cultivationSpeedBonus: 0,
  name: "試煉修士",
  element: ElementType.None,
  regenHp: 0,
  profession: ProfessionType.Body,
  learnedSkills: [],
  ...overrides,
});

beforeEach(() => {
  fixedRandom = vi.spyOn(Math, "random").mockReturnValue(0.5);
});

afterEach(() => {
  fixedRandom.mockRestore();
});

describe("battle core follow-up statuses", () => {
  it("lets vulnerable amplify later timeline damage", () => {
    const player = createPlayer();
    const enemy = COMMON_ENEMIES.m30_c1;

    const baseline = resolvePlayerOffenseRoll({
      player,
      enemy,
      skillReady: false,
      passiveFlags: getPlayerPassiveFlags(player.learnedSkills),
      playerHp: player.hp,
      playerMp: player.mp,
      playerStatuses: [],
      enemyStatuses: [],
      bossBroken: false,
      playerDebuffed: false,
      mageFoundationStacks: 0,
      swordHeartStacks: 0,
      currentTimeMs: 0,
    });

    const exposed = resolvePlayerOffenseRoll({
      player,
      enemy,
      skillReady: false,
      passiveFlags: getPlayerPassiveFlags(player.learnedSkills),
      playerHp: player.hp,
      playerMp: player.mp,
      playerStatuses: [],
      enemyStatuses: [
        {
          id: "vulnerable",
          name: "易傷",
          kind: "vulnerable",
          value: 0.15,
          expiresAtMs: 2000,
        },
      ],
      bossBroken: false,
      playerDebuffed: false,
      mageFoundationStacks: 0,
      swordHeartStacks: 0,
      currentTimeMs: 0,
    });

    expect(exposed.playerDamage).toBeGreaterThan(baseline.playerDamage);
  });

  it("surfaces vulnerable on body spirit-severing active world strikes", () => {
    const activeSkill = getSkill("b_sf_active");
    expect(activeSkill).toBeTruthy();

    const player = createPlayer({
      learnedSkills: activeSkill ? [activeSkill] : [],
    });

    const strike = resolvePlayerWorldStrike(
      player,
      COMMON_ENEMIES.m30_c1,
      activeSkill
    );

    expect(strike.enemyStatusNames).toContain("易傷");
    expect(strike.enemyStatusNames).toContain("破甲");
  });

  it("formalizes beast-god-form as shared player-side statuses", () => {
    const activeSkill = getSkill("b_n_active");
    expect(activeSkill).toBeTruthy();

    const statuses = buildStatusesFromSkill(activeSkill!, 2400);

    expect(statuses.map((status) => status.kind)).toEqual(
      expect.arrayContaining(["damageAmp", "lifesteal", "controlImmune"])
    );
    expect(
      new Set(statuses.map((status) => status.name)).has("獸神附體")
    ).toBe(true);
  });

  it("lets beast-god-form amplify later timeline damage", () => {
    const player = createPlayer();
    const enemy = COMMON_ENEMIES.m30_c1;
    const beastStatuses = buildStatusesFromSkill(getSkill("b_n_active")!, player.maxHp).map(
      (status) => ({ ...status, expiresAtMs: 3000 })
    );

    const baseline = resolvePlayerOffenseRoll({
      player,
      enemy,
      skillReady: false,
      passiveFlags: getPlayerPassiveFlags(player.learnedSkills),
      playerHp: player.hp,
      playerMp: player.mp,
      playerStatuses: [],
      enemyStatuses: [],
      bossBroken: false,
      playerDebuffed: false,
      mageFoundationStacks: 0,
      swordHeartStacks: 0,
      currentTimeMs: 0,
    });

    const empowered = resolvePlayerOffenseRoll({
      player,
      enemy,
      skillReady: false,
      passiveFlags: getPlayerPassiveFlags(player.learnedSkills),
      playerHp: player.hp,
      playerMp: player.mp,
      playerStatuses: beastStatuses,
      enemyStatuses: [],
      bossBroken: false,
      playerDebuffed: false,
      mageFoundationStacks: 0,
      swordHeartStacks: 0,
      currentTimeMs: 0,
    });

    expect(empowered.playerDamage).toBeGreaterThan(baseline.playerDamage);
  });

  it("surfaces beast-god-form on world strikes and blocks incoming control", () => {
    const activeSkill = getSkill("b_n_active");
    expect(activeSkill).toBeTruthy();

    const player = createPlayer({
      profession: ProfessionType.Body,
      learnedSkills: activeSkill ? [activeSkill] : [],
    });
    const enemy = {
      ...COMMON_ENEMIES.m30_c1,
      specialAttack: {
        name: "縛魂雷索",
        cooldownSeconds: 2,
        damageMultiplier: 1,
        statusEffect: { id: "paralyze", duration: 1, chance: 1 },
        areaShape: "single" as const,
        areaRadius: 0,
        maxTargets: 1,
      },
    };

    const playerStrike = resolvePlayerWorldStrike(player, enemy, activeSkill);
    expect(playerStrike.playerStatusNames).toContain("獸神附體");

    const enemyStrike = resolveEnemyWorldStrike(enemy, player, true, ["獸神附體"]);
    expect(enemyStrike.statusNames).toContain("獸神附體");
    expect(enemyStrike.statusNames).not.toContain("麻痺");
  });

  it("logs beast-god-form on the timeline so replay can inherit the visibility", () => {
    const activeSkill = getSkill("b_n_active");
    expect(activeSkill).toBeTruthy();

    const player = createPlayer({
      profession: ProfessionType.Body,
      hp: 3200,
      maxHp: 3200,
      attack: 520,
      defense: 220,
      learnedSkills: activeSkill ? [activeSkill] : [],
    });

    const result = runAutoBattle(player, {
      ...COMMON_ENEMIES.m30_c1,
      hp: 2600,
      maxHp: 2600,
    });

    expect(result.logs.some((log) => log.message.includes("獸神附體"))).toBe(true);
    expect(
      result.logs.some((log) => (log.playerStatuses || []).includes("獸神附體"))
    ).toBe(true);
  });
});
