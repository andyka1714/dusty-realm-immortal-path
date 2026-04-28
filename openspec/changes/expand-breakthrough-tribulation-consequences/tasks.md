## 1. 規格與測試

- [ ] 1.1 驗證 OpenSpec change
- [ ] 1.2 新增 breakthrough consequence reducer / helper regression，確認測試先失敗
- [ ] 1.3 新增 persistence migration / hydrate regression，確認測試先失敗
- [ ] 1.4 新增 Dashboard rendering regression，確認測試先失敗

## 2. 實作

- [ ] 2.1 新增 persisted breakthrough consequence state 與型別
- [ ] 2.2 實作 migration、hydrate sanitize 與 consequence helper
- [ ] 2.3 高境界突破失敗可套用 consequence，preview 讀取其影響
- [ ] 2.4 Dashboard 顯示 consequence 與恢復提示

## 3. 驗證與收口

- [ ] 3.1 跑 targeted tests、typecheck、build、e2e、OpenSpec validate 與 `git diff --check`
- [ ] 3.2 更新 tracking docs，記錄 migration 與 persisted shape
- [ ] 3.3 提交 implementation 並 archive
