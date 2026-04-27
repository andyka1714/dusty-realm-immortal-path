## ADDED Requirements

### Requirement: 內容 authoring audit
系統必須 (MUST) 提供可被 regression 執行的內容 authoring audit，避免資料 catalog 擴量時產生靜態 reference 斷線。

#### Scenario: Catalog item reference 可被 audit
- **WHEN** 開發者新增 quest、encounter、shop、enemy drop 或 Workshop recipe
- **THEN** audit 必須能檢查所有 item id 是否存在於正式 `ITEMS` catalog
- **AND** 錯誤訊息必須能指出斷線來源

#### Scenario: NPC 與 quest reference 可被 audit
- **WHEN** 開發者新增 map NPC、quest giver、submit target 或 dialogue target
- **THEN** audit 必須能檢查 quest id 與 NPC id 是否存在於正式 catalog
- **AND** 不得讓 map-local hook 指向不存在的 quest 或 NPC

#### Scenario: Route material source 與 sink 可被 audit
- **WHEN** 開發者新增 route-specific material
- **THEN** audit 必須能檢查該材料至少具備正式 source、Workshop sink 與圖鑑 source tracing
- **AND** 不得只新增消耗或只新增來源而沒有另一端
