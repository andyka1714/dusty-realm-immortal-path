# 任務追蹤狀態與目標類型設計

## 背景

任務追蹤已能在沒有 active quest 時推導下一主線，並可點擊導向 NPC 或地圖。但目前卡片只提供簡單 `statusLabel` 與 `progressLabel`，不足以支援玩家判斷任務是可接取、進行中、可回報，未來也無法自然呈現多條件任務。

## 目標

- 任務卡片清楚區分 `下一主線`、`可接取`、`進行中`、`可回報`。
- 任務目標以 progress rows 顯示，支援 `對話`、`討伐`、`提交`、`境界` 與複合任務。
- 任務導向仍使用 runtime-only event，不新增 persisted state。
- QuestTrackerHUD 只渲染 derived view model，不直接理解任務規則。

## 非目標

- 不新增任務日誌頁。
- 不重寫 `QuestModal` 完成任務流程。
- 不新增多 requirement 分開 persisted progress；本輪維持現有單一 active progress，並優先以背包與角色狀態推導 item/level rows。

## View Model

`buildQuestTrackerItems` 會輸出：

- `lifecycleStatus`: `suggested | available | active | ready`
- `lifecycleLabel`: `下一主線 | 可接取 | 進行中 | 可回報`
- `objectiveKind`: `dialogue | kill | item | level | mixed`
- `progressRows`: 每個 requirement 的 label、current、required、complete
- `primaryActionLabel`: 例如 `前往村長`、`前往凌霄山腳`、`回報鐵匠鋪`
- `navigationTarget`: 既有 NPC / map / condition 導向目標

## UI

卡片頂部顯示任務標題、任務類型 badge 與 lifecycle badge。中段顯示主要行動，底部顯示最多三條 progress rows。若有更多條件，未來可加 `+N` 摘要，本輪先完整顯示目前任務資料需要的列數。

## Persistence

不新增 migration。UI 狀態都從現有 Redux state 與資料表推導。
