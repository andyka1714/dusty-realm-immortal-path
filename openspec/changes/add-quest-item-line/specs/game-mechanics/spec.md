## ADDED Requirements

### Requirement: 任務物品必須和一般材料分離
系統必須 (MUST) 提供任務物品線，讓劇情道具與一般煉丹煉器材料分離。

#### Scenario: 任務需要提交劇情物品
- **WHEN** 任務要求提交信物、令牌、殘圖或玉簡
- **THEN** 該物品必須標示為任務用途
- **AND** 不得被一般 Workshop recipe 或商店回收流程誤消耗
