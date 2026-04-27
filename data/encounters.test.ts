import { describe, expect, it } from "vitest";
import { MajorRealm, ProfessionType } from "../types";
import {
  ENCOUNTER_EVENTS,
  type EncounterEvent,
  getAvailableEncounterEvents,
  getEncounterMaterialSourceCues,
  getEncounterPreviewCue,
  pickEncounterEvent,
} from "./encounters";

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

const SECONDARY_WORKSHOP_MATERIAL_SOURCE_CASES = [
  {
    eventId: "sword_void_starsteel_vein",
    realm: MajorRealm.VoidRefining,
    profession: ProfessionType.Sword,
    completedQuestId: "sect_sword_task_04",
    routeLabel: "凌霄劍宗",
    categoryLabel: "煉虛百業材料",
    cueLabel: "凌霄劍星鋼 x1",
    rewardItemId: "sword_path_starsteel",
  },
  {
    eventId: "beast_tribulation_bloodbone_den",
    realm: MajorRealm.Tribulation,
    profession: ProfessionType.Body,
    completedQuestId: "sect_beast_task_04",
    routeLabel: "萬獸山莊",
    categoryLabel: "渡劫百業材料",
    cueLabel: "萬獸血骨殘材 x1",
    rewardItemId: "beast_path_bloodbone",
  },
  {
    eventId: "mystic_immortal_starlotus_tide",
    realm: MajorRealm.Immortal,
    profession: ProfessionType.Mage,
    completedQuestId: "sect_mystic_task_04",
    routeLabel: "縹緲仙宮",
    categoryLabel: "仙人百業材料",
    cueLabel: "縹緲星魂蓮 x1",
    rewardItemId: "mystic_path_starlotus",
  },
] as const;

const PHASE_ONE_NEW_EVENT_IDS = [
  "nascent_world_gate_survey",
  "nascent_sword_soul_sheath",
  "nascent_body_blooddrum",
  "nascent_mage_soul_lantern",
  "fusion_sword_skyforge_oath",
  "fusion_beast_lawbody_trial",
  "fusion_mystic_constellation_court",
  "mahayana_sword_heaven_pillar_duel",
  "mahayana_beast_worldspine_procession",
  "mahayana_mystic_star_court_verdict",
] as const;

const MIDDLE_LATE_REALM_COVERAGE_THRESHOLDS = [
  { realm: MajorRealm.NascentSoul, minEvents: 4, minRepeatableEvents: 2 },
  { realm: MajorRealm.SpiritSevering, minEvents: 4, minRepeatableEvents: 2 },
  { realm: MajorRealm.VoidRefining, minEvents: 3, minRepeatableEvents: 2 },
  { realm: MajorRealm.Fusion, minEvents: 5, minRepeatableEvents: 2 },
  { realm: MajorRealm.Mahayana, minEvents: 5, minRepeatableEvents: 2 },
  { realm: MajorRealm.Tribulation, minEvents: 3, minRepeatableEvents: 2 },
  { realm: MajorRealm.Immortal, minEvents: 4, minRepeatableEvents: 3 },
  { realm: MajorRealm.ImmortalEmperor, minEvents: 5, minRepeatableEvents: 5 },
] as const;

const HIGH_REALM_CUE_REALMS = [
  MajorRealm.SpiritSevering,
  MajorRealm.VoidRefining,
  MajorRealm.Fusion,
  MajorRealm.Mahayana,
  MajorRealm.Tribulation,
  MajorRealm.Immortal,
  MajorRealm.ImmortalEmperor,
] as const;

const FULL_LATE_SECT_QUEST_IDS = [
  "sect_sword_task_04",
  "sect_beast_task_04",
  "sect_mystic_task_04",
] as const;

