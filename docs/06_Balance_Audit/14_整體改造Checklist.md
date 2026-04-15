# 整體改造 Checklist

本文件用來追蹤《塵寰仙途》目前這一輪改造的細項進度。

狀態規則：

- `[x]` 已完成並已落到程式或正式文件
- `[ ]` 尚未完成，或仍停留在分析 / 草案階段

---

## 1. 文件治理與盤點

- [x] 建立 `docs/06_Balance_Audit/` 數值平衡審計資料夾
- [x] 建立修為審計文件
- [x] 建立戰鬥與裝備審計文件
- [x] 建立職業與技能審計文件
- [x] 建立平衡目標與改版建議文件
- [x] 建立經驗明細表
- [x] 建立實作修正落點文件
- [x] 建立三路分流與主題掉落設計文件
- [x] 建立技能系統與技能書規劃文件
- [x] 建立即時戰鬥改造分析文件
- [x] 建立技能數量與功能分類收斂文件
- [x] 建立三職業核心技能池草案文件
- [x] 建立技能書實作收斂文件
- [x] 建立 3D / Three.js / WebGL 可行性評估文件
- [x] 把平衡審計文件掛到 [docs/index.md](/Users/andyka1714/Desktop/Ascend-Spark/dusty-realm-immortal-path/docs/index.md)
- [x] 建立本 checklist 文件
- [x] `README.md`、`docs/index.md` 與平衡審計總覽已持續做分批交叉同步，避免文件敘述與最新 battle / UI helper 狀態脫節
- [x] 平衡審計總覽與即時戰鬥分析文件已開始實際去掉 alias-layer / battle helper 的重複條目，往最終完全去重推進
- [x] 讓所有平衡審計文件彼此完全去重，避免同一件事在多份文件重複描述
- [x] 把 `README.md`、`docs/02_Gameplay/*`、`docs/03_World/*` 與平衡審計全部再做一次全面交叉校對

---

## 2. 修為、境界與時間節奏

- [x] 盤點目前修為需求曲線與程式實作是否一致
- [x] 修正自動修煉倍率，使其小到接近背景流
- [x] 修正手動修煉效率，使其與自動同倍率但可疊加
- [x] 修正閉關修煉倍率，使其固定為自動修煉的 10 倍
- [x] 修正離線收益與在線修煉使用同一套修為公式
- [x] 補上修為公式對應測試
- [x] 把修為節奏回寫到 [cultivation.md](/Users/andyka1714/Desktop/Ascend-Spark/dusty-realm-immortal-path/docs/02_Gameplay/cultivation.md)
- [x] 重新驗算凡人 -> 煉氣 -> 築基 -> 金丹 -> 元嬰完整實際遊玩時長
- [x] 補上壽元與真實遊玩時間之間的換算表
- [x] 補上後期丹藥、洞府、奇遇、事件對修為乘區的正式數值規格
- [x] 補上高境界追趕機制，避免聚合期總時長過度膨脹

---

## 3. 職業、境界與基礎戰鬥數值

- [x] 盤點三職業目前的屬性偏向與小境界成長
- [x] 把職業小境界成長正式接入角色數值
- [x] 讓法修正式以 `magic` 為主要輸出來源
- [x] 降低體修純坦導致的過度穩定問題
- [x] 把平滑減傷公式接進戰鬥，避免 `atk - def` 斷層
- [x] 補上同境界普通怪 / Boss 的基礎門檻測試
- [x] 重新驗算三職業在每個大境界的目標擊殺時間
- [x] 建立三職業在普通怪 / 精英怪 / Boss 下的 TTK 目標表
- [x] 建立三職業跨境界挑戰的合理上限表

---

## 4. 怪物資料、路線主題與掉落

- [x] 盤點怪物資料是否只有前期完整
- [x] 確認分流期地圖為三條職業主題路線
- [x] 把北路定為劍修主題
- [x] 把西路定為體修主題
- [x] 把東路定為法修主題
- [x] 讓分流期精英怪掉落偏向路線主題技能書
- [x] 讓分流期 Boss 掉落偏向路線主題技能書
- [x] 為部分法系怪物補上遠程 `attackRange`
- [x] 重新校正練氣期三路 Boss 門檻
- [x] 盤點並補齊築基以上缺少主題感的精英怪
- [x] 盤點並補齊聚合期缺少主題感的 Boss
- [x] 補上第一批遠程怪、法術怪、範圍攻擊怪
- [x] 補上更多遠程怪、法術怪、範圍攻擊怪
- [x] 補上第一批法術型怪物 / Boss 的怪物技能資料
- [x] 補上怪物技能資料，不再只靠普通攻擊模板
- [x] 補上化神以上每張圖第 3 / 4 隻普通怪
- [x] 補上化神以上每張圖第 2 隻精英怪
- [x] 建立高境界內容密度測試，防止後續退回 `2 普通 + 1 精英`
- [x] 補上怪物元素抗性與元素弱點系統
- [x] 補上怪物特殊詞綴系統第一版（強襲 / 霸體 / 統御 / 堅甲 / 噬生 / 迅影）

---

## 5. 裝備數值與品階節奏

- [x] 盤點裝備資料是否全境界都有
- [x] 確認前中期掉裝節奏與戰鬥門檻關係
- [x] 校正練氣期「整套下品不應穩過 Boss」的節奏
- [x] 校正練氣期「中品搭少量上品可挑戰 Boss」的節奏
- [x] 盤點各大境界下品 / 中品 / 上品 / 仙品完整數值帶
- [x] 建立每個大境界裝備總值區間表
- [x] 建立三職業對應裝備詞條權重表
- [x] 建立各路線掉落偏好的裝備詞條表
- [x] 建立 Boss 掉落仙品裝備的正式機率表
- [x] 補上高境界裝備實戰驗證測試

---

## 6. 技能系統改造為技能書

- [x] 盤點原本技能自動授與邏輯
- [x] 移除選職業自動送技能
- [x] 移除大境界突破自動送技能
- [x] 把技能改成需透過技能書學習
- [x] 由 `SKILLS` 自動生成對應技能書物品
- [x] 技能書具備職業限制
- [x] 技能書具備境界限制
- [x] 背包可真正使用技能書並學習技能
- [x] 技能書使用後會消耗道具
- [x] 已學技能不可重複參悟
- [x] 商店可販售基礎技能書
- [x] 宗門可販售進階技能書
- [x] 精英怪可掉被動技能書
- [x] Boss 可掉主動技能書
- [x] 宗門入門試煉任務可獎勵技能書
- [x] 劍修宗門任務技能書已接上
- [x] 體修宗門任務技能書已接上
- [x] 法修宗門任務技能書已接上
- [x] 建立技能書覆蓋測試，確保每招技能都有技能書
- [x] 建立技能書來源測試，確保每本技能書都有正式來源
- [x] 重新裁剪高境界空泛技能，收斂成正式技能池（metadata / registry 第一版）
- [x] 建立商店書 / 精英書 / Boss 書 / 傳承書的完整來源總表
- [x] 補上技能書 UI 專用顯示與分類

---

## 7. 三職業核心技能池

