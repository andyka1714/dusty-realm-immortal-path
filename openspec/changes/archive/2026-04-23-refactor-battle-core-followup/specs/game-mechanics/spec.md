## MODIFIED Requirements
### Requirement: 冒險與戰鬥 (Adventure & Combat)
系統必須 (MUST) 提供由單一 battle core 驅動的網格地圖探索、場景內即時戰鬥、時間軸模擬驗證與舊戰報 replay。

#### Scenario: 地圖機制
- **WHEN** 進入地圖
- **THEN** 根據 `MAPS` 資料生成網格 (Block-based Design)
- **AND** 生成怪物：普通怪根據地形名稱生成
- **AND** 生成 Boss：固定座標生成，掉落突破道具

#### Scenario: 單一戰鬥核心
- **WHEN** 玩家在地圖世界戰鬥、執行 `runAutoBattle()`，或播放舊戰報 replay
- **THEN** 命中、冷卻、狀態、reward、cleanup 與 lifecycle 必須來自同一套 battle core
- **AND** `Adventure` 頁面只負責 state apply、visual dispatch 與 UI bridge

#### Scenario: Battle core 擴充落點
- **WHEN** 後續擴充或重構戰鬥規則
- **THEN** 純規則邏輯必須優先落在專責 battle module
- **AND** 不得把 battle 規則回塞到頁面或 component 內維護第二套流程

## ADDED Requirements
### Requirement: 戰鬥文件與驗證同步 (Battle Documentation & Validation Sync)
系統必須 (MUST) 讓 battle core 的模組邊界、共享規則與回歸測試維持同步，避免文件與實作脫節。

#### Scenario: Battle 模組邊界調整
- **WHEN** battle core 的模組邊界、shared contract 或 orchestration 入口發生調整
- **THEN** `README`、`Gameplay` 與 `Balance Audit` 相關文件必須在同一條變更中同步更新
- **AND** 不得繼續沿用已過時的 battle 架構敘事

#### Scenario: 共用規則重構
- **WHEN** world / timeline / replay 共用的 battle 規則被重構
- **THEN** 必須補上或更新 regression tests
- **AND** 確保三條路徑的 status、cooldown、outcome 與 lifecycle 行為維持一致
