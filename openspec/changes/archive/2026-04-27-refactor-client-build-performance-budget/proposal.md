# Change: 建立前端 build performance budget

## Why

`npm run build` 目前雖然可成功完成，但仍輸出 Vite 預設 `500 kB` chunk size warning。實際最大 chunk 是 Pixi runtime，屬於正式 Adventure 場景依賴；若不把預期 runtime chunk 與低頻 preview / panel lazy boundary 寫成可驗證 budget，後續內容擴量會讓 build warning 變成長期噪音，無法分辨真正 regression。

## What Changes

- 建立明確的 Vite chunk budget，讓 build gate 以專案可接受門檻檢查，而不是沿用預設 500 kB。
- 確認 Pixi runtime、framework、entry、Adventure 與低頻面板 chunks 都有可追蹤邊界。
- 將 pixel prototype preview 從入口靜態 import 改為按 query lazy load，避免正式入口無條件載入 preview-only code。
- 補 regression test 驗證 build budget 設定與 preview lazy boundary。
- 文件記錄目前 budget、chunk warning 收口方式與不需要 migration。

## Impact

- Affected specs: `client-interface`, `client-persistence`
- Affected code: `vite.config.ts`, `index.tsx`, build budget tests, balance audit tracking
- Persisted state: 不改 LocalStorage schema；只調整 build/lazy-loading 邊界與測試，因此不需要 migration。
