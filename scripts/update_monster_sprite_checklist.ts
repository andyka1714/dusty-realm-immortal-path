import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { BESTIARY } from "../data/enemies";
import { getAssetDefinition } from "../data/assets";
import { createMonsterSpriteBasePath } from "../data/assets/monsterSpriteAssets";
import { resolveMonsterVisualProfile } from "../utils/monsterVisualProfile";
import { ElementType, EnemyRank, MajorRealm } from "../types";
import { auditMonsterSpriteAssets } from "./monsterSpriteAssetAudit";

const outputPath = "docs/06_Balance_Audit/22_怪物圖樣生成Checklist.md";

const rankName: Record<EnemyRank, string> = {
  [EnemyRank.Common]: "普通",
  [EnemyRank.Elite]: "精英",
  [EnemyRank.Boss]: "首領",
};

const realmName: Record<MajorRealm, string> = {
  [MajorRealm.Mortal]: "凡人",
  [MajorRealm.QiRefining]: "練氣",
  [MajorRealm.Foundation]: "築基",
  [MajorRealm.GoldenCore]: "金丹",
  [MajorRealm.NascentSoul]: "元嬰",
  [MajorRealm.SpiritSevering]: "化神",
  [MajorRealm.VoidRefining]: "煉虛",
  [MajorRealm.Fusion]: "合體",
  [MajorRealm.Mahayana]: "大乘",
  [MajorRealm.Tribulation]: "渡劫",
  [MajorRealm.Immortal]: "仙人",
  [MajorRealm.ImmortalEmperor]: "仙帝",
};

const elementName: Record<ElementType, string> = {
  [ElementType.None]: "無",
  [ElementType.Metal]: "金",
  [ElementType.Wood]: "木",
  [ElementType.Water]: "水",
  [ElementType.Fire]: "火",
  [ElementType.Earth]: "土",
};

const ranks = [EnemyRank.Common, EnemyRank.Elite, EnemyRank.Boss] as const;
const monsterRoot = path.join(
  process.cwd(),
  "public/assets/generated/characters/monsters"
);
const bodyTypesByEnemyId = Object.fromEntries(
  Object.values(BESTIARY).map((enemy) => [
    enemy.id,
    resolveMonsterVisualProfile(enemy).bodyType,
  ])
);
const assetAudit = auditMonsterSpriteAssets({
  monsterRoot,
  bodyTypesByEnemyId,
});
const auditByDirName = new Map(
  assetAudit.records.map((record) => [record.dirName, record])
);
const requiredFiles = [
  "raw-sheet.png",
  "raw-sheet-clean.png",
  "sheet-transparent.png",
  "animation.gif",
  "prompt-used.txt",
  "pipeline-meta.json",
  "asset.json",
];