- [x] 建立三職業核心技能池草案文件
- [x] 把技能設計從「每境界一整套」收斂成「有限核心技能池」
- [x] 補上練氣期三職業主動技能資料
- [x] 補上築基期三職業主動技能的即時戰鬥欄位
- [x] 逐招檢查現有技能是否符合劍修定位（已回填 registry）
- [x] 逐招檢查現有技能是否符合體修定位（已回填 registry）
- [x] 逐招檢查現有技能是否符合法修定位（已回填 registry）
- [x] 非 `core` 技能已退出正式技能書 / 商店 / 掉落 / 傳承池
- [x] 舊技能資料與學習流程已開始自動映射到正式核心技能
- [x] 正式技能查詢層已開始提供 formal core 視角（skillId / skillName / learnedSkills）
- [x] 圖鑑 / 宗門技能展示已切到 formal core 視角，不再直接列出 retired 技能
- [x] 技能書 / 商店已開始直接吃 formal core 索引層，而不再各自手動 filter 技能池
- [x] 精英 / Boss 技能書掉落也已切到 formal core 查詢 helper，不再各自重寫技能篩選規則
- [x] 技能資料已切出按境界的 formal / retired 索引，為後續實際刪整舊技能做準備
- [x] 技能資料已補 formal / retired 的 name 與 id 索引，避免後續刪整仍依賴全域掃描
- [x] 部分 retired emperor 主動 / 被動效果已開始直接合流到 formal core 戰鬥分支
- [x] 更多 retired high-realm 主動效果已開始直接合流到 formal core 戰鬥分支
- [x] `m_bi_active`、`b_tr_active` 已從 pending-retirement 進一步推進到 battle-absorbed 戰鬥分支
- [x] `s_bi_active` 已開始把劍氣共鳴爆發承接進 `s_tr_active`，往 battle-absorbed 戰鬥分支推進
- [x] 第一批「已被 formal core 戰鬥分支吸收、可優先刪整」的 retired 主動技能清單已正式程式化
- [x] 第一批 retirement-ready retired 主動技能查詢層已建立，可直接支援後續資料本體刪整
- [x] 第一批 retirement-ready retired 主動技能已從原境界技能檔抽離，改為集中 alias 定義
- [x] 第一批 battle-absorbed retired 被動技能已從原境界技能檔抽離，改為集中 alias 定義
- [x] retired 技能曾切出 pending-retirement 查詢層作為過渡名單；目前該層已清空並自程式查詢層移除
- [x] 第一批 retirement-ready retired 主動技能已自各境界正式技能資料集移除，只保留中央 alias / 相容查詢層
- [x] 原先仍留在 `fusion / tribulation` 原境界技能檔的 `s_bi_active`、`m_bi_active`、`b_tr_active`，也已回收進正式 retired active alias 層
- [x] 第一批 battle-absorbed retired 被動技能也已自各境界正式技能資料集移除，realm 視圖只保留正式技能池
- [x] 原先 pending-retirement retired 被動技能已全部併回正式 retired passive alias 層，不再獨立維護資料檔
- [x] 更多已落地的 pending-retirement retired 被動技能已正式推進到 battle-absorbed 分類，降低後續本體刪整阻力
- [x] retirement-ready / battle-absorbed 的 retired alias ID 清單已回收至 alias 檔本體，skill index 不再重複維護同一份清單
- [x] formal realm dataset 已不再透過 retired-alias 剝離 helper 做二次清洗，直接以正式 `core` skill set 組裝
- [x] `SKILL_PROFESSION_POOLS` 現在也已正式鎖定為 `core only`，非核心技能改由 `NON_CORE_SKILL_PROFESSION_POOLS` 承接，不再和正式職業池混在同一組
- [x] `CORE_SKILL_POOL_REGISTRY / NON_CORE_SKILL_POOL_REGISTRY` 也已正式切開，正式技能池與 transition / legacy 查詢不再共用同一份 registry 視角
- [x] `TRANSITION_SKILL_POOL_REGISTRY / LEGACY_SKILL_POOL_REGISTRY` 與對應 profession pools 也已切開，最後一批技能本體刪整可直接依 transition / legacy 分組處理
- [x] `TRANSITION_SKILLS_BY_REPLACEMENT / LEGACY_SKILLS_BY_REPLACEMENT / NON_CORE_SKILLS_BY_REPLACEMENT` 也已補齊，最後一批合併刪整可直接按 formal replacement target 盤點
- [x] `TRANSITION_SKILLS_BY_PROFESSION_AND_REPLACEMENT / LEGACY_SKILLS_BY_PROFESSION_AND_REPLACEMENT` 也已補齊，最後一批技能本體刪整可直接按職業與 formal replacement 交叉盤點
- [x] `MERGE_READY_NON_CORE_SKILL_GROUPS / MERGE_READY_NON_CORE_SKILL_GROUPS_BY_PROFESSION` 也已補齊，最後一批刪整可直接聚焦真正有重複 replacement cluster 的技能群
- [x] `MERGE_READY_NON_CORE_SKILLS / MERGE_READY_NON_CORE_SKILL_MAP / MERGE_READY_NON_CORE_SKILLS_BY_PROFESSION` 也已補齊，最後一批技能本體刪整已有可直接操作的 merge-ready skill 視圖
- [x] `MERGE_READY_TRANSITION_SKILL_GROUPS / MERGE_READY_LEGACY_SKILL_GROUPS` 與對應 skill 視圖也已補齊，最後一批刪整可直接分成 transition pass 與 legacy pass 逐步清理
- [x] `TRANSITION_SKILLS / LEGACY_SKILLS` 與對應 skill map 也已補齊，最後一批重複技能的本體刪整已有正式視圖可直接盤點
- [x] retired skill 的 active / passive 正式視圖分組，現在已正式回收到 alias util 的單一路徑，skill index 不再各自維護兩組近似樣板
- [x] `battle-absorbed / retirement-ready` 的 active / passive resolved skill view，也已開始共用 `buildResolvedRetiredSkillViewGroups(...)`，skill index 不再各自維護兩段近似的 resolved view set 組裝
- [x] `battle-absorbed / retirement-ready` 的 retired skill resolved view，也已正式回收到 alias util 層，skill index 不再手組 active / passive 解析樣板
- [x] skill index 目前已不再 export `battle-absorbed / retirement-ready` 的 resolved retired skill 過渡出口，正式 resolved 視圖只留 alias-layer 與測試側組裝
- [x] `battle-absorbed` retired active / passive 的正式輸出，也已集中回 `retired_aliases.ts`，不再分散在 active / passive alias entry 檔各自維護同型 export 樣板
- [x] `battle-absorbed` retired alias 的 export set，現在也已開始共用 `buildRetiredAliasExportSetFromRecord(...)`，中央 alias layer 不再各自手動從 alias record 重建 `skillIds / aliases / views`
- [x] `s_vr_passive` 已正式承接進 formal core 劍修被動分支，從 pending-retirement 推進到 battle-absorbed
- [x] `s_bi_active` 已正式承接進 formal core 劍修 burst 分支，從 pending-retirement 推進到 battle-absorbed
- [x] `s_f_passive` 已正式承接進 formal core 劍修被動分支，從 pending-retirement 推進到 battle-absorbed
- [x] 刪除或合併重複功能技能（正式技能池、正式 realm 視圖與公開 registry 都已完成 `core only` cutover；重複功能技能現在只保留中央 alias 相容與 final cull manifests）
- [x] 補齊每職業保底技能、功能技能、爆發技能、被動技能的最終名單
- [x] 補齊每個技能的最終來源層級
- [x] 補齊每個技能的最終前置條件

---

## 8. 技能即時戰鬥欄位與資料模型

- [x] 為 `Skill` 型別加入 `cooldownSeconds`
- [x] 為 `Skill` 型別加入 `castRange`
- [x] 為 `Skill` 型別加入 `castTimeMs`
- [x] 為 `Skill` 型別加入 `projectileSpeed`
- [x] 為 `Skill` 型別加入 `areaShape`
- [x] 為 `Skill` 型別加入 `areaRadius`
- [x] 為 `Skill` 型別加入 `maxTargets`
- [x] 為練氣期主動技能補上即時戰鬥欄位
- [x] 為築基期主動技能補上即時戰鬥欄位
- [x] 建立 `skillRealtime` 輔助計算工具
- [x] 讓世界接戰距離可讀取已學技能射程
- [x] 補齊金丹以上主動技能的即時戰鬥欄位
- [x] 補齊被動技能的即時戰鬥效果標記欄位
- [x] 為技能加入實際範圍類型判定資料，而不是只存在欄位

---

## 9. 地圖接戰與移動節奏

