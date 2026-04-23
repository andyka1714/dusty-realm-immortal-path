## ADDED Requirements
### Requirement: 宗門世界路線章節 v2
系統必須 (MUST) 讓三宗後段內容延伸為可追蹤的跨地圖 route chapter，而不是只停在單次任務節點。

#### Scenario: 三宗章節保留路線差異
- **WHEN** 玩家推進不同宗門的後段章節
- **THEN** 任務、NPC、encounter 或 reward cue 必須保留該宗門路線辨識
- **AND** 不得讓三宗章節只剩同模板換名

#### Scenario: 章節結果能餵給後續系統
- **WHEN** 玩家完成 route chapter 的重要節點
- **THEN** 系統必須能提供可被 encounter memory、Workshop source 或後續 quest 讀取的結果
- **AND** 不得只寫入不可查詢的日誌文字
