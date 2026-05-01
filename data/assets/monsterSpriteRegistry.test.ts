import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BESTIARY } from "../enemies";
import { getAssetDefinition, hasAssetDefinition } from "./assetRegistry";
import {
  listMonsterSpriteAssetDefinitions,
  resolveMonsterSpriteAssets,
} from "./monsterSpriteRegistry";

describe("monsterSpriteRegistry", () => {
  it("provides independent four-direction movement and combat asset definitions for every monster", () => {
    const definitions = listMonsterSpriteAssetDefinitions();
    const basePaths = new Set(definitions.map((asset) => asset.basePath));

    expect(definitions).toHaveLength(Object.keys(BESTIARY).length * 2);
    expect(basePaths.size).toBe(definitions.length);
    expect(definitions.every((asset) => asset.kind === "enemy")).toBe(true);
    expect(
      definitions.every((asset) =>
        asset.basePath.startsWith("/assets/generated/characters/monsters/")
      )
    ).toBe(true);
    expect(
      definitions.every((asset) => asset.sprite?.rowOrder?.join(",") === "down,left,right,up")
    ).toBe(true);
    expect(
      definitions.every((asset) => asset.sprite?.anchor === "feet")
    ).toBe(true);
    expect(
      definitions.every(
        (asset) =>
          asset.source === "pending_generate2dsprite" ||
          asset.source === "generated"
      )
    ).toBe(true);
    expect(
      definitions.every(
        (asset) =>
          asset.sprite?.qcStatus === "pending" ||
          asset.sprite?.qcStatus === "passed"
      )
    ).toBe(true);
    expect(
      definitions.every((asset) => asset.tags.includes("requires-generate2dsprite"))
    ).toBe(true);
  });

  it("resolves every enemy template to existing movement and combat assets", () => {
    const missing = Object.values(BESTIARY)
      .map((enemy) => ({
        enemyId: enemy.id,
        assets: resolveMonsterSpriteAssets(enemy),
      }))
      .filter(
        ({ assets }) =>
          !hasAssetDefinition(assets.movementAssetId) ||
          !hasAssetDefinition(assets.combatAssetId)
      );

    expect(missing).toEqual([]);

    const crab = resolveMonsterSpriteAssets(BESTIARY.m22_b1);
    expect(crab.movementAssetId).toBe("enemy.m22_b1.movement_v1");
    expect(crab.combatAssetId).toBe("enemy.m22_b1.combat_v1");
    expect(getAssetDefinition(crab.movementAssetId).usage).toContain(
      "enemy_movement"
    );
    expect(getAssetDefinition(crab.combatAssetId).usage).toContain(
      "enemy_combat"
    );
  });

  it("only marks monster sheets as generated when $generate2dsprite output exists", () => {
    const required = [
      "raw-sheet.png",
      "raw-sheet-clean.png",
      "sheet-transparent.png",
      "animation.gif",
      "prompt-used.txt",
      "pipeline-meta.json",
      "asset.json",
    ];
    const generatedWithoutFiles = listMonsterSpriteAssetDefinitions()
      .filter(
        (asset) => asset.source === "generated" || asset.sprite?.qcStatus === "passed"
      )
      .flatMap((asset) => {
        const assetRoot = path.join(
          process.cwd(),
          "public",
          asset.basePath.replace(/^\//, "")
        );
        const missing = required
          .map((file) => path.join(assetRoot, file))
          .filter((file) => !fs.existsSync(file));
        const framesDir = asset.files.framesDir
          ? path.join(assetRoot, asset.files.framesDir)
          : null;

        if (framesDir && !fs.existsSync(framesDir)) {
          missing.push(framesDir);
        }

        return missing;
      });

    expect(generatedWithoutFiles).toEqual([]);
  });
});
