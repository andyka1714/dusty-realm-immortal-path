## 1. Shared UI foundation
- [x] 1.1 補正式 `dialog/sheet`、`tooltip` 系列、`tabs`、`input` 與擴充後的 `button` variants
- [x] 1.2 定義遊戲語義化 variants，避免只套預設 shadcn 外觀

## 2. 高風險 flow 替換
- [x] 2.1 收斂 `Reincarnation Hall` 與 `Dashboard` 的 shared controls
- [x] 2.2 收斂 `Modal / GamePanel / GameShell overlay` 的 shared overlay 行為
- [x] 2.3 收斂 `Inventory` 與 `IntroSequence` 的 raw controls
- [x] 2.4 視情況延伸到 `Workshop`、`Compendium` 等明顯熱區

## 3. Browser 驗證基線
- [x] 3.1 建立正式 browser/e2e harness 與穩定 selector
- [x] 3.2 覆蓋 `輪迴大殿 / GameShell overlay / Inventory` smoke flows
- [x] 3.3 補 Android / mobile-first 驗證追蹤文件

## 4. 驗證與收口
- [x] 4.1 驗證 `npm test` 與相關 targeted tests
- [x] 4.2 驗證 `npm run typecheck`
- [x] 4.3 驗證 `npm run build`
- [x] 4.4 驗證 browser/e2e smoke
- [x] 4.5 更新 tasks 與 tracking docs，明確記錄本次 change 不需要 migration
