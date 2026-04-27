import { describe, expect, it } from "vitest";
import { FORMAL_CORE_SKILLS_SORTED } from "./skills";
import {
  buildAllFormalCoreManualRouteTraces,
  buildSkillManualRouteTrace,
} from "./skillManualRouting";

describe("skill manual routing", () => {
  it("derives at least one concrete route for every formal core manual", () => {
    const traces = buildAllFormalCoreManualRouteTraces();

    expect(traces.length).toBe(FORMAL_CORE_SKILLS_SORTED.length);
    for (const trace of traces) {
      expect(
        trace.routes.length,
        `${trace.manualId} should have a concrete route`
      ).toBeGreaterThan(0);
      expect(trace.manualId).toMatch(/^manual_/);
      expect(trace.routes.every((route) => route.label.length > 0)).toBe(true);
    }
  });

  it("maps shop, boss, elite, and inheritance manuals to concrete route names", () => {
    const shopTrace = buildSkillManualRouteTrace("s_q_active");
    expect(shopTrace.routes.map((route) => route.label)).toEqual(
      expect.arrayContaining(["藏經閣", "藏經閣 (劍)", "宗門入門試煉"])
    );

    const bossTrace = buildSkillManualRouteTrace("b_f_active");
    expect(bossTrace.routes.some((route) => route.type === "drop")).toBe(true);
    expect(bossTrace.routes.map((route) => route.label).join("\n")).toContain("掉落");

    const eliteTrace = buildSkillManualRouteTrace("s_g_passive");
    expect(eliteTrace.routes.some((route) => route.type === "drop")).toBe(true);
    expect(eliteTrace.routes.map((route) => route.label).join("\n")).toContain("掉落");

    const inheritanceTrace = buildSkillManualRouteTrace("s_tr_active");
    expect(inheritanceTrace.routes.map((route) => route.label)).toContain(
      "古修傳承殿"
    );
  });
});
