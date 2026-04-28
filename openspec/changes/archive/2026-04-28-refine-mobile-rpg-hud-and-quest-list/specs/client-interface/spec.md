## ADDED Requirements

### Requirement: 主畫面 HUD 必須提供 mobile-first 角色狀態
介面必須 (MUST) 在主畫面顯示 mobile-first 的角色狀態卡，包含名稱、境界、推導等級、HP、MP、戰力與活動狀態。

#### Scenario: 玩家在主畫面查看角色狀態
- **WHEN** 玩家進入 Adventure 主畫面
- **THEN** 左上角色狀態卡必須以 compact layout 顯示核心數值
- **AND** mobile viewport 不得因戰力、靈石、修為、壽元直列而佔用過多垂直畫面

### Requirement: 主畫面任務追蹤必須支援 desktop 與 mobile
介面必須 (MUST) 讓玩家在 Adventure 主畫面看到目前任務追蹤，且 desktop 與 mobile 都不得遮住主要操作。

#### Scenario: 玩家查看目前任務
- **WHEN** 玩家有 active quests
- **THEN** desktop 任務追蹤必須顯示在角色卡下方
- **AND** mobile 任務追蹤必須以低佔用入口收合並可展開
