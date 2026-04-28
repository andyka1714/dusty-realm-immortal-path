## ADDED Requirements

### Requirement: Adventure HUD 必須呈現完整角色狀態
介面必須 (MUST) 在正式 `GameShell` 的 Adventure 畫面左上角顯示可掃描的角色狀態卡，而不是只顯示名稱、境界與資源文字列。

#### Scenario: 左上角色狀態卡顯示 RPG 核心資訊
- **WHEN** 玩家位於正式 Adventure 場景
- **THEN** 左上 HUD 必須顯示暫代 avatar、角色名稱、境界、derived Lv、HP、MP、戰力與目前活動狀態
- **AND** HP / MP 必須由既有角色戰鬥屬性推導
- **AND** 戰力必須沿用正式 combat power helper，而不是另寫一套 UI 估算

### Requirement: 底部 Dock 承接主要單機功能入口
介面必須 (MUST) 讓底部 dock 承接主要功能入口，避免把角色、背包、功法、洞府、圖鑑與地圖入口分散到互相競爭的 HUD 區塊。

#### Scenario: Dock 顯示主要功能入口
- **WHEN** 玩家位於正式 Adventure 場景
- **THEN** dock 必須提供 `道途 / 背包 / 功法 / 洞府 / 圖鑑 / 地圖` 入口
- **AND** `功法` 入口必須能開到已存在的功法資訊面板或圖鑑功法 tab
- **AND** `地圖` 入口必須能開啟 Adventure 地圖 modal 或等效地圖介面

### Requirement: 戰鬥操作不再依賴大型底部快捷列
介面必須 (MUST) 保留場景點擊、普攻、技能、掛機與地圖操作，但不得用大型 `GameSection` 戰鬥快捷列長期佔據底部核心視野。

#### Scenario: 戰鬥 action wheel 保留操作但降低版面佔用
- **WHEN** 地圖狀態需要顯示戰鬥操作
- **THEN** 介面必須以小型 action wheel、icon button 或等效低佔用控制呈現
- **AND** 不得再顯示寬版 `戰鬥快捷列` 面板遮住場景與底部 dock
