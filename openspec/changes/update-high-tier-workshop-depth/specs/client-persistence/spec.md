## ADDED Requirements
### Requirement: 高階 Workshop 狀態遷移
系統必須 (MUST) 讓新增的 Workshop mastery、specialization 或 high-tier recipe 狀態安全寫入 current run，並能從舊存檔補齊預設值。

#### Scenario: 新版存檔保留高階百業進度
- **WHEN** 玩家完成高階 recipe、累積 mastery 或設定百業專精
- **THEN** 存檔的 `current.workshop` 必須保留對應進度
- **AND** 重新載入後不得遺失已解鎖 recipe、craft counts、mastery 或 specialization

#### Scenario: legacy workshop state 補齊新欄位
- **WHEN** 舊存檔的 `current.workshop` 只有 `alchemyLevel / blacksmithLevel / unlockedRecipes / craftedRecipeCounts`
- **THEN** migration 必須補上 high-tier workshop 所需的新欄位預設值
- **AND** 不得因欄位缺失讓讀檔、輪迴或 Workshop UI 崩潰
