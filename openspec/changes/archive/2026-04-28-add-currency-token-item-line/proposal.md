# Change: 建立貨幣與代幣物品線

## Why

靈石之外，宗門貢獻、藏經閣書券、試煉令與傳承殘頁能讓不同商店與任務 loop 有自己的消耗方式。

## What Changes

- 定義貨幣與代幣 taxonomy。
- 區分通用貨幣、門派貨幣、功法兌換券、試煉消耗與傳承碎片。
- 第一階段只規劃，不改現有 spiritStones persisted shape。

## Impact

- Affected specs: `game-mechanics`
- Affected code: future shop, quest, inventory, persistence if token balances become state
- Persistence: 若代幣以 item 存入 inventory 可不新增 schema；若成為獨立餘額，需要另開 migration。
