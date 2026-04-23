## ADDED Requirements
### Requirement: 事件內容庫覆蓋率
系統必須 (MUST) 讓正式 encounter pool 在中後期境界段維持可追蹤的內容覆蓋率，避免某些境界或路線只剩少量一次性事件。

#### Scenario: 中後期境界保有最低事件覆蓋
- **WHEN** 系統載入 encounter pool
- **THEN** `元嬰 / 化神 / 煉虛 / 合體 / 大乘 / 渡劫` 等主要中後期階段必須有可被 regression 驗證的事件覆蓋
- **AND** 不得讓任一主要階段只依賴單一 one-time 事件支撐

#### Scenario: 路線事件保有辨識度
- **WHEN** 玩家以不同職業、宗門或世界路線觸發 encounter
- **THEN** 事件必須提供可辨識的 `routeLabel`、`categoryLabel`、cue tag、材料來源或 reward 差異
- **AND** 不得把所有 route-specific event 退化成同模板純數值收益

