# Change: 建立內容 authoring audit tools

## Why

高境界地圖、三宗 world chapter、route material、Workshop sink、圖鑑 source tracing 與 map-local hook 已快速擴量。若後續終盤 v4 繼續只靠人工記憶檢查，容易出現 reward item 不存在、NPC questIds 失效、route material 有 source 無 sink 或圖鑑無法追蹤來源等問題。

## What Changes

- 建立 content authoring audit helper / regression test。
- 檢查 quest reward item、encounter reward item、shop item、enemy drops、Workshop ingredients / outputs 都存在於正式 `ITEMS` catalog。
- 檢查 map NPC `questIds`、quest `giverId`、`submitNpcId` 與 dialogue target 都能對到正式 NPC / quest catalog。
- 檢查 route material 同時具備 source 與 Workshop sink，且可被圖鑑 source tracing 推導。
- 文件記錄 audit coverage 與不需要 migration。

## Impact

- Affected specs: `game-mechanics`, `client-persistence`
- Affected code: new content audit helper/test, balance audit tracking docs
- Persisted state: 不改 LocalStorage schema；只新增測試 / authoring helper，因此不需要 migration。
