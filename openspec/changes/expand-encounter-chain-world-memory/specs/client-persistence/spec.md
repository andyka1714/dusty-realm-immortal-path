## ADDED Requirements
### Requirement: 事件鏈與世界記憶持久化
系統必須 (MUST) 在 current run 中安全保存 encounter chain 與 world memory state，並能從舊存檔補齊預設值。

#### Scenario: 舊存檔補齊事件記憶 state
- **WHEN** 載入尚未包含 world memory 欄位的舊存檔
- **THEN** migration 必須補上合法預設值
- **AND** 不得破壞既有 pending encounter 或 resolved event ids

#### Scenario: 無效記憶資料被清理
- **WHEN** 存檔包含 shape 不合法的 chain 或 memory payload
- **THEN** hydration 必須安全清理或忽略該資料
- **AND** 不得因此讓遊戲無法讀檔
