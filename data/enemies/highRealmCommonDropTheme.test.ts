import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../../types";
import { COMMON_ENEMIES } from "./common";
import { getEquipmentRealmAudit } from "../items/equipment/audit";

const TRI_THEME_MAP_IDS = [120, 130, 140, 150, 160, 170, 180];
const DUAL_THEME_MAP_IDS = [121, 122, 131, 132, 141, 142, 151, 152, 161, 162, 171, 172, 181, 182];

const getCoveredProfessions = (mapId: number, realm: MajorRealm) => {
  const audit = getEquipmentRealmAudit(realm);
  if (!audit) return [];

  const enemy = COMMON_ENEMIES[`m${mapId}_c1`];
  if (!enemy) return [];

  const pathEntries: Array<[ProfessionType, string[]]> = [
    [ProfessionType.Sword, audit.paths.sword?.itemIds || []],
    [ProfessionType.Body, audit.paths.body?.itemIds || []],
    [ProfessionType.Mage, audit.paths.mage?.itemIds || []],
  ];

  return pathEntries
    .filter(([, itemIds]) => itemIds.some((itemId) => enemy.drops.includes(itemId)))
    .map(([profession]) => profession);
};

describe("high realm common drop themes", () => {
  it("keeps tri-theme common maps mixed across all three late-game professions", () => {
    TRI_THEME_MAP_IDS.forEach((mapId) => {
      const enemy = COMMON_ENEMIES[`m${mapId}_c1`];
      expect(enemy, `missing common m${mapId}_c1`).toBeDefined();

      const coveredProfessions = getCoveredProfessions(mapId, enemy.realm);
      expect(enemy.drops.length, `${enemy.id} 不應回到全混池`).toBeLessThan(18);
      expect(coveredProfessions).toHaveLength(3);
    });
  });

  it("keeps pressure and peak maps on dual-theme mixed pools instead of omnipools", () => {
    DUAL_THEME_MAP_IDS.forEach((mapId) => {
      const enemy = COMMON_ENEMIES[`m${mapId}_c1`];
      expect(enemy, `missing common m${mapId}_c1`).toBeDefined();

      const coveredProfessions = getCoveredProfessions(mapId, enemy.realm);
      expect(enemy.drops.length, `${enemy.id} 不應回到全混池`).toBeLessThan(18);
      expect(coveredProfessions).toHaveLength(2);
    });
  });

  it("gives emperor dual-theme routes distinct profession coverage instead of collapsing into one omnipool", () => {
    const outerRing = COMMON_ENEMIES["m181_c1"];
    const riftRoute = COMMON_ENEMIES["m182_c1"];

    expect(outerRing).toBeDefined();
    expect(riftRoute).toBeDefined();

    const outerCoverage = getCoveredProfessions(181, outerRing.realm);
    const riftCoverage = getCoveredProfessions(182, riftRoute.realm);

    expect(outerCoverage).toEqual([ProfessionType.Sword, ProfessionType.Mage]);
    expect(riftCoverage).toEqual([ProfessionType.Body, ProfessionType.Mage]);
    expect(outerRing.drops).not.toEqual(riftRoute.drops);
  });
});
