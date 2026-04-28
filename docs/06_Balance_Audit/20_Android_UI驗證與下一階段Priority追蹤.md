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

## 11. Encounter route aftermath v3 收口記錄

Change id: `expand-encounter-route-aftermath-v3`

本輪目標是把三宗 v3 milestone 後的 `sect:*:world-chapter-03` world memory 接成 repeatable aftermath，而不是讓 `sword_world_immortal_sword_oath / beast_world_immortal_blood_oath / mystic_world_immortal_star_oath` 成為一次性終點：

- aftermath event 應讀取對應 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03`、`sect:mystic:world-chapter-03`，缺記憶時不進 selector。
- aftermath 不得是 `once_per_run`，需支撐 v3 章節後續密度。
- pending panel 需顯示 `routeLabel`、`categoryLabel`、`chainLabel`、`memoryCue` 與 choice cue tags，讓玩家能辨識穩定收益、材料來源或高風險收益。
- Workshop sink 仍只消耗既有 route material；aftermath 是 source cue，不新增 Workshop recipe 或第二套 source runtime。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；aftermath 只讀既有 `soul.worldMemoryTags`、resolved event state 與 encounter catalog metadata。

## 12. Reincarnation route memory hooks v3 收口記錄

Change id: `expand-route-memory-reincarnation-hooks-v3`

本輪把三宗 v3 world memory tag 回接到 Reincarnation Hall 的本命魂印卡片與 build preview 語意：

- `seal_sword_immortal_oath / 仙誓劍胎` 讀取 `sect:sword:world-chapter-03`，顯示凌霄劍宗仙誓的 route memory source、劍修 identity cue 與根骨 / 悟性收益。
- `seal_body_immortal_blood / 不滅血印` 讀取 `sect:beast:world-chapter-03`，顯示萬獸山莊帝血 route memory source、體修 identity cue 與體魄 / 福緣收益。
- `seal_mage_immortal_star / 仙宮星命` 讀取 `sect:mystic:world-chapter-03`，顯示縹緲仙宮星命 route memory source、法修 identity cue、神識 / 悟性收益與初始靈石。
- available seal card 會直接顯示 `route memory：sect:*:world-chapter-03`、identity cue 與預期收益。
- locked seal card 會顯示同一個 route source，並明確列出缺少的 `sect:*:world-chapter-03`。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；Reincarnation v3 route hooks 只讀既有 `soul.worldMemoryTags` 與 `rebirthConfig.selectedSealId`，invalid selected seal 仍沿用既有 planner sanitize。

## 13. Compendium source tracing v2 收口記錄

Change id: `update-compendium-source-tracing-v2`

本輪把已完成的圖鑑 taxonomy 接上來源追蹤層，目標不是新增資料，而是讓既有資料能回答「從哪裡來、用到哪裡去」：

- `神兵法寶` 的 item card 會把敵人掉落、商店、Workshop output / sink、encounter route cue 與 world memory cue 收斂到 `來源追蹤`。
- `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 需要顯示對應宗門、`sect:*:world-chapter-03`、v3 aftermath / encounter source 與 high-tier Workshop sink。
- `功法神通` 與 `宗門傳承` 的 skill card 除了 formal source tier，也要顯示技能秘卷來源 labels，避免只留下內部來源層級。
- `宗門傳承` 的單宗頁面需要補 route source summary，讓 route material、world memory、encounter / Workshop / Reincarnation hook 可被同一頁掃到。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；source tracing 只讀既有 `Enemy.drops`、`SHOPS`、`WORKSHOP_RECIPES`、encounter rewards / cues 與 skill manual metadata。

## 14. Pixel map visual QA v3 收口記錄

Change id: `update-pixel-map-visual-qa-v3`

本輪把已落地的正式 pixel terrain 推進到可回歸的 visual QA 摘要，而不是新增另一套 renderer：

- `getAdventureTerrainVisualQaReport` 會回傳 map/theme、paletteTheme、tileCount、semanticRoles、skeletonIds、motifKinds 與 forbidden actor-token 狀態。
- representative maps regression 覆蓋 `path / water / hazard / portalClearing / bossArena / poi` 與 `corridorEdges / waterBands / hazardVeins / portalThreshold / arenaRunes / poiPavers`。
- 仍沿用現有 Playwright smoke 驗證 desktop / mobile canvas 非黑、map modal 無水平溢出與正式 HUD / actor token 可讀性。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；visual QA 只讀 terrain tiles、map theme 與既有 Adventure runtime，不新增 actor sprite state 或 map visual state。

