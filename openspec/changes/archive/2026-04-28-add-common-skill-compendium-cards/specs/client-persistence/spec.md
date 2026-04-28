## ADDED Requirements

### Requirement: skill/manual catalog 更新不得破壞既有存檔
LocalStorage persistence 必須 (MUST) 在新增正式通用功法與秘卷 catalog id 後保持既有存檔可載入，並允許通用主動功法作為合法裝備功法。

#### Scenario: 舊存檔載入後遇到通用功法
- **WHEN** 舊存檔沒有新通用功法 id
- **THEN** 系統不得要求 schema migration
- **AND** 若日後存檔包含已學通用主動功法與合法 `equippedActiveSkillId`，hydrate sanitize 必須保留它
