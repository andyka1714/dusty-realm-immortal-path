# Dusty Realm Long Range Roadmap Design

## 背景

目前 `塵寰仙途` 的核心 loop 已不再停留於基礎系統缺口：

- Encounter 已具備 pending choice、route cue、chain、resolved gating 與 world memory tag。
- 三宗內容已從中期、後段、v2 route chapter 延伸到 v3 `渡劫 -> 仙人` 節點。
- Workshop 已具備高階 recipe、route material sink、mastery、specialization 與補給閉環。
- Reincarnation 已具備 build identity、soul seal、heirloom constraint 與 world memory 讀取能力。
- Pixel terrain 已進正式 `AdventureStage`，但玩家、NPC、怪物仍維持文字 token。
- OpenSpec base specs、archive 流程與 release gate 已成為正式收口要求。

因此下一階段不應再重做 foundation，而應把已完成的 route memory、material source、Workshop sink、Reincarnation build 與地圖 production language 串成更長的內容 loop。

## 目標

1. 把三宗 v3 後段章節產生的 `sect:*:world-chapter-03` 記憶接到 Workshop、Encounter aftermath 與 Reincarnation。
2. 讓圖鑑、地圖與 Workshop 能清楚說明 route-specific material 從哪裡來、用到哪裡去。
3. 把 pixel terrain 從可用 prototype 推進到可擴地圖的 production 規格。
4. 在內容主線穩定後，再處理 bundle budget 與資料 authoring audit。

## 非目標

- 不重做 quest engine 或 dialogue tree runtime。
- 不把玩家、NPC、怪物改成 pixel sprite。
- 不重做 Workshop foundation、Encounter selector foundation 或 Reincarnation foundation。
- 不在每條內容線都新增 persisted schema；能從既有 `worldMemoryTags`、resolved events、mastery、specialization 推導時，優先不改存檔形狀。

## 推薦執行順序

### 1. `update-workshop-route-source-specialization-v3`

目的：

- 把三宗 v3 world chapter 的成果接到 Workshop 深層 recipe、source hint 與 specialization unlock。

範圍：

