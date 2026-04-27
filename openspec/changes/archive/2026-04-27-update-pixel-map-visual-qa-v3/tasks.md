## 1. OpenSpec 與盤點

- [x] 1.1 讀取 pixel terrain helper、AdventureStage、Playwright smoke、client-interface spec
- [x] 1.2 確認本 change 不新增 persisted schema，記錄不需要 migration 的理由
- [x] 1.3 跑 `openspec validate update-pixel-map-visual-qa-v3 --strict`

## 2. Visual QA helper

- [x] 2.1 補 failing tests：代表地圖必須輸出 semantic role / skeleton / motif QA report
- [x] 2.2 實作 terrain visual QA helper，統計 palette、semantic roles、skeletonIds、motifKinds、forbidden actor key 狀態
- [x] 2.3 覆蓋 path、water、hazard、resource node、portal threshold、boss arena、POI / route skeleton
- [x] 2.4 確認 helper 只讀 terrain tiles，不新增 runtime / persisted state

## 3. Browser smoke 與文件

- [x] 3.1 強化 Playwright smoke，確認 desktop / mobile canvas 非黑、map modal 無溢出、actor token / HUD 沒被改掉
- [x] 3.2 更新 pixel terrain / UI tracking docs
- [x] 3.3 回寫 base specs，明確記錄 v3 visual QA 與 no migration

## 4. 驗證與收口

- [x] 4.1 跑 targeted tests：`utils/adventureTerrainPixelization.test.ts`
- [x] 4.2 跑 Playwright smoke：`tests/e2e/shared-ui-foundation.spec.ts`
- [x] 4.3 跑 `npm test`、`npm run typecheck`、`npm run build`、`openspec validate --all --strict`、`git diff --check`
- [x] 4.4 完成後更新 tasks 狀態、提交 implementation、archive change，並提交 archive
