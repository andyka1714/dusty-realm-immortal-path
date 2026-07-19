# Design: 正式版客戶端基礎與交付邊界

## Context

本專案是純前端 React / Pixi 單機遊戲，runtime 以 LocalStorage 保存進度，Vite 目前會把整個 `public` 複製到 `dist`。盤點結果如下：

- `public/assets`：約 `569 MiB`、25,000 個以上檔案。
- `public/assets/generated/characters/monsters`：約 `478 MiB`。
- runtime frame PNG：10,892 個、約 `29.22 MiB`；其中怪物 frames 約 `26.63 MiB`。
- raw、sheet、GIF、prompt、metadata 等非 runtime 命名檔：至少 3,712 個、約 `443.53 MiB`。
- 正式 runtime 會逐 frame URL 載入怪物 movement / combat；生成用 sheet、preview、prompt 與 pipeline metadata 不參與遊玩。

因此第一階段的首要問題不是圖片壓縮演算法，而是「來源素材」與「正式可交付素材」沒有邊界。

## Goals

- 把 production artifact 從素材工作區分離，公開包只包含遊戲真的會請求的內容。
- 修正玩家可感知的 mobile 點擊與存檔可靠性問題。
- 讓測試、型別與依賴安全狀態能在 CI 中真實反映，而不是只靠本機人工判斷。
- 所有改動維持畫風中立，讓後續像素、HD 2D 或紙雕方向可在同一 runtime contract 上比較。

## Non-Goals

- 不在本 change 內重畫角色、怪物、地圖或 UI。
- 不刪除、搬移或覆寫 `public/assets` 內的生成來源；只改 production build 的複製邊界。
- 不改 `add-actor-visual-scale-and-monster-sprites` 的四方向與 body type 規格。
- 不一次清償所有 strict TypeScript 歷史錯誤；先建立可量測、不可倒退的邊界。
- 不新增後端、帳號同步或雲端存檔。

## Decision 1: Production Asset Delivery

### 評分權重

交付速度 25%、runtime 成本 25%、營運複雜度 15%、團隊熟悉度 10%、生態成熟度 10%、scale readiness 10%、vendor lock-in 5%。各項 1–5 分。

| 方案 | 交付 | Runtime | 營運 | 熟悉 | 生態 | Scale | Lock-in | 加權分 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A. 維持 `public` 全量複製 | 5 | 1 | 5 | 5 | 4 | 1 | 5 | 3.50 |
| B. Build-time manifest / allowlist，依區域延遲載入 | 4 | 4 | 3 | 4 | 4 | 4 | 5 | **3.90** |
| C. 立即導入 CDN、content-addressed atlas 與遠端版本管理 | 2 | 5 | 1 | 2 | 5 | 5 | 3 | 3.25 |

### Baseline

採用 B：來源素材仍留在現有工作區，production build 由 runtime asset manifest 明確複製 allowlist。現有 `/assets/.../frames/*.png` URL contract 先保持不變，以降低角色／怪物 active change 的衝突。

正式包必須排除：

- `pipeline-meta.json`
- prompt / generation notes / TXT
- preview GIF
- raw / background-keyed sheet
- 未被 runtime registry 解析的透明 sheet 或重複檔
- 含 `/Users/`、`/tmp/` 或其他本機絕對路徑的內容

第一階段 budget：

- production static assets 總量上限 `50 MiB`
- production asset 檔案數上限 `12,000`
- 禁入格式／路徑與 duplicate-content audit 必須為零例外；若確有 runtime 共用內容，必須以單一 canonical path 引用
- JS chunk 仍沿用既有分包並新增實際輸出大小 gate，不以 `chunkSizeWarningLimit` 設定值假裝通過

### Migration Trigger

出現任一條件時進入 atlas / bundle 第二階段：

