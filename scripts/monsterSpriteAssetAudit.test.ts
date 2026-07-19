import { describe, expect, it } from "vitest";
import {
  classifyMonsterSpriteAsset,
  resolveMovementDirectionQc,
  type MonsterSpriteAuditRecord,
} from "./monsterSpriteAssetAudit";

const baseRecord: MonsterSpriteAuditRecord = {
  dirName: "m100-c1-movement-v1",
  canonical: true,
  action: "movement",
  bodyType: "quadruped",
  requiredFilesComplete: true,
  assetSource: "generated",
  assetWorkflow: "$generate2dsprite",
  assetQcStatus: "passed",
  colorBinCount: 180,
  movementDirectionQc: "passed",
};

describe("monsterSpriteAssetAudit", () => {
  it("rejects non-canonical smoke or scratch directories", () => {
    expect(
      classifyMonsterSpriteAsset({
        ...baseRecord,
        dirName: "m100-c1-movement-v1-smoke",
        canonical: false,
      })
    ).toEqual({
      status: "quarantine",
      reason: "non-canonical monster sprite directory",
    });
  });

  it("rejects low-color placeholder sheets even when files exist", () => {
    expect(
      classifyMonsterSpriteAsset({
        ...baseRecord,
        colorBinCount: 4,
      })
    ).toEqual({
      status: "needs-regenerate-style",
      reason: "low color/detail sprite sheet",
    });
  });

  it("rejects movement sheets whose direction rows break body-specific volume rules", () => {
    expect(
      classifyMonsterSpriteAsset({
        ...baseRecord,
        colorBinCount: 160,
        movementDirectionQc: "failed",
      })
    ).toEqual({
      status: "needs-regenerate-motion",
      reason: "movement direction proportions break body volume rules",
    });
  });

  it("accepts file-complete, detailed, motion-valid generate2dsprite output", () => {
    expect(classifyMonsterSpriteAsset(baseRecord)).toEqual({
      status: "accepted",
      reason: "generate2dsprite output passed audit gates",
    });
  });

  it("allows horizontal bodies to be wider left/right while preserving visual volume", () => {
    expect(
      resolveMovementDirectionQc("serpentine", [
        { width: 40, height: 64 },
        { width: 78, height: 28 },
        { width: 79, height: 28 },
        { width: 39, height: 65 },
      ])
    ).toBe("passed");
  });

  it("rejects horizontal bodies when front/back rows collapse compared with side rows", () => {
    expect(
      resolveMovementDirectionQc("low_crawler", [
        { width: 12, height: 18 },
        { width: 86, height: 36 },
        { width: 86, height: 36 },
        { width: 12, height: 18 },
      ])
    ).toBe("failed");
  });
});
