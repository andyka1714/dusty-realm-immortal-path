## 1. 規格與文件

- [x] 1.1 建立 OpenSpec proposal / design / spec deltas
- [x] 1.2 驗證 OpenSpec change
- [x] 1.3 在任務紀錄中明確標示本 change 不需要 persisted migration

## 2. 人形 Sprite 型別與規格

- [x] 2.1 擴充 generated sprite metadata，支援 humanoid profile、frame 尺寸、目標高度、腳底線與中心線
- [x] 2.2 更新 asset registry tests，要求 player walk assets 帶有 humanoid 標準 metadata
- [x] 2.3 定義 player / NPC 共用的人形 sprite 標準常數

## 3. Normalizer 與 QC Gate

- [x] 3.1 新增 humanoid walk frame normalizer 測試
- [x] 3.2 實作 96x96 frame、80px 高度、footline 88、centerX 48 的 normalize 流程
- [x] 3.3 新增 image QC 工具或測試，檢查高度、腳底線、中心線、碎片、邊界與 chroma-key 殘邊
- [x] 3.4 確保 QC 讀取正式輸出路徑，而不是暫存檔

## 4. 重新生成玩家走路素材

- [x] 4.1 重新生成男性凡人 4x4 walk raw sheet，要求完整頭髮與木劍背負
- [x] 4.2 重新生成女性凡人 4x4 walk raw sheet，要求完整頭髮與木劍背負
- [x] 4.3 使用 humanoid normalizer 產出正式 frames、sheet、GIF 與 metadata
- [x] 4.4 若生成結果無法通過 QC，拒收並重新生成，不再手工補單一髮髻

## 5. Runtime 接入

- [x] 5.1 確認 AdventureStage walk animation 使用獨立 frame PNG
- [x] 5.2 確認男女 player 走路切換方向時高度、腳底與中心穩定
- [x] 5.3 保留素材載入失敗 fallback

## 6. 重新生成玩家戰鬥素材

- [x] 6.1 分析 4、6、8 格戰鬥動畫取捨，採用每方向 6 格作為凡人 combat profile
- [x] 6.2 重新生成男性凡人 4x6 combat raw sheet，要求四方向手持木劍
- [x] 6.3 重新生成女性凡人 4x6 combat raw sheet，要求四方向手持木劍與長直髮
- [x] 6.4 使用 humanoid combat normalizer 產出正式 frames、sheet、方向 GIF 與 metadata
- [x] 6.5 更新 AdventureStage，使 combat animation 依目前面向選擇 row
- [x] 6.6 更新 asset registry metadata 與 tests，要求 combat assets 帶有 4x6 humanoid combat 標準

## 7. 驗證

- [x] 7.1 跑 humanoid image QC
- [x] 7.2 跑 targeted tests
- [x] 7.3 跑 `npm run typecheck`
- [x] 7.4 跑 `openspec validate add-humanoid-sprite-standard --strict`
