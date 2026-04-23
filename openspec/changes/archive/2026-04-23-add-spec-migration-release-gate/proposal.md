# 變更：建立 Spec / Migration release gate

## Why

六條 v2 主線會持續擴張正式功能。如果每次都等功能完成後才補 spec、migration 與 archive，很容易再次產生完成狀態散落或 base specs 落後。

## What Changes

- 建立共用 release checklist
- 明確每條 OpenSpec change 的 spec / migration / validation / archive gate
- 明確 schema 變更時必須補 persistence regression
- 更新 tracking docs，讓後續主線有固定收口方式

## Impact

- Affected specs:
  - `client-persistence`
  - `game-mechanics`
- Affected docs:
  - `docs/06_Balance_Audit/19_六線v2執行計畫.md`
  - `openspec/project.md`
  - `openspec/specs/*/spec.md`
