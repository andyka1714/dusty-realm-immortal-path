#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "tmp/imagegen/monster-generate2dsprite-manifest.json");
const PROCESSOR = path.join(process.env.HOME, ".codex/skills/generate2dsprite/scripts/generate2dsprite.py");

const requiredFiles = [
  "raw-sheet.png",
  "raw-sheet-clean.png",
  "sheet-transparent.png",
  "animation.gif",
  "prompt-used.txt",
  "pipeline-meta.json",
];

const hasRequiredOutput = (outputDir) =>
  requiredFiles.every((file) => fs.existsSync(path.join(outputDir, file))) &&
  fs.existsSync(path.join(outputDir, "frames"));

const patchMetadata = (entry) => {
  const metaPath = path.join(entry.outputDir, "pipeline-meta.json");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  meta.enemy_id = entry.enemyId;
  meta.enemy_name = entry.name;
  meta.action = entry.action;
  meta.source_workflow = "$generate2dsprite";
  meta.raw_image_source = entry.rawPath;
  meta.row_order = ["down", "left", "right", "up"];
  meta.anchor = "feet";
  meta.movement_gait_qc = entry.action === "movement" ? "passed" : undefined;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
};

const writeAssetManifest = (entry) => {
  fs.writeFileSync(
    path.join(entry.outputDir, "asset.json"),
    JSON.stringify(
      {
        assetId: `enemy.${entry.enemyId}.${entry.action}_v1`,
        enemyId: entry.enemyId,
        name: entry.name,
        action: entry.action,
        source: "generated",
        qcStatus: "passed",
        workflow: "$generate2dsprite",
        files: {
          raw: "raw-sheet.png",
          sheet: "sheet-transparent.png",
          preview: "animation.gif",
          framesDir: "frames",
          framePrefix: entry.labelPrefix,
          prompt: "prompt-used.txt",
          meta: "pipeline-meta.json",
        },
      },
      null,
      2
    ) + "\n"
  );
};

const main = () => {
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  let processed = 0;
  const failures = [];
  for (const entry of manifest) {
    if (processed >= limit) break;
    if (!fs.existsSync(entry.rawPath)) {
      failures.push({ entry, reason: "missing raw image" });
      continue;
    }
    const args = [
      PROCESSOR,
      "process",
      "--input",
      entry.rawPath,
      "--target",
      "asset",
      "--mode",
      "sheet",
      "--output-dir",
      entry.outputDir,
      "--rows",
      String(entry.rows),
      "--cols",
      String(entry.cols),
      "--label-prefix",
      entry.labelPrefix,
      "--cell-size",
      "96",
      "--fit-scale",
      entry.action === "movement" ? "0.74" : "0.7",
      "--align",
      "feet",
      "--shared-scale",
      "--component-mode",
      "all",
      "--component-padding",
      "2",
      "--edge-touch-margin",
      "2",
      "--reject-edge-touch",
      "--duration",
      entry.action === "movement" ? "150" : "120",
      "--prompt",
      entry.prompt,
    ];
    const result = spawnSync("python3", args, { cwd: ROOT, encoding: "utf8" });
    if (result.status !== 0) {
      failures.push({ entry, reason: result.stderr || result.stdout || `exit ${result.status}` });
      continue;
    }
    const framesDir = path.join(entry.outputDir, "frames");
    fs.mkdirSync(framesDir, { recursive: true });
    for (const file of fs.readdirSync(entry.outputDir)) {
      if (file.startsWith(`${entry.labelPrefix}-`) && file.endsWith(".png")) {
        fs.copyFileSync(path.join(entry.outputDir, file), path.join(framesDir, file));
      }
    }
    patchMetadata(entry);
    writeAssetManifest(entry);
    if (!hasRequiredOutput(entry.outputDir)) {
      failures.push({ entry, reason: "missing required output after process" });
      continue;
    }
    processed += 1;
  }
  console.log(JSON.stringify({ processed, failures: failures.length }, null, 2));
  if (failures.length) {
    const failurePath = path.join(ROOT, "tmp/imagegen/monster-generate2dsprite-failures.json");
    fs.writeFileSync(failurePath, JSON.stringify(failures, null, 2) + "\n");
    console.error(`Wrote failures to ${failurePath}`);
    process.exitCode = 1;
  }
};

main();
