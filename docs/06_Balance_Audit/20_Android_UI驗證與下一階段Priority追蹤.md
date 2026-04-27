# Android UI 驗證與下一階段 Priority 追蹤

## 1. 這份文件的用途

這份文件先做兩件事：

1. 凍結目前已辨識出的下一階段五條主線，避免和當前 UI 驗證工作混在一起。
2. 記錄目前 Android / mobile-first 畫面驗證的第一個焦點：`輪迴大殿 / 投胎轉世` 介面的可讀性與可操作性。

這不是新的 OpenSpec change；只是短期追蹤與驗證入口。

## 2. 當前 UI 驗證焦點

### 2.1 輪迴大殿

目前先優先驗證 `輪迴大殿`：

- 螢幕夠大時仍無法完整看到頂部內容，表示目前 layout 有 viewport / scroll container 設計問題
- 使用者想收斂成 mobile-first 的直向長條畫面，因此這裡不該再延續桌面雙欄寬版設計
- 桌面版應維持「手機長條殼」的閱讀方式，而不是撐成滿版 dashboard

### 2.2 驗證標準

`輪迴大殿` 接下來至少要符合：

- 頁面最上方永遠可達，不能再出現 scroll 到頂仍看不到標題的情況
- 內容用單欄主流程呈現，避免三欄 / 雙欄造成閱讀斷裂
- 手機版可自然上下滑動，不需要橫向捲動
- 桌面版維持置中的直向長條比例，而不是重新放大成 PC dashboard
- `Build Identity / 本命魂印 / 魂印加護 / 遺珍 / 靈根 / 投胎轉世 CTA` 都要能在同一條閱讀流程中被理解

## 3. 凍結中的五條下一階段 Priority

以下五條是前一輪整理後，確認應該接續的主線。這一輪先記錄，不立即開案。

### Priority 1. `expand-encounter-content-density-v3`

目標：

- 補中後期 encounter 數量、分支厚度、權重分布
- 強化 route-specific 事件差異，不只靠同一批 flavor text 輪播
- 讓事件系統真正成為內容密度來源，而不是只有結構存在

2026-04-26 執行狀態：

- 已開案並實作 `expand-encounter-content-density-v3`。
- coverage floor 已延伸到 `仙人 / 仙帝`。
- `仙人` 補凌霄劍宗 / 萬獸山莊 route material source，與既有縹緲仙宮 source 對齊。
- `仙帝` 補三宗 route-specific 可重複 encounter：`斬天帝劍盟 / 萬獸帝血獵 / 星座帝詔庭`。
- 高境界通用 encounter 已補 presentation / choice cue metadata，pending panel 可直接顯示類型、路線、收益與風險。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog；不需要 migration。

### Priority 2. `expand-sect-world-late-content-v3`

目標：

- 延長宗門 / 世界章節鏈
- 補更多 map-local NPC、milestone event 與後段職業分歧
- 提高中後期世界內容辨識度

### Priority 3. `update-workshop-route-source-specialization-v3`

目標：

- 補 route-specific 材料來源
- 擴高階 recipe family 與 specialization gating
- 讓 workshop loop 在後期不只是數值 sink，而是路線選擇的一部分

### Priority 4. `update-pixel-map-visual-qa-v3`

目標：

- 補 terrain/background 的 map coverage 與 visual QA
- 驗證更多地圖 theme、landmark 與 skeleton 生成結果
- 保持「只像素化地圖背景，不像素化玩家 / 角色 / 怪物 token」的方向

### Priority 5. `refactor-client-build-performance-budget`

目標：

- 收口目前 build chunk 警告
- 盤點前端 runtime / bundle budget
- 為 web / mobile 體驗建立更穩定的技術債清理入口

## 4. 建議的執行順序

若不考慮當前 UI 驗證插隊，下一輪主線建議順序如下：

1. `expand-encounter-content-density-v3`
2. `expand-sect-world-late-content-v3`
3. `update-workshop-route-source-specialization-v3`
4. `update-pixel-map-visual-qa-v3`
5. `refactor-client-build-performance-budget`