- production runtime asset 超過 `50 MiB`
- 單一地圖首次進入需請求超過 80 個 sprite frame 檔
- 中階手機在 4G 模擬下地圖可互動時間超過 3 秒
- 平均場景切換因圖片 decode / request fan-out 超過 500ms

若 atlas 後仍超過 `150 MiB` 或需要獨立內容更新，再評估方案 C；屆時以 content hash、版本 manifest、cache invalidation 與 offline fallback 為必要條件。

## Decision 2: TypeScript Strict Migration

先安裝對應 React / DOM 型別，使 JSX 不再被隱式 `any` 淹沒；接著建立獨立 strict baseline：

1. 新增程式與本 change 修改的模組必須 strict clean、不得新增 explicit `any`。
2. 以機器可重複的 audit 保存歷史錯誤基準，CI 不允許數量增加。
3. 依 store / persistence、asset registry、Adventure runtime、UI panels 順序擴大 strict include。
4. 當 strict audit 歸零後，把主 `tsconfig` 切到 `strict: true` 並移除 baseline 例外。

不採用「一次打開 strict 後大量 `@ts-ignore`」；那會把真實債務改成永久盲點。

## Decision 3: Save Durability

保存器維持現有 versioned envelope，不改 schema：

- state 更新後使用 trailing timer，保證最後一次變更能在節流窗結束時落盤。
- `pagehide` 與 `visibilitychange: hidden` 觸發同步 flush。
- quota / serialization 失敗不得只寫 console；UI 顯示可理解、可重試的非阻斷提示。
- 匯出功能直接下載或複製現有 versioned envelope；匯入前必須走既有 migrate / sanitize，不允許直接 dispatch 未驗證 JSON。

由於 envelope shape 不變，不需要 migration；需要 round-trip、legacy load 與 page-exit flush regression。

## Decision 4: Mobile HUD Interaction Contract

HUD 視覺可超出內容盒，但不應以整張透明容器攔截地圖：

- 非互動 HUD wrapper 使用 `pointer-events: none`。
- 真正按鈕／可展開區域才恢復 `pointer-events: auto`。
- mobile 角色卡、任務入口、小地圖、action wheel 與底部 dock 必須有不重疊 hit rectangles。
- 主要 touch control 以至少 44×44 CSS px 為目標；若視覺 icon 較小，擴大透明 hit area而不是放大圖示。
- E2E 以可點擊結果與 bounding rectangles 驗證，不依賴脆弱的精確座標或舊文案。

## Decision 5: Verification Pipeline

單一 `npm run verify` 或等效 CI 依序執行：

1. 一般 typecheck 與 strict no-regression audit。
2. unit tests。
3. production build。
4. artifact allowlist / size / duplicate / local-path audit。
5. desktop 與 mobile 的 Playwright 關鍵流程。

CI 必須上傳 E2E failure screenshot / trace 與 build audit summary，方便判斷是產品回歸或測試期待過時。

## Risks and Mitigations

- **Manifest 漏檔**：resolver completeness test 與 production preview smoke 必須在刪減前後都通過；缺圖仍保留 token fallback。
- **使用者素材工作被干擾**：不移動、不刪除來源，只控制 `dist`；實作前後比較既有 dirty files。
- **依賴升級造成行為差異**：只升級到相容安全版本，分 package 驗證 typecheck / unit / E2E，不混入 UI 重構。
- **退出事件在瀏覽器差異**：以 `pagehide` 為主、`visibilitychange` 為輔，不依賴非同步 unload 工作。
- **50 MiB budget 隨內容成長失效**：超標不是直接放寬數字，而是觸發 atlas / map bundle 決策。

## 10x Checkpoint

當怪物數、地圖數或 playable actor 量成長到目前 10 倍時，維持資料驅動 registry，但將交付層切為：

- map / biome 分包 atlas
- content-hashed manifest
- worker-based decode / prefetch queue
- 可選 CDN 與本機 fallback

遊戲邏輯、body type、foot anchor 與 sprite resolver contract 不需要因此重寫。
