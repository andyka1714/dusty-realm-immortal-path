## MODIFIED Requirements

### Requirement: 技能書來源層級與學習限制
系統必須 (MUST) 為正式 `core` 技能書提供明確的 acquisition tier、來源對應、圖鑑可讀來源與學習限制。

#### Scenario: 正式技能書帶有 acquisition tier 與來源 metadata
- **WHEN** 系統根據正式 `core` 技能生成技能書
- **THEN** 每本技能書都必須帶有 acquisition tier
- **AND** 每本技能書都必須帶有至少一個正式來源類型
- **AND** 每本技能書都必須帶有職業 / 境界 / 前置技能限制 metadata

#### Scenario: 圖鑑可讀取技能書來源
- **WHEN** 圖鑑顯示正式 core skill 或其秘卷
- **THEN** 系統必須能從既有 skill manual metadata 推導商店、宗門試煉、精英掉落、Boss 掉落或傳承來源
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
- **THEN** `transition / legacy` 技能不得重新出現在正式技能書來源 registry
- **AND** 舊技能若仍被引用，必須映射到正式核心替代技能

### Requirement: 物品與材料來源可追蹤
系統必須 (MUST) 讓正式物品、材料與秘卷可由既有 catalog、掉落、商店、Workshop recipe 或 encounter reward 推導來源與用途。

#### Scenario: Route material 來源與 sink 可回溯
- **WHEN** 圖鑑顯示 `凌霄劍星鋼`、`萬獸血骨殘材` 或 `縹緲星魂蓮`
- **THEN** 系統必須能顯示對應宗門、world memory tag、encounter source cue 與 high-tier Workshop sink
- **AND** 不得讓 route-specific material 只顯示「無紀錄」或只顯示抽象描述

#### Scenario: 來源追蹤沿用既有資料
- **WHEN** 系統建立圖鑑 source tracing view
- **THEN** 來源必須從 `Enemy.drops`、`SHOPS`、`WORKSHOP_RECIPES`、encounter rewards 或 skill manual metadata 推導
- **AND** 不得新增另一套需要手動同步的 persisted source registry
