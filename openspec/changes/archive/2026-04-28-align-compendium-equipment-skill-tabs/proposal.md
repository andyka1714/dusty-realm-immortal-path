# Change: 對齊裝備與功法圖鑑體驗

## Why

`裝備法寶` 與 `功法神通` 都是角色養成資料查詢，但目前裝備沒有職業/通用分類，功法也仍使用不同色系，導致兩個 tab 的使用者體驗不一致。

## What Changes

- `裝備法寶` 新增 `通用 / 劍修 / 體修 / 法修` 分頁。
- 裝備分類從既有 equipment audit 路線推導，不新增 item schema。
- `功法神通` summary 與境界 heading 改為 amber 色系，和裝備一致。
- 保留裝備與功法的獨立 tab 與既有卡片內容。

## Impact

- Affected specs: `client-interface`
- Affected code: `components/Compendium/CompendiumModal.tsx`, `components/Compendium/CompendiumModal.test.tsx`
- Persistence: 不影響 LocalStorage schema，不需要 migration。

