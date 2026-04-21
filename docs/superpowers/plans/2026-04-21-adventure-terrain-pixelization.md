# Adventure Terrain Pixelization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pixelize the official `AdventureStage` terrain/background layer while keeping player, NPC, monster, and combat-entity rendering unchanged.

**Architecture:** Add one pure terrain-generation helper driven by `mapData.theme`, then insert a terrain graphics layer beneath the current grid/entity/overlay stack in `AdventureStage`. Preserve all existing entity containers and combat overlay logic.

**Tech Stack:** React, PixiJS, TypeScript, Vitest, OpenSpec

---

### Task 1: Lock the terrain-only integration scope in docs and OpenSpec

**Files:**
- Modify: `docs/04_UI/pixel_art_bible.md`
- Modify: `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
- Create: `docs/superpowers/specs/2026-04-21-adventure-terrain-pixelization-design.md`
- Create: `openspec/changes/update-adventure-terrain-pixelization/proposal.md`
- Create: `openspec/changes/update-adventure-terrain-pixelization/design.md`
- Create: `openspec/changes/update-adventure-terrain-pixelization/tasks.md`
- Create: `openspec/changes/update-adventure-terrain-pixelization/specs/client-interface/spec.md`

- [ ] **Step 1: Write docs that explicitly preserve entity rendering**
- [ ] **Step 2: Validate the new OpenSpec change**

Run: `openspec validate update-adventure-terrain-pixelization --strict`

Expected: `Change 'update-adventure-terrain-pixelization' is valid`

- [ ] **Step 3: Commit the docs/spec checkpoint**

```bash
git add docs/04_UI/pixel_art_bible.md docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md docs/superpowers/specs/2026-04-21-adventure-terrain-pixelization-design.md docs/superpowers/plans/2026-04-21-adventure-terrain-pixelization.md openspec/changes/update-adventure-terrain-pixelization
git commit -m "docs: plan adventure terrain pixelization"
```

### Task 2: Add a pure terrain-generation helper with TDD

**Files:**
- Create: `utils/adventureTerrainPixelization.ts`
- Create: `utils/adventureTerrainPixelization.test.ts`

- [ ] **Step 1: Write failing tests for theme-aware terrain output**
- [ ] **Step 2: Run `npm test -- utils/adventureTerrainPixelization.test.ts` and confirm RED**
- [ ] **Step 3: Implement the minimal theme palette and terrain patch generator**
- [ ] **Step 4: Run `npm test -- utils/adventureTerrainPixelization.test.ts` and confirm GREEN**
- [ ] **Step 5: Commit the helper checkpoint**

```bash
git add utils/adventureTerrainPixelization.ts utils/adventureTerrainPixelization.test.ts
git commit -m "feat: add adventure terrain pixelization helper"
```

### Task 3: Integrate terrain/background pixelization into the official AdventureStage

**Files:**
- Modify: `components/adventure/AdventureStage.tsx`

- [ ] **Step 1: Write the failing test for the terrain helper behavior needed by AdventureStage**
- [ ] **Step 2: Insert a dedicated terrain layer beneath the existing grid/entity stack**
- [ ] **Step 3: Keep player, NPC, monster, portal, and combat overlay rendering unchanged**
- [ ] **Step 4: Re-run targeted tests and typecheck**
- [ ] **Step 5: Commit the integration checkpoint**

```bash
git add components/adventure/AdventureStage.tsx utils/adventureTerrainPixelization.ts utils/adventureTerrainPixelization.test.ts
git commit -m "feat: pixelize adventure terrain background"
```

### Task 4: Full verification and final checkpoint

**Files:**
- Verify only: `components/adventure/AdventureStage.tsx`
- Verify only: `utils/adventureTerrainPixelization.ts`

- [ ] **Step 1: Run `npm test`**
- [ ] **Step 2: Run `npm run typecheck`**
- [ ] **Step 3: Run `npm run build`**
- [ ] **Step 4: Run `openspec validate update-adventure-terrain-pixelization --strict`**
- [ ] **Step 5: Commit the verified phase**

```bash
git add -A
git commit -m "test: verify adventure terrain pixelization"
```