## 5. 目前這輪先做什麼

這輪不開新大主線，先聚焦：

1. 驗證 `輪迴大殿` 是否真的能在手機與桌面直向殼中完整瀏覽
2. 找出 Android / mobile-first 畫面有哪些元件還在沿用 desktop-first 寬版假設
3. 把需要補的 UI 問題整理成下一輪畫面修正清單

## 6. 本輪 shared UI foundation 收口記錄

Change id: `update-shared-ui-foundation-e2e-validation`

本輪已把第一批 shadcn-compatible shared controls 接入高風險互動 flow：

- `Modal / GamePanel` 已改由 shared `Dialog` primitive 承接 overlay、backdrop、focus 與 mobile sheet-like 呈現，並保留明確 close policy
- `Reincarnation Hall / Dashboard / IntroSequence / Inventory` 已收斂主操作、篩選、輸入、確認與危險操作到 shared `Button / Input / Tabs`
- `Workshop / Compendium / StatsPanel / FloatingDock / PendingEncounterPanel` 已收斂明顯的 tab、卡片選項與 panel switch 熱區
- `Sidebar / Adventure / ShopPanel / QuestModal` 已完成剩餘 raw control sweep，app source 不再直接宣告 lowercase native `button/input/select/textarea`
- 已新增穩定 selector 與 Playwright browser smoke，覆蓋 `輪迴大殿 / GameShell overlay / Inventory / pending encounter modal`
- `npm test` 已排除 Playwright e2e specs，避免 Vitest 誤載 `@playwright/test` 檔案

本輪仍維持：

- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog
- 不需要 migration；只調整 UI foundation、互動承接方式與 browser 驗證基線
- 不把玩家、怪物、NPC token 改成 pixel sprite，也不重做 `AdventureStage` 戰鬥邏輯
- native control guard 只限制 app source；`components/ui` primitive 本體仍集中持有必要 native element

驗證基線：

