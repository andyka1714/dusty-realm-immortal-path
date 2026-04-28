## ADDED Requirements

### Requirement: 通用主動功法必須可被任一職業裝備
系統必須 (MUST) 允許 `ProfessionType.None` 的正式主動功法被任一職業角色裝備與戰鬥選用，但不得取代職業功法的分類歸屬。

#### Scenario: 已轉職角色裝備通用主動功法
- **WHEN** 角色已轉職並已學會通用主動功法
- **THEN** 角色必須可以裝備該通用主動功法
- **AND** 戰鬥選招必須優先使用已裝備的通用主動功法

