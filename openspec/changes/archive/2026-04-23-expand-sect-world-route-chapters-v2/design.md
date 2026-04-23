## Context

上一輪宗門 / 世界內容已把三宗推進到後段世界入口，但玩家仍需要更長的 route chapter 才能感覺宗門身份會持續影響世界。

## Goals

- 每個宗門至少補一段化神後 route chapter
- 章節入口能透過 NPC、Quest modal 或 encounter 被發現
- 章節結果能餵給 world memory 或 Workshop source

## Non-Goals

- 不重寫 quest engine
- 不引入 branching quest graph
- 不在這條線新增 Workshop 專精效果

## Decisions

- 沿用既有 `Quest / NPC / Encounter` 資料模型
- 跨系統後果以 memory tag 或 reward cue 串接，不新增複雜 runtime engine
- 章節文案與任務目標必須保留三宗差異
