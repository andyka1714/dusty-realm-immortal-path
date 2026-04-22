# 事件與奇遇深化設計

主題：`update-encounter-risk-reward-depth`

## 1. 背景

目前 repo 已有完整的第一版 encounter foundation：

- `data/encounters.ts` 已定義正式事件資料
- `checkTimeEvents()` 會在年歲流逝中建立 `pending encounter`
- `GameShell` 會彈出 `PendingEncounterPanel`
- `resolvePendingEncounterChoice()` 已能把選項轉成 `exp / spirit stones / items`
- `EncounterState` 也已保存 `resolvedEventIds`

這代表「事件 / 奇遇是否存在」已經不是問題；真正的缺口在於它還沒有成為夠厚的正式內容層。

目前最明顯的不足是：

1. selector 幾乎只看 `realm`，缺少 `profession / sect / route / progress` 差異
2. `resolvedEventIds` 沒有真正形成 anti-repeat / one-time gating
3. choice 雖有分支，但玩家很難在 UI 上讀出哪個是穩健、哪個是高風險高收益
4. encounter 與 `Workshop / Sect / World` 的內容掛點還不夠強，導致它比較像加值 log，而不像正式 loop

## 2. 目標

- 把 encounter selection 從單純 `realm pool` 擴成具上下文條件的 selector
- 讓 choice 有更清楚的風險 / 收益 / 成本辨識，而不是只有二選一領獎
- 補 profession / sect / 高境界 / route-specific event pools，讓玩家真的感受到路線差異
- 在不重做存檔 schema 的前提下，把現有 `pendingEvent + resolvedEventIds` 用到足夠有價值

## 3. 非目標

- 不在這一批重做成完整 branching narrative engine
- 不把 encounter 改成大型地圖劇情腳本系統
- 不重寫 quest engine
- 不在這一批把角色、怪物或 NPC 改成像素 sprite

## 4. 設計決策

### 4.1 先強化資料模型與 selector，不先擴 state schema

目前 `EncounterState` 只有：

- `pendingEvent`
- `resolvedEventIds`

這套 shape 已經足夠支撐下一輪深化，只要讓資料層與 selector 更聰明即可。因此這批 change 先不動持久化 schema，避免把工作量浪費在 migration。

### 4.2 selector 改成看「上下文」，不是只看境界

新的 selector 應至少考慮：

- `majorRealm`
- `profession`
- 已完成宗門任務或所屬路線
- `Workshop` 基礎進度
- `resolvedEventIds`

這樣 encounter 才能從「同境界 everyone sees the same two events」變成真正的 route-specific pool。

### 4.3 one-time / repeatable 必須成為顯性規則

既然 state 已有 `resolvedEventIds`，就不該繼續只是被動記錄。這批應明確把 encounter 分成：

- `once-per-run` 的 milestone / route-specific event
- 可重複出現、但有權重控制的 general event

這樣才能避免同一批 encounter 在多年流逝中重複洗版。

### 4.4 風險收益先走「可讀性 + 可結算」版本

這批不追求大型劇情分支，而是先把 choice 做成玩家能讀懂的正式 decision：

- 穩健收益
- 高成本換高報酬
- 有風險但可能補稀缺材料

在資料與 UI 層明確標示後，就已足以讓 encounter 從 flavor 升級成可判斷的系統選擇。

### 4.5 先補 event panel 的 cue，再談更大的世界劇情

`PendingEncounterPanel` 現在只展示：

- title
- description
- 選項文字

但還沒有把「事件類型、代價、收益方向、路線來源」講清楚。因此這批 UI 重點是補：

- 類型 / route 標籤
- choice 的風險 / 收益摘要
- 比較清楚的 safe / risky / expensive cue

只要這層可讀性建立起來，之後宗門與世界後段內容就能接著擴張，而不必先回頭補 UI 讀法。

## 5. 風險與取捨

### 5.1 如果 scope 膨脹成「完整事件劇情引擎」，會拖慢主線

這條 change 的價值，在於把既有 foundation 變厚，而不是另起一套 narrative engine。若把 scope 擴成大量條件腳本、長鏈劇情與跨事件狀態機，會直接拖垮交付節奏。

因應方式：

- 先做 selector、one-time gating、choice cue 與一批真正有差異的事件池
- 長鏈劇情交給後續宗門 / 世界 change

### 5.2 如果只補資料、不補 UI，可讀性仍會不夠

相反地，如果只往 `data/encounters.ts` 塞更多內容，而 `PendingEncounterPanel` 照舊只是平鋪文字，玩家仍然不會感受到這條系統的深度。

因應方式：

- 這次把 selector / data / UI cue / tests 綁成同一條 change

## 6. 成功條件

這條主線完成時，至少要滿足：

1. encounter selection 不再只靠 `realm`
2. `resolvedEventIds` 真正參與 one-time / anti-repeat gating
3. 玩家可在 panel 上清楚讀到 choice 的風險 / 收益方向
4. profession / sect / 高境界至少各有一批真正不同的 event pool
5. regression tests 能驗證 selector 與 choice resolution，不讓這條系統再退回純 flavor log
