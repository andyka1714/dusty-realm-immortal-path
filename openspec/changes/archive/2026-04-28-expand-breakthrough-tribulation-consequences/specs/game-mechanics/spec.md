## ADDED Requirements

### Requirement: 突破失敗必須能產生持續性災劫後果
系統必須 (MUST) 在高境界突破失敗時能產生可恢復的心魔、傷勢或反噬 consequence，並影響後續突破或修行風險。

#### Scenario: 高境界突破失敗套用 consequence
- **WHEN** 玩家在高境界突破失敗且風險判定觸發
- **THEN** 系統必須記錄對應 consequence 類型、嚴重度與剩餘持續時間或恢復條件
- **AND** 後續 preview 必須能讀取該 consequence 並反映風險或準備提示
