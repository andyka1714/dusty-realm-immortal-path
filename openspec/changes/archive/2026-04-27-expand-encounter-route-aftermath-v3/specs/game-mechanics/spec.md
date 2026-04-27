## MODIFIED Requirements

### Requirement: 事件內容庫覆蓋率
系統必須 (MUST) 讓正式 encounter pool 在中後期與終盤境界段維持可追蹤的內容覆蓋率，避免某些境界或路線只剩少量一次性事件。

#### Scenario: 中後期境界保有最低事件覆蓋
- **WHEN** 系統載入 encounter pool
- **THEN** `元嬰 / 化神 / 煉虛 / 合體 / 大乘 / 渡劫 / 仙人 / 仙帝` 等主要中後期與終盤階段必須有可被 regression 驗證的事件覆蓋
- **AND** 不得讓任一主要階段只依賴單一 one-time 事件支撐

#### Scenario: 路線事件保有辨識度
- **WHEN** 玩家以不同職業、宗門或世界路線觸發 encounter
- **THEN** 事件必須提供可辨識的 `routeLabel`、`categoryLabel`、cue tag、材料來源或 reward 差異
- **AND** 不得把所有 route-specific event 退化成同模板純數值收益

#### Scenario: v3 route aftermath 延續世界章節記憶
- **WHEN** 玩家完成三宗 v3 world chapter 並取得 `sect:*:world-chapter-03`
- **THEN** encounter selector 必須提供對應路線的 repeatable aftermath event
- **AND** aftermath event 必須讀取對應 world memory tag，缺少記憶時不得出現
- **AND** aftermath event 不得是 `once_per_run`

### Requirement: 事件鏈與世界記憶
系統必須 (MUST) 讓正式 encounter 能記錄可被後續內容讀取的事件鏈與世界記憶，而不是只做單次 reward 結算。

#### Scenario: 事件完成後寫入 world memory
- **WHEN** encounter chain 定義 world memory tags
- **THEN** 系統必須保存該結果供後續 selector、宗門章節或 Workshop source 判斷
- **AND** 後續事件不得改用第二套記憶欄位

#### Scenario: Aftermath 讀取既有 world memory
- **WHEN** v3 aftermath encounter 需要判斷玩家是否完成對應 route chapter
- **THEN** 系統必須讀取既有 `soul.worldMemoryTags`
- **AND** 不得新增重複的 persisted aftermath unlock state
