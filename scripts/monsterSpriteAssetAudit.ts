import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { MonsterSpriteBodyType } from "../data/assets/monsterSpriteAssets";

export type MonsterSpriteAuditStatus =
  | "accepted"
  | "file-ready"
  | "needs-regenerate-style"
  | "needs-regenerate-motion"
  | "missing-files"
  | "quarantine";

export interface DirectionDimensions {
  width: number;
  height: number;
}

export interface MonsterSpriteAuditRecord {
  dirName: string;
  canonical: boolean;
  action: "movement" | "combat" | null;
  bodyType: MonsterSpriteBodyType | null;
  requiredFilesComplete: boolean;
  assetSource?: string | null;
  assetWorkflow?: string | null;
  assetQcStatus?: string | null;
  colorBinCount?: number | null;
  movementDirectionQc?: "passed" | "failed" | "not_applicable" | null;
}

export interface MonsterSpriteAuditClassification {
  status: MonsterSpriteAuditStatus;
  reason: string;
}

export interface MonsterSpriteAuditSummary {
  total: number;
  byStatus: Record<MonsterSpriteAuditStatus, number>;
  records: Array<MonsterSpriteAuditRecord & MonsterSpriteAuditClassification>;
}

const LOW_DETAIL_COLOR_BIN_THRESHOLD = 8;

const horizontalBodyTypes = new Set<MonsterSpriteBodyType>([
  "quadruped",
  "low_crawler",
  "serpentine",
]);

export const resolveMovementDirectionQc = (
  bodyType: MonsterSpriteBodyType | null,
  rowDimensions: DirectionDimensions[]
): "passed" | "failed" => {
  if (rowDimensions.length !== 4) return "failed";

  const rowAreas = rowDimensions.map(({ width, height }) => width * height);
  const maxArea = Math.max(...rowAreas);
  const minArea = Math.min(...rowAreas);
  const areaRatio = maxArea / Math.max(1, minArea);

  if (!bodyType || !horizontalBodyTypes.has(bodyType)) {
    return areaRatio <= 2.1 ? "passed" : "failed";
  }

  const [down, left, right, up] = rowDimensions;
  const sideArea = (left.width * left.height + right.width * right.height) / 2;
  const frontBackArea = (down.width * down.height + up.width * up.height) / 2;
  const volumeRatio =
    Math.max(sideArea, frontBackArea) / Math.max(1, Math.min(sideArea, frontBackArea));

  const sideLongAxis =
    (Math.max(left.width, left.height) + Math.max(right.width, right.height)) / 2;
  const frontBackLongAxis =
    (Math.max(down.width, down.height) + Math.max(up.width, up.height)) / 2;
  const frontBackCollapsed = frontBackLongAxis < sideLongAxis * 0.65;

  return volumeRatio <= 3.2 && !frontBackCollapsed ? "passed" : "failed";
};

export const classifyMonsterSpriteAsset = (
  record: MonsterSpriteAuditRecord
): MonsterSpriteAuditClassification => {
  if (!record.canonical) {
    return {
      status: "quarantine",
      reason: "non-canonical monster sprite directory",
    };
  }

  if (!record.requiredFilesComplete) {
    return {
      status: "missing-files",
      reason: "required generate2dsprite output files are missing",
    };
  }

  if (
    typeof record.colorBinCount === "number" &&
    record.colorBinCount <= LOW_DETAIL_COLOR_BIN_THRESHOLD
  ) {
    return {
      status: "needs-regenerate-style",
      reason: "low color/detail sprite sheet",
    };
  }

  if (record.action === "movement" && record.movementDirectionQc === "failed") {
    return {
      status: "needs-regenerate-motion",
      reason: "movement direction proportions break body volume rules",
    };
  }

  if (
    record.assetSource === "generated" &&
    record.assetWorkflow === "$generate2dsprite" &&
    record.assetQcStatus === "passed"
  ) {
    return {
      status: "accepted",
      reason: "generate2dsprite output passed audit gates",
    };
  }

  return {
    status: "file-ready",
    reason: "files pass local audit but metadata needs normalization",
  };
};

const requiredFiles = [
  "raw-sheet.png",
  "raw-sheet-clean.png",
  "sheet-transparent.png",
  "animation.gif",
  "prompt-used.txt",
  "pipeline-meta.json",
  "asset.json",
];

const canonicalDirPattern = /^m\d+-(?:c\d+|e\d+|b\d+)-(movement|combat)-v1$/;

const readJson = (filePath: string): Record<string, unknown> | null => {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<string, unknown>;
};

