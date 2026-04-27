## MODIFIED Requirements

### Requirement: 背包與物品 (Inventory & Items)
系統必須 (MUST) 管理物品、裝備、技能書與突破素材，並讓它們影響角色成長、戰鬥補給或輪迴繼承。

#### Scenario: 物品類型定義
- **WHEN** 系統處理物品資料
- **THEN** 必須支援裝備、丹藥、材料、技能書、突破素材與其對應效果

#### Scenario: 輪迴候選遺珍
- **WHEN** 玩家本世結束
- **THEN** 系統必須從背包中辨識可作為遺珍的裝備實例與技能書
- **AND** 不得把一般材料或無效物件錯誤加入輪迴遺珍候選

#### Scenario: 基礎商店提供早期補給
- **WHEN** 玩家造訪凡人、早期宗門、宗門藏經閣或傳承商店
- **THEN** 商店必須提供可購買的基礎補給品、裝備、修為丹藥或正式秘卷
- **AND** 商店 item id 必須能在正式 item catalog 中找到
- **AND** 不得讓正式商店維持空列表

#### Scenario: 恢復類 consumable 具備正式效果
- **WHEN** 玩家使用帶有 `heal_hp`、`heal_mp` 或 `full_restore` effect 的 consumable
- **THEN** 系統必須只在對應資源可被正式 runtime 承接時套用效果並消耗道具
- **AND** 若目前 runtime 不支援該資源，必須阻擋或明確回報不可用原因
- **AND** `full_restore` 必須能在 HP 或 MP 任一可恢復資源未滿時套用，並不得要求不存在的資源
- **AND** 不得默默忽略恢復效果卻仍增加使用次數或扣除道具

#### Scenario: 補給來源與消耗品階層可追蹤
- **WHEN** 系統新增恢復品、修為丹或探索補給
- **THEN** 必須明確定義其主要來源為商店、掉落、Workshop 或 route-specific reward
- **AND** 中後期補給不得全部依賴單一低階道具支撐
