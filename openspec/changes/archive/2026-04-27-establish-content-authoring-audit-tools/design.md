# Design: 內容 authoring audit tools

## Context

目前已有多個分散 regression：

- `data/sectWorldStoryBranch.test.ts` 驗證三宗 world chapter。
- `data/workshopRecipes.test.ts` 驗證 recipe 與 route material sink。
- `components/Compendium/sourceTracing.test.ts` 驗證少數來源追蹤案例。
- `data/mapLocalContentDensity.test.ts` 驗證 map-local v3。

但這些測試偏 feature-specific，缺少一個 catalog-wide authoring guard。

## Goals

- 建立集中 helper，讓後續內容擴量時能重用。
- 優先覆蓋資料一致性，不新增 runtime UI。
- 錯誤訊息要能指出哪個 quest、event、NPC 或 recipe 斷線。
- 保持 deterministic，不依賴瀏覽器或 localStorage。

## Non-Goals

- 不建立 CMS 或 editor。
- 不新增 CLI unless test helper 不夠用。
- 不改現有 reward / quest / encounter runtime。
- 不新增 persisted state。

## Approach

1. 新增 `data/contentAuthoringAudit.ts`，提供可重用 audit functions。
2. 新增 `data/contentAuthoringAudit.test.ts`，覆蓋：
   - item references。
   - quest / NPC references。
   - route material source/sink/tracing。
3. 將 route material 清單集中在 helper 內，後續新增 route material 時只需補一處。
4. 文件記錄 audit coverage 和終盤 v4 前置價值。

## Migration

此 change 只新增測試與 deterministic data helper，不改 LocalStorage、hydrate、runtime state 或 persisted catalog shape。
