## ADDED Requirements

### Requirement: 存檔保存排程必須保留最後一次變更
LocalStorage 保存器必須 (MUST) 在節流更新與頁面離開情境中保存最後一次有效 Redux state，不得只依賴 leading write。

#### Scenario: 節流窗內連續更新
- **WHEN** 玩家在一秒內產生多次可持久化 state 變更
- **THEN** 系統可以合併中間寫入
- **AND** 節流窗結束時必須 trailing flush 最新狀態

#### Scenario: 玩家迅速離開頁面
- **WHEN** 最新變更尚未到 trailing timer，瀏覽器觸發 `pagehide` 或頁面轉為 hidden
- **THEN** 系統必須同步 flush 最新 versioned envelope
- **AND** 不得依賴 unload 階段的非同步網路或背景工作

### Requirement: 存檔失敗必須提供可見復原路徑
LocalStorage quota、serialization 或寫入失敗時，系統必須 (MUST) 保留遊戲 session 並向玩家顯示可理解的非阻斷提示與復原操作。

#### Scenario: LocalStorage 寫入失敗
- **WHEN** 保存器捕捉 quota 或 serialization error
- **THEN** 介面必須提示目前進度可能尚未保存
- **AND** 玩家必須能重試或匯出目前的 versioned envelope
- **AND** 遊戲不得因保存失敗直接崩潰

#### Scenario: 玩家匯出存檔
- **WHEN** 玩家使用存檔匯出功能
- **THEN** 匯出內容必須使用目前正式 versioned envelope
- **AND** 匯出不得改變 current run、soul state 或 LocalStorage schema

#### Scenario: 玩家匯入存檔
- **WHEN** 玩家提供匯出的 JSON 或 legacy save
- **THEN** 匯入內容必須先通過既有 migration 與 hydration sanitize
- **AND** 非法 JSON、未知 shape 或無效 catalog reference 不得直接進入 Redux store

### Requirement: 保存可靠性改善不新增 persisted state
Trailing flush、頁面離開保存、錯誤提示與匯出入必須 (MUST) 沿用現有 versioned save envelope，不新增 LocalStorage schema 欄位。

#### Scenario: Change 不需要 migration
- **WHEN** 系統完成保存排程與復原入口改良
- **THEN** `schemaVersion` 與 envelope shape 必須維持不變
- **AND** 既有正式存檔與 legacy migration regression 必須繼續通過
- **AND** 不需要新增 migration 或 hydration sanitize 分支
