## ADDED Requirements

### Requirement: 物品經濟與戰鬥補給閉環

系統必須 (MUST) 讓基礎商店、消耗品與戰鬥 / 探索補給形成可玩的閉環，而不是只在 item catalog 中保留未落地的 effect 文案。

#### Scenario: 基礎商店提供早期補給

- **WHEN** 玩家造訪凡人或早期宗門商店
- **THEN** 商店必須提供可購買的基礎補給品或修為丹藥
- **AND** 商店 item id 必須能在正式 item catalog 中找到
- **AND** 不得讓早期一般商店維持空列表

#### Scenario: 恢復類 consumable 具備正式效果

- **WHEN** 玩家使用帶有 `heal_hp`、`heal_mp` 或 `full_restore` effect 的 consumable
- **THEN** 系統必須只在對應資源可被正式 runtime 承接時套用效果並消耗道具
- **AND** 若目前 runtime 不支援該資源，必須阻擋或明確回報不可用原因
- **AND** 不得默默忽略恢復效果卻仍增加使用次數或扣除道具

#### Scenario: 補給來源與消耗品階層可追蹤

- **WHEN** 系統新增恢復品、修為丹或探索補給
- **THEN** 必須明確定義其主要來源為商店、掉落、Workshop 或 route-specific reward
- **AND** 中後期補給不得全部依賴單一低階道具支撐
