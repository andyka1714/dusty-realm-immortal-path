# RPG HUD Skill Loadout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a player-owned skill loadout panel, compact RPG HUD/quest layout, and clearer scripture pavilion acquisition flow.

**Architecture:** Keep the compendium as catalog/source tracing and add a separate `SkillPanel` for learned skills. Store only the selected active skill id on `character`, with migration sanitize and battle fallback. HUD and quest tracker remain derived UI; scripture pavilion uses existing shop data plus a new NPC entry.

**Tech Stack:** React 19, Redux Toolkit, TypeScript, Vitest, Playwright, OpenSpec.

---

### Task 1: OpenSpec Changes

**Files:**
- Create `openspec/changes/add-character-skill-loadout-panel/*`
- Create `openspec/changes/refine-mobile-rpg-hud-and-quest-list/*`
- Create `openspec/changes/clarify-scripture-pavilion-skill-acquisition/*`
- Create `openspec/changes/plan-rpg-main-screen-layout-v2/*`

- [x] Write proposals, tasks, and spec deltas for all four changes.
- [x] Run `openspec validate <change-id> --strict` for every change.

### Task 2: Skill Loadout

**Files:**
- Modify `types.ts`
- Modify `store/slices/characterSlice.ts`
- Modify `store/persistedStateMigration.ts`
- Modify `utils/battleEncounterSkillSelection.ts`
- Create `components/game/SkillPanel.tsx`
- Modify `components/game/GameShell.tsx`

- [x] Add RED tests for equipped active skill, migration, battle selection, and panel rendering.
- [x] Add `equippedActiveSkillId` to character state.
- [x] Sanitize persisted equipped skill ids.
- [x] Use equipped active skill in battle when valid, fallback when invalid.
- [x] Make bottom dock `功法` open `SkillPanel`.

### Task 3: Compact HUD and Quest List

**Files:**
- Modify `components/game/GameHUD.tsx`
- Modify `components/game/QuestTrackerHUD.tsx`

- [x] Add RED tests for compact stat grid and quest tracker placement.
- [x] Convert the lower stats to a responsive compact grid.
- [x] Align desktop quest tracker below the compact HUD.

### Task 4: Scripture Pavilion Entry

**Files:**
- Modify `data/npcs.ts`
- Modify `data/maps.ts` if needed
- Modify `components/adventure/ShopPanel.tsx`

- [x] Add RED tests proving the mortal scripture pavilion has a map NPC and skill manual shop copy.
- [x] Add `village_scripture_keeper` pointing to `skill_shop_mortal`.
- [x] Clarify shop copy for skill manuals.

### Task 5: Validation and Archive

- [x] Run targeted tests.
- [x] Run `npm test`.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run build`.
- [x] Run Playwright shared UI smoke.
- [x] Run `git diff --check`.
- [x] Commit implementation.
- [x] Archive all OpenSpec changes.
