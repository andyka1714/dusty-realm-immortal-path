# 物品掉落與品質系統 (Drop & Quality System)

本文檔定義遊戲中的物品掉落機率、品質分佈以及屬性生成邏輯。

## 1. 掉落機制概覽

遊戲中的掉落分為兩個階段：
1.  **掉落判定 (Roll for Drop)**: 決定是否掉落物品。
2.  **品質判定 (Roll for Quality)**: 如果掉落裝備，決定其品質（下/中/上/仙）。

---

## 2. 掉落機率 (Drop Rates)

不同階級的敵人擁有不同的基礎掉落機率與品質權重。

| 敵人階級 (Rank) | 掉落判定 (Drop Chance) | 品質權重 (Quality Weights) |
| :--- | :--- | :--- |
| **小怪 (Common)** | **10%** (1 件) | 🟢 下品: 85% <br> 🔵 中品: 14% <br> 🟣 上品: 1% |
| **精英 (Elite)** | **35%** (1~3 件) | 🟢 下品: 50% <br> 🔵 中品: 40% <br> 🟣 上品: 9% <br> 🟠 仙品: 1% |
| **首領 (Boss)** | **100%** (3~4 件) | 🔵 中品: 30% <br> 🟣 上品: 60% <br> 🟠 仙品: 10% |

> **設計備註**: Boss 必定掉落，且是獲取上品與仙品裝備的主要途徑。精英怪則是刷中品裝備的穩定來源。

---

## 3. 品質與詞條系統 (Quality & Affixes)

裝備的最終屬性由 **基礎屬性** 乘以 **品質倍率**，再加上 **隨機詞條** 組成。

### 3.1 品質倍率 (Multiplier)

| 品質 | 顏色 | 倍率 (Multiplier) | 詞條數 (Affixes) |
| :--- | :--- | :--- | :--- |
| **下品 (Low)** | 灰色 | **1.0x** | 0 |
| **中品 (Medium)** | 綠色 | **1.2x** | 0~1 (低機率) |
| **上品 (High)** | 藍色 | **1.4x** | 1 (必帶) |
| **仙品 (Immortal)** | 金色 | **1.7x** | 2 (必帶，含特殊詞條) |

### 3.2 屬性計算公式
```typescript
FinalStats = (BaseStats * QualityMultiplier) + AffixStats
```
*   例如：基礎攻擊 10 的劍，上品 (1.4x) + 攻擊詞條 (+2)
*   結果：`10 * 1.4 + 2 = 16` 攻擊力。

### 3.3 詞條規則 (Affix Rules)
目前實作的隨機詞條與基礎數值如下 (受品質倍率加成)：

| 詞條 (Prefix) | 屬性 (Attribute) | 基礎值 (Base Value) | 備註 |
| :--- | :--- | :--- | :--- |
| **鋒利** (Sharp) | 攻擊 (Attack) | +3 | |
| **嗜血** (Blood) | 攻擊 (Attack) | +2 | |
| **堅固** (Sturdy)| 防禦 (Defense) | +2 | |
| **寒冰** (Ice) | 防禦 (Defense) | +1 | |
| **輕靈** (Agile) | 速度 (Speed) | +1 | |
| **厚重** (Heavy) | 氣血 (MaxHP) | +30 | |

*   **上品 (High)**: 詞條數值額外提升 1.5 倍
*   **仙品 (Immortal)**: 詞條數值額外提升 2.0 倍

> **未來擴展**: 目前數值針對【凡人期】平衡。隨著境界提升，將引入更高階詞條或改為百分比加成。

---

## 4. 凡人期掉落分佈 (Mortal Realm Drops)

為了鼓勵探索，凡人期的新手套裝分散於不同怪物身上：

### 小怪 (Common) - 掉落率 10%
| 怪物 | 推薦掉落 (主要) | 其他掉落 (次要) |
| :--- | :--- | :--- |
| **尖刺鼠** | `straw_sandals` (草鞋) | `wooden_charm` (平安符) |
| **野狼** | `wooden_shield` (木鍋蓋) | `novice_sword` (鏽鐵劍) |
| **野豬** | `novice_robe` (粗布衣) | `straw_sandals` (草鞋) |
| **棕熊** | `straw_hat` (草帽) | `wooden_shield` (木鍋蓋) |
| **山賊** | `novice_sword` (鏽鐵劍) | `novice_robe` (粗布衣) |

### 精英 (Elite) - 掉落率 35%
*   **所有精英怪** (如石屋守衛) 皆有機會掉落 **全套新手裝備** 中的任意 1~3 件。

### Boss - 掉落率 100%
*   **守塚老屍**: 必定掉落 **全套新手裝備** 中的任意 3~4 件。

---

## 5. 練氣期掉落分佈 (Qi Refining Drops)

練氣期裝備分為 **靈劍 (攻)**、**鍛體 (防)**、**五行 (法)** 三大套裝。
普通怪物僅會掉落基本的 **2 種** 部位，想要湊齊套裝或獲得飾品，需挑戰精英與 Boss。

### 小怪 (Common) - 掉落率 10%

