## ADDED Requirements

### Requirement: 主畫面 HUD 必須在修為滿時提供直接突破入口
介面必須 (MUST) 在 Adventure 主畫面角色 HUD 的修為格中，於角色可突破時提供直接 `突破` 操作，且不得要求玩家先打開 `道途` 面板。

#### Scenario: 玩家修為已滿
- **WHEN** 角色 `isBreakthroughAvailable` 為 true
- **THEN** HUD 修為格必須顯示 `突破` 按鈕
- **AND** 點擊後必須開啟與 `道途` 相同的突破彈窗

#### Scenario: 玩家嘗試大境界突破
- **WHEN** HUD 開啟的大境界突破彈窗需要突破道具
- **THEN** 彈窗必須顯示需求道具、持有狀態與掉落提示
- **AND** 缺少道具時確認突破必須 disabled
