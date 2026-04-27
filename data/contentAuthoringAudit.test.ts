import { describe, expect, it } from "vitest";
import {
  ROUTE_MATERIAL_AUDIT_TARGETS,
  auditContentAuthoringCatalog,
  auditRouteMaterialSourceCoverage,
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
});
