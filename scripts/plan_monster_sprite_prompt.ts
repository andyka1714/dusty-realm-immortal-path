import { BESTIARY } from "../data/enemies";
import { resolveMonsterVisualProfile } from "../utils/monsterVisualProfile";
import { EnemyRank } from "../types";

const TILE_PX = 40;

const rankZh: Record<EnemyRank, string> = {
  [EnemyRank.Common]: "普通",
  [EnemyRank.Elite]: "精英",
  [EnemyRank.Boss]: "首領",
};

const rankScale: Record<EnemyRank, string> = {
  [EnemyRank.Common]: "low visual intensity, no aura, clean readable outline",
  [EnemyRank.Elite]: "slightly stronger silhouette, subtle element rim light, modest threat cue",
  [EnemyRank.Boss]: "distinct boss silhouette, stronger aura or ground presence, but no UI-obscuring effects",
};

const bodyMotion: Record<string, string> = {
  humanoid:
    "Movement follows player gait: columns 1 and 3 neutral standing, columns 2 and 4 opposite left/right foot steps. Combat keeps the same slim body height; weapons may extend horizontally.",
  quadruped:
    "Movement follows four-legged gait: columns 1 and 3 neutral planted stance, columns 2 and 4 opposite front/back leg phases. Combat may crouch or lunge, but footline must stay stable and the creature must remain the same animal.",
  low_crawler:
    "Movement follows low crawling gait: columns 1 and 3 compact neutral stance, columns 2 and 4 opposite side-leg/claw phases. Combat uses claw, bite, tail, or pincer attack with stable ground line.",
  serpentine:
    "Movement follows serpentine gait: columns 1 and 3 neutral S-curve, columns 2 and 4 opposite wave phases. Combat uses bite, tail lash, or breath while preserving body scale.",
  winged:
    "Movement follows wing phase gait: columns 1 and 3 neutral wing position, columns 2 and 4 opposite wing beats. Combat uses dive, claw, or beak strike.",
  spirit:
    "Movement follows spirit phase gait: columns 1 and 3 condensed neutral aura, columns 2 and 4 opposite drifting energy or ribbon phases. Combat uses pulse, spell, or slash without changing scale.",
  construct:
    "Movement follows heavy step gait: columns 1 and 3 planted stance, columns 2 and 4 opposite heavy steps. Combat uses slam or weapon strike with the same mass.",
  colossus:
    "Movement follows giant avatar gait: columns 1 and 3 composed stance, columns 2 and 4 opposite slow-step or aura phase. Combat uses large but readable boss gestures.",
  plant:
    "Movement follows rooted phase gait: columns 1 and 3 neutral rooted posture, columns 2 and 4 opposite vine/leaf sway phases. Combat uses vine lash, pollen, or thorn strike.",
};

const subjectFor = (name: string, archetype: string, bodyType: string): string => {
  if (archetype === "humanoid_bandit") return `${name}, a slim masked roadside bandit humanoid`;
  if (archetype === "swordsman") return `${name}, a slim wandering swordsman humanoid`;
  if (bodyType === "quadruped") return `${name}, a low four-legged beast matching its name`;
  if (bodyType === "low_crawler") return `${name}, a low crawling creature matching its name`;
  if (bodyType === "serpentine") return `${name}, a serpentine creature matching its name`;
  if (bodyType === "spirit") return `${name}, a floating spirit-like creature matching its name`;
  return `${name}, a ${bodyType} monster matching its name`;
};

const enemyId = process.argv[2];
const action = process.argv[3] ?? "movement";
if (!enemyId || !BESTIARY[enemyId]) {
  throw new Error("Usage: npx tsx scripts/plan_monster_sprite_prompt.ts <enemyId> [movement|combat]");
}

const enemy = BESTIARY[enemyId];
const profile = resolveMonsterVisualProfile(enemy);
const targetHeight = profile.heightTiles * TILE_PX;
const targetWidth = profile.footprintTiles.width * TILE_PX;
const cellSize = Math.max(96, Math.ceil(Math.max(targetHeight + 16, targetWidth + 16) / 16) * 16);

const prompt = [
  `Enemy: ${enemy.id} ${enemy.name}. Rank: ${rankZh[enemy.rank]} (${rankScale[enemy.rank]}).`,
  `Semantic body: ${profile.bodyType}, archetype: ${profile.visualArchetype}, variant: ${profile.visualVariant}.`,
  `Design size from player baseline: player 1x2 = 80px tall, so this monster is ${profile.footprintTiles.width}x${profile.heightTiles} tiles, target visual size about ${targetWidth}px wide by ${targetHeight}px tall before fitting into a ${cellSize}px cell.`,
  `Subject: ${subjectFor(enemy.name, profile.visualArchetype, profile.bodyType)}.`,
  bodyMotion[profile.bodyType],
  action === "combat"
    ? "Create combat sheet: 6 columns x 4 rows, row order down/front, left, right, up. Columns 1 ready, 2 wind-up, 3 attack, 4 follow-through, 5 recovery, 6 ready. Preserve movement identity, scale, palette, outline, and footline."
    : "Create movement sheet: 4 columns x 4 rows, row order down/front, left, right, up. Columns 1 and 3 neutral phase; columns 2 and 4 opposite locomotion phases.",
  "Use project-native pixel-art / hand-painted RPG sprite style, solid pure #FF00FF background, no grid, no labels, no shadows outside the character, safe margins, no edge touch.",
].join("\n");

console.log(
  JSON.stringify(
    {
      enemyId: enemy.id,
      name: enemy.name,
      rank: rankZh[enemy.rank],
      bodyType: profile.bodyType,
      archetype: profile.visualArchetype,
      footprintTiles: profile.footprintTiles,
      heightTiles: profile.heightTiles,
      targetWidth,
      targetHeight,
      cellSize,
      prompt,
    },
    null,
    2
  )
);
