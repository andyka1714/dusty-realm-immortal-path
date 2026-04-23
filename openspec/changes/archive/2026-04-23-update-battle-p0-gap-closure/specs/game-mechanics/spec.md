## MODIFIED Requirements
### Requirement: 冒險與戰鬥 (Adventure & Combat)
系統必須 (MUST) 提供由單一 battle core 驅動的網格地圖探索、場景內即時戰鬥、時間軸模擬驗證與舊戰報 replay，且高境界技能事件與 status 語意在 world / timeline / replay 三條路徑必須一致。

#### Scenario: 地圖機制
- **WHEN** 進入地圖
- **THEN** 根據 `MAPS` 資料生成網格 (Block-based Design)
- **AND** 生成怪物：普通怪根據地形名稱生成
- **AND** 生成 Boss：固定座標生成，掉落突破道具

#### Scenario: 單一戰鬥核心
- **WHEN** 玩家在地圖世界戰鬥、執行 `runAutoBattle()`，或播放舊戰報 replay
- **THEN** 命中、冷卻、狀態、reward、cleanup 與 lifecycle 必須來自同一套 battle core
- **AND** `Adventure` 頁面只負責 state apply、visual dispatch 與 UI bridge

#### Scenario: 高境界技能事件一致
- **WHEN** 高境界主動或被動技能在 world strike、timeline combat 或 replay 內觸發
- **THEN** 技能的 battle event、status 套用、可見性與日誌語意必須一致
- **AND** 不得只在單一路徑生效或只在單一路徑顯示

#### Scenario: Battle core 擴充落點
- **WHEN** 後續擴充或重構戰鬥規則
- **THEN** 純規則邏輯必須優先落在專責 battle module
- **AND** 不得把 battle 規則回塞到頁面或 component 內維護第二套流程

## ADDED Requirements
### Requirement: 正式狀態與可見性一致性 (Formal Status & Visibility Consistency)
系統必須 (MUST) 讓正式 battle status 的型別、套用、日誌與可見性在 world / timeline / replay 三條路徑保持一致。

#### Scenario: 新增正式狀態
- **WHEN** 新的 battle status 被納入正式支援名單
- **THEN** 共用的 status type、status builder、status logger 與顯示規則必須在同一條變更內補齊
- **AND** 不得只在單一 battle 路徑內以特判方式接入

#### Scenario: 狀態跨路徑驗證
- **WHEN** 正式 status 會影響傷害、控制、免疫或可見性
- **THEN** world strike、timeline combat 與 replay 必須使用同一套語意判定
- **AND** regression tests 必須覆蓋至少一組跨路徑一致性案例