const PHASE_ONE_ROUTE_COVERAGE_CASES = [
  {
    profession: ProfessionType.Sword,
    routeLabels: ["劍修", "凌霄劍宗"],
  },
  {
    profession: ProfessionType.Body,
    routeLabels: ["體修", "萬獸山莊"],
  },
  {
    profession: ProfessionType.Mage,
    routeLabels: ["法修", "縹緲仙宮"],
  },
] as const;

const PHASE_ONE_ROUTE_COVERAGE_REALMS = [
  MajorRealm.NascentSoul,
  MajorRealm.Fusion,
  MajorRealm.Mahayana,
] as const;

const V3_EMPEROR_ROUTE_EVENT_CASES = [
  {
    eventId: "sword_emperor_heaven_sunder_oath",
    profession: ProfessionType.Sword,
    completedQuestId: "sect_sword_task_04",
    routeLabel: "凌霄劍宗",
    categoryLabel: "仙帝終盤路線",
    cueLabels: ["凌霄劍宗帝境", "凌霄劍星鋼 x2"],
    rewardItemId: "sword_path_starsteel",
  },
  {
    eventId: "beast_emperor_worldblood_hunt",
    profession: ProfessionType.Body,
    completedQuestId: "sect_beast_task_04",
    routeLabel: "萬獸山莊",
    categoryLabel: "仙帝終盤路線",
    cueLabels: ["萬獸山莊帝境", "萬獸血骨殘材 x2"],
    rewardItemId: "beast_path_bloodbone",
  },
  {
    eventId: "mystic_emperor_star_throne_decree",
    profession: ProfessionType.Mage,
    completedQuestId: "sect_mystic_task_04",
    routeLabel: "縹緲仙宮",
    categoryLabel: "仙帝終盤路線",
    cueLabels: ["縹緲仙宮帝境", "縹緲星魂蓮 x2"],
    rewardItemId: "mystic_path_starlotus",
  },
] as const;

const V3_WORLD_AFTERMATH_EVENT_CASES = [
  {
    eventId: "sword_immortal_afterglow_starsteel",
    profession: ProfessionType.Sword,
    worldMemoryTag: "sect:sword:world-chapter-03",
    routeLabel: "凌霄劍宗",
    categoryLabel: "仙人 v3 路線餘波",
    chainLabel: "帝劍餘波",
    sourceCueLabel: "凌霄劍星鋼 x1",
    rewardItemId: "sword_path_starsteel",
  },
  {
    eventId: "beast_immortal_afterglow_bloodbone",
    profession: ProfessionType.Body,
    worldMemoryTag: "sect:beast:world-chapter-03",
    routeLabel: "萬獸山莊",
    categoryLabel: "仙人 v3 路線餘波",
    chainLabel: "帝血餘波",
    sourceCueLabel: "萬獸血骨殘材 x1",
    rewardItemId: "beast_path_bloodbone",
  },
  {
    eventId: "mystic_immortal_afterglow_starlotus",
    profession: ProfessionType.Mage,
    worldMemoryTag: "sect:mystic:world-chapter-03",
    routeLabel: "縹緲仙宮",
    categoryLabel: "仙人 v3 路線餘波",
    chainLabel: "星詔餘波",
    sourceCueLabel: "縹緲星魂蓮 x1",
    rewardItemId: "mystic_path_starlotus",
  },
] as const;

