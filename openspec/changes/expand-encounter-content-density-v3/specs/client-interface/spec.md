## MODIFIED Requirements

### Requirement: 事件內容提示延續既有可讀性
介面必須 (MUST) 讓新增 encounter 內容沿用現有 pending panel 的路線、類型、風險與收益提示，不得新增只能靠長文字猜測的事件。

#### Scenario: v3 終盤事件顯示路線與收益 cue
- **WHEN** `expand-encounter-content-density-v3` 新增的終盤 encounter 進入 pending panel
- **THEN** 介面必須顯示該事件的 category、route、profession 或 choice cue
- **AND** 玩家必須能在選擇前理解該事件偏向穩定收益、材料來源、宗門路線或高風險獎勵

#### Scenario: Mobile modal 與地圖畫面維持可用
- **WHEN** 玩家在 mobile viewport 開啟 pending encounter、GameShell panel 或 Adventure map
- **THEN** modal / panel 不得產生水平溢出或不可達內容
- **AND** Adventure 正式 canvas 不得退回全黑畫面
