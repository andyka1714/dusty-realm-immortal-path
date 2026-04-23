## 1. 怪物分工與行為提示
- [x] 1.1 補更細的 live-combat monster role / archetype helper，區分近戰壓迫、遠程風箏、法術蓄力與 Boss 危險節奏
- [x] 1.2 把對應的射程圈、蓄力預警與危險區層級接回 `AdventureStage` / `Adventure`

## 2. 狀態與控制提示
- [x] 2.1 為 live combat 補正式 status / control / immunity presentation helper
- [x] 2.2 在 HUD / 目標資訊 / 場上 cue 顯示狀態圖示、剩餘時間或層數、控制成功與免疫提示

## 3. 視覺 polish、測試與文件
- [x] 3.1 強化投射物、命中特效與危險區的 visual language，保持與 battle core outcome 對齊
- [x] 3.2 補 world combat / presentation / adventure slice regression tests
- [x] 3.3 同步更新 `docs/02_Gameplay/combat.md` 與 `docs/06_Balance_Audit/13_3D渲染與戰鬥呈現評估.md`
- [x] 3.4 驗證 `openspec validate update-live-combat-role-status-polish --strict` 與相關測試