## 15. Map local content density v3 收口記錄

Change id: `expand-map-local-content-density-v3`

本輪把後期重點地圖從「有怪物與 world chapter NPC」補到有可讀的本地 clue：

- `劫雲荒原 (160)` 補 `劫雲巡候` 與 `雷爐辨材師`，分別說明通用渡劫雲脊、三宗 route 後段，以及 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 如何接回 Workshop。
- `接引仙殿 (170)` 補 `仙籍錄事` 與 `仙材案牘師`，把通用仙籍、宗門 route 分欄、帝劍 / 帝血 / 星詔材料案底與高階丹方 / 帝兵 sink 連起來。
- `歸墟裂界 (182)` 補 `歸墟界圖師`、三條宗門 route echo 與 `歸墟終盤爐師`，作為仙帝代表地圖的 local hook、route-sensitive hook 與終盤 Workshop material clue。
- 新增 `data/mapLocalContentDensity.test.ts` 驗證每張代表地圖至少有 local hook、route-sensitive hook、Workshop material clue，並檢查 questIds / giverId / submitNpcId 都對應正式 catalog。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；map-local v3 只擴充靜態 `NPC` / `Quest` / `MAPS` catalog，既有存檔會自然以未接取 quest 顯示新增內容。

## 16. Client build performance budget 收口記錄

Change id: `refactor-client-build-performance-budget`

本輪把長期存在的 Vite chunk size warning 收成可追蹤 budget，而不是把 warning 留在每次 build output：

- `vite.config.ts` 設定明確 `chunkSizeWarningLimit: 550`，目前最大正式 chunk `pixi` 約 `485.92 kB`，低於 budget。
- `pixi.js-legacy` 被分到 `pixi-preview`，避免 preview-only runtime 和正式 `pixi` chunk 混在同一個 budget 裡。
- `index.tsx` 不再靜態 import `AdventurePixelPrototypePreview`；pixel prototype preview 只在 query 開啟時透過 lazy import 載入。
- `tests/buildPerformanceBudget.test.ts` 驗證 Vite budget、Pixi manual chunk 分類與入口 lazy boundary。
- `npm run build` 仍保留正式 Adventure / GameShell lazy panels，但不再輸出 chunk size warning。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；build budget 與 lazy boundary 只影響編譯輸出和載入策略，不改玩家存檔。

## 17. Content authoring audit tools 收口記錄

Change id: `establish-content-authoring-audit-tools`

本輪建立集中式內容 authoring audit，作為後續 `expand-endgame-loop-v4` 前的資料防線：

- `data/contentAuthoringAudit.ts` 提供 catalog-wide helper，檢查 quest、encounter、shop、enemy drops、Workshop recipe 的 item reference 是否存在於正式 `ITEMS`。
- 同一個 helper 也檢查 map NPC `questIds`、quest `giverId`、`submitNpcId` 與 dialogue target 是否對得上正式 NPC / quest catalog。
- `auditRouteMaterialSourceCoverage` 針對 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 檢查 source、Workshop sink 與圖鑑 source tracing。
- 新增 `data/contentAuthoringAudit.test.ts`，讓內容擴量時 reference 斷線能直接在 unit test 被抓到。
- 本輪 audit 實際抓出 `m31_e1 / m32_e1` 掉落已退休且不存在的 `manual_s_f_passive`；已移除這兩個無效 drop，避免圖鑑與掉落流程指向不存在物品。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；authoring audit 是 deterministic test/helper，只讀現有 catalog。

## 18. Endgame loop v4 收口記錄

Change id: `expand-endgame-loop-v4`

本輪把 `仙帝` 端的 encounter、Workshop、輪迴與主動收束語意接成同一條可追蹤終盤 loop：

