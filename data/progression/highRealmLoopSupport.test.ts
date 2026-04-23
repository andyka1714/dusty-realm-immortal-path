import { describe, expect, it } from "vitest";
import { MajorRealm } from "../../types";
import { getEncounterEventById } from "../encounters";
import { WORKSHOP_RECIPES } from "../workshopRecipes";
import {
  getHighRealmCultivationSpec,
  HIGH_REALM_PROGRESSION_REALMS,
} from "./balanceAudit";
import { getHighRealmLoopSupportProfile } from "./highRealmLoopSupport";

describe("high realm loop support regression", () => {
  it("keeps every high-realm multiplier grounded in explicit workshop and event channels", () => {
    for (const realm of HIGH_REALM_PROGRESSION_REALMS) {
      const balanceSpec = getHighRealmCultivationSpec(realm);
      const supportProfile = getHighRealmLoopSupportProfile(realm);

      expect(supportProfile).toBeTruthy();
      expect(supportProfile.pill.multiplier).toBe(balanceSpec.pillMultiplier);
      expect(supportProfile.dwelling.multiplier).toBe(balanceSpec.dwellingMultiplier);
      expect(supportProfile.encounter.multiplier).toBe(balanceSpec.encounterMultiplier);
      expect(supportProfile.event.multiplier).toBe(balanceSpec.eventMultiplier);
      expect(supportProfile.encounter.eventIds.length).toBeGreaterThan(0);
      expect(supportProfile.event.eventIds.length).toBeGreaterThan(0);
    }
  });

  it("references real high-realm encounter events instead of placeholder ids", () => {
    for (const realm of HIGH_REALM_PROGRESSION_REALMS) {
      const supportProfile = getHighRealmLoopSupportProfile(realm);
      [...supportProfile.encounter.eventIds, ...supportProfile.event.eventIds].forEach(
        (eventId) => {
          expect(getEncounterEventById(eventId), `${realm} 缺少事件 ${eventId}`).toBeTruthy();
        }
      );
    }
  });

  it("grounds emperor workshop support in high-tier recipes", () => {
    const emperorSupport = getHighRealmLoopSupportProfile(MajorRealm.ImmortalEmperor);
    const highTierRecipes = Object.values(WORKSHOP_RECIPES).filter(
      (recipe) => recipe.tier === "highRealm"
    );
    const highTierOutputIds = highTierRecipes.flatMap((recipe) =>
      recipe.outputs.map((output) => output.itemId)
    );

    expect(highTierRecipes.length).toBeGreaterThanOrEqual(2);
    expect(
      emperorSupport.pill.itemIds.some((itemId) => highTierOutputIds.includes(itemId))
    ).toBe(true);
    expect(highTierOutputIds).toContain("bt_immortal_emperor");
    expect(highTierOutputIds).toContain("origin_sword");
  });
});
