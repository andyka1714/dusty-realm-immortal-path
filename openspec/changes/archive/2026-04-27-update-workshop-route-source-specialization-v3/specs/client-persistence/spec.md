## MODIFIED Requirements

### Requirement: Workshop v2 state 相容 gate
系統必須 (MUST) 在 Workshop v2 / v3 變更中明確判斷是否需要新增 persisted state，若新增則必須提供 migration。

#### Scenario: Recipe 與專精定義擴充不新增 state
- **WHEN** Workshop v2 或 v3 只擴 recipe、tree definition、mastery milestone、source cue、route memory cue 或 UI cue
- **THEN** 舊存檔必須能沿用現有 Workshop state 正常載入
- **AND** tasks / tracking docs 必須明確記錄不需要 migration 的理由

#### Scenario: 新增 persisted Workshop state 必須 migration
- **WHEN** Workshop v2 或 v3 新增 recipe provenance、craft queue、mastery history 或 route unlock 等 persisted field
- **THEN** change 必須同步提供 migration、hydration sanitize 與 regression coverage

#### Scenario: v3 route memory 只讀既有 soul world memory
- **WHEN** Workshop v3 需要判斷三宗 v3 route chapter 是否完成
- **THEN** 系統必須優先讀取既有 `soul.worldMemoryTags`
- **AND** 不得為相同事實新增重複的 Workshop persisted field
