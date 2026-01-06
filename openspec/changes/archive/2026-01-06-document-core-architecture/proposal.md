# Change: 核心架構文檔補完 (Retrofit)

## Why
專案已實作核心功能、UI 和數據持久化，但缺乏正式的 OpenSpec 文檔。我們需要回溯補完這些文檔，以便為未來的變更建立基準，並確保「純前端」架構的限制被遵守。

## What Changes
這是一個純文檔變更。
- **數據管理 (Data Management)**：記錄 Redux + LocalStorage 的持久化層 (`client-persistence`)。
- **UI/風格 (UI/Style)**：記錄 Tailwind + Lucide 的樣式系統與佈局 (`client-interface`)。
- **遊戲機制 (Features)**：記錄已實作的修煉、背包和冒險系統 (`game-mechanics`)。

## Impact
- **Specs**: 新增 `client-persistence`、`client-interface`、`game-mechanics`。
- **Code**: 不涉及代碼變更，僅進行一致性驗證。
