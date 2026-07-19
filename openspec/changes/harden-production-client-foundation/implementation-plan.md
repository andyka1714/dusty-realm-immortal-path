# 塵寰仙途 Production Hardening MVP Plan

Generated: 2026-07-18
Delivery window: 7 days

## Milestones

- M1（Day 1-2）：玩家可感知的 mobile HUD、E2E 契約、Tailwind CDN 與 Pixi 棄用修正。
- M2（Day 3-4）：trailing save、離頁 flush、存檔復原入口與 production asset allowlist。
- M3（Day 5-7）：React 型別、strict no-regression、依賴安全、CI 與正式建置 budget。

## Scope In

- 首次敘事、命名／性別、抽靈根到正式 Adventure 的既有流程回歸。
- mobile HUD 可點擊性與 desktop / mobile Playwright 幾何驗證。
- runtime asset manifest、正式包禁入清單與 50 MiB / 12,000 files budget。
- versioned LocalStorage envelope 的可靠保存、錯誤回饋與安全匯出入。
- React 型別、strict 漸進式 gate、相容安全依賴與 CI。

## Scope Out

- 不改 LocalStorage schema，不新增後端或雲端存檔。
- 不在本 change 重畫地圖、角色、怪物或 UI。
- 不刪除素材來源工作區；只限制 production artifact。
- 不在同一批次完成所有歷史 strict 型別債。

## Vertical Slices

### Slice 1：首次流程與 HUD 操作可用

- Data：不改 persisted state，只修正 E2E seed / assertion。
- Frontend：HUD pointer boundary、Tailwind CDN、Pixi event mode。
- Validation：首次流程、mobile 小地圖、圖鑑、任務與 NPC 互動。
- Done：玩家不需人工繞過即可完成首次流程並在 390px viewport 開啟小地圖。

### Slice 2：最新進度可保存、正式包不洩漏生成素材

- Data：versioned envelope trailing / pagehide flush 與 safe import/export。
- Frontend：非阻斷保存錯誤與復原入口。
- Build：runtime allowlist 與 artifact audit。
- Done：round-trip / legacy regression 通過，正式素材低於 50 MiB 且無 prompt / metadata / 本機路徑。

### Slice 3：可重複交付

- Tooling：React types、strict baseline、依賴安全更新、單一 verify script。
- CI：typecheck、unit、build、artifact audit、desktop / mobile E2E 與失敗 artifacts。
- Done：完整 verify 通過，正式版本具有明確 no-go 與 rollback 路徑。

## Tech Baseline

- React 19 + TypeScript + Redux Toolkit + Vite，維持純前端架構。
- Pixi Adventure canvas 維持既有 actor resolver / foot anchor contract。
- LocalStorage 繼續使用現有 versioned envelope。
- Production assets 採 build-time manifest / allowlist；超過 50 MiB 或場景 request fan-out 門檻後才遷移 atlas / CDN。

## Risks and Fallbacks

- Manifest 漏檔：production preview smoke 失敗即回退到完整 frames allowlist，不刪來源。
- 使用者 dirty worktree 衝突：每個 slice 前後比較 tracked dirty files，不覆寫 monster rollout 檔案。
- 依賴升級回歸：逐 package 驗證；無法相容時鎖定已修補的最近 minor，不跨 major 強升。
- strict 債務超出單批：保留量化 baseline，只要求新改模組 clean，逐邊界擴大。

## Metrics

- Production static assets ≤ 50 MiB、files ≤ 12,000、禁入與本機路徑 0。
- 既有 unit tests、正式 E2E 與首次流程 smoke 全數通過。
- mobile 小地圖點擊成功率 100%，主要 HUD hit rectangles 無重疊。
- 快速離頁後重新載入仍保留最後一次持久化變更。
- CI 的 verify 與本機 verify 使用相同命令。
