import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../types";
import { ENCOUNTER_EVENTS, getAvailableEncounterEvents, pickEncounterEvent } from "./encounters";

describe("encounter selector", () => {
  it("filters once-per-run events after resolution", () => {
    const available = getAvailableEncounterEvents({
      majorRealm: MajorRealm.SpiritSevering,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join"],
      resolvedEventIds: ["sword_sect_patrol_cache"],
    });

    expect(available.map((event) => event.id)).not.toContain("sword_sect_patrol_cache");
  });

  it("defines explicit route labels for sect and profession specific events", () => {
    expect(ENCOUNTER_EVENTS.sword_sect_patrol_cache.presentation?.routeLabel).toBe("凌霄劍宗");
    expect(ENCOUNTER_EVENTS.mage_ink_resonance.presentation?.routeLabel).toBe("法修");
  });

  it("hides sect-specific events until the matching profession and quest are present", () => {
    const matchingContext = {
      majorRealm: MajorRealm.SpiritSevering,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join"],
      resolvedEventIds: [],
    };

    const wrongProfessionContext = {
      ...matchingContext,
      profession: ProfessionType.Body,
    };

    const missingQuestContext = {
      ...matchingContext,
      completedQuestIds: [],
    };

    expect(
      getAvailableEncounterEvents(matchingContext).some(
        (event) => event.id === "sword_sect_patrol_cache"
      )
    ).toBe(true);
    expect(
      getAvailableEncounterEvents(wrongProfessionContext).some(
        (event) => event.id === "sword_sect_patrol_cache"
      )
    ).toBe(false);
    expect(
      getAvailableEncounterEvents(missingQuestContext).some(
        (event) => event.id === "sword_sect_patrol_cache"
      )
    ).toBe(false);
  });

  it("tags costly choices with reward preview cues", () => {
    const buyOre = ENCOUNTER_EVENTS.wandering_smith.choices.find(
      (choice) => choice.id === "buy_ore"
    );

    expect(buyOre?.cue?.tags).toEqual(
      expect.arrayContaining([{ kind: "cost", label: "耗費靈石" }])
    );
  });

  it("uses weights when picking from the filtered pool", () => {
    const context = {
      majorRealm: MajorRealm.SpiritSevering,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_join"],
      resolvedEventIds: [],
    };

    expect(pickEncounterEvent(context, 0.4)?.id).toBe("sword_sect_patrol_cache");
  });
});
