import type { NPC } from "../types";
import {
  findNpcSpriteMapping,
  NPC_IDLE_SPRITE_MAPPINGS,
} from "../data/assets/npcSpriteRegistry";

export const resolveNpcSpriteAssetId = (
  npc: Pick<NPC, "spriteArchetype" | "spriteVariant">
): string | null =>
  findNpcSpriteMapping({
    archetype: npc.spriteArchetype,
    variant: npc.spriteVariant,
  })?.assetId ?? null;

export const listNpcSpriteMappings = () => [...NPC_IDLE_SPRITE_MAPPINGS];
