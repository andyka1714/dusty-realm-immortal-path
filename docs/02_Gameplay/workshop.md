# 洞府百業 (Workshop)

目前 `聚靈陣 / 煉丹 / 煉器` 三個卡片已統一吃 `GameSection` 的內層框體語言，不再各自維護獨立 card chrome。`add-workshop-and-event-loops` 第一批也已把 `煉丹 / 煉器` 從 placeholder 推進成正式可操作 slice，`update-high-tier-workshop-depth` 已把第一批高階 recipe、材料 sink、熟練度與 UI cue 接進主流程，`update-workshop-specialization-expansion` 已補上第二批中高階 / 終盤 recipe 與第一批專精效果，`expand-workshop-source-specialization-unlocks` 已把材料來源與專精解鎖 / 切換成本正式化，`update-workshop-specialization-tree` 進一步把專精從單一 slot 升級成可重置的分支樹，`update-workshop-economy-specialization-v2` 則把 mastery milestone、二層 leaf 與終盤 recipe sink 接成第二輪百業深度。`update-workshop-route-source-specialization-v3` 再把三宗 v3 world memory tag 接到 high-tier recipe route source、world chapter cue 與 specialization leaf cue。

## 1. 聚靈陣 (Spirit Array)
- **功能**: 提升基礎修煉速率。
- **升級**: 消耗靈石與材料提升等級。
- **定位**: 作為穩定底盤乘區，承接洞府線的常駐收益。

## 2. 煉丹 (Alchemy)
- **第一批正式丹方**:
  - `聚氣丹`: 消耗 `聚靈草 x2 + 25 靈石`，產出 `聚氣丹 x1`
- **高階丹方**:
  - `太虛星魂丹`: 消耗 `縹緲星魂蓮 / 萬獸血骨殘材 / 聚靈草`，產出 `太虛破障丹`
- `九轉鴻蒙丹`: 消耗 `縹緲星魂蓮 / 萬獸血骨殘材 / 聚靈草` 與爐火靈石，產出 `鴻蒙本源`
- `萬獸飛昇液`: 消耗 `萬獸血骨殘材 / 縹緲星魂蓮 / 聚靈草`，產出 `飛昇仙引`
- `星蓮鴻蒙丹`: 消耗 `縹緲星魂蓮 / 凌霄劍星鋼 / 萬獸血骨殘材 / 聚靈草`，產出 `鴻蒙本源`
- **用途**: `聚氣丹` 可直接補修為，是輪迴後前期修煉節奏的第一個百業入口。
- **專精樹**:
  - `內火定基`: 根基節點，需 `丹道熟練 8`，提供高階丹方熟練與品質穩定 cue。
- `鴻蒙凝丹`: 需先解鎖 `內火定基` 並達 `丹道熟練 24`。效果會降低高階丹方靈石火耗並提高丹道熟練，但不減免 route-specific 材料。
- `萬獸生息`: 需先解鎖 `內火定基`、達 `丹道熟練 30` 與 `渡劫` 境界。偏向品質 / 副收益 cue 與更高熟練收益。
- `星蓮鴻蒙冠火`: 需先解鎖 `鴻蒙凝丹`、達 `丹道熟練 72` 與 `仙人` 境界。提供終盤丹方熟練、品質與副收益 cue，但不減免 route-specific 材料。
- v3 route source: 高階丹方會顯示對應 `sect:beast:world-chapter-03` 或 `sect:mystic:world-chapter-03`，並把 `劫雲荒原 / 接引仙殿` 的世界章節 cue 與 `萬獸山莊 / 縹緲仙宮` route tag 分開呈現。
  - `鴻蒙凝丹` 與 `萬獸生息` 互斥，切換到另一分支前必須先重置丹道專精樹。
- **目前定位**: 低階丹方提供修為補給，高階丹方承接宗門 / 世界後段材料，讓丹藥乘區不只停在 audit table。

## 3. 煉器 (Smithing)
- **第一批正式配方**:
  - `鏽鐵劍重鑄`: 消耗 `玄鐵礦 x2 + 妖狼牙 x1 + 35 靈石`，產出 `鏽鐵劍`
