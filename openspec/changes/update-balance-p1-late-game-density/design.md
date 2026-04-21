## Context
目前後段內容的主要問題不是戰鬥引擎不能承接，而是資料層與 progression 佈局太薄：

- `化神 -> 仙帝` 現在幾乎每境界只剩 2 張圖，`仙帝` 甚至只剩 1 張
- 普通怪在高境界的掉落仍大量使用同一整包 18 件全混池，聚合期主題感過早消失
- `P0` 已補齊高境界 battle event，但 `P1` 仍需要驗證後段三職業在 Boss 門檻與跨境界挑戰上的相對位置

這條主線要一次處理三件事：高境界內容密度、普通怪主題混融掉落、後段三職業係數與門檻驗證。

## Goals / Non-Goals
- Goals:
  - 讓 `SpiritSevering -> ImmortalEmperor` 每個高境界都有額外的壓力圖或精英圖，不再只有壓縮過的兩張圖
  - 讓高境界普通怪掉落改成「混融但有主題」的子池
  - 讓後段三職業維持既定次序：劍修最快、法修次之、體修最穩但最慢
  - 用 regression tests 鎖定同境界 Boss / 高一境界 Boss 的門檻
- Non-Goals:
  - 不新增新的 battle status
  - 不調整技能書來源或 UI 表現
  - 不把高境界重新拆回前中期那種完全三路分流

## Decisions
- Decision: 高境界內容密度採用「聚合主線 + 壓力支線圖」而不是完全重回三路分流
  - Why: `P1` 要補內容厚度，但不能把 `化神` 之後重新改回早期三條完全分流的地圖結構
- Decision: 高境界普通怪掉落改成「雙主題混融池」與「三界混融池」兩種模型
  - Why: 這樣可以保留聚合期混池，同時仍讓玩家感覺某些區域偏劍 / 體 / 法
- Decision: 後段數值微調優先落在 profession coefficient 與 regression tests，而不是大幅重寫技能倍率
  - Why: 這批需要的是收斂與驗證，不是再開一條技能重做主線
- Decision: 文件同步列入同批必做
  - Why: `02`、`07`、`16` 目前都把這批工作明確列為 backlog，完成後必須同步收口

## Risks / Trade-offs
- 新增高境界地圖會帶來額外 map / enemy 資料維護成本
  - Mitigation: 以「每境界補一張壓力圖」為原則，不把資料量擴張到重新三路分流
- 普通怪掉落若收得太窄，可能讓高境界 farming 過度偏科
  - Mitigation: 使用雙主題或三界混融池，而不是單一路線純掉落
- 後段 profession coefficient 若調太大，可能打破既有 battle regression
  - Mitigation: 只做小幅 late-realm coefficient 調整，並用 Boss / 跨境界 regression tests 鎖定

## Migration Plan
1. 建立 `P1` OpenSpec change 與 requirement delta
2. 擴充 `SpiritSevering -> ImmortalEmperor` 的高境界地圖與對應 common / elite 資料
3. 收斂高境界普通怪掉落池，改成主題混融子池
4. 補後段 profession coefficient 與 regression tests
5. 更新 `02`、`07`、`16` 文件與 OpenSpec tasks
6. 執行 typecheck、相關測試與 OpenSpec validate
