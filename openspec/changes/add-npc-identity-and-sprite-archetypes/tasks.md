## 1. Data Model

- [x] 1.1 Extend `NPC` catalog typing with optional `affiliationLabel`, `roleLabel`, `spriteArchetype`, and `spriteVariant`.
- [x] 1.2 Rename institution-style NPC `name` values into personal names while preserving shop, quest, dialogue, coordinates, and IDs.
- [x] 1.3 Add tests that assert institution NPCs have both personal names and affiliation labels.

## 2. Sprite Registry

- [x] 2.1 Add NPC sprite archetype registry entries for merchant, equipment, scripture, sect elder, route envoy, workshop, scribe, and echo classes.
- [x] 2.2 Add a resolver that maps an NPC to its sprite asset ID or falls back to the existing text token.
- [x] 2.3 Add tests that same-affiliation/variant NPCs share sprite assets and different role classes do not.

## 3. Map Presentation

- [x] 3.1 Update Adventure map NPC presentation to display affiliation above personal name when present.
- [x] 3.2 Load NPC humanoid idle sheet frames through an independent-frame path.
- [x] 3.3 Keep fallback behavior for NPCs without a sprite asset or failed frame loading.

## 4. Asset Rollout

- [x] 4.1 Generate or register first-batch NPC humanoid idle assets for town and three sect hub archetypes.
- [x] 4.2 Run humanoid QC and only mark passing assets as production map tokens.
- [x] 4.3 For every generated and QC-passed NPC idle sheet, update the matching NPC catalog entry and sprite registry mapping in the same implementation slice.
- [x] 4.4 Add staged follow-up list for world-route, workshop, scribe, and echo NPC assets.

## 5. Validation

- [x] 5.1 Run targeted NPC catalog, asset registry, generated-asset coverage, and AdventureStage tests.
- [x] 5.2 Run `npm run typecheck`.
- [x] 5.3 Run `openspec validate add-npc-identity-and-sprite-archetypes --strict`.
