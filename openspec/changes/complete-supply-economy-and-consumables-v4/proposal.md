# Change: 完成補給經濟與 consumable runtime v4

## Why

早期商店與補給品已具備基本資料，但恢復類 consumable 的可用狀態、runtime 套用與扣道具路徑仍需要更嚴格的防線，避免玩家在背包或戰鬥中看到可服用卻沒有實際資源變化。

## What Changes

- 擴大商店資料 audit，確保所有正式商店都有商品，且商品 id 都存在於 item catalog。
- 補強 `heal_hp / heal_mp / full_restore` runtime helper regression，明確覆蓋 HP、MP、雙資源與缺資源阻擋。
- 調整 Inventory 使用恢復品流程：沒有 runtime recovery handler 時不得扣道具；有 handler 時由 handler 套用資源變化與扣道具。
- 統一 Shop / Inventory 的 consumable effect 文案，讓 `breakthrough_chance`、恢復品與秘卷效果顯示一致。
- 更新 Playwright / unit smoke，確保背包、商店與戰鬥快捷補給維持可讀且不靜默消耗。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `data/shops.ts`, `data/shops.test.ts`, `utils/consumableEffects.ts`, `pages/Inventory.tsx`, `pages/Adventure.tsx`, `components/adventure/ShopPanel.tsx`, supply-related tests
- Persistence: 不新增 LocalStorage schema、hydrate shape 或 persisted catalog；不需要 migration。
