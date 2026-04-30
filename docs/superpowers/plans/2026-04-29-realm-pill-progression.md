# Realm Pill Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete realm-by-realm pill progression without introducing pill quality scaling.

**Architecture:** Keep runtime recovery behavior unchanged and expand static item/source metadata. Tests enforce that every major realm has a cultivation pill, HP pill, and MP pill, with recovery values staying inside a conservative CD-balanced band.

**Tech Stack:** React 19, Redux Toolkit, TypeScript, Vitest, OpenSpec.

---

### Task 1: OpenSpec Change

**Files:**
- Create: `openspec/changes/expand-realm-pill-progression/proposal.md`
- Create: `openspec/changes/expand-realm-pill-progression/tasks.md`
- Create: `openspec/changes/expand-realm-pill-progression/specs/game-mechanics/spec.md`

- [ ] Validate the OpenSpec change with `openspec validate expand-realm-pill-progression --strict`.

### Task 2: RED Tests

**Files:**
- Modify: `data/items/itemLineAudit.test.ts`

- [ ] Add a test proving every major realm has one real gain-exp pill, one real HP recovery pill, and one real MP recovery pill in `FIRST_WAVE_ITEM_LINE_ITEM_IDS.pill`.
- [ ] Add a test proving every recovery pill keeps the shared 5 second cooldown.
- [ ] Add a balance test proving realm recovery values stay within the expected conservative envelope.
- [ ] Run `npm test -- data/items/itemLineAudit.test.ts` and confirm the new tests fail before implementation.

### Task 3: Pill Data and Sources

**Files:**
- Modify: `data/items/consumables.ts`
- Modify: `data/items/itemLineMetadata.ts`
- Modify: `data/workshopRecipes.ts`
- Modify: `data/shops.ts`

- [ ] Add missing realm pills from 練氣 through 仙帝.
- [ ] Update item-line metadata so the compendium groups those pills by usable realm.
- [ ] Add workshop recipes for the new pills with existing materials and escalating spirit-stone costs.
- [ ] Add selected early/mid realm pills to reasonable shops while keeping high realm pills workshop/crafting focused.
- [ ] Run targeted tests and fix only the failing behavior.

### Task 4: Validation

**Files:**
- Modify: `openspec/changes/expand-realm-pill-progression/tasks.md`

- [ ] Run targeted tests for item metadata and compendium rendering.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Run `openspec validate expand-realm-pill-progression --strict`.
- [ ] Run `git diff --check`.
- [ ] Mark completed tasks in the OpenSpec checklist.
