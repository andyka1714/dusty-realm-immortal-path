## ADDED Requirements
### Requirement: 支撐型養成與事件狀態持久化
系統必須 (MUST) 持久化 Workshop 與 event loop 所需的當世狀態，避免重新整理後遺失進度。

#### Scenario: Workshop current run 狀態保存
- **WHEN** 玩家更新聚靈陣、煉丹、煉器或 recipe 進度
- **THEN** 對應的 Workshop state 必須保存於 current run
- **AND** 重新載入後不得丟失當世百業進度

#### Scenario: event 流程狀態保存
- **WHEN** 玩家正處於待處理的 event / encounter 流程
- **THEN** 系統必須保存必要的事件上下文與可恢復狀態
- **AND** 不得因重新載入而跳過、重複或破壞該次事件結果
