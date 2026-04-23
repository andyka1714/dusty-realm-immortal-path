## ADDED Requirements
### Requirement: 洞府百業正式操作介面
系統必須 (MUST) 在 `Workshop` 介面提供正式可操作的聚靈、煉丹與煉器流程，而不是只顯示未開放遮罩。

#### Scenario: 煉丹與煉器可以操作
- **WHEN** 玩家進入 `Workshop`
- **THEN** 介面必須顯示可用 recipe、材料需求、預期產出與操作入口
- **AND** 不得再以 placeholder 卡片代替正式 loop

#### Scenario: 洞府收益可讀
- **WHEN** 玩家升級聚靈陣、煉製丹藥或完成煉器
- **THEN** 介面必須清楚顯示資源消耗與實際收益
- **AND** 玩家不必離開 `Workshop` 才能理解本次投入的結果

### Requirement: 事件與奇遇的正式呈現
系統必須 (MUST) 為 event / encounter 提供正式的選項與結果 UI，而不是只寫入日誌。

#### Scenario: event 選項畫面
- **WHEN** 觸發事件或奇遇
- **THEN** 介面必須顯示事件描述、可選操作與對應風險 / 收益提示
- **AND** 玩家必須能明確完成一次選擇，而不是只旁觀 flavor log