- **高階器方**:
- `萬古帝劍鍛造`: 消耗 `凌霄劍星鋼 / 萬獸血骨殘材 / 玄鐵礦` 與鍛台靈石，產出 `起源之劍`
- `星血帝劍重鍛`: 消耗 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮 / 玄鐵礦`，產出 `起源之劍`
- `大道真身鑄胚`: 消耗 `萬獸血骨殘材 / 凌霄劍星鋼 / 玄鐵礦`，產出 `大道真身`
  - `至高法杖鍛造`: 消耗 `縹緲星魂蓮 / 凌霄劍星鋼 / 玄鐵礦`，產出 `至高法則杖`
- **用途**: 讓玩家可透過材料與洞府投入，直接為當世 build 補第一件可自製裝備。
- **專精樹**:
  - `爐心定鍛`: 根基節點，需 `器道熟練 10`，提供高階器方熟練與品質穩定 cue。
- `星火鍛胚`: 需先解鎖 `爐心定鍛` 並達 `器道熟練 30`。效果會降低高階器方靈石火耗並提高器道熟練，但不減免 route-specific 材料。
- `魂鋼銘紋`: 需先解鎖 `爐心定鍛`、達 `器道熟練 36` 與 `仙人` 境界。偏向品質 / 副收益 cue 與更高熟練收益。
- `星鋼冠火`: 需先解鎖 `星火鍛胚`、達 `器道熟練 76` 與 `仙人` 境界。提供終盤器方熟練、品質與副收益 cue，但不折抵 route-specific 材料。
- v3 route source: 終盤器方會顯示 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03` 或 `sect:mystic:world-chapter-03`，讓玩家能從 recipe card 讀出凌霄劍星鋼、萬獸血骨殘材與縹緲星魂蓮分別來自哪條 v3 宗門世界章節。
  - `星火鍛胚` 與 `魂鋼銘紋` 互斥，切換到另一分支前必須先重置器道專精樹。
- **目前定位**: 低階器方驗證材料 -> 裝備實例，高階器方開始承接 route-specific 材料與終盤 build 裝備追求。

## 4. 熟練度、品質與鎖定 cue

Workshop state 已正式記錄：

- `masteryByDiscipline`
- `specializationTreeByDiscipline`
- `specializationByDiscipline`
- `craftedRecipeCounts`

`specializationTreeByDiscipline` 是新的主狀態，記錄每個 discipline 的 `unlockedNodeIds / activeNodeId / activeBranchId`。`specializationByDiscipline` 仍保留為舊存檔與舊 selector 的相容 mirror，新規則與 recipe effect 都從專精樹推導。

高階 recipe card 會顯示：

- recipe tier / 境界需求
- route tags
- 材料擁有量與來源提示
- 產出與品質提示
- 目前專精節點、啟用分支、已解鎖節點、前置節點、互斥分支、鎖定原因、切換 / 解鎖 / 重置成本與 recipe 受專精影響的 cue
- mastery milestone 達成數、剩餘熟練需求與 milestone cue
- leaf effect，包括適用 tier、熟練收益、品質 cue 與副收益 cue
- `丹道 / 器道` 熟練度收益與專精後的調整值
- route-specific 材料來源 cue，對應到實際 encounter 的 route / category
- v3 route source cue，包含 `sect:*:world-chapter-03`、route tag、`劫雲荒原 / 接引仙殿` world chapter cue 與 specialization effect cue
- 境界、百業等級、靈石或材料不足時的鎖定原因

舊存檔若缺少熟練度或專精樹欄位，migration 會補上安全預設值。若舊存檔仍只有扁平 `specializationByDiscipline`，合法舊專精會映射成對應專精樹節點並自動補上必要前置節點；不合法或未知值不會成為 active tree node。

`update-workshop-economy-specialization-v2` 沒有新增 persisted state。`WORKSHOP_MASTERY_MILESTONES` 只從既有 `masteryByDiscipline` 推導狀態，二層 leaf 仍寫在 `specializationTreeByDiscipline / specializationByDiscipline` 既有欄位，所以舊 migration 規則可直接承接。

`update-workshop-route-source-specialization-v3` 也沒有新增 persisted state。v3 route source 只讀 recipe metadata、既有 route material、既有 `soul.worldMemoryTags` 與既有 Workshop mastery / specialization tree state；UI 只把這些來源拆成可讀 cue，不新增 `current.workshop`、`soul` 或 LocalStorage envelope 欄位，因此不需要 migration。

## 5. 事件與奇遇承接

`add-workshop-and-event-loops` 第一批也已開始把時間流逝中的遭遇，從純 log 推進成正式可選擇事件：

- `荒山藥圃`
  - 採摘靈草 -> 取得 `聚靈草`
  - 凝神觀想 -> 取得短期修為收益
- `流火匠影`
  - 提供礦材或煉器相關資源

目前 pending encounter modal 也已把這些事件的 `categoryLabel / routeLabel` 與 choice cue tags 一併顯示出來，所以玩家在下選項前可以先看懂：

- 這是偏 `山野機緣 / 職業機緣 / 宗門暗線` 的哪一類事件
- 這條路線對應的是哪個實際 route
- 每個選項是偏 `資源 / 成本 / 收益 / 風險` 哪一側

