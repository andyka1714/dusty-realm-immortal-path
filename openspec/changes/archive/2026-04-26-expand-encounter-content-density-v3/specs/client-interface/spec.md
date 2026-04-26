## MODIFIED Requirements

### Requirement: 事件選項必須讓玩家可讀地判斷風險與收益
系統必須 (MUST) 在 pending encounter 介面中，讓玩家在選擇前看懂事件類型、收益方向與代價差異，而不是只能閱讀一段抽象敘述。

#### Scenario: 面板顯示事件上下文
- **WHEN** `PendingEncounterPanel` 顯示正式 encounter
- **THEN** 介面必須呈現事件的類型、年份或其他關鍵上下文 cue
- **AND** 若事件屬於 profession、sect 或 route-specific pool，介面必須提供對應辨識資訊

#### Scenario: choice 顯示風險收益 cue
- **WHEN** 玩家檢視 encounter 的不同選項
- **THEN** 每個選項都必須提供足以判讀風險、成本或收益方向的 cue
- **AND** 不得讓玩家只能靠猜測理解哪個選項較穩健、較昂貴或較高風險

#### Scenario: v3 終盤事件顯示路線與收益 cue
- **WHEN** `expand-encounter-content-density-v3` 新增的終盤 encounter 進入 pending panel
- **THEN** 介面必須顯示該事件的 category、route、profession 或 choice cue
- **AND** 玩家必須能在選擇前理解該事件偏向穩定收益、材料來源、宗門路線或高風險獎勵

#### Scenario: Mobile modal 與地圖畫面維持可用
- **WHEN** 玩家在 mobile viewport 開啟 pending encounter、GameShell panel 或 Adventure map
- **THEN** modal / panel 不得產生水平溢出或不可達內容
- **AND** Adventure 正式 canvas 不得退回全黑畫面
