import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../types";
import { ENCOUNTER_EVENTS, getAvailableEncounterEvents, pickEncounterEvent } from "./encounters";

const LATE_SECT_MILESTONE_CASES = [
  {
    eventId: "sword_sect_huashen_bastion",
    profession: ProfessionType.Sword,
    completedQuestId: "sect_sword_task_04",
    routeLabel: "凌霄劍宗",
    cueLabels: ["凌霄劍宗前哨殘核", "凌霄劍宗鋒勢"],
    rewardItemId: "sword_path_starsteel",
  },
  {
    eventId: "beast_sect_huashen_bastion",
    profession: ProfessionType.Body,
    completedQuestId: "sect_beast_task_04",
    routeLabel: "萬獸山莊",
    cueLabels: ["萬獸山莊血骨殘材", "萬獸山莊高壓鍛體"],
    rewardItemId: "beast_path_bloodbone",
  },
  {
    eventId: "mystic_sect_huashen_bastion",
    profession: ProfessionType.Mage,
    completedQuestId: "sect_mystic_task_04",
    routeLabel: "縹緲仙宮",
    cueLabels: ["縹緲仙宮星砂秘材", "縹緲仙宮星圖"],
    rewardItemId: "mystic_path_starlotus",
  },
] as const;

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

  it("defines explicit route labels for existing sect and profession specific events", () => {
    expect(ENCOUNTER_EVENTS.sword_sect_patrol_cache.presentation?.routeLabel).toBe("凌霄劍宗");
    expect(ENCOUNTER_EVENTS.mage_ink_resonance.presentation?.routeLabel).toBe("法修");
  });

  it("keeps the late sect milestones locked until the matching task_04 quest is complete", () => {
    LATE_SECT_MILESTONE_CASES.forEach((testCase) => {
      const missingQuestContext = {
        majorRealm: MajorRealm.SpiritSevering,
        profession: testCase.profession,
        completedQuestIds: [],
        resolvedEventIds: [],
      };

      expect(
        getAvailableEncounterEvents(missingQuestContext).some(
          (event) => event.id === testCase.eventId
        )
      ).toBe(false);
    });
  });

  it("releases the matching late sect milestone only for the right profession and quest", () => {
    LATE_SECT_MILESTONE_CASES.forEach((testCase) => {
      const matchingContext = {
        majorRealm: MajorRealm.SpiritSevering,
        profession: testCase.profession,
        completedQuestIds: [testCase.completedQuestId],
        resolvedEventIds: [],
      };

      const wrongProfessionContext = {
        ...matchingContext,
        profession:
          testCase.profession === ProfessionType.Sword
            ? ProfessionType.Body
            : ProfessionType.Sword,
      };

      expect(
        getAvailableEncounterEvents(matchingContext).some((event) => event.id === testCase.eventId)
      ).toBe(true);
      expect(
        getAvailableEncounterEvents(wrongProfessionContext).some(
          (event) => event.id === testCase.eventId
        )
      ).toBe(false);
    });
  });

  it("defines explicit route labels and route-specific cue tags for the late sect milestones", () => {
    LATE_SECT_MILESTONE_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.eventId];

      expect(event.presentation?.routeLabel).toBe(testCase.routeLabel);
      expect(event.presentation?.categoryLabel).toContain("化神三界戰場");

      const cueLabels = event.choices.flatMap((choice) =>
        choice.cue?.tags?.map((tag) => tag.label) ?? []
      );

      testCase.cueLabels.forEach((cueLabel) => {
        expect(cueLabels).toContain(cueLabel);
      });
    });
  });

  it("feeds late sect milestone materials into high-tier workshop sinks", () => {
    LATE_SECT_MILESTONE_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.eventId];
      const rewardItemIds = event.choices.flatMap((choice) =>
        choice.reward.items?.map((item) => item.itemId) ?? []
      );

      expect(rewardItemIds).toContain(testCase.rewardItemId);
    });
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

  it("hides resolved once-per-run late sect milestones", () => {
    LATE_SECT_MILESTONE_CASES.forEach((testCase) => {
      const resolvedContext = {
        majorRealm: MajorRealm.SpiritSevering,
        profession: testCase.profession,
        completedQuestIds: [testCase.completedQuestId],
        resolvedEventIds: [testCase.eventId],
      };

      expect(
        getAvailableEncounterEvents(resolvedContext).some((event) => event.id === testCase.eventId)
      ).toBe(false);
    });
  });
});
