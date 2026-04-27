import { describe, expect, it } from "vitest";
import { ProfessionType } from "../../types";
import { FORMAL_CORE_SKILL_MAP } from "../../data/skills";
import {
  buildCompendiumItemSourceTrace,
  buildCompendiumSkillSourceTrace,
} from "./sourceTracing";

const routeMaterialCases = [
  {
    itemId: "sword_path_starsteel",
    sectLabel: "凌霄劍宗",
    worldMemoryTag: "sect:sword:world-chapter-03",
  },
  {
    itemId: "beast_path_bloodbone",
    sectLabel: "萬獸山莊",
    worldMemoryTag: "sect:beast:world-chapter-03",
  },
  {
    itemId: "mystic_path_starlotus",
    sectLabel: "縹緲仙宮",
    worldMemoryTag: "sect:mystic:world-chapter-03",
  },
];

describe("Compendium source tracing helpers", () => {
  it.each(routeMaterialCases)(
    "derives route material tracing for $itemId from encounter and Workshop data",
    ({ itemId, sectLabel, worldMemoryTag }) => {
      const trace = buildCompendiumItemSourceTrace(itemId);
      const labels = trace.sources.map((source) => source.label).join("\n");

      expect(labels).toContain(sectLabel);
      expect(labels).toContain(worldMemoryTag);
      expect(trace.encounterRoutes.some((source) => source.repeatPolicy === "repeatable")).toBe(
        true
      );
      expect(
        trace.encounterRoutes.some((source) =>
          source.worldMemoryTags.includes(worldMemoryTag)
        )
      ).toBe(true);
      expect(trace.workshopSinks.length).toBeGreaterThan(0);
      expect(
        trace.workshopSinks.some(
          (source) =>
            source.routeTags.includes(worldMemoryTag) ||
            source.sourceHint.includes(worldMemoryTag)
        )
      ).toBe(true);
    }
  );

  it("shows the v4 endgame convergence Workshop sink for every route material", () => {
    routeMaterialCases.forEach(({ itemId }) => {
      const trace = buildCompendiumItemSourceTrace(itemId);

      expect(
        trace.workshopSinks.some(
          (source) =>
            source.recipeId === "guixu_three_paths_convergence_forge" &&
            source.sourceHint.includes("endgame-loop-v4")
        )
      ).toBe(true);
    });
  });

  it("derives skill manual labels from the existing manual metadata", () => {
    const activeSword = FORMAL_CORE_SKILL_MAP.s_q_active;
    const passiveSword = FORMAL_CORE_SKILL_MAP.s_q_passive;

    expect(activeSword).toBeDefined();
    expect(passiveSword).toBeDefined();

    const activeTrace = buildCompendiumSkillSourceTrace(activeSword);
    const passiveTrace = buildCompendiumSkillSourceTrace(passiveSword);

    expect(activeTrace.manualId).toBe("manual_s_q_active");
    expect(activeTrace.formalSourceLabel).toBe("藏經閣");
    expect(activeTrace.manualSourceLabels).toEqual([
      "凡界藏經閣",
      "宗門入門試煉",
    ]);
    expect(passiveTrace.manualSourceLabels).toEqual(["凡界藏經閣"]);
  });

  it("can derive skill manual labels by skill id without caller-side registries", () => {
    const trace = buildCompendiumSkillSourceTrace("b_f_active");

    expect(trace.skillId).toBe("b_f_active");
    expect(trace.profession).toBe(ProfessionType.Body);
    expect(trace.manualId).toBe("manual_b_f_active");
    expect(trace.manualSourceLabels).toEqual(["同境界 Boss"]);
  });
});
