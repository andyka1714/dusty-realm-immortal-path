## ADDED Requirements

### Requirement: 後段宗門與世界內容可發現性
介面必須 (MUST) 讓玩家能透過既有宗門 NPC、任務 modal 或 pending encounter 看見後段宗門與世界內容。

#### Scenario: 宗門 NPC 提供後段任務入口
- **WHEN** 玩家回到所屬宗門 hub 且符合後段任務前置條件
- **THEN** 對應 NPC 必須能提供後段任務入口
- **AND** 任務 dialogue 必須說明要前往的後段世界目標

#### Scenario: 後段 world encounter 顯示路線 cue
- **WHEN** 後段宗門或世界 encounter 進入 pending modal
- **THEN** modal 必須顯示事件類型、route label 與選項風險 / 收益 cue
- **AND** 不得要求玩家從純文字描述猜測該事件屬於哪條路線
