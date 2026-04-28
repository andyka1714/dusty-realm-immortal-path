# Endgame Route v5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 `expand-endgame-route-v5`，把 v4 終盤記憶延伸成 v5 aftermath、Workshop follow-up、map-local clue、reincarnation seal 與 authoring audit。

**Architecture:** 使用既有 static catalog 與 selector/tag 系統，不新增 persisted state。先以 tests 定義 v5 id、route tags、source hints 與 UI copy，再補資料與文件，最後以 OpenSpec archive 收口。

**Tech Stack:** React 19、Redux Toolkit、TypeScript、Vite、Vitest、Playwright、OpenSpec

---

## Task 1: OpenSpec 與 failing tests

**Files:**
- Create: `openspec/changes/expand-endgame-route-v5/*`
- Modify: `data/encounters.test.ts`
- Modify: `data/workshopRecipes.test.ts`
- Modify: `data/mapLocalContentDensity.test.ts`
- Modify: `components/game/ReincarnationFlow.test.tsx`
- Modify: `data/contentAuthoringAudit.test.ts`

- [ ] 寫 v5 encounter cases，要求三宗 repeatable aftermath 讀 `sect:*:endgame-loop-v4`。
- [ ] 寫 v5 Workshop cases，要求三條 recipe consume `emperor_crown` 與對應 route material。
- [ ] 寫 v5 map-local cases，要求 `歸墟裂界` 追加 route rumor NPC / quest。
- [ ] 寫 v5 reincarnation cases，要求 v5 soul seal 顯示 route memory、預期收益與 locked reason。
- [ ] 寫 v5 audit cases，要求 v5 catalog coverage 可被集中檢查。

## Task 2: Catalog implementation

**Files:**
- Modify: `data/encounters.ts`
- Modify: `data/workshopRecipes.ts`
- Modify: `data/npcs.ts`
- Modify: `data/maps.ts`
- Modify: `data/quests.ts`
- Modify: `data/reincarnationPerks.ts`
- Modify: `data/contentAuthoringAudit.ts`

- [ ] 補三宗 v5 aftermath event。
- [ ] 補三條 v5 endgame follow-up recipe。
- [ ] 補 v5 map NPC / quest 並掛到 `歸墟裂界`。
- [ ] 補三條 v5 soul seal。
- [ ] 補 content audit helper coverage。

## Task 3: Docs, validation, archive

**Files:**
- Modify: `docs/02_Gameplay/workshop.md`
- Modify: `docs/02_Gameplay/reincarnation.md`
- Modify: `docs/02_Gameplay/sect-world.md`
- Modify: `docs/03_World/story.md`
- Modify: `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

- [ ] 更新 docs 與 tracking。
- [ ] 跑 targeted tests。
- [ ] 跑 Playwright shared UI smoke。
- [ ] 跑 `npm test`、`npm run typecheck`、`npm run build`、`openspec validate --all --strict`、`git diff --check`。
- [ ] 更新 OpenSpec tasks，commit，archive，commit archive。
