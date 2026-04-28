## ADDED Requirements

### Requirement: 終盤路線 v5 提示可讀性
介面必須 (MUST) 讓玩家在 pending encounter、Workshop、地圖 NPC、圖鑑與輪迴大殿中讀懂 v5 route aftermath、終盤材料用途與下一世 build hook。

#### Scenario: v5 pending encounter 顯示 route cue
- **WHEN** v5 aftermath encounter 進入 pending panel
- **THEN** panel 必須顯示 routeLabel、categoryLabel、chainLabel、memoryCue 與 choice cue tags
- **AND** choice cue 必須能分辨穩定收益、材料來源或高風險收益

#### Scenario: v5 Workshop recipe 顯示 source trace
- **WHEN** 玩家查看 v5 endgame follow-up recipe
- **THEN** recipe card 必須顯示人讀 sourceHint、machine-readable `sect:*:endgame-loop-v4` route tag、材料需求與產出

#### Scenario: v5 輪迴魂印顯示 build hook
- **WHEN** 玩家查看 v5 soul seal
- **THEN** available seal 必須顯示 route memory、identity cue、預期收益與 heirloom hint
- **AND** locked seal 必須顯示缺少哪個 `sect:*:endgame-loop-v4`