- 讓 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03`、`sect:mystic:world-chapter-03` 成為 high-tier recipe、source hint 或 specialization unlock 的正式條件之一。
- 補三條宗門 / 職業 recipe branch：
  - 凌霄劍宗：帝劍系重鍛或劍星鋼消耗。
  - 萬獸山莊：帝血體魄丹或血骨殘材消耗。
  - 縹緲仙宮：星詔魂蓮丹或星魂蓮消耗。
- 讓 specialization 不只影響成本，也能影響副收益、品質提示或 unlock cue。
- 優先不新增 persisted schema，從既有 `soul.worldMemoryTags`、`masteryByDiscipline`、`specialization` 推導。

驗證重點：

- `data/workshopRecipes.test.ts`
- `store/actions/workshopActions.test.ts`
- `pages/Workshop.crafting.test.tsx`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `openspec validate --all --strict`

### 2. `expand-encounter-route-aftermath-v3`

目的：

- 讓三宗 v3 milestone encounter 後仍有可延續的 route aftermath，而不是章節完成後內容再次斷線。

範圍：

- 每宗新增 2 到 3 個 aftermath encounter：
  - 穩定收益型。
  - 高風險高收益型。
  - Workshop material source 型。
- 使用既有 `requiredWorldMemoryTags`、`requiredResolvedEventIds`、`repeatPolicy`、chain metadata 與 presentation cue。
- Pending encounter panel 必須能顯示 routeLabel、categoryLabel、choice cue、風險、收益與材料來源。

非範圍：

- 不新增第二套 encounter engine。
- 不新增新的 persisted encounter state。

驗證重點：

- `data/encounters.test.ts`
- `store/actions/encounterActions.test.ts`
- `components/game/PendingEncounterPanel.test.tsx`
- Playwright pending encounter smoke。

### 3. `expand-route-memory-reincarnation-hooks-v3`

目的：

- 讓宗門世界章節成果影響下一世 build，而不是只停在本輪 Workshop 或 encounter。

範圍：

- 讀取 `sect:*:world-chapter-03` 解鎖更高階 route soul seal、build identity cue 或 reincarnation preview cue。
- Reincarnation Hall 顯示前世宗門世界記憶對 build identity 的影響。
- Heirloom compatibility 仍要阻擋錯職業主武器與不相符手札。

Persisted state 判斷：

- 優先不新增 `soul` schema；只讀既有 `worldMemoryTags`。
- 若需要新增 soul field，該 OpenSpec 必須升級為 migration-bearing change，補 persisted migration、hydrate sanitize 與 regression。

驗證重點：

- `store/persistedStateMigration.test.ts`
- `store/slices/soulSlice.test.ts`
- `components/game/ReincarnationFlow.test.tsx`
- `pages/Dashboard.reincarnation.test.tsx`

### 4. `update-compendium-source-tracing-v2`

目的：

- 讓圖鑑不只是分類清楚，也能回答「這個物品、材料、功法從哪裡來」。

範圍：

- 物品、材料、功法卡片顯示 source：商店、Boss、精英、Workshop、宗門章節、encounter。
- Route-specific material 顯示對應宗門、world chapter、encounter chain 或 Workshop sink。
- 優先從既有 catalog、drop table、quest reward、encounter reward、recipe sourceHint 推導。

非範圍：

- 不新增新物品或新技能。
- 不改圖鑑分類架構；只補 source tracing layer。

驗證重點：

- `components/Compendium/CompendiumModal.test.tsx`
- `tests/e2e/shared-ui-foundation.spec.ts`
- `npm run typecheck`
- `npm run build`

### 5. `update-pixel-map-visual-qa-v3`

目的：

- 把 pixel terrain 從已接入正式 stage 推進到可擴地圖的 production visual language。

範圍：

- 為 realm / region family 補 biome palette 規格。
- 補 path、water、hazard、resource node、portal threshold、boss arena 的 tile language。
- 加強 mobile / desktop pixel scale、HUD 可讀性、黑畫面防守與 actor-token guard。
- 持續維持玩家、NPC、怪物、portal marker、HUD、combat overlay 的既有文字 token / marker 呈現。

非範圍：

- 不做 3D。
- 不做全角色 pixel sprite。
- 不重寫 `AdventureStage` 戰鬥邏輯。

驗證重點：

- `utils/adventureTerrainPixelization.test.ts`
- `components/adventure/AdventurePixelStagePrototype.test.tsx`
- `tests/e2e/shared-ui-foundation.spec.ts`
- Playwright desktop / mobile screenshot smoke。

### 6. `expand-map-local-content-density-v3`

目的：

- 讓後期地圖不只提供怪物與 Boss，也提供 local NPC、rumor、region hook 與 route material clue。

範圍：

- 優先覆蓋 `劫雲荒原 (160)`、`接引仙殿 (170)` 與後續終盤地圖。
- 每張重點地圖至少提供：
  - 1 個 route-agnostic local hook。
  - 1 個 profession 或 sect sensitive hook。
  - 1 個 Workshop material clue。
- 與 encounter、quest、compendium source cue 對齊。

非範圍：

- 不新增第二套地圖事件 runtime。
- 不要求每張舊地圖一次補滿。

驗證重點：

- `data/maps.ts` / `data/npcs.ts` / `data/quests.ts` 資料 regression。
- `data/sectWorldStoryBranch.test.ts` 或新增 map-local density test。
- Playwright map modal smoke。

### 7. `refactor-client-build-performance-budget`

目的：

- 收口目前 `npm run build` 的 chunk size warning，建立可追蹤的前端 bundle budget。

範圍：

- 盤點 `Adventure`、`pixi`、`Dashboard`、`Compendium`、`Workshop` 等 chunk 組成。
- 對重型 modal、pixi runtime 或低頻功能做 lazy load / manual chunk。
- 建立 build budget 文件與驗證基線。

非範圍：

- 不改玩法邏輯。
- 不以效能名義重構 unrelated UI。

驗證重點：

- `npm run build`
- `npm run typecheck`
- Playwright smoke 確認 lazy route / modal 可正常載入。

### 8. `establish-content-authoring-audit-tools`

目的：

- 避免後續內容擴量時靠人工記憶檢查資料一致性。

範圍：

- 建立 content audit helper 或測試，檢查：
  - quest reward item 是否存在。
  - encounter reward item 是否存在。
  - route material 是否同時有 source 與 sink。
  - map NPC questIds 是否有效。
  - skill / item / recipe source 是否能被圖鑑追蹤。
- 優先做成 test / script，不新增 runtime UI。

驗證重點：

- 新增 content audit test。
- `npm test`
- `npm run typecheck`

### 9. `expand-endgame-loop-v4`

目的：

- 把仙人 / 仙帝後的長期 loop 推向更完整的終盤結構。

範圍：

- 仙帝 route aftermath。
- 更高階 Workshop sink。
- 輪迴 route memory reward。
- 終盤 encounter chain。
- 初步整理「飛升 / 結局 / 主動重開」的產品語意。

依賴：

- 應等待前三條 route memory / Workshop / encounter 主線至少完成一輪。
- 應等待 content audit tools 或 source tracing 至少部分落地，避免終盤內容來源失控。

## 依賴關係

```text
expand-sect-world-late-content-v3
  -> update-workshop-route-source-specialization-v3
  -> expand-encounter-route-aftermath-v3
  -> expand-route-memory-reincarnation-hooks-v3
  -> expand-endgame-loop-v4

