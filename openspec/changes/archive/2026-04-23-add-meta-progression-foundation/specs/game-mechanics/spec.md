## MODIFIED Requirements
### Requirement: 遊戲初始化流程 (Game Initialization)
系統必須 (MUST) 引導玩家完成首次入世或輪迴後的新一世角色建立，而不是只支援單次新手開局。

#### Scenario: 首次入世
- **WHEN** 玩家第一次進入遊戲且沒有 current run
- **THEN** 顯示序幕、姓名 / 性別輸入與靈根覺醒流程
- **AND** 產生第一世角色的 current run 狀態

#### Scenario: 輪迴後投胎
- **WHEN** 玩家在輪迴大殿確認新的本世配置
- **THEN** 系統必須以選定的靈根、perks 與 heirloom 配置建立新的 current run
- **AND** 先前本世的地圖、背包、任務與戰鬥狀態必須重置為新一世初始值
- **AND** soul progression 必須保留並扣除已花費的 merit

### Requirement: 冒險與戰鬥 (Adventure & Combat)
系統必須 (MUST) 提供網格地圖探索與地圖內時間軸戰鬥，而不是切換成舊式獨立回合制 modal。

#### Scenario: 地圖內接戰
- **WHEN** 玩家或怪物在接戰範圍內發動普攻、技能或怪物特招
- **THEN** 戰鬥必須直接在 `Adventure` 場景內依 `attackRange / castRange / cooldownSeconds / castTimeMs / projectileSpeed / areaShape` 等資料解析
- **AND** 世界戰鬥、時間軸驗證與 replay 必須共用同一套 battle resolver 與 reward 流程

#### Scenario: 本世結束
- **WHEN** 玩家在地圖內戰敗、壽元耗盡或主動結束此世
- **THEN** 系統必須先結算本世生涯，再導向輪迴流程
- **AND** 不得直接只把角色退回未初始化狀態而跳過結算

## ADDED Requirements
### Requirement: 輪迴轉生與靈魂進度 (Reincarnation & Soul Progression)
系統必須 (MUST) 在角色結束本世時，把本世成果轉換為可跨周目累積的靈魂進度。

#### Scenario: 生涯結算轉換為 merit
- **WHEN** 本世結束
- **THEN** 系統必須根據本世最高大境界與享年計算 merit
- **AND** 更新 `Lifetime Stats`，至少包含最高境界、最高年歲、死亡次數與轉生次數

#### Scenario: 輪迴大殿配置下一世
- **WHEN** 玩家進入輪迴大殿
- **THEN** 系統必須顯示可用 merit、已解鎖 perks、可帶入的 heirloom 與本世結算摘要
- **AND** 玩家只能在合法的 merit 預算與 heirloom 限額內建立下一世配置

#### Scenario: 靈魂進度跨周目保留
- **WHEN** 完成轉生並開始新一世
- **THEN** soul progression 必須保留
- **AND** current run 相關資料必須重建
- **AND** 不得讓上一世的 current run 狀態殘留到新一世

