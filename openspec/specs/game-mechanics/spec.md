# game-mechanics Specification

## Purpose
定義《Dusty Realm: Immortal Path》目前正式上線的修煉、地圖內戰鬥與輪迴轉生核心玩法真相。

## Requirements

### Requirement: 遊戲初始化流程 (Game Initialization)
系統必須 (MUST) 引導玩家完成首次入世或輪迴後的新一世角色建立，而不是只支援單次新手開局。

#### Scenario: 首次入世
- **WHEN** 玩家第一次進入遊戲且沒有 active current run
- **THEN** 顯示序幕、姓名 / 性別輸入與靈根覺醒流程
- **AND** 建立第一世角色的 current run 狀態

#### Scenario: 輪迴後投胎
- **WHEN** 玩家在輪迴大殿確認新的本世配置
- **THEN** 系統必須以選定的靈根、魂印與遺珍配置建立新的 current run
- **AND** 先前本世的地圖、背包、任務與戰鬥狀態必須重置為新一世初始值
- **AND** 靈魂進度必須保留並扣除已花費的功德

### Requirement: 修煉系統 (Cultivation System)
系統必須 (MUST) 允許角色透過時間流逝、手動引氣與突破來累積修為並晉升境界。

#### Scenario: 經驗值獲取公式
- **WHEN** 遊戲 Tick 觸發
- **THEN** 系統必須依靈根、根骨、聚靈等因素計算被動修煉收益
- **AND** 閉關與手動引氣必須套用對應的額外修煉倍率或冷卻限制

#### Scenario: 境界突破
- **WHEN** 修為已滿且玩家觸發突破
- **THEN** 系統必須根據大境界配置、悟性、福緣與道具效果執行成功率檢定
- **AND** 若失敗，必須依小境界 / 大境界規則扣除修為或承受更高代價

### Requirement: 背包與物品 (Inventory & Items)
系統必須 (MUST) 管理物品、裝備、技能書與突破素材，並讓它們影響角色成長或輪迴繼承。

#### Scenario: 物品類型定義
- **WHEN** 系統處理物品資料
- **THEN** 必須支援裝備、丹藥、材料、技能書、突破素材與其對應效果

#### Scenario: 輪迴候選遺珍
- **WHEN** 玩家本世結束
- **THEN** 系統必須從背包中辨識可作為遺珍的裝備實例與技能書
- **AND** 不得把一般材料或無效物件錯誤加入輪迴遺珍候選

### Requirement: 冒險與地圖內戰鬥 (Adventure & In-World Combat)
系統必須 (MUST) 提供網格地圖探索與地圖內時間軸戰鬥，而不是切換成舊式獨立回合制 modal。

#### Scenario: 地圖機制
- **WHEN** 玩家進入地圖
- **THEN** 系統必須根據 `MAPS` 資料生成地圖、傳送點、怪物與 Boss
- **AND** 地圖資料必須承接高境界內容密度、普通怪、精英怪與 Boss 配置

#### Scenario: 地圖內接戰
- **WHEN** 玩家或怪物在接戰範圍內發動普攻、技能或怪物特招
- **THEN** 戰鬥必須直接在 `Adventure` 場景內依 `attackRange / castRange / cooldownSeconds / castTimeMs / projectileSpeed / areaShape` 等資料解析
- **AND** 世界戰鬥、時間軸驗證與 replay 必須共用同一套 battle resolver 與 reward 流程

#### Scenario: 即時戰鬥怪物分工與前饋
- **WHEN** 玩家在地圖內與近戰、遠程、法術或 Boss 敵人接戰
- **THEN** 系統必須以不同站位、追擊、風箏、蓄力、危險區或投射物節奏表現怪物 archetype 差異
- **AND** 狀態、控制命中 / 免疫與危險區前饋必須沿用 battle core 語意，不得分裂為另一套規則

### Requirement: 輪迴轉生與靈魂進度 (Reincarnation & Soul Progression)
系統必須 (MUST) 在角色結束本世時，把本世成果轉換為可跨周目累積的靈魂進度。

#### Scenario: 生涯結算轉換為功德
- **WHEN** 玩家本世結束
- **THEN** 系統必須根據本世最高大境界與享年計算功德
- **AND** 更新 Lifetime Stats，至少包含最高境界、最高年歲、死亡次數與轉生次數

#### Scenario: 輪迴大殿配置下一世
- **WHEN** 玩家進入輪迴大殿
- **THEN** 系統必須顯示可用功德、已解鎖魂印、可帶入的遺珍與本世結算摘要
- **AND** 玩家只能在合法的功德預算與遺珍限額內建立下一世配置

#### Scenario: 靈魂進度跨周目保留
- **WHEN** 完成轉生並開始新一世
- **THEN** 靈魂進度必須保留
- **AND** current run 相關資料必須重建
- **AND** 不得讓上一世的 current run 狀態殘留到新一世
