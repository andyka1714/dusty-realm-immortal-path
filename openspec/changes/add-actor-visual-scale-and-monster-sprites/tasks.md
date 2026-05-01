## 1. 規格與資料盤點
- [x] 1.1 盤點 `BESTIARY` 265 筆怪物，輸出 rank、realm、element、aiStyle、地圖使用與 Boss 分布摘要。
- [x] 1.2 建立玩家 / NPC / 怪物共用 actor visual scale 基準，確認玩家 `1x2` 作為比例參考。
- [x] 1.3 定義怪物尺寸判定原則：依名稱、描述、body type、rank、元素與地圖語境判定，不把範例尺寸硬套到所有怪物。
- [x] 1.4 確認本 change 不改 LocalStorage persisted state，並記錄不需要 migration 的理由。

## 2. 型別與 Registry
- [x] 2.1 為怪物視覺資料建立非 persisted metadata 型別或 registry，包含 `visualArchetype`、`visualVariant`、`bodyType`、`footprintTiles`、`heightTiles`、`anchor`。
- [x] 2.2 建立玩家、NPC、怪物共用的 render size / foot anchor / depth sorting helper。
- [x] 2.3 為 `Enemy` template 到 monster sprite asset 建立 mapping resolver，未知 mapping 必須回退到現有文字 token。
- [x] 2.4 加入 completeness regression，確保已標記需要圖樣的怪物都能解析到 asset definition。

## 3. 怪物視覺設計表
- [x] 3.1 先為前期三線怪物建立 visual profile：凡人、練氣、築基三條路線。
- [x] 3.2 為所有 `m*_b1` Boss 建立獨立 visual profile，尺寸必須依 Boss 描述設計，不得只依 rank 套固定大小。
- [x] 3.3 為高境界 common / elite 建立 archetype-first 的共享 profile，避免 265 隻怪物全部獨立設計。
- [x] 3.4 標記需要獨立生成圖樣的高辨識怪物與可共用變體的普通怪。
- [x] 3.5 定義 common / elite / boss 的 rank visual language，包含輪廓、aura、血條、target cue、telegraph 與動畫強度差異。
- [x] 3.6 建立逐隻怪物圖樣生成 checklist，追蹤每個 enemy 的 movement / combat、QC、production-ready 狀態。

## 4. 圖樣生成與資產整合
- [ ] 4.1 使用 `$generate2dsprite` 產出每隻 monster 獨立四方向移動 sprite sheet。
- [ ] 4.2 使用 `$generate2dsprite` 產出每隻 monster 獨立四方向戰鬥 sprite sheet。
- [ ] 4.3 對產出的 monster sheet 執行透明背景、frame extraction、footline / bounding box / scale QC。
- [ ] 4.4 驗證移動圖樣包含站定 / weight-shift frame 與對應肢體交替，不得只有單側邁步。
- [ ] 4.5 驗證戰鬥圖樣依 body type 呈現合理攻擊方式，並具備上、下、左、右方向。
- [ ] 4.6 驗證同一 enemy 的 movement / combat 使用同一風格鎖定：silhouette、palette、outline、scale、view 與 footline 必須一致。
- [x] 4.7 將 monster asset definition 接入 `data/assets` registry。
- [x] 4.8 將 monster visual metadata 接入 `AdventureStage` rendering，支援不同 render footprint、height、movement animation 與 combat animation。

## 5. 渲染與互動驗證
- [x] 5.1 更新 `AdventureStage`，讓玩家、NPC、怪物本體都使用同一 actor depth layer 與腳底排序。
- [x] 5.2 確保大型怪物 render size 不會破壞點擊、接戰、target marker、血條與 Boss telegraph。
- [ ] 5.3 跑 Adventure browser smoke，檢查 `$generate2dsprite` 實圖怪物與玩家/NPC 遮擋、比例與清晰度。
- [ ] 5.4 加入每個 production-ready 怪物都能解析四方向 movement / combat asset 的 completeness regression，且 asset source 必須來自 `$generate2dsprite` 流程。
- [ ] 5.5 加入 movement / combat pair style QC 記錄，確保同一 enemy 兩套圖樣風格一致。
- [x] 5.6 加入 common / elite / boss 視覺 cue regression，確保三種 rank 在場上可辨識。
- [x] 5.7 跑 `npm run typecheck`、相關 unit tests、`git diff --check` 與 OpenSpec strict validation。
