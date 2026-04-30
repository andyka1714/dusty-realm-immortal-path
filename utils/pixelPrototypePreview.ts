import { MAPS } from "../data/maps";
import { EnemyRank } from "../types";
import { PIXEL_PROTOTYPE_MAP_ID } from "./pixelAdventurePrototype";
import type { WorldCombatStagePresentation } from "./worldCombatPresentation";

export const PIXEL_PROTOTYPE_PREVIEW_QUERY_KEY = "pixel-prototype-preview";
export const PIXEL_PROTOTYPE_PREVIEW_MODE_QUERY_KEY = "pixel-prototype-mode";
export const PIXEL_PROTOTYPE_PREVIEW_BOOT_BUDGET_MS = 400;
export const PIXEL_PROTOTYPE_PREVIEW_TARGET_FPS = {
  desktop: 55,
  mobile: 45,
} as const;

export type PixelPrototypePreviewViewportMode = "desktop" | "mobile";

export interface PixelPrototypePreviewFixture {
  mapData: (typeof MAPS)[number];
  playerPosition: { x: number; y: number };
  activeMonsters: Array<{
    instanceId: string;
    templateId: string;
    name: string;
    x: number;
    y: number;
    currentHp: number;
    rank: EnemyRank;
    spawnX: number;
    spawnY: number;
  }>;
  targetMonsterId: string;
  combatPresentation: WorldCombatStagePresentation;
  playerStatusNames: string[];
  enemyStatusNames: string[];
  targetRoleLabel: string;
  targetIntentLabel: string;
  recentCueLabel: string;
  recentCueDetail: string;
}

const PIXEL_PREVIEW_MAP = MAPS.find((map) => map.id === PIXEL_PROTOTYPE_MAP_ID);

const isTruthyParam = (value: string | null) =>
  value === "1" || value === "true" || value === "yes";

export const isPixelPrototypePreviewEnabled = (search: string) => {
  const params = new URLSearchParams(search);
  return isTruthyParam(params.get(PIXEL_PROTOTYPE_PREVIEW_QUERY_KEY));
};

export const getPixelPrototypePreviewModeOverride = (
  search: string
): PixelPrototypePreviewViewportMode | null => {
  const params = new URLSearchParams(search);
  const mode = params.get(PIXEL_PROTOTYPE_PREVIEW_MODE_QUERY_KEY);

  if (mode === "desktop" || mode === "mobile") {
    return mode;
  }

  return null;
};

export const createPixelPrototypePreviewFixture =
  (): PixelPrototypePreviewFixture => {
    if (!PIXEL_PREVIEW_MAP) {
      throw new Error("Representative pixel prototype map (20) is missing.");
    }

    return {
      mapData: PIXEL_PREVIEW_MAP,
      playerPosition: { x: 40, y: 40 },
      activeMonsters: [
        {
          instanceId: "preview-ranged",
          templateId: "m20_c1",
          name: "蝕骨田鼬",
          x: 43,
          y: 40,
          currentHp: 42,
          rank: EnemyRank.Common,
          spawnX: 43,
          spawnY: 40,
        },
        {
          instanceId: "preview-melee",
          templateId: "m20_c2",
          name: "裂鬚田狼",
          x: 38,
          y: 41,
          currentHp: 58,
          rank: EnemyRank.Common,
          spawnX: 38,
          spawnY: 41,
        },
      ],
      targetMonsterId: "preview-ranged",
      combatPresentation: {
        playerRangeRadius: 1,
        enemyRangeRadius: 4,
        enemyAggroRadius: 6,
        enemyPreferredRadius: 4,
        showEnemyAggroRing: true,
        showEnemyPreferredRing: true,
        showEnemyDangerFill: true,
        showEnemyRetreatBand: true,
        showTargetFocusReticle: true,
        enemyRoleLabel: "遠程風箏",
        enemyRoleAccentColor: 0x60a5fa,
        enemyAggroColor: 0xf87171,
        enemyPreferredColor: 0x38bdf8,
        enemyDangerFillAlpha: 0.24,
        playerAttackCycle: {
          ready: false,
          remainingMs: 600,
          totalMs: 1200,
          fillPercent: 50,
        },
      },
      playerStatusNames: ["護盾"],
      enemyStatusNames: ["燃燒", "破甲"],
      targetRoleLabel: "遠程風箏",
      targetIntentLabel: "保持四格射程並丟出投射物，距離過近時會後撤拉距。",
      recentCueLabel: "危險區與投射物同步可讀",
      recentCueDetail: "同時驗證 target focus、危險圈與右側 HUD cue 是否仍清楚。",
    };
  };
