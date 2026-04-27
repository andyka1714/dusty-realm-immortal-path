## MODIFIED Requirements

### Requirement: 事件鏈與世界記憶持久化
系統必須 (MUST) 讓 encounter chain 與 world memory 使用既有持久化面，避免後續內容因重整或輪迴遺失可讀結果。

#### Scenario: world memory tags 可保存
- **WHEN** encounter choice 產生 world memory tags
- **THEN** 系統必須保存於既有 soul world memory
- **AND** 重新載入後仍可供 selector、Workshop source 或輪迴規劃讀取

#### Scenario: v3 aftermath 不新增 persisted state
- **WHEN** encounter aftermath v3 只新增 catalog event、selector gate、presentation cue 或 choice reward
- **THEN** 系統必須沿用既有 `soul.worldMemoryTags` 與 `resolvedEventIds`
- **AND** 不需要新增 migration 或 hydration sanitize
