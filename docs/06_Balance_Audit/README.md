# 數值平衡審計總覽

本資料夾用來集中整理《塵寰仙途》目前的修為、戰鬥、裝備、掉落、職業與技能平衡。

這一輪不只做審計，也已經把第一批數值修正落到實作中，並且用自動化測試回頭驗證。

---

## 本輪已完成的事情

### 1. 修正修為通道關係

已依照目前設計目標改成：

- 自動修煉：很小，可視為背景流
- 手動修煉：與自動同效率，但可與自動疊加
- 閉關修煉：自動的 `10x`

目前實作值：

- `PASSIVE_CULTIVATION_PENALTY = 0.02`
- `SECLUSION_CULTIVATION_MULTIPLIER = 0.2`
- `manualGain = passiveRate * cooldownSeconds`

對應檔案：

- `constants.ts`
- `utils/cultivation.ts`
- `utils/cultivation.test.ts`

### 2. 修正職業與戰鬥主循環

已經接上的部分：

- 職業小境界成長真的會套用
- 技能不再透過選職業或突破自動授與
- 技能改成透過技能書學習
- 戰鬥主循環會讀取主動技能、冷卻、MP 消耗
- 法修正式使用 `magic` 當主輸出
- 體修改為混合輸出，不再只是硬堆防禦
- 傷害公式改成平滑減傷，不再用 `atk - def` 硬扣

對應檔案：

- `store/slices/characterSlice.ts`
- `utils/battleSystem.ts`
- `pages/Adventure.tsx`

### 3. 補上練氣期三職業技能

原本分流期其實沒有 `練氣期` 的職業技能資料，現在已補上：

- 劍修：`疾風三疊`
- 體修：`裂地重拳`
- 法修：`玄水飛芒`

對應檔案：

- `data/skills/qi_refining.ts`
- `data/skills/index.ts`

### 4. 調整路線主題掉落

在仍然分三路的境界：

- 練氣
- 築基
- 金丹
- 元嬰

精英與 Boss 掉落會偏向對應職業路線：

- 北路：劍修
- 西路：體修
- 東路：法修

到了後面聚合地圖後，掉落重新回到整體混合池。

對應檔案：

- `data/enemies/elite.ts`
- `data/enemies/boss.ts`
- `data/maps.ts`

### 5. 建立平衡驗證測試

目前已補上：

- 修為倍率測試
- 基本戰鬥測試
- 練氣三職業的普通怪 / Boss 門檻測試

對應檔案：

- `utils/cultivation.test.ts`
- `utils/battleSystem.test.ts`

---

## 目前重新確認後的核心結論

### 1. 不是「高境界完全缺資料」

重新盤點後，真實情況是：

- 裝備資料其實全境界都有
- 精英與 Boss 也不是只有凡人期有
- 真正的差異是：
  - 分流期內容完整
  - 聚合期內容縮編

也就是說，問題比較像「後段內容密度下降」，不是「整段空白」。

### 2. 真正缺的，是前中期職業接線與後段驗證

重新盤點後，最重要的缺口其實是：

1. 練氣期職業技能原本不存在
2. 被動技能原本沒有正式進戰鬥計算
3. 三職業在同境界的挑戰帶原本沒有自動化驗證
4. 文件把部分缺口描述錯了，導致後續討論容易偏

### 3. 體修過強不是錯覺

這次用真實裝備與真實 Boss 測試後，確實驗到：

- 原本體修在練氣西路 Boss 前過於穩定
- 已進一步調整體修混合輸出權重
- 並上修 `萬獸獸王` 的數值，讓它重新回到「低品裝仍是門檻」的區間

---

## 尚未完全補完的部分

這一輪還沒有全部做完，剩下的真缺口是：

1. 被動技能雖已改成 explicit passive bonus 對照並補出多招專屬效果，但仍有少數高境界被動尚未完全脫離共用模板
2. 三職業正式技能池雖已收斂出 `battle-absorbed / retirement-ready` 正式查詢層，且舊的 `pending-retirement` 過渡名單已清空，但還沒把重複技能真正刪整乾淨
3. 地圖世界戰鬥已是主路徑，投射物、範圍、狀態與技能特效都已上線，但世界戰鬥與 `runAutoBattle()` 還沒完全統一成單一引擎
4. 後期丹藥、洞府、奇遇對修為的乘區還沒完整進場

### 最新收斂狀態

