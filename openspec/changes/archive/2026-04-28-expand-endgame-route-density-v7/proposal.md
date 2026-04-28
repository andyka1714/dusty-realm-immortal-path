# Change: 擴充終盤 route density v7

## Why

v6 已為三宗各補一條 repeatable aftermath，但終盤 route 的事件變化仍有限。v7 應增加 repeatable aftermath 密度與 route identity，不新增第三套終盤架構。

## What Changes

- 三宗各新增 v7 repeatable aftermath。
- v7 事件保留 route、category、chain、memory、風險與收益 cue。
- 更新 content authoring audit，檢查 v5 / v6 / v7 route density 平衡。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `data/encounters.ts`, `data/contentAuthoringAudit.ts`, tests
- Persistence: 不新增 persisted state；沿用 resolved events、world memory 與 repeat policy。
