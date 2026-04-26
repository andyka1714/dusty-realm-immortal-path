## MODIFIED Requirements

### Requirement: 中後期 encounter 內容密度
系統必須 (MUST) 讓正式 encounter pool 在中後期與終盤境界段維持可追蹤的內容覆蓋率，避免某些境界或路線只剩少量一次性事件。

#### Scenario: 高境界 coverage floor 包含仙人與仙帝
- **WHEN** 系統載入 `化神 -> 仙帝` encounter pool
- **THEN** 每個高境界必須保有最低事件量與可重複事件量
- **AND** `仙人 / 仙帝` 不得被排除在 coverage regression 之外

#### Scenario: 終盤 route-specific event 可重複出現
- **WHEN** 玩家到達 `仙帝` 且已完成對應宗門後段路線
- **THEN** encounter selector 必須能提供對應職業 / 宗門的 route-specific 終盤事件
- **AND** 該事件必須不是 `once_per_run`，避免終盤內容密度只靠一次性 milestone

#### Scenario: 既有高境界事件保留可讀 cue
- **WHEN** 高境界通用 encounter 進入 pending flow
- **THEN** 事件必須提供 `categoryLabel / routeLabel` 與每個 choice 的 cue tags
- **AND** 玩家不得只能從長描述猜測成本、收益、材料或風險

## ADDED Requirements

### Requirement: Encounter v3 不改 persisted state
系統必須 (MUST) 在擴張 encounter 內容密度時維持現有存檔 shape，不因新增事件內容而要求 migration。

#### Scenario: 新事件只使用既有 event metadata
- **WHEN** 新增 v3 encounter event
- **THEN** 事件必須使用現有 `selector / presentation / choices / chain` metadata
- **AND** 不得新增 `EncounterState`、`PendingEncounter` 或 LocalStorage envelope 欄位
