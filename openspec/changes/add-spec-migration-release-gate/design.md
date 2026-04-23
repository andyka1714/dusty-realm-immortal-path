## Context

目前 base specs 已完成一輪 archive，但 v2 六線會再次改動正式行為。需要把 spec / migration / validation 變成每條 change 的固定 gate。

## Goals

- 每條 change 開案時就標明是否碰 persistence
- 每條 change 完成時都要更新 tasks、specs、docs 與 validation 記錄
- schema 變更必須有 migration 與 regression

## Non-Goals

- 不建立 CI pipeline
- 不把 OpenSpec 流程改成另一套工具
- 不替所有 future change 寫完整實作計畫

## Decisions

- release gate 以文件與 spec requirement 固定，不新增 runtime code
- process requirement 只寫會影響產品資料安全與規格真相的部分
- archive 仍使用 OpenSpec 官方 `openspec archive` 流程
