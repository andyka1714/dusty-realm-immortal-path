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
