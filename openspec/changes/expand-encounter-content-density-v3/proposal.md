# Change: 擴張 encounter 內容密度 v3

## Why

`Encounter` 已有 pending flow、choice resolution、route cue、world memory 與 Workshop source cue，但中後期仍有兩個缺口：部分高境界事件沒有完整 choice cue，`仙人 / 仙帝` 也尚未被納入與 `元嬰 -> 渡劫` 同等的 coverage floor。若不補齊，事件系統仍會在終盤退回少數通用事件與抽象文字。

## What Changes

- 擴充 `化神 -> 仙帝` encounter coverage matrix，納入 `仙人 / 仙帝` 的最低事件量、可重複事件量與 route-specific 覆蓋。
- 補 `仙帝` 三職業 route-specific 可重複事件，讓終盤不只靠通用寶潮或帝旨支撐。
- 回補既有高境界通用事件的 `categoryLabel / routeLabel / choice cue tags`，避免 pending panel 只能顯示長文字。
- 更新高境界 loop support 代表事件，讓 multiplier 文件與實際 encounter pool 對齊。
- 補 browser/UI QA 小線：以既有 Playwright shared UI spec 驗證 mobile modal overflow、pending encounter cue 與 Adventure canvas 非黑畫面。

## Impact

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/encounters.ts`
  - `data/encounters.test.ts`
  - `data/progression/highRealmLoopSupport.ts`
  - `data/progression/highRealmLoopSupport.test.ts`
  - `components/game/PendingEncounterPanel.test.tsx`
  - `tests/e2e/shared-ui-foundation.spec.ts`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Persisted State / Migration

- 這條 change 不新增 LocalStorage 欄位，不改 `EncounterState`、`PendingEncounter` 或 persisted catalog shape。
- 不需要 migration；新增 encounter event id 與 presentation / cue metadata 會由現有 selector、pending panel 與 hydration sanitize 直接承接。
- 既有 event id 不改名，避免舊存檔中的 `pendingEvent.eventId` 或 `resolvedEventIds` 漂移。