const V4_ENDGAME_ROUTE_EVENT_CASES = [
  {
    eventId: "sword_emperor_v4_heaven_sunder_convergence",
    prerequisiteEventId: "sword_emperor_heaven_sunder_oath",
    profession: ProfessionType.Sword,
    worldMemoryTag: "sect:sword:world-chapter-03",
    endgameMemoryTag: "sect:sword:endgame-loop-v4",
    routeLabel: "凌霄劍宗",
    categoryLabel: "仙帝 v4 終盤收束",
    chainLabel: "斬天終局",
    sourceCueLabel: "凌霄劍星鋼 x2",
    rewardItemId: "sword_path_starsteel",
  },
  {
    eventId: "beast_emperor_v4_worldblood_convergence",
    prerequisiteEventId: "beast_emperor_worldblood_hunt",
    profession: ProfessionType.Body,
    worldMemoryTag: "sect:beast:world-chapter-03",
    endgameMemoryTag: "sect:beast:endgame-loop-v4",
    routeLabel: "萬獸山莊",
    categoryLabel: "仙帝 v4 終盤收束",
    chainLabel: "帝血終局",
    sourceCueLabel: "萬獸血骨殘材 x2",
    rewardItemId: "beast_path_bloodbone",
  },
  {
    eventId: "mystic_emperor_v4_star_throne_convergence",
    prerequisiteEventId: "mystic_emperor_star_throne_decree",
    profession: ProfessionType.Mage,
    worldMemoryTag: "sect:mystic:world-chapter-03",
    endgameMemoryTag: "sect:mystic:endgame-loop-v4",
    routeLabel: "縹緲仙宮",
    categoryLabel: "仙帝 v4 終盤收束",
    chainLabel: "星詔終局",
    sourceCueLabel: "縹緲星魂蓮 x2",
    rewardItemId: "mystic_path_starlotus",
  },
] as const;

const buildRouteMemoryContext = (
  profession: ProfessionType,
  realm: MajorRealm
): Pick<Parameters<typeof getAvailableEncounterEvents>[0], "resolvedEventIds" | "worldMemoryTags"> => {
  if (profession === ProfessionType.Sword) {
    if (realm >= MajorRealm.Mahayana) {
      return {
        resolvedEventIds: ["nascent_sword_soul_sheath", "fusion_sword_skyforge_oath"],
        worldMemoryTags: ["route:sword:soul-sheath", "route:sword:skyforge"],
      };
    }

    if (realm >= MajorRealm.Fusion) {
      return {
        resolvedEventIds: ["nascent_sword_soul_sheath"],
        worldMemoryTags: ["route:sword:soul-sheath"],
      };
    }
  }

  if (profession === ProfessionType.Body) {
    if (realm >= MajorRealm.Mahayana) {
      return {
        resolvedEventIds: ["nascent_body_blooddrum", "fusion_beast_lawbody_trial"],
        worldMemoryTags: ["route:body:blooddrum", "route:body:lawbody"],
      };
    }

    if (realm >= MajorRealm.Fusion) {
      return {
        resolvedEventIds: ["nascent_body_blooddrum"],
        worldMemoryTags: ["route:body:blooddrum"],
      };
    }
  }

  if (profession === ProfessionType.Mage) {
    if (realm >= MajorRealm.Mahayana) {
      return {
        resolvedEventIds: ["nascent_mage_soul_lantern", "fusion_mystic_constellation_court"],
        worldMemoryTags: ["route:mage:lantern", "route:mage:constellation"],
      };
    }

    if (realm >= MajorRealm.Fusion) {
      return {
        resolvedEventIds: ["nascent_mage_soul_lantern"],
        worldMemoryTags: ["route:mage:lantern"],
      };
    }
  }

  return { resolvedEventIds: [], worldMemoryTags: [] };
};

const hasChoiceCueTags = (event: EncounterEvent) =>
  event.choices.some((choice) => (choice.cue?.tags?.length ?? 0) > 0);

