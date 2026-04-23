## 1. 後段宗門任務鏈

- [x] 1.1 盤點三宗 `sect_*_task_03` 之後的斷點與 `元嬰` route boss 掛點
- [x] 1.2 補三宗 `元嬰+` 後段任務，承接 `sect_sword_task_03 / sect_beast_task_03 / sect_mystic_task_03`
- [x] 1.3 補對應 NPC questIds / dialogue，確認玩家可從宗門 hub 接到任務
- [x] 1.4 在任務 dialogue 或文件中明確承接 `化神` 三界戰場作為下一段 world milestone

## 2. 世界里程碑與 route-specific encounter

- [ ] 2.1 補後段世界 / 宗門 milestone encounter，使用 profession 與 completed quest gating
- [ ] 2.2 補 route-specific reward / material cue，避免後段內容只剩通用靈石或修為
- [ ] 2.3 確認新增內容不改變玩家 / 怪物 / NPC 的文字 token 表現決策

## 3. 測試、文件與驗證

- [ ] 3.1 補宗門後段 quest / NPC / encounter regression tests
- [ ] 3.2 更新 `docs/02_Gameplay` 與 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
- [ ] 3.3 更新 `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`，將 encounter 主線移為已完成並把本 change 設為下一順位
- [ ] 3.4 驗證 `openspec validate expand-sect-world-late-progression --strict` 與相關測試
