# Change: 整理技能書商店與掉落 routing v4

## Why

正式技能書 coverage 已足夠，但取得路徑仍分散在 skill metadata、商店、精英 / Boss 掉落與圖鑑 source tracing 之間。圖鑑目前只能顯示抽象來源，例如「同境界 Boss」，不利於確認具體從哪個商店或敵人取得。

## What Changes

- 新增技能書 routing helper，從既有 skill manual metadata、`SHOPS` 與 `BESTIARY` 推導 `manualId -> concrete routes`。
- 擴充 regression，確保正式 core manual 都有至少一條可讀 route，且不指向 retired manual 或 missing item。
- 讓 Compendium skill source tracing 顯示具體商店 / 精英 / Boss / 傳承來源，而不是只顯示抽象 acquisition tier。
- 保持既有 skill manual registry 為單一事實來源，不新增第二套人工維護的圖鑑來源表。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `data/skillManualRouting.ts`, `data/skills/*tests*`, `components/Compendium/sourceTracing.ts`, source tracing tests
- Persistence: 不新增 LocalStorage schema、hydrate shape 或 persisted catalog；不需要 migration。
