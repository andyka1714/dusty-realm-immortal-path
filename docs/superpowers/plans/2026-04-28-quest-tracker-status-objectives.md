# Quest Tracker Status Objectives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make quest tracker cards distinguish available, active, ready, and suggested states while showing objective rows for dialogue, kill, item, level, and mixed quests.

**Architecture:** Keep persistence unchanged and expand the existing `utils/questTracker.ts` helper into a derived view model. `QuestTrackerHUD` renders that model and keeps the existing runtime-only navigation event.

**Tech Stack:** React 19, Redux Toolkit, TypeScript, Vitest, Playwright, OpenSpec.

---

### Task 1: OpenSpec and RED Tests

**Files:**
- Create: `openspec/changes/update-quest-tracker-status-objectives/*`
- Modify: `utils/questTracker.test.ts`
- Modify: `components/game/QuestTrackerHUD.test.tsx`
- Modify: `tests/e2e/shared-ui-foundation.spec.ts`

- [x] Create and validate OpenSpec change.
- [x] Add failing tests for lifecycle status labels and multi-objective rows.
- [x] Add failing HUD markup tests for lifecycle badge and progress rows.
- [x] Add failing e2e coverage for visible `可接取` / `可回報` state differences.

### Task 2: Derived Quest Tracker Model

**Files:**
- Modify: `utils/questTracker.ts`

- [x] Add `QuestLifecycleStatus`, `QuestObjectiveKind`, and `QuestProgressRow` types.
- [x] Add inventory and major realm inputs to `buildQuestTrackerItems`.
- [x] Derive lifecycle labels from active/completed/suggested state.
- [x] Build progress rows from each quest requirement.
- [x] Keep existing navigation targets intact.
- [x] Run `npm test -- --run utils/questTracker.test.ts`.

### Task 3: HUD Rendering

**Files:**
- Modify: `components/game/QuestTrackerHUD.tsx`
- Modify: `components/game/QuestTrackerHUD.test.tsx`

- [x] Read inventory and major realm from Redux and pass them to the helper.
- [x] Render lifecycle badge separately from quest type.
- [x] Render objective rows under the main action line.
- [x] Keep card height compact and use shared `Button`.
- [x] Run `npm test -- --run components/game/QuestTrackerHUD.test.tsx tests/sharedUiNativeControls.test.ts`.

### Task 4: Browser Verification and Archive

**Files:**
- Modify: `tests/e2e/shared-ui-foundation.spec.ts`
- Modify: `openspec/specs/client-interface/spec.md`
- Modify: `openspec/specs/game-mechanics/spec.md`
- Archive: `openspec/changes/archive/2026-04-28-update-quest-tracker-status-objectives/`

- [x] Run targeted Playwright quest tracker tests.
- [x] Run full `npm test -- --run`.
- [x] Run `npx tsc --noEmit`.
- [x] Run `npm run build`.
- [x] Run `openspec validate update-quest-tracker-status-objectives --strict`.
- [x] Archive the change and validate specs.
- [x] Run `git diff --check`.
- [x] Commit the implementation.
