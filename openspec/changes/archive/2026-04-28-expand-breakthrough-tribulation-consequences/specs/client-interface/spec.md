## ADDED Requirements

### Requirement: Dashboard 必須顯示目前災劫後果
介面必須 (MUST) 在道途 / 突破區顯示目前突破 consequence、恢復方式與對下次突破的影響。

#### Scenario: 玩家有 active consequence
- **WHEN** 玩家打開道途面板且角色有 active breakthrough consequence
- **THEN** 介面必須顯示 consequence 名稱、嚴重度、剩餘狀態與恢復提示
- **AND** 突破 preview 必須顯示此 consequence 對風險的影響