- [x] 盤點玩家移動與怪物移動過慢問題
- [x] 上調玩家移動速度
- [x] 上調怪物移動速度
- [x] 不再限制為同格碰撞才接戰
- [x] 玩家可在接戰距離內直接鎖定目標開戰
- [x] 怪物可在自身索敵 / 攻擊距離內主動接戰
- [x] 戰鬥結束會刪除正確怪物實例
- [x] 建立地圖接戰相關測試
- [x] 讓怪物追擊邏輯開始區分近戰怪與遠程怪
- [x] 讓怪物保持射程而不是一律貼近玩家
- [x] 讓玩家普攻與技能可在地圖上直接施放，而不是接戰後切 modal
- [x] 怪物出生 / 移動已避免直接與玩家或其他怪物重疊
- [x] 世界戰鬥脫戰時已清理殘留計時器與狀態，並補上戰後調息，避免自動戰鬥久了被殘留傷害送回村莊

---

## 10. 戰鬥內核從回合制到時間軸模擬

- [x] `runAutoBattle()` 改為時間軸模擬
- [x] 戰鬥事件記錄 `timeMs`
- [x] 攻速真正影響出手節奏
- [x] 技能 `cooldownSeconds` 正式接入戰鬥
- [x] 事件回放改成依 `timeMs` 播放，而不是固定間隔
- [x] 新增時間軸戰鬥測試
- [x] 驗證劍修在時間軸上比體修更快出手
- [x] 技能施法時間 `castTimeMs` 正式進入戰鬥
- [x] 投射物速度 `projectileSpeed` 正式進入戰鬥
- [x] AOE `areaShape / areaRadius / maxTargets` 正式進入戰鬥
- [x] 狀態持續時間正式進入時間軸
- [x] 玩家地圖內出手已開始吃 `executionTimeMs`，命中與結算不再發生在按鍵瞬間
- [x] 世界戰鬥與 `runAutoBattle()` 已開始共用技能 / 怪物特招的 timeline metadata（execution / AOE / projectile / cooldown 基準）
- [x] 世界戰鬥與 `runAutoBattle()` 已開始共用技能 / 怪物特招的 status resolver、時間正規化與 player/enemy 分側規則
- [x] 世界戰鬥、時間軸戰鬥與戰鬥 HUD 的主動技能冷卻顯示，已開始共用同一套 cooldown resolver
- [x] 玩家被動技能判定已開始抽成共用 passive flags helper，降低 world / timeline / HUD 分散重寫風險
- [x] 玩家被動技能判定已補成共用 skill-id 對照表，world strike 與 timeline combat 的 passive flag 來源不再各自手寫維護
- [x] 高境界 passive 的基礎屬性收益已開始補成逐招 explicit 對照表，不再只靠職業 / 境界 fallback 推估
- [x] 所有正式核心被動現在都已至少會對一項正式戰鬥屬性產生明確變化，可直接透過測試驗證不再只靠 fallback 才看得出差異
- [x] 開場被動狀態與對應戰鬥事件已開始走共用初始化 helper，降低 `runAutoBattle()` 散寫 `荊棘皮層` / `元素護盾` 等訊息的重複度
- [x] 屬性克制、弱點洞察、元素抗性、開場被動與高境界開場壓制提示，已開始整併成共用 opener helper，縮減 `runAutoBattle()` 的前置事件散寫範圍
- [x] 開場被動狀態、待命訊息與 enemy special 起始延後，也已開始透過 `resolveInitialPassiveStateBundle(...)` 聚合，縮減 `initializeCombatEncounter(...)` 的布林參數面
- [x] 來襲傷害的防禦型被動事件已開始抽成共用 defensive-passive helper，集中處理 `蠻荒血脈` / `銅皮鐵骨` / `金剛法相` / `肉身成聖` / `元素護盾`
- [x] enemy special 的 incoming status 過濾與控制縮短，現在也開始走 world / timeline 共用 resolver，不再在 `runAutoBattle()` 內手寫一套獨立分支
- [x] enemy special 的免疫觸發訊息，也已開始抽成共用 helper，避免 `仙體無垢 / 萬法皆空` 在時間軸戰鬥內重複散寫
- [x] enemy special 的狀態套用、戰鬥日誌與免疫提示，已開始進一步收斂到同一層 helper，減少 timeline 內核殘留散寫
- [x] DOT / 吸血 tick 的傷害、回復與戰鬥訊息，已開始共用同一個 status outcome resolver，玩家與敵方不再各維護一套
- [x] 主動術式後的資源回復、冷卻縮短、冷卻重置與疊層訊息，也已開始抽成共用 logger helper，收斂 `五氣朝元 / 道法自然 / 靈潮循環 / 劍心通明 / 靈力湧動`
- [x] `養劍術` 的非受傷疊層流程，也已開始抽成共用 upkeep helper，停手與承傷後回合不再各自散寫一份劍勢累進邏輯
- [x] 玩家出手前的攻勢計算與暴擊 / 破防判定，已開始抽成共用 `resolvePlayerOffenseRoll(...)`，縮小 `runAutoBattle()` 主循環內的 inline 分支
- [x] 玩家主動技能命中後的資源流、狀態推入、回響追擊與高境界後續效果，已開始整併到 `resolvePlayerActiveAftermath(...)`
- [x] 玩家主動術式的可施放窗口，也已開始抽成共用 `resolvePlayerActiveSkillWindow(...)`，不再由 `runAutoBattle()` 主循環手動判斷可施放與 profile 組裝
- [x] 玩家主動術式的主傷害訊息與 `劍脈破甲` 提示，也已開始抽成共用 helper，主循環不再重複散寫攻擊文案與破甲追擊提示
- [x] 敵方出手後的格擋、承傷、反震、enemy special 狀態套用與命中後續事件，已開始整併到 `resolveEnemyTurnAftermath(...)`
- [x] DOT / 吸生 tick 的雙側處理迴圈，已開始整併到 `applyStatusTickBatch(...)`
- [x] 開場初始護體、待命訊息與帝境初始特招延後，已開始整併到 `initializeCombatEncounter(...)`
- [x] Boss 破綻觸發與對應戰鬥事件，已開始整併到 `rollBossBreakOpportunity(...)`
- [x] 玩家出手主幹也已開始整併到 `resolvePlayerTurn(...)`，把可施放窗口、攻勢判定、主傷害訊息、破甲追擊、共鳴處理與命中後續集中到同一層流程
- [x] 敵方被控跳過回合的流程，也已開始整併到 `resolveEnemyIncapacitatedTurn(...)`，控制跳過與 `養劍術` 疊層不再在主循環散寫
- [x] battle snapshot provider 與 DOT / 吸生 tick 迴圈，也已開始抽成 `createCombatSnapshotProvider(...) / createStatusTickProcessor(...)`，主循環不再直接維護整段閉包式基礎設施
- [x] 玩家出手前置流程也已開始整併到 `resolvePlayerTurnPrelude(...)`，週期護體與 Boss 破綻窗口已集中在同一層處理
- [x] 敵方出手窗口也已開始整併到 `resolveEnemyActionWindow(...)`，控制跳過、特招延後、特招窗口與敵方攻勢判定不再在主循環平鋪散寫
- [x] 回合開場維護也已開始整併到 `resolveTurnStartMaintenance(...)`，狀態 tick、被動回復與淨化流程不再直接散在主循環開頭
- [x] 戰鬥開場 seed 流程也已開始整併到 `seedCombatEncounter(...)`，初始護體與 enemy special 起始冷卻不再直接在主循環鋪開
- [x] 戰鬥開場的 runtime 組裝，也已開始整併到 `createCombatRuntimeContext(...)`，主動術式、攻速、克制、元素修正與被動旗標不再在 `runAutoBattle()` 開頭散寫
- [x] 回合主循環需要的被動能力旗標，也已開始整併到 `createCombatLoopFeatureFlags(...)`，`resolveCombatLoopStep(...)` 不再額外攜帶一長串布林參數
- [x] `resolveCombatLoopStep(...)` 的 state/result 組裝，也已開始收斂到 `buildCombatLoopState(...) / buildCombatLoopStepResult(...)`，主循環不再重複鋪開同一份長狀態物件
- [x] `resolveCombatLoopStep(...)` 現在也已改成單一 `nextState + finalizeLoopStep(...)` 路徑，battle loop 不再在多個提前 return 分支各自手組完整狀態回傳
- [x] 戰鬥基礎設施的 snapshot / tick wiring，也已開始整併到 `createCombatInfrastructure(...)`，snapshot provider 與 status tick processor 不再在 `runAutoBattle()` 內各自散寫
- [x] 戰鬥開場的 infrastructure wiring 與 encounter seed，也已開始整併到 `prepareCombatLoopEnvironment(...)`，不再把 infrastructure 建立與 seed 流程拆成兩段散寫
- [x] 戰鬥環境 seed 的回寫，也已開始整併到 `applyPreparedCombatLoopState(...)`，開場補入的護體狀態與 enemy special 延後不再在主函式逐欄覆寫
- [x] 初始 combat loop state 也已開始整併到 `createInitialCombatLoopState(...)`，hp/mp、冷卻、疊層、護體與回合旗標不再在 `runAutoBattle()` 開頭逐項手寫
- [x] 玩家出手階段也已開始整併到 `resolvePlayerActionPhase(...)`，週期護體、Boss 破綻與正式出手流程不再在主循環拆成兩段散寫
- [x] 玩家先手分支也已開始整併到 `resolvePlayerTurnPhase(...)`，玩家先手時的正式出手鏈不再直接鋪在主循環裡
- [x] 勝利掉落結算也已開始整併到 `resolveVictoryRewards(...)`，擊殺訊息與戰利品組裝不再直接堆在 `runAutoBattle()` 尾端
- [x] 敵方完整出手階段也已開始整併到 `resolveEnemyActionPhase(...)`，承傷、保命、劍勢回補與特招冷卻回推不再在主循環散寫
- [x] battle while 迴圈本身也已開始整併到 `runCombatTimelineLoop(...)`，`runAutoBattle()` 不再自己持有整段 loop / 解構 / 回寫流程
- [x] 法修高境界 stance 的 `player world strike` 可見性也已補齊到基本攻擊視角，`道法自然 / 五氣朝元 / 仙法通神 / 萬法歸宗` 不再只在施法 world strike 或 timeline combat 才看得到
- [x] `空間法則` 也已補進法修基本攻擊的 `player world strike` stance，可直接從進攻視角看到虛空轉移待命
- [x] `runAutoBattle()` 的 runtime / seed / tick wiring 也已開始收斂到 `prepareAutoBattleExecution(...)`，主函式不再自己鋪開整段 battle setup
- [x] 敵方出手後的劍勢回補與特招冷卻回推，也已開始拆到 `resolveEnemySwordHeartAftermath(...) / resolveEnemySpecialReadyAfterAction(...)`，enemy action phase 的尾端流程更接近單一 resolver
- [x] 敵方行動分支也已開始整併到 `resolveEnemyTurnPhase(...)`，敵方出手窗口、控制跳過與完整出手鏈不再直接在主循環維護雙段流程
- [x] 戰鬥勝敗尾端也已開始整併到 `finalizeCombatResult(...)`，勝利掉落與敗北記錄不再直接堆在主流程尾端
- [x] 法修高境界被動的開場待命訊息也已補齊到 `仙法通神 / 萬法歸宗`
- [x] `s_f_passive` / `b_bi_passive` / `m_im_passive` 也已補齊 timeline combat 開場待命訊息，正式標出 `養劍術` / `金剛法相` / `五氣朝元`
- [x] 戰利品字串組裝也已開始整併到 `buildVictoryLootMessage(...)`，勝利結算函式不再直接攤開品質字樣與掉落名稱拼裝
- [x] 舊戰報 replay 的 session advance、step delay 與 visual payload 組裝，也已開始收斂到 `advanceAutoBattleReplaySession(...) / runAutoBattleReplayStep(...) / createBattleReplayStepPlan(...) / queueTimedCombatPlan(...) / createBattleReplayVisualPlan(...)`
- [ ] 地圖內戰鬥與時間軸內核整合為同一套即時引擎（目前僅完成 shared helper 收斂；`Adventure` 的 live world / replay orchestration 與 `runAutoBattle()` 的 timeline loop 仍是兩條主控路徑）

