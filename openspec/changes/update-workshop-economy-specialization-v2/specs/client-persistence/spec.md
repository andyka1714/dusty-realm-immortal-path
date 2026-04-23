## ADDED Requirements
### Requirement: Workshop v2 state 相容 gate
系統必須 (MUST) 在 Workshop v2 變更中明確判斷是否需要新增 persisted state，若新增則必須提供 migration。

#### Scenario: 不新增 state 時維持舊存檔相容
- **WHEN** Workshop v2 只擴 recipe、tree definition、mastery milestone 或 UI cue
- **THEN** 舊存檔必須能沿用現有 Workshop state 正常載入
- **AND** 不得要求新 migration 才能使用既有 current run

#### Scenario: 新增 persisted state 時補 migration
- **WHEN** Workshop v2 新增 recipe provenance、craft queue 或 mastery history 等 persisted field
- **THEN** migration 必須為舊存檔補上合法預設值
- **AND** 必須有 regression 防止讀檔崩潰
