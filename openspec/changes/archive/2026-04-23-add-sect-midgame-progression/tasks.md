## 1. 宗門中期內容

- [x] 1.1 為劍宗、獸莊、仙宮各補 1 名中期 quest NPC
- [x] 1.2 為三宗各補 `task_02`、`task_03`，形成 `加入 -> 入門試煉 -> 築基 -> 金丹` 的鏈式節奏
- [x] 1.3 以既有 boss 節點與職業裝備承接 quest 目標與獎勵，不擴張 manual source registry

## 2. 測試與驗證

- [x] 2.1 補 quest data regression，驗證前置鏈、realm gate、giver / submit NPC 與目標 boss
- [x] 2.2 補 NPC wiring / reward validity regression，驗證 questIds 與獎勵 item 對齊
- [x] 2.3 驗證 typecheck、相關 tests 與 `openspec validate add-sect-midgame-progression --strict`

## 3. 文件與追蹤

- [x] 3.1 更新 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
- [x] 3.2 維護 `docs/superpowers/specs/2026-04-22-sect-midgame-progression-design.md` 與這條 change 的完成狀態
