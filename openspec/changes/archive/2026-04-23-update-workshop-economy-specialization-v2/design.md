## Context

Workshop v1 已有完整閉環，但目前經濟深度仍偏淺。v2 先不新增 discipline，不移除 legacy mirror 欄位，優先用現有 `masteryByDiscipline` 與 `specializationTreeByDiscipline` 做深化。

## Goals

- 讓 mastery milestone 影響 recipe 或專精 leaf
- 讓 route-specific material sink 更有中後期決策
- 讓 UI 明確顯示專精 leaf、品質、材料來源與副產物 cue

## Non-Goals

- 不重寫 Workshop state
- 不新增 craft queue
- 不把材料 provenance 改成 persisted source history

## Decisions

- 若只擴 recipe / tree / mastery / UI，不新增 migration 欄位
- 若實作中新增 persisted state，必須同步更新 `client-persistence` 與 migration tests
- 專精效果不得繞過 route-specific material 消耗
