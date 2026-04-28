## ADDED Requirements

### Requirement: 戰力估算提供可比較的威脅摘要
系統必須 (MUST) 從既有角色戰鬥屬性與妖獸 catalog 推導戰力數值，協助玩家比較自身與妖獸威脅，但不得把戰力取代正式戰鬥解析公式。

#### Scenario: 角色戰力由既有戰鬥屬性推導
- **WHEN** 系統需要顯示玩家戰力
- **THEN** 戰力必須由 `calculatePlayerStats` 推導出的 HP、MP、攻擊、防禦、速度、暴擊、閃避等屬性計算
- **AND** 裝備、靈根、職業與已學技能造成的屬性變化必須反映在戰力上
- **AND** 不得新增新的 persisted 戰力欄位作為資料真相

#### Scenario: 妖獸戰力保留 rank 與特招差異
- **WHEN** 系統需要顯示妖獸戰力
- **THEN** 戰力必須考慮妖獸 HP、攻擊、防禦、境界、小境界、rank 與特殊攻擊
- **AND** 同等基礎屬性下 Boss 戰力必須高於 Elite，Elite 必須高於 Common
- **AND** 具有特殊攻擊的妖獸不得和無特殊攻擊的同等妖獸顯示相同威脅摘要
