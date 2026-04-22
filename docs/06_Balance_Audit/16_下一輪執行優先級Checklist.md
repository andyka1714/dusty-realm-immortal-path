# 16 下一輪執行優先級 Checklist

本文件用來承接 `14_整體改造Checklist` 與 `15_battle_core下一輪收尾Checklist` 結案後，仍然存在於審計文件內的下一輪 backlog。

目前 `P0` 已完成，`P1` 也已正式收口：

- `update-battle-p0-gap-closure`
- `update-balance-p1-late-game-density`
- `update-skillbook-p2-progression`（技能書深化子批次）
- `update-battle-p2-live-combat-presentation`（即時戰鬥表現層子批次，已完成）

這不是把舊主線改回未完成，而是把剩餘工作按 `P0 / P1 / P2` 排成可執行順序，避免待辦再次散落在多份文件裡。

狀態規則：

- `[x]` 已完成並已落到程式或正式文件
- `[ ]` 尚未完成，或仍停留在分析 / 草案階段

---

## P0. 戰鬥語意與高境界技能缺口補完

- [x] 補齊少數高境界技能仍偏模板化的欄位
- [x] 補齊少數高境界技能仍未完整落地的 battle event
- [x] 把高境界被動在 `battleEncounter / battleWorldStrike / replay` 的回報與可見性完全對齊
- [x] 補上下一批正式狀態效果，不只 `vulnerable`
- [x] 補上更多怪物 / 玩家控制與環境互動狀態
- [x] 為上述 battle 語意補齊 regression tests
- [x] 同步更新 `03_職業與技能審計.md`、`06_實作修正落點.md` 與 `combat.md`，移除對應缺口描述

---

## P1. 後期平衡、內容密度與掉落主題化

- [x] 把普通怪掉落再往路線主題化推進
- [x] 重新檢視 `化神 -> 仙帝` 的內容密度與精英 / Boss 配比
- [x] 細修三職業在後段境界的輸出 / 生存係數
- [x] 重新驗證後段 TTK 與跨境界挑戰門檻
- [x] 檢查裝備基礎值、品質倍率與詞條權重是否仍符合目前 battle core
- [x] 同步更新 `02_戰鬥與裝備曲線審計.md` 與 `07_路線分流與主題掉落設計.md`

---

## P2. 技能書體系深化與即時戰鬥表現層

- [x] 重新收斂剩餘 `retired / duplicate` 技能，降低技能池噪音
- [x] 正式區分技能書來源層級，例如基礎 / 進階 / Boss 核心強技
- [x] 補齊技能學習條件檢查與技能書來源對應
- [x] 持續收斂高境界技能描述，對齊目前引擎可完整承接的形式
- [x] 把地圖內戰鬥從第一階段距離接戰推進到同場攻擊播放、技能 CD 與血條變化
- [x] 補齊更細的 AI / 射程 / Boss 技能圈 / 投射物飛行時間表現
- [x] 同步更新 `08_技能系統與技能書規劃.md`、`12_技能書實作收斂.md`、`13_3D渲染與戰鬥呈現評估.md` 與 `combat.md`

---

## 備註

- `14_整體改造Checklist.md` 仍維持封存完成
- `15_battle_core下一輪收尾Checklist.md` 仍維持已完成，不回頭改回未完成
- 若後續要正式開新實作主線，應再另外建立對應的 OpenSpec change 與專用 tasks
- `remove-transition-legacy-skills` 已完成，正式承接並收口 retired skill 退場與舊存檔遷移
- `update-live-combat-role-status-polish` 已完成，正式收口怪物分工、狀態提示與 live-combat visual polish
- `update-emperor-endgame-density-polish` 已完成，正式收口 `仙帝` 端內容密度、路線專屬感與終盤門檻細修
- `add-meta-progression-foundation` 已完成，正式收口版本化存檔、`soul` progression、Life Review / Reincarnation Hall / Rebirth flow 與 base spec truth 回寫
- `add-workshop-and-event-loops` 已完成，正式收口 `Workshop` recipe loop、pending event flow 與高境界 multiplier regression 對齊
- `evaluate-pixel-art-vertical-slice` 已完成，正式收口 `Adventure` representative pixel-art vertical slice、web/mobile 驗證與效能 budget 基線
- `update-adventure-terrain-pixelization` 已完成，正式收口 `AdventureStage` terrain/background 像素化整合，並維持角色 / 玩家 / 怪物表現現狀
- `add-sect-midgame-progression` 已完成，正式收口三宗 `築基 -> 金丹` 宗門中期成長線、quest NPC 與 regression
- `sync-base-spec-persistence-truth` 已完成，正式收口 base specs、persisted state migration 與正式 UI / loop 基線真相
- `update-reincarnation-build-planner` 已開案，承接 `主動坐化`、進階 perk / heirloom planner 與第二批輪迴 build 分化
