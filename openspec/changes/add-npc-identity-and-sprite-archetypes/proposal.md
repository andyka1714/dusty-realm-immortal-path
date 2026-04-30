# Change: Add NPC identity labels and sprite archetypes

## Why

Current NPC data often uses an institution name such as `萬寶閣`, `靈寶閣`, or `藏經閣` as the NPC name. This makes multiple maps look like they contain the same person and gives the sprite system no stable way to share images by affiliation or role.

NPC sprite rollout needs a clean identity model before assets are generated, so each NPC can have a personal name while still displaying its affiliation and sharing an appropriate sprite archetype.

## What Changes

- Add an NPC identity model that separates personal display name, affiliation label, role label, and sprite assignment.
- Define map label rendering for institution NPCs, showing affiliation above the personal name.
- Define NPC sprite archetype and variant rules so same-affiliation or same-role NPCs can share images while different roles use distinct images.
- Plan the first NPC sprite rollout around stationary humanoid idle sheets, without adding NPC movement or combat sprites.
- Normalize the existing 53 NPCs into planned identity and sprite groups.

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code, when implemented: `types.ts`, `data/npcs.ts`, `data/assets/*`, `components/game/AdventureStage.tsx`, NPC-related tests
- Persistence: no LocalStorage migration; NPC identity and sprite metadata remain static catalog data
