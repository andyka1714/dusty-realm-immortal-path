#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const CHECKLIST = path.join(ROOT, "docs/06_Balance_Audit/22_怪物圖樣生成Checklist.md");
const OUT_DIR = path.join(ROOT, "tmp/imagegen/monster-raw");
const JOB_PATH = path.join(ROOT, "tmp/imagegen/monster-generate2dsprite-jobs.jsonl");
const MANIFEST_PATH = path.join(ROOT, "tmp/imagegen/monster-generate2dsprite-manifest.json");

const parseCsvArg = (name) => {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));

  if (!arg) return null;

  return new Set(
    arg
      .slice(prefix.length)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
};

const actionSpecs = {
  movement: {
    cols: 4,
    labelPrefix: "enemy_movement",
    mode: "walk",
    text:
      "four-direction movement walk sheet. Row 1 faces down, row 2 faces left, row 3 faces right, row 4 faces up. Column 1 neutral, column 2 weight shift / left step, column 3 neutral variation, column 4 weight shift / right step.",
  },
  combat: {
    cols: 6,
    labelPrefix: "enemy_combat",
    mode: "combat",
    text:
      "four-direction combat sheet. Row 1 faces down, row 2 faces left, row 3 faces right, row 4 faces up. Six columns per direction show ready, wind-up, strike, recovery, hurt impact, and return stance.",
  },
};

const bodyDescriptions = {
  humanoid: "upright humanoid enemy with readable head, torso, arms, and feet anchor",
  quadruped: "four-legged beast with clear head, body, tail or shoulder line, and grounded feet anchor",
  low_crawler: "low crawling creature with compact body, many legs or low belly, and grounded feet anchor",
  serpentine: "serpentine creature with coiled or slithering body, clear head, and contained tail",
  winged: "flying creature with wings kept inside each cell and a compact readable body",
  spirit: "floating spirit with translucent body, aura core, and consistent hover height",
  construct: "animated construct with stone or metal body blocks and heavy silhouette",
  colossus: "large dao-avatar colossus compressed into the same cell scale without touching edges",
  plant: "animated spirit plant with roots or stem, leaves, and anchored base",
};

const rankDescriptions = {
  "普通": "common rank, clean outline, modest aura",
  "精英": "elite rank, brighter outline and restrained elemental aura",
  "首領": "boss rank, stronger silhouette, domain aura, still fully contained in each cell",
};

const elementDescriptions = {
  "無": "neutral grey, leather, bone, or natural earth tones",
  "金": "metallic gold and pale steel accents",
  "木": "green, bark, vine, leaf, and living wood accents",
  "水": "blue, cyan, ice, mist, or water-flow accents",
  "火": "red, orange, ember, lava, or flame accents",
  "土": "brown, ochre, stone, clay, and mineral accents",
};

const parseRows = () => {
  const rows = [];
  for (const line of fs.readFileSync(CHECKLIST, "utf8").split(/\r?\n/)) {
    if (!line.startsWith("| m")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 11) continue;
    rows.push({
      enemyId: cells[0],
      name: cells[1],
      realm: cells[2],
      rank: cells[3],
      element: cells[4],
      archetype: cells[5],
      body: cells[6],
      size: cells[7],
      movement: cells[8],
      combat: cells[9],
    });
  }
  return rows;
};

const slug = (enemyId, action) => `${enemyId.replaceAll("_", "-")}-${action}-v1`;

const promptFor = (row, action) => {
  const actionSpec = actionSpecs[action];
  return [
    `Create an exact ${action === "movement" ? "4x4" : "4x6"} top-down RPG monster sprite sheet for ${row.name} (${row.enemyId}).`,
    `Monster profile: ${row.realm} realm ${rankDescriptions[row.rank] || row.rank}; ${row.element} element with ${elementDescriptions[row.element] || "matching elemental"} palette; archetype ${row.archetype}; body type ${row.body}, ${bodyDescriptions[row.body] || "readable monster silhouette"}.`,
    `Action: ${actionSpec.text}`,
    "Art style: layered xianxia paper-cut diorama, clean HD 2D game sprite, warm fibrous rice-paper surfaces, crisp dark ink outline, visibly stacked paper edges, restrained soft cast shadows, five-element color accents, readable mature silhouette, not cute, no photorealism, no pixel art, no painterly background.",
    "Grid and containment rules: exactly equal-size cells, no borders or grid lines, no text, no labels, no UI, no watermark. The same monster identity, same bounding box, same pixel scale, same palette, same view angle, and same footline/hoverline in every cell. The entire subject, wings, weapon, tail, aura, and effects must fit fully inside each cell with generous margin.",
    "Background rule: 100% solid flat #FF00FF magenta background only, no gradients, no shadows, no floor plane, no texture.",
  ].join("\n");
};

const main = () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const idFilter = parseCsvArg("ids");
  const actionFilter = parseCsvArg("actions");
  const jobs = [];
  const manifest = [];
  for (const row of parseRows()) {
    if (idFilter && !idFilter.has(row.enemyId)) continue;

    for (const action of ["movement", "combat"]) {
      if (actionFilter && !actionFilter.has(action)) continue;
      if (row[action] === "完成") continue;
      const name = `${slug(row.enemyId, action)}.png`;
      jobs.push({
        prompt: promptFor(row, action),
        use_case: "stylized-concept",
        style: "project-native layered paper-cut HD top-down RPG sprite sheet",
        composition: `exact ${action === "movement" ? "4x4" : "4x6"} grid, full subject contained in every cell`,
        constraints: "solid #FF00FF background; no text; no labels; no UI; no border lines; no watermark",
        size: "1024x1024",
        quality: "low",
        out: name,
      });
      manifest.push({
        ...row,
        action,
        rawPath: path.join(OUT_DIR, name),
        outputDir: path.join(ROOT, `public/assets/generated/characters/monsters/${slug(row.enemyId, action)}`),
        rows: 4,
        cols: actionSpecs[action].cols,
        labelPrefix: actionSpecs[action].labelPrefix,
        mode: actionSpecs[action].mode,
        prompt: promptFor(row, action),
      });
    }
  }
  fs.mkdirSync(path.dirname(JOB_PATH), { recursive: true });
  fs.writeFileSync(JOB_PATH, jobs.map((job) => JSON.stringify(job)).join("\n") + "\n");
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  console.log(JSON.stringify({ jobs: jobs.length, jobPath: JOB_PATH, manifestPath: MANIFEST_PATH, outDir: OUT_DIR }, null, 2));
};

main();
