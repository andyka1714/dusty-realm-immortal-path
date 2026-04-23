## 1. 高境界技能欄位與事件補完
- [x] 1.1 盤點 `P0` 內實際要補的高境界技能欄位、battle event 與可見性缺口
- [x] 1.2 補齊高境界技能在 `battleEncounter / battleWorldStrike / battleTurnPhases / battleAftermath / replay` 的事件與回報對齊
- [x] 1.3 移除對應審計文件內已過時的「少數高境界欄位 / 事件仍待補完」描述

## 2. 正式狀態與 battle 語意補完
- [x] 2.1 決定下一批正式 status 名單，並接入共用 status type / builder / logger / visibility 流程
- [x] 2.2 確保新增 status 在 world / timeline / replay 三條路徑的套用與顯示一致
- [x] 2.3 更新 `combat.md` 與相關審計文件的正式 status 描述

## 3. 驗證
- [x] 3.1 補齊高境界技能事件與 status visibility 的 regression tests
- [x] 3.2 執行 `npm run typecheck`
- [x] 3.3 執行 battle 相關測試與必要的回歸測試
- [x] 3.4 執行 `openspec validate update-battle-p0-gap-closure --strict`
