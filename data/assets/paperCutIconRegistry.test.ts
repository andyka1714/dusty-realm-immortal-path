import { describe, expect, it } from "vitest";
import { ITEMS } from "../items";
import { FORMAL_CORE_SKILLS_SORTED } from "../skills";
import { ItemQuality } from "../../types";
import {
  getPaperCutItemIcon,
  getPaperCutSkillIcon,
  PAPER_CUT_QUALITY_CLASS,
} from "./paperCutIconRegistry";

describe("paper-cut visual asset coverage", () => {
  it("maps every runtime item to a generated paper-cut frame", () => {
    Object.values(ITEMS).forEach((item) => {
      expect(getPaperCutItemIcon(item), item.id).toMatch(
        /^\/assets\/generated\/ui\/paper-cut-core-v1\/frames\/icon-\d+\.png$/
      );
    });
  });

  it("maps every formal skill to a generated paper-cut frame", () => {
    FORMAL_CORE_SKILLS_SORTED.forEach((skill) => {
      expect(getPaperCutSkillIcon(skill), skill.id).toContain("/frames/icon-");
    });
  });

  it("keeps one base asset while every equipment quality has a distinct effect class", () => {
    expect(Object.keys(PAPER_CUT_QUALITY_CLASS)).toHaveLength(4);
    expect(new Set(Object.values(PAPER_CUT_QUALITY_CLASS)).size).toBe(4);
    expect(PAPER_CUT_QUALITY_CLASS[ItemQuality.Immortal]).toBe("paper-tier-immortal");
  });
});
