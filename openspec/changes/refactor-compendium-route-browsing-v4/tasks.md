## 1. 規格與 checkpoint

- [x] 1.1 盤點現有 Compendium item / skill / sect layout 與 source tracing 能力
- [x] 1.2 建立 OpenSpec proposal / delta，明確記錄不需要 migration
- [x] 1.3 驗證並提交 proposal checkpoint

## 2. 測試先行

- [ ] 2.1 新增 item tab heading / card 可見性 regression，先暴露遮擋風險
- [ ] 2.2 新增 skill profession + realm summary regression，先暴露分類掃描缺口
- [ ] 2.3 新增 sect route hook summary regression，先暴露宗門用途摘要缺口
- [ ] 2.4 更新 Playwright smoke，覆蓋 mobile / desktop Compendium 不溢出且標題不遮卡

## 3. 實作

- [ ] 3.1 調整 `神兵法寶` scroll / heading 結構，避免 sticky 標題遮住 item card
- [ ] 3.2 補 `功法神通` 職業 tabs 的 count、境界 summary 與 source cue
- [ ] 3.3 補 `宗門傳承` 單宗 route hook summary 與可讀 tabs
- [ ] 3.4 保持現有 source tracing helper，不新增第二套資料 registry

## 4. 文件與驗證

- [ ] 4.1 更新 balance tracking，記錄 v4 scope 與不需要 migration
- [ ] 4.2 跑 targeted unit tests、Playwright smoke、typecheck、build、OpenSpec validate 與 `git diff --check`
- [ ] 4.3 完成後更新 tasks 狀態並提交 implementation checkpoint
- [ ] 4.4 Archive OpenSpec，驗證並提交 archive checkpoint
