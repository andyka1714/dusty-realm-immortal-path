# Change: 建立戰鬥丹藥與晉階丹系統

## Why
現有丹藥資料已有修為丹、回血丹與部分突破輔助丹，但缺少回魔丹、戰鬥恢復共用冷卻、自動服丹設定，以及「大境界突破必備丹由對應 Boss 掉落」的完整資料與驗證。這會讓地圖內即時戰鬥、背包補給、煉丹、商店與突破流程彼此脫節。

## What Changes
- 補齊丹藥分類：修為丹、回血丹、回靈丹、歸元丹、破境輔助丹、戰鬥增益丹、壽元 / 特殊丹。
- `heal_hp`、`heal_mp` 丹藥共用 5 秒戰鬥補給冷卻；本階段不發布 `full_restore` 丹藥。
- 冒險戰鬥提供自動服丹設定：氣血與靈力各自可開關並設定觸發閾值。
- 補齊回靈丹資料、商店與煉丹配方，讓早期到中期補給來源可追蹤。
- 盤點並驗證每個大境界突破物都由對應境界 Boss 掉落，且突破物以丹藥 / 晉階靈物定位清楚呈現。
- 背包與戰鬥 UI 顯示補給冷卻、剩餘數量、自動服丹狀態與不可用原因。

## Impact
- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `types.ts`, `data/items/consumables.ts`, `data/items/itemLineMetadata.ts`, `data/shops.ts`, `data/workshopRecipes.ts`, `utils/consumableEffects.ts`, `pages/Adventure.tsx`, `pages/Inventory.tsx`, `store/slices/adventureSlice.ts`, `store/persistedStateMigration.ts`, tests
- Persistence: 新增 `current.adventure.autoConsumableSettings`，必須補 initial state、migration / hydrate sanitize 與 regression。戰鬥補給 CD timestamp 不持久化。
