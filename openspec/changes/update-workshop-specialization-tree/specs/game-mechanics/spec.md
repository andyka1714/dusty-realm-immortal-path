## ADDED Requirements
### Requirement: Workshop 專精樹
系統必須 (MUST) 讓 `Alchemy / Smithing` 專精從單一扁平選項升級為可擴充的專精樹，並維持 recipe、材料 sink 與熟練度規則的一致性。

#### Scenario: 專精節點具有前置與互斥
- **WHEN** 玩家嘗試解鎖或切換 Workshop 專精節點
- **THEN** 系統必須檢查熟練度、境界、前置節點、材料或靈石成本
- **AND** 若節點與已選分支互斥，必須阻止或要求合法 reset

#### Scenario: 專精效果不繞過核心材料 sink
- **WHEN** 專精效果套用到高階 recipe
- **THEN** 系統可以調整靈石成本、熟練收益、品質或副產物
- **AND** 不得直接免除 recipe 的核心 route-specific 材料需求