update-compendium-taxonomy-and-layout
  -> update-compendium-source-tracing-v2
  -> establish-content-authoring-audit-tools

update-pixel-map-production-v2
  -> update-pixel-map-visual-qa-v3
  -> expand-map-local-content-density-v3

all content expansion
  -> refactor-client-build-performance-budget
```

## OpenSpec 開案規則

每條主線開案時必須：

1. 使用繁體中文撰寫 proposal、design、tasks 與 spec delta。
2. 明確標示 `Schema change? yes / no`。
3. 若不需要 migration，必須寫清楚理由。
4. 若 base specs 在 implementation commit 已回寫，archive 時使用 `--skip-specs` 並在 tracking docs 記錄理由。
5. 每條 change 完成後都要獨立 commit，再 archive 並以第二個 commit 收口 archive。

## 風險與控制

- 風險：內容線互相交錯，導致一條 OpenSpec scope 過大。
  - 控制：每條 change 只處理一個主 loop，不同 loop 透過既有 stable ids / tags 串接。
- 風險：新增 persisted state 導致 migration 漏補。
  - 控制：優先推導；若新增 schema，OpenSpec tasks 必須包含 migration / hydration sanitize / regression。
- 風險：圖鑑 source tracing 反向要求大規模資料重構。
  - 控制：先用現有 catalog 和 sourceHint 推導，不一次性重建資料模型。
- 風險：pixel QA 被誤解成角色 sprite 化。
  - 控制：每條 pixel change 都明寫 actor token 不變，並保留 actor-token guard regression。
- 風險：bundle 拆分破壞 lazy modal 或 pixi initialization。
  - 控制：效能 change 必須搭配 Playwright smoke，不能只看 build warning 消失。

## 建議下一步

第一條正式開案應為：

`update-workshop-route-source-specialization-v3`

理由：

- 它直接承接剛完成的三宗 v3 world memory tag 與 route material cue。
- 它能把宗門後段內容變成高階 Workshop loop 的來源與消耗，而不是只增加一次性劇情。
- 它大多可讀既有 `worldMemoryTags`、recipe data、mastery 與 specialization，不必立刻新增存檔 schema。