- 新增三宗 v4 終盤收束 encounter：`歸墟斬天終局 / 歸墟帝血終局 / 歸墟星詔終局`。
- v4 encounter 需要對應 `sect:*:world-chapter-03` 與已解過的仙帝 route event，完成後寫入 `sect:*:endgame-loop-v4` world memory tag。
- 新增 Workshop 終盤 convergence sink `歸墟三道帝冕`，同時消耗 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮`，並把三條 `endgame-loop-v4` route tag 與 sourceHint 顯示在 recipe / source tracing。
- 新增三個 v4 輪迴魂印：`斬天輪迴劍印 / 帝血輪迴骨印 / 星詔輪迴命盤`，以既有 `soul.worldMemoryTags` 解鎖，不新增第二套 unlock state。
- `主動坐化` 入口與 life review 會顯示 `本世收束 / 飛升/結局回顧 / 主動重開下一世`，讓玩家分辨主動完成本世與死亡懲罰式輪迴。
- `soulSlice` 的魂印選取改成讀 catalog lane，避免新增 v4 魂印時還要再硬編碼 id。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；v4 只新增 encounter / recipe / reincarnation catalog entry 與 UI derived copy，記憶沿用 `resolvedEventIds`、`soul.worldMemoryTags`、既有 inventory / Workshop state 與 rebirth config。

## 19. Compendium route browsing v4 收口記錄

Change id: `refactor-compendium-route-browsing-v4`

本輪把舊有圖鑑 taxonomy 與 source tracing 接上 `endgame-loop-v4` 後的宗門路線瀏覽需求：

- `神兵法寶` 增加非 sticky 的 tab summary header，明確標示依境界檢視正式物品、來源追蹤與 Workshop sink，避免 realm heading 在 scroll 時遮住第一張 item card。
- `功法神通` 保留 `通用 / 劍修 / 體修 / 法修` tabs，並新增當前職業功法數與境界分段摘要，讓 formal core skills 不只靠長列表掃描。
- `宗門傳承` 的單宗頁除了 v3 `sect:*:world-chapter-03` route material source，也顯示 v4 `sect:*:endgame-loop-v4` 終盤閉環 source，連到對應魂印與 `歸墟三道帝冕` 用途。
- Playwright smoke 已新增 desktop / mobile selector，覆蓋 item header、skill summary、sect v4 endgame source 與既有 no-overflow / no-cover checks。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；Compendium v4 只從既有 `ITEMS`、skill registry、sect config、source tracing helper、world memory tag 與 endgame catalog cue 推導 UI 摘要。

## 20. 補給經濟與 consumable runtime v4 收口記錄

Change id: `complete-supply-economy-and-consumables-v4`

本輪把已存在的商店補給與恢復品流程補成可被 regression 守住的 runtime contract：

- `data/shops.test.ts` 擴大為所有正式商店都必須非空，且每個 shop item id 都要存在於 `ITEMS`，實際補上 `sect_skill_sword` 等宗門藏經閣的正式基礎秘卷來源。
- `heal_hp / heal_mp / full_restore` helper 補齊 MP、雙資源 full restore、缺資源阻擋與已滿資源阻擋 regression。
- Inventory recovery consumable 必須同時有可恢復 resource 與 runtime recovery handler 才能服用；沒有 handler 時會顯示不可用原因，不會扣道具。
- Shop / Inventory 改用共用 consumable effect label，`breakthrough_chance` 在背包不再顯示空白效果列。
- `characterSlice.consumeItem` 仍只處理壽元、修為、屬性與技能學習等角色成長效果，`heal_hp / heal_mp / full_restore` 不會被算進角色消耗次數。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；補給 v4 只讀既有 `ITEMS`、`SHOPS`、inventory slots、character state 與當前可見 combat runtime resource。

## 21. 技能書商店與掉落 routing v4 收口記錄

Change id: `refine-shop-manual-drop-routing-v4`

本輪把 formal core 技能書的取得路徑從抽象 source tier 推進到可被圖鑑直接顯示的 concrete route：

- 新增 `data/skillManualRouting.ts`，從既有 skill metadata、`SHOPS` 與 `BESTIARY` 推導 `manualId -> routes`，不新增手寫圖鑑來源表。
- `data/skillManualRouting.test.ts` 驗證所有 formal core manual 都有至少一條具體 route，且 route label 來自正式商店、敵人掉落、宗門試煉或傳承殿。
- `Compendium` skill source tracing 現在除了原本的 `藏經閣 / 精英掉落 / 首領核心 / 古修傳承` 摘要，也會附上具體 route chips，例如 `藏經閣`、`宗門入門試煉`、具體敵人掉落或 `古修傳承殿`。
- 既有 `skillBookCoverage` 與 `skillPoolRegistry` regression 繼續確認 `transition / legacy` 技能不會混入 formal source pool。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；routing v4 只讀既有 `Skill` metadata、manual item id、商店 catalog 與敵人 drop catalog。

## 22. Adventure HUD layout 收口記錄

Change id: `update-adventure-hud-layout`

本輪把正式 Adventure 畫面的 RPG HUD 資訊層級收斂到主要常駐區塊：

- 左上 `GameHUD` 改為角色狀態卡，顯示暫代 avatar、角色名稱、境界、derived Lv、氣血、靈力、戰力、靈石、修為與壽元。
- HUD 的 HP / MP 讀取既有 `calculatePlayerStats`，戰力讀取既有 `calculatePlayerCombatPower` 與 `formatCombatPower`，不另寫 UI 專用估算。
- 底部 `FloatingDock` 補上 `功法` 與 `地圖` 入口；`功法` 開啟圖鑑功法 tab，`地圖` 透過 Adventure runtime 開啟地圖 modal。
- Adventure 大型 `戰鬥快捷列` 已弱化為右下小型 action wheel，保留普攻、主動術式、掛機與地圖操作，避免和底部 dock 長期競爭視野。
- Regression 覆蓋 `GameHUD` 角色卡、`FloatingDock` 主要入口，以及點擊鄰近怪物後 action wheel 可直接進入世界戰鬥。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；HUD 欄位只從既有 `character`、`inventory.equipmentStats`、Adventure UI state 與 combat power helper 推導，dock / map modal 狀態也只存在於目前 React runtime。

## 22. 道途面板修行布局 regression 收口記錄

Change id: direct bugfix `fix(dashboard): stabilize cultivation panel layout`

本輪修正使用者在 `道途` shared panel 回報的兩個 UI regression：

- `境界突破` 按鈕外層仍使用共用 Button 預設高度，內層卻是 120px 高，導致按鈕內容溢出並看起來跑到右側疊住其他控制。
- embedded Dashboard 左欄的 `修煉日誌` 容器被 flex 壓到只剩 2px 高，玩家只能看到標題，看不到「暫無消息」或後續日誌內容。
- Playwright regression 已補在 `character panel keeps dashboard panes and stat tooltip anchored`，同時檢查日誌 panel 高度、日誌內容可讀、突破按鈕高度與運功按鈕一致。
- 後續補修 `修行抉擇` grid：桌面改為四欄並取消 `境界突破` 跨欄，避免四個 action 變成 `3 + 1` 換行，導致 `本世收束 / 主動坐化` 在 panel 內被擠到不可見區域；同一個 Playwright regression 現在檢查四個 action 同列且第 4 個按鈕位於突破按鈕右側。
- 版面重新收斂後，嵌入式 Dashboard 左欄不再用 `h-full/min-h-0` 壓縮各 section，而是讓左欄內容自然高度後交給外層 scroll；四個 action 統一使用同一層 wrapper 與同一組 Button 尺寸，`境界突破` 不再使用額外內層 div 畫第二張卡片；Playwright 也檢查 action button 不得超出 section bottom、`修煉指南` 必須顯示完整說明文字。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；這是純 Dashboard layout / Playwright regression 修正。

## 23. 行囊側欄物品詳情 regression 收口記錄

Change id: direct bugfix `fix(inventory): compact embedded item details`

本輪修正使用者在 `行囊空間` shared panel 回報的物品詳情與當前裝備資訊呈現不完整問題：

- embedded Inventory 右側 `裝備與鑑別` 欄原本在 xl 桌面使用 `overflow-hidden`，一旦 `物品詳情` 與 `當前裝備` 合計高度超出欄位，就會直接截斷而不是讓玩家讀完資訊。
- `物品詳情` 在 embedded 模式仍使用 `flex-1 min-h-[300px]`，短裝備也會被放大成高卡片，底部 action 被 `mt-auto` 推到底，造成資訊區大量空白並壓縮下方裝備區。
- embedded `EquipSlot` 新增 compact 模式，行囊面板內使用較低 padding 與 icon 尺寸，確保六個裝備欄在桌面大面板可完整落在側欄內。
- Playwright regression 已補在 `game shell overlay exposes inventory shared controls`：選中 `鏽鐵劍` 後必須看見描述、基礎屬性、攻擊數值、裝備按鈕與完整 `當前裝備` section，並檢查詳情卡與裝備卡不互相覆蓋、不超出側欄底部。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；這是純 Inventory embedded layout / Playwright regression 修正。

## 24. Shared panel layout regression hardening v1 收口記錄

Change id: `harden-shared-panel-layout-regression-v1`

本輪把近期反覆出現的 shared panel layout 問題推進成正式 regression gate，而不是只靠單次人工截圖檢查：

- `tests/e2e/shared-ui-foundation.spec.ts` 新增 `expectHorizontallyWithinBox` 與 `expectReadableHeight` helper，讓 Playwright 能檢查 visible content 是否仍留在 panel 水平邊界內，以及關鍵資訊卡是否保有可讀高度。
- `道途` regression 現在同時檢查四個修行 action 同列、`境界突破` 與其他 action 高度一致、`修煉指南` 不覆蓋 `修煉日誌`、日誌內容可見且面板沒有水平溢出。
- `行囊空間` regression 現在檢查物品詳情與當前裝備側欄不互相覆蓋、不超出側欄底部，並要求詳情卡與裝備 section 保有可讀高度。
- `洞府百業` regression 現在檢查 specialization panel 與 recipe card 仍在 shared panel 水平邊界內，且 recipe card 需要看得到材料與產出資訊。
- `.gitignore` 已收斂整個 `.codex/`、`.playwright-mcp/`、`output/`，並清掉目前工作區中的本地工具產物與舊草稿。
- 後續 v5 backlog 已整理到 `docs/superpowers/plans/2026-04-28-shared-panel-hardening-and-v5-backlog.md`，不把大型內容擴張塞進這條 UI hardening change。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；這是純 shared panel Playwright regression、文件與本地產物 hygiene。

目前已跑驗證：

- `openspec validate harden-shared-panel-layout-regression-v1 --strict`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `openspec validate --all --strict`
- `git diff --check`

## 25. Endgame route v5 收口記錄

Change id: `expand-endgame-route-v5`

本輪把已完成的 `endgame-loop-v4` 推進到可重複的終盤後續，而不是讓三宗 route 在帝冕 convergence 後停止：

- 新增三宗 repeatable v5 aftermath encounter：`sword_emperor_v5_heaven_sunder_afterpath`、`beast_emperor_v5_worldblood_afterpath`、`mystic_emperor_v5_star_throne_afterpath`。
- v5 aftermath 讀取對應 `sect:*:endgame-loop-v4`，不使用 `once_per_run`，並保留 route、category、chain、memory、風險、收益與材料來源 cue。
- 新增三條 Workshop follow-up：`斬天帝冕重鑄`、`帝血冕骨鍛體`、`星詔冕杖重鍛`，都消耗 `emperor_crown` 與對應 route material，讓 `歸墟三道帝冕` 的產出能回到三條職業 build。
- `歸墟裂界 (182)` 新增 v5 route rumor NPC 與冕爐 NPC / quest，讓 map-local clue 明確說出 `sect:sword:endgame-loop-v4`、`sect:beast:endgame-loop-v4`、`sect:mystic:endgame-loop-v4` 與 Workshop / Reincarnation 連接。
- 新增三個 v5 本命魂印：`斬天 v5 劍冕`、`帝血 v5 骨冕`、`星詔 v5 命冕`，可用與鎖定卡片都顯示 route memory、identity cue、heirloom hint、預期收益與鎖定原因。
- `auditV5EndgameRouteCoverage` 會檢查每條 route 是否同時有 repeatable aftermath、帝冕 Workshop follow-up、map-local clue 與輪迴魂印。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；v5 只新增 catalog data、derived UI copy 與 deterministic authoring audit。

驗證基線：

- `openspec validate expand-endgame-route-v5 --strict`
- `npm test -- data/encounters.test.ts data/workshopRecipes.test.ts data/mapLocalContentDensity.test.ts components/game/ReincarnationFlow.test.tsx data/contentAuthoringAudit.test.ts`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `openspec validate --all --strict`
- `git diff --check`

## 26. 後續七線與 HUD / 任務追蹤規劃入口

本輪未開新 OpenSpec change，先把後續規劃拆成兩份正式文件，避免下一輪又從聊天記憶重建 scope：

- `docs/superpowers/specs/2026-04-28-seven-track-next-scope-design.md`
  - 記錄七條後續主線：核心屬性實裝、正式 MP / 靈力 runtime、突破災劫、NPC 好感與商店互動、endgame route density v6、Workshop endgame specialization v6、endgame map local density v6。
  - 每條都列出建議 change id、範圍、驗證重點與是否需要 persistence。
- `docs/superpowers/specs/2026-04-28-adventure-hud-quest-tracker-design.md`
  - 記錄主畫面 HUD 調整方向：左上角色狀態卡、戰力公式、左側任務追蹤、右上小地圖、底部功能 dock、戰鬥快捷列弱化、怪物圖鑑資訊擴充。
  - 建議拆成 `update-adventure-hud-layout`、`add-quest-tracker-hud`、`add-combat-power-and-enemy-intel`、`add-spirit-power-runtime` 四條 OpenSpec change。

建議下一步：

1. 先開 `add-combat-power-and-enemy-intel`，因為角色 HUD、怪物目標卡與圖鑑都需要同一套戰力與 enemy intel derived data。
2. 再開 `update-adventure-hud-layout`，調整左上角色狀態、右上小地圖與底部 dock。
3. 再開 `add-quest-tracker-hud`，把任務追蹤欄接上左側資訊架構。
4. 最後開 `add-spirit-power-runtime`，補正式 MP runtime、技能消耗與補靈丹閉環。

## 27. 戰力估算與妖獸情報 v1 實作記錄

Change id: `add-combat-power-and-enemy-intel`

本輪先把 HUD / 任務追蹤前置所需的 derived 戰力與妖獸情報資料源落地：

- 新增 `utils/combatPower.ts`，從既有 `calculatePlayerStats` 產出的 HP、MP、攻擊、防禦、速度、暴擊、閃避等資料推導玩家戰力；妖獸戰力則從 HP、攻擊、防禦、境界、小境界、rank 與 special attack 推導。
- `getCharacterDerivedLevel()` 以 `majorRealm * 10 + minorRealm + 1` 推導顯示等級，作為後續左上角色狀態卡資料來源，不新增角色 level 欄位。
- `萬界圖鑑 / 山川妖獸` 的妖獸卡新增戰力、氣血、攻擊、防禦、元素、AI 風格、弱點、抗性與特殊攻擊資訊，並保留既有可能掉落區塊。
- Adventure 選取妖獸目標卡新增戰力、攻防、AI、弱點 / 抗性與特殊攻擊摘要，讓玩家在接戰前可判讀風險。
- `utils/combatPower.test.ts` 驗證角色屬性提升、妖獸 rank、小境界、特殊攻擊與 derived level；`CompendiumModal` regression 驗證圖鑑妖獸情報不再只顯示境界與掉落。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；戰力與妖獸情報全部由既有 character stats、enemy catalog、map catalog 與 runtime target template 推導，不寫入存檔。

## 28. 下一批八線 gameplay / HUD v6 實作收口記錄

Change ids:

- `add-quest-tracker-hud`
- `implement-core-attribute-effects`
- `add-spirit-power-runtime`
- `expand-breakthrough-tribulation-system`
- `add-npc-affinity-and-shop-discounts`
- `expand-endgame-route-density-v6`
- `expand-workshop-endgame-specialization-v6`
- `expand-endgame-map-local-density-v6`

本輪把第 26 節拆出的八條後續線一次開案並落地：

- Adventure 主畫面新增 `QuestTrackerHUD`，由 `utils/questTracker.ts` 從既有 `quest.activeQuests` 與 `QUESTS` 推導任務排序、類型、可回報狀態與進度文字；desktop 顯示左側任務追蹤，empty state 不新增 pin / tracked preference。
- 核心屬性新增 `utils/attributeEffects.ts`，讓悟性、福緣、魅力提供可讀 derived gameplay effect；`calculatePlayerStats` 的突破、掉落、修煉加成改讀同一套 helper，`StatsPanel` 也顯示對應說明。
- Adventure 世界戰鬥新增 `worldPlayerMp` runtime；補給 helper 會把 `heal_mp / full_restore` 接到可見 MP，主動術式會檢查並消耗 MP，不足時顯示阻擋原因。
- Dashboard 突破區新增 `utils/breakthroughPreview.ts`，顯示成功率、天劫 / 心魔風險與準備提示；第一版不新增持續性傷勢或心魔 state。
- 商店新增 deterministic NPC 態度與折扣：`utils/npcAffinity.ts` 從魅力、職業 / 宗門身份與完成任務推導態度、折扣與來源，`ShopPanel` 顯示折扣前後價格與來源文字。
- 終盤 route density v6 新增三宗 repeatable aftermath：`sword_emperor_v6_heaven_sunder_echo`、`beast_emperor_v6_worldblood_echo`、`mystic_emperor_v6_star_throne_echo`，都讀取對應 `sect:*:endgame-loop-v4` 並保留 route / chain / reward cue。
- Workshop 終盤專精 v6 新增三個 leaf：`smithing_v6_heaven_sunder_edge`、`smithing_v6_worldblood_body`、`alchemy_v6_star_throne_lotus`；只影響熟練、品質與副產物 cue，不跳過核心 route material。
- 歸墟裂界新增 v6 local NPC / dialogue-only quests：`local_guixu_v6_afterpath_broker` 與 `local_guixu_v6_reincarnation_scribe`，把 v6 route rumor、Workshop leaf 與 Reincarnation clue 接回同一組 route memory。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；新增內容為 static catalog、derived helper、Adventure runtime resource 與 deterministic UI projection。`worldPlayerMp` 不寫入存檔，NPC affinity / quest tracker / breakthrough preview 也只從既有 state 推導。

目前已跑驗證：

- `openspec validate <8 changes> --strict`
- `npm test`
- `npx tsc --noEmit`
- `git diff --check`

## 29. Post-v6 規劃狀態收口

第 26 節的兩份規劃文件已作為歷史設計輸入保留，不再視為 active backlog：

- `docs/superpowers/specs/2026-04-28-seven-track-next-scope-design.md`
- `docs/superpowers/specs/2026-04-28-adventure-hud-quest-tracker-design.md`

目前狀態：

- `add-combat-power-and-enemy-intel` 已完成並 archive。
- `update-adventure-hud-layout` 已完成並 archive。
- 第 28 節列出的八條 gameplay / HUD v6 change 已完成並 archive。
- `openspec list` 顯示沒有 active changes。

新的後續規劃改以 `docs/superpowers/specs/2026-04-28-post-v6-next-wave-design.md` 為準。下一輪不建議一次打開所有大型 change；應先從低 persistence 風險、可快速驗證的主畫面 / catalog 線開始，再進入需要 migration 的長期狀態系統。

## 30. Mobile 任務追蹤收合收口記錄

Change id: `update-mobile-quest-tracker-collapse`

本輪把已存在的 Adventure 任務追蹤補齊 mobile viewport 行為：

- `QuestTrackerHUD` 新增 mobile 固定小入口，顯示目前追蹤任務數量。
- 點擊入口會展開 runtime-only 任務追蹤 panel，顯示 active quest 類型、標題、可回報狀態與進度文字。
- Desktop `quest-tracker-hud` 維持左側常駐顯示，不改原有 HUD 佈局。
- `FloatingDock` 補上穩定 `floating-dock` selector，讓 Playwright 能檢查 mobile 任務 panel 不覆蓋底部 dock。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；mobile 展開 / 收合只存在目前 React runtime。

目前已跑驗證：

- `openspec validate update-mobile-quest-tracker-collapse --strict`
- `npm test -- components/game/QuestTrackerHUD.test.tsx`
- `npx tsc --noEmit`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium -g "mobile adventure quest tracker"`
- `npm run build`
- `git diff --check`

