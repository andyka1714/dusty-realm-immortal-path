## ADDED Requirements
### Requirement: Workshop recipe 與專精深化
系統必須 (MUST) 讓 Workshop 在既有高階 recipe 與熟練度基礎上，提供更多中高階 / 終盤 recipe 與可追蹤的專精效果，而不是讓 `specializationByDiscipline` 只停留在存檔欄位。

#### Scenario: 中高階 recipe 擴量
- **WHEN** 玩家進入中後期或終盤並取得 route-specific materials
- **THEN** Workshop 必須提供多個可追蹤來源、境界需求與 route tags 的高階丹方或器方
- **AND** 新 recipe 不得只消耗通用低階材料

#### Scenario: 專精效果影響 craft
- **WHEN** 玩家設定 `alchemy` 或 `smithing` 專精後施作受影響 recipe
- **THEN** craft action 必須套用對應專精效果，例如成本、輸出、品質提示或 mastery 節奏
- **AND** 不得繞過高階 recipe 的核心 route-specific material sink

#### Scenario: 專精與熟練度可 regression
- **WHEN** 後續調整 Workshop recipe 或 specialization effect
- **THEN** tests 必須能驗證 craft outcome、material cost、mastery 變化與 route-specific gate
- **AND** 不得在沒有測試訊號的情況下讓高境界百業失去材料壓力
