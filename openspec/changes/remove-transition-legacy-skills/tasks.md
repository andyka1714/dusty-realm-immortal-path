## 1. 舊技能遷移主路徑
- [x] 1.1 建立 retired skill / manual 的 persisted-state migration helper，統一吃 `replacementSkillId` 與 final-cull manifests
- [x] 1.2 在 `loadState()` / store hydrate 階段正規化 `character.skills`、相關 manual item 與其他 persisted skill 引用

## 2. 玩家可見出口收尾
- [x] 2.1 清理剩餘會暴露 `transition / legacy` 技能的玩家可見 registry / 視圖 / 獎勵出口
- [x] 2.2 保留 reducer / import flow 的 replacement-aware fallback，並確保 migrate 後 skill list 會去重且只剩 formal core

## 3. 驗證與文件
- [x] 3.1 補舊存檔 hydrate、舊秘卷升級、final-cull visibility regression tests
- [x] 3.2 同步更新 `12_技能書實作收斂.md` 與 `16_下一輪執行優先級Checklist.md`
- [x] 3.3 驗證 `openspec validate remove-transition-legacy-skills --strict` 與相關測試
