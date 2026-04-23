## ADDED Requirements
### Requirement: 退場技能正式退出玩家成長主線
系統必須 (MUST) 讓 `transition / legacy` 技能退出正式玩家成長主線，只保留 formal core 技能作為常規學習與顯示對象。

#### Scenario: 玩家可見技能與秘卷視圖只保留 formal core
- **WHEN** 系統建立玩家可見的技能、秘卷、獎勵或圖鑑視圖
- **THEN** `transition / legacy` 技能不得作為正式項目顯示給玩家
- **AND** 玩家可見資料必須只保留 formal core 技能或其正式秘卷

#### Scenario: 舊技能引用會映射到正式核心技能
- **WHEN** 系統遇到舊 skill id、舊秘卷 item id 或其他 retired skill 引用
- **THEN** 必須依 `replacementSkillId` 映射到正式 formal core 技能
- **AND** 不得把 retired skill 重新放回正式技能池或正式技能書來源

#### Scenario: 多個 retired skill 映射到同一 formal core 後不重複保留
- **WHEN** 角色已學技能或舊引用經過 migration 後映射到相同的 formal core skill id
- **THEN** 系統必須只保留一份 formal core skill id
- **AND** 角色技能列表不可因 retired alias 遷移產生重複項
