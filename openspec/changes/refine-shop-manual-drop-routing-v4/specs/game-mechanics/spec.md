## MODIFIED Requirements

### Requirement: 技能書來源層級與學習限制
系統必須 (MUST) 為正式 `core` 技能書提供明確的 acquisition tier、具體取得 route、圖鑑可讀來源與學習限制。

#### Scenario: 正式技能書帶有 acquisition tier 與來源 metadata
- **WHEN** 系統根據正式 `core` 技能生成技能書
- **THEN** 每本技能書都必須帶有 acquisition tier
- **AND** 每本技能書都必須帶有至少一個正式來源類型
- **AND** 每本技能書都必須帶有職業 / 境界 / 前置技能限制 metadata

#### Scenario: 正式技能書可推導具體取得 route
- **WHEN** 系統建立正式 `core` 技能書 routing
- **THEN** 每本 formal core manual 都必須能推導至少一個具體 route，例如商店 id、敵人 id、宗門試煉或傳承殿
- **AND** route 不得指向 retired manual、missing item 或不存在的商店 / 敵人
- **AND** routing helper 必須從既有 `SHOPS`、`BESTIARY` 與 skill manual metadata 推導，不得另建手寫平行表

#### Scenario: 圖鑑可讀取技能書來源
- **WHEN** 圖鑑顯示正式 core skill 或其秘卷
- **THEN** 系統必須能從既有 skill manual metadata 推導商店、宗門試煉、精英掉落、Boss 掉落或傳承來源
- **AND** 若商店或敵人資料能定位具體名稱，圖鑑必須顯示具體來源名稱
- **AND** 不得為圖鑑另建一套會和正式 skill manual registry 脫節的來源資料

#### Scenario: 宗門試煉與正式技能池保持同步
- **WHEN** 宗門試煉配置入門技能書獎勵
- **THEN** 獎勵必須由正式技能池導出對應職業的練氣主動核心技能書
- **AND** 不可依賴手寫硬編碼 skill id 維護

#### Scenario: 玩家可先購得未達境界的技能書
- **WHEN** 玩家在商店查看技能書
- **THEN** 系統必須顯示該商店正式投放的技能書，即使玩家尚未達到參悟境界
- **AND** 玩家仍只能在符合職業、境界與前置技能條件後參悟該技能書

#### Scenario: 退場技能不再混入正式技能書取得池
- **WHEN** 系統建立正式技能書來源與學習資料
- **THEN** `transition / legacy` 技能不得出現在 shop、elite、boss 或 inheritance formal source pool
- **AND** 若舊 manual id 仍存在於存檔或舊資料，必須先映射到正式 replacement manual
