import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../../types";
import {
  getCombatProfessions,
  getHighRealmCatchUpSpec,
  getHighRealmCultivationSpec,
  getHighRealmProgressionSummaryRows,
  getOrderedRealms,
  getRealmTtkTargets,
  HIGH_REALM_PROGRESSION_REALMS,
} from "./balanceAudit";

describe("progression balance audit registry", () => {
  it("defines ttk targets for every realm and combat profession", () => {
    for (const realm of getOrderedRealms()) {
      const targets = getRealmTtkTargets(realm);
      expect(targets).toBeTruthy();

      for (const profession of getCombatProfessions()) {
        const profile = targets[profession];
        expect(profile).toBeTruthy();
        expect(profile.normal.minSeconds).toBeLessThan(profile.normal.maxSeconds);
        expect(profile.elite.minSeconds).toBeLessThan(profile.elite.maxSeconds);
        expect(profile.boss.minSeconds).toBeLessThan(profile.boss.maxSeconds);
        expect(profile.normal.maxSeconds).toBeLessThan(profile.elite.minSeconds);
        expect(profile.elite.maxSeconds).toBeLessThan(profile.boss.minSeconds);
      }
    }
  });

  it("keeps sword as the fastest boss killer and body as the tankiest profile", () => {
    for (const realm of getOrderedRealms()) {
      const targets = getRealmTtkTargets(realm);
      expect(
        targets[ProfessionType.Sword].boss.maxSeconds
      ).toBeLessThanOrEqual(targets[ProfessionType.Mage].boss.maxSeconds);
      expect(
        targets[ProfessionType.Mage].boss.maxSeconds
      ).toBeLessThanOrEqual(targets[ProfessionType.Body].boss.maxSeconds);

      expect(
        targets[ProfessionType.Body].normal.minSeconds
      ).toBeGreaterThanOrEqual(targets[ProfessionType.Sword].normal.minSeconds);
    }
  });

  it("defines monotonic high-realm cultivation multipliers", () => {
    let previousTotalMultiplier = 0;

    for (const realm of HIGH_REALM_PROGRESSION_REALMS) {
      const spec = getHighRealmCultivationSpec(realm);
      expect(spec).toBeTruthy();
      expect(spec.pillMultiplier).toBeGreaterThan(1);
      expect(spec.dwellingMultiplier).toBeGreaterThan(1);
      expect(spec.encounterMultiplier).toBeGreaterThan(1);
      expect(spec.eventMultiplier).toBeGreaterThan(1);
      expect(spec.targetTotalMultiplier).toBeGreaterThan(previousTotalMultiplier);
      previousTotalMultiplier = spec.targetTotalMultiplier;
    }
  });

  it("defines monotonic high-realm catch-up specs", () => {
    let previousFirstKillBonus = 0;

    for (const realm of HIGH_REALM_PROGRESSION_REALMS) {
      const spec = getHighRealmCatchUpSpec(realm);
      expect(spec).toBeTruthy();
      expect(spec.firstKillExpBonus).toBeGreaterThan(previousFirstKillBonus);
      expect(spec.eliteDropBonus).toBeGreaterThan(0);
      expect(spec.seclusionCostReduction).toBeGreaterThan(0);
      expect(spec.underTargetRealmBonus).toBeGreaterThan(0);
      previousFirstKillBonus = spec.firstKillExpBonus;
    }
  });

  it("exposes ordered summary rows for audit documents", () => {
    const rows = getHighRealmProgressionSummaryRows();
    expect(rows.map((row) => row.realm)).toEqual([
      MajorRealm.SpiritSevering,
      MajorRealm.VoidRefining,
      MajorRealm.Fusion,
      MajorRealm.Mahayana,
      MajorRealm.Tribulation,
      MajorRealm.Immortal,
      MajorRealm.ImmortalEmperor,
    ]);
  });
});