| 區域 | 怪物 (Common) | 主要掉落 (Primary) | 次要掉落 (Secondary) | 收集目標 |
| :--- | :--- | :--- | :--- | :--- |
| **萬獸林** | 萬獸林斑豹 | `spirit_iron_sword` (紋鐵劍) | `light_boots` (輕靈靴) | 劍修武/速 |
| | 林間影殺蜂 | `sword_tassel` (劍穗) | `whetstone_ring` (礪劍戒) | 劍修副/戒 |
| | 萬獸林狂牛 | `bear_paw_gauntlet` (熊力拳套) | `heavy_iron_shield` (玄鐵盾) | 體修武/副 |
| | 林中樹妖 | `boar_skin_armor` (蠻皮甲) | `vitality_beads` (氣血珠) | 體修衣/飾 |
| **猿鳴雪峰** | 雪線冰蝶 | `spirit_wood_staff` (靈木杖) | `cloud_step_shoes` (踏雲履) | 法修武/速 |
| | 古道殘兵 | `taoist_vestment` (八卦法衣) | `elemental_ring` (五行戒) | 法修衣/戒 |
| **北天門關** | 北關戍衛傀儡 | `wolf_skull_helm` (狼首盔) | `battle_boots` (戰靴) | 頭/鞋 (重) |
| | 關外暴猿 | `heavy_iron_shield` (玄鐵盾) | `boar_skin_armor` (蠻皮甲) | 副/衣 (重) |
| **蘆葦腐澤** | 腐澤巨蟒 | `spirit_wood_staff` (靈木杖) | `azure_robe` (青雲衫) | 法修武/衣 |
| | 沼澤泥妖 | `bear_paw_gauntlet` (熊力拳套) | `wolf_skull_helm` (狼首盔) | 體修武/頭 |
| **陰風谷** | 陰風谷小鬼 | `spirit_orb` (聚靈珠) | `mystic_crown` (道冠) | 法修副/頭 |
| | 谷口怨念 | `taoist_vestment` (八卦法衣) | `elemental_ring` (五行戒) | 法修衣/戒 |
| **寒潭** | 寒潭鐵甲龜 | `heavy_iron_shield` (玄鐵盾) | `boar_skin_armor` (蠻皮甲) | 體修副/衣 |
| | 潭底水猴 | `spirit_iron_sword` (紋鐵劍) | `light_boots` (輕靈靴) | 劍修武/速 |
| **東郊廢墟** | 廢墟渡鴉 | `focus_headband` (凝神帶) | `whetstone_ring` (礪劍戒) | 劍修頭/戒 |
| | 殘破甲冑 | `bear_paw_gauntlet` (熊力拳套) | `battle_boots` (戰靴) | 體修武/鞋 |
| **雷暴荒原** | 雷暴閃靈 | `cloud_step_shoes` (踏雲履) | `sword_tassel` (劍穗) | 法修鞋/副 |
| | 荒原烈馬 | `azure_robe` (青雲衫) | `focus_headband` (凝神帶) | 劍修衣/頭 |
| **寂滅雷澤** | 雷澤蟹將 | `bear_paw_gauntlet` (熊力拳套) | `wolf_skull_helm` (狼首盔) | 體修武/頭 |
| | 電光游魚 | `spirit_wood_staff` (靈木杖) | `cloud_step_shoes` (踏雲履) | 法修武/速 |
| **迷影叢林** | 迷影猴妖 | `spirit_orb` (聚靈珠) | `mystic_crown` (道冠) | 法修副/頭 |
| | 叢林食人花 | `boar_skin_armor` (蠻皮甲) | `vitality_beads` (氣血珠) | 體修衣/飾 |
| **萬獸林外** | 林外嗜血狼 | `spirit_iron_sword` (紋鐵劍) | `light_boots` (輕靈靴) | 劍修武/速 |
| | 巡山鬣狗 | `wolf_skull_helm` (狼首盔) | `battle_boots` (戰靴) | 體修頭/鞋 |

> **分佈原則**: 每一件練氣期裝備都至少有 **2~3 種** 普通怪物掉落，確保玩家在不同區域探索時都有收穫。

### 精英 (Elite) - 掉落率 35%
*   **所有練氣期精英** (如狂牛首領、碧眼魔虎) 皆有機會掉落 **所有練氣期裝備** 中的任意 1~3 件。
*   包含稀有飾品與各套裝核心部位。

### Boss - 掉落率 100%
*   **區域領主** (如裂風狼王、寒潭蛟龍) 必定掉落 **所有練氣期裝備** 中的任意 3~4 件。
*   這是獲取「上品」與「仙品」裝備的最佳途徑。

---

## 6. 系統實作要求 (Implementation Requirements)

1.  **實例化背包 (Inventory Instancing)**: 背包需支援存儲具有唯一 ID (`uuid`) 的物品實例，而非僅存儲數量。
2.  **動態屬性生成 (Dynamic Stats)**: 獲得物品時，需即時運算品質與隨機詞條，並寫入實例數據中。
3.  **裝備比較**: 提示介面需能顯示從「背包物品」替換「身上裝備」的數值變化差異。
