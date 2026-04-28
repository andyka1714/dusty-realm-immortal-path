## ADDED Requirements

### Requirement: 終盤路線 v5 閉環
系統必須 (MUST) 讓 `sect:*:endgame-loop-v4` 不只解鎖單次魂印或單一 Workshop sink，而能延伸成可重複事件、職業向終盤 recipe、地圖本地線索與下一世 build cue。

#### Scenario: v5 aftermath 讀取 v4 終盤記憶
- **WHEN** 玩家已取得 `sect:sword:endgame-loop-v4`、`sect:beast:endgame-loop-v4` 或 `sect:mystic:endgame-loop-v4`
- **THEN** encounter catalog 必須提供對應宗門的 repeatable v5 aftermath event
- **AND** 缺少對應 endgame memory 時不得出現該 event
- **AND** v5 aftermath 不得使用 `once_per_run`

#### Scenario: v5 Workshop follow-up 承接終盤材料
- **WHEN** 玩家查看終盤 high-tier Workshop recipe
- **THEN** 每條 v5 職業向 recipe 必須消耗 `emperor_crown` 與對應 route material
- **AND** 必須保留 `sect:*:endgame-loop-v4` route tag 與 sourceHint

#### Scenario: v5 map local clue 指向終盤閉環
- **WHEN** 玩家抵達 `歸墟裂界`
- **THEN** 地圖本地 NPC / quest 必須說明 v5 route rumor、終盤 Workshop clue 與下一世 build hook
- **AND** 不得新增第二套地圖事件 runtime

#### Scenario: v5 content audit 防資料漂移
- **WHEN** 新增 v5 encounter、recipe、NPC、quest 或 soul seal catalog
- **THEN** authoring audit 必須能檢查核心 id、item reference、quest/NPC reference 與 route memory tag coverage
