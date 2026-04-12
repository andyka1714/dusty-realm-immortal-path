import { describe, expect, it } from "vitest";
import { BOSS_ENEMIES } from "../../enemies/boss";
import {
  BOSS_DROP_QUALITY_TABLE,
  EQUIPMENT_PROFESSION_STAT_WEIGHTS,
  EQUIPMENT_REALM_AUDIT,
  ROUTE_DROP_PREFERENCES,
  SPLIT_REALM_BOSS_ROUTE_REGISTRY,
  getEquipmentRealmAudit,
} from "./audit";
import {
  EquipmentType,
  ItemQuality,
  MajorRealm,
  ProfessionType,
} from "../../../types";

describe("equipment audit registry", () => {
  it("covers every realm with stable equipment counts and path layout", () => {
    const mortal = getEquipmentRealmAudit(MajorRealm.Mortal);
    expect(mortal?.itemCount).toBe(6);
    expect(mortal?.paths.general?.itemIds).toHaveLength(6);

    EQUIPMENT_REALM_AUDIT.filter((entry) => entry.realm >= MajorRealm.QiRefining).forEach(
      (entry) => {
        expect(entry.itemCount, `${entry.realmName} 應有 18 件裝備`).toBe(18);
        expect(entry.paths.sword?.itemIds).toHaveLength(6);
        expect(entry.paths.body?.itemIds).toHaveLength(6);
        expect(entry.paths.mage?.itemIds).toHaveLength(6);
      }
    );
  });

  it("keeps the baseline quality ladder aligned with design intent", () => {
    expect(getEquipmentRealmAudit(MajorRealm.Mortal)?.baselineQuality).toBe(
      ItemQuality.Low
    );
    expect(getEquipmentRealmAudit(MajorRealm.QiRefining)?.baselineQuality).toBe(
      ItemQuality.Low
    );
    expect(getEquipmentRealmAudit(MajorRealm.Foundation)?.baselineQuality).toBe(
      ItemQuality.Medium
    );
    expect(getEquipmentRealmAudit(MajorRealm.GoldenCore)?.baselineQuality).toBe(
      ItemQuality.High
    );

    EQUIPMENT_REALM_AUDIT.filter((entry) => entry.realm >= MajorRealm.NascentSoul).forEach(
      (entry) => {
        expect(entry.baselineQuality, `${entry.realmName} 應以仙品為基底模板`).toBe(
          ItemQuality.Immortal
        );
      }
    );
  });

  it("keeps each profession set focused on its dominant combat stats", () => {
    EQUIPMENT_REALM_AUDIT.filter((entry) => entry.realm >= MajorRealm.QiRefining).forEach(
      (entry) => {
        const sword = entry.paths.sword!;
        const body = entry.paths.body!;
        const mage = entry.paths.mage!;

        expect(sword.baselineTotals.attack || 0).toBeGreaterThan(
          body.baselineTotals.attack || 0
        );
        expect(body.baselineTotals.defense || 0).toBeGreaterThan(
          sword.baselineTotals.defense || 0
        );
        expect(body.baselineTotals.hp || 0).toBeGreaterThan(
          mage.baselineTotals.hp || 0
        );
        expect(mage.baselineTotals.magic || 0).toBeGreaterThan(
          sword.baselineTotals.magic || 0
        );
      }
    );
  });

  it("keeps set totals growing realm by realm on primary progression stats", () => {
    const pathKeys = [
      ["sword", "attack"],
      ["body", "defense"],
      ["body", "hp"],
      ["mage", "magic"],
    ] as const;

    pathKeys.forEach(([pathKey, statKey]) => {
      let lastValue = -1;
      EQUIPMENT_REALM_AUDIT.filter((entry) => entry.realm >= MajorRealm.QiRefining).forEach(
        (entry) => {
          const value = entry.paths[pathKey]?.baselineTotals[statKey] || 0;
          expect(
            value,
            `${entry.realmName} 的 ${pathKey} 套裝 ${statKey} 應高於前一境界`
          ).toBeGreaterThan(lastValue);
          lastValue = value;
        }
      );
    });
  });

  it("derives complete low/medium/high/immortal quality bands for each set", () => {
    EQUIPMENT_REALM_AUDIT.filter((entry) => entry.realm >= MajorRealm.QiRefining).forEach(
      (entry) => {
        [entry.paths.sword!, entry.paths.body!, entry.paths.mage!].forEach((path) => {
          const lowAttack = path.qualityBands[ItemQuality.Low].totals.attack || 0;
          const mediumAttack =
            path.qualityBands[ItemQuality.Medium].totals.attack || 0;
          const highAttack = path.qualityBands[ItemQuality.High].totals.attack || 0;
          const immortalAttack =
            path.qualityBands[ItemQuality.Immortal].totals.attack || 0;
          const lowDefense = path.qualityBands[ItemQuality.Low].totals.defense || 0;
          const mediumDefense =
            path.qualityBands[ItemQuality.Medium].totals.defense || 0;
          const highDefense =
            path.qualityBands[ItemQuality.High].totals.defense || 0;
          const immortalDefense =
            path.qualityBands[ItemQuality.Immortal].totals.defense || 0;

          expect(mediumAttack).toBeGreaterThanOrEqual(lowAttack);
          expect(highAttack).toBeGreaterThanOrEqual(mediumAttack);
          expect(immortalAttack).toBeGreaterThanOrEqual(highAttack);
          expect(mediumDefense).toBeGreaterThanOrEqual(lowDefense);
          expect(highDefense).toBeGreaterThanOrEqual(mediumDefense);
          expect(immortalDefense).toBeGreaterThanOrEqual(highDefense);
        });
      }
    );
  });

  it("keeps split-realm boss drops aligned with route themes", () => {
    SPLIT_REALM_BOSS_ROUTE_REGISTRY.forEach(({ enemyId, realm, route }) => {
      const boss = BOSS_ENEMIES[enemyId];
      const audit = getEquipmentRealmAudit(realm);
      const expectedProfession = ROUTE_DROP_PREFERENCES[route].profession;
      const expectedItemIds =
        expectedProfession === ProfessionType.Sword
          ? new Set(audit?.paths.sword?.itemIds || [])
          : expectedProfession === ProfessionType.Body
            ? new Set(audit?.paths.body?.itemIds || [])
            : new Set(audit?.paths.mage?.itemIds || []);

      const equipmentDrops = boss.drops.filter((dropId) =>
        dropId in Object.fromEntries([...expectedItemIds].map((id) => [id, true]))
      );

      expect(equipmentDrops.length, `${enemyId} 應只掉對應路線裝備`).toBe(
        expectedItemIds.size
      );
      boss.drops
        .filter(
          (dropId) =>
            !dropId.startsWith("bt_") && !dropId.startsWith("manual_")
        )
        .forEach((dropId) => {
          expect(expectedItemIds.has(dropId), `${enemyId} 掉落 ${dropId} 路線錯誤`).toBe(
            true
          );
        });
    });
  });

  it("publishes formal profession weights, route preferences, and boss immortal rate", () => {
    expect(EQUIPMENT_PROFESSION_STAT_WEIGHTS[ProfessionType.Sword].attack).toBe(1);
    expect(EQUIPMENT_PROFESSION_STAT_WEIGHTS[ProfessionType.Body].defense).toBe(1);
    expect(EQUIPMENT_PROFESSION_STAT_WEIGHTS[ProfessionType.Mage].magic).toBe(1);
    expect(ROUTE_DROP_PREFERENCES.north.favoredTypes[0]).toBe(EquipmentType.Sword);
    expect(ROUTE_DROP_PREFERENCES.west.favoredStats).toContain("damageReduction");
    expect(ROUTE_DROP_PREFERENCES.east.favoredStats).toContain("mp");
    expect(BOSS_DROP_QUALITY_TABLE[ItemQuality.Immortal]).toBe(10);
    expect(BOSS_DROP_QUALITY_TABLE[ItemQuality.Low]).toBe(0);
  });
});
