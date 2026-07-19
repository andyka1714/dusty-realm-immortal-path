// The former pixel/clean-HD sheets have been retired. Runtime now renders all
// monsters through the deterministic paper-cut avatar system; future raster
// sheets only re-enter this list after explicitly passing the paper-cut gate.
export const PRODUCTION_READY_MONSTER_IDS = [] as const;

export const MOVEMENT_REGENERATION_ONLY_MONSTER_IDS = [] as const;

export const PRODUCTION_READY_MONSTER_ID_SET = new Set<string>(
  PRODUCTION_READY_MONSTER_IDS
);

export const GENERATED_MONSTER_SPRITE_ASSET_IDS = new Set<string>([
  ...PRODUCTION_READY_MONSTER_IDS.flatMap((enemyId) => [
    `enemy.${enemyId}.movement_v1`,
    `enemy.${enemyId}.combat_v1`,
  ]),
  ...MOVEMENT_REGENERATION_ONLY_MONSTER_IDS.map(
    (enemyId) => `enemy.${enemyId}.combat_v1`
  ),
]);
