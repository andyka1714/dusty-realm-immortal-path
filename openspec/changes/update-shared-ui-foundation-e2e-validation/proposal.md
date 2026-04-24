# 變更：共享互動元件基礎與正式 browser 驗證

## 為什麼

目前 repo 已開始導入 shadcn-compatible foundation，但正式介面仍同時存在：

- 原生 `<button>` / `<input>` 與大量 inline class
- 自製 `Modal` 與 `GamePanel` 兩套不同 overlay 語意
- 各頁自己管理 tab、tooltip、hover bubble 與 panel close 行為
- 幾乎沒有可承接互動回歸的 browser/e2e 驗證基線

這代表目前不是單一頁面樣式問題，而是共享互動基礎與驗證方式都還沒正式收口。若繼續零散替換，桌面與 mobile 的 overlay、焦點、捲動與關閉規則會更難維持一致。

## 這次要改什麼

- 建立正式可重用的 shared UI foundation 第一波：`dialog/sheet`、`tooltip` 系列、`tabs`、`input` 與擴充後的 `button` variants
- 先替換最高風險 flow：`Reincarnation Hall`、`GameShell overlay`、`Inventory` 與 `IntroSequence`
- 補穩定 selector 與 browser/e2e harness，至少覆蓋 `輪迴大殿 / GameShell overlay / Inventory`
- 同步更新 Android / mobile-first UI 驗證追蹤文件

## 影響範圍

- Affected specs:
  - `client-interface`
- Affected code:
  - `components/ui/*`
  - `components/Modal.tsx`
  - `components/game/GamePanel.tsx`
  - `components/game/ReincarnationFlow.tsx`
  - `components/game/GameShell.tsx`
  - `pages/Dashboard.tsx`
  - `pages/Inventory.tsx`
  - `components/IntroSequence.tsx`
  - `pages/Workshop.tsx`
  - `components/Compendium/CompendiumModal.tsx`
  - browser/e2e config and tests
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Persisted State / Migration

- 這條 change **不影響** LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；本次只調整 shared UI、互動承接方式與 browser 驗證基線。
