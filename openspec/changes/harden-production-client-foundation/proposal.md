# Change: 強化正式版客戶端基礎與交付邊界

## Why

目前核心邏輯已有完整單元測試基礎，但正式交付仍有數項會直接影響玩家體驗與維護成本的風險：

- `public/assets` 約 `569 MiB`，其中正式 runtime 實際使用的 frame PNG 約 `29.22 MiB`；raw、sheet、GIF、prompt、pipeline metadata 等生成期產物仍會被 Vite 全量複製到正式包。
- 正式素材含本機絕對路徑 metadata，且相同素材有大量重複副本，不適合公開部署。
- 目前 TypeScript 設定並未真正啟用 strict，且缺少 React 型別套件，既有 `typecheck` 會高估安全性。
- mobile HUD 的角色卡會攔截右上小地圖點擊；部分 E2E assertion 已與正式產品行為脫節。
- `index.html` 仍載入 Tailwind Play CDN；開發／建置依賴存在已知安全公告，正式建置也缺少可執行的大小與素材邊界 gate。
- LocalStorage 保存只有 leading throttle，玩家在最後一次操作後迅速關頁時可能遺失最新變更，且配額失敗時缺少可見復原方式。

若直接在這個基礎上全面換皮或擴充更多角色、怪物與地圖素材，會先放大交付體積、回歸成本與存檔風險。因此必須先建立畫風中立的正式版基礎，再另開視覺方向 change。

## What Changes

- 建立 production asset allowlist / manifest，只交付 runtime 需要的 frames、fallback 與必要靜態檔；生成期 raw、sheet、GIF、prompt、metadata 與本機路徑不得進入正式包。
- 加入正式建置資產大小、檔案數、禁入格式、本機路徑與重複內容 gate；第一階段以 runtime frame 交付為基準，保留未來轉 atlas / CDN 的遷移點。
- 修正 mobile HUD 與小地圖的 pointer hit area 衝突，並以 desktop / mobile 幾何 E2E 覆蓋互動區不可互相遮擋。
- 更新已過時的 E2E 產品契約，讓圖鑑分類、任務進度與 NPC 近距離互動符合目前正式行為，同時消除裝飾／tooltip 造成的 overflow 假陽性。
- 補齊 React 型別，建立 strict TypeScript 分階段基準與 no-regression gate；不在單次 change 內假裝消除所有歷史型別債。
- 移除 Tailwind Play CDN，升級有安全公告的相容依賴，修正 Pixi 互動 API 的棄用用法。
- 改善 LocalStorage trailing flush、`pagehide` / hidden flush、保存錯誤提示與既有 versioned envelope 的匯出復原能力。
- 建立單一 `verify` / CI gate，涵蓋 typecheck、strict baseline、unit、E2E、production build 與 build artifact audit。
- 視覺方向、地圖畫風、角色精緻度與紙雕風格不在本 change 內決定；會在本 change 完成後依實機 desktop / mobile 稽核另案提出。

## Impact

- Affected specs: `client-interface`、`client-persistence`、新增 `client-production-readiness`
- Affected code when implemented: `vite.config.ts`、`index.html`、`package.json` / lockfile、`tsconfig*`、build / asset audit scripts、`components/game/GameHUD.tsx`、`pages/Adventure.tsx`、`components/adventure/AdventureStage.tsx`、LocalStorage / store、E2E 與 CI 設定
- Existing active change: 不修改 `add-actor-visual-scale-and-monster-sprites` 的 body type、四方向動畫、QC 或素材來源；僅定義哪些已產生檔案可進 production artifact
- Persisted state: 不新增或更改 LocalStorage schema；保存時機、錯誤回饋與匯出均沿用現有 versioned envelope，因此不需要 migration 或 hydration sanitize。必須以 regression 證明既有存檔可原樣載入。
- User worktree: 實作時必須保留目前 monster asset、checklist、script 與 visual profile 的既有未提交修改，不得清理或重建其來源檔。
