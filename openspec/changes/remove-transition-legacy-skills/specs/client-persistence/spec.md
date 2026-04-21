## ADDED Requirements
### Requirement: 舊存檔技能資料遷移
系統必須 (MUST) 在載入舊存檔時，把 `transition / legacy` 技能與秘卷引用遷移為 formal core 視角，再交給 Redux store 使用。

#### Scenario: 載入舊存檔時正規化角色技能
- **WHEN** 應用程式從 LocalStorage 載入舊存檔
- **THEN** `character.skills` 中的 retired skill id 必須在 hydrate 前映射為 formal core replacement
- **AND** hydrate 後的 `character.skills` 不得再保留 retired skill id

#### Scenario: 載入舊存檔時升級舊秘卷物品
- **WHEN** 舊存檔背包中仍包含 retired 技能秘卷
- **THEN** 系統必須把該 item 轉成對應的正式秘卷 item
- **AND** 若找不到有效的正式秘卷對應，該 retired item 不得以壞資料形式繼續進入 store

#### Scenario: 遷移流程必須可重複執行而不污染存檔
- **WHEN** 同一份已遷移過的存檔再次被載入
- **THEN** 遷移流程必須維持相同結果
- **AND** 不得重複插入技能、重複生成秘卷或把 formal core skill 再次改寫成其他 id