const buildEncounterCoverageForRealm = (realm: MajorRealm) => {
  const events = Object.values(ENCOUNTER_EVENTS).filter(
    (event) => realm >= event.minRealm && realm <= event.maxRealm
  );

  return {
    events,
    repeatableEvents: events.filter((event) => event.selector?.repeatPolicy !== "once_per_run"),
    oneTimeEvents: events.filter((event) => event.selector?.repeatPolicy === "once_per_run"),
  };
};

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

  it("keeps chain follow-up events locked until starter resolution and world memory exist", () => {
    const lockedContext = {
      majorRealm: MajorRealm.Fusion,
      profession: ProfessionType.Sword,
      completedQuestIds: ["sect_sword_task_04"],
      resolvedEventIds: [],
      worldMemoryTags: [],
    };
    const starterResolvedOnlyContext = {
      ...lockedContext,
      resolvedEventIds: ["nascent_sword_soul_sheath"],
    };
    const fullyUnlockedContext = {
      ...starterResolvedOnlyContext,
      worldMemoryTags: ["route:sword:soul-sheath"],
    };

    expect(
      getAvailableEncounterEvents(lockedContext).some(
        (event) => event.id === "fusion_sword_skyforge_oath"
      )
    ).toBe(false);
    expect(
      getAvailableEncounterEvents(starterResolvedOnlyContext).some(
        (event) => event.id === "fusion_sword_skyforge_oath"
      )
    ).toBe(false);
    expect(
      getAvailableEncounterEvents(fullyUnlockedContext).some(
        (event) => event.id === "fusion_sword_skyforge_oath"
      )
    ).toBe(true);
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

  it("adds secondary route-specific workshop material sources beyond one-time milestones", () => {
    SECONDARY_WORKSHOP_MATERIAL_SOURCE_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.eventId];

      expect(event, `${testCase.eventId} should exist`).toBeDefined();
      expect(event.minRealm).toBe(testCase.realm);
      expect(event.maxRealm).toBe(testCase.realm);
      expect(event.selector?.repeatPolicy).not.toBe("once_per_run");
      expect(event.selector?.eligibleProfessions).toEqual([testCase.profession]);
      expect(event.selector?.requiredCompletedQuestIds).toEqual([testCase.completedQuestId]);
      expect(event.presentation?.routeLabel).toBe(testCase.routeLabel);
      expect(event.presentation?.categoryLabel).toContain(testCase.categoryLabel);

      const rewardItemIds = event.choices.flatMap((choice) =>
        choice.reward.items?.map((item) => item.itemId) ?? []
      );
      const cueLabels = event.choices.flatMap((choice) =>
        choice.cue?.tags?.map((tag) => tag.label) ?? []
      );

      expect(rewardItemIds).toContain(testCase.rewardItemId);
      expect(cueLabels).toContain(testCase.cueLabel);
    });
  });

  it("keeps secondary workshop material sources gated by profession and completed sect route", () => {
    SECONDARY_WORKSHOP_MATERIAL_SOURCE_CASES.forEach((testCase) => {
      const matchingContext = {
        majorRealm: testCase.realm,
        profession: testCase.profession,
        completedQuestIds: [testCase.completedQuestId],
        resolvedEventIds: [],
      };
      const missingQuestContext = {
        ...matchingContext,
        completedQuestIds: [],
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
        getAvailableEncounterEvents(missingQuestContext).some(
          (event) => event.id === testCase.eventId
        )
      ).toBe(false);
      expect(
        getAvailableEncounterEvents(wrongProfessionContext).some(
          (event) => event.id === testCase.eventId
        )
      ).toBe(false);
    });
  });

  it("publishes material source cues for Workshop recipe UI", () => {
    SECONDARY_WORKSHOP_MATERIAL_SOURCE_CASES.forEach((testCase) => {
      const sourceCues = getEncounterMaterialSourceCues(testCase.rewardItemId);

      expect(sourceCues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventId: testCase.eventId,
            routeLabel: testCase.routeLabel,
            categoryLabel: expect.stringContaining(testCase.categoryLabel),
          }),
        ])
      );
    });
  });

  it("keeps middle and late realm encounter pools above coverage floors", () => {
    MIDDLE_LATE_REALM_COVERAGE_THRESHOLDS.forEach((threshold) => {
      const coverage = buildEncounterCoverageForRealm(threshold.realm);

      expect(
        coverage.events.length,
        `${threshold.realm} should keep enough events`
      ).toBeGreaterThanOrEqual(threshold.minEvents);
      expect(
        coverage.repeatableEvents.length,
        `${threshold.realm} should not rely on once-per-run events`
      ).toBeGreaterThanOrEqual(threshold.minRepeatableEvents);
      expect(
        coverage.oneTimeEvents.length,
        `${threshold.realm} should not only have one-time events`
      ).toBeLessThan(coverage.events.length);
    });
  });

  it("keeps all high-realm encounters readable through presentation and choice cues", () => {
    const highRealmEvents = Object.values(ENCOUNTER_EVENTS).filter((event) =>
      HIGH_REALM_CUE_REALMS.some(
        (realm) => realm >= event.minRealm && realm <= event.maxRealm
      )
    );

    highRealmEvents.forEach((event) => {
      expect(event.presentation?.categoryLabel, `${event.id} missing categoryLabel`).toBeTruthy();
      expect(event.presentation?.routeLabel, `${event.id} missing routeLabel`).toBeTruthy();
      event.choices.forEach((choice) => {
        expect(choice.cue?.tags?.length, `${event.id}.${choice.id} missing cue tags`).toBeGreaterThan(
          0
        );
      });
    });
  });

  it("adds repeatable emperor route events with profession gates and concrete rewards", () => {
    V3_EMPEROR_ROUTE_EVENT_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.eventId];

      expect(event, `${testCase.eventId} should exist`).toBeDefined();
      expect(event.minRealm).toBe(MajorRealm.ImmortalEmperor);
      expect(event.maxRealm).toBe(MajorRealm.ImmortalEmperor);
      expect(event.selector?.repeatPolicy).not.toBe("once_per_run");
      expect(event.selector?.eligibleProfessions).toEqual([testCase.profession]);
      expect(event.selector?.requiredCompletedQuestIds).toEqual([testCase.completedQuestId]);
      expect(event.presentation?.routeLabel).toBe(testCase.routeLabel);
      expect(event.presentation?.categoryLabel).toContain(testCase.categoryLabel);

      const rewardItemIds = event.choices.flatMap((choice) =>
        choice.reward.items?.map((item) => item.itemId) ?? []
      );
      const cueLabels = event.choices.flatMap((choice) =>
        choice.cue?.tags?.map((tag) => tag.label) ?? []
      );

      expect(rewardItemIds).toContain(testCase.rewardItemId);
      testCase.cueLabels.forEach((cueLabel) => expect(cueLabels).toContain(cueLabel));

      const matchingContext = {
        majorRealm: MajorRealm.ImmortalEmperor,
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
        getAvailableEncounterEvents(matchingContext).some((available) => available.id === event.id)
      ).toBe(true);
      expect(
        getAvailableEncounterEvents(wrongProfessionContext).some(
          (available) => available.id === event.id
        )
      ).toBe(false);
    });
  });

  it("adds repeatable v3 aftermath events unlocked by matching world memory", () => {
    V3_WORLD_AFTERMATH_EVENT_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.eventId];

      expect(event, `${testCase.eventId} should exist`).toBeDefined();
      expect(event.minRealm).toBe(MajorRealm.Immortal);
      expect(event.maxRealm).toBe(MajorRealm.ImmortalEmperor);
      expect(event.selector?.repeatPolicy).not.toBe("once_per_run");
      expect(event.selector?.eligibleProfessions).toEqual([testCase.profession]);
      expect(event.selector?.requiredWorldMemoryTags).toEqual([testCase.worldMemoryTag]);
      expect(event.presentation?.routeLabel).toBe(testCase.routeLabel);
      expect(event.presentation?.categoryLabel).toContain(testCase.categoryLabel);
      expect(event.presentation?.chainLabel).toBe(testCase.chainLabel);
      expect(event.presentation?.memoryCue).toContain("v3");

      const rewardItemIds = event.choices.flatMap((choice) =>
        choice.reward.items?.map((item) => item.itemId) ?? []
      );
      const cueLabels = event.choices.flatMap((choice) =>
        choice.cue?.tags?.map((tag) => tag.label) ?? []
      );

      expect(rewardItemIds).toContain(testCase.rewardItemId);
      expect(cueLabels).toContain(testCase.sourceCueLabel);
      expect(cueLabels).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/穩定收益|材料來源|高風險收益/),
        ])
      );
    });
  });

  it("keeps v3 aftermath events hidden until matching world memory exists", () => {
    V3_WORLD_AFTERMATH_EVENT_CASES.forEach((testCase) => {
      const matchingContext = {
        majorRealm: MajorRealm.Immortal,
        profession: testCase.profession,
        completedQuestIds: [],
        resolvedEventIds: [testCase.eventId],
        worldMemoryTags: [testCase.worldMemoryTag],
      };
      const missingMemoryContext = {
        ...matchingContext,
        worldMemoryTags: [],
      };
      const wrongProfessionContext = {
        ...matchingContext,
        profession:
          testCase.profession === ProfessionType.Sword
            ? ProfessionType.Body
            : ProfessionType.Sword,
      };

      expect(
        getAvailableEncounterEvents(matchingContext).some(
          (available) => available.id === testCase.eventId
        )
      ).toBe(true);
      expect(
        getAvailableEncounterEvents(missingMemoryContext).some(
          (available) => available.id === testCase.eventId
        )
      ).toBe(false);
      expect(
        getAvailableEncounterEvents(wrongProfessionContext).some(
          (available) => available.id === testCase.eventId
        )
      ).toBe(false);
    });
  });

  it("publishes v3 aftermath material source cues", () => {
    V3_WORLD_AFTERMATH_EVENT_CASES.forEach((testCase) => {
      const sourceCues = getEncounterMaterialSourceCues(testCase.rewardItemId);

      expect(sourceCues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventId: testCase.eventId,
            routeLabel: testCase.routeLabel,
            categoryLabel: expect.stringContaining(testCase.categoryLabel),
          }),
        ])
      );
    });
  });

  it("adds v4 emperor route convergence events that emit endgame memory", () => {
    V4_ENDGAME_ROUTE_EVENT_CASES.forEach((testCase) => {
      const event = ENCOUNTER_EVENTS[testCase.eventId];

      expect(event, `${testCase.eventId} should exist`).toBeDefined();
      expect(event.minRealm).toBe(MajorRealm.ImmortalEmperor);
      expect(event.maxRealm).toBe(MajorRealm.ImmortalEmperor);
      expect(event.selector?.repeatPolicy).toBe("once_per_run");
      expect(event.selector?.eligibleProfessions).toEqual([testCase.profession]);
      expect(event.selector?.requiredResolvedEventIds).toEqual([
        testCase.prerequisiteEventId,
      ]);
      expect(event.selector?.requiredWorldMemoryTags).toEqual([testCase.worldMemoryTag]);
      expect(event.presentation).toMatchObject({
        routeLabel: testCase.routeLabel,
        chainLabel: testCase.chainLabel,
      });
      expect(event.presentation?.categoryLabel).toContain(testCase.categoryLabel);
      expect(event.chain?.worldMemoryTags).toEqual([testCase.endgameMemoryTag]);

      const rewardItemIds = event.choices.flatMap((choice) =>
        choice.reward.items?.map((item) => item.itemId) ?? []
      );
      const cueLabels = event.choices.flatMap((choice) =>
        choice.cue?.tags?.map((tag) => tag.label) ?? []
      );

      expect(rewardItemIds).toContain(testCase.rewardItemId);
      expect(cueLabels).toContain(testCase.sourceCueLabel);
    });
  });

  it("keeps v4 emperor convergence locked behind the route memory and prerequisite event", () => {
    V4_ENDGAME_ROUTE_EVENT_CASES.forEach((testCase) => {
      const matchingContext = {
        majorRealm: MajorRealm.ImmortalEmperor,
        profession: testCase.profession,
        completedQuestIds: [],
        resolvedEventIds: [testCase.prerequisiteEventId],
        worldMemoryTags: [testCase.worldMemoryTag],
      };

      expect(
        getAvailableEncounterEvents(matchingContext).some(
          (event) => event.id === testCase.eventId
        )
      ).toBe(true);
      expect(
        getAvailableEncounterEvents({
          ...matchingContext,
          resolvedEventIds: [],
        }).some((event) => event.id === testCase.eventId)
      ).toBe(false);
      expect(
        getAvailableEncounterEvents({
          ...matchingContext,
          worldMemoryTags: [],
        }).some((event) => event.id === testCase.eventId)
      ).toBe(false);
    });
  });

  it("publishes v4 endgame convergence material source cues", () => {
    V4_ENDGAME_ROUTE_EVENT_CASES.forEach((testCase) => {
      const sourceCues = getEncounterMaterialSourceCues(testCase.rewardItemId);

      expect(sourceCues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventId: testCase.eventId,
            routeLabel: testCase.routeLabel,
            categoryLabel: expect.stringContaining(testCase.categoryLabel),
          }),
        ])
      );
    });
  });

  it("keeps profession and route recognizable cues across Phase 1 realms", () => {
    PHASE_ONE_ROUTE_COVERAGE_CASES.forEach((testCase) => {
      PHASE_ONE_ROUTE_COVERAGE_REALMS.forEach((realm) => {
        const memoryContext = buildRouteMemoryContext(testCase.profession, realm);
        const available = getAvailableEncounterEvents({
          majorRealm: realm,
          profession: testCase.profession,
          completedQuestIds: [...FULL_LATE_SECT_QUEST_IDS],
          resolvedEventIds: memoryContext.resolvedEventIds,
          worldMemoryTags: memoryContext.worldMemoryTags,
        });
        const routeEvents = available.filter(
          (event) =>
            event.selector?.eligibleProfessions?.includes(testCase.profession) &&
            event.presentation?.routeLabel &&
            testCase.routeLabels.some(
              (routeLabel) => routeLabel === event.presentation?.routeLabel
            ) &&
            event.presentation.categoryLabel &&
            hasChoiceCueTags(event)
        );

        expect(
          routeEvents.length,
          `${testCase.profession} should have recognizable route cues in ${realm}`
        ).toBeGreaterThanOrEqual(1);
      });
    });
  });

  it("exposes category labels, route labels, choice cue tags, and concrete rewards on new Phase 1 events", () => {
    PHASE_ONE_NEW_EVENT_IDS.forEach((eventId) => {
      const event = ENCOUNTER_EVENTS[eventId];
      const rewardBearingChoices = event.choices.filter(
        (choice) =>
          choice.reward.experience !== undefined ||
          choice.reward.spiritStones !== undefined ||
          (choice.reward.items?.length ?? 0) > 0
      );

      expect(
        event.presentation?.categoryLabel,
        `${eventId} missing categoryLabel`
      ).toBeTruthy();
      expect(event.presentation?.routeLabel, `${eventId} missing routeLabel`).toBeTruthy();
      expect(hasChoiceCueTags(event), `${eventId} missing cue tags`).toBe(true);
      expect(rewardBearingChoices.length, `${eventId} missing concrete rewards`).toBe(
        event.choices.length
      );
    });
  });

  it("publishes stable preview cues for chain-aware encounters", () => {
    const cue = getEncounterPreviewCue(ENCOUNTER_EVENTS.fusion_sword_skyforge_oath);

    expect(cue).toMatchObject({
      chainLabel: "劍脈續響",
      memoryCue: "合體劍爐會延續前一段元嬰劍鞘留下的路線記憶。",
      routeLabel: "凌霄劍宗",
      professionLabel: "劍修",
      sectLabel: "凌霄劍宗後段承接",
    });
  });
});
