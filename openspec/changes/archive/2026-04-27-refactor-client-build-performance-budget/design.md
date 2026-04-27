# Design: 前端 build performance budget

## Context

正式場景已採用 `GameShell` + lazy panel 架構，`Adventure` 仍是主場景常駐。Pixi 是正式地圖渲染依賴，因此最大 runtime chunk 會高於一般 UI chunk；這不應靠忽略 warning 解決，而應建立專案 budget，並確保 preview-only code 不被正式入口同步載入。

## Goals

- `npm run build` 不再輸出 chunk size warning。
- Pixi runtime budget 明確記錄在 Vite config 與 docs。
- Pixel prototype preview 只在 `?pixelPrototype=1` 等 preview query 下 lazy load。
- Playwright smoke 繼續覆蓋 GameShell panels、Adventure canvas、map modal、pending encounter。

## Non-Goals

- 不改玩法邏輯。
- 不重寫 Adventure renderer。
- 不拆分 Pixi 內部 package 到過細 manual chunks，避免正式地圖 runtime 載入順序變得脆弱。
- 不新增 persisted schema 或 migration。

## Approach

1. 將 Vite `chunkSizeWarningLimit` 調整為專案 budget，並保留 `pixi / framework / icons` manual chunk。
2. 為 pixel prototype preview 增加 lazy import boundary，正式 App path 仍維持 `Provider -> App -> GameShell`。
3. 新增 config-level regression，驗證：
   - budget 門檻存在且高於目前 Pixi runtime。
   - `pixi.js-legacy` 不被歸入正式 `pixi` chunk。
   - entry 不再靜態 import `AdventurePixelPrototypePreview`。
4. 以 `npm run build`、Playwright smoke 與 typecheck 驗證 lazy boundary 不破壞正式 UI。

## Migration

此 change 不改 persisted state。lazy boundary 與 build budget 只影響編譯輸出與載入策略，既有存檔內容與 hydrate shape 不需要調整。
