## MODIFIED Requirements

### Requirement: 補給品購買與使用可讀性
介面必須 (MUST) 讓玩家在商店、背包與戰鬥快捷補給中看懂補給品的價格、效果、可用狀態、資源變化與不可用原因。

#### Scenario: 商店顯示補給品效果
- **WHEN** 玩家在 ShopPanel 查看消耗品或補給品
- **THEN** 介面必須顯示價格、庫存限制與主要 effect
- **AND** `heal_hp / heal_mp / full_restore / breakthrough_chance / gain_exp / lifespan / learn_skill` 必須顯示一致且可讀的文案
- **AND** 不得只顯示名稱讓玩家猜測用途

#### Scenario: 背包使用補給前顯示可用狀態
- **WHEN** 玩家在 Inventory 選中恢復品或補給品
- **THEN** 介面必須顯示該道具目前是否可用
- **AND** 若不可用，必須顯示原因，例如未受傷、沒有可恢復資源、境界不符或效果尚未支援
- **AND** 沒有 runtime recovery handler 時，恢復品不得呈現為可成功服用

#### Scenario: 使用後可見資源變化
- **WHEN** 玩家成功使用補給品
- **THEN** 介面必須讓玩家看見對應資源或狀態變化
- **AND** 戰鬥快捷補給與背包 recovery handler 必須讓資源變化和道具扣除保持同一個成功條件
- **AND** 不得只扣除道具而沒有任何可見回饋
