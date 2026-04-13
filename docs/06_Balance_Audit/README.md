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

1. 被動技能雖已改成 explicit passive bonus 對照，並補出多招專屬效果與開場 / world strike 可見性，但仍有少數高境界被動尚未完全脫離共用模板
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
- 玩家主動術式施加後的 player-side / enemy-side 狀態推入與戰鬥日誌，也已開始走共用 append logger helper，時間軸戰鬥不再逐段手寫同一套流程。
- 玩家主動術式的可施放窗口、資源 / 冷卻流，也已開始抽成共用 `resolvePlayerActiveSkillWindow(...) / resolvePlayerActiveResourceFlow(...)`，把可施放判定、術式免耗、冷卻縮短、靈潮回補、劍心重置與法修築基層數累進集中處理。
- `劍意化形 / 虛空劍陣 / 撒豆成兵` 這批多段追擊與召喚後續傷害，也已開始抽成共用 `applyPlayerEchoAndSummonFollowupEffects(...)`。
- 敵方出手前的攻勢計算、承傷鏈與命中後反應鏈，也已開始收斂到 `resolveEnemyOffenseRoll(...) / resolveIncomingEnemyDamage(...) / applyEnemyHitAftermath(...)`，把克制、特招倍率、格擋 / 閃避 / 虛空轉移、減傷、護盾、保命與命中後續事件集中到同一條處理鏈。
- `runAutoBattle()` 內的致命保命流程，也已開始抽成共用 fatal-survival helper，集中處理 `護體劍罡 / 滴血重生（真） / 不死不滅`。
- `祖巫降臨 / 法天象地 / 掌中神國 / 一念花開 / 破劫一擊` 這批高境界主動的後續效果，也已開始收斂到共用 follow-up helper，進一步縮小 `runAutoBattle()` 的 inline 分支。
- 戰鬥中的 DOT / 吸血 tick 結算，也已開始共用同一個 status outcome resolver，`燃燒 / 中毒 / 流血 / 吸生` 不再由玩家與敵方各寫一套。
- 戰鬥中的 DOT / 吸血 tick 迴圈，現在也已開始收斂到共用 `applyStatusTickBatch(...)`，把玩家 / 敵方雙側的 tick、吸血與淨化提示放進同一條流程。
- 玩家被動技能判定已改成明確 skill id / alias 對照，formal core 對 retired passive 的承接也不再依賴模糊 canonical 折疊。
- formal core 被動的 stat bonus 也已改成逐招明確對照表，不再沿用職業 + 境界通用公式；absorbed retired passive 會透過同一份 formal 對照表承接屬性收益。
- retired 技能目前正式收斂成 `battle-absorbed / retirement-ready`；舊的 `pending-retirement` 過渡層已清空並移除。
- formal realm dataset 現在已透過 alias-layer 聚合表與單一 retired-alias 剝離 helper 統一移除 `retirement-ready active + battle-absorbed passive`；`data/skills/index.ts` 不再重複維護 alias 清單、過濾規則與 `battle-absorbed / retirement-ready` record 組裝。
- formal realm dataset 的組裝也已開始走單一 `buildRealmSkillSet(...)` helper，各境界不再重複拼接 retired alias。
- `言出法隨 / 劍道獨尊 / 向死而生 / 法力源泉 / 靈力湧動 / 五氣朝元 / 仙法通神 / 萬法歸宗 / 萬法皆空 / 劍意化形` 等被動，已陸續補齊 world strike 與 timeline combat 的狀態回報。
- `荒古戰體 / 仙元護體 / 劍意化形 / 肉身成聖 / 道法自然` 這批被動，也已開始補齊 timeline combat 開場待命訊息，不再只有內部效果在跑。
- `劍脈初成 / 銅皮鐵骨 / 靈潮循環 / 法力源泉` 這批前中期核心被動，也已開始補齊 timeline combat 開場待命訊息，避免只有高境界被動有可見性。
- `劍心通明 / 護體劍罡 / 蠻荒血脈 / 滴血重生 / 靈力湧動` 這批築基到元嬰的關鍵被動，也已開始補齊 timeline combat 開場待命訊息，前中期核心 build 不再缺少待命可見性。
- `萬法皆空 / 不死不滅` 也已開始補齊 timeline combat 開場待命訊息，帝境被動不再只在保命或免疫觸發後才被看見。
- `人劍合神 / 萬劫不滅 / 雷劫煉心` 也已開始補齊 timeline combat 開場待命訊息，融合 / 渡劫期的控制與承傷型被動不再只在被動觸發後才有可見性。
- `空間法則 / 仙體無垢 / 劍道獨尊 / 言出法隨` 也已開始補齊 timeline combat 開場待命訊息，虛煉 / 仙境 / 大乘期被動不再只在觸發後才有可見性。
- `荊棘皮層 / 蠻荒血脈 / 銅皮鐵骨 / 金剛法相 / 元素護盾 / 萬劫不滅 / 雷劫煉心 / 護體劍罡 / 滴血重生 / 不死不滅 / 仙體無垢` 這批承傷、生存與免疫被動，也已開始補齊 enemy world strike 或 enemy special world strike 的可見狀態。
- `養劍術` 的非受傷疊層流程，也已開始抽成共用 upkeep helper，停手與承傷後的劍勢累進不再各自維護重複分支。
- 戰鬥開場的初始護體、待命訊息與帝境初始特招延後，也已開始整併到 `initializeCombatEncounter(...)`，不再由 `runAutoBattle()` 主流程手動鋪開。
- Boss 破綻的觸發與戰鬥訊息，也已開始整併到 `rollBossBreakOpportunity(...)`，減少主循環內對同一條爆發窗口的重複敘述。
- `enemy special` 的 incoming status 過濾、狀態推入、戰鬥日誌與免疫提示，也已開始收斂到更完整的共用 helper，world / timeline 的差異進一步縮小。
- `絕仙劍` 的 `絕仙封脈` 也已正式接進 timeline combat，會在敵方特招將要出手時把節奏再壓後 `1` 秒，高境界劍修的節奏壓制已不再只是狀態名義存在。
- 敵方特招的初始延後與後續節奏壓制，也已開始抽成共用 helper，`萬法歸宗 / 絕仙封脈` 不再在時間軸主循環內分散處理。
- `GamePanel / Modal / GameTooltip / GameHintBubble` 這條 UI 殼層語言已進一步收斂；角色屬性、商店、圖鑑、背包、任務獎勵、區域地圖情報與多個短提示已開始共用同一套遊戲化外觀，標題層也已開始透過 `GameTitleStack` 共用同一套 `eyebrow + title (+ icon)` 結構。
- `GamePanel / Modal` 內原本重複存在的 eyebrow 裝飾也已移除，正式改由 `GameTitleStack` 單點承接標題階層，不再重複堆兩層同名標識。
- `World / UI / Audit` 文件對於地圖情報 tooltip、短提示 eyebrow 與 battle shared resolver 的描述，也已開始按目前實作重新對齊。

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