以 `荒山藥圃` 為例，現在面板會直接把 `山野機緣`、`荒山藥圃`、`聚靈草 x2`、`煉丹材料` 這類 cue 都露出來，而不是只剩文字說明。

這些事件的目的不是只補 flavor，而是讓 `丹藥 / 材料 / 修為` 真正形成循環。

`expand-sect-world-late-progression` 之後，三宗 `化神三界戰場` 里程碑也會給出：

- `凌霄劍星鋼`
- `縹緲星魂蓮`
- `萬獸血骨殘材`

這些材料已接進高階 Workshop recipe，讓宗門 / 世界後段 reward 能反向供料給百業。

`expand-workshop-source-specialization-unlocks` 之後，這三種材料也有第二批 route-specific encounter source：

- `裂虛劍星礦脈`: 凌霄劍宗 / 煉虛百業材料，提供 `凌霄劍星鋼`
- `劫骨獸巢`: 萬獸山莊 / 渡劫百業材料，提供 `萬獸血骨殘材`
- `仙潮星蓮灘`: 縹緲仙宮 / 仙人百業材料，提供 `縹緲星魂蓮`

這些來源都仍保留 profession 與 `task_04` gating，不會退化成無條件通用掉落。

`expand-encounter-content-library` Phase 1 進一步把 encounter pool 的內容覆蓋率固定成 regression：

- `元嬰 / 化神 / 煉虛 / 合體 / 大乘 / 渡劫` 都必須保有最低事件量，且不能只靠一次性事件支撐。
- `元嬰` 補上 `三界邊門` 這類世界里程碑，以及 `劍修 / 體修 / 法修` 三條可重複職業機緣。
- `合體 / 大乘` 補上三宗 route-specific 可重複事件，仍使用既有 profession 與 `sect_*_task_04` gating，不新增 encounter engine 或存檔欄位。
- 新增事件都保留 `categoryLabel / routeLabel / cue tags`，選項會在 pending panel 前置顯示材料、穩定收益、宗門路線或風險提示。

`expand-encounter-content-density-v3` 把這條線延伸到 `仙人 / 仙帝`：

- coverage regression 現在納入 `仙人 / 仙帝`，不再只驗到 `渡劫`。
- `仙人` 補上凌霄劍宗與萬獸山莊材料來源，和既有縹緲仙宮星魂蓮來源一起承接三路高階材料。
- `仙帝` 補上 `斬天帝劍盟 / 萬獸帝血獵 / 星座帝詔庭` 三條可重複 route-specific encounter，仍沿用 profession 與 `sect_*_task_04` gating，不改存檔欄位。
- 高境界通用 encounter 會補齊 `categoryLabel / routeLabel / choice cue tags`，讓 pending panel 不再只靠長描述表達收益或風險。

`expand-encounter-chain-world-memory` 則把這批事件從「單次或可重複事件」正式推進成 chain-aware encounter：

- `EncounterEvent` 現在可透過 `requiredResolvedEventIds` 與 `requiredWorldMemoryTags` 接續前置事件或跨輪迴記憶。
- chain metadata 會記錄 `chainId / step / worldMemoryTags`，選項結算後會把穩定 world memory 寫入 `soul.worldMemoryTags`。
- `PendingEncounterPanel` 與 `GameShell` 會顯示 chain label、memory cue、profession / sect cue 與選項後果提示。
- 這條線只讓 Workshop / Sect 讀穩定 key 與 route cue，不在此處重做百業或宗門任務引擎。

`expand-encounter-route-aftermath-v3` 會把三宗 v3 milestone 後的 world memory 接成 repeatable route aftermath：

- aftermath 讀取既有 `sect:*:world-chapter-03`，缺少該記憶時不解鎖。
- aftermath choice 會把 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 這類 route-specific material source 以 cue tag 顯示，讓 Workshop sink 能反向追溯來源。
- pending panel 必須顯示 `routeLabel / categoryLabel / chainLabel / memoryCue`，選項顯示穩定收益、材料來源或高風險收益 cue。
- 本 change 不新增 `current.workshop`、`current.encounter`、`soul` 或 LocalStorage envelope 欄位；只讀既有 `soul.worldMemoryTags` 與 resolved event state，因此不需要 migration 或 hydrate sanitize。

## 6. 後續可擴充部分

目前第二批 recipe、第一批專精效果、材料來源 cue、專精解鎖 / 切換成本與可重置分支樹都已完成，後續若要再擴充，重點會是：

- 更多職業 / 宗門專屬 recipe 分支
- 更多跨路線專精互斥、專精副收益實裝或更高階的 root-to-leaf 分支
