export interface NpcSpriteMapping {
  archetype: string;
  variant: string;
  assetId: string;
}

export const NPC_IDLE_SPRITE_MAPPINGS: NpcSpriteMapping[] = [
  {
    archetype: "town_elder",
    variant: "village",
    assetId: "npc.town_elder.village.idle_v1",
  },
  {
    archetype: "wanbao_clerk",
    variant: "village",
    assetId: "npc.wanbao_clerk.village.idle_v1",
  },
  {
    archetype: "lingbao_forgemaster",
    variant: "village_blacksmith",
    assetId: "npc.lingbao_forgemaster.village_blacksmith.idle_v1",
  },
];

export const findNpcSpriteMapping = ({
  archetype,
  variant,
}: {
  archetype?: string;
  variant?: string;
}): NpcSpriteMapping | null =>
  NPC_IDLE_SPRITE_MAPPINGS.find(
    (mapping) => mapping.archetype === archetype && mapping.variant === variant
  ) ?? null;
