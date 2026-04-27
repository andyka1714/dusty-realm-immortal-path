# Change: 建立物品經濟與戰鬥補給閉環

## Why

目前物品資料已包含消耗品、突破物、裝備、技能書與材料，但早期商店與補給流程仍不完整：凡人雜貨店沒有實際販售內容，回春丹等 `heal_hp / heal_mp / full_restore` 效果在角色 consume flow 中尚未落地，掉落與商店也缺少「補給品如何支撐探索 / 戰鬥」的明確規劃。這會讓物品系統看起來有資料，但缺少可玩的經濟閉環。

## What Changes

- 補凡人與早期宗門商店的基礎補給品，讓玩家能穩定取得低階丹藥與探索補給。
- 正式定義 `heal_hp / heal_mp / full_restore` 的作用範圍：支援可被正式 UI 使用的戰鬥 / 探索補給，不只存在於 item effect 文案。
- 補低階到中期的補給品 / 掉落 / 商店來源規劃，避免所有恢復品只靠單一道具。
- 補 Inventory / Shop / Adventure 或 GameShell 補給使用 regression，確認可購買、可顯示、可使用、效果可見。

## Impact

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/shops.ts`
  - `data/items/consumables.ts`
  - `data/items/index.ts`
  - `store/slices/characterSlice.ts`
  - `pages/Inventory.tsx`
  - `components/adventure/ShopPanel.tsx`
  - `pages/Adventure.tsx` 或補給使用所需的局部 bridge
  - `docs/04_Items/01_Overview.md`
  - `docs/04_Items/04_Consumables.md`
  - `docs/04_Items/05_DropSystem.md`
  - `docs/02_Gameplay/inventory.md`

## Persisted State / Migration

- Schema change? 預設 `no`
- Persisted surface: existing `current.character.itemConsumption`、inventory item stacks / instances；不新增 persisted field。
- Migration / hydration sanitize: not needed，除非實作時新增補給 cooldown、藥毒值、戰鬥中暫存補給欄位等 persisted state。若實作決定新增欄位，必須先更新本 proposal 與 tasks，再補 migration regression。
- Regression coverage: 需要 item consumption、shop availability、Inventory usable state 與 combat supply UI 的 targeted tests。
