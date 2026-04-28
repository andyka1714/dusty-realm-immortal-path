## ADDED Requirements

### Requirement: 任務追蹤必須顯示下一主線並可導向
介面必須 (MUST) 在沒有 active quest 時顯示下一個可接主線任務，且任務追蹤項目必須可點擊導向對應 NPC、地圖或條件目的地。

#### Scenario: 玩家沒有接受任何任務
- **WHEN** 玩家進入 Adventure 主畫面且沒有 active quest
- **THEN** 任務追蹤必須顯示下一個符合前置條件的主線任務
- **AND** 點擊該項目必須導向任務起始 NPC 所在地圖與座標

#### Scenario: 玩家已有進行中任務
- **WHEN** 玩家點擊進行中的任務追蹤項目
- **THEN** 若任務可回報，必須導向回報 NPC
- **AND** 若任務需要對話，必須導向對話 NPC
- **AND** 若任務需要擊殺，必須導向包含目標妖獸的地圖

### Requirement: 任務追蹤必須貼近 compact 角色 HUD
介面必須 (MUST) 將 desktop 任務追蹤放在 compact 角色 HUD 下方，避免過度下移或重疊。

#### Scenario: 玩家在 desktop 主畫面查看 HUD
- **WHEN** compact 角色 HUD 與任務追蹤同時顯示
- **THEN** 任務追蹤必須在角色 HUD 下方
- **AND** 兩者距離必須足夠避免重疊，但不得形成過大的垂直空白
