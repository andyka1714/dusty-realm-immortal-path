# Dusty Realm Next Workstreams Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將下一輪工作拆成三條可獨立接手的 OpenSpec 主線：圖鑑資訊架構、物品經濟補給、宗門世界 late v3。

**Architecture:** 先做 `update-compendium-taxonomy-and-layout`，修正玩家查資料入口；再做 `update-item-economy-combat-supplies`，補商店與補給閉環；最後做 `expand-sect-world-late-content-v3`，擴宗門 / 世界後段內容。三條線都必須先完成 proposal / tasks / spec validate，再進入實作；每條線完成後要回寫 base spec、tracking docs、提交並 archive。

**Tech Stack:** React 19、Redux Toolkit、TypeScript、Tailwind CSS、OpenSpec、Vitest、Playwright

---

## Current Context

- `openspec list` 目前沒有 active changes。
- 最新已完成 commits:
  - `17f8dbb chore(openspec): archive encounter content density v3`
  - `5ae3d23 feat(encounter): expand high-realm content density`
- 未追蹤檔案目前主要是 `.codex/`、`.playwright-mcp/`、`output/playwright/*` 與舊 plan 草稿，不得混入正式 change commit。
- `openspec validate --all --strict` 已通過。

## Execution Order

1. `update-compendium-taxonomy-and-layout`
2. `update-item-economy-combat-supplies`
3. `expand-sect-world-late-content-v3`

這個順序的理由：先修玩家資料查詢入口，再補物品補給閉環，最後擴內容。若先擴內容，玩家仍會在圖鑑與補給入口遇到同樣的可讀性問題。

## Task 1: Compendium Taxonomy and Layout

**Files:**
- Read: `openspec/changes/update-compendium-taxonomy-and-layout/proposal.md`
- Read: `openspec/changes/update-compendium-taxonomy-and-layout/design.md`
- Read: `openspec/changes/update-compendium-taxonomy-and-layout/tasks.md`
- Modify: `components/Compendium/CompendiumModal.tsx`
- Test: `components/Compendium/CompendiumModal.test.tsx` or nearest existing component test
- Test: `tests/e2e/shared-ui-foundation.spec.ts` or a focused compendium e2e spec
- Docs: `docs/04_UI/components.md`
- Docs: `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

- [ ] **Step 1: Validate the OpenSpec change**

Run:

```bash
openspec validate update-compendium-taxonomy-and-layout --strict
```

Expected: `Change 'update-compendium-taxonomy-and-layout' is valid`.

- [ ] **Step 2: Write failing tests for the three UI defects**

Cover:

- `神兵法寶` first card remains visible and is not hidden by a sticky heading.
- `功法神通` can filter by `通用 / 劍修 / 體修 / 法修`.
- `宗門傳承` shows one sect at a time and switches content through tabs.

- [ ] **Step 3: Implement the minimal Compendium layout changes**

Use existing shared `Button / Tabs` patterns. Do not add persisted UI preference. Do not modify skill or item catalog data.

- [ ] **Step 4: Run targeted verification**

Run:

```bash
npm test -- components/Compendium/CompendiumModal.test.tsx
npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium
npm run typecheck
git diff --check
```

If the e2e coverage is moved into a new file, replace the e2e path with that file.

- [ ] **Step 5: Update docs and close the change**

Update:

- `docs/04_UI/components.md`
- `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- `openspec/changes/update-compendium-taxonomy-and-layout/tasks.md`
- `openspec/specs/client-interface/spec.md`

Then validate, commit, archive:

```bash
openspec validate update-compendium-taxonomy-and-layout --strict
openspec validate --all --strict
git diff --check
git status --short
```

Commit only relevant files.

## Task 2: Item Economy and Combat Supplies

**Files:**
- Read: `openspec/changes/update-item-economy-combat-supplies/proposal.md`
- Read: `openspec/changes/update-item-economy-combat-supplies/design.md`
- Read: `openspec/changes/update-item-economy-combat-supplies/tasks.md`
- Modify: `data/shops.ts`
- Modify: `data/items/consumables.ts`
- Modify: `store/slices/characterSlice.ts`
- Modify: `pages/Inventory.tsx`
- Modify: `components/adventure/ShopPanel.tsx`
- Modify if needed: `pages/Adventure.tsx`
- Test: shop / consumable / inventory / adventure targeted tests
- Docs: `docs/04_Items/01_Overview.md`
- Docs: `docs/04_Items/04_Consumables.md`
- Docs: `docs/04_Items/05_DropSystem.md`
- Docs: `docs/02_Gameplay/inventory.md`

