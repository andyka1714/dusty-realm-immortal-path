# Change: 建立玩家與怪物共用視覺比例、體型與怪物圖樣規格

## Why
目前玩家與 NPC 已開始使用像素角色圖樣，但怪物仍以文字 token 顯示，缺少圖樣、體型與渲染比例規格。若直接逐隻生成怪物圖樣，容易造成玩家、NPC、普通怪、精英怪與 Boss 的高度、腳底錨點、遮擋排序與戰鬥可讀性不一致。

## What Changes
- 建立玩家、NPC、怪物共用的 actor visual scale 基準，以玩家 `1x2` 作為比例校準點。
- 為怪物定義 `visualArchetype`、`visualVariant`、`bodyType`、`footprintTiles`、`heightTiles` 與 render scale 規則。
- 將怪物 sprite rollout 分批規劃為 archetype-informed，但每個 enemy template 最終都必須有自己的獨立 movement / combat 圖檔資料夾。
- 定義 Boss、精英、伏地四足怪、長條龍蛇怪、人形怪與靈體怪的尺寸語意與渲染需求。
- 要求場景渲染以腳底錨點與 depth sorting 顯示不同尺寸 actor，避免大型怪物或玩家錯誤遮擋。
- 建立怪物圖樣生成 checklist，逐隻追蹤 movement / combat 是否完成 `$generate2dsprite`、QC 與 production-ready 標記。
- 不改動 LocalStorage persisted schema；怪物視覺資訊必須從 enemy catalog / asset registry 推導。

## Impact
- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `types.ts`, `data/enemies/*`, `data/assets/*`, `components/adventure/AdventureStage.tsx`, `utils/*`
- Persisted state: 不應新增 persisted 欄位；若實作時必須將視覺欄位存入 state，需另補 migration / hydration sanitize 規格後才能實作。
