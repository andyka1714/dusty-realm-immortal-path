# Change: 釐清藏經閣功法取得入口

## Why

功法來源已包含任務、怪物掉落與商店，但凡界初階藏經閣缺少明確 NPC 入口，容易讓玩家誤以為圖鑑就是功法操作或購買入口。

## What Changes

- 新增凡界藏經閣 NPC，連到既有 `skill_shop_mortal`。
- 保留三宗藏經閣 NPC 作為職業基礎功法商店。
- ShopPanel 顯示功法秘卷購買後需要到背包參悟。
- 圖鑑保持來源查詢，不作為購買或裝備入口。

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code: `data/npcs.ts`, map catalog if needed, `ShopPanel`, tests
- Persistence: 不新增 persisted state。
