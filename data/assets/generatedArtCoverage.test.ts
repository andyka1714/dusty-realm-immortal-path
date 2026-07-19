import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BESTIARY } from "../enemies";
import { MAPS } from "../maps";
import { EQUIPMENT_ITEMS } from "../items/equipment";
import { MATERIAL_ITEMS } from "../items/materials";
import { CONSUMABLE_ITEMS } from "../items/consumables";
import { MANUAL_ITEMS } from "../items/manuals";
import { SKILLS } from "../skills";

const sha256 = (path: string) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");

const verifyExactUniqueCoverage = (relativeDirectory: string, ids: string[]) => {
  const directory = resolve(relativeDirectory);
  const expectedFiles = ids.map((id) => `${id}.webp`).sort();
  const actualFiles = readdirSync(directory).filter((file) => file.endsWith(".webp")).sort();

  expect(actualFiles).toEqual(expectedFiles);
  const paths = expectedFiles.map((file) => resolve(directory, file));
  paths.forEach((path) => expect(existsSync(path), path).toBe(true));
  expect(new Set(paths.map(sha256)).size).toBe(paths.length);
};

describe("generated paper-cut art coverage", () => {
  it("has one unique complete background for every map", () => {
    verifyExactUniqueCoverage(
      "public/assets/generated/maps/paper-cut-v3",
      MAPS.map((map) => map.id)
    );
  });

  it("has one unique directional motion sheet for every monster", () => {
    verifyExactUniqueCoverage(
      "public/assets/generated/characters/monsters/paper-cut-v3",
      Object.keys(BESTIARY)
    );
  });

  it("has one unique icon for every equipment template", () => {
    verifyExactUniqueCoverage(
      "public/assets/generated/icons/equipment-paper-v3",
      Object.keys(EQUIPMENT_ITEMS)
    );
  });

  it("has one unique icon for every non-equipment item", () => {
    verifyExactUniqueCoverage(
      "public/assets/generated/icons/items-paper-v3",
      [
        ...Object.keys(MATERIAL_ITEMS),
        ...Object.keys(CONSUMABLE_ITEMS),
        ...Object.keys(MANUAL_ITEMS),
      ]
    );
  });

  it("has one unique icon for every formal skill", () => {
    verifyExactUniqueCoverage(
      "public/assets/generated/icons/skills-paper-v3",
      Object.keys(SKILLS)
    );
  });
});
