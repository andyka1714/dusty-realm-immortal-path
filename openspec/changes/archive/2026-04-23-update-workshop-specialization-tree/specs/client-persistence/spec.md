## ADDED Requirements
### Requirement: Workshop 專精樹存檔遷移
系統必須 (MUST) 將舊版 Workshop 專精欄位安全遷移到專精樹 state，不得破壞既有 current run。

#### Scenario: 舊存檔缺少專精樹 state
- **WHEN** 載入只有扁平 `specializationByDiscipline` 或缺少專精欄位的舊存檔
- **THEN** migration 必須補上合法的專精樹預設 state
- **AND** 若舊存檔已有可相容的 active specialization，必須盡可能保留其效果或映射到對應節點

