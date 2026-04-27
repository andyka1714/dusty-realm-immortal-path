## ADDED Requirements

### Requirement: 宗門與世界後段內容 v3

系統必須 (MUST) 讓三宗後段內容在 v2 route chapters 之後繼續延伸，提供可發現、可追蹤、可被後續系統讀取的 late-game 宗門 / 世界承接點。

#### Scenario: 三宗 v3 章節保留路線身份

- **WHEN** 玩家完成既有三宗後段章節並進入更後段世界內容
- **THEN** 系統必須提供對應宗門或職業路線的 v3 chapter、milestone event 或 encounter hook
- **AND** 凌霄劍宗、萬獸山莊、縹緲仙宮不得只剩同模板換名

#### Scenario: v3 章節結果可被後續系統讀取

- **WHEN** 玩家完成 v3 宗門 / 世界章節的重要節點
- **THEN** 系統必須保留可被 quest、encounter selector、Workshop source 或 world memory 讀取的結果
- **AND** 不得只寫入不可查詢的純文字日誌

#### Scenario: v3 內容沿用既有資料模型

- **WHEN** 系統新增 v3 宗門與世界內容
- **THEN** 必須沿用現有 `Quest / NPC / Encounter / world memory` 結構
- **AND** 不得要求新的 persisted state migration 才能載入舊存檔
