## Context

專案目前的實際玩法已經超過 base specs 初版定義。

現在正式存在的系統至少包括：

1. `Life Review -> Reincarnation Hall -> rebirth` 的 full-screen 輪迴流程
2. `GameShell` 內 dock panel 承接 `Dashboard / Inventory / Workshop / Compendium`
3. `PendingEncounterPanel` 與 yearly event 觸發後的 choice resolution
4. `Workshop` 的聚靈陣、煉丹、煉器與 recipe crafting loop
5. `schemaVersion: 2` 的 `current + soul` save envelope
6. legacy `retired skill / manual` 向 formal core/manual 的 migration
7. 宗門 `築基 -> 金丹` 的中期 quest / NPC progression

但 base specs 目前仍未把這些真相完整寫成正式 requirement，且 persistence 規格也沒有把 migration 細節說到足夠能支撐後續變更。

## Goals

- 讓 base specs 與 live code 對齊，而不是停留在部分過時描述
- 把 `persistedStateMigration` 與 `localStorage` 的真實責任寫清楚
- 讓後續 `輪迴 / 百業 / 事件 / 宗門內容` 主線都建立在可信的正式基線上

## Non-Goals

- 不新增第二套存檔系統
- 不在這條 change 內擴張新的 encounter pool、workshop recipe 或 reincarnation perk
- 不重做 `GameShell`、`Adventure` 或視覺風格

## Decisions

- 這條 change 以「truth sync + 必要 regression hardening」為原則，只補正式規格、文件與最小必要程式差距
- `client-interface` 只承認已正式存在的入口與流程，不把未完成的 UI 構想提前寫進 requirement
- `client-persistence` 明確把 `soul`、`encounter`、legacy skill/manual migration、輪迴 reset 邊界寫成 requirement
- `game-mechanics` 補上已存在的 `Workshop`、遭遇事件 choice flow 與宗門中期 quest progression，不在這條線新增新玩法

## Risks / Trade-offs

- 若 scope 收得太大，容易把「spec 收口」做成「再開一次玩法主線」
  - Mitigation: 任務只允許補 live code 已存在的 truth，發現缺口也只做最小必要 hardening
- 若只改文件不補 regression，之後仍可能再偏離
  - Mitigation: 這條 change 綁定 `persistedStateMigration` / `localStorage` / event flow regression

## Migration Plan

1. 先盤點三份 base specs 與目前 live code 的落差
2. 補齊 spec deltas 與對應 tests
3. 僅在 spec 與程式行為不一致時，補最小必要 migration / persistence 修正
4. 最後同步 tracking docs 並完成 strict validate