- 世界戰鬥 AOE 已不是只有欄位與提示，`circle / line / cone` 已正式命中附近怪物。
- 世界戰鬥、時間軸戰鬥與 HUD 的冷卻顯示，已開始共用同一套 cooldown resolver。
- 技能 / 怪物特招的 timeline metadata、status 建立、時間正規化與 player/enemy 分側，都已開始走共用 resolver。
- `enemy world strike` 的減傷 / 保命判定、incoming status 過濾，以及 `enemy special` 的控制縮短 / 免疫提示，也已開始往共用 battle helper 收斂。
- 玩家主動術式施加給敵方的控制型狀態與後續破甲追擊，也已開始和 timeline combat 共用同一層 enemy-status resolver；`霸體` 過濾與 `劍脈破甲` 不再 world / timeline 各寫一份。
- 主動術式後的多種被動觸發、資源回復、冷卻縮短、疊層訊息，與主動術式施加的 `盾、破甲、DOT、反震、劍氣` 等狀態，也已開始走共用 logger helper。
- `runAutoBattle()` 內的致命保命流程，也已開始抽成共用 fatal-survival helper，集中處理 `護體劍罡 / 滴血重生（真） / 不死不滅`。
- 玩家被動技能判定已改成明確 skill id / alias 對照，formal core 對 retired passive 的承接也不再依賴模糊 canonical 折疊。
- formal core 被動的 stat bonus 也已改成逐招明確對照表，不再沿用職業 + 境界通用公式；absorbed retired passive 會透過同一份 formal 對照表承接屬性收益。
- retired 技能目前正式收斂成 `battle-absorbed / retirement-ready`；舊的 `pending-retirement` 過渡層已清空並移除。
- formal realm dataset 已開始透過單一 retired-alias 剝離 helper 統一移除 `retirement-ready active + battle-absorbed passive`，降低 realm view 重複維護風險。
- retired active / passive 的 alias 剝離 helper，現在也已回收到 alias 檔本體，realm view 不再在 `data/skills/index.ts` 額外重複維護同一套過濾規則。
- `言出法隨 / 劍道獨尊 / 向死而生 / 法力源泉 / 靈力湧動 / 五氣朝元 / 仙法通神 / 萬法歸宗 / 萬法皆空 / 劍意化形` 等被動，已陸續補齊 world strike 與 timeline combat 的狀態回報。
- `荊棘皮層 / 蠻荒血脈 / 銅皮鐵骨 / 金剛法相 / 元素護盾 / 萬劫不滅 / 雷劫煉心 / 護體劍罡 / 滴血重生 / 不死不滅 / 仙體無垢` 這批承傷、生存與免疫被動，也已開始補齊 enemy world strike 或 enemy special world strike 的可見狀態。
- `GamePanel / Modal / GameTooltip / GameHintBubble` 這條 UI 殼層語言已進一步收斂；角色屬性、商店、圖鑑、背包、任務獎勵、區域地圖情報與多個短提示已開始共用同一套遊戲化外觀。

---

## 文件索引

- [01_修為與境界曲線審計](./01_修為與境界曲線審計.md)
- [02_戰鬥與裝備曲線審計](./02_戰鬥與裝備曲線審計.md)
- [03_職業與技能審計](./03_職業與技能審計.md)
- [04_平衡目標與改版建議](./04_平衡目標與改版建議.md)
- [05_經驗明細表](./05_經驗明細表.md)
- [06_實作修正落點](./06_實作修正落點.md)
- [07_路線分流與主題掉落設計](./07_路線分流與主題掉落設計.md)
- [08_技能系統與技能書規劃](./08_技能系統與技能書規劃.md)
- [09_即時戰鬥改造分析](./09_即時戰鬥改造分析.md)
- [10_技能數量與功能分類收斂](./10_技能數量與功能分類收斂.md)
- [11_三職業核心技能池草案](./11_三職業核心技能池草案.md)
- [12_技能書實作收斂](./12_技能書實作收斂.md)
- [13_3D渲染與戰鬥呈現評估](./13_3D渲染與戰鬥呈現評估.md)
- [14_整體改造Checklist](./14_整體改造Checklist.md)

---

## 使用方式

後續如果要繼續修平衡，我建議固定用這個順序：

1. 先看 `06_實作修正落點`
2. 再看 `01 ~ 04` 的審計與建議
3. 調完數值後重跑 `vitest`
4. 最後再回寫這個資料夾
