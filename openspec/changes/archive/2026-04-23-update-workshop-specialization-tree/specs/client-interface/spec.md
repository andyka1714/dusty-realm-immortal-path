## ADDED Requirements
### Requirement: Workshop 專精樹介面
介面必須 (MUST) 在 Workshop 中呈現專精樹節點、鎖定原因、分支衝突、reset 操作與 recipe 受影響 cue。

#### Scenario: 玩家理解專精節點狀態
- **WHEN** 玩家查看煉丹或煉器專精
- **THEN** 介面必須顯示目前已解鎖節點、可解鎖節點、鎖定原因與分支互斥提示
- **AND** 不得只顯示無法操作的單一專精名稱

#### Scenario: 玩家可合法 reset 專精
- **WHEN** 玩家符合 reset 成本並確認 reset
- **THEN** 介面必須能觸發對應 reset action
- **AND** reset 後必須清楚顯示可重新選擇的專精狀態

