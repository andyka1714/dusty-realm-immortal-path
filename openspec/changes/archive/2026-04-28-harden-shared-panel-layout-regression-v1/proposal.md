# Change: 強化共享浮層面板版面回歸防線

## Why

近期 `道途` 與 `行囊空間` 多次出現 shared panel 內部內容被壓縮、按鈕尺寸不一致或側欄資訊被截斷的問題。這些問題不是單一元件文案錯誤，而是 embedded panel 在桌面寬版與 mobile viewport 下缺少足夠幾何 regression。

## What Changes

- 擴充 shared panel Playwright smoke，針對 `道途 / 行囊 / 洞府 / 圖鑑 / 奇遇 / 地圖` 檢查關鍵內容不被裁切、不互相覆蓋、不水平溢出。
- 將 `道途` action row、修煉指南、修煉日誌與 `行囊` 物品詳情/當前裝備納入正式 regression baseline。
- 清理本地工具產物規則，避免 `.codex/`、`.playwright-mcp/`、`output/` 或舊草稿混入正式 change commit。
- 更新追蹤文件，記錄本輪 scope、驗證指令與不需要 migration 的理由。

## Impact

- Affected specs: `client-interface`
- Affected code: `tests/e2e/shared-ui-foundation.spec.ts`, `.gitignore`
- Affected docs: `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`, `docs/superpowers/plans/*`
- Schema change? No
- Migration required? No。此 change 只調整 UI regression、測試與本地工具產物規則，不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