---

## 11. 即時戰鬥表現層

- [x] 完全移除現在的戰報 modal 戰鬥表現
- [x] 先將 battle modal 弱化為右下角戰鬥 HUD，降低對主場景遮蔽
- [x] 把傷害數字回灌到地圖戰鬥單位上（第一版浮字）
- [x] 為玩家顯示戰鬥中的血條
- [x] 為怪物顯示戰鬥中的血條 / 目標血條
- [x] 為技能加入施法前搖 / 命中特效
- [x] 為遠程技能加入投射物動畫
- [x] 為 AOE 技能加入地面範圍提示
- [x] 為近戰命中加入受擊閃爍或震動反饋
- [x] 為死亡加入消失 / 倒地 / 潰散表現
- [x] 為玩家與怪物加入戰鬥中狀態圖示
- [x] 地圖內即時擊殺會直接結算修為、靈石與掉落

---

## 12. 狀態效果與技能專屬效果

- [x] `stun` 已有基礎接線
- [x] `burn` 正式進入時間軸傷害
- [x] `poison` 正式進入時間軸傷害
- [x] `bleed` 正式進入時間軸傷害
- [x] `shield` 正式進入傷害吸收
- [x] `armorBreak` 正式進入防禦削弱
- [x] 開始把部分技能與被動改成逐招專屬效果
- [x] `s_n_passive` 護體劍罡：致命傷害抵擋 + 反震（每戰 1 次）
- [x] `s_g_passive` 劍心通明：暴擊觸發 `s_f_active` 冷卻重置
- [x] `b_n_passive` 滴血重生：依最大生命與已損生命持續回血
- [x] `m_n_passive` 法力源泉：持續回靈 + 高靈力增傷
- [x] `s_sf_passive` 劍意化形：普攻雙段追擊
- [x] `s_bi_passive` 人劍合神：控制縮時
- [x] `s_ma_passive` 劍道獨尊：單體暴擊收益
- [x] `b_bi_active` 法天象地：回復 + 巨靈護體
- [x] `b_bi_passive` 金剛法相：最終承傷降低
- [x] `m_bi_passive` 五氣朝元：零耗藍 + 雙回復
- [x] `b_sf_passive` 肉身成聖：高額單次傷害減半
- [x] `b_vr_passive` 荒古戰體：定時震散 1 個負面狀態
- [x] `m_vr_passive` 空間法則：部分來襲傷害轉入虛空
- [x] `m_ma_passive` 言出法隨：主動術式增傷
- [x] `s_tr_passive` 向死而生：低血量必暴與增傷
- [x] `b_tr_passive` 萬劫不滅：承傷疊層防禦
- [x] `m_tr_passive` 雷劫煉心：雷屬承傷轉回復
- [x] `b_ma_passive` 滴血重生（真）：死亡逆轉 + 短暫無敵
- [x] `b_im_passive` 仙體無垢：持續傷害免疫 + 回復強化
- [x] `m_im_passive` 仙法通神：戰鬥掛載 + 第二次施法回響
- [x] `s_im_passive` 仙元護體：定時一次性護體
- [x] `m_ie_active` 一念花開：敵方優勢逆轉為多重 debuff
- [x] `s_ie_passive` 萬法皆空：普攻真傷式穿透 + 負面狀態免疫
- [x] `m_ie_passive` 萬法歸宗：敵方術式延後 + 元素反擊削弱
- [x] `m_tr_active` 九霄神雷：對麻痺目標額外增傷
- [x] `s_ma_active` / `m_tr_active` / `b_ma_active` 已開始直接承接 retired 高境界主動額外分支
- [x] `s_ma_active` 已補上 `絕仙封脈` 的 timeline combat 接線，會實際延後敵方特招節奏
- [x] 敵方特招的初始延後與後續節奏壓制，也已開始抽成共用 helper，`萬法歸宗 / 絕仙封脈` 不再在 timeline 主循環各自散寫
- [x] `s_tr_active` 已開始直接承接 `誅仙劍陣` 的持續壓制與破甲分支
- [x] `m_tr_active` 已開始直接承接 `掌心雷` 的麻痺分支
- [x] `b_ie_active` 掌中神國：額外神國抽離 + 最大生命吸收
- [x] `b_ie_passive` 不死不滅：生命不低於 1
- [x] `b_f_passive` 蠻荒血脈：依已損失氣血逐層抬升攻勢與護體
- [x] `m_g_passive` 元素護盾：完整抵擋一次敵方術式傷害
- [x] `b_g_passive` 荊棘皮層：僅在近戰命中時反震，不再對遠程 / 術式一律生效
- [x] `m_sf_passive` 道法自然：冷卻縮減已補上明確戰鬥事件與共用 cooldown resolver
- [x] `s_q_passive` 劍脈初成：暴擊時追加 `劍脈破甲`
- [x] `b_q_passive` 銅皮鐵骨：已補上明確減傷分支與戰鬥事件
- [x] `m_q_passive` 靈潮循環：施法後回復靈力，已補上專屬戰鬥事件
- [x] `m_f_passive` 靈力湧動：維持專屬術式蓄勢效果，不再誤接進共用冷卻縮減
- [x] `m_f_passive` / `m_bi_passive` 已補上 world strike 狀態回報，正式標出 `靈力湧動` / `五氣朝元`
- [x] `s_ma_passive` / `m_ma_passive` 已補上 world strike 對齊與明確戰鬥事件，不再只有時間軸內核默默生效
- [x] `b_sf_passive` / `m_vr_passive` 已補上 enemy world strike 對齊，正式回報 `肉身成聖` / `空間法則`
- [x] `b_g_passive` / `b_f_passive` / `b_q_passive` / `b_bi_passive` / `m_g_passive` 已補上 enemy world strike 對齊，正式回報 `反震` / `蠻荒血脈` / `銅皮鐵骨` / `金剛法相` / `元素護盾`
- [x] `b_tr_passive` / `m_tr_passive` 已補上 enemy world strike 對齊，正式回報 `萬劫不滅` / `雷劫煉心`
- [x] `s_n_passive` / `b_ma_passive` / `b_ie_passive` 已補上 enemy world strike 對齊，正式回報 `護體劍罡` / `滴血重生` / `不死不滅`
- [x] `b_im_passive` / `s_ie_passive` 已補上 enemy special world strike 對齊，正式回報 `仙體無垢` / `萬法皆空`
- [x] `m_tr_passive` 已補上 enemy special world strike 對齊，正式回報 `雷劫煉心`
- [x] 道途內的突破按鈕提示也已切到 `GameHintBubble`，再少一個原生 `title` 提示
- [x] player world strike 的被動狀態回報已開始抽成共用 helper，並補上 `蠻荒血脈` / `靈潮循環` / `劍脈初成` / `法則之劍`
- [x] `s_g_passive`：在劍修 world strike 暴擊時也已開始明確回報 `劍心通明`
- [x] `b_sf_passive`：在 player world strike 也已開始明確回報 `肉身成聖`
- [x] `getPlayerPassiveFlags()` 已改成明確 skill id 對照，不再把不同 retired passive 透過 formal id 錯誤折疊成同一串 battle flag
- [x] formal core 對 retired passive 的承接已改成顯式 alias 對照，不再靠模糊 canonical 折疊維持 battle 行為
- [x] `m_n_passive` / `m_f_passive` / `m_bi_passive` 已開始補齊 world strike 狀態回報，正式標出 `法力源泉` / `靈力湧動` / `五氣朝元`
- [x] `s_ie_passive` 已開始補齊 player world strike 對齊，正式標出 `萬法皆空`
- [x] `s_sf_passive` 已開始補齊 player world strike 對齊，正式標出 `劍意化形`
- [x] `s_n_passive` / `b_n_passive` 已開始補齊 player world strike 對齊，正式標出 `護體劍罡` / `滴血重生`
- [x] `b_q_passive` / `m_g_passive` 已開始補齊 player world strike 對齊，正式標出 `銅皮鐵骨` / `元素護盾`
- [x] `b_g_passive` 已開始補齊 player world strike 對齊，正式標出 `荊棘皮層`
- [x] `s_f_passive` / `b_bi_passive` 已開始補齊 player world strike 對齊，正式標出 `養劍術` / `金剛法相`
- [x] `b_tr_passive` / `m_tr_passive` 已開始補齊 player world strike 對齊，正式標出 `萬劫不滅` / `雷劫煉心`
- [x] `b_im_passive` / `b_ie_passive` 已開始補齊 player world strike 對齊，正式標出 `仙體無垢` / `不死不滅`
- [x] `s_bi_passive` / `b_ma_passive` 已開始補齊 player world strike 對齊，正式標出 `人劍合神` / `滴血重生（真）`
- [x] `m_sf_passive` 已開始補齊 player world strike 對齊，正式標出 `道法自然`
- [x] enemy world strike 的減傷 / 保命被動判定已開始抽成共用 trigger helper，減少 `resolveEnemyWorldStrike()` 內的重複流程
- [x] enemy world strike 的 incoming status 過濾已開始和 timeline combat 對齊，正式共用 DOT / 負面狀態免疫規則
- [x] enemy special 的免疫 / 控制縮短訊息，也已開始抽成共用 resistance helper，減少 `仙體無垢` / `萬法皆空` / `雷劫煉心` / `人劍合神` 的散寫風險
- [x] 玩家主動術式施加給敵方的控制型狀態與後續破甲追擊，也已開始和 timeline combat 共用同一層 enemy-status resolver；`霸體` 過濾與 `劍脈破甲` 不再 world / timeline 各寫一份
- [x] 玩家主動術式施加的 `盾、破甲、DOT、反震、劍氣` 訊息，也已開始抽成共用 status logger，降低時間軸戰鬥內逐段手寫的重複度
- [x] 玩家主動術式的資源 / 冷卻流，也已開始抽成 `resolvePlayerActiveResourceFlow(...)`，把術式免耗、冷卻縮短、靈潮回補、劍心重置與法修築基層數累進集中處理
- [x] `劍意化形 / 虛空劍陣 / 撒豆成兵` 這批多段追擊與召喚後續傷害，也已開始抽成 `applyPlayerEchoAndSummonFollowupEffects(...)`
- [x] 敵方來襲後的承傷流程，也已開始抽成 `resolveIncomingEnemyDamage(...)`，把 `銅皮鐵骨 / 金剛法相 / 肉身成聖 / 元素護盾 / 護體劍罡` 這批減傷、護盾與保命流程集中到同一條處理鏈
- [x] 敵方命中後的承傷反應鏈，也已開始抽成 `applyEnemyHitAftermath(...)`，把 `萬劫不滅 / 雷劫煉心 / 噬生 / 滴血重生（真） / 不死不滅` 這批後處理事件集中處理
- [x] 敵方出手前的攻勢計算，也已開始抽成 `resolveEnemyOffenseRoll(...)`，把屬性克制、特招倍率、格擋 / 閃避 / 虛空轉移與承傷前數值準備集中處理
- [x] world strike 結果組裝也已開始拆成 `buildPlayerWorldStrikeResult(...) / buildEnemyWorldStrikeResult(...)`，enemy 端 timing metadata 亦已抽成 `buildEnemyWorldStrikeTiming(...)`
- [x] player / enemy world strike 的前置 runtime 組裝，也已開始拆成 `createPlayerWorldStrikeRuntime(...) / createEnemyWorldStrikeRuntime(...)`，world 視角的攻勢上下文、被動旗標、克制、元素修正與 incoming status 不再在結果函式中重複鋪排
- [x] world strike 的結果運算本體，也已開始拆成 `resolvePlayerWorldStrikeOutcome(...) / resolveEnemyWorldStrikeOutcome(...)`，strike 入口逐步退回 orchestration 角色
- [x] world strike 的被動狀態整理也已拆層：enemy 端改成 `defensive / survival` 兩段 helper，player 端改成 `sword / body / mage` 三段 helper
- [x] 第一批高境界 retired active alias 已補上明確 realtime metadata，像 `m_bi_active / s_im_active / m_ie_active` 不再只靠 default fallback 推估範圍與施法節奏
- [x] timeline combat 的致命保命流程已開始抽成共用 fatal-survival helper，集中處理 `護體劍罡` / `滴血重生（真）` / `不死不滅`
- [x] formal core 被動的 stat bonus 已改成逐招明確對照表，不再依職業 + 境界通用公式自動推導
- [x] absorbed retired passive 透過 formal id 承接時，也會吃到同一份逐招 stat bonus 對照，不再靠模糊 profession-tier fallback 撐場
- [x] timeline combat 內主動術式施加的 player-side / enemy-side 狀態，已開始共用「狀態推入 + 戰鬥日誌」helper，不再在 `runAutoBattle()` 裡逐段手寫
- [x] `祖巫降臨 / 法天象地 / 掌中神國 / 一念花開 / 破劫一擊` 這批高境界主動的後續效果，也已開始收斂到共用 follow-up helper
- [x] `World / UI / Audit` 文件已再做多輪交叉校對，地圖情報 tooltip、短提示 eyebrow 與 battle shared resolver 的描述已開始對齊目前實作
- [x] `荒古戰體 / 仙元護體` 也已開始在 player world strike 直接回報，不再只靠 timeline combat 開場待命訊息呈現
- [x] retired active / passive 的 alias 剝離 helper，已回收到 alias 檔本體，realm view 不再在 `data/skills/index.ts` 額外重複維護同一套過濾規則
- [x] retired active / passive alias 也已補上 alias-layer 聚合表，正式 realm dataset 現在可直接由 alias-layer 組裝，不再在 `data/skills/index.ts` 手動攤開多份 alias 清單
- [x] retired active / passive alias 的 record / view 組裝，也已開始共用 `retired_alias_utils.ts`，alias-layer 不再維護兩份近似的 `Object.fromEntries / Object.values` 樣板
- [x] retired active / passive alias 的總表合併，現在也已開始共用 `mergeRetiredAliasRecords(...)`，alias-layer 不再各自維護 `Object.assign(...Object.values(...))` 樣板
- [x] `battle-absorbed` 的 retired alias 輸出尾端，也已開始共用 `buildRetiredAliasExportSet(...)`，active / passive alias 檔不再各自維護同一組視圖樣板
- [x] skill index 內 `battle-absorbed / retirement-ready` retired skill 的正式視圖組裝，也已開始共用 `buildSkillViewSet(...)`，不再四段重複 map 同一批 alias view
- [x] `battle-absorbed / retirement-ready` 的 active / passive alias record，也已開始直接由 alias-layer 聚合表和 skill ID 名單組裝，不再在 alias 檔裡平鋪手寫同一份 retired alias map
- [x] formal realm dataset 的組裝現在已直接回到各境界 `core` skill set，本體不再重複拼接 retired alias
- [x] retired alias 的 realm 聚合已回收到 alias-layer，formal realm dataset 不再注入 retired alias 後再剝離
- [x] formal realm dataset 現在已直接以 core skill set 組裝，不再先注入 retired alias 再交給 skill index 剝離
- [x] `RETIRED_SKILLS_BY_REALM / getRetiredSkillsByRealm` 過渡查詢層已移除，realm dataset 現在只保留 `core only` 正式視角
- [x] `CORE_SKILL_SETS_BY_REALM` 現在也已成為正式 export，realm dataset 的 `core only` 視圖不再只是 skill index 內部實作細節
- [x] retirement-ready passive 視圖也已改成直接由 alias-layer 聚合表組裝，skill index 不再額外以 ID 清單重建同一份資料
- [x] battle-absorbed passive 視圖也已改成直接由 alias-layer 聚合表組裝，skill index 不再額外以 ID 清單重建同一份資料
- [x] `StatsPanel / ShopPanel` 的主要資訊浮層已進一步對齊 `GameTooltip` 的標題 / 註腳結構
- [x] `Adventure` 區域地圖情報與 `Compendium` 額外掉落來源浮層，已開始對齊同一套 `GameTooltip` 標題 / 註腳結構
- [x] `Stats / Dashboard / Shop / 地圖 / 圖鑑` 這批核心浮層，已開始補齊 `GameTooltip` 的 `eyebrow`，往完整 `eyebrow + title + body + footer` 語言收口
- [x] `GamePanel / Modal` 已開始對齊 `eyebrow + title + icon` 的正式殼層語言，主頁面板、商店、任務、突破、背包確認與地圖總覽不再各自為政
- [x] `GameHintBubble` 也已開始補齊 `eyebrow + body` 的短提示層級，dock、側欄、背包與道途操作提示不再只是裸文字浮泡
- [x] `m_im_passive` / `m_ie_passive` 已開始補齊 world strike 狀態回報，正式標出 `仙法通神` / `萬法歸宗`
- [x] `b_vr_passive` / `s_im_passive` 已開始補齊 timeline combat 開場待命訊息，正式標出 `荒古戰體` / `仙元護體`
- [x] `s_sf_passive` / `b_sf_passive` / `m_sf_passive` 已開始補齊 timeline combat 開場待命訊息，正式標出 `劍意化形` / `肉身成聖` / `道法自然`
- [x] `s_g_passive` / `s_n_passive` / `b_f_passive` / `b_n_passive` / `m_f_passive` 已開始補齊 timeline combat 開場待命訊息，正式標出 `劍心通明` / `護體劍罡` / `蠻荒血脈` / `滴血重生` / `靈力湧動`
- [x] `s_ie_passive` / `b_ie_passive` 已開始補齊 timeline combat 開場待命訊息，正式標出 `萬法皆空` / `不死不滅`
- [x] `s_bi_passive` / `b_tr_passive` / `m_tr_passive` 已開始補齊 timeline combat 開場待命訊息，正式標出 `人劍合神` / `萬劫不滅` / `雷劫煉心`
- [x] `m_vr_passive` / `b_im_passive` / `s_ma_passive` / `m_ma_passive` 已開始補齊 timeline combat 開場待命訊息，正式標出 `空間法則` / `仙體無垢` / `劍道獨尊` / `言出法隨`
- [x] 多個已完成專屬接線的 passive，已開始移除手寫 generic `passiveEffectTags`，降低資料層誤導
- [x] 第一批已完成專屬接線的 passive，現在也已退出 generic `passiveEffectTags` fallback，skill index 不再自動替它們補通用標籤
- [x] 練氣三職業核心被動 (`劍脈初成 / 銅皮鐵骨 / 靈潮循環`) 也已退出 generic `passiveEffectTags` fallback，前中期技能資料不再維持假 generic 狀態
- [x] retired passive alias 也已退出 generic `passiveEffectTags` fallback，舊被動相容層不再維持假 generic 描述
- [x] 所有 passive 現在都已退出 generic `passiveEffectTags` fallback，`passiveEffectTags` 欄位本身也已自技能資料層移除
- [x] `b_n_passive` / `m_n_passive` 的回復事件已補回技能專屬戰鬥訊息，不再只走 generic regen log
- [x] battle 開場被動狀態初始化已抽成共用 helper，`b_g_passive` 開場護體也補上明確戰鬥事件
- [x] 護盾吸收與反震傷害事件，已開始抽成 battleSystem 共用 logger helper
- [x] 主動術式後的多種被動觸發訊息，已開始抽成共用 passive-proc helper，降低時間軸內核散寫風險
- [x] `GamePanel / Modal / GameTooltip` 的標題層已開始共用 `GameTitleStack`，面板與資訊浮層的遊戲化資訊階層更一致
- [x] `GamePanel / Modal` 內原本重複存在的 eyebrow 裝飾也已移除，正式改由 `GameTitleStack` 單點承接標題階層，不再重複堆兩層同名標識
- [x] `GamePanel / Modal / GameTooltip` 的角飾、內框、頂部光帶與背景光暈，也已開始收斂到共用 `GameOrnamentFrame`
- [x] `StatsPanel / ShopPanel / Inventory / Dashboard / QuestModal` 內部的關鍵資訊區，也已開始改走共用 `GameSection`，面板內層框體語言不再各自維護，內頁 section chrome 已開始往同一套遊戲面板語言收口
- [x] `Workshop` 的聚靈陣 / 煉丹 / 煉器卡片，也已開始改走 `GameSection`，洞府百業不再維持獨立 card chrome
- [x] `Adventure` 的底部戰鬥快捷列也已開始改走 `GameSection`，地圖即時戰鬥操作面已接上同一套 section chrome
- [x] `Adventure` 內 player / enemy world strike 的預覽、施法前搖、排程與結算訊息，也已開始共用 queue / preview / resolution helper，地圖即時戰鬥分支不再各自維護兩套 readyAt / 傷害文案流程
- [x] `Adventure` 內 player / enemy world strike 與舊戰報 replay 的 resolved timed plan enqueue，現在已開始共用 `runPlayerWorldStrikeAction(...) / runEnemyWorldStrikeAction(...) / runAutoBattleReplayStep(...)` 的 resolved-step 路徑，live / replay 不再各自維護單用途 resolve / queue wrapper
- [x] `Adventure` 內 player / enemy world strike 的 live 出手鏈，現在已回收到 `battleSystem.ts` 的 `runPlayerWorldStrikeAction(...) / runEnemyWorldStrikeAction(...)`，頁面不再自己維護 player / enemy 的 resolved strike plan 樣板
- [x] `Adventure` 內 player / enemy world strike 的 action plan 也已正式直接回到 `createWorldStrikeQueuePlan(...)`，queue helper 不再各自臨時拼接 cast、preview 與 execute 閉包
- [x] `Adventure` 內 player / enemy world strike 的出手入口，現在也已回收到 `runPlayerWorldStrikeAction(...) / runEnemyWorldStrikeAction(...)`，live 分支不再各自維護 `Date.now()`、readyAt 與 resolved strike plan 樣板
- [x] `Adventure` 內 player / enemy world strike 的 live 出手鏈，現在直接走 `runPlayerWorldStrikeAction(...) / runEnemyWorldStrikeAction(...)`
- [x] `Adventure` 內 auto-target 與 live world action window 的判定，現在也已開始共用 `resolveWorldCombatAutoTarget(...) / runWorldCombatStep(...)`，頁面不再自己維護最近怪與雙方出手條件邏輯
- [x] `queueResolvedWorldStrike(...)` 也已改成更單純的 `queueWorldStrikePlan(...)`，live world action 現在只保留 timed 判定、strike resolve 與 plan 執行三段
- [x] `Adventure` 內 world strike 與舊戰報 replay 的延遲排程，也已開始共用 `scheduleTimedCombatAction(...)`，不再各自維護一套 `setTimeout` orchestration
- [x] `Adventure` 內 world strike 與舊戰報 replay 的 timed plan，也已開始共用 `queueTimedCombatPlan(...)` 的 onQueue/execute 模型，battle timer orchestration 不再維持兩種樣板
- [x] `Adventure` 內 world strike 與舊戰報 replay 的 timed plan，現在也已共用同一個 `TimedCombatQueuePlan` 形狀，battle timer orchestration 不再拆成 world / replay 兩種資料結構
- [x] `Adventure` 內 world strike 與舊戰報 replay 的 timed plan 建構，現在也已進一步共用 `createTimedCombatPlan(...)`，queue payload 不再在兩條路徑各自手組
- [x] `Adventure` 內 world strike 與舊戰報 replay 的 timer 清理，現在也已回到同一個 combat timer manager，world / replay 不再各自散寫 timer set 的清空邏輯
- [x] `Adventure` 內 world strike 的 queue plan 現在也已直接使用 `createWorldStrikeQueuePlan(...)`，player / enemy 分支不再保留額外的 resolved plan wrapper
- [x] 舊戰報 replay 的 projectile / area / impact / text 派發，現在也已開始共用同一批 world strike 視覺 helper，不再額外維護第二套 effect dispatch
- [x] 舊戰報 replay 的逐步播片流程，也已開始抽成 `advanceAutoBattleReplaySession(...) / runAutoBattleReplayStep(...) / createBattleReplayStepPlan(...) / queueTimedCombatPlan(...)`，log、snapshot 與特效派發不再直接塞在 replay effect 的定時器分支內
- [x] 舊戰報 replay 的目標怪解析與技能名正規化，也已開始併入 `runAutoBattleReplayStep(...)`，replay orchestration 不再每次在 effect 內重做 target / skill 組裝
- [x] `Adventure` 內 player / enemy world strike 的 projectile / area / impact / text dispatch 也已開始共用 visual helper，地圖即時戰鬥效果派發不再各自維護兩套流程
- [x] `Adventure` 內 player / enemy world strike 與 replay step 的 visual payload，也已開始共用 `WorldStrikeVisualPlan` 路徑，live / replay 不再各自手拼 projectile、area 與 impact payload
- [x] `Adventure` 內 player / enemy world strike 的實際執行鏈也已開始抽成 `executePlayerWorldStrike(...) / executeEnemyWorldStrike(...)`，命中後流程不再各自攤開
- [x] `FINAL_CULL_SKILL_GROUPS_BY_PROFESSION / FINAL_CULL_SKILLS_BY_PROFESSION / FINAL_CULL_SKILL_MAP_BY_PROFESSION` 也已正式存在，最後一批 `transition / legacy` 技能刪整可以直接按職業切進 final cull replacement 視圖
- [x] `FINAL_CULL_SKILLS_BY_PROFESSION_AND_REPLACEMENT` 也已正式存在，現在最後一批技能本體刪整可以直接按「職業 × replacement」切進 final cull 視圖
- [x] `FINAL_CULL_SKILL_MAP_BY_PROFESSION_AND_REPLACEMENT / FINAL_CULL_SKILL_IDS_BY_PROFESSION` 也已補齊，最後一批 `transition / legacy` 技能刪整現在已有可直接批次操作的 id/map 視圖
- [x] `FINAL_CULL_SKILL_POOL_GROUPS_BY_PROFESSION / FINAL_CULL_SKILL_PROFESSION_POOLS / FINAL_CULL_SKILL_POOL_REGISTRY` 也已補齊，最後一批刪整現在不只可看 skill view，也可直接用 pool entry registry 做 profession / replacement 兩層批次處理
- [x] `FINAL_CULL_SKILL_POOL_MAP_BY_PROFESSION / FINAL_CULL_SKILL_POOL_MAP_BY_PROFESSION_AND_REPLACEMENT / FINAL_CULL_SKILL_POOL_IDS_BY_PROFESSION` 也已補齊，最後一批刪整現在已有可直接操作的 pool entry profession / replacement / id 視圖
- [x] `FINAL_CULL_REPLACEMENT_TARGET_POOLS_BY_PROFESSION / FINAL_CULL_REPLACEMENT_TARGET_POOL_MAP_BY_PROFESSION / FINAL_CULL_REPLACEMENT_TARGET_IDS_BY_PROFESSION` 也已補齊，最後一批刪整現在連保留目標的 core pool 視角都可直接批次核對
- [x] `FINAL_CULL_SKILL_POOL_IDS_BY_PROFESSION_AND_REPLACEMENT` 也已補齊，最後一批刪整現在已有 profession × replacement 的 pool entry id 名單可直接操作
- [x] `FINAL_CULL_SKILL_POOL_COUNTS_BY_PROFESSION / FINAL_CULL_SKILL_POOL_COUNTS_BY_PROFESSION_AND_REPLACEMENT` 也已補齊，最後一批刪整現在可直接看各 profession / replacement cluster 還剩多少 entry
- [x] `FINAL_CULL_REPLACEMENT_PLANS_BY_PROFESSION / FINAL_CULL_REMOVAL_POOL_IDS_BY_PROFESSION / FINAL_CULL_REMOVAL_POOL_IDS_BY_PROFESSION_AND_REPLACEMENT` 也已補齊，最後一批刪整現在已有直接可執行的保留 / 刪除 manifest
- [x] `FINAL_CULL_REPLACEMENT_TARGET_SKILLS_BY_PROFESSION / FINAL_CULL_REPLACEMENT_TARGET_SKILL_MAP_BY_PROFESSION / FINAL_CULL_REMOVAL_SKILLS_BY_PROFESSION / FINAL_CULL_REMOVAL_SKILLS_BY_PROFESSION_AND_REPLACEMENT` 也已補齊，最後一批刪整除了 pool entry manifest 之外，也已有直接可操作的 skill-level 保留 / 刪除名單
- [x] `FINAL_CULL_TRANSITION_REMOVAL_POOL_IDS_BY_PROFESSION / FINAL_CULL_LEGACY_REMOVAL_POOL_IDS_BY_PROFESSION` 與對應 skill-level removal views 也已補齊，最後一批刪整現在可直接分成 transition pass 與 legacy pass 執行
- [x] `FINAL_CULL_TRANSITION_REMOVAL_SKILLS_BY_PROFESSION / FINAL_CULL_LEGACY_REMOVAL_SKILLS_BY_PROFESSION` 與對應 replacement 視圖，現在也已開始共用 `buildRemovalSkillArtifacts(...)` 集中組裝
- [x] 這批 `FINAL_CULL` 的 skill / pool / target / removal manifests，現在也已開始由共用 builder 集中組裝，不再在 `index.ts / pool.ts` 各自手拼多段近似的 `map / ids / counts` 樣板
- [x] `FINAL_CULL_REPLACEMENT_MANIFESTS_BY_PROFESSION` 與對應 `transition / legacy` manifests 也已補齊，現在每個 replacement cluster 都可直接看到 `keepSkill / keepPool / removeSkills / removePools`
- [x] `FINAL_CULL_PASS_MANIFESTS_BY_PROFESSION` 與對應 `transition / legacy` pass manifests 也已補齊，最後一批技能本體刪整現在可以直接按 profession 跑 pass，而不必再從 replacement manifest 二次展平
- [x] `FINAL_CULL_POOL_PASS_MANIFESTS_BY_PROFESSION` 與對應 `transition / legacy` pool pass manifests 也已補齊，最後一批技能本體刪整現在連 pool entry 刪除 pass 都可直接按 profession 執行
- [x] 被動技能改成逐招專屬效果，而不是通用屬性加成

