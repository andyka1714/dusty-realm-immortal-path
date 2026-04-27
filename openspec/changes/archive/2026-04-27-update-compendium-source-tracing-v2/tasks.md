## 1. OpenSpec 與盤點

- [x] 1.1 讀取 Compendium、item / manual catalog、enemy drops、shops、Workshop recipes、encounter rewards 與 specs
- [x] 1.2 確認本 change 不新增 persisted schema，記錄不需要 migration 的理由
- [x] 1.3 跑 `openspec validate update-compendium-source-tracing-v2 --strict`

## 2. Source tracing view model

- [x] 2.1 先補 failing tests：route material card 必須顯示 world memory、encounter source 與 Workshop sink
- [x] 2.2 補 item source helper，從敵人掉落、商店、Workshop output / sink 與 encounter reward cue 推導 source chips
- [x] 2.3 補 skill source helper，顯示 formal tier 與 skill manual source labels
- [x] 2.4 確認 helper 只讀既有 catalog，不新增 item / skill / quest / persisted 欄位

## 3. Compendium UI

- [x] 3.1 更新 `神兵法寶` card，將原本 `掉落來源` 擴成 `來源追蹤`
- [x] 3.2 更新 `功法神通` skill card，顯示秘卷來源 labels
- [x] 3.3 更新 `宗門傳承` panel，顯示 route material、world memory tag 與用途摘要
- [x] 3.4 確認 desktop / mobile source chips 不造成水平溢出

## 4. 文件與 specs

- [x] 4.1 更新 `docs/04_UI/components.md` 或等效 UI 文件
- [x] 4.2 更新 `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [x] 4.3 回寫 base specs，明確記錄 source tracing 與 no migration

## 5. 驗證與收口

- [x] 5.1 跑 targeted tests：`components/Compendium/CompendiumModal.test.tsx`
- [x] 5.2 跑 Playwright smoke：`tests/e2e/shared-ui-foundation.spec.ts`
- [x] 5.3 跑 `npm test`、`npm run typecheck`、`npm run build`、`openspec validate --all --strict`、`git diff --check`
- [x] 5.4 完成後更新 tasks 狀態、提交 implementation、archive change，並提交 archive
