## ADDED Requirements

### Requirement: 前端 build performance budget
系統必須 (MUST) 讓正式前端 build 具備可追蹤的 chunk budget，避免已知 runtime chunk 造成長期 warning noise。

#### Scenario: Build 不輸出預設 chunk warning
- **WHEN** 開發者執行 `npm run build`
- **THEN** build 必須成功完成且不因既有 Pixi runtime chunk 輸出 Vite 預設 chunk size warning
- **AND** 專案必須保留明確的 chunk budget 設定，讓後續 chunk 成長仍可被 build gate 追蹤

#### Scenario: Preview-only code 不同步載入正式入口
- **WHEN** 玩家以一般遊戲入口載入 app
- **THEN** pixel prototype preview code 必須維持在 query-gated lazy boundary 後
- **AND** 正式 `GameShell`、`Adventure`、`Inventory`、`Workshop`、`Compendium` panels 必須維持原本 lazy loading 行為