## 31. Reincarnation v6 魂印收口記錄

Change id: `add-reincarnation-v6-soul-seals`

本輪把 v6 route / Workshop / map clue 正式接回輪迴 build loop：

- 新增三宗 v6 本命魂印：`seal_sword_endgame_v6`、`seal_body_endgame_v6`、`seal_mage_endgame_v6`。
- 三個 v6 魂印都讀取既有 `sect:*:endgame-loop-v4` world memory，不新增新的 memory tag 或 resolved content shape。
- Reincarnation UI 透過既有 soul seal card 自動顯示 v6 名稱、route memory source、identity cue、heirloom hint 與預期收益。
- `auditV6EndgameRouteCoverage` 擴充為檢查 v6 encounter、map clue、Workshop specialization 與 Reincarnation seal 是否同時存在。

本輪仍維持：

- 不新增 persisted schema。
- 不變更 LocalStorage schema、hydrate shape 或 persisted catalog。
- 不需要 migration；v6 魂印沿用既有 `ReincarnationSoulSeal` catalog shape 與 `soul.worldMemoryTags` 解鎖機制。

目前已跑驗證：

- `openspec validate add-reincarnation-v6-soul-seals --strict`
- `npm test -- utils/reincarnation.test.ts components/game/ReincarnationFlow.test.tsx data/contentAuthoringAudit.test.ts`
- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
