## Context

輪迴 v1 已把死亡從 reset 轉成新一輪 build 起點。v2 的重點不是重做 flow，而是增加「這一世打算成為什麼」的策略差異。

## Goals

- 補不同 build archetype 的魂印 / perk / heirloom constraint
- 讓 Reincarnation Hall preview 能顯示下一世 identity
- 讓 lifetime stats 或 event memory 能提供有限度的下一世分化

## Non-Goals

- 不重寫 save envelope
- 不做無限制跨世繼承
- 不讓前世 current run 狀態污染新一世

## Decisions

- build diversity 優先落在 catalog 與 planner validation，不直接重寫角色建立 flow
- 若引入新的 soul fields，必須同步更新 migration 與 client-persistence delta
- 所有加成必須能被 preview 與 tests 追蹤
