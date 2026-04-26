## Context

目前 `select` 已開始共用化，但真正高風險的互動熱區仍分散在各頁：

1. `Modal` 與 `GamePanel` 各自維護不同的 overlay、close 與 mobile 行為
2. `Inventory`、`Dashboard`、`Workshop`、`Compendium` 與 `Adventure` 仍有大量 raw control
3. repo 幾乎沒有 committed browser/e2e harness，互動回歸無法用現有 vitest 補足

這使得 UI 收斂必須採「foundation 先行、再替換高風險 flow、最後補 browser 驗證」的策略，而不是一次機械替換全部按鈕。

## Goals / Non-Goals

- Goals:
  - 建立正式 shared UI foundation 第一波，讓高風險互動 flow 共享同一套語意
  - 先收斂 `Reincarnation Hall`、`GameShell overlay` 與 `Inventory`
  - 全量盤點 app source，讓殘留 raw controls 收斂到 shared primitives
  - 建立最小可用的 browser/e2e 驗證基線
- Non-Goals:
  - 不全面重寫所有頁面的視覺語言
  - 不變更 persisted state schema
  - 不在這條 change 中重做 `AdventureStage` 戰鬥邏輯或 actor token 呈現

## Decisions

- 先補 `components/ui/dialog` 與 `components/ui/sheet`，再讓 `Modal` / `GamePanel` 收斂到同一套 shared primitive，而不是各頁繼續維護 portal 細節
- `tooltip` 拆成兩類：
  - 短提示走 `Tooltip`
  - 富內容說明走 `HoverCard` 或 `Popover`
- `button` 不做單一樣式；維持遊戲語義 variants，例如 `primary / danger / ghost / icon / tab / action-card`
- browser/e2e 第一波只覆蓋最高風險流程，並補必要的穩定 selector，不追求一次覆蓋全站
- app source 以 guard test 禁止直接新增 lowercase native `button/input/select/textarea`，shared primitive 本體集中保留 native element

## Risks / Trade-offs

- 若直接替換所有 raw control，會把回歸風險擴大到難以驗證
  - Mitigation: 先做 foundation，先替換 `Reincarnation / GameShell / Inventory`
- 若只補 shared UI 不補 browser/e2e，之後每次改 overlay 都還是靠人工目測
  - Mitigation: 這次把 selector 與 browser harness 一起納入 change
- 若讓 Radix 行為直接覆蓋既有 close semantics，可能改壞 pending encounter 或不可關閉 panel
  - Mitigation: 對 `Modal`、`GamePanel`、`PendingEncounterPanel` 分別保留明確 close policy

## Migration Plan

1. 建立 OpenSpec change 與 shared primitive
2. 收斂 overlay / tabs / input / button variants
3. 替換 `Reincarnation Hall`、`GameShell overlay`、`Inventory`、`IntroSequence`
4. 全量掃描並補收 `Sidebar`、`Adventure`、`ShopPanel`、`QuestModal` 殘留 raw controls
5. 補 browser/e2e smoke、native control guard 與 tracking docs
6. 完整驗證後提交