---

## 13. UI / 遊戲殼與面板遊戲化

- [x] 把原本網頁式側欄切頁改成全畫面遊戲殼層
- [x] 以單一主場景 + 浮動面板取代多頁切換
- [x] 左上 HUD 合併為單一角色資訊模組
- [x] 移除 HUD 中的區域資訊
- [x] 浮動面板可用於道途 / 背包 / 洞府 / 圖鑑
- [x] 修正面板關閉按鈕遮擋內容問題
- [x] 修正右上 HUD 擋到地圖操作區問題
- [x] 調整道途右欄與修煉日誌布局
- [x] 把修煉日誌移到左側並佔滿剩餘高度
- [x] 背包改成左主區 + 右裝備 / 詳情的雙艙結構
- [x] 圖鑑改走同一套面板殼層
- [x] 角色屬性與商店道具 tooltip 已開始共用同一套遊戲化 `GameTooltip` 外觀
- [x] 圖鑑內部的掉落來源 tooltip 也已切到同一套 `GameTooltip` 外觀
- [x] 側欄、道途與洞府百業的操作提示，已開始共用同一套 `GameHintBubble` 外觀
- [x] 背包操作按鈕與區域地圖節點提示，也已開始共用 `GameHintBubble`，逐步收掉原生 `title` 與散落的手寫提示框
- [x] 背包格內的裝備、技能書與消耗品 hover，也已切到同一套 `GameTooltip`，開始直接對齊互動目標
- [x] 戰鬥場景的小地圖操作提示與圖鑑掉落品階 badge，也已切到共用的 `GameHintBubble`
- [x] 底部浮動 dock 的面板切換提示，也已切到共用 `GameHintBubble`，面板切換不再只靠圖示猜測
- [x] 道途頁的人物道號與修煉效率說明，也已切到共用 `GameTooltip`，再少兩塊手寫 hover 面板
- [x] 任務對話視窗中的裝備 / 技能書獎勵，也已補上 hover `GameTooltip`，不再只剩純文字獎勵列
- [x] 任務獎勵 tooltip 的標題也已開始對齊品質色階，和商店 / 背包裝備顯示共用同一套辨識語言
- [x] 區域地圖傳送點 / NPC、工坊升級、圖鑑掉落品階 badge、背包尾端物品操作等短提示，也已補齊 `GameHintBubble` 的 eyebrow
- [x] 進一步把所有面板內部視覺做成更明確的遊戲化框體語言
- [x] 讓技能書、裝備、角色詳情 tooltip 都完全對齊互動目標
- [x] 補上更完整的戰鬥 HUD 第一版，例如目標血條與最近戰況
- [x] 補上更完整的戰鬥 HUD 後續項之一：技能 CD 顯示
- [x] 補上更完整的戰鬥 HUD 後續項，例如快捷列

