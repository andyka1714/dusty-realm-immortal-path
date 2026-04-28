# Shared Panel Hardening and v5 Backlog Plan

> 本計畫用來承接 `harden-shared-panel-layout-regression-v1`。本輪先把近期 UI 回歸變成 regression gate，再整理遠期 v5 backlog；不在同一條 change 內一次新增大型內容系統。

## 目標

1. 強化 shared panel 幾何驗證，避免 `道途`、`行囊`、`洞府`、`圖鑑` 反覆出現內容被壓縮或裁切。
2. 清理本地工具產物，確保正式 commit 不混入 `.codex/`、`.playwright-mcp/`、`output/` 或舊草稿。
3. 建立下一輪 v5 backlog 邊界，讓後續內容擴張可按 OpenSpec 分案，而不是在 UI bugfix 裡硬塞。

## 本輪執行範圍

- OpenSpec: `harden-shared-panel-layout-regression-v1`
- UI regression: `tests/e2e/shared-ui-foundation.spec.ts`
- Hygiene: `.gitignore` 與目前未追蹤本地產物
- Tracking: `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## 非範圍

- 不新增 persisted state。
- 不新增第二套 panel layout system。
- 不重做 Dashboard、Inventory、Workshop 或 Compendium 資訊架構。
- 不在本輪直接開大型 v5 內容實作；v5 僅整理成後續 OpenSpec backlog。

## v5 Backlog 建議

### Priority 1. `expand-route-aftermath-density-v5`

- 每宗在 v4 endgame loop 後補 2 到 3 個可重複 aftermath encounter。
- 讀取 `sect:*:endgame-loop-v4`，不新增 unlock state。
- 驗證 `routeLabel / categoryLabel / chainLabel / memoryCue / choice cue`。

### Priority 2. `expand-workshop-endgame-specialization-v5`

- 將 `歸墟三道帝冕` 之後的高階 sink 拆成職業向 follow-up recipe。
- 保持 route material source tracing，不新增 persisted source registry。

### Priority 3. `expand-map-local-endgame-v5`

- 補 `歸墟裂界` 之後的終盤 local NPC、route rumor、Workshop clue。
- 延續 `map-local content density` 的 audit helper，不新增第二套地圖事件 runtime。

### Priority 4. `refine-reincarnation-endgame-builds-v5`

- 讓 v4 endgame soul seal 影響下一世 build preview 與 heirloom 建議。
- 優先讀既有 `soul.worldMemoryTags` 與 catalog lane，不新增 soul schema。

### Priority 5. `harden-content-authoring-ci-v5`

- 把 content audit coverage 擴到新 v5 encounter、recipe、NPC 與 compendium source。
- 目標是防資料漂移，不改 runtime UI。

## 驗證策略

- `openspec validate harden-shared-panel-layout-regression-v1 --strict`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `openspec validate --all --strict`
- `git diff --check`
