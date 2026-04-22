import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../types";
import { getAvailableEncounterEvents, pickEncounterEvent } from "./encounters";

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
