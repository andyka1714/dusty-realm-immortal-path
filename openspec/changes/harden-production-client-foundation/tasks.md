## 1. 保護現況與建立基準

- [x] 1.1 記錄目前 tracked dirty files 與 monster asset 未追蹤範圍，實作過程不得清理、覆寫或 stage 使用者工作。
- [x] 1.2 保存 typecheck、unit、E2E、production build、artifact 大小與檔案數基準。
- [x] 1.3 確認本 change 不修改 LocalStorage schema，記錄不需要 migration / hydration sanitize 的理由。

## 2. Production Asset 邊界

- [x] 2.1 建立由 runtime asset registry 推導或驗證的 production asset manifest。
- [x] 2.2 調整 Vite production build，只複製 allowlist 內容；dev 仍可讀取完整生成工作區。
- [x] 2.3 加入禁入 raw、sheet、GIF、prompt、metadata、本機絕對路徑與 duplicate-content audit。
- [x] 2.4 加入 `50 MiB`、12,000 files 與實際 JS chunk 大小 gate，輸出可讀 audit summary。
- [x] 2.5 驗證 player、NPC、代表性 humanoid / quadruped / boss 怪物的 movement、combat 與 fallback 在 production preview 可載入。

## 3. Mobile HUD 與 E2E 契約

- [x] 3.1 修正 GameHUD 非互動 wrapper 攔截右上小地圖的 pointer hit area。
- [x] 3.2 加入 mobile 角色卡、任務入口、小地圖、action wheel、dock 的 bounding rectangle 與實際點擊 regression。
- [x] 3.3 更新圖鑑 item / equipment 分類、任務多目標進度與 NPC 近距離互動的 E2E 正式期待。
- [x] 3.4 修正裝飾或隱藏 tooltip 造成的 horizontal overflow 假陽性，保留真正 overflow 的偵測能力。

## 4. 型別、依賴與正式 HTML

- [x] 4.1 補齊 React / React DOM 型別套件，重新量測 strict error baseline。
- [x] 4.2 建立 strict no-regression gate，要求本 change 新增或修改的程式 strict clean 且不得新增 explicit `any`。
- [x] 4.3 移除 Tailwind Play CDN，確認 production CSS 只使用編譯產物。
- [x] 4.4 將 Vite、Vitest、Rollup 與受影響 transitive dependency 升級至相容安全版本，保留 lockfile 可重現性。
- [x] 4.5 將 Pixi 舊式 `interactive` hit area 改為目前支援的 event mode，清除 production console deprecation。

## 5. 存檔可靠性與復原

- [x] 5.1 將 leading-only throttle 改為含 trailing flush 的保存排程。
- [x] 5.2 在 `pagehide` 與 hidden visibility 事件同步 flush 最新 versioned envelope。
- [x] 5.3 為 quota / serialization failure 提供可見、非阻斷且可重試的錯誤回饋。
- [x] 5.4 提供既有 versioned envelope 的匯出與安全匯入入口；匯入必須通過 migrate / sanitize。
- [x] 5.5 加入 trailing、page-exit、round-trip、legacy import 與非法 JSON regression，證明不需要 schema migration。

## 6. CI 與驗證

- [x] 6.1 建立單一 verify script 與 CI workflow，涵蓋 typecheck、strict baseline、unit、build、artifact audit、desktop / mobile E2E。
- [x] 6.2 CI 失敗時保留 Playwright screenshots / traces 與 build audit summary。
- [x] 6.3 執行完整 verify、`git diff --check` 與 `openspec validate harden-production-client-foundation --strict`。
- [x] 6.4 更新 tasks、validation / tracking 記錄；確認 base specs 在 archive 前已吸收正式行為。

## 7. 後續視覺決策交接

- [x] 7.1 完成 desktop / mobile Adventure、主要 panel、戰鬥與地圖 flow 的當次 screenshots 稽核。
- [x] 7.2 另案比較像素、HD 2D 與柔和紙雕三條美術管線，產出角色／四足怪／地圖／UI 的一致性決策與 migration trigger。
- [x] 7.3 未經視覺方向核准，不把新畫風批量套用到既有 265 隻怪物。
