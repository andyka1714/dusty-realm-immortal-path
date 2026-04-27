## ADDED Requirements

### Requirement: 終盤 v4 循環收束
系統必須 (MUST) 讓 `仙帝` 端 route-specific 內容、Workshop sink 與輪迴 route memory 形成可追蹤的終盤循環，而不是讓終盤只停在各自分散的事件、材料與重開入口。

#### Scenario: 三宗終盤 aftermath 產生 v4 記憶
- **WHEN** 玩家到達 `仙帝` 且已完成對應三宗 v3 world chapter 或終盤 route event
- **THEN** encounter catalog 必須提供對應 route 的 v4 aftermath 或 convergence event
- **AND** 該事件必須輸出可被後續 Workshop、輪迴或 source tracing 讀取的 `worldMemoryTags`
- **AND** 不得新增另一套 persisted endgame flag

#### Scenario: 終盤 Workshop sink 承接 route material
- **WHEN** 玩家取得 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 等 route-specific material
- **THEN** Workshop 必須提供終盤 recipe 或等效 sink，把 route material 消耗接回可追蹤的 high-tier 產出
- **AND** recipe 必須保留最低境界、route tags、sourceHint 與材料需求
- **AND** 不得跳過 route-specific material cost

#### Scenario: 輪迴 reward 讀取 v4 endgame memory
- **WHEN** 玩家在本世完成 v4 endgame memory
- **THEN** 輪迴 planner 必須能用既有 `soul.worldMemoryTags` 解鎖或強化下一世 route reward
- **AND** reward 必須顯示 build identity、route source 與預期收益
- **AND** 不得為相同記憶新增第二套 unlock state
