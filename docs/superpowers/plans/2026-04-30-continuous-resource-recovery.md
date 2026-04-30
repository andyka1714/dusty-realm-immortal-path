# Continuous Resource Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5-second Adventure runtime HP and MP recovery that works during and outside combat.

**Architecture:** Keep recovery math in a pure utility so formulas and future timed effects can be tested without React. `Adventure.tsx` owns runtime HP/MP state and calls the utility on a fixed 5-second interval. No persisted state changes are required.

**Tech Stack:** TypeScript, React hooks, Vitest, OpenSpec.

---

### Task 1: Recovery Calculation Helper

**Files:**
- Create: `utils/worldPlayerResourceRecovery.ts`
- Create: `utils/worldPlayerResourceRecovery.test.ts`

- [ ] **Step 1: Write failing tests** for 5-second eligibility, HP base + attributes + regenHp, MP base + attributes, clamp-to-max, and runtime recovery effects.
- [ ] **Step 2: Run** `npm test -- utils/worldPlayerResourceRecovery.test.ts` and confirm RED.
- [ ] **Step 3: Implement** `resolveWorldPlayerResourceRecovery` and related types/constants.
- [ ] **Step 4: Re-run** `npm test -- utils/worldPlayerResourceRecovery.test.ts` and confirm GREEN.

### Task 2: Adventure Runtime Wiring

**Files:**
- Modify: `pages/Adventure.tsx`

- [ ] **Step 1: Import** the recovery helper and constant.
- [ ] **Step 2: Add** a `lastResourceRecoveryAtRef` initialized with `Date.now()`.
- [ ] **Step 3: Add** a `useEffect` interval that applies recovery every 5 seconds while Adventure is mounted.
- [ ] **Step 4: Keep** recovery silent; no log spam every 5 seconds.

### Task 3: Validation and OpenSpec Closure

**Files:**
- Modify: `openspec/changes/add-continuous-resource-recovery/tasks.md`

- [ ] **Step 1: Run** `npm test -- utils/worldPlayerResourceRecovery.test.ts components/game/GameHUD.test.tsx`.
- [ ] **Step 2: Run** `npm run typecheck`.
- [ ] **Step 3: Run** `openspec validate add-continuous-resource-recovery --strict`.
- [ ] **Step 4: Mark tasks complete and confirm no persisted migration is required.
