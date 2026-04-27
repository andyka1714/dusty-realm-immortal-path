# Design: 物品經濟與戰鬥補給閉環

## Context

`CONSUMABLE_ITEMS` 已有 `qi_pill / heal_pill / longevity_pill / breakthrough items`，`ShopPanel` 與 `Inventory` 已能顯示 effect 文案，但 `general_store_mortal.items` 仍為空，`characterSlice.consumeItem` 尚未處理 `heal_hp / heal_mp / full_restore`。同時目前即時戰鬥的 HP 快照主要位於 `Adventure.tsx` 的 local state，不能直接假設 CharacterState 已有持久化 HP/MP。

## Goals

- 讓早期商店具備可購買的基礎補給。
- 讓恢復類 consumable 的效果在正式 UI 中可見、可測。
- 明確切開「永久角色養成」與「當前戰鬥 / 探索補給」的責任。
- 不在第一版引入藥毒、耐藥性、cooldown 或 persisted combat resource schema。

## Non-Goals

- 不新增複雜拍賣行、NPC 經濟、價格浮動或全局市場。
- 不重做裝備掉落品質系統。
- 不把 `Adventure` 的 local battle HP 直接搬進 persisted CharacterState，除非實作前另開 migration 設計。

## Proposed Model

### Item Sources

- `general_store_mortal`：販售 `qi_pill / heal_pill` 與少量低階突破前補給。
- 宗門商店：可依職業販售同階基礎裝備與入門補給，不直接販售高階 Boss / inheritance 技能書。
- 掉落：低階 common / elite 可少量掉落恢復類丹藥，高階補給應更多來自 Workshop 或 route-specific source。

### Effect Semantics

- `gain_exp / lifespan / learn_skill`：仍由 `characterSlice.consumeItem` 處理。
- `heal_hp / heal_mp / full_restore`：第一版應透過可測的補給 bridge 套用到目前正式 UI 能表示的戰鬥 / 探索資源。
- 若目前正式 runtime 只有 `worldPlayerHp`，則第一版先支援 `heal_hp` 與 `full_restore` 對 HP 的可見效果；`heal_mp` 可先顯示為未支援或規劃為未來 MP resource，但不得默默消耗道具卻沒有作用。
- 消耗品只有在至少一個 effect 被成功套用時才應扣除數量 / 增加使用次數。

### UI

- Shop card 必須顯示補給品 effect 與價格。
- Inventory 使用按鈕必須根據目前上下文顯示可用 / 不可用原因。
- 若玩家在沒有受傷或沒有對應資源時使用恢復品，介面應阻擋或顯示原因，不應消耗。

## Testing

- `data/shops.test.ts`：凡人雜貨店包含基礎補給，且 item id 均存在於 item catalog。
- `store/slices/characterSlice.test.ts`：無效 / unsupported effect 不增加 consumption；已有支援效果才增加 usage。
- `pages/Inventory.*.test.tsx`：恢復品顯示正確 effect，不能使用時顯示原因或 disabled。
- `pages/Adventure.*.test.tsx` 或 e2e：受傷後使用補給，HP bar / snapshot 可見回復。

## Release Notes

- Base spec update: 完成後更新 `game-mechanics` 的物品經濟要求與 `client-interface` 的補給可讀性要求。
- Validation: `openspec validate update-item-economy-combat-supplies --strict`、targeted tests、必要 e2e smoke、`npm run typecheck`、`npm run build`、`git diff --check`。
