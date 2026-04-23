# 變更：把 Reincarnation Hall 擴成正式 build planner

## 為什麼

`add-meta-progression-foundation` 已經把 `Soul Save / Merit / Lifetime Stats / Heirloom / Reincarnation Hall` 的第一批 foundation 做完，現在死亡不再只是直接 reset。

但目前 live code 顯示，輪迴系統仍停在 foundation 規模：

- `Reincarnation Hall` 目前只有 `3` 個通用 perk，還沒有真正的 build 分化
- 遺珍繼承仍固定只支援 `1` 格，planner 空間很窄
- 玩家只能在死亡後進輪迴流程，沒有正式的 `主動坐化` / 提前結算入口
- Hall 雖已有花費與剩餘功德預覽，但仍缺少更完整的起手 build 規劃感

換句話說，`輪迴轉生` foundation 已完成，但「輪迴正式化」真正還缺的是第二批 planner expansion，而不是再重做 `soul` 結構。

## 這次要改什麼

- 補正式的 `主動坐化` 入口，讓玩家可在活著時主動進入本世結算
- 擴張 `perk` catalog，加入更明確的 build 分類與進階 unlock 條件
- 把遺珍規劃從固定 `1` 格擴成可被 planner / perk 影響的多格配置
- 強化 `Reincarnation Hall` 的 planner UI，讓玩家能看到更清楚的起手加成與配置結果
- 補 `soul` save / migration regression，確保既有存檔能安全承接新 planner 欄位與 perk catalog

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `types.ts`
  - `utils/reincarnation.ts`
  - `store/slices/soulSlice.ts`
  - `store/actions/reincarnationActions.ts`
  - `store/persistedStateMigration.ts`
  - `pages/Dashboard.tsx`
  - `components/game/ReincarnationFlow.tsx`
  - `docs/02_Gameplay/reincarnation.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
