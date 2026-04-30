## 1. Data Model

- [ ] 1.1 Extend `NPC` catalog typing with optional `affiliationLabel`, `roleLabel`, `spriteArchetype`, and `spriteVariant`.
- [ ] 1.2 Rename institution-style NPC `name` values into personal names while preserving shop, quest, dialogue, coordinates, and IDs.
- [ ] 1.3 Add tests that assert institution NPCs have both personal names and affiliation labels.

## 2. Sprite Registry

- [ ] 2.1 Add NPC sprite archetype registry entries for merchant, equipment, scripture, sect elder, route envoy, workshop, scribe, and echo classes.
- [ ] 2.2 Add a resolver that maps an NPC to its sprite asset ID or falls back to the existing text token.
- [ ] 2.3 Add tests that same-affiliation/variant NPCs share sprite assets and different role classes do not.

## 3. Map Presentation

- [ ] 3.1 Update Adventure map NPC presentation to display affiliation above personal name when present.
- [ ] 3.2 Load NPC humanoid idle sheet frames through an independent-frame path.
- [ ] 3.3 Keep fallback behavior for NPCs without a sprite asset or failed frame loading.

## 4. Asset Rollout

- [ ] 4.1 Generate or register first-batch NPC humanoid idle assets for town and three sect hub archetypes.
- [ ] 4.2 Run humanoid QC and only mark passing assets as production map tokens.
- [ ] 4.3 For every generated and QC-passed NPC idle sheet, update the matching NPC catalog entry and sprite registry mapping in the same implementation slice.
- [ ] 4.4 Add staged follow-up list for world-route, workshop, scribe, and echo NPC assets.

## 5. Validation

- [ ] 5.1 Run targeted NPC catalog, asset registry, generated-asset coverage, and AdventureStage tests.
- [ ] 5.2 Run `npm run typecheck`.
- [ ] 5.3 Run `openspec validate add-npc-identity-and-sprite-archetypes --strict`.
