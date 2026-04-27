## 1. 規格與盤點

- [ ] 1.1 盤點既有內容 regression 與 authoring 缺口
- [ ] 1.2 建立 OpenSpec proposal / design / delta，明確記錄不需要 migration
- [ ] 1.3 提交 proposal checkpoint

## 2. 測試先行

- [ ] 2.1 新增 content audit test，先暴露缺少集中 helper
- [ ] 2.2 驗證 audit 能回報 item / quest / NPC / route material reference 問題

## 3. 實作

- [ ] 3.1 新增 content authoring audit helper
- [ ] 3.2 覆蓋 quest、encounter、shop、enemy drops、Workshop recipe item references
- [ ] 3.3 覆蓋 map NPC questIds 與 quest NPC references
- [ ] 3.4 覆蓋 route material source / sink / compendium tracing

## 4. 文件與驗證

- [ ] 4.1 更新 balance audit / tracking，記錄 audit coverage 與不需要 migration
- [ ] 4.2 跑 targeted tests、typecheck、build、OpenSpec validate、`git diff --check`
- [ ] 4.3 完成後更新 tasks 狀態並提交
- [ ] 4.4 Archive OpenSpec 並提交 archive checkpoint
