## ADDED Requirements
### Requirement: 技能書來源層級與學習限制
系統必須 (MUST) 為正式 `core` 技能書提供明確的 acquisition tier、來源對應與學習限制。

#### Scenario: 正式技能書帶有 acquisition tier 與來源 metadata
- **WHEN** 系統根據正式 `core` 技能生成技能書
- **THEN** 每本技能書都必須帶有 acquisition tier
- **AND** 每本技能書都必須帶有至少一個正式來源類型
- **AND** 每本技能書都必須帶有職業 / 境界 / 前置技能限制 metadata

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
