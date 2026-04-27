# Change: 像素地圖 visual QA v3

## Why

正式 `AdventureStage` 已把 terrain / background pixelization 接進主流程，也已具備 semantic role、skeleton、actor-token guard 與非黑畫面 smoke。不過下一階段要繼續擴後期地圖與 local content，必須先把 pixel terrain 的 visual QA 從「代表地圖可顯示」推進到「可追蹤 coverage、budget 與回歸保護」。

## What Changes

- 建立 pixel terrain visual QA helper，統計代表地圖的 palette、semantic role、skeleton、motif 與 forbidden actor-token guard。
- 補代表 theme / route family 的 regression，覆蓋 path、water、hazard、resource node、portal threshold、boss arena、POI 等語意。
- 強化 Playwright smoke，確認 desktop / mobile Adventure canvas 與 map modal 仍非黑畫面、無水平溢出，且 actor token / HUD 不被 pixel terrain 改掉。
- 更新 pixel terrain / UI 文件，明確 v3 只做 terrain/background QA，不做 3D、不做 actor sprite、不重寫戰鬥邏輯。

## Impact

- Affected specs:
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `utils/adventureTerrainPixelization.ts`
  - `utils/adventureTerrainPixelization.test.ts`
  - `tests/e2e/shared-ui-foundation.spec.ts`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
  - pixel terrain 相關文件

## Persisted State / Migration

- Schema change? `no`
- Persisted surface: not touched
- Migration / hydration sanitize: not needed，這條 change 只新增 terrain visual QA helper、測試與文件，不新增 LocalStorage envelope、`current`、`map` 或 actor state 欄位。
