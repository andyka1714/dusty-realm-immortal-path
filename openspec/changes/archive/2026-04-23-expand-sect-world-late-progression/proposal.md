# 變更：擴張宗門與世界後段內容

## 為什麼

`update-encounter-risk-reward-depth` 已把 encounter selector、route-specific event pool 與風險收益 cue 接成正式系統。下一個明確缺口，是把已完成的三宗 `築基 -> 金丹` 中期線繼續往 `元嬰+` 與世界里程碑推進。

目前宗門任務已能讓玩家完成入門、築基歷練與金丹真傳，但進入 `元嬰` 後，宗門與世界內容又退回只剩地圖、怪物與 Boss。這會讓職業 / 宗門 identity 在中後期斷線，也浪費剛完成的 encounter 條件化掛點。

## 這次要改什麼

- 補每個宗門至少一段 `元嬰+` 後段任務，承接既有 `sect_*_task_03`
- 明確保留 `化神` 三界戰場 / convergence 作為下一段可接續的世界脊椎，不把後段只停在單次 `元嬰` boss 清單
- 補對應的宗門 / 世界里程碑 NPC 或 quest hook，讓任務不只是藏在資料表裡
- 將後段任務與現有 `元嬰` route boss / map content 對齊，維持三路職業辨識
- 補 route-specific world encounter 或材料事件，讓宗門後段能接上已完成的 encounter selector
- 補 regression tests，避免宗門後段鏈條、NPC 掛點或 reward id 漂移
- 同步更新下一階段優先級與相關 gameplay 文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/quests.ts`
  - `data/npcs.ts`
  - `data/maps.ts`
  - `data/encounters.ts`
  - `data/sectMidgameProgression.test.ts`
  - 新增宗門 / 世界後段 regression test
  - `docs/02_Gameplay` 相關 gameplay 文件
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
