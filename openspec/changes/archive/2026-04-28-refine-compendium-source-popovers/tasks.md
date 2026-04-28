## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增 source tracing regression，確認掉落 chip 帶怪物 rank 與清楚工坊文案
- [x] 1.3 新增 Compendium markup regression，確認來源分組、rank class 與品質 tooltip 不使用卡片 hover group

## 2. 實作

- [x] 2.1 source tracing chip 增加 rank 與清楚文案
- [x] 2.2 來源 badge 依普通、精英、首領分色
- [x] 2.3 `+更多` 改為分組、寬版、可滾動、可停留閱讀的 tooltip
- [x] 2.4 品質 tooltip 改用獨立 hover group

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests
- [x] 3.2 跑 `npx tsc --noEmit`
- [x] 3.3 跑 `npm run build`
- [x] 3.4 跑 `git diff --check`
- [x] 3.5 更新 tasks、archive OpenSpec change 並提交
