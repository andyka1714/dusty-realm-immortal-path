## MODIFIED Requirements
### Requirement: 應用程式導航 (App Navigation)
系統必須 (MUST) 在 active current run 與 full-screen 入口流程之間切換，而不是只支援單一遊戲 shell。

#### Scenario: 有 active current run
- **WHEN** 玩家已有存活中的 current run
- **THEN** 顯示正式 `GameShell`
- **AND** 側邊欄仍包含 `Dashboard / Adventure / Workshop / Inventory` 等主要模組

#### Scenario: 沒有 active current run
- **WHEN** 玩家尚未入世、已死亡待輪迴，或正在輪迴大殿配置下一世
- **THEN** 顯示對應的 full-screen flow
- **AND** 不得直接進入正式 `GameShell`

## ADDED Requirements
### Requirement: 死亡總結與輪迴大殿 (Death Summary & Reincarnation Hall)
系統必須 (MUST) 提供正式的死亡總結與輪迴配置介面，承接本世結算與下一世建立。

#### Scenario: 死亡總結
- **WHEN** 玩家本世結束
- **THEN** 顯示死亡原因、享年、最高境界、本世 merit 與 lifetime stats 摘要
- **AND** 提供進入輪迴大殿的明確操作入口

#### Scenario: 輪迴大殿配置
- **WHEN** 玩家位於輪迴大殿
- **THEN** 顯示可用 merit、perk 選項、heirloom 選擇與 rebirth 預覽
- **AND** 若配置超出 merit 或 heirloom 限制，介面必須阻止確認

#### Scenario: 完成投胎
- **WHEN** 玩家確認下一世配置
- **THEN** full-screen flow 必須離開輪迴大殿並進入新的 current run
- **AND** 顯示的新角色狀態必須反映已購買的 reincarnation bonuses