---

## 14. 技術評估與 3D 規劃

- [x] 盤點目前 2D / Pixi 呈現架構
- [x] 盤點 Three.js / WebGL / 3D 的可行性
- [x] 建立 3D 改造評估文件
- [x] 明確寫出目前不適合直接全面切 3D 的結論
- [x] 建立單地圖 3D prototype 的技術方案
- [x] 若未來要切 3D，列出資產規格、動畫來源、效能預算與遷移順序

---

## 15. 自動化驗證與測試

- [x] 修為公式測試
- [x] 戰鬥數值測試
- [x] 技能書覆蓋測試
- [x] 角色學習技能書測試
- [x] 地圖接戰測試
- [x] 世界戰鬥距離工具測試
- [x] 時間軸戰鬥事件測試
- [x] 技能即時欄位工具測試
- [x] 補上築基三路 Boss 的低裝門檻 / 進階裝挑戰測試
- [x] `npm run typecheck` 目前可通過
- [x] `npm run test` 目前可通過
- [x] `npm run build` 目前可通過
- [x] 補上高境界戰鬥門檻測試（第一版：化神 Boss 門檻）
- [x] 補上即時地圖戰鬥表現層測試
- [x] 補上技能專屬效果測試

---

## 16. 最終尚未完成的核心區塊

這些是目前最重要、但還沒真正落地完成的部分：

- [ ] 地圖內戰鬥與時間軸內核整合為同一套即時引擎（`Adventure` 的 live world / replay orchestration 與 `runAutoBattle()` 的 timeline loop 仍是兩條主控路徑）
- [x] 三職業正式技能池最終裁剪（正式職業池、正式 realm 視圖與公開 registry 都已鎖定為 `core only`；`transition / legacy` 現在只保留中央 alias 相容與 final cull manifests）
- [x] 高境界技能欄位與效果補完
- [x] 高境界怪物 / 精英 / Boss 內容密度補完（密度、主題化、裝備 / 節奏驗證已補完）
- [x] 地圖內真正即時戰鬥，不再依賴戰報 modal
- [x] 投射物、AOE、狀態效果、技能特效正式上線
- [x] 高境界裝備與掉落節奏驗證
- [x] 正式文件全面交叉校對到完全一致
