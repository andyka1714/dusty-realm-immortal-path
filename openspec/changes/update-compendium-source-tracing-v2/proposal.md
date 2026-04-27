# Change: 補上圖鑑來源追蹤 v2

## Why

`萬界圖鑑` 已完成物品、功法與宗門分類，但玩家仍無法在圖鑑內直接回答「這個材料從哪裡來、會被哪個 Workshop sink 使用、這本功法秘卷主要透過哪種來源取得」。前幾輪已把 route-specific materials、v3 encounter aftermath、Workshop recipe sourceHint 與 skill manual source registry 建好，這輪應把這些既有 metadata 收斂成圖鑑可讀的來源追蹤層。

## What Changes

- 在 `神兵法寶` item card 補 `來源追蹤`，合併顯示敵人掉落、商店、Workshop 產物 / 消耗 sink、route-specific encounter / world chapter cue。
- 讓 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 等 route-specific material 顯示宗門、`sect:*:world-chapter-03`、repeatable aftermath 與 high-tier Workshop sink。
- 在 `功法神通` 與 `宗門傳承` 的 skill card 顯示 formal source tier 與 skill manual source labels，避免玩家只能看抽象 `formalSourceTier`。
- 補 component regression 與 Playwright smoke，確認 source chips 在 desktop / mobile 圖鑑內不造成水平溢出。

## Impact

- Affected specs:
  - `client-interface`
  - `game-mechanics`
  - `client-persistence`
- Affected code:
  - `components/Compendium/CompendiumModal.tsx`
  - `components/Compendium/CompendiumModal.test.tsx`
  - `tests/e2e/shared-ui-foundation.spec.ts`
  - `docs/04_UI/components.md`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Persisted State / Migration

- Schema change? `no`
- Persisted surface: not touched
- Migration / hydration sanitize: not needed，這條 change 只從既有 catalog / drop table / shop / recipe / encounter / skill metadata 推導圖鑑文案，不新增 LocalStorage envelope、`current`、`soul`、item、skill 或 quest persisted field。
- Regression coverage: component render、Playwright smoke、typecheck、build 與 OpenSpec validation；不需要 migration regression。
