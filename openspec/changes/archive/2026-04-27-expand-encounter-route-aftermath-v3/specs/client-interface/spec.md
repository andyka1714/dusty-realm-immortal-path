## MODIFIED Requirements

### Requirement: 事件鏈與世界記憶提示
介面必須 (MUST) 在 pending encounter 中顯示事件鏈、世界記憶與 route cue，讓玩家能理解事件不是孤立 flavor。

#### Scenario: 顯示 chain 與 memory cue
- **WHEN** pending encounter 屬於事件鏈或引用世界記憶
- **THEN** 介面必須顯示 chain label、memory cue 或等效提示
- **AND** 玩家必須能辨識該事件承接哪條路線或前置結果

#### Scenario: v3 aftermath 顯示路線與收益 cue
- **WHEN** v3 aftermath encounter 進入 pending panel
- **THEN** 介面必須顯示 routeLabel、categoryLabel、chainLabel、memoryCue 與 choice cue tags
- **AND** 玩家必須能在選擇前辨識穩定收益、材料來源或高風險收益
