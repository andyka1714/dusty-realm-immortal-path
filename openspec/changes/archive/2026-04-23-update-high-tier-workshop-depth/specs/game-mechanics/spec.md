## ADDED Requirements
### Requirement: 高階洞府百業深度循環
系統必須 (MUST) 讓 `煉丹 / 煉器` 從第一批低階 recipe 擴充為可支撐 `化神 -> 仙帝` 的高階百業循環，並保留可追蹤的材料 sink、品質分化與專精進度。

#### Scenario: 高階 recipe 承接中後期材料與境界需求
- **WHEN** 玩家達到中後期境界並取得宗門、世界、encounter 或高境界掉落材料
- **THEN** 系統必須提供對應的高階丹方或器方
- **AND** recipe 必須標示最低境界、材料需求、route tags 或材料來源語意
- **AND** 不得讓高境界丹藥 / 裝備支撐只存在於 audit table 而缺少實際 recipe 入口

#### Scenario: 百業產出具有品質或專精辨識
- **WHEN** 玩家完成高階煉丹或煉器 recipe
- **THEN** 系統必須產出可辨識的品質、裝備實例、丹藥或專精進度
- **AND** 應記錄對應 discipline 的 craft mastery 或 specialization 進度
- **AND** 不得讓所有 recipe 都退化成固定低階物品交換

#### Scenario: 高境界 loop support 指向真實高階百業來源
- **WHEN** 系統驗證 `化神 -> 仙帝` 的丹藥 / 洞府支撐乘區
- **THEN** regression 必須能追蹤到真實 high-tier workshop recipe、物品或材料來源
- **AND** 不得只以 placeholder feature id 代表完整後期百業循環