const hasRequiredFiles = (basePath: string): boolean => {
  const root = path.join(process.cwd(), "public", basePath.replace(/^\//, ""));

  return (
    requiredFiles.every((file) => fs.existsSync(path.join(root, file))) &&
    fs.existsSync(path.join(root, "frames"))
  );
};

const getAuditRecord = (basePath: string) => {
  const dirName = path.basename(basePath);

  return auditByDirName.get(dirName) ?? null;
};

const getPipelineCellSize = (basePath: string): number | null => {
  const metaPath = path.join(
    process.cwd(),
    "public",
    basePath.replace(/^\//, ""),
    "pipeline-meta.json"
  );
  if (!fs.existsSync(metaPath)) return null;

  const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    cell_size?: unknown;
  };

  return typeof parsed.cell_size === "number" ? parsed.cell_size : null;
};

const getSheetMetrics = (
  basePath: string,
  rows: number,
  cols: number
): { avgHeight: number; avgFootline: number } | null => {
  const sheetPath = path.join(
    process.cwd(),
    "public",
    basePath.replace(/^\//, ""),
    "sheet-transparent.png"
  );
  if (!fs.existsSync(sheetPath)) return null;

  const output = JSON.parse(
    execFileSync(
      "python3",
      [
        "-c",
        [
          "from PIL import Image",
          "import json,sys",
          "p,rows,cols=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])",
          "im=Image.open(p).convert('RGBA')",
          "cw,ch=im.width//cols,im.height//rows",
          "hs=[]; fys=[]",
          "for r in range(rows):",
          "  for c in range(cols):",
          "    b=im.crop((c*cw,r*ch,(c+1)*cw,(r+1)*ch)).getchannel('A').getbbox()",
          "    if b:",
          "      hs.append(b[3]-b[1]); fys.append(b[3])",
          "print(json.dumps({'avgHeight':sum(hs)/len(hs),'avgFootline':sum(fys)/len(fys)}))",
        ].join("\n"),
        sheetPath,
        String(rows),
        String(cols),
      ],
      { encoding: "utf8" }
    )
  ) as { avgHeight: number; avgFootline: number };

  return output;
};

const getMovementFrameUniqueness = (basePath: string): boolean | null => {
  const metaPath = path.join(
    process.cwd(),
    "public",
    basePath.replace(/^\//, ""),
    "pipeline-meta.json"
  );
  if (!fs.existsSync(metaPath)) return null;

  const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    movement_gait_qc?: "passed" | "failed";
    frames?: Array<{
      crop_bbox?: [number, number, number, number];
      output_size?: [number, number];
      paste_position?: [number, number];
    }>;
  };
  if (parsed.movement_gait_qc === "passed") return true;
  if (parsed.movement_gait_qc === "failed") return false;

  const frames = parsed.frames ?? [];
  if (frames.length !== 16) return false;

  for (let row = 0; row < 4; row += 1) {
    const rowFrames = frames.slice(row * 4, row * 4 + 4);
    if (rowFrames.some((frame) => !frame.crop_bbox)) {
      return null;
    }
    const signatures = new Set(
      rowFrames.map((frame) =>
        JSON.stringify({
          crop: frame.crop_bbox,
          output: frame.output_size,
          paste: frame.paste_position,
        })
      )
    );

    if (signatures.size < 3) return false;
  }

  return true;
};

const statusFor = (
  assetId: string,
  basePath: string
): "未生成" | "待檔案檢查" | "QC failed" | "完成" => {
  const asset = getAssetDefinition(assetId);
  const audit = getAuditRecord(basePath);

  if (
    audit?.status === "needs-regenerate-style" ||
    audit?.status === "needs-regenerate-motion" ||
    audit?.status === "missing-files" ||
    audit?.status === "quarantine"
  ) {
    return audit.status === "missing-files" ? "待檔案檢查" : "QC failed";
  }

  if (
    asset.source === "generated" &&
    asset.sprite?.qcStatus === "passed" &&
    hasRequiredFiles(basePath) &&
    (audit?.status === "accepted" || audit?.status === "file-ready")
  ) {
    return "完成";
  }

  if (asset.source === "generated" && asset.sprite?.qcStatus === "failed") {
    return "QC failed";
  }

  if (asset.source === "generated") {
    return "待檔案檢查";
  }

  return "未生成";
};

const pairAuditReasonFor = (movementPath: string, combatPath: string): string | null => {
  const movementAudit = getAuditRecord(movementPath);
  const combatAudit = getAuditRecord(combatPath);
  const failed = [movementAudit, combatAudit].find(
    (audit) =>
      audit?.status === "needs-regenerate-style" ||
      audit?.status === "needs-regenerate-motion" ||
      audit?.status === "quarantine" ||
      audit?.status === "missing-files"
  );

  if (!failed) return null;
  if (failed.status === "needs-regenerate-style") return "Style regenerate required";
  if (failed.status === "needs-regenerate-motion") return "Movement direction QC failed";
  if (failed.status === "quarantine") return "Quarantined scratch output";

  return "待檔案檢查";
};

const rows = Object.values(BESTIARY).map((enemy) => {
  const profile = resolveMonsterVisualProfile(enemy);
  const movementPath = createMonsterSpriteBasePath({
    enemyId: enemy.id,
    action: "movement",
  });
  const combatPath = createMonsterSpriteBasePath({
    enemyId: enemy.id,
    action: "combat",
  });
  const movement = statusFor(profile.movementAssetId, movementPath);
  const combat = statusFor(profile.combatAssetId, combatPath);
  const pairAuditReason = pairAuditReasonFor(movementPath, combatPath);
  const movementCellSize = getPipelineCellSize(movementPath);
  const combatCellSize = getPipelineCellSize(combatPath);
  const movementMetrics = getSheetMetrics(movementPath, 4, 4);
  const combatMetrics = getSheetMetrics(combatPath, 4, 6);
  const movementHeight = movementMetrics?.avgHeight ?? null;
  const combatHeight = combatMetrics?.avgHeight ?? null;
  const movementFootline = movementMetrics?.avgFootline ?? null;
  const combatFootline = combatMetrics?.avgFootline ?? null;
  const movementUnique = getMovementFrameUniqueness(movementPath);
  const sameCellSize =
    movement === "完成" && combat === "完成"
      ? movementCellSize === combatCellSize
      : null;
  const heightRatio =
    movementHeight && combatHeight
      ? Math.max(movementHeight, combatHeight) /
        Math.min(movementHeight, combatHeight)
      : null;
  const maxHeightRatio = profile.bodyType === "humanoid" ? 1.08 : 1.12;
  const footlineDelta =
    movementFootline && combatFootline
      ? Math.abs(movementFootline - combatFootline)
      : null;
  const ready =
    movement === "完成" &&
    combat === "完成" &&
    sameCellSize === true &&
    (!heightRatio || heightRatio <= maxHeightRatio) &&
    (!footlineDelta || footlineDelta <= 1) &&
    profile.productionReadySprite
      ? "是"
      : "否";
  const pairStyleQc =
    pairAuditReason ?? (movement === "完成" && combat === "完成"
      ? movementUnique === false
        ? "Movement duplicate frames"
        : sameCellSize !== true
        ? "Frame size mismatch"
        : heightRatio && heightRatio > maxHeightRatio
          ? "Scale mismatch"
          : footlineDelta && footlineDelta > 1
            ? "Footline mismatch"
          : profile.productionReadySprite
            ? "通過"
            : "未檢查"
      : "待兩套完成");

  return { enemy, profile, movement, combat, pairStyleQc, ready };
});

const summary = rows.reduce(
  (acc, row) => {
    acc.total += 1;
    if (row.movement === "完成") acc.movementDone += 1;
    if (row.combat === "完成") acc.combatDone += 1;
    if (row.ready === "是") acc.ready += 1;

    return acc;
  },
  { total: 0, movementDone: 0, combatDone: 0, ready: 0 }
);

const rankSummary = ranks.map((rank) => {
  const rankRows = rows.filter((row) => row.enemy.rank === rank);

  return `- ${rankName[rank]}：${rankRows.length} 隻，movement 完成 ${
    rankRows.filter((row) => row.movement === "完成").length
  }，combat 完成 ${
    rankRows.filter((row) => row.combat === "完成").length
  }，production-ready ${rankRows.filter((row) => row.ready === "是").length}`;
});

const lines = [
  "# 怪物圖樣生成 Checklist",
  "",
  "本文件追蹤 `BESTIARY` 內每隻怪物的獨立 `$generate2dsprite` 圖樣完成度。每隻怪物都必須各自完成 movement 與 combat 兩套圖檔，不能共用另一隻怪物的 production-ready asset。",
  "",
  "## 判定規則",
  "",
  "- `未生成`：asset registry 僅保留 `pending_generate2dsprite` slot，尚未完成 built-in `image_gen` raw sheet 與 processor QC。",
  "- `待檔案檢查`：registry 已標為 `generated`，但 checklist 尚未看到完整輸出檔。",
  "- `QC failed`：已生成但 frame containment、比例、footline、透明背景或方向動畫 QC 未通過。",
  "- `完成`：`source=generated`、`qcStatus=passed`，且輸出資料夾包含 `raw-sheet.png`、`raw-sheet-clean.png`、`sheet-transparent.png`、`frames/`、`animation.gif`、`prompt-used.txt`、`pipeline-meta.json`、`asset.json`。",
  "- `Pair Style QC`：movement 與 combat 都完成後，檢查兩套圖的 silhouette、palette、outline、scale、view angle、footline 與 normalized frame size 是否一致。",
  "- `Frame size mismatch`：movement / combat 的 processor `cell_size` 不同，例如 96px 與 128px 混用。",
  "- `Scale mismatch`：movement / combat 平均輸出高度差距超過 4%。",
  "- `Footline mismatch`：movement / combat 平均腳底線差距超過 1px。",
  "- `Movement duplicate frames`：movement 同一方向列的 4 格缺少足夠差異，沒有呈現左右腳或姿態交替。",
  "- `Production-ready`：movement 與 combat 都完成，且 visual profile 明確標記為 production-ready。",
  "",
  "## 目前摘要",
  "",
  `- 怪物總數：${summary.total}`,
  `- Movement 完成：${summary.movementDone} / ${summary.total}`,
  `- Combat 完成：${summary.combatDone} / ${summary.total}`,
  `- Production-ready：${summary.ready} / ${summary.total}`,
  ...rankSummary,
  "",
  "## 逐隻清單",
  "",
  "| ID | 名稱 | 境界 | Rank | 元素 | Archetype | Body | 尺寸 | Movement | Combat | Pair Style QC | Production-ready |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows.map(({ enemy, profile, movement, combat, pairStyleQc, ready }) => {
    const size = `${profile.footprintTiles.width}x${profile.heightTiles}`;

    return `| ${enemy.id} | ${enemy.name} | ${realmName[enemy.realm]} | ${
      rankName[enemy.rank]
    } | ${elementName[enemy.element]} | ${profile.visualArchetype} | ${
      profile.bodyType
    } | ${size} | ${movement} | ${combat} | ${pairStyleQc} | ${ready} |`;
  }),
  "",
  "## 更新方式",
  "",
  "每完成一隻怪物的 movement 或 combat：",
  "",
  "1. 使用 `$generate2dsprite` 以 built-in `image_gen` 產生 raw sheet，背景必須為 `#FF00FF`。",
  "2. 使用 `$generate2dsprite` processor 做 magenta cleanup、frame splitting、alignment 與 QC。",
  "3. 將輸出放到對應資料夾：`public/assets/generated/characters/monsters/<enemy-id>-movement-v1/` 或 `<enemy-id>-combat-v1/`。",
  "4. QC 通過後才把 asset registry source 改為 `generated`、`qcStatus` 改為 `passed`。",
  "5. 比對同一 enemy 的 movement / combat pair style：silhouette、palette、outline、scale、view angle 與 footline 必須一致。",
  "6. 重新產生本 checklist，確認該怪物的 movement / combat / pair style QC / production-ready 狀態。",
  "",
];

fs.writeFileSync(outputPath, lines.join("\n"));
console.log(`Updated ${outputPath}`);