- `openspec validate update-shared-ui-foundation-e2e-validation --strict`
- `npm test -- tests/sharedUiNativeControls.test.ts`
- `npm test`
- `npm test -- components/game/ReincarnationFlow.test.tsx pages/Dashboard.reincarnation.test.tsx components/game/GameShell.test.tsx components/game/PendingEncounterPanel.test.tsx pages/Workshop.crafting.test.tsx store/actions/reincarnationActions.test.ts store/localStorage.test.ts`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e`
- `git diff --check`

Archive 記錄：

- `2026-04-26` 已以 `openspec archive update-shared-ui-foundation-e2e-validation --skip-specs --yes` 歸檔。
- 使用 `--skip-specs` 的理由：`client-interface` base spec 已吸收本輪正式行為，本次 archive 僅移動 completed change，不需要再次修改 base spec。

## 7. 圖鑑分類與瀏覽版面收口記錄

Change id: `update-compendium-taxonomy-and-layout`

本輪已把使用者回報的三個圖鑑資訊架構問題收斂：

- `神兵法寶` 不再使用會遮住 item card 的 sticky realm heading，第一張卡片在 desktop / mobile 都可直接讀取。
- `功法神通` 改為 `通用 / 劍修 / 體修 / 法修` 內層分類，並依境界分組顯示 formal core skills。
- `宗門傳承` 改為三宗 tabs；單一宗門頁面內分成 `宗門人物 / 傳承功法 / 章節線索`，避免一次展開三宗造成 mobile 長頁掃描成本。

本輪仍維持：

- 不新增 item / skill / quest / NPC 資料。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；這條 change 只調整圖鑑 layout、分類與 browser smoke coverage。

驗證基線：

- `openspec validate update-compendium-taxonomy-and-layout --strict`
- `npm test -- components/Compendium/CompendiumModal.test.tsx`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Archive 記錄：

- `2026-04-27` 已以 `openspec archive update-compendium-taxonomy-and-layout --skip-specs --yes` 歸檔。
- 使用 `--skip-specs` 的理由：`client-interface` base spec 已在實作 commit 吸收圖鑑分類與瀏覽可讀性 requirement，本次 archive 僅移動 completed change。

## 8. 物品經濟與戰鬥補給閉環收口記錄

Change id: `update-item-economy-combat-supplies`

本輪已收斂早期商店與補給品使用語意：

- `general_store_mortal` 已提供 `qi_pill / heal_pill`，並少量提供 `foundation_pill`。
- 新增中期補給資料 `greater_heal_pill` 與 `revitalizing_pill`，避免恢復品 catalog 只剩單一回春丹。
- `heal_hp / heal_mp / full_restore` 已抽成 `utils/consumableEffects.ts` runtime bridge；角色永久效果仍留在 `characterSlice.consumeItem`。
- Inventory 會在沒有對應 resource 或氣血已滿時阻擋恢復品，並顯示不可用原因。
- Adventure 即時戰鬥面板可使用背包恢復品回復目前可見的 `worldPlayerHp`。

本輪仍維持：

- 不新增 persisted combat resource。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration。
- `heal_mp` 尚無正式 MP runtime resource，因此只能顯示不可用原因，不會消耗道具。

Archive 記錄：

- `2026-04-27` 已以 `openspec archive update-item-economy-combat-supplies --skip-specs --yes` 歸檔。
- 使用 `--skip-specs` 的理由：`game-mechanics` 與 `client-interface` base specs 已在實作 commit 吸收補給閉環 requirement，本次 archive 僅移動 completed change。

## 9. 宗門與世界後段內容 v3 收口記錄

Change id: `expand-sect-world-late-content-v3`

本輪把三宗 route chapter 從 `無盡海 (150)` 往後推到 `劫雲荒原 (160)` 與 `接引仙殿 (170)`：

- 凌霄劍宗新增 `sect_sword_world_chapter_03`、`world_sword_tribulation_envoy`、`world_sword_immortal_witness` 與 `sword_world_immortal_sword_oath`。
- 萬獸山莊新增 `sect_beast_world_chapter_03`、`world_beast_tribulation_envoy`、`world_beast_immortal_witness` 與 `beast_world_immortal_blood_oath`。
- 縹緲仙宮新增 `sect_mystic_world_chapter_03`、`world_mystic_tribulation_envoy`、`world_mystic_immortal_witness` 與 `mystic_world_immortal_star_oath`。
- v3 encounter 會保留 routeLabel、categoryLabel、chainLabel、memoryCue、choice cue 與 route material source cue。
- completion / encounter chain 輸出 `sect:*:world-chapter-03` world memory tag，供後續 encounter、Workshop source 或輪迴 route perk 承接。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration。
- 不新增第二套 quest engine 或對話樹 runtime。

## 10. Workshop route source 與 specialization v3 收口記錄

Change id: `update-workshop-route-source-specialization-v3`

本輪把三宗 v3 world memory tag 回接到 Workshop UI 與規格真相：

- high-tier recipe card 會顯示 `route tag`、`v3 route source：sect:*:world-chapter-03` 與 `劫雲荒原 / 接引仙殿` world chapter cue。
- specialization panel 會顯示 leaf 對應的 `專精路線來源` 與品質 / 副收益 cue，讓 `星蓮鴻蒙冠火`、`萬獸生息`、`星鋼冠火` 不只像一般成本折扣。
- UI 仍保留原本可讀 sourceHint，不把 machine-readable `sect:*` tag 混進人讀材料說明的開頭。
- recipe material sink 維持原配方；specialization 可以影響靈石、熟練、品質或副收益 cue，但不跳過 `sword_path_starsteel / beast_path_bloodbone / mystic_path_starlotus`。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；v3 Workshop route source 只讀既有 recipe metadata、route material、`soul.worldMemoryTags` 與 Workshop mastery / specialization tree state。
- 完成後以獨立 archive commit 收口；若 base specs 已在 implementation commit 回寫，archive 使用 `--skip-specs`。
