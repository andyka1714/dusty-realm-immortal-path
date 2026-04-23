## ADDED Requirements
### Requirement: 宗門後段世界章節承接
系統必須 (MUST) 讓三宗 `task_04` 之後的故事能接入後段世界章節，而不是只把玩家推到地圖後停止追蹤。

#### Scenario: task_04 後出現世界章節入口
- **WHEN** 玩家完成任一宗門的 `task_04` 並進入對應後段條件
- **THEN** 系統必須提供可追蹤的世界章節任務、NPC 對話或 milestone encounter
- **AND** 該章節必須能指向 `三界戰場 / 隕仙深淵 / 煉虛節點` 等後段世界內容

#### Scenario: 後段內容維持宗門路線辨識
- **WHEN** 不同宗門玩家推進後段世界章節
- **THEN** 系統必須保留該宗門或職業路線的文案、目標、reward cue 或 event cue 差異
- **AND** 不得讓三宗後段全部退化成同一段無差別世界任務

