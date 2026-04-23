## ADDED Requirements
### Requirement: 事件鏈與世界記憶
系統必須 (MUST) 讓正式 encounter 能記錄可被後續內容讀取的事件鏈與世界記憶，而不是只做單次 reward 結算。

#### Scenario: 事件結果形成後續記憶
- **WHEN** 玩家解決帶有 chain 或 memory tag 的 encounter
- **THEN** 系統必須保存該結果供後續 selector、宗門章節或 Workshop source 判斷
- **AND** 不得只依賴不可追蹤的純文字日誌

#### Scenario: 事件鏈依前置結果展開
- **WHEN** 後續 encounter 需要前置 chain step 或 world memory
- **THEN** selector 必須檢查對應條件後才允許該事件出現
- **AND** 若條件不成立，必須改派其他合法事件或不生成 pending event
