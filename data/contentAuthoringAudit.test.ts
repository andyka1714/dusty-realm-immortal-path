import { describe, expect, it } from "vitest";
import {
  ROUTE_MATERIAL_AUDIT_TARGETS,
  auditContentAuthoringCatalog,
  auditRouteMaterialSourceCoverage,
  auditV5EndgameRouteCoverage,
  auditV6EndgameRouteCoverage,
  auditV7EndgameRouteCoverage,
} from "./contentAuthoringAudit";

describe("content authoring audit", () => {
  it("keeps catalog item references valid across quests, encounters, shops, drops, and recipes", () => {
    const report = auditContentAuthoringCatalog();

    expect(report.invalidItemReferences).toEqual([]);
  });

  it("keeps map NPC questIds and quest NPC references valid", () => {
    const report = auditContentAuthoringCatalog();

    expect(report.invalidQuestReferences).toEqual([]);
    expect(report.invalidNpcReferences).toEqual([]);
  });

  it("keeps route materials connected to source, sink, and compendium tracing", () => {
    const report = auditRouteMaterialSourceCoverage();

    expect(report.routeMaterials.map((entry) => entry.itemId)).toEqual(
      ROUTE_MATERIAL_AUDIT_TARGETS
    );
    report.routeMaterials.forEach((entry) => {
      expect(entry.hasSource, entry.itemId).toBe(true);
      expect(entry.hasWorkshopSink, entry.itemId).toBe(true);
      expect(entry.hasCompendiumTracing, entry.itemId).toBe(true);
    });
  });

  it("keeps v5 endgame route catalogs connected across encounter, workshop, map, and reincarnation", () => {
    const report = auditV5EndgameRouteCoverage();

    expect(report.routes.map((entry) => entry.memoryTag)).toEqual([
      "sect:sword:endgame-loop-v4",
      "sect:beast:endgame-loop-v4",
      "sect:mystic:endgame-loop-v4",
    ]);
    report.routes.forEach((entry) => {
      expect(entry.hasRepeatableEncounter, entry.memoryTag).toBe(true);
      expect(entry.hasWorkshopFollowup, entry.memoryTag).toBe(true);
      expect(entry.hasMapLocalClue, entry.memoryTag).toBe(true);
      expect(entry.hasReincarnationSeal, entry.memoryTag).toBe(true);
    });
  });

  it("keeps v6 endgame route catalogs connected across encounter, map, specialization leaves, and reincarnation", () => {
    const report = auditV6EndgameRouteCoverage();

    expect(report.routes.map((entry) => entry.memoryTag)).toEqual([
      "sect:sword:endgame-loop-v4",
      "sect:beast:endgame-loop-v4",
      "sect:mystic:endgame-loop-v4",
    ]);
    report.routes.forEach((entry) => {
      expect(entry.hasRepeatableEncounter, entry.memoryTag).toBe(true);
      expect(entry.hasMapLocalClue, entry.memoryTag).toBe(true);
      expect(entry.hasWorkshopSpecialization, entry.memoryTag).toBe(true);
      expect(entry.hasReincarnationSeal, entry.memoryTag).toBe(true);
    });
  });

  it("keeps v7 endgame route catalogs connected across repeatable route aftermath", () => {
    const report = auditV7EndgameRouteCoverage();

    expect(report.routes.map((entry) => entry.memoryTag)).toEqual([
      "sect:sword:endgame-loop-v4",
      "sect:beast:endgame-loop-v4",
      "sect:mystic:endgame-loop-v4",
    ]);
    report.routes.forEach((entry) => {
      expect(entry.hasRepeatableEncounter, entry.memoryTag).toBe(true);
      expect(entry.hasRouteCue, entry.memoryTag).toBe(true);
      expect(entry.hasRewardSource, entry.memoryTag).toBe(true);
    });
  });
});
