## Context

`expand-sect-world-late-content-v3` 新增了三個仙人境 milestone encounter：

- `sword_world_immortal_sword_oath`
- `beast_world_immortal_blood_oath`
- `mystic_world_immortal_star_oath`

它們完成後會寫入：

- `sect:sword:world-chapter-03`
- `sect:beast:world-chapter-03`
- `sect:mystic:world-chapter-03`

這些 milestone 是 `once_per_run`。本 change 補的是完成 milestone 後的 repeatable aftermath，讓後續仙人 / 仙帝階段仍能讀取 v3 記憶並產生 route-specific 事件。

## Goals / Non-Goals

Goals:

- 每宗至少新增一個 repeatable aftermath encounter。
- Aftermath 必須由對應 `sect:*:world-chapter-03` gate。
- Choice cue 必須讓玩家辨識穩定收益、材料來源或高風險收益。
- 不新增 persisted schema；只讀既有 world memory / resolved event / quest context。

Non-Goals:

- 不重做 encounter selector。
- 不新增第二套 event chain state。
- 不新增 Workshop recipe；本輪只提供 encounter aftermath source。
- 不擴張 quest / NPC runtime。

## Decisions

### Decision: Aftermath 使用 repeatable selector

Aftermath encounter 使用既有 repeatable 行為，而不是 once-per-run。這能補 v3 章節後續密度，同時保留 milestone 的一次性身份。

### Decision: 使用 world memory gate

Aftermath 讀取 `requiredWorldMemoryTags`，不新增新的 persisted unlock。這和既有 encounter chain / soul memory 模型一致。

### Decision: UI 只顯示既有 presentation / choice cue

Pending panel 已支援 route、category、chain、memory 與 choice cue。本輪只補 regression，避免為 aftermath 做特殊 UI。

## Risks / Trade-offs

- Risk: repeatable aftermath 過度發材料。
  - Mitigation: 使用低至中等 reward count，並保留非材料選項。
- Risk: 事件與 Workshop source 互相重複。
  - Mitigation: aftermath 是 source，Workshop 是 sink；兩者以 material id / source cue 銜接。
- Risk: world memory gate 在測試 context 缺省時漏出事件。
  - Mitigation: data tests 明確驗證有記憶才可選，缺記憶不可選。

## Migration Plan

No migration. This change only adds encounter catalog entries and reads existing `soul.worldMemoryTags`.