- [ ] **Step 1: Validate the OpenSpec change**

Run:

```bash
openspec validate update-item-economy-combat-supplies --strict
```

Expected: `Change 'update-item-economy-combat-supplies' is valid`.

- [ ] **Step 2: Write failing data tests**

Cover:

- `general_store_mortal.items.length > 0`
- every shop item id exists in the item catalog
- early supplement items have displayable effects

- [ ] **Step 3: Write failing behavior tests**

Cover:

- unsupported effects must not increment `itemConsumption`
- `heal_hp` and `full_restore` must have a visible supported path before consuming
- `heal_mp` must not silently consume if no MP resource exists

- [ ] **Step 4: Implement shop and supplement data**

Add low-risk early supplies first. Do not add toxicity, resistance, cooldown, or persisted combat resource in this change unless the spec is amended before implementation.

- [ ] **Step 5: Implement effect handling and UI feedback**

Keep permanent character effects in `characterSlice`. Put combat / exploration supply behavior behind a small bridge or thunk so `Adventure.tsx` local battle HP is not mutated from unrelated UI by accident.

- [ ] **Step 6: Run targeted verification**

Run:

```bash
npm test -- data/shops.test.ts store/slices/characterSlice.test.ts pages/Inventory.test.tsx
npm run typecheck
npm run build
git diff --check
```

Adjust exact test paths to the files created during implementation.

- [ ] **Step 7: Update docs and close the change**

Update item docs, tracking docs, OpenSpec tasks, and base specs. Then validate all specs and commit only relevant files.

## Task 3: Sect World Late Content v3

**Files:**
- Read: `openspec/changes/expand-sect-world-late-content-v3/proposal.md`
- Read: `openspec/changes/expand-sect-world-late-content-v3/design.md`
- Read: `openspec/changes/expand-sect-world-late-content-v3/tasks.md`
- Modify: `data/quests.ts`
- Modify: `data/maps.ts`
- Modify: `data/encounters.ts`
- Test: `data/sectWorldStoryBranch.test.ts`
- Test: `data/sectLateProgression.test.ts`
- Test: `data/encounters.test.ts`
- Docs: `docs/02_Gameplay/sect-world.md`
- Docs: `docs/03_World/story.md`
- Docs: `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

- [ ] **Step 1: Validate the OpenSpec change**

Run:

```bash
openspec validate expand-sect-world-late-content-v3 --strict
```

Expected: `Change 'expand-sect-world-late-content-v3' is valid`.

- [ ] **Step 2: Inventory existing route chapter state**

Read current `chapter_01 / chapter_02` quest ids, NPC hooks, world memory tags, and route material source cues. Do not rename existing ids.

- [ ] **Step 3: Write failing progression tests**

Cover each sect:

- map-local hook exists
- v3 route cue exists
- completion result is queryable by quest / encounter / world memory

- [ ] **Step 4: Implement one sect at a time**

Implement and test in this order:

1. 凌霄劍宗
2. 萬獸山莊
3. 縹緲仙宮

After each sect, run the relevant targeted test before continuing.

- [ ] **Step 5: Connect milestone encounter and source cues**

Add route-specific milestone encounter or hook. Confirm `routeLabel / categoryLabel / choice cue` exist. If Workshop source cue is added, keep it as source semantics only; do not add recipe families in this change.

- [ ] **Step 6: Run final verification**

Run:

```bash
npm test -- data/sectWorldStoryBranch.test.ts data/sectLateProgression.test.ts data/encounters.test.ts
npm run typecheck
npm run build
openspec validate expand-sect-world-late-content-v3 --strict
git diff --check
```

- [ ] **Step 7: Update docs and close the change**

Update gameplay docs, tracking docs, OpenSpec tasks, and base specs. Then validate all specs, commit relevant files, and archive.

## Commit Hygiene

- Do not stage `.codex/`, `.playwright-mcp/`, `output/`, or unrelated old plan files unless the user explicitly asks.
- Before each commit, run:

```bash
git status --short
git diff --cached --stat
```

- Every commit should correspond to one OpenSpec change or archive step.
