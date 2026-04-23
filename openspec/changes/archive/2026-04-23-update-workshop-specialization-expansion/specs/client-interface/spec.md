## ADDED Requirements
### Requirement: Workshop 專精與 recipe cue
系統必須 (MUST) 在 Workshop UI 呈現 recipe 擴量與專精效果，讓玩家能理解目前專精、熟練度與高階 recipe 受影響的地方。

#### Scenario: 顯示目前專精與可選分支
- **WHEN** 玩家打開 Workshop
- **THEN** 介面必須顯示 `alchemy / smithing` 目前專精或尚未選擇狀態
- **AND** 必須提供可讀的專精效果說明

#### Scenario: recipe card 顯示專精影響
- **WHEN** recipe 受到目前專精影響
- **THEN** recipe card 必須顯示受影響 cue，例如成本、輸出、品質或 mastery 改變
- **AND** 鎖定原因仍必須保留境界、等級、靈石與材料不足訊息
