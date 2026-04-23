## ADDED Requirements

### Requirement: 事件與奇遇必須具備上下文條件與風險收益分化

系統必須 (MUST) 讓正式 encounter system 依玩家上下文挑選事件，並提供可辨識的選項風險與收益，而不是只做同境界共用的平鋪領獎事件。

#### Scenario: encounter selection 依上下文挑選事件

- **WHEN** 年歲流逝或正式事件流程觸發 encounter selection
- **THEN** 系統必須至少考慮 `majorRealm` 與其他已存在的玩家上下文條件來挑選合適事件
- **AND** 不得讓所有同境界玩家長期只輪到相同的通用事件池

#### Scenario: one-time event 不重複洗出

- **WHEN** 玩家已完成標記為 one-time 或不可重複的正式事件
- **THEN** 系統必須透過 encounter resolution 記錄避免同一事件重複洗出
- **AND** 若上下文仍有其他合法事件，selector 必須優先改派其他事件

#### Scenario: choice 具備正式風險收益差異

- **WHEN** 玩家面對正式 encounter choice
- **THEN** 不同選項必須提供可區分的成本、風險或收益方向
- **AND** encounter rewards 必須能承接 profession、sect、route-specific 或高境界 progression 的正式內容差異
