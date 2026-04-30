# Combat Consumable Pill System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立完整丹藥補給、自動服丹與大境界晉階物驗證系統。

**Architecture:** 丹藥資料仍集中在 item catalog，來源由 shops、workshop recipes 與 enemy drops 提供。Adventure 保存自動服丹偏好，恢復丹藥 CD 只在 runtime 管理，背包與戰鬥 UI 共用 `consumableEffects` helper 呈現原因與冷卻。

**Tech Stack:** React 19, Redux Toolkit, TypeScript, Vitest, OpenSpec.

---

### Task 1: OpenSpec 與 RED Tests

**Files:**
- Create: `openspec/changes/add-combat-consumable-pill-system/*`
- Create: `docs/superpowers/specs/2026-04-29-combat-consumable-pill-system-design.md`
- Create: `docs/superpowers/plans/2026-04-29-combat-consumable-pill-system.md`
- Modify: `data/items/itemLineAudit.test.ts`
- Create: `data/breakthroughItemDrops.test.ts`
- Modify: `utils/consumableEffects.test.ts`
- Modify: `store/slices/adventureSlice.test.ts`
- Modify: `store/persistedStateMigration.test.ts`
- Modify: `pages/Inventory.supplies.test.tsx`

- [x] **Step 1: 建立 OpenSpec change 與設計文件**

Run: `openspec validate add-combat-consumable-pill-system --strict`
Expected: pass.

- [x] **Step 2: 寫丹藥資料 coverage failing tests**

Test requirements:
- first-wave pill line includes `heal_mp`
- recovery pills have `cooldown: 5`
- pill line has shop or workshop source

- [x] **Step 3: 寫晉階物 Boss 掉落 failing tests**

Test requirements:
- every `BREAKTHROUGH_CONFIG[realm].requiredItemId` exists
- at least one same-realm Boss drops it
- `generateDrops` guarantees Boss breakthrough drops

### Task 2: 丹藥資料與來源

**Files:**
- Modify: `data/items/consumables.ts`
- Modify: `data/items/itemLineMetadata.ts`
- Modify: `data/shops.ts`
- Modify: `data/workshopRecipes.ts`

- [x] **Step 1: 新增回靈丹與中階恢復丹**

Add:
- `spirit_recovery_pill`
- `greater_spirit_recovery_pill`
- `lesser_revitalizing_pill`

- [x] **Step 2: 補 shop / workshop source**

Add low-tier pills to `general_store_mortal` and recipes for recovery pills.

### Task 3: 恢復 CD 與自動服丹

**Files:**
- Modify: `types.ts`
- Modify: `utils/consumableEffects.ts`
- Modify: `store/slices/adventureSlice.ts`
- Modify: `store/persistedStateMigration.ts`
- Modify: `pages/Adventure.tsx`

- [x] **Step 1: 新增 recovery cooldown helper**

Implement:
- `RECOVERY_CONSUMABLE_COOLDOWN_MS`
- `getRecoveryConsumableCooldownRemainingMs`
- `getRecoveryConsumableCooldownLabel`

- [x] **Step 2: 新增 persisted auto settings**

Add `AdventureState.autoConsumableSettings` with HP/MP defaults.

- [x] **Step 3: Adventure runtime 使用共同服丹流程**

Manual and auto use should call the same helper path and share `lastRecoveryConsumableUsedAt`.

### Task 4: UI 與驗證

**Files:**
- Modify: `pages/Inventory.tsx`
- Modify: `pages/Adventure.tsx`
- Modify: `openspec/changes/add-combat-consumable-pill-system/tasks.md`

- [x] **Step 1: 背包顯示 5 秒共用冷卻**
- [x] **Step 2: 戰鬥補給顯示冷卻與 HP / MP 自動服丹開關**
- [x] **Step 3: Run targeted tests**
- [x] **Step 4: Run full validation**

Commands:

```bash
npm test -- data/items/itemLineAudit.test.ts data/breakthroughItemDrops.test.ts utils/consumableEffects.test.ts store/slices/adventureSlice.test.ts store/persistedStateMigration.test.ts pages/Inventory.supplies.test.tsx
npm test
npm run typecheck
npm run build
git diff --check
```