const getImageMetrics = (
  sheetPath: string,
  rows: number,
  cols: number
): { colorBinCount: number; rowDimensions: DirectionDimensions[] } | null => {
  if (!fs.existsSync(sheetPath)) return null;

  const output = execFileSync(
    "python3",
    [
      "-c",
      [
        "from PIL import Image",
        "import json,sys",
        "p,rows,cols=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])",
        "im=Image.open(p).convert('RGBA')",
        "pix=[px for px in im.getdata() if px[3] > 8]",
        "bins=set(((r//16)*16,(g//16)*16,(b//16)*16) for r,g,b,a in pix)",
        "cw,ch=im.width//cols,im.height//rows",
        "row_dims=[]",
        "for r in range(rows):",
        "  dims=[]",
        "  for c in range(cols):",
        "    b=im.crop((c*cw,r*ch,(c+1)*cw,(r+1)*ch)).getchannel('A').getbbox()",
        "    if b:",
        "      dims.append((b[2]-b[0], b[3]-b[1]))",
        "  if dims:",
        "    row_dims.append({'width':sum(w for w,h in dims)/len(dims),'height':sum(h for w,h in dims)/len(dims)})",
        "print(json.dumps({'colorBinCount':len(bins),'rowDimensions':row_dims}))",
      ].join("\n"),
      sheetPath,
      String(rows),
      String(cols),
    ],
    {
      encoding: "utf8",
      env: { ...process.env, PYTHONWARNINGS: "ignore::DeprecationWarning" },
    }
  );

  return JSON.parse(output) as {
    colorBinCount: number;
    rowDimensions: DirectionDimensions[];
  };
};

export const auditMonsterSpriteAssets = ({
  monsterRoot,
  bodyTypesByEnemyId,
}: {
  monsterRoot: string;
  bodyTypesByEnemyId: Record<string, MonsterSpriteBodyType>;
}): MonsterSpriteAuditSummary => {
  const records = fs
    .readdirSync(monsterRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dirName = entry.name;
      const dirPath = path.join(monsterRoot, dirName);
      const actionMatch = dirName.match(canonicalDirPattern);
      const canonical = Boolean(actionMatch);
      const action = actionMatch?.[1] as "movement" | "combat" | undefined;
      const enemyId = canonical
        ? dirName.replace(/-(movement|combat)-v1$/, "").replaceAll("-", "_")
        : null;
      const assetJson = readJson(path.join(dirPath, "asset.json"));
      const pipelineMeta = readJson(path.join(dirPath, "pipeline-meta.json"));
      const rows = 4;
      const cols = action === "combat" ? 6 : 4;
      const metrics = getImageMetrics(path.join(dirPath, "sheet-transparent.png"), rows, cols);
      const bodyType = enemyId ? bodyTypesByEnemyId[enemyId] ?? null : null;
      const requiredFilesComplete =
        requiredFiles.every((file) => fs.existsSync(path.join(dirPath, file))) &&
        fs.existsSync(path.join(dirPath, "frames"));
      const movementDirectionQc =
        action === "movement" && metrics
          ? resolveMovementDirectionQc(bodyType, metrics.rowDimensions)
          : action === "combat"
            ? "not_applicable"
            : null;

      const record: MonsterSpriteAuditRecord = {
        dirName,
        canonical,
        action: action ?? null,
        bodyType,
        requiredFilesComplete,
        assetSource:
          typeof assetJson?.source === "string" ? assetJson.source : null,
        assetWorkflow:
          typeof assetJson?.workflow === "string"
            ? assetJson.workflow
            : typeof pipelineMeta?.source_workflow === "string"
              ? pipelineMeta.source_workflow
              : null,
        assetQcStatus:
          typeof assetJson?.qcStatus === "string"
            ? assetJson.qcStatus
            : typeof (assetJson?.sprite as { qcStatus?: unknown } | undefined)?.qcStatus ===
                "string"
              ? (assetJson?.sprite as { qcStatus: string }).qcStatus
              : null,
        colorBinCount: metrics?.colorBinCount ?? null,
        movementDirectionQc,
      };

      return {
        ...record,
        ...classifyMonsterSpriteAsset(record),
      };
    });

  const byStatus = {
    accepted: 0,
    "file-ready": 0,
    "needs-regenerate-style": 0,
    "needs-regenerate-motion": 0,
    "missing-files": 0,
    quarantine: 0,
  } satisfies Record<MonsterSpriteAuditStatus, number>;

  for (const record of records) {
    byStatus[record.status] += 1;
  }

  return { total: records.length, byStatus, records };
};

if (process.argv[1]?.endsWith("monsterSpriteAssetAudit.ts")) {
  const { BESTIARY } = await import("../data/enemies");
  const { resolveMonsterVisualProfile } = await import("../utils/monsterVisualProfile");
  const bodyTypesByEnemyId = Object.fromEntries(
    Object.values(BESTIARY).map((enemy) => [
      enemy.id,
      resolveMonsterVisualProfile(enemy).bodyType,
    ])
  );
  const summary = auditMonsterSpriteAssets({
    monsterRoot: path.join(
      process.cwd(),
      "public/assets/generated/characters/monsters"
    ),
    bodyTypesByEnemyId,
  });

  console.log(JSON.stringify(summary, null, 2));
}
