## ADDED Requirements

### Requirement: 宗門與世界後段內容延伸
系統必須 (MUST) 讓宗門與世界內容在 `金丹` 後繼續承接玩家路線，至少延伸到 `元嬰` 里程碑，而不是在中期任務後斷線。

#### Scenario: 三宗後段任務承接金丹真傳
- **WHEN** 玩家完成任一宗門的 `金丹` 真傳任務並抵達 `元嬰`
- **THEN** 系統必須提供該宗門的後段任務
- **AND** 後段任務必須要求對應 route 的 `元嬰` boss 或世界內容
- **AND** 不得讓三宗後段全部退化成同一個通用任務

#### Scenario: 後段任務保留化神接續點
- **WHEN** 玩家完成 `元嬰` 後段宗門任務
- **THEN** 任務文本、文件或後續掛點必須指向 `化神` 三界戰場 convergence
- **AND** 不得讓宗門後段在 `元嬰` boss 結束後再次失去世界承接

#### Scenario: 後段世界 encounter 依路線解鎖
- **WHEN** 玩家完成宗門後段任務或達到對應後段條件
- **THEN** encounter selector 必須能提供對應 profession / sect 的 route-specific world event
- **AND** 該事件必須具備可辨識的 route label、風險收益 cue 或材料回饋

#### Scenario: 後段內容維持既有資料模型
- **WHEN** 系統新增後段宗門與世界內容
- **THEN** 必須沿用現有 `Quest / NPC / Encounter` 結構
- **AND** 不得要求新的 persisted state migration 才能讀取舊存檔
