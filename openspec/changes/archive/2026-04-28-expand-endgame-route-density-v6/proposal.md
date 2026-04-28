# Change: 擴充終盤 route density v6

## Why

v5 已讓 `sect:*:endgame-loop-v4` 延伸到終盤 follow-up，但每宗仍只有第一批後續內容。需要增加 repeatable aftermath 密度，讓仙帝端不只依賴單一收束鏈。

## What Changes

- 每宗新增 v6 repeatable aftermath encounter。
- route cue 保留 `routeLabel / categoryLabel / chainLabel / memoryCue / choice cue`。
- content audit 覆蓋 v6 route density。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `data/encounters.ts`, `data/contentAuthoringAudit.ts`, tests
- Persistence: 不新增 persisted state；沿用 resolved events、world memory 與 repeat policy。
